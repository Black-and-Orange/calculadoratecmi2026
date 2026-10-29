-- =====================================================
-- MIGRACIÓN: Precio de seguro por campus (excepciones)
-- Descripción: Permite asignar un costo distinto de un seguro (p. ej. Cobertura
--              VIVE) para campus específicos, sin alterar el precio por defecto
--              que vive en `seguro_nivel.valor`.
--
-- Resolución al cotizar: si existe fila en `seguro_nivel_campus` para
-- (id_seguro, id_nivel, id_campus) se usa ese `valor`; si no, se usa el default
-- de `seguro_nivel`. (Ver backend/models/seguros.js -> getSegurosByNivel con campus.)
--
-- Es ADITIVA: no modifica ninguna tabla existente. Sin filas aquí, el sistema
-- se comporta exactamente igual que antes.
-- =====================================================

CREATE TABLE IF NOT EXISTS seguro_nivel_campus (
    id_seguro  INT NOT NULL,
    id_nivel   INT NOT NULL,
    id_campus  INT NOT NULL,
    valor      DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id_seguro, id_nivel, id_campus)
);
