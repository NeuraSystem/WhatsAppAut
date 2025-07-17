// excel/processor.js

const xlsx = require('xlsx');
const { pool } = require('../database/pg'); // PostgreSQL connection pool

/**
 * Valida que los datos del Excel tengan las columnas esperadas.
 * @param {Array<Object>} data - Un array de objetos representando las filas del Excel.
 * @throws {Error} Si una columna requerida no se encuentra.
 */
function validateColumns(data) {
    const requiredColumns = [
        'modelo_celular',
        'tipo_reparacion',
        'precio',
        'tiempo_reparacion',
        'disponibilidad'
    ];

    if (!data || data.length === 0) {
        throw new Error('El archivo Excel está vacío o no tiene datos.');
    }

    const firstRow = data[0];
    const columns = Object.keys(firstRow);

    for (const col of requiredColumns) {
        if (!columns.includes(col)) {
            throw new Error(`El archivo Excel no tiene la columna requerida: "${col}".`);
        }
    }
}

/**
 * Inserta los datos de reparaciones en la base de datos.
 * @param {Array<Object>} data - Los datos validados del Excel.
 */
async function insertDataIntoDB(data) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Usamos una sola consulta parametrizada para eficiencia
        const queryText = `
            INSERT INTO reparaciones (modelo_celular, tipo_reparacion, precio, tiempo_reparacion, disponibilidad, notas)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (modelo_celular, tipo_reparacion) DO UPDATE SET
                precio = EXCLUDED.precio,
                tiempo_reparacion = EXCLUDED.tiempo_reparacion,
                disponibilidad = EXCLUDED.disponibilidad,
                notas = EXCLUDED.notas;
        `;

        for (const row of data) {
            const values = [
                row.modelo_celular,
                row.tipo_reparacion,
                row.precio,
                row.tiempo_reparacion,
                row.disponibilidad,
                row.notas || null
            ];
            await client.query(queryText, values);
        }

        await client.query('COMMIT');
        console.log(`Se procesaron ${data.length} registros en la base de datos.`);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error durante la transacción, se revirtieron los cambios.', error);
        throw error; // Re-lanzar el error para que el llamador sepa que algo salió mal
    } finally {
        client.release();
    }
}

/**
 * Lee un archivo Excel, valida su estructura e inserta los datos en la BD.
 * @param {string} filePath - La ruta al archivo .xlsx.
 * @returns {boolean} - True si el proceso fue exitoso, false en caso contrario.
 */
async function processExcelFile(filePath) {
    try {
        console.log(`Procesando archivo: ${filePath}`);

        // Leer el archivo
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convertir a JSON
        const data = xlsx.utils.sheet_to_json(sheet);

        // Validar columnas
        validateColumns(data);

        // Insertar en la base de datos
        await insertDataIntoDB(data);

        console.log('Archivo Excel procesado e importado a la base de datos con éxito.');
        return true;

    } catch (error) {
        console.error(`Error al procesar el archivo Excel: ${error.message}`);
        // Aquí se podría usar un logger más avanzado como Winston
        // logger.error(`Error procesando ${filePath}: ${error.message}`);
        return false;
    }
}

module.exports = {
    processExcelFile,
    validateColumns, // Exportado para pruebas unitarias si es necesario
};
