#!/bin/bash
# =============================================================================
# Batería de validación Camino B (campus editable/eliminable/agregable por nivel)
# Sirve para: local, clon de prod (ensayo), y verificación post-pase en prod.
#
# Parametrizable por variables de entorno (valores por defecto = LOCAL):
#   API_BASE   (def http://localhost:3008/api)
#   DB_HOST    (def 127.0.0.1)   DB_USER (def root)   DB_PASS (def vacío)
#   DB_NAME    (def database_calculadora_prueba)
#   MODE       full | readonly   (def full)
#              - full     : corre TODO, incluido CRUD (MODIFICA datos, auto-revierte).
#              - readonly : omite el CRUD. USAR ESTE CONTRA PROD.
#   ADMIN_USER/ADMIN_PASS (def admin/admin123) — solo para el CRUD (modo full).
#   SHEETS_DIR (def /tmp/sheets_all) — si existe, valida campus vs sheets.
#
# Ejemplos:
#   # local / clon (todo):
#   bash test/suite_validacion_caminoB.sh
#   # PROD (solo lectura, no toca nada):
#   API_BASE=https://api-tecmi.blnolabs.dev/api DB_HOST=<ec2> DB_USER=<u> DB_PASS=<p> MODE=readonly \
#     bash test/suite_validacion_caminoB.sh
# =============================================================================
set -o pipefail
API_BASE="${API_BASE:-http://localhost:3008/api}"
DB_HOST="${DB_HOST:-127.0.0.1}"; DB_USER="${DB_USER:-root}"; DB_NAME="${DB_NAME:-database_calculadora_prueba}"
MODE="${MODE:-full}"; ADMIN_USER="${ADMIN_USER:-admin}"; ADMIN_PASS="${ADMIN_PASS:-admin123}"
SHEETS_DIR="${SHEETS_DIR:-/tmp/sheets_all}"
PWARG=(); [ -n "$DB_PASS" ] && PWARG=(-p"$DB_PASS")

DBq() { mysql -h "$DB_HOST" -u "$DB_USER" "${PWARG[@]}" -N "$DB_NAME" -e "$1" 2>/dev/null; }
PASS=0; FAIL=0
ok() { if [ "$2" = "$3" ]; then echo "  ✅ $1 ($3)"; PASS=$((PASS+1)); else echo "  ❌ $1  esperado='$2' obtenido='$3'"; FAIL=$((FAIL+1)); fi; }
cat_de() { curl -s "$API_BASE/campus/nivel/$2" | python3 -c "import sys,json;print(next((r['categoria_coleg'] for r in json.load(sys.stdin) if r['nombre']=='$1'),'NO'))"; }

echo "### Validación Camino B  | API=$API_BASE  DB=$DB_HOST/$DB_NAME  MODE=$MODE"

echo "== A. INTEGRIDAD =="
ok "campus sin nombres duplicados"  "0" "$(DBq "SELECT COUNT(*)-COUNT(DISTINCT nombre) FROM campus")"
ok "0 ligas huerfanas campus_nivel" "0" "$(DBq "SELECT COUNT(*) FROM campus_nivel cn LEFT JOIN campus c ON c.id=cn.campus_id WHERE c.id IS NULL")"
ok "0 ligas sin categoria"          "0" "$(DBq "SELECT COUNT(*) FROM campus_nivel WHERE categoria_coleg IS NULL")"
ok "0 excepciones VIVE huerfanas"   "0" "$(DBq "SELECT COUNT(*) FROM seguro_nivel_campus snc LEFT JOIN campus c ON c.id=snc.id_campus WHERE c.id IS NULL")"
ok "columna categoria_coleg en campus_nivel" "1" "$(DBq "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='$DB_NAME' AND table_name='campus_nivel' AND column_name='categoria_coleg'")"

echo "== B. REGRESION (lecturas de la app) =="
ok "cascada /api/nivel responde"    "200" "$(curl -s -o /dev/null -w '%{http_code}' "$API_BASE/nivel")"
# Aguascalientes: id dinámico (la canónica puede diferir entre entornos)
AGS=$(DBq "SELECT MIN(id) FROM campus WHERE nombre='Aguascalientes'")
if [ -n "$AGS" ]; then
  ok "VIVE Aguascalientes nivel1=2600" "2600.00" "$(curl -s "$API_BASE/seguros/nivel/1?campus=$AGS" | python3 -c "import sys,json;print(next((r['valor'] for r in json.load(sys.stdin) if 'VIVE' in r.get('nombre_seguro','')),'NO'))")"
  AGSCAT=$(cat_de Aguascalientes 1)
  ok "existe costo para la cat. de Aguascalientes(n1)" "1" "$(DBq "SELECT COUNT(*)>0 FROM costo_materia cm JOIN costo_materia_nivel cmn ON cmn.id_costo=cm.id_costo WHERE cmn.id_nivel=1 AND cm.clave LIKE '%$AGSCAT'")"
fi
ok "seguros nivel 1 (>0)" "1" "$(curl -s "$API_BASE/seguros/nivel/1" | python3 -c "import sys,json;print(1 if len(json.load(sys.stdin))>0 else 0)")"
ok "bimestral nivel13 Octubre=OCT2027" "OCT2027" "$(curl -s "$API_BASE/pagos-bimestrales/13" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('codigo','') if isinstance(d,dict) else (d[0].get('codigo','') if d else ''))")"

if [ "$MODE" = "full" ]; then
echo "== C. CRUD CAMPUS POR NIVEL (modo full; MODIFICA y auto-revierte) =="
TOKEN=$(curl -s -X POST "$API_BASE/auth/login" -H 'Content-Type: application/json' -d "{\"user\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" | python3 -c "import sys,json;print(json.load(sys.stdin).get('token',''))")
if [ -z "$TOKEN" ]; then echo "  ⚠ sin token admin -> se omite CRUD"; else
  # Elegir dinámicamente un campus compartido con >=2 categorías distintas entre niveles
  SID=$(DBq "SELECT campus_id FROM campus_nivel GROUP BY campus_id ORDER BY COUNT(DISTINCT categoria_coleg) DESC, COUNT(*) DESC LIMIT 1")
  SNAME=$(DBq "SELECT nombre FROM campus WHERE id=$SID")
  NA=$(DBq "SELECT nivel_id FROM campus_nivel WHERE campus_id=$SID ORDER BY nivel_id LIMIT 1")
  CA=$(DBq "SELECT categoria_coleg FROM campus_nivel WHERE campus_id=$SID AND nivel_id=$NA")
  NB=$(DBq "SELECT nivel_id FROM campus_nivel WHERE campus_id=$SID AND categoria_coleg<>'$CA' ORDER BY nivel_id LIMIT 1")
  CB=$(DBq "SELECT categoria_coleg FROM campus_nivel WHERE campus_id=$SID AND nivel_id=$NB")
  echo "  (campus de prueba: '$SNAME' id=$SID | nivel $NA=$CA  nivel $NB=$CB)"
  catN() { DBq "SELECT categoria_coleg FROM campus_nivel WHERE campus_id=$SID AND nivel_id=$1"; }
  # C1 editar aislado
  curl -s -X PATCH "$API_BASE/campus/$SID" -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" -d "{\"categoria_coleg\":\"ZZ\",\"nivel_id\":$NA}" >/dev/null
  ok "editar nivel $NA -> ZZ"            "ZZ" "$(catN $NA)"
  ok "editar NO afecta nivel $NB"        "$CB" "$(catN $NB)"
  curl -s -X PATCH "$API_BASE/campus/$SID" -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" -d "{\"categoria_coleg\":\"$CA\",\"nivel_id\":$NA}" >/dev/null
  ok "revertido nivel $NA -> $CA"        "$CA" "$(catN $NA)"
  # C2 eliminar por nivel
  curl -s -X DELETE "$API_BASE/campus/$SID?nivel_id=$NA" -H "Authorization: Bearer $TOKEN" >/dev/null
  ok "eliminado de nivel $NA"            "" "$(catN $NA)"
  ok "sigue en nivel $NB"                "$CB" "$(catN $NB)"
  ok "fila $SNAME NO se borro"           "1" "$(DBq "SELECT COUNT(*) FROM campus WHERE id=$SID")"
  # C3 re-agregar reusa
  curl -s -X POST "$API_BASE/campus" -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" -d "{\"nombre\":\"$SNAME\",\"categoria_coleg\":\"$CA\",\"nivel_id\":$NA}" >/dev/null
  ok "re-agregado a nivel $NA = $CA"     "$CA" "$(catN $NA)"
  ok "NO se duplico '$SNAME'"            "1" "$(DBq "SELECT COUNT(*) FROM campus WHERE nombre='$SNAME'")"
  # C4 alta nombre nuevo + borrado total
  NID=$(curl -s -X POST "$API_BASE/campus" -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" -d "{\"nombre\":\"ZZTEST_SUITE\",\"categoria_coleg\":\"X\",\"nivel_id\":$NA}" | python3 -c "import sys,json;print(json.load(sys.stdin).get('campus_id',''))")
  ok "alta nombre nuevo crea fila"       "1" "$(DBq "SELECT COUNT(*) FROM campus WHERE nombre='ZZTEST_SUITE'")"
  curl -s -X DELETE "$API_BASE/campus/$NID?nivel_id=$NA" -H "Authorization: Bearer $TOKEN" >/dev/null
  ok "borrado de unico nivel elimina fila" "0" "$(DBq "SELECT COUNT(*) FROM campus WHERE nombre='ZZTEST_SUITE'")"
fi
else
echo "== C. CRUD omitido (MODE=readonly) =="
fi

# D. Campus vs sheets (si están disponibles)
if [ -d "$SHEETS_DIR" ] && ls "$SHEETS_DIR"/s*.xlsx >/dev/null 2>&1; then
echo "== D. CAMPUS vs SHEETS =="
DIFF=$(SHEETS_DIR="$SHEETS_DIR" DB_HOST="$DB_HOST" DB_USER="$DB_USER" DB_PASS="$DB_PASS" DB_NAME="$DB_NAME" python3 -I - <<'PY'
import openpyxl, subprocess, unicodedata, os, glob
MAP={"s1.xlsx":1,"s12.xlsx":2,"s5.xlsx":3,"s2.xlsx":4,"s10.xlsx":6,"s3.xlsx":7,"s8.xlsx":8,"s11.xlsx":9,"s4.xlsx":10,"s14.xlsx":11,"s13.xlsx":13,"s7.xlsx":15,"s6.xlsx":18,"s9.xlsx":19}
D=os.environ["SHEETS_DIR"]; H=os.environ["DB_HOST"]; U=os.environ["DB_USER"]; P=os.environ.get("DB_PASS",""); N=os.environ["DB_NAME"]
def norm(s): return unicodedata.normalize('NFKD',str(s)).encode('ascii','ignore').decode().lower().strip()
def db(n):
    cmd=["mysql","-h",H,"-u",U,"-N",N,"-e",f"SELECT c.nombre, cn.categoria_coleg FROM campus_nivel cn JOIN campus c ON c.id=cn.campus_id WHERE cn.nivel_id={n}"]
    if P: cmd.insert(5,f"-p{P}")
    out=subprocess.run(cmd,capture_output=True,text=True).stdout
    return {norm(p.split(chr(9))[0]):p.split(chr(9))[1] for p in out.splitlines() if chr(9) in p}
tm=tf=ts=0
for fn,niv in MAP.items():
    f=os.path.join(D,fn)
    if not os.path.exists(f): continue
    wb=openpyxl.load_workbook(f,data_only=True,read_only=True); sh={t.strip().upper():t for t in wb.sheetnames}
    sheet={norm(r[0]):(str(r[1]).strip() if len(r)>1 and r[1] else "") for r in wb[sh["CAMPUS"]].iter_rows(values_only=True) if r and r[0] and str(r[0]).strip().upper()!="CAMPUS"}
    d=db(niv)
    tm+=sum(1 for k in sheet if k in d and sheet[k]!=d[k]); tf+=sum(1 for k in sheet if k not in d); ts+=sum(1 for k in d if k not in sheet)
print(f"{tm} {tf} {ts}")
PY
)
read -r DM DFF DS <<< "$DIFF"
ok "categorias campus = sheets (cat≠)" "0" "$DM"
ok "nada falta vs sheets"              "0" "$DFF"
ok "nada sobra vs sheets"              "0" "$DS"
else
echo "== D. Campus vs sheets OMITIDO (no hay $SHEETS_DIR) =="
fi

echo
echo "RESULTADO: $PASS PASS / $FAIL FAIL"
[ "$FAIL" -eq 0 ]
