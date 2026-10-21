#!/usr/bin/env bash
# Prueba LOCAL de la lógica de las comprobaciones de .github/workflows/android.yml (filtro de permisos y comparación de firmas),
# sin Android SDK y sin llaves reales: crea una llave descartable en un directorio temporal. Uso: bash scripts/qa/probar-logica-workflow.sh
set -euo pipefail
RAIZ=$(cd "$(dirname "$0")/../.." && pwd)
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
cd "$T"
fallos=0
ok() { echo "OK   $1"; }
mal() { echo "MAL  $1"; fallos=$((fallos+1)); }

# 1) permisos: se acepta INTERNET + el permiso interno de AndroidX; cualquier otro debe detectarse
printf "package: x\nuses-permission: name='android.permission.INTERNET'\nuses-permission: name='x.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION'\n" > bien.txt
printf "uses-permission: name='android.permission.INTERNET'\nuses-permission: name='android.permission.CAMERA'\n" > mal.txt
filtro() { grep -E "^uses-permission" "$1" | sed -E "s/.*name='([^']+)'.*/\1/" | grep -v "\.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION$" | sort -u; }
[ "$(filtro bien.txt)" = "android.permission.INTERNET" ] && ok "solo INTERNET (más el permiso interno de AndroidX) pasa" || mal "el filtro de permisos rechaza un manifest correcto"
[ "$(filtro mal.txt)" != "android.permission.INTERNET" ] && ok "un permiso extra (CAMERA) se detecta" || mal "no se detectó un permiso extra"

# 2) firmas: un .aab firmado con una llave descartable es distinto de la de pruebas; uno firmado con la de pruebas se detecta
huella_prueba() { keytool -list -keystore "$RAIZ/android/app/matijuego-test.keystore" -storepass matijuego 2>/dev/null | grep -i "SHA-\?256" | head -1 | sed -E 's/^[^:]*: *//'; }
huella_aab() { keytool -printcert -jarfile "$1" 2>/dev/null | grep "SHA256:" | head -1 | sed 's/.*SHA256: *//'; }
echo hola > a.txt
zip -q descartable.aab a.txt; zip -q pruebas.aab a.txt
keytool -genkeypair -keystore d.jks -storepass descartable1 -keypass descartable1 -alias d -dname "CN=Descartable" -keyalg RSA -keysize 2048 -validity 2 >/dev/null 2>&1
jarsigner -keystore d.jks -storepass descartable1 descartable.aab d >/dev/null 2>&1
jarsigner -keystore "$RAIZ/android/app/matijuego-test.keystore" -storepass matijuego pruebas.aab matijuego >/dev/null 2>&1
P=$(huella_prueba); [ -n "$P" ] && ok "se lee la huella de la llave de pruebas" || mal "no se pudo leer la huella de la llave de pruebas"
[ "$(huella_aab descartable.aab)" != "$P" ] && ok "un .aab con otra llave se reconoce como distinto" || mal "no distingue la llave"
[ "$(huella_aab pruebas.aab)" = "$P" ] && ok "un .aab firmado con la llave pública de pruebas se detecta" || mal "no detecta la llave de pruebas"
[ "$fallos" -eq 0 ] && echo "TODO OK" || { echo "$fallos fallos"; exit 1; }
