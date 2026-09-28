-- Configuración GLOBAL del texto de "Condiciones de la propuesta" (hoja de
-- resultados). Es una sola fila, igual para todos los niveles. El texto guarda
-- una condición por línea (\n); el frontend renderiza cada línea como un <p>.
-- Editable desde el admin (Configuración de Vigencia → Condiciones de la propuesta).

CREATE TABLE IF NOT EXISTS configuracion_condiciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    condiciones TEXT NOT NULL
);

-- Semilla con las condiciones que estaban fijas en el HTML (una por línea).
INSERT INTO configuracion_condiciones (condiciones)
SELECT * FROM (SELECT CONCAT_WS('\n',
    '*El simulador de costos de colegiaturas interno es un ejercicio de carácter informativo, sin validez, sujeto a cambios y no representa la formalización de ningún acuerdo con Universidad Tecmilenio.',
    '*Pago Fijo: Pago que corresponde a cubrir adeudo de Préstamo Educativo y que se realiza de manera adicional a la colegiatura. El pago fijo mensual es de $65 por cada 10% de Préstamo Educativo.',
    '*Las fechas límite para el pago de cada mensualidad de colegiatura son el día 15 de cada mes durante el periodo en curso.',
    '*En caso de que sea aplicado un descuento de Apoyo Estudiantil, éste se aplicará en el primer periodo de estudios, a partir del segundo periodo dejará de aplicarse.',
    '*Para evitar el cargo automático del seguro de accidentes de Tecmilenio, se deberá entregar la póliza vigente del seguro contratado externamente antes del inicio de clases. Para validar esta información, se enviará un correo con los detalles.',
    '*El importe de las colegiaturas consignado en este documento podrá incrementarse con base en la inflación anual.',
    '*El seguro de accidentes Tecmilenio y la cobertura estudiantil entra en vigor a partir del primer día de clases.',
    '*La cuota del seguro de accidentes Tecmilenio está sujeta a cambio por tarifas establecidas por la aseguradora.',
    '*En caso de baja de materias se aplicará política de devolución de colegiaturas.'
) AS c) AS seed
WHERE NOT EXISTS (SELECT 1 FROM configuracion_condiciones);
