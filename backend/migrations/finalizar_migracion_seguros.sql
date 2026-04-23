-- =====================================================
-- FINALIZACIÓN DE MIGRACIÓN: Seguros Dinámicos
-- Fecha: 2024
-- Descripción: Completar la migración eliminando datos y columnas antiguas
-- IMPORTANTE: Ejecutar solo después de verificar que todo funciona correctamente
-- =====================================================

-- PASO 1: VERIFICACIÓN (Ejecutar primero para verificar)
-- Verificar que los nuevos seguros tienen datos en seguro_nivel
SELECT 
    s.id_seguro,
    s.nombre_seguro,
    COUNT(sn.id_nivel) as niveles_asociados,
    SUM(CASE WHEN sn.estado = 1 THEN 1 ELSE 0 END) as niveles_habilitados
FROM seguro s
LEFT JOIN seguro_nivel sn ON s.id_seguro = sn.id_seguro
WHERE s.nombre_seguro IS NOT NULL
GROUP BY s.id_seguro, s.nombre_seguro;

-- Verificar que hay datos en seguro_nivel para los nuevos seguros
SELECT 
    sn.id_seguro,
    s.nombre_seguro,
    sn.id_nivel,
    sn.valor,
    sn.estado
FROM seguro_nivel sn
JOIN seguro s ON sn.id_seguro = s.id_seguro
WHERE s.nombre_seguro IS NOT NULL
ORDER BY sn.id_seguro, sn.id_nivel;

-- =====================================================
-- PASO 2: LIMPIEZA (Ejecutar solo si la verificación es exitosa)
-- =====================================================

-- 2.1: Eliminar filas antiguas de seguro que no tienen nombre_seguro
-- (Estas son las filas con id_seguro 5-31 que ya no se usan)
-- IMPORTANTE: Verificar primero que no hay relaciones en seguro_nivel que dependan de estas filas
-- que no se hayan migrado correctamente

-- Verificar relaciones antiguas antes de eliminar
SELECT 
    sn.id_seguro,
    s.nombre_seguro,
    COUNT(*) as relaciones
FROM seguro_nivel sn
JOIN seguro s ON sn.id_seguro = s.id_seguro
WHERE s.nombre_seguro IS NULL
GROUP BY sn.id_seguro, s.nombre_seguro;

-- Si la consulta anterior muestra relaciones, significa que hay datos antiguos
-- que no se migraron. En ese caso, NO ejecutar la eliminación todavía.

-- Eliminar relaciones antiguas en seguro_nivel (solo si ya se migraron)
-- DELETE FROM seguro_nivel 
-- WHERE id_seguro IN (
--     SELECT id_seguro FROM seguro WHERE nombre_seguro IS NULL
-- );

-- Eliminar seguros antiguos (solo si ya se migraron todos los datos)
-- DELETE FROM seguro 
-- WHERE nombre_seguro IS NULL;

-- =====================================================
-- PASO 3: ELIMINAR COLUMNAS ANTIGUAS
-- =====================================================
-- IMPORTANTE: Solo ejecutar después de verificar que:
-- 1. Los nuevos seguros funcionan correctamente
-- 2. Todos los datos se migraron
-- 3. El frontend y admin funcionan con la nueva estructura

-- ALTER TABLE seguro DROP COLUMN seguro_accidentes;
-- ALTER TABLE seguro DROP COLUMN seguro_estudiantil;
-- ALTER TABLE seguro DROP COLUMN cobertura_vive;

-- =====================================================
-- PASO 4: HACER nombre_seguro NOT NULL
-- =====================================================
-- ALTER TABLE seguro MODIFY COLUMN nombre_seguro VARCHAR(255) NOT NULL;

-- =====================================================
-- NOTAS FINALES:
-- 1. Hacer backup antes de ejecutar los DELETE y DROP COLUMN
-- 2. Probar el sistema completo (admin y frontend) antes de eliminar columnas
-- 3. Si algo falla, restaurar desde el backup
-- =====================================================
