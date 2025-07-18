# ================================================================================
# ANALIZADOR COMPLETO DE PROYECTO JAVASCRIPT - POWERSHELL
# ================================================================================
# Descripcion: Analiza proyecto JS con ESLint, JSCPD, Prettier y CLOC
# Modo: Solo lectura (no modifica archivos)
# Autor: Script generado por Claude
# Version: 2.0
# ================================================================================

# Configuracion del proyecto
$ProjectPath = "C:\Users\neura\OneDrive\Desktop\BotAut-refactor-orchestration-core"
$OutputFile = "analisis2.md"

# Lista de herramientas requeridas
$RequiredTools = @("eslint", "jscpd", "prettier", "cloc")

# Configuracion de colores para output
$Colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Cyan"
    Header = "Magenta"
}

# ================================================================================
# FUNCIONES AUXILIARES
# ================================================================================

function Write-StatusMessage {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Colors[$Color]
}

function Write-SectionHeader {
    param([string]$Title)
    Write-Host ""
    Write-StatusMessage ("=" * 80) -Color "Header"
    Write-StatusMessage " $Title" -Color "Header"
    Write-StatusMessage ("=" * 80) -Color "Header"
    Write-Host ""
}

function Write-SubSection {
    param([string]$Title)
    Write-Host ""
    Write-StatusMessage ("-" * 60) -Color "Info"
    Write-StatusMessage " $Title" -Color "Info"
    Write-StatusMessage ("-" * 60) -Color "Info"
}

function Test-NodeEnvironment {
    Write-SubSection "Verificando entorno Node.js"
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-StatusMessage "Node.js detectado: $nodeVersion" -Color "Success"
        } else {
            Write-StatusMessage "ERROR: Node.js no encontrado" -Color "Error"
            Write-StatusMessage "Instala Node.js desde: https://nodejs.org/" -Color "Warning"
            return $false
        }
    } catch {
        Write-StatusMessage "ERROR: Node.js no disponible" -Color "Error"
        return $false
    }
    
    # Verificar npm
    try {
        $npmVersion = npm --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-StatusMessage "npm detectado: $npmVersion" -Color "Success"
        } else {
            Write-StatusMessage "ERROR: npm no encontrado" -Color "Error"
            return $false
        }
    } catch {
        Write-StatusMessage "ERROR: npm no disponible" -Color "Error"
        return $false
    }
    
    # Verificar npx
    try {
        npx --version 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-StatusMessage "npx disponible" -Color "Success"
        } else {
            Write-StatusMessage "ERROR: npx no encontrado" -Color "Error"
            return $false
        }
    } catch {
        Write-StatusMessage "ERROR: npx no disponible" -Color "Error"
        return $false
    }
    
    return $true
}

function Test-ProjectStructure {
    Write-SubSection "Validando estructura del proyecto"
    
    # Verificar que la ruta existe
    if (-not (Test-Path $ProjectPath)) {
        Write-StatusMessage "ERROR: Ruta del proyecto no existe: $ProjectPath" -Color "Error"
        return $false
    }
    
    Write-StatusMessage "Ruta del proyecto validada: $ProjectPath" -Color "Success"
    
    # Verificar que es un directorio
    if (-not (Get-Item $ProjectPath).PSIsContainer) {
        Write-StatusMessage "ERROR: La ruta no es un directorio" -Color "Error"
        return $false
    }
    
    # Contar archivos JavaScript
    $jsFiles = Get-ChildItem -Path $ProjectPath -Recurse -Filter "*.js" | 
               Where-Object { 
                   $_.FullName -notlike "*\node_modules\*" -and 
                   $_.FullName -notlike "*\.venv\*" -and 
                   $_.FullName -notlike "*\.git\*" -and
                   -not $_.Name.StartsWith(".")
               }
    
    Write-StatusMessage "Archivos JavaScript encontrados: $($jsFiles.Count)" -Color "Info"
    
    # Verificar si existe package.json
    $packageJsonPath = Join-Path $ProjectPath "package.json"
    if (Test-Path $packageJsonPath) {
        Write-StatusMessage "package.json encontrado - Proyecto Node.js detectado" -Color "Success"
    } else {
        Write-StatusMessage "package.json no encontrado - Continuando con analisis basico" -Color "Warning"
    }
    
    return $true
}

function Test-ToolAvailability {
    param([string]$ToolName)
    
    # Verificar si esta disponible globalmente
    try {
        $null = Get-Command $ToolName -ErrorAction Stop
        return $true
    } catch {
        # Si no esta global, verificar con npx
        try {
            npx $ToolName --version 2>$null | Out-Null
            return ($LASTEXITCODE -eq 0)
        } catch {
            return $false
        }
    }
}

function Install-Tool {
    param([string]$ToolName)
    
    Write-StatusMessage "Instalando $ToolName..." -Color "Info"
    
    try {
        # Intentar instalacion local primero
        Push-Location $ProjectPath
        
        $installCommand = "npm install --save-dev $ToolName"
        Write-StatusMessage "Ejecutando: $installCommand" -Color "Info"
        
        Invoke-Expression $installCommand 2>$null | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-StatusMessage "$ToolName instalado localmente" -Color "Success"
            Pop-Location
            return $true
        } else {
            # Si falla local, intentar global
            Pop-Location
            Write-StatusMessage "Instalacion local fallo. Intentando instalacion global..." -Color "Warning"
            
            $globalCommand = "npm install -g $ToolName"
            Write-StatusMessage "Ejecutando: $globalCommand" -Color "Info"
            
            Invoke-Expression $globalCommand 2>$null | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-StatusMessage "$ToolName instalado globalmente" -Color "Success"
                return $true
            } else {
                Write-StatusMessage "ERROR: No se pudo instalar $ToolName" -Color "Error"
                return $false
            }
        }
    } catch {
        Pop-Location
        Write-StatusMessage "ERROR instalando $ToolName : $($_.Exception.Message)" -Color "Error"
        return $false
    }
}

function Initialize-AnalysisFile {
    Write-SubSection "Inicializando archivo de analisis"
    
    $outputPath = Join-Path $ProjectPath $OutputFile
    
    # Crear encabezado del archivo
    $header = @"
# Analisis de Proyecto JavaScript

**Proyecto:** $ProjectPath  
**Fecha de analisis:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  
**Generado por:** Analizador PowerShell v2.0  

---

## Herramientas Utilizadas

- **ESLint:** Analisis de calidad y errores de codigo
- **JSCPD:** Deteccion de codigo duplicado  
- **Prettier:** Verificacion de formato de codigo
- **CLOC:** Estadisticas de lineas de codigo

---

"@

    try {
        $header | Out-File -FilePath $outputPath -Encoding UTF8
        Write-StatusMessage "Archivo de analisis creado: $OutputFile" -Color "Success"
        return $outputPath
    } catch {
        Write-StatusMessage "ERROR: No se pudo crear archivo de salida: $($_.Exception.Message)" -Color "Error"
        return $null
    }
}

function Add-SectionToAnalysis {
    param(
        [string]$FilePath,
        [string]$SectionTitle,
        [string]$Command,
        [string]$Output
    )
    
    $section = @"

## $SectionTitle

**Comando ejecutado:** ``$Command``

``````
$Output
``````

---

"@

    try {
        $section | Add-Content -Path $FilePath -Encoding UTF8
        Write-StatusMessage "Seccion '$SectionTitle' agregada al archivo" -Color "Success"
    } catch {
        Write-StatusMessage "ERROR agregando seccion '$SectionTitle': $($_.Exception.Message)" -Color "Error"
    }
}

function Execute-ESLintAnalysis {
    param([string]$AnalysisFilePath)
    
    Write-SubSection "Ejecutando analisis ESLint"
    
    try {
        Push-Location $ProjectPath
        
        $eslintCommand = "npx eslint . --ext .js --ignore-pattern node_modules --ignore-pattern .venv --no-eslintrc --rule 'no-console: off'"
        Write-StatusMessage "Comando: $eslintCommand" -Color "Info"
        
        $eslintOutput = Invoke-Expression $eslintCommand 2>&1 | Out-String
        
        # Agregar al archivo de analisis
        Add-SectionToAnalysis -FilePath $AnalysisFilePath -SectionTitle "Analisis ESLint" -Command $eslintCommand -Output $eslintOutput
        
        # Contar errores y advertencias
        $errorLines = ($eslintOutput -split "`n" | Where-Object { $_ -match "(error|warning)" }).Count
        
        Write-StatusMessage "ESLint completado. Problemas detectados: $errorLines" -Color "Success"
        
        Pop-Location
        return @{ Success = $true; ErrorCount = $errorLines; Output = $eslintOutput }
        
    } catch {
        Pop-Location
        $errorMsg = "Error ejecutando ESLint: $($_.Exception.Message)"
        Write-StatusMessage $errorMsg -Color "Error"
        return @{ Success = $false; ErrorCount = 0; Output = $errorMsg }
    }
}

function Execute-JSCPDAnalysis {
    param([string]$AnalysisFilePath)
    
    Write-SubSection "Ejecutando deteccion de codigo duplicado (JSCPD)"
    
    try {
        Push-Location $ProjectPath
        
        $jscpdCommand = 'npx jscpd --pattern "**/*.js" --ignore "node_modules/**" --ignore ".venv/**"'
        Write-StatusMessage "Comando: $jscpdCommand" -Color "Info"
        
        $jscpdOutput = Invoke-Expression $jscpdCommand 2>&1 | Out-String
        
        # Agregar al archivo de analisis
        Add-SectionToAnalysis -FilePath $AnalysisFilePath -SectionTitle "Deteccion de Codigo Duplicado (JSCPD)" -Command $jscpdCommand -Output $jscpdOutput
        
        # Contar duplicados detectados
        $duplicateCount = 0
        if ($jscpdOutput -match "(\d+)\s+duplications\s+found") {
            $duplicateCount = [int]$matches[1]
        } elseif ($jscpdOutput -match "Found\s+(\d+)\s+clones") {
            $duplicateCount = [int]$matches[1]
        }
        
        Write-StatusMessage "JSCPD completado. Duplicados detectados: $duplicateCount" -Color "Success"
        
        Pop-Location
        return @{ Success = $true; DuplicateCount = $duplicateCount; Output = $jscpdOutput }
        
    } catch {
        Pop-Location
        $errorMsg = "Error ejecutando JSCPD: $($_.Exception.Message)"
        Write-StatusMessage $errorMsg -Color "Error"
        return @{ Success = $false; DuplicateCount = 0; Output = $errorMsg }
    }
}

function Execute-PrettierAnalysis {
    param([string]$AnalysisFilePath)
    
    Write-SubSection "Ejecutando verificacion de formato (Prettier)"
    
    try {
        Push-Location $ProjectPath
        
        $prettierCommand = 'npx prettier --check "**/*.js"'
        Write-StatusMessage "Comando: $prettierCommand" -Color "Info"
        
        $prettierOutput = Invoke-Expression $prettierCommand 2>&1 | Out-String
        $prettierExitCode = $LASTEXITCODE
        
        # Determinar estado del formato
        $formatStatus = if ($prettierExitCode -eq 0) { 
            "CORRECTO - Todos los archivos estan bien formateados" 
        } else { 
            "NECESITA FORMATO - Algunos archivos requieren formateo" 
        }
        
        $fullOutput = "Estado del formato: $formatStatus`n`n$prettierOutput"
        
        # Agregar al archivo de analisis
        Add-SectionToAnalysis -FilePath $AnalysisFilePath -SectionTitle "Verificacion de Formato (Prettier)" -Command $prettierCommand -Output $fullOutput
        
        Write-StatusMessage "Prettier completado. Estado: $formatStatus" -Color "Success"
        
        Pop-Location
        return @{ Success = $true; NeedsFormatting = ($prettierExitCode -ne 0); Output = $fullOutput; Status = $formatStatus }
        
    } catch {
        Pop-Location
        $errorMsg = "Error ejecutando Prettier: $($_.Exception.Message)"
        Write-StatusMessage $errorMsg -Color "Error"
        return @{ Success = $false; NeedsFormatting = $false; Output = $errorMsg; Status = "ERROR" }
    }
}

function Execute-CLOCAnalysis {
    param([string]$AnalysisFilePath)
    
    Write-SubSection "Ejecutando contador de lineas de codigo (CLOC)"
    
    try {
        Push-Location $ProjectPath
        
        $clocCommand = "npx cloc . --exclude-dir=node_modules,.venv,.git"
        Write-StatusMessage "Comando: $clocCommand" -Color "Info"
        
        $clocOutput = Invoke-Expression $clocCommand 2>&1 | Out-String
        
        # Agregar al archivo de analisis
        Add-SectionToAnalysis -FilePath $AnalysisFilePath -SectionTitle "Estadisticas de Lineas de Codigo (CLOC)" -Command $clocCommand -Output $clocOutput
        
        # Extraer estadisticas de JavaScript
        $jsLines = "N/A"
        $totalLines = "N/A"
        $jsFiles = "N/A"
        
        # Buscar linea de JavaScript
        if ($clocOutput -match "JavaScript\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)") {
            $jsFiles = $matches[1]
            $jsLines = $matches[4]
        }
        
        # Buscar total
        if ($clocOutput -match "SUM:\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)") {
            $totalLines = $matches[4]
        }
        
        Write-StatusMessage "CLOC completado. JavaScript: $jsLines lineas en $jsFiles archivos" -Color "Success"
        
        Pop-Location
        return @{ Success = $true; JSLines = $jsLines; TotalLines = $totalLines; JSFiles = $jsFiles; Output = $clocOutput }
        
    } catch {
        Pop-Location
        $errorMsg = "Error ejecutando CLOC: $($_.Exception.Message)"
        Write-StatusMessage $errorMsg -Color "Error"
        return @{ Success = $false; JSLines = "Error"; TotalLines = "Error"; JSFiles = "Error"; Output = $errorMsg }
    }
}

function Add-AnalysisSummary {
    param(
        [string]$AnalysisFilePath,
        [hashtable]$ESLintResult,
        [hashtable]$JSCPDResult,
        [hashtable]$PrettierResult,
        [hashtable]$CLOCResult
    )
    
    Write-SubSection "Generando resumen del analisis"
    
    $summary = @"

## Resumen del Analisis

### ESLint - Calidad de Codigo
- **Estado de ejecucion:** $(if ($ESLintResult.Success) { "Completado exitosamente" } else { "Error en ejecucion" })
- **Errores y advertencias detectadas:** $($ESLintResult.ErrorCount)
- **Recomendacion:** $(if ($ESLintResult.ErrorCount -eq 0) { "El codigo cumple con los estandares basicos de calidad" } else { "Revisar y corregir los problemas detectados por ESLint" })

### JSCPD - Deteccion de Codigo Duplicado
- **Estado de ejecucion:** $(if ($JSCPDResult.Success) { "Completado exitosamente" } else { "Error en ejecucion" })
- **Duplicados detectados:** $($JSCPDResult.DuplicateCount)
- **Recomendacion:** $(if ($JSCPDResult.DuplicateCount -eq 0) { "No se detectaron duplicados significativos" } else { "Considerar refactorizar el codigo duplicado para mejorar mantenibilidad" })

### Prettier - Verificacion de Formato
- **Estado de ejecucion:** $(if ($PrettierResult.Success) { "Completado exitosamente" } else { "Error en ejecucion" })
- **Estado del formato:** $($PrettierResult.Status)
- **Recomendacion:** $(if ($PrettierResult.NeedsFormatting) { "Ejecutar 'npx prettier --write **/*.js' para formatear automaticamente" } else { "El formato del codigo es consistente" })

### CLOC - Estadisticas de Codigo
- **Estado de ejecucion:** $(if ($CLOCResult.Success) { "Completado exitosamente" } else { "Error en ejecucion" })
- **Archivos JavaScript:** $($CLOCResult.JSFiles)
- **Lineas de codigo JavaScript:** $($CLOCResult.JSLines)
- **Lineas totales del proyecto:** $($CLOCResult.TotalLines)
- **Observacion:** $(if ($CLOCResult.JSLines -ne "N/A" -and $CLOCResult.JSLines -ne "Error" -and [int]$CLOCResult.JSLines -gt 1000) { "Proyecto de tamano considerable que requiere atencion a la estructura" } elseif ($CLOCResult.JSLines -ne "N/A" -and $CLOCResult.JSLines -ne "Error") { "Proyecto de tamano manejable" } else { "No se pudieron obtener estadisticas precisas" })

### Recomendaciones Generales

1. **Mantenimiento de Calidad:**
   - Ejecutar este analisis de forma periodica (semanal o antes de cada release)
   - Integrar ESLint en el pipeline de CI/CD para deteccion temprana de problemas
   - Configurar pre-commit hooks para evitar commits con errores de linting

2. **Optimizacion del Codigo:**
   - Revisar y refactorizar codigo duplicado detectado por JSCPD
   - Establecer reglas de ESLint mas estrictas segun las necesidades del proyecto
   - Considerar implementar SonarQube para analisis mas profundo

3. **Formato y Consistencia:**
   - Usar Prettier para mantener formato consistente en todo el equipo
   - Configurar editor con formato automatico al guardar
   - Establecer configuracion de Prettier compartida en el proyecto

4. **Proximos Pasos:**
   - Priorizar correccion de errores criticos detectados por ESLint
   - Revisar manualmente duplicados reportados por JSCPD
   - Implementar las recomendaciones de formato de Prettier
   - Considerar agregar TypeScript para mayor robustez del codigo

---

**Analisis completado el:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  
**Herramientas utilizadas:** ESLint, JSCPD, Prettier, CLOC  
**Modo de ejecucion:** Solo lectura (no se modificaron archivos)  

*Para mas detalles sobre cada herramienta, revisar las secciones especificas arriba.*

"@

    try {
        $summary | Add-Content -Path $AnalysisFilePath -Encoding UTF8
        Write-StatusMessage "Resumen del analisis agregado al archivo" -Color "Success"
    } catch {
        Write-StatusMessage "ERROR agregando resumen: $($_.Exception.Message)" -Color "Error"
    }
}

# ================================================================================
# FUNCION PRINCIPAL
# ================================================================================

function Start-CompleteAnalysis {
    Write-SectionHeader "ANALIZADOR COMPLETO DE PROYECTO JAVASCRIPT"
    
    Write-StatusMessage "Iniciando analisis completo del proyecto..." -Color "Info"
    Write-StatusMessage "Proyecto: $ProjectPath" -Color "Info"
    Write-StatusMessage "Archivo de salida: $OutputFile" -Color "Info"
    Write-StatusMessage "Modo: Solo lectura (no se modificaran archivos)" -Color "Info"
    
    # Paso 1: Verificar entorno Node.js
    if (-not (Test-NodeEnvironment)) {
        Write-StatusMessage "FALLO: Entorno Node.js no esta configurado correctamente" -Color "Error"
        return
    }
    
    # Paso 2: Validar estructura del proyecto
    if (-not (Test-ProjectStructure)) {
        Write-StatusMessage "FALLO: Estructura del proyecto no es valida" -Color "Error"
        return
    }
    
    # Paso 3: Verificar e instalar herramientas necesarias
    Write-SubSection "Verificando herramientas necesarias"
    
    $allToolsReady = $true
    foreach ($tool in $RequiredTools) {
        Write-StatusMessage "Verificando $tool..." -Color "Info"
        
        if (Test-ToolAvailability $tool) {
            Write-StatusMessage "$tool esta disponible" -Color "Success"
        } else {
            Write-StatusMessage "$tool no encontrado. Intentando instalar..." -Color "Warning"
            if (-not (Install-Tool $tool)) {
                Write-StatusMessage "FALLO: No se pudo instalar $tool" -Color "Error"
                $allToolsReady = $false
            }
        }
    }
    
    if (-not $allToolsReady) {
        Write-StatusMessage "ADVERTENCIA: No todas las herramientas estan disponibles. El analisis sera parcial." -Color "Warning"
        $continue = Read-Host "Deseas continuar de todos modos? (s/n)"
        if ($continue -notmatch '^[Ss]$') {
            Write-StatusMessage "Analisis cancelado por el usuario" -Color "Warning"
            return
        }
    }
    
    # Paso 4: Inicializar archivo de analisis
    $analysisFilePath = Initialize-AnalysisFile
    if (-not $analysisFilePath) {
        Write-StatusMessage "FALLO: No se pudo inicializar archivo de analisis" -Color "Error"
        return
    }
    
    # Paso 5: Ejecutar analisis con cada herramienta
    Write-SectionHeader "EJECUTANDO ANALISIS"
    
    $eslintResult = Execute-ESLintAnalysis -AnalysisFilePath $analysisFilePath
    $jscpdResult = Execute-JSCPDAnalysis -AnalysisFilePath $analysisFilePath
    $prettierResult = Execute-PrettierAnalysis -AnalysisFilePath $analysisFilePath
    $clocResult = Execute-CLOCAnalysis -AnalysisFilePath $analysisFilePath
    
    # Paso 6: Generar resumen final
    Add-AnalysisSummary -AnalysisFilePath $analysisFilePath -ESLintResult $eslintResult -JSCPDResult $jscpdResult -PrettierResult $prettierResult -CLOCResult $clocResult
    
    # Paso 7: Mostrar resultados finales
    Write-SectionHeader "ANALISIS COMPLETADO"
    
    Write-StatusMessage "EXITO: Analisis completado correctamente!" -Color "Success"
    Write-StatusMessage "" 
    Write-StatusMessage "RESULTADOS RESUMIDOS:" -Color "Header"
    Write-StatusMessage "  - ESLint: $($eslintResult.ErrorCount) problemas detectados" -Color "Info"
    Write-StatusMessage "  - JSCPD: $($jscpdResult.DuplicateCount) duplicados encontrados" -Color "Info"
    Write-StatusMessage "  - Prettier: $($prettierResult.Status)" -Color "Info"
    Write-StatusMessage "  - CLOC: $($clocResult.JSLines) lineas de JavaScript en $($clocResult.JSFiles) archivos" -Color "Info"
    Write-StatusMessage ""
    Write-StatusMessage "ARCHIVO GENERADO: $analysisFilePath" -Color "Success"
    Write-StatusMessage "Revisa el archivo para obtener el analisis detallado completo." -Color "Info"
}

# ================================================================================
# PUNTO DE ENTRADA Y EJECUCION
# ================================================================================

# Configurar manejo de errores
$ErrorActionPreference = "Continue"

# Mostrar informacion inicial
Write-Host ""
Write-StatusMessage "ANALIZADOR DE PROYECTO JAVASCRIPT v2.0" -Color "Header"
Write-StatusMessage "Herramientas: ESLint, JSCPD, Prettier, CLOC" -Color "Info"
Write-StatusMessage "Modo: Solo lectura (no modifica archivos)" -Color "Info"
Write-StatusMessage "Proyecto: $ProjectPath" -Color "Info"
Write-Host ""

# Solicitar confirmacion del usuario
$userConfirmation = Read-Host "Deseas continuar con el analisis completo? (s/n)"
if ($userConfirmation -notmatch '^[Ss]$') {
    Write-StatusMessage "Analisis cancelado por el usuario." -Color "Warning"
    exit
}

# Ejecutar analisis principal
try {
    Start-CompleteAnalysis
} catch {
    Write-StatusMessage "ERROR CRITICO durante el analisis: $($_.Exception.Message)" -Color "Error"
    Write-StatusMessage "Stack trace: $($_.ScriptStackTrace)" -Color "Error"
    Write-StatusMessage "Contacta al administrador del sistema si el problema persiste." -Color "Warning"
}

# Pausa final para permitir revision de resultados
Write-Host ""
Write-StatusMessage "Presiona Enter para salir del analizador..." -Color "Info"
Read-Host

# ================================================================================
# DOCUMENTACION DE USO
# ================================================================================

<#
.SYNOPSIS
    Analizador completo de proyecto JavaScript usando herramientas estandar

.DESCRIPTION
    Este script analiza un proyecto JavaScript ejecutando ESLint, JSCPD, 
    Prettier y CLOC para proporcionar un analisis completo de calidad,
    duplicados, formato y estadisticas de codigo.

.PARAMETER None
    El script no acepta parametros. La configuracion se realiza editando
    las variables al inicio del script.

.EXAMPLE
    .\analyzer.ps1
    Ejecuta el analisis completo del proyecto configurado

.NOTES
    Requisitos:
    - PowerShell 5.0 o superior
    - Node.js y npm instalados
    - Conexion a internet para instalar herramientas si es necesario
    
    Configuracion:
    - Editar $ProjectPath para especificar la ruta del proyecto
    - Editar $OutputFile para cambiar el nombre del archivo de salida
    
    Características:
    - Modo solo lectura (no modifica archivos del proyecto)
    - Instalacion automatica de herramientas faltantes
    - Exclusion automatica de carpetas irrelevantes
    - Generacion de reporte completo en Markdown
    - Resumen ejecutivo con metricas clave
    
.LINK
    https://eslint.org/
    https://github.com/kucherenko/jscpd
    https://prettier.io/
    https://github.com/AlDanial/cloc
#>