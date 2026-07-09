-- Fechas de pago por período (minuta jul-2026):
-- se configuran a nivel PERÍODO (semestral/trimestral/bimestral), no por programa.
-- Cada período guarda su lista ordenada de fechas; al crear un período nuevo el
-- anterior conserva las suyas como consulta (períodos independientes).
--
-- Convención de lectura en la calculadora:
--   pago_orden = 1  → fecha del plan de contado y del primer pago del financiamiento
--   pago_orden > 1  → fechas de las mensualidades posteriores, en orden
--
-- Aditiva: no modifica tablas existentes. FK con ON DELETE CASCADE para que al
-- eliminar un período se limpien sus fechas.

CREATE TABLE IF NOT EXISTS fechas_pago_periodo (
    id_fecha_pago INT NOT NULL AUTO_INCREMENT,
    id_periodo INT NOT NULL,
    pago_orden INT NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    PRIMARY KEY (id_fecha_pago),
    UNIQUE KEY uq_fpp_periodo_orden (id_periodo, pago_orden),
    CONSTRAINT fk_fpp_periodo FOREIGN KEY (id_periodo)
        REFERENCES periodo (id_periodo) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
