#!/usr/bin/env node

/**
 * Analizador de Proyecto JavaScript
 * Analiza todos los archivos .js del proyecto para detectar duplicaciones,
 * funciones únicas, archivos obsoletos y relaciones entre archivos.
 * 
 * @author Script generado por Claude
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Configuración del analizador
const CONFIG = {
    // Ruta del proyecto a analizar
    projectPath: 'C:\\Users\\neura\\OneDrive\\Desktop\\BotAut-refactor-orchestration-core',
    
    // Archivos de salida
    outputMarkdown: 'analisis.md',
    outputJson: 'analisis.json',
    
    // Carpetas a excluir completamente
    excludedDirs: [
        'node_modules',
        '.venv',
        '.git',
        'dist',
        'build',
        'out',
        '.next',
        '.nuxt',
        'coverage',
        '.nyc_output',
        'temp',
        'tmp'
    ],
    
    // Límites de seguridad
    maxFilesPerDir: 500,
    maxFileSize: 1024 * 1024, // 1MB
    
    // Configuración de agrupamiento
    filesPerGroup: 5,
    maxFilesBeforeGrouping: 5
};

/**
 * Clase principal del analizador
 */
class ProjectAnalyzer {
    constructor() {
        this.analysisData = {
            projectPath: CONFIG.projectPath,
            timestamp: new Date().toISOString(),
            summary: {
                totalDirectories: 0,
                totalJsFiles: 0,
                totalFunctions: 0,
                totalClasses: 0,
                totalImports: 0
            },
            directories: [],
            duplicates: [],
            relationships: []
        };
        
        this.allFunctions = new Map(); // Para detectar duplicados
        this.allClasses = new Map();
        this.fileRelationships = new Map();
    }

    /**
     * Inicia el análisis completo del proyecto
     */
    async analyze() {
        try {
            console.log('🚀 Iniciando análisis del proyecto...');
            console.log(`📁 Ruta: ${CONFIG.projectPath}`);
            
            // Verificar que la ruta existe
            await this.validateProjectPath();
            
            // Analizar el proyecto
            await this.analyzeDirectory(CONFIG.projectPath);
            
            // Detectar duplicados y relaciones
            this.detectDuplicates();
            this.buildRelationships();
            
            // Generar archivos de salida
            await this.generateMarkdownReport();
            await this.generateJsonReport();
            
            console.log('✅ Análisis completado exitosamente!');
            console.log(`📊 Resumen:`);
            console.log(`   - Directorios analizados: ${this.analysisData.summary.totalDirectories}`);
            console.log(`   - Archivos .js encontrados: ${this.analysisData.summary.totalJsFiles}`);
            console.log(`   - Funciones encontradas: ${this.analysisData.summary.totalFunctions}`);
            console.log(`   - Clases encontradas: ${this.analysisData.summary.totalClasses}`);
            console.log(`   - Duplicados detectados: ${this.analysisData.duplicates.length}`);
            
        } catch (error) {
            console.error('❌ Error durante el análisis:', error.message);
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
                throw new Error('La ruta especificada no es un directorio');
            }
        } catch (error) {
            throw new Error(`No se puede acceder a la ruta del proyecto: ${error.message}`);
        }
    }

    /**
     * Analiza un directorio recursivamente
     */
    async analyzeDirectory(dirPath, relativePath = '') {
        try {
            const items = await fs.readdir(dirPath, { withFileTypes: true });
            
            // Verificar si tiene demasiados archivos
            if (items.length > CONFIG.maxFilesPerDir) {
                console.log(`⚠️  Saltando directorio con ${items.length} archivos: ${relativePath || 'raíz'}`);
                return;
            }

            const jsFiles = [];
            const subdirectories = [];

            // Separar archivos .js de subdirectorios
            for (const item of items) {
                const itemPath = path.join(dirPath, item.name);
                const relativeItemPath = path.join(relativePath, item.name);

                if (item.isDirectory()) {
                    // Verificar si el directorio debe ser excluido
                    if (!this.shouldExcludeDirectory(item.name)) {
                        subdirectories.push({ path: itemPath, relativePath: relativeItemPath });
                    }
                } else if (item.isFile() && item.name.endsWith('.js')) {
                    // Excluir archivos de análisis y salida
                    if (!this.shouldExcludeFile(item.name)) {
                        jsFiles.push({ path: itemPath, relativePath: relativeItemPath, name: item.name });
                    }
                }
            }

            // Analizar archivos .js del directorio actual
            if (jsFiles.length > 0) {
                await this.analyzeJsFiles(dirPath, relativePath || 'raíz', jsFiles);
            }

            // Analizar subdirectorios recursivamente
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
        return CONFIG.excludedDirs.includes(dirName) || 
               dirName.startsWith('.') ||
               dirName.toLowerCase().includes('cache') ||
               dirName.toLowerCase().includes('log');
    }

    /**
     * Verifica si un archivo debe ser excluido
     */
    shouldExcludeFile(fileName) {
        return fileName === CONFIG.outputMarkdown ||
               fileName === CONFIG.outputJson ||
               fileName.includes('analisis') ||
               fileName.includes('analysis') ||
               fileName.startsWith('.');
    }

    /**
     * Analiza archivos .js de un directorio
     */
    async analyzeJsFiles(dirPath, relativePath, jsFiles) {
        console.log(`📂 Analizando: ${relativePath} (${jsFiles.length} archivos)`);
        
        const directoryData = {
            path: relativePath,
            fileCount: jsFiles.length,
            files: [],
            groups: []
        };

        // Dividir en grupos si hay muchos archivos
        if (jsFiles.length > CONFIG.maxFilesBeforeGrouping) {
            const groups = this.createFileGroups(jsFiles);
            for (let i = 0; i < groups.length; i++) {
                const group = {
                    name: `Grupo ${i + 1}`,
                    files: []
                };
                
                for (const file of groups[i]) {
                    const fileData = await this.analyzeJsFile(file.path, file.relativePath);
                    if (fileData) {
                        group.files.push(fileData);
                        directoryData.files.push(fileData);
                    }
                }
                directoryData.groups.push(group);
            }
        } else {
            // Analizar archivos directamente
            for (const file of jsFiles) {
                const fileData = await this.analyzeJsFile(file.path, file.relativePath);
                if (fileData) {
                    directoryData.files.push(fileData);
                }
            }
        }

        if (directoryData.files.length > 0) {
            this.analysisData.directories.push(directoryData);
            this.analysisData.summary.totalDirectories++;
        }
    }

    /**
     * Crea grupos de archivos para directorios con muchos archivos
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
     * Analiza un archivo .js individual
     */
    async analyzeJsFile(filePath, relativePath) {
        try {
            const stats = await fs.stat(filePath);
            
            // Verificar tamaño del archivo
            if (stats.size > CONFIG.maxFileSize) {
                console.log(`⚠️  Archivo demasiado grande, saltando: ${relativePath}`);
                return null;
            }

            const content = await fs.readFile(filePath, 'utf-8');
            const analysis = this.parseJsFile(content, relativePath);
            
            this.analysisData.summary.totalJsFiles++;
            this.analysisData.summary.totalFunctions += analysis.functions.length;
            this.analysisData.summary.totalClasses += analysis.classes.length;
            this.analysisData.summary.totalImports += analysis.imports.length;

            // Registrar funciones y clases para detección de duplicados
            this.registerFunctions(analysis.functions, relativePath);
            this.registerClasses(analysis.classes, relativePath);
            this.registerImports(analysis.imports, relativePath);

            return analysis;

        } catch (error) {
            console.error(`❌ Error analizando archivo ${relativePath}: ${error.message}`);
            return null;
        }
    }

    /**
     * Parsea un archivo JavaScript y extrae información
     */
    parseJsFile(content, filePath) {
        const analysis = {
            name: path.basename(filePath),
            path: filePath,
            size: content.length,
            lines: content.split('\n').length,
            functions: [],
            classes: [],
            imports: [],
            exports: [],
            hasExports: false,
            isModule: false
        };

        try {
            // Detectar si es un módulo
            analysis.isModule = content.includes('module.exports') || 
                              content.includes('export ') || 
                              content.includes('import ');

            // Extraer funciones
            analysis.functions = this.extractFunctions(content);
            
            // Extraer clases
            analysis.classes = this.extractClasses(content);
            
            // Extraer imports
            analysis.imports = this.extractImports(content);
            
            // Extraer exports
            analysis.exports = this.extractExports(content);
            analysis.hasExports = analysis.exports.length > 0;

        } catch (error) {
            console.error(`Error parseando ${filePath}: ${error.message}`);
        }

        return analysis;
    }

    /**
     * Extrae funciones del contenido del archivo
     */
    extractFunctions(content) {
        const functions = [];
        const patterns = [
            // function declaration
            /function\s+(\w+)\s*\([^)]*\)\s*\{/g,
            // arrow functions con nombre
            /(?:const|let|var)\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g,
            // arrow functions sin paréntesis
            /(?:const|let|var)\s+(\w+)\s*=\s*\w+\s*=>/g,
            // métodos en objetos
            /(\w+)\s*:\s*function\s*\([^)]*\)\s*\{/g,
            // métodos modernos
            /(\w+)\s*\([^)]*\)\s*\{/g
        ];

        patterns.forEach((pattern, index) => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const name = match[1];
                if (name && !functions.some(f => f.name === name)) {
                    functions.push({
                        name: name,
                        type: this.getFunctionType(match[0]),
                        line: content.substring(0, match.index).split('\n').length,
                        isExported: this.isExported(content, name)
                    });
                }
            }
        });

        return functions;
    }

    /**
     * Extrae clases del contenido del archivo
     */
    extractClasses(content) {
        const classes = [];
        const classPattern = /class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{/g;
        
        let match;
        while ((match = classPattern.exec(content)) !== null) {
            classes.push({
                name: match[1],
                extends: match[2] || null,
                line: content.substring(0, match.index).split('\n').length,
                isExported: this.isExported(content, match[1]),
                methods: this.extractClassMethods(content, match.index)
            });
        }

        return classes;
    }

    /**
     * Extrae métodos de una clase
     */
    extractClassMethods(content, classStart) {
        const methods = [];
        const classContent = this.getClassContent(content, classStart);
        
        const methodPattern = /(\w+)\s*\([^)]*\)\s*\{/g;
        let match;
        while ((match = methodPattern.exec(classContent)) !== null) {
            const methodName = match[1];
            if (methodName !== 'constructor' && !methods.some(m => m.name === methodName)) {
                methods.push({
                    name: methodName,
                    isConstructor: methodName === 'constructor',
                    isStatic: classContent.substring(0, match.index).includes('static')
                });
            }
        }

        return methods;
    }

    /**
     * Obtiene el contenido de una clase
     */
    getClassContent(content, start) {
        let braceCount = 0;
        let i = start;
        
        // Encontrar la llave de apertura
        while (i < content.length && content[i] !== '{') {
            i++;
        }
        
        const classStart = i;
        braceCount = 1;
        i++;
        
        // Encontrar la llave de cierre correspondiente
        while (i < content.length && braceCount > 0) {
            if (content[i] === '{') braceCount++;
            else if (content[i] === '}') braceCount--;
            i++;
        }
        
        return content.substring(classStart, i);
    }

    /**
     * Extrae imports del contenido del archivo
     */
    extractImports(content) {
        const imports = [];
        const patterns = [
            // import statements
            /import\s+(?:(\w+)(?:\s*,\s*)?)?(?:\{([^}]+)\})?\s+from\s+['"]([^'"]+)['"]/g,
            // require statements
            /(?:const|let|var)\s+(?:(\w+)|\{([^}]+)\})\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
        ];

        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const defaultImport = match[1];
                const namedImports = match[2];
                const source = match[3];

                imports.push({
                    source: source,
                    default: defaultImport || null,
                    named: namedImports ? namedImports.split(',').map(s => s.trim()) : [],
                    line: content.substring(0, match.index).split('\n').length,
                    isLocal: source.startsWith('./') || source.startsWith('../')
                });
            }
        });

        return imports;
    }

    /**
     * Extrae exports del contenido del archivo
     */
    extractExports(content) {
        const exports = [];
        const patterns = [
            // export default
            /export\s+default\s+(\w+|class\s+\w+|function\s+\w+)/g,
            // export named
            /export\s+(?:const|let|var|function|class)\s+(\w+)/g,
            // export list
            /export\s+\{([^}]+)\}/g,
            // module.exports
            /module\.exports\s*=\s*(\w+|{[^}]*})/g
        ];

        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                exports.push({
                    name: match[1],
                    type: this.getExportType(match[0]),
                    line: content.substring(0, match.index).split('\n').length
                });
            }
        });

        return exports;
    }

    /**
     * Determina el tipo de función
     */
    getFunctionType(declaration) {
        if (declaration.includes('function')) return 'function';
        if (declaration.includes('=>')) return 'arrow';
        if (declaration.includes(':')) return 'method';
        return 'unknown';
    }

    /**
     * Determina el tipo de export
     */
    getExportType(exportDeclaration) {
        if (exportDeclaration.includes('default')) return 'default';
        if (exportDeclaration.includes('module.exports')) return 'commonjs';
        return 'named';
    }

    /**
     * Verifica si un elemento está exportado
     */
    isExported(content, name) {
        const exportPatterns = [
            new RegExp(`export\\s+(?:default\\s+)?(?:const|let|var|function|class)\\s+${name}\\b`),
            new RegExp(`export\\s+\\{[^}]*\\b${name}\\b[^}]*\\}`),
            new RegExp(`module\\.exports\\s*=\\s*${name}\\b`),
            new RegExp(`module\\.exports\\.${name}\\b`)
        ];

        return exportPatterns.some(pattern => pattern.test(content));
    }

    /**
     * Registra funciones para detección de duplicados
     */
    registerFunctions(functions, filePath) {
        functions.forEach(func => {
            if (!this.allFunctions.has(func.name)) {
                this.allFunctions.set(func.name, []);
            }
            this.allFunctions.get(func.name).push({
                ...func,
                file: filePath
            });
        });
    }

    /**
     * Registra clases para detección de duplicados
     */
    registerClasses(classes, filePath) {
        classes.forEach(cls => {
            if (!this.allClasses.has(cls.name)) {
                this.allClasses.set(cls.name, []);
            }
            this.allClasses.get(cls.name).push({
                ...cls,
                file: filePath
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
     * Detecta duplicados funcionales
     */
    detectDuplicates() {
        console.log('🔍 Detectando duplicados...');
        
        // Duplicados de funciones
        this.allFunctions.forEach((occurrences, name) => {
            if (occurrences.length > 1) {
                this.analysisData.duplicates.push({
                    type: 'function',
                    name: name,
                    occurrences: occurrences.map(occ => ({
                        file: occ.file,
                        line: occ.line,
                        isExported: occ.isExported
                    }))
                });
            }
        });

        // Duplicados de clases
        this.allClasses.forEach((occurrences, name) => {
            if (occurrences.length > 1) {
                this.analysisData.duplicates.push({
                    type: 'class',
                    name: name,
                    occurrences: occurrences.map(occ => ({
                        file: occ.file,
                        line: occ.line,
                        isExported: occ.isExported
                    }))
                });
            }
        });
    }

    /**
     * Construye relaciones entre archivos
     */
    buildRelationships() {
        console.log('🔗 Construyendo relaciones...');
        
        this.fileRelationships.forEach((imports, filePath) => {
            imports.forEach(imp => {
                if (imp.isLocal) {
                    this.analysisData.relationships.push({
                        from: filePath,
                        to: imp.source,
                        type: 'import',
                        imports: imp.named.length > 0 ? imp.named : [imp.default].filter(Boolean)
                    });
                }
            });
        });
    }

    /**
     * Genera el reporte en Markdown
     */
    async generateMarkdownReport() {
        console.log('📝 Generando reporte Markdown...');
        
        const outputPath = path.join(CONFIG.projectPath, CONFIG.outputMarkdown);
        let markdown = this.generateMarkdownHeader();
        
        // Resumen
        markdown += this.generateMarkdownSummary();
        
        // Análisis por directorio
        markdown += this.generateMarkdownDirectories();
        
        // Duplicados
        markdown += this.generateMarkdownDuplicates();
        
        // Relaciones
        markdown += this.generateMarkdownRelationships();
        
        // Footer
        markdown += this.generateMarkdownFooter();
        
        await fs.writeFile(outputPath, markdown, 'utf-8');
        console.log(`✅ Reporte Markdown guardado en: ${outputPath}`);
    }

    /**
     * Genera la cabecera del reporte Markdown
     */
    generateMarkdownHeader() {
        return `# 📊 Análisis de Proyecto JavaScript

**Proyecto:** ${CONFIG.projectPath}  
**Fecha de análisis:** ${new Date().toLocaleString()}  
**Generado por:** Analizador de Proyecto JavaScript

---

`;
    }

    /**
     * Genera el resumen del análisis
     */
    generateMarkdownSummary() {
        const summary = this.analysisData.summary;
        return `## 📈 Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| **Directorios analizados** | ${summary.totalDirectories} |
| **Archivos .js encontrados** | ${summary.totalJsFiles} |
| **Funciones totales** | ${summary.totalFunctions} |
| **Clases totales** | ${summary.totalClasses} |
| **Imports totales** | ${summary.totalImports} |
| **Duplicados detectados** | ${this.analysisData.duplicates.length} |
| **Relaciones entre archivos** | ${this.analysisData.relationships.length} |

---

`;
    }

    /**
     * Genera el análisis de directorios
     */
    generateMarkdownDirectories() {
        let markdown = `## 📂 Análisis por Directorio

`;

        this.analysisData.directories.forEach(dir => {
            markdown += `### 📁 ${dir.path}

**Archivos encontrados:** ${dir.fileCount}

`;

            if (dir.groups.length > 0) {
                // Directorio con grupos
                dir.groups.forEach(group => {
                    markdown += `#### ${group.name}

`;
                    group.files.forEach(file => {
                        markdown += this.generateFileAnalysis(file);
                    });
                });
            } else {
                // Directorio sin grupos
                dir.files.forEach(file => {
                    markdown += this.generateFileAnalysis(file);
                });
            }

            markdown += `---

`;
        });

        return markdown;
    }

    /**
     * Genera el análisis de un archivo individual
     */
    generateFileAnalysis(file) {
        let markdown = `#### 📄 ${file.name}

**Ruta:** \`${file.path}\`  
**Tamaño:** ${file.size} caracteres, ${file.lines} líneas  
**Tipo:** ${file.isModule ? 'Módulo ES6/CommonJS' : 'Script'} ${file.hasExports ? '(con exports)' : ''}

`;

        // Funciones
        if (file.functions.length > 0) {
            markdown += `**Funciones (${file.functions.length}):**
`;
            file.functions.forEach(func => {
                const exportBadge = func.isExported ? '🔄' : '🔒';
                markdown += `- ${exportBadge} \`${func.name}\` (${func.type}, línea ${func.line})
`;
            });
            markdown += `
`;
        }

        // Clases
        if (file.classes.length > 0) {
            markdown += `**Clases (${file.classes.length}):**
`;
            file.classes.forEach(cls => {
                const exportBadge = cls.isExported ? '🔄' : '🔒';
                const extendsBadge = cls.extends ? ` ← ${cls.extends}` : '';
                markdown += `- ${exportBadge} \`${cls.name}\`${extendsBadge} (línea ${cls.line})
`;
                if (cls.methods.length > 0) {
                    markdown += `  - Métodos: ${cls.methods.map(m => `\`${m.name}\``).join(', ')}
`;
                }
            });
            markdown += `
`;
        }

        // Imports
        if (file.imports.length > 0) {
            markdown += `**Imports (${file.imports.length}):**
`;
            file.imports.forEach(imp => {
                const localBadge = imp.isLocal ? '📁' : '📦';
                const imports = [imp.default, ...imp.named].filter(Boolean).join(', ');
                markdown += `- ${localBadge} \`${imports}\` desde \`${imp.source}\`
`;
            });
            markdown += `
`;
        }

        // Exports
        if (file.exports.length > 0) {
            markdown += `**Exports (${file.exports.length}):**
`;
            file.exports.forEach(exp => {
                markdown += `- 🔄 \`${exp.name}\` (${exp.type})
`;
            });
            markdown += `
`;
        }

        return markdown;
    }

    /**
     * Genera el análisis de duplicados
     */
    generateMarkdownDuplicates() {
        let markdown = `## 🔍 Duplicados Detectados

`;

        if (this.analysisData.duplicates.length === 0) {
            markdown += `✅ **¡Excelente!** No se encontraron duplicados funcionales.

`;
        } else {
            markdown += `⚠️ **Se encontraron ${this.analysisData.duplicates.length} posibles duplicados:**

`;

            this.analysisData.duplicates.forEach(dup => {
                const typeIcon = dup.type === 'function' ? '🔧' : '🏗️';
                markdown += `### ${typeIcon} ${dup.type}: \`${dup.name}\`

**Encontrado en:**
`;
                dup.occurrences.forEach(occ => {
                    const exportBadge = occ.isExported ? '🔄' : '🔒';
                    markdown += `- ${exportBadge} \`${occ.file}\` (línea ${occ.line})
`;
                });
                markdown += `
`;
            });
        }

        markdown += `---

`;
        return markdown;
    }

    /**
     * Genera el análisis de relaciones
     */
    generateMarkdownRelationships() {
        let markdown = `## 🔗 Relaciones entre Archivos

`;

        if (this.analysisData.relationships.length === 0) {
            markdown += `ℹ️ No se encontraron relaciones de importación entre archivos locales.

`;
        } else {
            markdown += `**Mapa de dependencias locales:**

`;

            const relationshipMap = new Map();
            this.analysisData.relationships.forEach(rel => {
                if (!relationshipMap.has(rel.from)) {
                    relationshipMap.set(rel.from, []);
                }
                relationshipMap.get(rel.from).push(rel);
            });

            relationshipMap.forEach((relationships, fromFile) => {
                markdown += `### 📄 ${fromFile}

**Importa de:**
`;
                relationships.forEach(rel => {
                    const imports = rel.imports.join(', ');
                    markdown += `- 📁 \`${rel.to}\` → \`${imports}\`
`;
                });
                markdown += `
`;
            });
        }

        markdown += `---

`;
        return markdown;
    }

    /**
     * Genera el footer del reporte
     */
    generateMarkdownFooter() {
        return `## 📋 Notas y Recomendaciones

### 🎯 Interpretación de Símbolos

- 🔄 **Exportado:** Función/clase disponible para otros archivos
- 🔒 **Interno:** Función/clase solo para uso interno
- 📁 **Import local:** Importación desde archivo del proyecto
- 📦 **Import externo:** Importación desde node_modules
- 🔧 **Función:** Función JavaScript
- 🏗️ **Clase:** Clase JavaScript

### 💡 Recomendaciones

1. **Duplicados:** Revisar los duplicados detectados para:
   - Consolidar funciones idénticas
   - Crear utilidades compartidas
   - Eliminar código redundante

2. **Estructura:** Considerar:
   - Separar funciones grandes en módulos
   - Crear un index.js principal para exports
   - Documentar APIs públicas

3. **Mantenimiento:** 
   - Ejecutar este análisis periódicamente
   - Revisar archivos sin exports (posibles obsoletos)
   - Validar que las dependencias locales sean necesarias

---

*Análisis generado automáticamente el ${new Date().toLocaleString()}*
`;
    }

    /**
     * Genera el reporte en formato JSON
     */
    async generateJsonReport() {
        console.log('📄 Generando reporte JSON...');
        
        const outputPath = path.join(CONFIG.projectPath, CONFIG.outputJson);
        const jsonData = {
            ...this.analysisData,
            metadata: {
                version: '1.0.0',
                generator: 'JavaScript Project Analyzer',
                generatedAt: new Date().toISOString(),
                config: CONFIG
            }
        };
        
        await fs.writeFile(outputPath, JSON.stringify(jsonData, null, 2), 'utf-8');
        console.log(`✅ Reporte JSON guardado en: ${outputPath}`);
    }
}

/**
 * Utilidades adicionales
 */
class AnalyzerUtils {
    /**
     * Verifica si Node.js tiene las dependencias necesarias
     */
    static checkDependencies() {
        const requiredModules = ['fs', 'path'];
        const missingModules = [];

        requiredModules.forEach(module => {
            try {
                require(module);
            } catch (error) {
                missingModules.push(module);
            }
        });

        if (missingModules.length > 0) {
            throw new Error(`Módulos faltantes: ${missingModules.join(', ')}`);
        }
    }

    /**
     * Muestra ayuda de uso
     */
    static showHelp() {
        console.log(`
🚀 Analizador de Proyecto JavaScript

DESCRIPCIÓN:
  Analiza recursivamente todos los archivos .js de un proyecto para:
  - Detectar duplicaciones funcionales
  - Documentar funciones, clases y relaciones
  - Identificar archivos obsoletos
  - Generar reportes detallados

USO:
  node analyzer.js [opciones]

OPCIONES:
  --help, -h     Muestra esta ayuda
  --path, -p     Especifica la ruta del proyecto (por defecto: configuración)
  --output, -o   Especifica el archivo de salida (por defecto: analisis.md)
  --json, -j     Genera también salida en JSON
  --verbose, -v  Modo verboso

EJEMPLOS:
  node analyzer.js
  node analyzer.js --path /ruta/al/proyecto
  node analyzer.js --output mi-analisis.md --json

CONFIGURACIÓN:
  Edita la constante CONFIG al inicio del archivo para:
  - Cambiar la ruta del proyecto
  - Ajustar carpetas excluidas
  - Modificar límites de seguridad

ARCHIVOS GENERADOS:
  - analisis.md: Reporte detallado en Markdown
  - analisis.json: Datos estructurados para análisis programático

CARPETAS EXCLUIDAS:
  node_modules, .venv, .git, dist, build, out, .next, .nuxt, coverage, etc.

LÍMITES DE SEGURIDAD:
  - Máximo 500 archivos por directorio
  - Máximo 1MB por archivo
  - Exclusión automática de archivos ocultos

Para más información: https://github.com/tu-usuario/js-analyzer
        `);
    }

    /**
     * Parsea argumentos de línea de comandos
     */
    static parseArguments() {
        const args = process.argv.slice(2);
        const options = {
            showHelp: false,
            projectPath: CONFIG.projectPath,
            outputFile: CONFIG.outputMarkdown,
            generateJson: true,
            verbose: false
        };

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            
            switch (arg) {
                case '--help':
                case '-h':
                    options.showHelp = true;
                    break;
                    
                case '--path':
                case '-p':
                    if (i + 1 < args.length) {
                        options.projectPath = args[++i];
                    }
                    break;
                    
                case '--output':
                case '-o':
                    if (i + 1 < args.length) {
                        options.outputFile = args[++i];
                    }
                    break;
                    
                case '--json':
                case '-j':
                    options.generateJson = true;
                    break;
                    
                case '--verbose':
                case '-v':
                    options.verbose = true;
                    break;
            }
        }

        return options;
    }

    /**
     * Valida que la ruta del proyecto sea accesible
     */
    static async validatePath(projectPath) {
        try {
            const stats = await fs.stat(projectPath);
            if (!stats.isDirectory()) {
                throw new Error('La ruta especificada no es un directorio');
            }
            return true;
        } catch (error) {
            throw new Error(`No se puede acceder a la ruta: ${error.message}`);
        }
    }

    /**
     * Calcula estadísticas de rendimiento
     */
    static getPerformanceStats(startTime, analyzer) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const summary = analyzer.analysisData.summary;
        
        return {
            duration: duration,
            durationFormatted: `${(duration / 1000).toFixed(2)}s`,
            filesPerSecond: Math.round(summary.totalJsFiles / (duration / 1000)),
            functionsPerSecond: Math.round(summary.totalFunctions / (duration / 1000))
        };
    }
}

/**
 * Función principal de ejecución
 */
async function main() {
    const startTime = Date.now();
    
    try {
        // Verificar dependencias
        AnalyzerUtils.checkDependencies();
        
        // Parsear argumentos
        const options = AnalyzerUtils.parseArguments();
        
        // Mostrar ayuda si se solicita
        if (options.showHelp) {
            AnalyzerUtils.showHelp();
            return;
        }
        
        // Actualizar configuración con opciones
        if (options.projectPath !== CONFIG.projectPath) {
            CONFIG.projectPath = options.projectPath;
        }
        if (options.outputFile !== CONFIG.outputMarkdown) {
            CONFIG.outputMarkdown = options.outputFile;
        }
        
        // Validar ruta del proyecto
        await AnalyzerUtils.validatePath(CONFIG.projectPath);
        
        // Crear analizador y ejecutar
        const analyzer = new ProjectAnalyzer();
        
        if (options.verbose) {
            console.log('📋 Configuración:');
            console.log(`   Proyecto: ${CONFIG.projectPath}`);
            console.log(`   Salida MD: ${CONFIG.outputMarkdown}`);
            console.log(`   Salida JSON: ${CONFIG.outputJson}`);
            console.log(`   Carpetas excluidas: ${CONFIG.excludedDirs.join(', ')}`);
            console.log('');
        }
        
        // Ejecutar análisis
        await analyzer.analyze();
        
        // Mostrar estadísticas de rendimiento
        if (options.verbose) {
            const stats = AnalyzerUtils.getPerformanceStats(startTime, analyzer);
            console.log('');
            console.log('⚡ Estadísticas de rendimiento:');
            console.log(`   Tiempo total: ${stats.durationFormatted}`);
            console.log(`   Archivos/seg: ${stats.filesPerSecond}`);
            console.log(`   Funciones/seg: ${stats.functionsPerSecond}`);
        }
        
        console.log('');
        console.log('🎉 ¡Análisis completado exitosamente!');
        console.log(`📁 Revisa los archivos generados en: ${CONFIG.projectPath}`);
        
    } catch (error) {
        console.error('');
        console.error('❌ Error fatal:', error.message);
        console.error('');
        
        if (error.stack && process.env.NODE_ENV === 'development') {
            console.error('Stack trace:', error.stack);
        }
        
        console.error('💡 Sugerencias:');
        console.error('   - Verifica que la ruta del proyecto sea correcta');
        console.error('   - Asegúrate de tener permisos de lectura');
        console.error('   - Ejecuta con --verbose para más información');
        console.error('   - Usa --help para ver todas las opciones');
        
        process.exit(1);
    }
}

/**
 * Manejadores de eventos del proceso
 */
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Excepción no capturada:', error.message);
    process.exit(1);
});

// Exportar clases para uso como módulo
module.exports = {
    ProjectAnalyzer,
    AnalyzerUtils,
    CONFIG
};

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

/**
 * INSTRUCCIONES DE USO:
 * 
 * 1. Guarda este archivo como 'analyzer.js' en la raíz de tu proyecto
 * 
 * 2. Ejecuta desde terminal:
 *    node analyzer.js
 * 
 * 3. Para opciones avanzadas:
 *    node analyzer.js --help
 * 
 * 4. Para otro proyecto:
 *    node analyzer.js --path /ruta/al/proyecto
 * 
 * 5. Modo verboso:
 *    node analyzer.js --verbose
 * 
 * ARCHIVOS GENERADOS:
 * - analisis.md: Reporte completo en Markdown
 * - analisis.json: Datos estructurados en JSON
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * ✅ Análisis recursivo de directorios
 * ✅ Detección de funciones, clases y métodos
 * ✅ Identificación de imports/exports
 * ✅ Detección de duplicados funcionales
 * ✅ Mapeo de relaciones entre archivos
 * ✅ Exclusión inteligente de carpetas
 * ✅ Límites de seguridad configurables
 * ✅ Reportes detallados en MD y JSON
 * ✅ Agrupamiento automático para directorios grandes
 * ✅ Manejo robusto de errores
 * ✅ Interfaz de línea de comandos completa
 * 
 * PERSONALIZACIÓN:
 * - Edita la constante CONFIG para ajustar comportamiento
 * - Modifica patrones regex para diferentes estilos de código
 * - Añade nuevos tipos de análisis según necesidades
 */