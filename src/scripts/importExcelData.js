// src/scripts/importExcelData.js - Migrar datos de Excel a BD

require('dotenv').config();
const XLSX = require('xlsx');
const path = require('path');
const { pool } = require('../database/pg');
const logger = require('../utils/logger');

/**
 * Procesa archivos Excel de precios de pantallas por marca
 */
class ExcelDataImporter {
    constructor() {
        this.dataPath = path.join(__dirname, '../../data');
        this.processedCount = 0;
        this.errorCount = 0;
        this.duplicateCount = 0;
    }

    /**
     * Importa datos de archivos Excel seleccionados para testing
     */
    async importTestFiles() {
        console.log('📊 Iniciando importación de datos Excel...\n');

        // Archivos para testing (como solicitaste 3-4)
        const testFiles = [
            'Samsung.xlsx',
            'Iphone.xlsx', 
            'Xiaomi.xlsx',
            'Motorola.xlsx'
        ];

        for (const fileName of testFiles) {
            await this.processExcelFile(fileName);
        }

        this.printSummary();
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

            // Detectar formato y procesar
            const processedData = this.parseSheetData(jsonData, brand);
            
            // Insertar en base de datos
            let insertedCount = 0;
            for (const item of processedData) {
                const success = await this.insertRepairData(item);
                if (success) insertedCount++;
            }

            console.log(`   ✅ ${insertedCount}/${processedData.length} registros insertados\n`);

        } catch (error) {
            console.error(`   ❌ Error procesando ${fileName}:`, error.message);
            this.errorCount++;
        }
    }

    /**
     * Analiza y parsea los datos del Excel
     */
    parseSheetData(rows, brand) {
        if (rows.length < 2) return [];

        // Intentar detectar headers automáticamente
        let headerRow = 0;
        let dataStartRow = 1;

        // Buscar la fila con headers más probable
        for (let i = 0; i < Math.min(5, rows.length); i++) {
            const row = rows[i];
            if (this.looksLikeHeader(row)) {
                headerRow = i;
                dataStartRow = i + 1;
                break;
            }
        }

        const headers = rows[headerRow];
        const dataRows = rows.slice(dataStartRow);

        console.log(`   📋 Headers detectados:`, headers.slice(0, 5));

        // Mapear columnas
        const columnMap = this.detectColumns(headers);
        
        // Procesar cada fila de datos
        const processed = [];
        for (const row of dataRows) {
            if (!row || row.length === 0) continue;
            
            const item = this.parseDataRow(row, columnMap, brand);
            if (item) {
                processed.push(item);
            }
        }

        return processed;
    }

    /**
     * Detecta si una fila parece contener headers
     */
    looksLikeHeader(row) {
        if (!row || row.length === 0) return false;
        
        const firstCell = String(row[0]).toLowerCase();
        const headerIndicators = [
            'modelo', 'device', 'phone', 'celular', 'equipo',
            'precio', 'price', 'cost', 'costo', 'valor'
        ];

        return headerIndicators.some(indicator => 
            firstCell.includes(indicator)
        );
    }

    /**
     * Detecta qué columna contiene qué información
     */
    detectColumns(headers) {
        const map = {
            modelo: -1,
            precio: -1,
            notas: -1
        };

        headers.forEach((header, index) => {
            const h = String(header).toLowerCase();
            
            // Detectar columna de modelo
            if (h.includes('modelo') || h.includes('device') || h.includes('phone') || h.includes('celular')) {
                map.modelo = index;
            }
            // Detectar columna de precio
            else if (h.includes('precio') || h.includes('price') || h.includes('costo') || h.includes('cost')) {
                map.precio = index;
            }
            // Detectar columna de notas
            else if (h.includes('nota') || h.includes('note') || h.includes('observ') || h.includes('comment')) {
                map.notas = index;
            }
        });

        // Si no se detectaron headers, asumir formato simple
        if (map.modelo === -1 && headers.length >= 2) {
            map.modelo = 0;
            map.precio = 1;
            if (headers.length >= 3) map.notas = 2;
        }

        console.log(`   🗺️ Mapeo de columnas:`, map);
        return map;
    }

    /**
     * Parsea una fila de datos según el mapeo de columnas
     */
    parseDataRow(row, columnMap, brand) {
        const modelo = columnMap.modelo >= 0 ? String(row[columnMap.modelo] || '').trim() : '';
        const precioRaw = columnMap.precio >= 0 ? row[columnMap.precio] : '';
        const notas = columnMap.notas >= 0 ? String(row[columnMap.notas] || '').trim() : '';

        // Validar que hay modelo
        if (!modelo || modelo.length < 2) return null;

        // Parsear precio
        let precio = 0;
        if (precioRaw) {
            const precioStr = String(precioRaw).replace(/[^\d.]/g, '');
            precio = parseFloat(precioStr) || 0;
        }

        // Validar precio mínimo
        if (precio < 50) return null;

        return {
            modelo_celular: this.normalizeModel(modelo, brand),
            tipo_reparacion: 'pantalla', // Según tu especificación
            precio: precio,
            tiempo_reparacion: 'disponible consultar',
            disponibilidad: 'disponible',
            notas: notas || `Cambio de pantalla ${brand} con mano de obra incluida`
        };
    }

    /**
     * Normaliza el nombre del modelo
     */
    normalizeModel(modelo, brand) {
        let normalized = modelo.trim();
        
        // Agregar marca si no está presente
        if (!normalized.toLowerCase().includes(brand)) {
            normalized = `${brand.charAt(0).toUpperCase() + brand.slice(1)} ${normalized}`;
        }

        return normalized;
    }

    /**
     * Inserta datos en la base de datos
     */
    async insertRepairData(data) {
        try {
            // Verificar si ya existe
            const checkResult = await pool.query(`
                SELECT id FROM reparaciones WHERE 
                LOWER(modelo_celular) = LOWER($1) AND 
                LOWER(tipo_reparacion) = LOWER($2)
            `, [data.modelo_celular, data.tipo_reparacion]);
            
            if (checkResult.rows.length > 0) {
                this.duplicateCount++;
                return false;
            }

            // Insertar nuevo registro
            await pool.query(`
                INSERT INTO reparaciones 
                (modelo_celular, tipo_reparacion, precio, tiempo_reparacion, disponibilidad, notas)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                data.modelo_celular,
                data.tipo_reparacion,
                data.precio,
                data.tiempo_reparacion,
                data.disponibilidad,
                data.notas
            ]);
            
            this.processedCount++;
            return true;
        } catch (error) {
            console.error(`   ❌ Error en base de datos:`, error.message);
            this.errorCount++;
            return false;
        }
    }

    /**
     * Muestra resumen de la importación
     */
    printSummary() {
        console.log('\n📊 RESUMEN DE IMPORTACIÓN');
        console.log('========================');
        console.log(`✅ Registros procesados: ${this.processedCount}`);
        console.log(`⚠️ Duplicados omitidos: ${this.duplicateCount}`);
        console.log(`❌ Errores: ${this.errorCount}`);
        console.log(`🎯 Total intentos: ${this.processedCount + this.duplicateCount + this.errorCount}`);
        
        if (this.processedCount > 0) {
            console.log('\n🎉 ¡Importación completada exitosamente!');
            console.log('💡 Tip: Ejecuta el bot para probar con los nuevos datos');
        } else {
            console.log('\n⚠️ No se importaron datos nuevos');
        }
    }
}

// Ejecutar importación si se llama directamente
if (require.main === module) {
    const importer = new ExcelDataImporter();
    importer.importTestFiles()
        .then(() => {
            console.log('\n✅ Script de importación finalizado');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Error en importación:', error);
            process.exit(1);
        });
}

module.exports = ExcelDataImporter;