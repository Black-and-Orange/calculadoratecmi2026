-- =====================================================
-- MIGRACIÓN: Seguros Dinámicos
-- Fecha: 2024
-- Descripción: Convierte la estructura de seguros fijos (3 columnas)
--              a una estructura dinámica (nombre, valor, estado por nivel)
-- =====================================================

-- Paso 1: Agregar nuevas columnas a seguro_nivel
ALTER TABLE seguro_nivel 
ADD COLUMN valor DECIMAL(10,2) DEFAULT 0,
ADD COLUMN estado BOOLEAN DEFAULT TRUE;

-- Paso 2: Agregar columna nombre_seguro a seguro (temporal, para migración)
ALTER TABLE seguro 
ADD COLUMN nombre_seguro VARCHAR(255);

-- Paso 3: Hacer las columnas antiguas NULL temporalmente para permitir la migración
-- (Solo si no tienen valores por defecto)
ALTER TABLE seguro 
MODIFY COLUMN seguro_accidentes DECIMAL(10,2) NULL,
MODIFY COLUMN seguro_estudiantil DECIMAL(10,2) NULL,
MODIFY COLUMN cobertura_vive DECIMAL(10,2) NULL;

-- Paso 4: Migrar datos existentes
-- Para cada seguro existente, crear 3 seguros nuevos (uno por cada tipo)
-- y migrar los valores a seguro_nivel

-- Crear seguros para "Seguro de Accidentes"
INSERT INTO seguro (nombre_seguro, seguro_accidentes, seguro_estudiantil, cobertura_vive)
SELECT DISTINCT 'Seguro de Accidentes', NULL, NULL, NULL
FROM seguro
WHERE seguro_accidentes IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM seguro s2 
    WHERE s2.nombre_seguro = 'Seguro de Accidentes'
);

-- Crear seguros para "Cobertura Estudiantil"
INSERT INTO seguro (nombre_seguro, seguro_accidentes, seguro_estudiantil, cobertura_vive)
SELECT DISTINCT 'Cobertura Estudiantil', NULL, NULL, NULL
FROM seguro
WHERE seguro_estudiantil IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM seguro s2 
    WHERE s2.nombre_seguro = 'Cobertura Estudiantil'
);

-- Crear seguros para "Cobertura VIVE"
INSERT INTO seguro (nombre_seguro, seguro_accidentes, seguro_estudiantil, cobertura_vive)
SELECT DISTINCT 'Cobertura VIVE', NULL, NULL, NULL
FROM seguro
WHERE cobertura_vive IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM seguro s2 
    WHERE s2.nombre_seguro = 'Cobertura VIVE'
);

-- Obtener IDs de los seguros creados (o crearlos si no existen)
-- Primero asegurarse de que existan los seguros base

-- Verificar y crear Seguro de Accidentes si no existe
INSERT INTO seguro (nombre_seguro, seguro_accidentes, seguro_estudiantil, cobertura_vive)
SELECT 'Seguro de Accidentes', NULL, NULL, NULL
WHERE NOT EXISTS (
    SELECT 1 FROM seguro WHERE nombre_seguro = 'Seguro de Accidentes'
);

-- Verificar y crear Cobertura Estudiantil si no existe
INSERT INTO seguro (nombre_seguro, seguro_accidentes, seguro_estudiantil, cobertura_vive)
SELECT 'Cobertura Estudiantil', NULL, NULL, NULL
WHERE NOT EXISTS (
    SELECT 1 FROM seguro WHERE nombre_seguro = 'Cobertura Estudiantil'
);

-- Verificar y crear Cobertura VIVE si no existe
INSERT INTO seguro (nombre_seguro, seguro_accidentes, seguro_estudiantil, cobertura_vive)
SELECT 'Cobertura VIVE', NULL, NULL, NULL
WHERE NOT EXISTS (
    SELECT 1 FROM seguro WHERE nombre_seguro = 'Cobertura VIVE'
);

-- Ahora obtener los IDs (deben existir después de los INSERT anteriores)
SET @id_accidentes = (SELECT id_seguro FROM seguro WHERE nombre_seguro = 'Seguro de Accidentes' LIMIT 1);
SET @id_estudiantil = (SELECT id_seguro FROM seguro WHERE nombre_seguro = 'Cobertura Estudiantil' LIMIT 1);
SET @id_vive = (SELECT id_seguro FROM seguro WHERE nombre_seguro = 'Cobertura VIVE' LIMIT 1);

-- Migrar relaciones y valores desde seguro_nivel existente
-- Para cada relación seguro_nivel existente, crear 3 nuevas relaciones con los valores correspondientes
-- Solo si los IDs no son NULL

-- Migrar relaciones y valores desde seguro_nivel existente
-- Para cada relación seguro_nivel existente, crear 3 nuevas relaciones con los valores correspondientes
-- Solo ejecutar si los IDs no son NULL

-- Migrar Seguro de Accidentes
INSERT INTO seguro_nivel (id_seguro, id_nivel, valor, estado)
SELECT 
    (SELECT id_seguro FROM seguro WHERE nombre_seguro = 'Seguro de Accidentes' LIMIT 1),
    sn.id_nivel,
    s.seguro_accidentes,
    TRUE
FROM seguro_nivel sn
JOIN seguro s ON sn.id_seguro = s.id_seguro
WHERE s.seguro_accidentes IS NOT NULL
AND (SELECT id_seguro FROM seguro WHERE nombre_seguro = 'Seguro de Accidentes' LIMIT 1) IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM seguro_nivel sn2 
    WHERE sn2.id_seguro = (SELECT id_seguro FROM seguro WHERE nombre_seguro = 'Seguro de Accidentes' LIMIT 1)
    AND sn2.id_nivel = sn.id_nivel
);

-- Migrar Cobertura Estudiantil
INSERT INTO seguro_nivel (id_seguro, id_nivel, valor, estado)
SELECT 
    (SELECT id_seguro FROM seguro WHERE nombre_seguro = 'Cobertura Estudiantil' LIMIT 1),
    sn.id_nivel,
    s.seguro_estudiantil,
    TRUE
FROM seguro_nivel sn
JOIN seguro s ON sn.id_seguro = s.id_seguro
WHERE s.seguro_estudiantil IS NOT NULL
AND (SELECT id_seguro FROM seguro WHERE nombre_seguro = 'Cobertura Estudiantil' LIMIT 1) IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM seguro_nivel sn2 
    WHERE sn2.id_seguro = (SELECT id_seguro FROM seguro WHERE nombre_seguro = 'Cobertura Estudiantil' LIMIT 1)
    AND sn2.id_nivel = sn.id_nivel
);

-- Migrar Cobertura VIVE
INSERT INTO seguro_nivel (id_seguro, id_nivel, valor, estado)
SELECT 
    (SELECT id_seguro FROM seguro WHERE nombre_seguro = 'Cobertura VIVE' LIMIT 1),
    sn.id_nivel,
    s.cobertura_vive,
    TRUE
FROM seguro_nivel sn
JOIN seguro s ON sn.id_seguro = s.id_seguro
WHERE s.cobertura_vive IS NOT NULL
AND (SELECT id_seguro FROM seguro WHERE nombre_seguro = 'Cobertura VIVE' LIMIT 1) IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM seguro_nivel sn2 
    WHERE sn2.id_seguro = (SELECT id_seguro FROM seguro WHERE nombre_seguro = 'Cobertura VIVE' LIMIT 1)
    AND sn2.id_nivel = sn.id_nivel
);

-- Paso 4: Eliminar columnas antiguas de seguro (DESPUÉS DE VERIFICAR QUE TODO FUNCIONA)
-- IMPORTANTE: Ejecutar estos comandos solo después de verificar que la migración funcionó correctamente
-- ALTER TABLE seguro DROP COLUMN seguro_accidentes;
-- ALTER TABLE seguro DROP COLUMN seguro_estudiantil;
-- ALTER TABLE seguro DROP COLUMN cobertura_vive;

-- Paso 5: Hacer nombre_seguro NOT NULL (después de migración)
-- ALTER TABLE seguro MODIFY COLUMN nombre_seguro VARCHAR(255) NOT NULL;

-- =====================================================
-- NOTAS:
-- 1. Esta migración asume que cada seguro existente tiene los 3 valores
-- 2. Si hay seguros con valores NULL, esos se omitirán
-- 3. Verificar los datos antes de eliminar las columnas antiguas
-- 4. Hacer backup de la base de datos antes de ejecutar
-- =====================================================
