# Saca el fondo de un video donde aparece una persona (por ejemplo, la dueña presentando el juego) y deja cada cuadro
# como PNG con transparencia y un borde blanco tipo "sticker" alrededor (así se nota menos si el recorte no es perfecto).
# Usa rembg con el modelo u2net_human_seg (se descarga solo la primera vez, ~170 MB) y corre en el computador, sin internet.
# Uso: python recortar-persona.py <carpeta con c00001.png...> <carpeta de salida> [--uno]
#   (los cuadros se sacan antes con: ffmpeg -i video.mp4 <carpeta>/c%05d.png)
import os, sys
import cv2
import numpy as np
from rembg import new_session, remove

ent, sal = sys.argv[1], sys.argv[2]
UNO = "--uno" in sys.argv
AZUL = "--sin-azul" in sys.argv
BORDE = 7  # px del borde blanco
os.makedirs(sal, exist_ok=True)
ses = new_session("u2net_human_seg")
kern = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * BORDE + 1, 2 * BORDE + 1))
cuadros = sorted(f for f in os.listdir(ent) if f.endswith(".png"))
if UNO:
    cuadros = [f for f in cuadros if f == (os.environ.get("CUADRO") or f)][len(cuadros) // 3 if not os.environ.get("CUADRO") else 0:][:1]
# --parte k/n: hace solo una de n partes (para correr varios procesos a la vez)
for a in sys.argv:
    if a.startswith("--parte="):
        k, n = map(int, a.split("=")[1].split("/"))
        cuadros = cuadros[k - 1::n]
for k, f in enumerate(cuadros):
    if os.path.exists(os.path.join(sal, f)) and not UNO:
        continue
    img = cv2.imread(os.path.join(ent, f))
    mask = remove(cv2.cvtColor(img, cv2.COLOR_BGR2RGB), session=ses, only_mask=True, post_process_mask=True)
    a = np.asarray(mask).copy()
    # rellena los hoyos de adentro de la silueta (el modelo confunde con fondo, por ejemplo, los parches verdes de la chaqueta)
    cont, _ = cv2.findContours((a > 128).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    lleno = np.zeros_like(a)
    cv2.drawContours(lleno, cont, -1, 255, thickness=cv2.FILLED)
    a = np.maximum(a, cv2.erode(lleno, np.ones((3, 3), np.uint8)))
    if AZUL:
        # --sin-azul: el fondo es una cortina azul-violeta (y la ropa no tiene ese color): se borra todo lo que sea de ese tono,
        # y queda solo el pedazo más grande (la persona)
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        # azul intenso de la cortina + sus brillos lila claros (sin tocar el pelo oscuro ni la polera gris, que son poco saturados u oscuros)
        azul = cv2.inRange(hsv, (105, 100, 60), (140, 255, 255)) | cv2.inRange(hsv, (115, 25, 170), (145, 255, 255))
        azul = cv2.morphologyEx(azul, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
        azul = cv2.dilate(azul, np.ones((3, 3), np.uint8))
        a = np.where(azul > 0, 0, a).astype(np.uint8)
        # saca piezas delgadas que quedan pegadas (el gancho de la cortina, el borde de la silla)
        a = cv2.morphologyEx(a, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
        n, et, st, _ = cv2.connectedComponentsWithStats((a > 128).astype(np.uint8))
        if n > 1:
            mayor = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
            a = np.where(et == mayor, a, 0).astype(np.uint8)
    a = cv2.GaussianBlur(a, (5, 5), 0)
    duro = (a > 128).astype(np.uint8) * 255
    gordo = cv2.dilate(duro, kern)
    gordo = cv2.GaussianBlur(gordo, (5, 5), 0)
    # color: la persona encima del borde blanco
    al = (a.astype(np.float32) / 255)[..., None]
    rgb = img.astype(np.float32) * al + 255 * (1 - al)
    rgba = np.dstack([rgb.astype(np.uint8), np.maximum(a, gordo)])
    cv2.imwrite(os.path.join(sal, f), rgba)
    if k % 100 == 0:
        print(f"{k}/{len(cuadros)}", flush=True)
print("listo", len(cuadros))
