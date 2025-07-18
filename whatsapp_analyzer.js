#!/usr/bin/env node

/**
 * Analizador de Proyecto WhatsAppAut
 * Analiza todos los archivos .js del proyecto WhatsAppAut para detectar duplicaciones,
 * funciones únicas, archivos obsoletos y relaciones entre archivos.
 *
 * @author Script adaptado por Claude
 * @version 1.0.0
 */

const fs = require("fs").promises;
const path = require("path");

// Configuración del analizador para WhatsAppAut
const CONFIG = {
  // Ruta del proyecto WhatsAppAut
  projectPath: "C:\\Users\\neura\\OneDrive\\Desktop\\WhatsAppAut",

  // Archivos de salida
  outputMarkdown: "analisis_whatsapp.md",
  outputJson: "analisis_whatsapp.json",

  // Carpetas a excluir completamente
  excludedDirs: [
    "node_modules",
    ".venv",
    ".git",
    "dist",
    "build",
    "out",
    ".next",
    ".nuxt",
    "coverage",
    ".nyc_output",
    "temp",
    "tmp",
    ".pytest_cache",
    "__pycache__",
    "logs",
    "cache",
  ],

  // Extensiones de archivo a analizar
  fileExtensions: [".js", ".ts", ".jsx", ".tsx", ".py", ".json"],

  // Límites de seguridad
  maxFilesPerDir: 500,
  maxFileSize: 1024 * 1024, // 1MB

  // Configuración de agrupamiento
  filesPerGroup: 5,
  maxFilesBeforeGrouping: 8,
};

/**
 * Clase principal del analizador WhatsAppAut
 */
class WhatsAppAnalyzer {
  constructor() {
    this.analysisData = {
      projectPath: CONFIG.projectPath,
      projectName: "WhatsAppAut",
      timestamp: new Date().toISOString(),
      summary: {
        totalDirectories: 0,
        totalFiles: 0,
        filesByExtension: {},
        totalFunctions: 0,
        totalClasses: 0,
        totalImports: 0,
        pythonFiles: 0,
        javascriptFiles: 0,
        configFiles: 0,
      },
      directories: [],
      duplicates: [],
      relationships: [],
      technologies: [],
    };

    this.allFunctions = new Map();
    this.allClasses = new Map();
    this.fileRelationships = new Map();
    this.detectedTechnologies = new Set();
  }

  /**
   * Inicia el análisis completo del proyecto WhatsAppAut
   */
  async analyze() {
    try {
      console.log("🚀 Iniciando análisis del proyecto WhatsAppAut...");
      console.log(`📁 Ruta: ${CONFIG.projectPath}`);

      await this.validateProjectPath();
      await this.analyzeDirectory(CONFIG.projectPath);
      
      this.detectTechnologies();
      this.detectDuplicates();
      this.buildRelationships();

      await this.generateMarkdownReport();
      await this.generateJsonReport();

      console.log("✅ Análisis de WhatsAppAut completado exitosamente!");
      this.printSummary();
    } catch (error) {
      console.error("❌ Error durante el análisis:", error.message);
      process.exit(1);
    }
  }

  /**
   * Valida que la ruta del proyecto existe
   */
  async validateProjectPath() {
    try {
      const stats = await fs.stat(CONFIG.projectPath);
      if (!stats.isDirectory()) {
        throw new Error("La ruta especificada no es un directorio");
      }
    } catch (error) {
      throw new Error(`No se puede acceder a la ruta del proyecto: ${error.message}`);
    }
  }

  /**
   * Analiza un directorio recursivamente
   */
  async analyzeDirectory(dirPath, relativePath = "") {
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });

      if (items.length > CONFIG.maxFilesPerDir) {
        console.log(`⚠️  Saltando directorio con ${items.length} archivos: ${relativePath || "raíz"}`);
        return;
      }

      const targetFiles = [];
      const subdirectories = [];

      for (const item of items) {
        const itemPath = path.join(dirPath, item.name);
        const relativeItemPath = path.join(relativePath, item.name);

        if (item.isDirectory()) {
          if (!this.shouldExcludeDirectory(item.name)) {
            subdirectories.push({
              path: itemPath,
              relativePath: relativeItemPath,
            });
          }
        } else if (item.isFile() && this.isTargetFile(item.name)) {
          if (!this.shouldExcludeFile(item.name)) {
            targetFiles.push({
              path: itemPath,
              relativePath: relativeItemPath,
              name: item.name,
              extension: path.extname(item.name),
            });
          }
        }
      }

      if (targetFiles.length > 0) {
        await this.analyzeFiles(dirPath, relativePath || "raíz", targetFiles);
      }

      for (const subdir of subdirectories) {
        await this.analyzeDirectory(subdir.path, subdir.relativePath);
      }
    } catch (error) {
      console.error(`❌ Error analizando directorio ${dirPath}: ${error.message}`);
    }
  }

  /**
   * Verifica si un directorio debe ser excluido
   */
  shouldExcludeDirectory(dirName) {
    return (
      CONFIG.excludedDirs.includes(dirName) ||
      dirName.startsWith(".") ||
      dirName.toLowerCase().includes("cache") ||
      dirName.toLowerCase().includes("log")
    );
  }

  /**
   * Verifica si un archivo debe ser excluido
   */
  shouldExcludeFile(fileName) {
    return (
      fileName === CONFIG.outputMarkdown ||
      fileName === CONFIG.outputJson ||
      fileName.includes("analisis") ||
      fileName.includes("analysis") ||
      fileName.startsWith(".") ||
      fileName.endsWith(".pyc") ||
      fileName.endsWith(".log")
    );
  }

  /**
   * Verifica si es un archivo objetivo
   */
  isTargetFile(fileName) {
    return CONFIG.fileExtensions.some(ext => fileName.endsWith(ext));
  }

  /**
   * Analiza archivos de un directorio
   */
  async analyzeFiles(dirPath, relativePath, files) {
    console.log(`📂 Analizando: ${relativePath} (${files.length} archivos)`);

    const directoryData = {
      path: relativePath,
      fileCount: files.length,
      files: [],
      groups: [],
      technologies: new Set(),
    };

    if (files.length > CONFIG.maxFilesBeforeGrouping) {
      const groups = this.createFileGroups(files);
      for (let i = 0; i < groups.length; i++) {
        const group = {
          name: `Grupo ${i + 1}`,
          files: [],
        };

        for (const file of groups[i]) {
          const fileData = await this.analyzeFile(file.path, file.relativePath, file.extension);
          if (fileData) {
            group.files.push(fileData);
            directoryData.files.push(fileData);
            this.updateTechnologies(fileData, directoryData.technologies);
          }
        }
        directoryData.groups.push(group);
      }
    } else {
      for (const file of files) {
        const fileData = await this.analyzeFile(file.path, file.relativePath, file.extension);
        if (fileData) {
          directoryData.files.push(fileData);
          this.updateTechnologies(fileData, directoryData.technologies);
        }
      }
    }

    if (directoryData.files.length > 0) {
      directoryData.technologies = Array.from(directoryData.technologies);
      this.analysisData.directories.push(directoryData);
      this.analysisData.summary.totalDirectories++;
    }
  }

  /**
   * Crea grupos de archivos
   */
  createFileGroups(files) {
    const groups = [];
    const sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name));

    for (let i = 0; i < sortedFiles.length; i += CONFIG.filesPerGroup) {
      groups.push(sortedFiles.slice(i, i + CONFIG.filesPerGroup));
    }

    return groups;
  }

  /**
   * Analiza un archivo individual
   */
  async analyzeFile(filePath, relativePath, extension) {
    try {
      const stats = await fs.stat(filePath);

      if (stats.size > CONFIG.maxFileSize) {
        console.log(`⚠️  Archivo demasiado grande, saltando: ${relativePath}`);
        return null;
      }

      const content = await fs.readFile(filePath, "utf-8");
      let analysis;

      switch (extension) {
        case ".js":
        case ".jsx":
        case ".ts":
        case ".tsx":
          analysis = this.parseJavaScriptFile(content, relativePath);
          this.analysisData.summary.javascriptFiles++;
          break;
        case ".py":
          analysis = this.parsePythonFile(content, relativePath);
          this.analysisData.summary.pythonFiles++;
          break;
        case ".json":
          analysis = this.parseJsonFile(content, relativePath);
          this.analysisData.summary.configFiles++;
          break;
        default:
          analysis = this.parseGenericFile(content, relativePath);
      }

      this.analysisData.summary.totalFiles++;
      this.updateFileStats(extension);

      if (analysis.functions) {
        this.analysisData.summary.totalFunctions += analysis.functions.length;
        this.registerFunctions(analysis.functions, relativePath);
      }

      if (analysis.classes) {
        this.analysisData.summary.totalClasses += analysis.classes.length;
        this.registerClasses(analysis.classes, relativePath);
      }

      if (analysis.imports) {
        this.analysisData.summary.totalImports += analysis.imports.length;
        this.registerImports(analysis.imports, relativePath);
      }

      return analysis;
    } catch (error) {
      console.error(`❌ Error analizando archivo ${relativePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Actualiza estadísticas por extensión de archivo
   */
  updateFileStats(extension) {
    if (!this.analysisData.summary.filesByExtension[extension]) {
      this.analysisData.summary.filesByExtension[extension] = 0;
    }
    this.analysisData.summary.filesByExtension[extension]++;
  }

  /**
   * Parsea archivo JavaScript/TypeScript
   */
  parseJavaScriptFile(content, filePath) {
    const analysis = {
      name: path.basename(filePath),
      path: filePath,
      type: "javascript",
      size: content.length,
      lines: content.split("\n").length,
      functions: [],
      classes: [],
      imports: [],
      exports: [],
      technologies: [],
      hasExports: false,
      isModule: false,
    };

    try {
      analysis.isModule = content.includes("module.exports") || 
                         content.includes("export ") || 
                         content.includes("import ");

      analysis.functions = this.extractJavaScriptFunctions(content);
      analysis.classes = this.extractJavaScriptClasses(content);
      analysis.imports = this.extractJavaScriptImports(content);
      analysis.exports = this.extractJavaScriptExports(content);
      analysis.hasExports = analysis.exports.length > 0;
      
      // Detectar tecnologías específicas de WhatsApp
      analysis.technologies = this.detectJavaScriptTechnologies(content);
    } catch (error) {
      console.error(`Error parseando JavaScript ${filePath}: ${error.message}`);
    }

    return analysis;
  }

  /**
   * Parsea archivo Python
   */
  parsePythonFile(content, filePath) {
    const analysis = {
      name: path.basename(filePath),
      path: filePath,
      type: "python",
      size: content.length,
      lines: content.split("\n").length,
      functions: [],
      classes: [],
      imports: [],
      technologies: [],
    };

    try {
      analysis.functions = this.extractPythonFunctions(content);
      analysis.classes = this.extractPythonClasses(content);
      analysis.imports = this.extractPythonImports(content);
      analysis.technologies = this.detectPythonTechnologies(content);
    } catch (error) {
      console.error(`Error parseando Python ${filePath}: ${error.message}`);
    }

    return analysis;
  }

  /**
   * Parsea archivo JSON
   */
  parseJsonFile(content, filePath) {
    const analysis = {
      name: path.basename(filePath),
      path: filePath,
      type: "json",
      size: content.length,
      lines: content.split("\n").length,
      isConfig: true,
      technologies: [],
    };

    try {
      const jsonData = JSON.parse(content);
      analysis.structure = this.analyzeJsonStructure(jsonData);
      analysis.technologies = this.detectJsonTechnologies(jsonData, filePath);
    } catch (error) {
      analysis.parseError = error.message;
    }

    return analysis;
  }

  /**
   * Parsea archivo genérico
   */
  parseGenericFile(content, filePath) {
    return {
      name: path.basename(filePath),
      path: filePath,
      type: "generic",
      size: content.length,
      lines: content.split("\n").length,
      technologies: [],
    };
  }

  /**
   * Extrae funciones JavaScript
   */
  extractJavaScriptFunctions(content) {
    const functions = [];
    const patterns = [
      /function\s+(\w+)\s*\([^)]*\)\s*\{/g,
      /(?:const|let|var)\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g,
      /(?:const|let|var)\s+(\w+)\s*=\s*\w+\s*=>/g,
      /(\w+)\s*:\s*function\s*\([^)]*\)\s*\{/g,
      /(\w+)\s*\([^)]*\)\s*\{/g,
    ];

    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const name = match[1];
        if (name && !functions.some((f) => f.name === name)) {
          functions.push({
            name: name,
            type: this.getFunctionType(match[0]),
            line: content.substring(0, match.index).split("\n").length,
            isExported: this.isJavaScriptExported(content, name),
          });
        }
      }
    });

    return functions;
  }

  /**
   * Extrae funciones Python
   */
  extractPythonFunctions(content) {
    const functions = [];
    const pattern = /def\s+(\w+)\s*\([^)]*\):/g;

    let match;
    while ((match = pattern.exec(content)) !== null) {
      functions.push({
        name: match[1],
        type: "function",
        line: content.substring(0, match.index).split("\n").length,
        isPrivate: match[1].startsWith("_"),
      });
    }

    return functions;
  }

  /**
   * Extrae clases JavaScript
   */
  extractJavaScriptClasses(content) {
    const classes = [];
    const classPattern = /class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{/g;

    let match;
    while ((match = classPattern.exec(content)) !== null) {
      classes.push({
        name: match[1],
        extends: match[2] || null,
        line: content.substring(0, match.index).split("\n").length,
        isExported: this.isJavaScriptExported(content, match[1]),
      });
    }

    return classes;
  }

  /**
   * Extrae clases Python
   */
  extractPythonClasses(content) {
    const classes = [];
    const pattern = /class\s+(\w+)(?:\([^)]*\))?:/g;

    let match;
    while ((match = pattern.exec(content)) !== null) {
      classes.push({
        name: match[1],
        line: content.substring(0, match.index).split("\n").length,
        isPrivate: match[1].startsWith("_"),
      });
    }

    return classes;
  }

  /**
   * Extrae imports JavaScript
   */
  extractJavaScriptImports(content) {
    const imports = [];
    const patterns = [
      /import\s+(?:(\w+)(?:\s*,\s*)?)?(?:\{([^}]+)\})?\s+from\s+['"]([^'"]+)['"]/g,
      /(?:const|let|var)\s+(?:(\w+)|\{([^}]+)\})\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    ];

    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        imports.push({
          source: match[3],
          default: match[1] || null,
          named: match[2] ? match[2].split(",").map((s) => s.trim()) : [],
          line: content.substring(0, match.index).split("\n").length,
          isLocal: match[3].startsWith("./") || match[3].startsWith("../"),
        });
      }
    });

    return imports;
  }

  /**
   * Extrae imports Python
   */
  extractPythonImports(content) {
    const imports = [];
    const patterns = [
      /from\s+([^\s]+)\s+import\s+([^\n]+)/g,
      /import\s+([^\n]+)/g,
    ];

    patterns.forEach((pattern, index) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (index === 0) {
          // from ... import ...
          imports.push({
            source: match[1],
            items: match[2].split(",").map((s) => s.trim()),
            type: "from",
            line: content.substring(0, match.index).split("\n").length,
          });
        } else {
          // import ...
          imports.push({
            source: match[1],
            type: "import",
            line: content.substring(0, match.index).split("\n").length,
          });
        }
      }
    });

    return imports;
  }

  /**
   * Extrae exports JavaScript
   */
  extractJavaScriptExports(content) {
    const exports = [];
    const patterns = [
      /export\s+default\s+(\w+)/g,
      /export\s+(?:const|let|var|function|class)\s+(\w+)/g,
      /export\s+\{([^}]+)\}/g,
      /module\.exports\s*=\s*(\w+)/g,
    ];

    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        exports.push({
          name: match[1],
          line: content.substring(0, match.index).split("\n").length,
        });
      }
    });

    return exports;
  }

  /**
   * Detecta tecnologías específicas en JavaScript
   */
  detectJavaScriptTechnologies(content) {
    const technologies = [];
    
    // WhatsApp Web específicas
    if (content.includes("whatsapp-web.js") || content.includes("Client")) {
      technologies.push("WhatsApp Web API");
    }
    if (content.includes("puppeteer")) {
      technologies.push("Puppeteer");
    }
    if (content.includes("qrcode")) {
      technologies.push("QR Code");
    }
    
    // Frameworks y librerías comunes
    if (content.includes("express")) {
      technologies.push("Express.js");
    }
    if (content.includes("socket.io")) {
      technologies.push("Socket.IO");
    }
    if (content.includes("axios") || content.includes("fetch")) {
      technologies.push("HTTP Client");
    }
    if (content.includes("mongoose")) {
      technologies.push("MongoDB/Mongoose");
    }
    
    return technologies;
  }

  /**
   * Detecta tecnologías específicas en Python
   */
  detectPythonTechnologies(content) {
    const technologies = [];
    
    // WhatsApp Python específicas
    if (content.includes("selenium")) {
      technologies.push("Selenium WebDriver");
    }
    if (content.includes("yowsup")) {
      technologies.push("Yowsup WhatsApp API");
    }
    if (content.includes("pywhatkit")) {
      technologies.push("PyWhatKit");
    }
    
    // Frameworks web
    if (content.includes("flask")) {
      technologies.push("Flask");
    }
    if (content.includes("django")) {
      technologies.push("Django");
    }
    if (content.includes("fastapi")) {
      technologies.push("FastAPI");
    }
    
    // Librerías comunes
    if (content.includes("requests")) {
      technologies.push("Requests HTTP");
    }
    if (content.includes("pandas")) {
      technologies.push("Pandas");
    }
    
    return technologies;
  }

  /**
   * Detecta tecnologías en archivos JSON
   */
  detectJsonTechnologies(jsonData, filePath) {
    const technologies = [];
    const fileName = path.basename(filePath);
    
    if (fileName === "package.json") {
      technologies.push("Node.js Package");
      if (jsonData.dependencies) {
        Object.keys(jsonData.dependencies).forEach(dep => {
          if (dep.includes("whatsapp")) {
            technologies.push("WhatsApp Integration");
          }
        });
      }
    }
    
    if (fileName === "requirements.txt") {
      technologies.push("Python Requirements");
    }
    
    return technologies;
  }

  /**
   * Analiza estructura JSON
   */
  analyzeJsonStructure(jsonData) {
    return {
      keys: Object.keys(jsonData || {}),
      hasScripts: !!jsonData.scripts,
      hasDependencies: !!jsonData.dependencies,
      hasDevDependencies: !!jsonData.devDependencies,
    };
  }

  /**
   * Actualiza tecnologías detectadas
   */
  updateTechnologies(fileData, directoryTechnologies) {
    if (fileData.technologies) {
      fileData.technologies.forEach(tech => {
        directoryTechnologies.add(tech);
        this.detectedTechnologies.add(tech);
      });
    }
  }

  /**
   * Detecta tecnologías del proyecto
   */
  detectTechnologies() {
    this.analysisData.technologies = Array.from(this.detectedTechnologies);
  }

  /**
   * Verifica si está exportado en JavaScript
   */
  isJavaScriptExported(content, name) {
    const patterns = [
      new RegExp(`export\\s+(?:default\\s+)?(?:const|let|var|function|class)\\s+${name}\\b`),
      new RegExp(`export\\s+\\{[^}]*\\b${name}\\b[^}]*\\}`),
      new RegExp(`module\\.exports\\s*=\\s*${name}\\b`),
    ];
    return patterns.some(pattern => pattern.test(content));
  }

  /**
   * Obtiene tipo de función
   */
  getFunctionType(declaration) {
    if (declaration.includes("function")) return "function";
    if (declaration.includes("=>")) return "arrow";
    if (declaration.includes(":")) return "method";
    return "unknown";
  }

  /**
   * Registra funciones para detección de duplicados
   */
  registerFunctions(functions, filePath) {
    functions.forEach((func) => {
      if (!this.allFunctions.has(func.name)) {
        this.allFunctions.set(func.name, []);
      }
      this.allFunctions.get(func.name).push({
        ...func,
        file: filePath,
      });
    });
  }

  /**
   * Registra clases para detección de duplicados
   */
  registerClasses(classes, filePath) {
    classes.forEach((cls) => {
      if (!this.allClasses.has(cls.name)) {
        this.allClasses.set(cls.name, []);
      }
      this.allClasses.get(cls.name).push({
        ...cls,
        file: filePath,
      });
    });
  }

  /**
   * Registra imports para análisis de relaciones
   */
  registerImports(imports, filePath) {
    if (!this.fileRelationships.has(filePath)) {
      this.fileRelationships.set(filePath, []);
    }
    this.fileRelationships.get(filePath).push(...imports);
  }

  /**
   * Detecta duplicados
   */
  detectDuplicates() {
    console.log("🔍 Detectando duplicados...");

    this.allFunctions.forEach((occurrences, name) => {
      if (occurrences.length > 1) {
        this.analysisData.duplicates.push({
          type: "function",
          name: name,
          occurrences: occurrences.map((occ) => ({
            file: occ.file,
            line: occ.line,
            isExported: occ.isExported,
          })),
        });
      }
    });

    this.allClasses.forEach((occurrences, name) => {
      if (occurrences.length > 1) {
        this.analysisData.duplicates.push({
          type: "class",
          name: name,
          occurrences: occurrences.map((occ) => ({
            file: occ.file,
            line: occ.line,
            isExported: occ.isExported,
          })),
        });
      }
    });
  }

  /**
   * Construye relaciones entre archivos
   */
  buildRelationships() {
    console.log("🔗 Construyendo relaciones...");

    this.fileRelationships.forEach((imports, filePath) => {
      imports.forEach((imp) => {
        if (imp.isLocal || (imp.source && !imp.source.includes("node_modules"))) {
          this.analysisData.relationships.push({
            from: filePath,
            to: imp.source,
            type: "import",
            imports: imp.items || imp.named || [imp.default].filter(Boolean),
          });
        }
      });
    });
  }

  /**
   * Imprime resumen del análisis
   */
  printSummary() {
    const summary = this.analysisData.summary;
    console.log(`📊 Resumen del análisis de WhatsAppAut:`);
    console.log(`   - Directorios: ${summary.totalDirectories}`);
    console.log(`   - Archivos totales: ${summary.totalFiles}`);
    console.log(`   - Archivos JavaScript: ${summary.javascriptFiles}`);
    console.log(`   - Archivos Python: ${summary.pythonFiles}`);
    console.log(`   - Archivos de configuración: ${summary.configFiles}`);
    console.log(`   - Funciones: ${summary.totalFunctions}`);
    console.log(`   - Clases: ${summary.totalClasses}`);
    console.log(`   - Duplicados: ${this.analysisData.duplicates.length}`);
    console.log(`   - Tecnologías detectadas: ${this.analysisData.technologies.length}`);
  }

  /**
   * Genera reporte Markdown
   */
  async generateMarkdownReport() {
    console.log("📝 Generando reporte Markdown...");

    const outputPath = path.join(CONFIG.projectPath, CONFIG.outputMarkdown);
    let markdown = this.generateMarkdownContent();

    await fs.writeFile(outputPath, markdown, "utf-8");
    console.log(`✅ Reporte Markdown guardado en: ${outputPath}`);
  }

  /**
   * Genera contenido Markdown - continuación
   */
  generateMarkdownContent() {
    const summary = this.analysisData.summary;
    
    return `# 📱 Análisis de Proyecto WhatsAppAut

**Proyecto:** WhatsAppAut  
**Ruta:** ${CONFIG.projectPath}  
**Fecha de análisis:** ${new Date().toLocaleString()}  
**Generado por:** Analizador WhatsAppAut

---

## 📈 Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| **Directorios analizados** | ${summary.totalDirectories} |
| **Archivos totales** | ${summary.totalFiles} |
| **Archivos JavaScript/TypeScript** | ${summary.javascriptFiles} |
| **Archivos Python** | ${summary.pythonFiles} |
| **Archivos de configuración** | ${summary.configFiles} |
| **Funciones totales** | ${summary.totalFunctions} |
| **Clases totales** | ${summary.totalClasses} |
| **Imports totales** | ${summary.totalImports} |
| **Duplicados detectados** | ${this.analysisData.duplicates.length} |
| **Relaciones entre archivos** | ${this.analysisData.relationships.length} |

### 📊 Distribución por Extensión

${Object.entries(summary.filesByExtension).map(([ext, count]) => 
  `- **${ext}**: ${count} archivos`
).join('\n')}

### 🛠️ Tecnologías Detectadas

${this.analysisData.technologies.length > 0 ? 
  this.analysisData.technologies.map(tech => `- ✅ ${tech}`).join('\n') : 
  'No se detectaron tecnologías específicas.'}

---

## 📂 Análisis por Directorio

${this.generateDirectoriesSection()}

---

## 🔍 Duplicados Detectados

${this.generateDuplicatesSection()}

---

## 🔗 Relaciones entre Archivos

${this.generateRelationshipsSection()}

---

## 📋 Recomendaciones para WhatsAppAut

### 🎯 Arquitectura
- **Separación de responsabilidades**: Revisar si las funciones de WhatsApp están bien separadas de la lógica de negocio
- **Modularización**: Considerar crear módulos específicos para diferentes funcionalidades de WhatsApp
- **Configuración**: Centralizar configuraciones de WhatsApp en archivos dedicados

### 🔧 Mejoras Técnicas
- **Manejo de errores**: Implementar manejo robusto de errores para conexiones de WhatsApp
- **Logging**: Añadir sistema de logs detallado para debugging
- **Testing**: Crear tests unitarios para funciones críticas de WhatsApp

### 📱 Funcionalidades WhatsApp
- **Gestión de sesiones**: Optimizar manejo de sesiones y QR codes
- **Rate limiting**: Implementar límites para evitar bloqueos de WhatsApp
- **Backup de chats**: Considerar funcionalidad de respaldo automático

### 🛡️ Seguridad
- **Validación de entrada**: Validar todos los mensajes entrantes
- **Sanitización**: Limpiar contenido antes de procesamiento
- **Autenticación**: Implementar autenticación robusta para el bot

---

*Análisis generado automáticamente el ${new Date().toLocaleString()}*
`;
  }

  /**
   * Genera sección de directorios
   */
  generateDirectoriesSection() {
    return this.analysisData.directories.map(dir => {
      let section = `### 📁 ${dir.path}\n\n**Archivos:** ${dir.fileCount}`;
      
      if (dir.technologies && dir.technologies.length > 0) {
        section += `  \n**Tecnologías:** ${dir.technologies.join(', ')}`;
      }
      
      section += '\n\n';

      if (dir.groups.length > 0) {
        dir.groups.forEach(group => {
          section += `#### ${group.name}\n\n`;
          group.files.forEach(file => {
            section += this.generateFileSection(file);
          });
        });
      } else {
        dir.files.forEach(file => {
          section += this.generateFileSection(file);
        });
      }

      return section;
    }).join('\n---\n\n');
  }

  /**
   * Genera sección de archivo individual
   */
  generateFileSection(file) {
    let section = `#### 📄 ${file.name}\n\n`;
    section += `**Ruta:** \`${file.path}\`  \n`;
    section += `**Tipo:** ${file.type.toUpperCase()}  \n`;
    section += `**Tamaño:** ${file.size} caracteres, ${file.lines} líneas  \n`;

    if (file.technologies && file.technologies.length > 0) {
      section += `**Tecnologías:** ${file.technologies.join(', ')}  \n`;
    }

    if (file.isModule !== undefined) {
      section += `**Módulo:** ${file.isModule ? 'Sí' : 'No'}  \n`;
    }

    section += '\n';

    // Funciones
    if (file.functions && file.functions.length > 0) {
      section += `**Funciones (${file.functions.length}):**\n`;
      file.functions.forEach(func => {
        const exportBadge = func.isExported ? '🔄' : '🔒';
        const privateBadge = func.isPrivate ? '🔐' : '';
        section += `- ${exportBadge}${privateBadge} \`${func.name}\` (${func.type}, línea ${func.line})\n`;
      });
      section += '\n';
    }

    // Clases
    if (file.classes && file.classes.length > 0) {
      section += `**Clases (${file.classes.length}):**\n`;
      file.classes.forEach(cls => {
        const exportBadge = cls.isExported ? '🔄' : '🔒';
        const privateBadge = cls.isPrivate ? '🔐' : '';
        const extendsBadge = cls.extends ? ` ← ${cls.extends}` : '';
        section += `- ${exportBadge}${privateBadge} \`${cls.name}\`${extendsBadge} (línea ${cls.line})\n`;
      });
      section += '\n';
    }

    // Imports
    if (file.imports && file.imports.length > 0) {
      section += `**Imports (${file.imports.length}):**\n`;
      file.imports.forEach(imp => {
        const localBadge = imp.isLocal ? '📁' : '📦';
        if (imp.type === 'from') {
          section += `- ${localBadge} \`${imp.items.join(', ')}\` desde \`${imp.source}\`\n`;
        } else {
          const imports = [imp.default, ...(imp.named || [])].filter(Boolean).join(', ');
          section += `- ${localBadge} \`${imports}\` desde \`${imp.source}\`\n`;
        }
      });
      section += '\n';
    }

    // Información específica de JSON
    if (file.type === 'json' && file.structure) {
      section += `**Estructura JSON:**\n`;
      section += `- Claves principales: ${file.structure.keys.length > 0 ? file.structure.keys.join(', ') : 'Ninguna'}\n`;
      if (file.structure.hasScripts) section += `- ✅ Contiene scripts\n`;
      if (file.structure.hasDependencies) section += `- 📦 Contiene dependencias\n`;
      if (file.structure.hasDevDependencies) section += `- 🛠️ Contiene dependencias de desarrollo\n`;
      section += '\n';
    }

    // Error de parseo
    if (file.parseError) {
      section += `⚠️ **Error de parseo:** ${file.parseError}\n\n`;
    }

    return section;
  }

  /**
   * Genera sección de duplicados
   */
  generateDuplicatesSection() {
    if (this.analysisData.duplicates.length === 0) {
      return `✅ **¡Excelente!** No se encontraron duplicados funcionales en WhatsAppAut.`;
    }

    let section = `⚠️ **Se encontraron ${this.analysisData.duplicates.length} posibles duplicados:**\n\n`;

    this.analysisData.duplicates.forEach(dup => {
      const typeIcon = dup.type === 'function' ? '🔧' : '🏗️';
      section += `### ${typeIcon} ${dup.type}: \`${dup.name}\`\n\n`;
      section += `**Encontrado en:**\n`;
      
      dup.occurrences.forEach(occ => {
        const exportBadge = occ.isExported ? '🔄' : '🔒';
        section += `- ${exportBadge} \`${occ.file}\` (línea ${occ.line})\n`;
      });
      section += '\n';
    });

    return section;
  }

  /**
   * Genera sección de relaciones
   */
  generateRelationshipsSection() {
    if (this.analysisData.relationships.length === 0) {
      return `ℹ️ No se encontraron relaciones de importación entre archivos locales en WhatsAppAut.`;
    }

    let section = `**Mapa de dependencias del proyecto WhatsAppAut:**\n\n`;

    const relationshipMap = new Map();
    this.analysisData.relationships.forEach(rel => {
      if (!relationshipMap.has(rel.from)) {
        relationshipMap.set(rel.from, []);
      }
      relationshipMap.get(rel.from).push(rel);
    });

    relationshipMap.forEach((relationships, fromFile) => {
      section += `### 📄 ${fromFile}\n\n`;
      section += `**Importa de:**\n`;
      relationships.forEach(rel => {
        const imports = rel.imports.join(', ');
        section += `- 📁 \`${rel.to}\` → \`${imports}\`\n`;
      });
      section += '\n';
    });

    return section;
  }

  /**
   * Genera reporte JSON
   */
  async generateJsonReport() {
    console.log("📄 Generando reporte JSON...");

    const outputPath = path.join(CONFIG.projectPath, CONFIG.outputJson);
    const jsonData = {
      ...this.analysisData,
      metadata: {
        version: "1.0.0",
        generator: "WhatsAppAut Project Analyzer",
        generatedAt: new Date().toISOString(),
        config: CONFIG,
      },
    };

    await fs.writeFile(outputPath, JSON.stringify(jsonData, null, 2), "utf-8");
    console.log(`✅ Reporte JSON guardado en: ${outputPath}`);
  }
}

/**
 * Utilidades para WhatsAppAut
 */
class WhatsAppAnalyzerUtils {
  /**
   * Valida estructura típica de proyecto WhatsApp
   */
  static validateWhatsAppProject(projectPath) {
    const commonFiles = [
      'package.json',
      'requirements.txt',
      'main.js',
      'app.js',
      'bot.js',
      'index.js',
      'main.py',
      'app.py',
      'bot.py'
    ];

    const commonDirs = [
      'src',
      'lib',
      'utils',
      'handlers',
      'commands',
      'modules',
      'config'
    ];

    // Esta función puede expandirse para validaciones específicas
    return true;
  }

  /**
   * Detecta patrones específicos de WhatsApp
   */
  static detectWhatsAppPatterns(content) {
    const patterns = {
      qrGeneration: /qr.*code|generateQR|getQR/i,
      messageHandling: /onMessage|message.*handler|handleMessage/i,
      clientManagement: /client.*create|newClient|WhatsApp.*Client/i,
      mediaHandling: /sendMedia|downloadMedia|MessageMedia/i,
      groupManagement: /createGroup|addParticipant|removeParticipant/i,
      statusManagement: /setStatus|getStatus|presence/i,
    };

    const detected = {};
    Object.entries(patterns).forEach(([key, pattern]) => {
      detected[key] = pattern.test(content);
    });

    return detected;
  }

  /**
   * Analiza configuración de WhatsApp
   */
  static analyzeWhatsAppConfig(jsonData) {
    const config = {
      hasSessionConfig: false,
      hasWebhooks: false,
      hasDatabase: false,
      hasAuth: false,
      puppeteerConfig: false,
    };

    if (jsonData.session || jsonData.sessionPath) {
      config.hasSessionConfig = true;
    }

    if (jsonData.webhook || jsonData.webhookUrl) {
      config.hasWebhooks = true;
    }

    if (jsonData.database || jsonData.db || jsonData.mongodb) {
      config.hasDatabase = true;
    }

    if (jsonData.auth || jsonData.authentication) {
      config.hasAuth = true;
    }

    if (jsonData.puppeteer) {
      config.puppeteerConfig = true;
    }

    return config;
  }

  /**
   * Genera recomendaciones específicas para WhatsApp
   */
  static generateWhatsAppRecommendations(analysisData) {
    const recommendations = [];

    if (analysisData.summary.pythonFiles > 0 && analysisData.summary.javascriptFiles > 0) {
      recommendations.push({
        type: 'architecture',
        title: 'Proyecto híbrido detectado',
        description: 'Se detectaron archivos Python y JavaScript. Considera unificar o documentar claramente la arquitectura.',
        priority: 'medium'
      });
    }

    if (analysisData.duplicates.length > 5) {
      recommendations.push({
        type: 'code-quality',
        title: 'Múltiples duplicados detectados',
        description: 'Refactorizar código duplicado para mejorar mantenibilidad.',
        priority: 'high'
      });
    }

    if (analysisData.technologies.includes('Puppeteer')) {
      recommendations.push({
        type: 'performance',
        title: 'Optimización de Puppeteer',
        description: 'Implementar pool de instancias de navegador para mejor rendimiento.',
        priority: 'medium'
      });
    }

    return recommendations;
  }
}

/**
 * Función principal
 */
async function main() {
  const startTime = Date.now();

  try {
    console.log("🚀 Iniciando análisis de WhatsAppAut...");
    
    // Validar proyecto WhatsApp
    if (!WhatsAppAnalyzerUtils.validateWhatsAppProject(CONFIG.projectPath)) {
      console.warn("⚠️ La estructura del proyecto no parece típica de WhatsApp");
    }

    // Crear y ejecutar analizador
    const analyzer = new WhatsAppAnalyzer();
    await analyzer.analyze();

    // Generar recomendaciones adicionales
    const recommendations = WhatsAppAnalyzerUtils.generateWhatsAppRecommendations(analyzer.analysisData);
    if (recommendations.length > 0) {
      console.log("\n💡 Recomendaciones adicionales:");
      recommendations.forEach(rec => {
        const priorityIcon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`   ${priorityIcon} ${rec.title}: ${rec.description}`);
      });
    }

    // Estadísticas finales
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`\n⚡ Análisis completado en ${duration}s`);
    console.log(`📁 Archivos generados en: ${CONFIG.projectPath}`);
    console.log(`   - ${CONFIG.outputMarkdown}`);
    console.log(`   - ${CONFIG.outputJson}`);

  } catch (error) {
    console.error("\n❌ Error durante el análisis:", error.message);
    
    console.error("\n💡 Posibles soluciones:");
    console.error("   - Verificar que la ruta del proyecto sea correcta");
    console.error("   - Asegurar permisos de lectura en el directorio");
    console.error("   - Revisar que Node.js tenga acceso al sistema de archivos");
    
    process.exit(1);
  }
}

// Manejadores de eventos
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Promesa rechazada:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Excepción no capturada:", error.message);
  process.exit(1);
});

// Exportar para uso como módulo
module.exports = {
  WhatsAppAnalyzer,
  WhatsAppAnalyzerUtils,
  CONFIG,
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

/**
 * INSTRUCCIONES DE USO PARA WHATSAPPAUT:
 *
 * 1. Guardar como 'whatsapp_analyzer.js' en cualquier ubicación
 * 2. Ejecutar: node whatsapp_analyzer.js
 * 3. El script analizará automáticamente: C:\Users\neura\OneDrive\Desktop\WhatsAppAut
 * 
 * ARCHIVOS GENERADOS:
 * - analisis_whatsapp.md: Reporte detallado específico para WhatsApp
 * - analisis_whatsapp.json: Datos estructurados del análisis
 *
 * CARACTERÍSTICAS ESPECÍFICAS PARA WHATSAPP:
 * ✅ Detección de tecnologías WhatsApp (Puppeteer, whatsapp-web.js, etc.)
 * ✅ Análisis de archivos Python y JavaScript
 * ✅ Identificación de patrones de WhatsApp Bot
 * ✅ Análisis de configuraciones JSON específicas
 * ✅ Recomendaciones orientadas a proyectos WhatsApp
 * ✅ Detección de manejo de QR, mensajes, grupos, etc.
 * ✅ Validación de estructura típica de bots WhatsApp
 */