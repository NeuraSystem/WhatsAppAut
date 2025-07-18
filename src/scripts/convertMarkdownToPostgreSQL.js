#!/usr/bin/env node

// src/scripts/convertMarkdownToPostgreSQL.js
// MIGRACIÓN DE MARKDOWN A POSTGRESQL - Sistema SalvaCell
// Convierte archivos .md con tablas de precios a base de datos PostgreSQL

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { pool } = require("../database/pg");
const logger = require("../utils/logger");

/**
 * CONVERSOR DE MARKDOWN A POSTGRESQL
 * Procesa archivos .md con tablas de precios y los migra a PostgreSQL
 *
 * Funcionalidades:
 * - Parser de tablas Markdown
 * - Limpieza de datos actuales
 * - Inserción masiva con transacciones
 * - Validación de datos
 * - Reporte detallado de migración
 */
class MarkdownToPostgreSQLConverter {
  constructor() {
    this.markdownPath = path.join(
      __dirname,
      "../../data/processed_for_ai/precios_markdown",
    );
    this.processedCount = 0;
    this.errorCount = 0;
    this.skippedCount = 0;
    this.cleanedCount = 0;
    this.brandStats = {};
    this.migrationStats = {
      totalFiles: 0,
      successfulFiles: 0,
      failedFiles: 0,
      totalRecords: 0,
      originalRecords: 0,
      genericRecords: 0,
      duplicatesSkipped: 0,
    };
  }

  /**
   * MÉTODO PRINCIPAL - Ejecuta migración completa
   */
  async executeMigration() {
    console.log("🔄 Iniciando migración de Markdown a PostgreSQL...\n");

    try {
      // 1. Verificar archivos Markdown
      await this.verifyMarkdownFiles();

      // 2. Limpiar datos actuales
      await this.cleanCurrentData();

      // 3. Procesar archivos Markdown
      await this.processAllMarkdownFiles();

      // 4. Generar reporte final
      await this.generateMigrationReport();

      console.log("\n✅ Migración completada exitosamente");
    } catch (error) {
      console.error("\n❌ Error durante la migración:", error);
      throw error;
    }
  }

  /**
   * VERIFICAR ARCHIVOS MARKDOWN
   */
  async verifyMarkdownFiles() {
    console.log("🔍 Verificando archivos Markdown...");

    if (!fs.existsSync(this.markdownPath)) {
      throw new Error(`Directorio no encontrado: ${this.markdownPath}`);
    }

    const files = fs
      .readdirSync(this.markdownPath)
      .filter((file) => file.endsWith(".md"));

    if (files.length === 0) {
      throw new Error("No se encontraron archivos .md en el directorio");
    }

    this.migrationStats.totalFiles = files.length;
    console.log(`   ✅ ${files.length} archivos .md encontrados`);

    // Mostrar archivos detectados
    files.forEach((file) => {
      const brand = file.replace("_precios.md", "");
      console.log(`   📱 ${brand}`);
    });

    console.log("");
  }

  /**
   * LIMPIAR DATOS ACTUALES
   */
  async cleanCurrentData() {
    console.log("🧹 Limpiando datos actuales...");

    try {
      // Contar registros actuales
      const countResult = await pool.query(
        "SELECT COUNT(*) as count FROM reparaciones WHERE tipo_reparacion = $1",
        ["pantalla"],
      );

      const currentCount = parseInt(countResult.rows[0].count);
      console.log(`   📊 Registros actuales de pantallas: ${currentCount}`);

      if (currentCount > 0) {
        // Eliminar registros actuales
        const deleteResult = await pool.query(
          "DELETE FROM reparaciones WHERE tipo_reparacion = $1",
          ["pantalla"],
        );

        this.cleanedCount = deleteResult.rowCount;
        console.log(`   🗑️ ${this.cleanedCount} registros eliminados`);
      }

      console.log("   ✅ Limpieza completada\n");
    } catch (error) {
      console.error("   ❌ Error limpiando datos:", error.message);
      throw error;
    }
  }

  /**
   * PROCESAR TODOS LOS ARCHIVOS MARKDOWN
   */
  async processAllMarkdownFiles() {
    console.log("📄 Procesando archivos Markdown...\n");

    const files = fs
      .readdirSync(this.markdownPath)
      .filter((file) => file.endsWith(".md"));

    for (const fileName of files) {
      await this.processSingleMarkdownFile(fileName);
    }

    console.log(
      `📊 Procesamiento completado: ${this.migrationStats.successfulFiles}/${this.migrationStats.totalFiles} archivos`,
    );
  }

  /**
   * PROCESAR UN ARCHIVO MARKDOWN
   */
  async processSingleMarkdownFile(fileName) {
    const filePath = path.join(this.markdownPath, fileName);
    const brand = fileName.replace("_precios.md", "");

    console.log(`🔍 Procesando: ${fileName}`);

    try {
      // Leer archivo
      const content = fs.readFileSync(filePath, "utf8");

      // Parsear tabla Markdown
      const records = this.parseMarkdownTable(content, brand);

      console.log(`   📋 ${records.length} registros extraídos`);

      // Insertar en base de datos
      let insertedCount = 0;
      let skippedCount = 0;

      await pool.query("BEGIN");

      try {
        for (const record of records) {
          const inserted = await this.insertRecord(record);
          if (inserted) {
            insertedCount++;
          } else {
            skippedCount++;
          }
        }

        await pool.query("COMMIT");

        // Actualizar estadísticas
        this.brandStats[brand] = {
          extracted: records.length,
          inserted: insertedCount,
          skipped: skippedCount,
        };

        this.migrationStats.successfulFiles++;
        console.log(
          `   ✅ ${insertedCount} registros insertados, ${skippedCount} omitidos\n`,
        );
      } catch (error) {
        await pool.query("ROLLBACK");
        throw error;
      }
    } catch (error) {
      console.error(`   ❌ Error procesando ${fileName}:`, error.message);
      this.migrationStats.failedFiles++;
      this.errorCount++;
    }
  }

  /**
   * PARSER DE TABLA MARKDOWN
   */
  parseMarkdownTable(content, brand) {
    const records = [];
    const lines = content.split("\n");
    let inTable = false;
    let headerProcessed = false;
    let columnIndexes = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detectar inicio de tabla
      if (line.startsWith("|") && line.includes("Modelo")) {
        inTable = true;
        headerProcessed = false;
        columnIndexes = this.parseTableHeader(line);
        continue;
      }

      // Saltar línea de separación
      if (line.startsWith("|") && line.includes("---")) {
        headerProcessed = true;
        continue;
      }

      // Procesar fila de datos
      if (inTable && headerProcessed && line.startsWith("|")) {
        const recordList = this.parseTableRow(line, columnIndexes, brand);
        if (recordList) {
          records.push(...recordList);
        }
      }

      // Fin de tabla
      if (inTable && !line.startsWith("|")) {
        inTable = false;
      }
    }

    return records;
  }

  /**
   * PARSEAR HEADER DE TABLA
   */
  parseTableHeader(headerLine) {
    const columns = headerLine
      .split("|")
      .map((col) => col.trim())
      .filter((col) => col);
    const indexes = {};

    columns.forEach((col, index) => {
      const lowerCol = col.toLowerCase();
      if (lowerCol.includes("modelo")) {
        indexes.modelo = index;
      } else if (lowerCol.includes("servicio")) {
        indexes.servicio = index;
      } else if (lowerCol.includes("original")) {
        indexes.original = index;
      } else if (
        lowerCol.includes("genérica") ||
        lowerCol.includes("generica")
      ) {
        indexes.generica = index;
      }
    });

    return indexes;
  }

  /**
   * PARSEAR FILA DE DATOS
   */
  parseTableRow(row, columnIndexes, brand) {
    const columns = row
      .split("|")
      .map((col) => col.trim())
      .filter((col) => col);
    const records = [];

    if (columns.length < 3) return null;

    const modelo = columns[columnIndexes.modelo] || "";
    const servicio = columns[columnIndexes.servicio] || "pantalla";
    const originalPrice = columns[columnIndexes.original] || "";
    const genericPrice = columns[columnIndexes.generica] || "";

    // Validar modelo
    if (!modelo || modelo.length < 2) return null;

    // Crear registro para precio original
    if (originalPrice && originalPrice !== "N/A") {
      const precio = this.parsePrice(originalPrice);
      if (precio > 0) {
        records.push({
          modelo_celular: this.normalizeModel(modelo, brand),
          tipo_reparacion: servicio.toLowerCase(),
          precio: precio,
          tiempo_reparacion:
            "Mismo día (antes 4PM) / Siguiente día (después 4PM)",
          disponibilidad: "disponible",
          notas: `Cambio de ${servicio} ${brand} con mano de obra incluida - Pantalla Original`,
          calidad: "original",
        });
        this.migrationStats.originalRecords++;
      }
    }

    // Crear registro para precio genérico
    if (genericPrice && genericPrice !== "N/A") {
      const precio = this.parsePrice(genericPrice);
      if (precio > 0) {
        records.push({
          modelo_celular: this.normalizeModel(modelo, brand),
          tipo_reparacion: servicio.toLowerCase(),
          precio: precio,
          tiempo_reparacion:
            "Mismo día (antes 4PM) / Siguiente día (después 4PM)",
          disponibilidad: "disponible",
          notas: `Cambio de ${servicio} ${brand} con mano de obra incluida - Pantalla Genérica`,
          calidad: "generica",
        });
        this.migrationStats.genericRecords++;
      }
    }

    return records.length > 0 ? records : null;
  }

  /**
   * PARSEAR PRECIO
   */
  parsePrice(priceStr) {
    if (!priceStr || priceStr === "N/A") return 0;

    const cleaned = priceStr.replace(/[^\d.]/g, "");
    const price = parseFloat(cleaned);

    return isNaN(price) ? 0 : price;
  }

  /**
   * NORMALIZAR MODELO
   */
  normalizeModel(modelo, brand) {
    let normalized = modelo.trim();

    // Agregar marca si no está presente
    if (!normalized.toLowerCase().includes(brand.toLowerCase())) {
      normalized = `${brand} ${normalized}`;
    }

    return normalized;
  }

  /**
   * INSERTAR REGISTRO EN BASE DE DATOS
   */
  async insertRecord(record) {
    try {
      // Verificar duplicados
      const checkResult = await pool.query(
        `
                SELECT id FROM reparaciones WHERE 
                LOWER(modelo_celular) = LOWER($1) AND 
                LOWER(tipo_reparacion) = LOWER($2) AND
                precio = $3
            `,
        [record.modelo_celular, record.tipo_reparacion, record.precio],
      );

      if (checkResult.rows.length > 0) {
        this.migrationStats.duplicatesSkipped++;
        return false;
      }

      // Insertar registro
      await pool.query(
        `
                INSERT INTO reparaciones 
                (modelo_celular, tipo_reparacion, precio, tiempo_reparacion, disponibilidad, notas)
                VALUES ($1, $2, $3, $4, $5, $6)
            `,
        [
          record.modelo_celular,
          record.tipo_reparacion,
          record.precio,
          record.tiempo_reparacion,
          record.disponibilidad,
          record.notas,
        ],
      );

      this.processedCount++;
      this.migrationStats.totalRecords++;
      return true;
    } catch (error) {
      console.error(`   ❌ Error insertando registro:`, error.message);
      this.errorCount++;
      return false;
    }
  }

  /**
   * GENERAR REPORTE DE MIGRACIÓN
   */
  async generateMigrationReport() {
    console.log("\n📊 REPORTE DE MIGRACIÓN");
    console.log("========================");

    // Estadísticas generales
    console.log(
      `📁 Archivos procesados: ${this.migrationStats.successfulFiles}/${this.migrationStats.totalFiles}`,
    );
    console.log(`🗑️ Registros eliminados: ${this.cleanedCount}`);
    console.log(`📝 Registros insertados: ${this.migrationStats.totalRecords}`);
    console.log(
      `🔄 Duplicados omitidos: ${this.migrationStats.duplicatesSkipped}`,
    );
    console.log(`❌ Errores: ${this.errorCount}`);

    // Estadísticas por calidad
    console.log(`\n📊 Por calidad:`);
    console.log(`   🔸 Originales: ${this.migrationStats.originalRecords}`);
    console.log(`   🔹 Genéricas: ${this.migrationStats.genericRecords}`);

    // Estadísticas por marca
    console.log(`\n📱 Por marca:`);
    Object.entries(this.brandStats).forEach(([brand, stats]) => {
      console.log(
        `   ${brand}: ${stats.inserted} insertados (${stats.skipped} omitidos)`,
      );
    });

    // Verificar inserción
    try {
      const verifyResult = await pool.query(
        "SELECT COUNT(*) as count FROM reparaciones WHERE tipo_reparacion = $1",
        ["pantalla"],
      );

      const finalCount = parseInt(verifyResult.rows[0].count);
      console.log(
        `\n✅ Verificación: ${finalCount} registros en base de datos`,
      );

      // Mostrar muestra de datos
      const sampleResult = await pool.query(`
                SELECT modelo_celular, precio, notas 
                FROM reparaciones 
                WHERE tipo_reparacion = 'pantalla' 
                ORDER BY precio DESC 
                LIMIT 5
            `);

      console.log(`\n📋 Muestra de datos migrados:`);
      sampleResult.rows.forEach((row, index) => {
        console.log(
          `   ${index + 1}. ${row.modelo_celular} - $${row.precio} - ${row.notas.substring(0, 50)}...`,
        );
      });
    } catch (error) {
      console.error("❌ Error verificando migración:", error.message);
    }

    console.log(
      `\n🎯 ESTADO: ${this.migrationStats.totalRecords > 0 ? "EXITOSO" : "FALLIDO"}`,
    );
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  const converter = new MarkdownToPostgreSQLConverter();
  converter
    .executeMigration()
    .then(() => {
      console.log("\n✅ Migración finalizada exitosamente");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Error en migración:", error);
      process.exit(1);
    });
}

module.exports = MarkdownToPostgreSQLConverter;
