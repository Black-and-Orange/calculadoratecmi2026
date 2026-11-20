-- Camino B · Task 1: categoría por nivel en campus_nivel
ALTER TABLE campus_nivel ADD COLUMN categoria_coleg VARCHAR(255) NULL;
UPDATE campus_nivel cn JOIN campus c ON c.id = cn.campus_id
  SET cn.categoria_coleg = c.categoria_coleg;
