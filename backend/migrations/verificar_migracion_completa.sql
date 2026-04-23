-- =====================================================
-- VERIFICACIÓN COMPLETA DE MIGRACIÓN
-- =====================================================

-- 1. Verificar que los nuevos seguros tienen datos migrados
SELECT 
    'Nuevos seguros con datos' as tipo,
    s.id_seguro,
    s.nombre_seguro,
    COUNT(sn.id_nivel) as total_niveles,
    COUNT(CASE WHEN sn.valor > 0 THEN 1 END) as niveles_con_valor
FROM seguro s
LEFT JOIN seguro_nivel sn ON s.id_seguro = sn.id_seguro
WHERE s.nombre_seguro IS NOT NULL
GROUP BY s.id_seguro, s.nombre_seguro;

-- 2. Verificar seguros antiguos y sus valores
SELECT 
    'Seguros antiguos' as tipo,
    s.id_seguro,
    s.nombre_seguro,
    s.seguro_accidentes,
    s.seguro_estudiantil,
    s.cobertura_vive,
    COUNT(sn.id_nivel) as relaciones_en_seguro_nivel
FROM seguro s
LEFT JOIN seguro_nivel sn ON s.id_seguro = sn.id_seguro
WHERE s.nombre_seguro IS NULL
GROUP BY s.id_seguro, s.nombre_seguro, s.seguro_accidentes, s.seguro_estudiantil, s.cobertura_vive;

-- 3. Comparar: ¿Los valores de los seguros antiguos están en los nuevos?
-- Verificar si los valores de seguro_accidentes de los antiguos están en los nuevos
SELECT 
    'Comparación Accidentes' as tipo,
    s_antiguo.id_seguro as id_antiguo,
    s_antiguo.seguro_accidentes as valor_antiguo,
    s_nuevo.id_seguro as id_nuevo,
    s_nuevo.nombre_seguro,
    sn_nuevo.valor as valor_nuevo,
    sn_nuevo.id_nivel
FROM seguro s_antiguo
JOIN seguro_nivel sn_antiguo ON s_antiguo.id_seguro = sn_antiguo.id_seguro
LEFT JOIN seguro s_nuevo ON s_nuevo.nombre_seguro = 'Seguro de Accidentes'
LEFT JOIN seguro_nivel sn_nuevo ON sn_nuevo.id_seguro = s_nuevo.id_seguro 
    AND sn_nuevo.id_nivel = sn_antiguo.id_nivel
WHERE s_antiguo.nombre_seguro IS NULL
    AND s_antiguo.seguro_accidentes IS NOT NULL
    AND s_antiguo.seguro_accidentes > 0
LIMIT 10;

-- 4. Verificar si hay valores en seguros antiguos que NO están en los nuevos
SELECT 
    'Valores NO migrados - Accidentes' as tipo,
    sn_antiguo.id_nivel,
    s_antiguo.seguro_accidentes as valor_antiguo,
    sn_nuevo.valor as valor_nuevo
FROM seguro s_antiguo
JOIN seguro_nivel sn_antiguo ON s_antiguo.id_seguro = sn_antiguo.id_seguro
LEFT JOIN seguro s_nuevo ON s_nuevo.nombre_seguro = 'Seguro de Accidentes'
LEFT JOIN seguro_nivel sn_nuevo ON sn_nuevo.id_seguro = s_nuevo.id_seguro 
    AND sn_nuevo.id_nivel = sn_antiguo.id_nivel
WHERE s_antiguo.nombre_seguro IS NULL
    AND s_antiguo.seguro_accidentes IS NOT NULL
    AND s_antiguo.seguro_accidentes > 0
    AND (sn_nuevo.valor IS NULL OR sn_nuevo.valor != s_antiguo.seguro_accidentes);

-- 5. Resumen: ¿Cuántos datos faltan por migrar?
SELECT 
    'Resumen migración' as tipo,
    COUNT(DISTINCT s_antiguo.id_seguro) as seguros_antiguos_con_datos,
    COUNT(DISTINCT CASE WHEN sn_nuevo.id_seguro IS NOT NULL THEN sn_antiguo.id_nivel END) as niveles_migrados,
    COUNT(DISTINCT sn_antiguo.id_nivel) as niveles_totales_antiguos
FROM seguro s_antiguo
JOIN seguro_nivel sn_antiguo ON s_antiguo.id_seguro = sn_antiguo.id_seguro
LEFT JOIN seguro s_nuevo ON s_nuevo.nombre_seguro IN ('Seguro de Accidentes', 'Cobertura Estudiantil', 'Cobertura VIVE')
LEFT JOIN seguro_nivel sn_nuevo ON sn_nuevo.id_seguro = s_nuevo.id_seguro 
    AND sn_nuevo.id_nivel = sn_antiguo.id_nivel
WHERE s_antiguo.nombre_seguro IS NULL;
