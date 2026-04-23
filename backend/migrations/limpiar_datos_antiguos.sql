-- =====================================================
-- LIMPIEZA FINAL: Eliminar datos antiguos
-- IMPORTANTE: Solo ejecutar después de verificar que:
-- 1. Los datos se migraron correctamente (✅ Verificado)
-- 2. El sistema funciona con la nueva estructura
-- 3. Se hizo backup de la base de datos
-- =====================================================

-- PASO 1: Eliminar relaciones antiguas en seguro_nivel
-- Estas son las relaciones que apuntan a seguros antiguos (sin nombre_seguro)
DELETE FROM seguro_nivel 
WHERE id_seguro IN (
    SELECT id_seguro FROM seguro WHERE nombre_seguro IS NULL
);

-- PASO 2: Eliminar seguros antiguos
-- Estos son los seguros que no tienen nombre_seguro (id_seguro 5-31)
DELETE FROM seguro 
WHERE nombre_seguro IS NULL;

-- PASO 3: Verificar que la limpieza fue exitosa
-- Debería mostrar 0 filas
SELECT COUNT(*) as seguros_antiguos_restantes
FROM seguro 
WHERE nombre_seguro IS NULL;

-- Debería mostrar 0 filas
SELECT COUNT(*) as relaciones_antiguas_restantes
FROM seguro_nivel sn
JOIN seguro s ON sn.id_seguro = s.id_seguro
WHERE s.nombre_seguro IS NULL;

-- =====================================================
-- PASO 4: Eliminar columnas antiguas (OPCIONAL - Ejecutar solo si todo funciona)
-- =====================================================
-- IMPORTANTE: Ejecutar estos comandos SOLO después de:
-- 1. Probar completamente el sistema (admin y frontend)
-- 2. Verificar que no hay errores
-- 3. Confirmar que no necesitas las columnas antiguas

-- ALTER TABLE seguro DROP COLUMN seguro_accidentes;
-- ALTER TABLE seguro DROP COLUMN seguro_estudiantil;
-- ALTER TABLE seguro DROP COLUMN cobertura_vive;

-- =====================================================
-- PASO 5: Hacer nombre_seguro NOT NULL (OPCIONAL)
-- =====================================================
-- ALTER TABLE seguro MODIFY COLUMN nombre_seguro VARCHAR(255) NOT NULL;

-- =====================================================
-- NOTAS:
-- 1. Los DELETE eliminan permanentemente los datos antiguos
-- 2. Si algo falla después, necesitarás restaurar desde backup
-- 3. Las columnas antiguas se pueden eliminar después si todo funciona bien
-- =====================================================
