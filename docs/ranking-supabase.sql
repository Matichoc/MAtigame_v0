-- Ranking y monitoreo de Matijuego (Supabase). Se ejecuta UNA vez en: Supabase → SQL Editor → New query → Run.
-- Antes de ejecutar, CAMBIA 'pon-aqui-tu-clave-de-creador' por una clave tuya (la usarás en admin/ranking.html).
--
-- Todo lleva el prefijo mj_ (tablas y funciones) para poder usar un proyecto de Supabase que ya tengas, sin tocar nada de lo existente.
--
-- Seguridad: la tabla no se puede leer ni escribir directamente desde la app (RLS sin políticas). La app solo puede llamar
-- a mj_upsert_player (guardar su propio avance), mj_ranking_enabled y mj_public_ranking (que devuelve vacío mientras tú no lo abras).

create table if not exists public.mj_players (
  id          uuid primary key,
  nick        text not null check (char_length(nick) between 1 and 24),
  first_seen  timestamptz not null default now(),
  last_seen   timestamptz not null default now(),
  platform    text,
  xp          integer not null default 0,
  plays       integer not null default 0,
  play_secs   integer not null default 0,
  coins       integer not null default 0,
  best        jsonb not null default '{}'::jsonb,   -- mejor puntaje por juego: {"tetris": 1200, ...}
  extra       jsonb not null default '{}'::jsonb
);
alter table public.mj_players enable row level security;

create table if not exists public.mj_config (key text primary key, value text not null);
alter table public.mj_config enable row level security;
insert into public.mj_config(key, value) values ('admin_key', 'pon-aqui-tu-clave-de-creador') on conflict (key) do nothing;
insert into public.mj_config(key, value) values ('show_ranking', 'false') on conflict (key) do nothing;

revoke all on public.mj_players from anon, authenticated;
revoke all on public.mj_config from anon, authenticated;

-- La app guarda su propio avance (solo números y el apodo; se recortan valores raros)
create or replace function public.mj_upsert_player(p jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid := (p->>'id')::uuid;
  v_nick text := left(coalesce(nullif(trim(p->>'nick'), ''), 'Jugador'), 24);
  v_best jsonb := '{}'::jsonb;
  k text;
begin
  for k in select jsonb_object_keys(coalesce(p->'best', '{}'::jsonb)) loop
    if k ~ '^[a-z0-9_]{1,24}$' and jsonb_typeof(p->'best'->k) = 'number' then
      v_best := v_best || jsonb_build_object(k, least((p->'best'->>k)::numeric, 100000000));
    end if;
  end loop;
  insert into public.mj_players(id, nick, platform, xp, plays, play_secs, coins, best, extra)
  values (v_id, v_nick, left(coalesce(p->>'platform', ''), 8),
          least(greatest(coalesce((p->>'xp')::int, 0), 0), 100000000), least(greatest(coalesce((p->>'plays')::int, 0), 0), 100000000),
          least(greatest(coalesce((p->>'play_secs')::int, 0), 0), 1000000000), least(greatest(coalesce((p->>'coins')::int, 0), 0), 1000000000),
          v_best, coalesce(p->'extra', '{}'::jsonb))
  on conflict (id) do update set
    nick = excluded.nick, last_seen = now(), platform = excluded.platform, xp = excluded.xp, plays = excluded.plays,
    play_secs = excluded.play_secs, coins = excluded.coins, best = excluded.best, extra = excluded.extra;
end $$;
grant execute on function public.mj_upsert_player(jsonb) to anon;

-- ¿Ya abriste el ranking a los jugadores?
create or replace function public.mj_ranking_enabled() returns boolean
language sql security definer set search_path = public as $$
  select coalesce((select value = 'true' from public.mj_config where key = 'show_ranking'), false);
$$;
grant execute on function public.mj_ranking_enabled() to anon;

-- Ranking público de un juego (vacío mientras show_ranking sea 'false')
create or replace function public.mj_public_ranking(g text, lim int default 20) returns table(nick text, score numeric)
language sql security definer set search_path = public as $$
  select pl.nick, (pl.best->>g)::numeric as score
  from public.mj_players pl
  where public.mj_ranking_enabled() and pl.best ? g
  order by (pl.best->>g)::numeric desc
  limit least(greatest(lim, 1), 50);
$$;
grant execute on function public.mj_public_ranking(text, int) to anon;

-- Solo para ti (admin/ranking.html): ver a todos los jugadores y abrir/cerrar el ranking público
create or replace function public.mj_admin_players(admin_key text) returns setof public.mj_players
language plpgsql security definer set search_path = public as $$
begin
  if admin_key is distinct from (select value from public.mj_config where key = 'admin_key') then raise exception 'clave incorrecta'; end if;
  return query select * from public.mj_players order by last_seen desc limit 2000;
end $$;
grant execute on function public.mj_admin_players(text) to anon;

create or replace function public.mj_admin_set_show(admin_key text, show boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if admin_key is distinct from (select value from public.mj_config where key = 'admin_key') then raise exception 'clave incorrecta'; end if;
  update public.mj_config set value = case when show then 'true' else 'false' end where key = 'show_ranking';
end $$;
grant execute on function public.mj_admin_set_show(text, boolean) to anon;
