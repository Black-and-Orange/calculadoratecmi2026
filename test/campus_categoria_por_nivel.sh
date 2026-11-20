#!/bin/bash
# Prueba: editar la categoría de un campus en un nivel NO afecta a otro nivel.
API="http://localhost:3008/api"
TOKEN=$(curl -s -X POST "$API/auth/login" -H 'Content-Type: application/json' \
  -d '{"user":"admin","password":"admin123"}' | python3 -c "import sys,json;print(json.load(sys.stdin).get('token',''))")
[ -z "$TOKEN" ] && { echo "ERROR: sin token"; exit 1; }
cat_de() { curl -s "$API/campus/nivel/$1" | python3 -c "import sys,json;print(next((r['categoria_coleg'] for r in json.load(sys.stdin) if r['nombre']=='Chihuahua'),'NA'))"; }
echo "ANTES   -> nivel1 Chihuahua=$(cat_de 1)  | nivel6 Chihuahua=$(cat_de 6)"
echo "PATCH   -> categoria 'ZZ' SOLO en nivel 1 (campus 12)"
curl -s -X PATCH "$API/campus/12" -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" \
  -d '{"categoria_coleg":"ZZ","nivel_id":1}' -w " [http=%{http_code}]\n"
echo "DESPUÉS -> nivel1 Chihuahua=$(cat_de 1)  | nivel6 Chihuahua=$(cat_de 6)"
