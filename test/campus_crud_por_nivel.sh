#!/bin/bash
API="http://localhost:3008/api"
TOKEN=$(curl -s -X POST "$API/auth/login" -H 'Content-Type: application/json' -d '{"user":"admin","password":"admin123"}' | python3 -c "import sys,json;print(json.load(sys.stdin).get('token',''))")
chi() { curl -s "$API/campus/nivel/$1" | python3 -c "import sys,json;print(next((r['categoria_coleg'] for r in json.load(sys.stdin) if r['nombre']=='Chihuahua'),'NO'))"; }
rows_chi() { mysql -h 127.0.0.1 -u root -N database_calculadora_prueba -e "SELECT COUNT(*) FROM campus WHERE nombre='Chihuahua';" 2>/dev/null; }
echo "=== ELIMINAR por nivel ==="
echo "ANTES    nivel1=$(chi 1)  nivel6=$(chi 6)  | filas campus 'Chihuahua'=$(rows_chi)"
echo "DELETE   Chihuahua (id 12) SOLO de nivel 1:"
curl -s -X DELETE "$API/campus/12?nivel_id=1" -H "Authorization: Bearer $TOKEN" -w "   -> %{http_code} " ; echo
echo "DESPUÉS  nivel1=$(chi 1)  nivel6=$(chi 6)  | filas campus 'Chihuahua'=$(rows_chi)"
echo
echo "=== AGREGAR reusando la fila (no duplica) ==="
echo "ADD      Chihuahua de vuelta a nivel 1 (categoria A):"
curl -s -X POST "$API/campus" -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" -d '{"nombre":"Chihuahua","categoria_coleg":"A","nivel_id":1}' -w "   -> %{http_code} "; echo
echo "DESPUÉS  nivel1=$(chi 1)  nivel6=$(chi 6)  | filas campus 'Chihuahua'=$(rows_chi)"
