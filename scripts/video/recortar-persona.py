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
BORDE = 7  # px del borde blanco
os.makedirs(sal, exist_ok=True)
ses = new_session("u2net_human_seg")
kern = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * BORDE + 1, 2 * BORDE + 1))
cuadros = sorted(f for f in os.listdir(ent) if f.endswith(".png"))
if UNO:
    cuadros = cuadros[len(cuadros) // 3: len(cuadros) // 3 + 1]
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
    a = cv2.GaussianBlur(np.maximum(a, cv2.erode(lleno, np.ones((3, 3), np.uint8))), (5, 5), 0)
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
