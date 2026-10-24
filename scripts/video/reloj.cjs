// Reloj virtual para grabar el juego cuadro a cuadro: el navegador de prueba no tiene tarjeta gráfica y dibuja lento,
// así que en vez de grabar en tiempo real se "congela" el tiempo del juego y se avanza de a 1/30 s por cuadro
// (requestAnimationFrame y performance.now pasan a ser manuales). Así el video sale fluido aunque cada cuadro tarde 1 s.
const RELOJ = () => {
  const realNow = performance.now.bind(performance);
  const realRaf = window.requestAnimationFrame.bind(window);
  let on = false, vt = 0;
  const q = [];
  performance.now = () => (on ? vt : realNow());
  window.requestAnimationFrame = (cb) => { if (on) { q.push(cb); return q.length; } return realRaf(cb); };
  window.__reloj = {
    get on() { return on; },
    encender() { if (!on) { vt = realNow(); on = true; } },
    apagar() { on = false; for (const cb of q.splice(0)) realRaf(cb); },
    /** Avanza el juego `n` pasos de `ms` milisegundos. */
    avanzar(ms = 1000 / 30, n = 1) {
      for (let i = 0; i < n; i++) {
        vt += ms;
        for (const cb of q.splice(0)) { try { cb(vt); } catch (e) { console.error(e); } }
      }
    },
  };
};
module.exports = { RELOJ };
