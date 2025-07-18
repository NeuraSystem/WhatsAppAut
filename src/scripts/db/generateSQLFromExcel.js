// src/scripts/generateSQLFromExcel.js - Generar SQL desde Excel sin DB

require('dotenv').config();
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

/**
 * Genera comandos SQL desde archivos Excel
 */
class SQLGenerator {
    constructor() {
        this.dataPath = path.join(__dirname, '../../data');
        this.sqlStatements = [];
        this.processedCount = 0;
    }

    /**
   * Procesa archivos Excel y genera SQL
   */
    async processTestFiles() {
        console.log('📊 Generando SQL desde archivos Excel...\n');

        const testFiles = [
            'Samsung.xlsx',
            'Iphone.xlsx',
            'Xiaomi.xlsx',
            'Motorola.xlsx'
        ];

        for (const fileName of testFiles) {
            await this.processExcelFile(fileName);
        }

        this.generateSQLFile();
    }

    /**
   * Procesa un archivo Excel específico
   */
    async processExcelFile(fileName) {
        const filePath = path.join(this.dataPath, fileName);
        const brand = fileName.replace('.xlsx', '').toLowerCase();

        try {
            console.log(`🔍 Procesando: ${fileName}`);

            // Leer archivo Excel
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convertir a JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                defval: ''
            });

            console.log(`   📋 ${jsonData.length} filas encontradas`);

            // Procesar datos
            const processedData = this.parseSheetData(jsonData, brand);

            // Generar SQL
            for (const item of processedData) {
                this.generateInsertSQL(item);
            }

            console.log(`   ✅ ${processedData.length} registros procesados\n`);
        } catch (error) {
            console.error(`   ❌ Error procesando ${fileName}:`, error.message);
        }
    }

    /**
   * Analiza y parsea los datos del Excel
   */
    parseSheetData(rows, brand) {
        if (rows.length < 1) return [];

        console.log(
            `   📋 Formato detectado: [Modelo, Precio, Calidad] sin headers`
        );

        // Procesar todas las filas (no hay headers)
        const processed = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;

            const item = this.parseDataRowDirect(row, brand);
            if (item) {
                processed.push(item);
            }
        }

        return processed;
    }

    /**
   * Detecta headers
   */
    looksLikeHeader(row) {
        if (!row || row.length === 0) return false;

        const firstCell = String(row[0]).toLowerCase();
        return (
            firstCell.includes('modelo') ||
      firstCell.includes('device') ||
      firstCell.includes('precio') ||
      firstCell.includes('phone')
        );
    }

    /**
   * Detecta columnas
   */
    detectColumns(headers) {
        const map = { modelo: -1, precio: -1, notas: -1 };

        headers.forEach((header, index) => {
            const h = String(header).toLowerCase();

            if (h.includes('modelo') || h.includes('device') || h.includes('phone')) {
                map.modelo = index;
            } else if (
                h.includes('precio') ||
        h.includes('price') ||
        h.includes('costo')
            ) {
                map.precio = index;
            } else if (
                h.includes('nota') ||
        h.includes('note') ||
        h.includes('observ')
            ) {
                map.notas = index;
            }
        });

        // Fallback: asumir orden básico
        if (map.modelo === -1 && headers.length >= 2) {
            map.modelo = 0;
            map.precio = 1;
            if (headers.length >= 3) map.notas = 2;
        }

        return map;
    }

    /**
   * Parsea fila de datos directamente (formato: Modelo, Precio, Calidad)
   */
    parseDataRowDirect(row, brand) {
        const modelo = String(row[0] || '').trim();
        const precioRaw = row[1];
        const calidad = String(row[2] || '').trim();

        // Filtrar filas vacías
        if (!modelo || modelo.length < 2) return null;

        // Parsear precio
        let precio = 0;
        if (precioRaw) {
            const precioStr = String(precioRaw).replace(/[^\d.]/g, '');
            precio = parseFloat(precioStr) || 0;
        }

        if (precio < 100) return null; // Filtrar precios muy bajos

        // Crear descripción basada en calidad
        let descripcion = `Cambio de pantalla ${brand} con mano de obra incluida`;
        if (calidad) {
            if (calidad.toLowerCase().includes('original')) {
                descripcion += ' - Pantalla Original';
            } else if (calidad.toLowerCase().includes('generica')) {
                descripcion += ' - Pantalla Genérica';
            } else if (calidad.toLowerCase().includes('cal/orig')) {
                descripcion += ' - Pantalla Calidad Original';
            }
        }

        return {
            modelo_celular: this.normalizeModel(modelo, brand),
            tipo_reparacion: 'pantalla',
            precio: precio,
            tiempo_reparacion: 'listo en 30-45 minutos',
            disponibilidad: 'disponible',
            notas: descripcion
        };
    }

    /**
   * Parsea fila de datos (método anterior - mantener para compatibilidad)
   */
    parseDataRow(row, columnMap, brand) {
        const modelo =
      columnMap.modelo >= 0 ? String(row[columnMap.modelo] || '').trim() : '';
        const precioRaw = columnMap.precio >= 0 ? row[columnMap.precio] : '';
        const notas =
      columnMap.notas >= 0 ? String(row[columnMap.notas] || '').trim() : '';

        if (!modelo || modelo.length < 2) return null;

        // Parsear precio
        let precio = 0;
        if (precioRaw) {
            const precioStr = String(precioRaw).replace(/[^\d.]/g, '');
            precio = parseFloat(precioStr) || 0;
        }

        if (precio < 50) return null;

        return {
            modelo_celular: this.normalizeModel(modelo, brand),
            tipo_reparacion: 'pantalla',
            precio: precio,
            tiempo_reparacion: 'listo en 30-45 minutos',
            disponibilidad: 'disponible',
            notas: notas || `Cambio de pantalla ${brand} con mano de obra incluida`
        };
    }

    /**
   * Normaliza modelo
   */
    normalizeModel(modelo, brand) {
        let normalized = modelo.trim();

        if (!normalized.toLowerCase().includes(brand)) {
            normalized = `${brand.charAt(0).toUpperCase() + brand.slice(1)} ${normalized}`;
        }

        return normalized;
    }

    /**
   * Genera SQL INSERT
   */
    generateInsertSQL(data) {
        const escapedModel = data.modelo_celular.replace(/'/g, '\'\'');
        const escapedNotas = data.notas.replace(/'/g, '\'\'');

        const sql = `INSERT OR IGNORE INTO reparaciones (modelo_celular, tipo_reparacion, precio, tiempo_reparacion, disponibilidad, notas) VALUES ('${escapedModel}', '${data.tipo_reparacion}', ${data.precio}, '${data.tiempo_reparacion}', '${data.disponibilidad}', '${escapedNotas}');`;

        this.sqlStatements.push(sql);
        this.processedCount++;
    }

    /**
   * Genera archivo SQL
   */
    generateSQLFile() {
        const sqlContent = `-- SQL generado desde archivos Excel
-- Archivo: pantallas_precios.sql
-- Generado: ${new Date().toISOString()}
-- Total registros: ${this.processedCount}

-- Limpiar datos existentes de pantallas (opcional)
-- DELETE FROM reparaciones WHERE tipo_reparacion = 'pantalla';

-- Insertar nuevos datos
${this.sqlStatements.join('\n')}

-- Verificar inserción
SELECT COUNT(*) as total_pantallas FROM reparaciones WHERE tipo_reparacion = 'pantalla';
SELECT DISTINCT modelo_celular FROM reparaciones WHERE tipo_reparacion = 'pantalla' ORDER BY modelo_celular LIMIT 10;
`;

        const outputPath = path.join(__dirname, '../../pantallas_precios.sql');
        fs.writeFileSync(outputPath, sqlContent);

        console.log('📊 RESUMEN DE GENERACIÓN SQL');
        console.log('===========================');
        console.log(`✅ Registros procesados: ${this.processedCount}`);
        console.log(`📄 Archivo generado: pantallas_precios.sql`);
        console.log(`💾 Ubicación: ${outputPath}`);

        console.log('\n🎯 SIGUIENTE PASO:');
        console.log('1. Revisar el archivo pantallas_precios.sql');
        console.log('2. Ejecutar en tu gestor de BD SQLite');
        console.log('3. ¡Probar el bot con los nuevos precios!');

        // Mostrar muestra de datos
        console.log('\n📋 MUESTRA DE DATOS GENERADOS:');
        this.sqlStatements.slice(0, 3).forEach((sql, i) => {
            console.log(`${i + 1}. ${sql.substring(0, 100)}...`);
        });
    }
}

// Ejecutar
if (require.main === module) {
    const generator = new SQLGenerator();
    generator
        .processTestFiles()
        .then(() => {
            console.log('\n✅ Generación de SQL completada');
        })
        .catch((error) => {
            console.error('\n❌ Error:', error);
        });
}

module.exports = SQLGenerator;
