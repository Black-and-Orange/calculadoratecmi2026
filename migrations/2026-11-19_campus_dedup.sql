-- Camino B · Task 2: de-dup de campus a una fila canónica por nombre
SET FOREIGN_KEY_CHECKS=0;
START TRANSACTION;
CREATE TEMPORARY TABLE canon AS SELECT nombre, MIN(id) AS canon_id FROM campus GROUP BY nombre;
-- repointar ligas a la canónica (la categoría ya vive en campus_nivel, no se pierde)
UPDATE campus_nivel cn JOIN campus c ON c.id=cn.campus_id JOIN canon k ON k.nombre=c.nombre
  SET cn.campus_id = k.canon_id;
-- repointar excepciones VIVE por campus
UPDATE seguro_nivel_campus snc JOIN campus c ON c.id=snc.id_campus JOIN canon k ON k.nombre=c.nombre
  SET snc.id_campus = k.canon_id;
-- colapsar ligas duplicadas (campus_id,nivel_id): conservar la de id menor
DELETE cn1 FROM campus_nivel cn1 JOIN campus_nivel cn2
  ON cn1.campus_id=cn2.campus_id AND cn1.nivel_id=cn2.nivel_id AND cn1.id > cn2.id;
-- borrar filas de campus ya no canónicas
DELETE c FROM campus c LEFT JOIN canon k ON k.canon_id=c.id WHERE k.canon_id IS NULL;
COMMIT;
SET FOREIGN_KEY_CHECKS=1;
