# 📊 Análisis de Proyecto JavaScript

**Proyecto:** C:\Users\neura\OneDrive\Desktop\BotAut-refactor-orchestration-core  
**Fecha de análisis:** 17/7/2025, 6:19:20 p.m.  
**Generado por:** Analizador de Proyecto JavaScript

---

## 📈 Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| **Directorios analizados** | 25 |
| **Archivos .js encontrados** | 98 |
| **Funciones totales** | 1529 |
| **Clases totales** | 118 |
| **Imports totales** | 270 |
| **Duplicados detectados** | 108 |
| **Relaciones entre archivos** | 190 |

---

## 📂 Análisis por Directorio

### 📁 raíz

**Archivos encontrados:** 7

#### Grupo 1

#### 📄 analyzer.js

**Ruta:** `analyzer.js`  
**Tamaño:** 39510 caracteres, 1252 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (45):**
- 🔒 `main` (function, línea 1114)
- 🔒 `constructor` (unknown, línea 54)
- 🔒 `analyze` (unknown, línea 78)
- 🔒 `catch` (unknown, línea 105)
- 🔒 `validateProjectPath` (unknown, línea 114)
- 🔒 `analyzeDirectory` (unknown, línea 128)
- 🔒 `if` (unknown, línea 133)
- 🔒 `for` (unknown, línea 142)
- 🔒 `shouldExcludeDirectory` (unknown, línea 177)
- 🔒 `shouldExcludeFile` (unknown, línea 187)
- 🔒 `analyzeJsFiles` (unknown, línea 198)
- 🔒 `createFileGroups` (unknown, línea 245)
- 🔒 `analyzeJsFile` (unknown, línea 259)
- 🔒 `parseJsFile` (unknown, línea 293)
- 🔒 `extractFunctions` (unknown, línea 336)
- 🔒 `extractClasses` (unknown, línea 372)
- 🔒 `extractClassMethods` (unknown, línea 393)
- 🔒 `getClassContent` (unknown, línea 416)
- 🔒 `while` (unknown, línea 421)
- 🔒 `extractImports` (unknown, línea 442)
- 🔒 `extractExports` (unknown, línea 474)
- 🔒 `getFunctionType` (unknown, línea 504)
- 🔒 `getExportType` (unknown, línea 514)
- 🔒 `isExported` (unknown, línea 523)
- 🔒 `registerFunctions` (function, línea 537)
- 🔒 `registerClasses` (unknown, línea 552)
- 🔒 `registerImports` (unknown, línea 567)
- 🔒 `detectDuplicates` (unknown, línea 577)
- 🔒 `buildRelationships` (unknown, línea 614)
- 🔒 `forEach` (arrow, línea 618)
- 🔒 `generateMarkdownReport` (unknown, línea 634)
- 🔒 `generateMarkdownHeader` (unknown, línea 662)
- 🔒 `generateMarkdownSummary` (unknown, línea 677)
- 🔒 `generateMarkdownDirectories` (unknown, línea 699)
- 🔒 `generateFileAnalysis` (unknown, línea 739)
- 🔒 `generateMarkdownDuplicates` (unknown, línea 811)
- 🔒 `generateMarkdownRelationships` (unknown, línea 850)
- 🔒 `generateMarkdownFooter` (unknown, línea 896)
- 🔒 `generateJsonReport` (unknown, línea 934)
- 🔒 `checkDependencies` (unknown, línea 960)
- 🔒 `showHelp` (unknown, línea 980)
- 🔒 `parseArguments` (unknown, línea 1031)
- 🔒 `switch` (unknown, línea 1044)
- 🔒 `validatePath` (unknown, línea 1082)
- 🔒 `getPerformanceStats` (unknown, línea 1097)

**Clases (2):**
- 🔒 `ProjectAnalyzer` (línea 53)
  - Métodos: `analyze`, `catch`, `validateProjectPath`, `analyzeDirectory`, `if`, `for`, `shouldExcludeDirectory`, `shouldExcludeFile`, `analyzeJsFiles`, `createFileGroups`, `analyzeJsFile`, `parseJsFile`, `extractFunctions`, `extractClasses`, `extractClassMethods`, `getClassContent`, `while`, `extractImports`, `extractExports`, `getFunctionType`, `getExportType`, `isExported`, `registerFunctions`, `registerClasses`, `registerImports`, `detectDuplicates`, `buildRelationships`, `forEach`, `generateMarkdownReport`, `generateMarkdownHeader`, `generateMarkdownSummary`, `generateMarkdownDirectories`, `generateFileAnalysis`, `generateMarkdownDuplicates`, `generateMarkdownRelationships`, `generateMarkdownFooter`, `generateJsonReport`
- 🔒 `AnalyzerUtils` (línea 956)
  - Métodos: `checkDependencies`, `catch`, `if`, `showHelp`, `parseArguments`, `for`, `switch`, `validatePath`, `getPerformanceStats`

**Imports (3):**
- 📦 `fs` desde `fs`
- 📦 `path` desde `path`
- 📦 `execSync` desde `child_process`

**Exports (1):**
- 🔄 `{
    ProjectAnalyzer,
    AnalyzerUtils,
    CONFIG
}` (commonjs)

#### 📄 eslint.config.js

**Ruta:** `eslint.config.js`  
**Tamaño:** 1474 caracteres, 53 líneas  
**Tipo:** Módulo ES6/CommonJS 

**Imports (1):**
- 📦 `js` desde `@eslint/js`

#### 📄 pg-migrate-config.js

**Ruta:** `pg-migrate-config.js`  
**Tamaño:** 206 caracteres, 11 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Exports (1):**
- 🔄 `{
  databaseUrl: process.env.DATABASE_URL,
  migrationsTable: 'pgmigrations',
  dir: 'database/migrations',
  direction: 'up',
  count: Infinity,
}` (commonjs)

#### 📄 test-basic.js

**Ruta:** `test-basic.js`  
**Tamaño:** 1396 caracteres, 43 líneas  
**Tipo:** Script 

**Funciones (2):**
- 🔒 `testBasicComponents` (function, línea 6)
- 🔒 `catch` (unknown, línea 19)

**Imports (4):**
- 📁 `logger` desde `./src/utils/logger`
- 📁 `config` desde `./src/utils/config`
- 📁 `initializeDatabase` desde `./src/database/pg`
- 📁 `SalvaCellAgentExecutor` desde `./src/services/agentExecutor`

#### 📄 test-db-connection.js

**Ruta:** `test-db-connection.js`  
**Tamaño:** 1076 caracteres, 36 líneas  
**Tipo:** Script 

**Funciones (2):**
- 🔒 `testConnection` (function, línea 15)
- 🔒 `catch` (unknown, línea 29)

**Imports (1):**
- 📦 `Pool` desde `pg`

#### Grupo 2

#### 📄 test-node.js

**Ruta:** `test-node.js`  
**Tamaño:** 91 caracteres, 3 líneas  
**Tipo:** Script 

#### 📄 test-very-basic.js

**Ruta:** `test-very-basic.js`  
**Tamaño:** 435 caracteres, 18 líneas  
**Tipo:** Script 

**Funciones (1):**
- 🔒 `catch` (unknown, línea 14)

---

### 📁 config-service

**Archivos encontrados:** 1

#### 📄 index.js

**Ruta:** `config-service\index.js`  
**Tamaño:** 119 caracteres, 2 líneas  
**Tipo:** Script 

---

### 📁 database\migrations

**Archivos encontrados:** 1

#### 📄 1709212800000_initial_schema.js

**Ruta:** `database\migrations\1709212800000_initial_schema.js`  
**Tamaño:** 640 caracteres, 24 líneas  
**Tipo:** Script 

---

### 📁 knowledge-service

**Archivos encontrados:** 1

#### 📄 index.js

**Ruta:** `knowledge-service\index.js`  
**Tamaño:** 130 caracteres, 2 líneas  
**Tipo:** Script 

---

### 📁 src

**Archivos encontrados:** 1

#### 📄 bot.js

**Ruta:** `src\bot.js`  
**Tamaño:** 9960 caracteres, 257 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (13):**
- 🔒 `constructor` (unknown, línea 15)
- 🔒 `initialize` (unknown, línea 33)
- 🔒 `if` (unknown, línea 42)
- 🔒 `catch` (unknown, línea 52)
- 🔒 `initializePureOrchestrator` (unknown, línea 60)
- 🔒 `initializeWhatsAppClient` (unknown, línea 83)
- 🔒 `setupEventHandlers` (unknown, línea 94)
- 🔒 `handleIncomingMessage` (unknown, línea 121)
- 🔒 `handleMessageError` (unknown, línea 174)
- 🔒 `recordSuccess` (unknown, línea 203)
- 🔒 `getMetrics` (unknown, línea 209)
- 🔒 `start` (unknown, línea 221)
- 🔒 `shutdown` (unknown, línea 231)

**Clases (1):**
- 🔒 `SalvaCellPureOrchestrator` (línea 14)
  - Métodos: `initialize`, `if`, `catch`, `initializePureOrchestrator`, `initializeWhatsAppClient`, `setupEventHandlers`, `handleIncomingMessage`, `handleMessageError`, `recordSuccess`, `getMetrics`, `start`, `shutdown`

**Imports (9):**
- 📦 `Client, LocalAuth` desde `whatsapp-web.js`
- 📦 `qrcode` desde `qrcode-terminal`
- 📁 `config` desde `./utils/config`
- 📁 `initializeDatabase` desde `./database/pg`
- 📁 `isChatPaused` desde `./utils/chatState`
- 📁 `logger` desde `./utils/logger`
- 📁 `SalvaCellAgentExecutor, OllamaError` desde `./services/agentExecutor`
- 📁 `orchestrationController` desde `./core/OrchestrationController`
- 📁 `registerService` desde `./services/serviceRegistry`

**Exports (1):**
- 🔄 `{ SalvaCellPureOrchestrator }` (commonjs)

---

### 📁 src\auth

**Archivos encontrados:** 1

#### 📄 admin.js

**Ruta:** `src\auth\admin.js`  
**Tamaño:** 2624 caracteres, 85 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (5):**
- 🔒 `isAdmin` (function, línea 11)
- 🔒 `addAdmin` (function, línea 38)
- 🔒 `removeAdmin` (function, línea 59)
- 🔒 `if` (unknown, línea 13)
- 🔒 `catch` (unknown, línea 26)

**Imports (1):**
- 📁 `pool` desde `../database/pg`

**Exports (1):**
- 🔄 `{
    isAdmin,
    addAdmin,
    removeAdmin
}` (commonjs)

---

### 📁 src\core

**Archivos encontrados:** 1

#### 📄 OrchestrationController.js

**Ruta:** `src\core\OrchestrationController.js`  
**Tamaño:** 26580 caracteres, 672 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (29):**
- 🔒 `constructor` (unknown, línea 32)
- 🔒 `initialize` (unknown, línea 65)
- 🔒 `if` (unknown, línea 70)
- 🔒 `catch` (unknown, línea 104)
- 🔒 `establishCrossLayerCoordination` (unknown, línea 115)
- 🔒 `executeOperation` (unknown, línea 141)
- 🔒 `handlePerformanceDegradation` (unknown, línea 214)
- 🔒 `handleSystemHealthChange` (unknown, línea 233)
- 🔒 `updateSuccessMetrics` (unknown, línea 251)
- 🔒 `updateFailureMetrics` (unknown, línea 272)
- 🔒 `getSystemStatus` (unknown, línea 289)
- 🔒 `optimizeSystem` (unknown, línea 341)
- 🔒 `shutdown` (unknown, línea 383)
- 🔒 `getCircuitBreaker` (unknown, línea 421)
- 🔒 `getGracefulDegradationManager` (unknown, línea 429)
- 🔒 `getPerformanceController` (unknown, línea 437)
- 🔒 `getResilienceController` (unknown, línea 445)
- 🔒 `getAdminEscalationSystem` (unknown, línea 453)
- 🔒 `getAdaptiveLearningEngine` (unknown, línea 461)
- 🔒 `getUncertaintyDetector` (unknown, línea 469)
- 🔒 `processIntelligentQuery` (unknown, línea 479)
- 🔒 `extractSituationFromQuery` (unknown, línea 567)
- 🔒 `detectQueryType` (unknown, línea 581)
- 🔒 `extractDeviceModel` (unknown, línea 589)
- 🔒 `for` (unknown, línea 596)
- 🔒 `detectServiceType` (unknown, línea 604)
- 🔒 `setupIntelligenceCoordination` (unknown, línea 615)
- 🔒 `recordAdminDecisionForLearning` (unknown, línea 634)
- 🔒 `extractSituationFromEscalation` (unknown, línea 659)

**Clases (1):**
- 🔒 `OrchestrationController` (línea 31)
  - Métodos: `initialize`, `if`, `catch`, `establishCrossLayerCoordination`, `executeOperation`, `handlePerformanceDegradation`, `handleSystemHealthChange`, `updateSuccessMetrics`, `updateFailureMetrics`, `getSystemStatus`, `optimizeSystem`, `shutdown`, `getCircuitBreaker`, `getGracefulDegradationManager`, `getPerformanceController`, `getResilienceController`, `getAdminEscalationSystem`, `getAdaptiveLearningEngine`, `getUncertaintyDetector`, `processIntelligentQuery`, `extractSituationFromQuery`, `detectQueryType`, `extractDeviceModel`, `for`, `detectServiceType`, `setupIntelligenceCoordination`, `recordAdminDecisionForLearning`, `extractSituationFromEscalation`

**Imports (7):**
- 📁 `logger` desde `../utils/logger`
- 📁 `config` desde `../utils/config`
- 📁 `PerformanceController` desde `./performance/PerformanceController`
- 📁 `ResilienceController` desde `./resilience/ResilienceController`
- 📁 `AdminEscalationSystem` desde `./intelligence/AdminEscalationSystem`
- 📁 `AdaptiveLearningEngine` desde `./intelligence/AdaptiveLearningEngine`
- 📁 `UncertaintyDetector` desde `./intelligence/UncertaintyDetector`

**Exports (1):**
- 🔄 `orchestrationController` (commonjs)

---

### 📁 src\core\intelligence

**Archivos encontrados:** 6

#### Grupo 1

#### 📄 AdaptiveLearningEngine.js

**Ruta:** `src\core\intelligence\AdaptiveLearningEngine.js`  
**Tamaño:** 19103 caracteres, 544 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (27):**
- 🔒 `constructor` (unknown, línea 18)
- 🔒 `recordAdminDecision` (unknown, línea 40)
- 🔒 `catch` (unknown, línea 75)
- 🔒 `checkForAutoDecision` (unknown, línea 85)
- 🔒 `checkForNewAutoDecision` (unknown, línea 108)
- 🔒 `if` (unknown, línea 111)
- 🔒 `analyzeDecisionConsistency` (unknown, línea 146)
- 🔒 `requestAutoDecisionApproval` (unknown, línea 189)
- 🔒 `formatApprovalRequest` (unknown, línea 209)
- 🔒 `handleApprovalResponse` (unknown, línea 232)
- 🔒 `approveAutoDecision` (unknown, línea 248)
- 🔒 `rejectAutoDecision` (unknown, línea 284)
- 🔒 `generateSituationPattern` (unknown, línea 303)
- 🔒 `normalizeResponse` (unknown, línea 346)
- 🔒 `normalizeDeviceModel` (unknown, línea 359)
- 🔒 `categorizeTimeOfDay` (unknown, línea 371)
- 🔒 `describeSituationFromPattern` (unknown, línea 383)
- 🔒 `switch` (unknown, línea 390)
- 🔒 `saveDecisionToDatabase` (unknown, línea 419)
- 🔒 `saveAutoDecisionToDatabase` (unknown, línea 435)
- 🔒 `markDecisionSuccess` (unknown, línea 451)
- 🔒 `updateAccuracyMetrics` (unknown, línea 474)
- 🔒 `forEach` (arrow, línea 479)
- 🔒 `getMetrics` (unknown, línea 497)
- 🔒 `getPendingApprovals` (unknown, línea 510)
- 🔒 `getActiveAutoDecisions` (unknown, línea 518)
- 🔒 `shutdown` (unknown, línea 531)

**Clases (1):**
- 🔒 `AdaptiveLearningEngine` (línea 17)
  - Métodos: `recordAdminDecision`, `catch`, `checkForAutoDecision`, `checkForNewAutoDecision`, `if`, `analyzeDecisionConsistency`, `requestAutoDecisionApproval`, `formatApprovalRequest`, `handleApprovalResponse`, `approveAutoDecision`, `rejectAutoDecision`, `generateSituationPattern`, `normalizeResponse`, `normalizeDeviceModel`, `categorizeTimeOfDay`, `describeSituationFromPattern`, `switch`, `saveDecisionToDatabase`, `saveAutoDecisionToDatabase`, `markDecisionSuccess`, `updateAccuracyMetrics`, `forEach`, `getMetrics`, `getPendingApprovals`, `getActiveAutoDecisions`, `shutdown`

**Imports (2):**
- 📁 `logger` desde `../../utils/logger`
- 📁 `initializeDatabase` desde `../../database/pg`

**Exports (1):**
- 🔄 `adaptiveLearningEngine` (commonjs)

#### 📄 AdminEscalationSystem.js

**Ruta:** `src\core\intelligence\AdminEscalationSystem.js`  
**Tamaño:** 16512 caracteres, 407 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (24):**
- 🔒 `constructor` (unknown, línea 22)
- 🔒 `needsEscalation` (unknown, línea 44)
- 🔒 `if` (unknown, línea 60)
- 🔒 `escalateToAdmin` (unknown, línea 76)
- 🔒 `catch` (unknown, línea 89)
- 🔒 `processEscalation` (unknown, línea 102)
- 🔒 `handleAdminResponse` (unknown, línea 142)
- 🔒 `formulateNaturalResponse` (unknown, línea 184)
- 🔒 `cleanAdminResponse` (unknown, línea 205)
- 🔒 `setupAdminTimeout` (unknown, línea 217)
- 🔒 `handleAdminTimeout` (unknown, línea 230)
- 🔒 `clearAdminTimeout` (unknown, línea 264)
- 🔒 `enqueueEscalation` (unknown, línea 278)
- 🔒 `processNextInQueue` (unknown, línea 291)
- 🔒 `generateConsultaId` (unknown, línea 302)
- 🔒 `getCurrentEscalation` (unknown, línea 306)
- 🔒 `releaseAdmin` (unknown, línea 312)
- 🔒 `recordSuccessfulEscalation` (unknown, línea 316)
- 🔒 `formatAdminMessage` (unknown, línea 333)
- 🔒 `sendToAdmin` (unknown, línea 352)
- 🔒 `getCustomerWaitMessage` (unknown, línea 366)
- 🔒 `getEscalationReason` (unknown, línea 373)
- 🔒 `getMetrics` (unknown, línea 382)
- 🔒 `shutdown` (unknown, línea 393)

**Clases (1):**
- 🔒 `AdminEscalationSystem` (línea 21)
  - Métodos: `needsEscalation`, `if`, `escalateToAdmin`, `catch`, `processEscalation`, `handleAdminResponse`, `formulateNaturalResponse`, `cleanAdminResponse`, `setupAdminTimeout`, `handleAdminTimeout`, `clearAdminTimeout`, `enqueueEscalation`, `processNextInQueue`, `generateConsultaId`, `getCurrentEscalation`, `releaseAdmin`, `recordSuccessfulEscalation`, `formatAdminMessage`, `sendToAdmin`, `getCustomerWaitMessage`, `getEscalationReason`, `getMetrics`, `shutdown`

**Imports (2):**
- 📁 `logger` desde `../../utils/logger`
- 📁 `config` desde `../../utils/config`

**Exports (1):**
- 🔄 `adminEscalationSystem` (commonjs)

#### 📄 ContextAwareResponseGenerator.js

**Ruta:** `src\core\intelligence\ContextAwareResponseGenerator.js`  
**Tamaño:** 47248 caracteres, 1186 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (35):**
- 🔒 `constructor` (unknown, línea 21)
- 🔒 `generateResponse` (unknown, línea 49)
- 🔒 `catch` (unknown, línea 99)
- 🔒 `analyzeClientContext` (unknown, línea 122)
- 🔒 `updateClientContext` (unknown, línea 166)
- 🔒 `if` (unknown, línea 176)
- 🔒 `determineResponseType` (unknown, línea 223)
- 🔒 `getTemporalContext` (unknown, línea 262)
- 🔒 `createPersonalizedResponse` (unknown, línea 305)
- 🔒 `createPersonalizationVariables` (unknown, línea 366)
- 🔒 `getResponseTemplate` (unknown, línea 433)
- 🔒 `populateTemplate` (unknown, línea 449)
- 🔒 `applyPersonalityStyle` (unknown, línea 473)
- 🔒 `switch` (unknown, línea 477)
- 🔒 `addContextualElements` (unknown, línea 514)
- 🔒 `updateConversationMemory` (unknown, línea 545)
- 🔒 `getConversationHistory` (unknown, línea 569)
- 🔒 `updateMetrics` (unknown, línea 578)
- 🔒 `generateFallbackResponse` (unknown, línea 602)
- 🔒 `extractDeviceType` (unknown, línea 622)
- 🔒 `extractServiceType` (unknown, línea 640)
- 🔒 `analyzeCommunicationStyle` (unknown, línea 657)
- 🔒 `initializeTemplates` (unknown, línea 672)
- 🔒 `loadBusinessContext` (unknown, línea 745)
- 🔒 `addAdditionalTemplates` (unknown, línea 774)
- 🔒 `enrichClientBehavior` (unknown, línea 881)
- 🔒 `analyzeSentiment` (unknown, línea 919)
- 🔒 `applySentimentAdjustments` (unknown, línea 950)
- 🔒 `getContextStats` (unknown, línea 967)
- 🔒 `getMetrics` (unknown, línea 1021)
- 🔒 `cleanupOldData` (unknown, línea 1043)
- 🔒 `exportContextData` (unknown, línea 1068)
- 🔒 `importContextData` (unknown, línea 1100)
- 🔒 `optimizeTemplates` (unknown, línea 1137)
- 🔒 `generateOptimizationSuggestions` (unknown, línea 1167)

**Clases (1):**
- 🔄 `ContextAwareResponseGenerator` (línea 20)
  - Métodos: `generateResponse`, `catch`, `analyzeClientContext`, `updateClientContext`, `if`, `determineResponseType`, `getTemporalContext`, `createPersonalizedResponse`, `createPersonalizationVariables`, `getResponseTemplate`, `populateTemplate`, `applyPersonalityStyle`, `switch`, `addContextualElements`, `updateConversationMemory`, `getConversationHistory`, `updateMetrics`, `generateFallbackResponse`, `extractDeviceType`, `extractServiceType`, `analyzeCommunicationStyle`, `initializeTemplates`, `loadBusinessContext`, `addAdditionalTemplates`, `enrichClientBehavior`, `analyzeSentiment`, `applySentimentAdjustments`, `getContextStats`, `getMetrics`, `cleanupOldData`, `exportContextData`, `importContextData`, `optimizeTemplates`, `generateOptimizationSuggestions`

**Imports (4):**
- 📁 `logger` desde `../../utils/logger`
- 📁 `config` desde `../../utils/config`
- 📦 `path` desde `path`
- 📦 `fs` desde `fs`

**Exports (1):**
- 🔄 `ContextAwareResponseGenerator` (commonjs)

#### 📄 MultiModalReasoningEngine.js

**Ruta:** `src\core\intelligence\MultiModalReasoningEngine.js`  
**Tamaño:** 18645 caracteres, 478 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (25):**
- 🔒 `constructor` (unknown, línea 21)
- 🔒 `processQuery` (unknown, línea 48)
- 🔒 `catch` (unknown, línea 89)
- 🔒 `classifyQuery` (unknown, línea 110)
- 🔒 `if` (unknown, línea 121)
- 🔒 `analyzeTextComplexity` (unknown, línea 153)
- 🔒 `containsTechnicalTerms` (unknown, línea 181)
- 🔒 `selectReasoningStrategy` (unknown, línea 196)
- 🔒 `executeReasoning` (unknown, línea 213)
- 🔒 `for` (unknown, línea 230)
- 🔒 `executeReasoningStep` (unknown, línea 250)
- 🔒 `switch` (unknown, línea 255)
- 🔒 `performTextAnalysis` (unknown, línea 285)
- 🔒 `performImageAnalysis` (unknown, línea 296)
- 🔒 `performKnowledgeLookup` (unknown, línea 308)
- 🔒 `performPriceAnalysis` (unknown, línea 320)
- 🔒 `performContextIntegration` (unknown, línea 332)
- 🔒 `performSynthesis` (unknown, línea 345)
- 🔒 `assessConfidence` (unknown, línea 358)
- 🔒 `decideAction` (unknown, línea 369)
- 🔒 `calculateOverallConfidence` (unknown, línea 385)
- 🔒 `generateConclusions` (unknown, línea 393)
- 🔒 `formulateReasoning` (unknown, línea 405)
- 🔒 `updateMetrics` (unknown, línea 410)
- 🔒 `initializeReasoningStrategies` (unknown, línea 429)

**Clases (1):**
- 🔒 `MultiModalReasoningEngine` (línea 20)
  - Métodos: `processQuery`, `catch`, `classifyQuery`, `if`, `analyzeTextComplexity`, `containsTechnicalTerms`, `selectReasoningStrategy`, `executeReasoning`, `for`, `executeReasoningStep`, `switch`, `performTextAnalysis`, `performImageAnalysis`, `performKnowledgeLookup`, `performPriceAnalysis`, `performContextIntegration`, `performSynthesis`, `assessConfidence`, `decideAction`, `calculateOverallConfidence`, `generateConclusions`, `formulateReasoning`, `updateMetrics`, `initializeReasoningStrategies`

**Imports (2):**
- 📁 `logger` desde `../../utils/logger`
- 📁 `config` desde `../../utils/config`

**Exports (1):**
- 🔄 `multiModalReasoningEngine` (commonjs)

#### 📄 PredictiveAnalyticsEngine.js

**Ruta:** `src\core\intelligence\PredictiveAnalyticsEngine.js`  
**Tamaño:** 14904 caracteres, 324 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (35):**
- 🔒 `constructor` (unknown, línea 21)
- 🔒 `generatePredictions` (unknown, línea 50)
- 🔒 `catch` (unknown, línea 84)
- 🔒 `predictBehavior` (unknown, línea 100)
- 🔒 `if` (unknown, línea 111)
- 🔒 `predictNeeds` (unknown, línea 128)
- 🔒 `predictOptimalTiming` (unknown, línea 156)
- 🔒 `predictDeviceLifecycle` (unknown, línea 183)
- 🔒 `for` (unknown, línea 195)
- 🔒 `generateProactiveActions` (unknown, línea 218)
- 🔒 `initializePredictionModels` (unknown, línea 258)
- 🔒 `loadHistoricalTrends` (unknown, línea 262)
- 🔒 `aggregateInsights` (unknown, línea 268)
- 🔒 `generateRecommendations` (unknown, línea 282)
- 🔒 `calculateOverallConfidence` (unknown, línea 289)
- 🔒 `countHighConfidencePredictions` (unknown, línea 295)
- 🔒 `calculateContactProbability` (unknown, línea 300)
- 🔒 `predictPreferredTime` (unknown, línea 301)
- 🔒 `predictCommunicationStyle` (unknown, línea 302)
- 🔒 `predictUrgencyPattern` (unknown, línea 303)
- 🔒 `calculateServiceLoyalty` (unknown, línea 304)
- 🔒 `predictLikelyServices` (unknown, línea 305)
- 🔒 `predictUpgradeWindow` (unknown, línea 306)
- 🔒 `predictMaintenanceNeeds` (unknown, línea 307)
- 🔒 `estimateBudgetRange` (unknown, línea 308)
- 🔒 `analyzeBestHours` (unknown, línea 309)
- 🔒 `predictBestDays` (unknown, línea 310)
- 🔒 `estimateResponseExpectation` (unknown, línea 311)
- 🔒 `getSeasonalFactors` (unknown, línea 312)
- 🔒 `getGenericLifecycle` (unknown, línea 313)
- 🔒 `determineCurrentPhase` (unknown, línea 314)
- 🔒 `predictExpectedIssues` (unknown, línea 315)
- 🔒 `suggestMaintenanceSchedule` (unknown, línea 316)
- 🔒 `predictReplacementWindow` (unknown, línea 317)
- 🔒 `calculateProactiveConfidence` (unknown, línea 318)

**Clases (1):**
- 🔒 `PredictiveAnalyticsEngine` (línea 20)
  - Métodos: `generatePredictions`, `catch`, `predictBehavior`, `if`, `predictNeeds`, `predictOptimalTiming`, `predictDeviceLifecycle`, `for`, `generateProactiveActions`, `initializePredictionModels`, `loadHistoricalTrends`, `aggregateInsights`, `generateRecommendations`, `calculateOverallConfidence`, `countHighConfidencePredictions`, `calculateContactProbability`, `predictPreferredTime`, `predictCommunicationStyle`, `predictUrgencyPattern`, `calculateServiceLoyalty`, `predictLikelyServices`, `predictUpgradeWindow`, `predictMaintenanceNeeds`, `estimateBudgetRange`, `analyzeBestHours`, `predictBestDays`, `estimateResponseExpectation`, `getSeasonalFactors`, `getGenericLifecycle`, `determineCurrentPhase`, `predictExpectedIssues`, `suggestMaintenanceSchedule`, `predictReplacementWindow`, `calculateProactiveConfidence`

**Imports (2):**
- 📁 `logger` desde `../../utils/logger`
- 📁 `config` desde `../../utils/config`

**Exports (1):**
- 🔄 `predictiveAnalyticsEngine` (commonjs)

#### Grupo 2

#### 📄 UncertaintyDetector.js

**Ruta:** `src\core\intelligence\UncertaintyDetector.js`  
**Tamaño:** 18237 caracteres, 453 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (27):**
- 🔒 `constructor` (unknown, línea 18)
- 🔒 `analyzeQuery` (unknown, línea 41)
- 🔒 `if` (unknown, línea 58)
- 🔒 `catch` (unknown, línea 78)
- 🔒 `detectUncertaintyIndicators` (unknown, línea 89)
- 🔒 `analyzeDeviceModel` (unknown, línea 162)
- 🔒 `for` (unknown, línea 174)
- 🔒 `analyzeQueryComplexity` (unknown, línea 196)
- 🔒 `analyzePriceAvailability` (unknown, línea 215)
- 🔒 `detectCustomRequests` (unknown, línea 227)
- 🔒 `analyzeTechnicalComplexity` (unknown, línea 249)
- 🔒 `calculateConfidence` (unknown, línea 266)
- 🔒 `prepareEscalationData` (unknown, línea 281)
- 🔒 `assessAgentCapabilities` (unknown, línea 300)
- 🔒 `loadPriceDatabase` (unknown, línea 323)
- 🔒 `parseMarkdownPrices` (unknown, línea 342)
- 🔒 `extractBrand` (unknown, línea 367)
- 🔒 `checkModelInDatabase` (unknown, línea 377)
- 🔒 `findPriceInDatabase` (unknown, línea 390)
- 🔒 `normalizeModel` (unknown, línea 402)
- 🔒 `detectServiceType` (unknown, línea 406)
- 🔒 `containsTechnicalTerms` (unknown, línea 414)
- 🔒 `isComplexProblem` (unknown, línea 419)
- 🔒 `canProvideServiceInfo` (unknown, línea 424)
- 🔒 `getMetrics` (unknown, línea 429)
- 🔒 `setUncertaintyThreshold` (unknown, línea 438)
- 🔒 `shutdown` (unknown, línea 445)

**Clases (1):**
- 🔒 `UncertaintyDetector` (línea 17)
  - Métodos: `analyzeQuery`, `if`, `catch`, `detectUncertaintyIndicators`, `analyzeDeviceModel`, `for`, `analyzeQueryComplexity`, `analyzePriceAvailability`, `detectCustomRequests`, `analyzeTechnicalComplexity`, `calculateConfidence`, `prepareEscalationData`, `assessAgentCapabilities`, `loadPriceDatabase`, `parseMarkdownPrices`, `extractBrand`, `checkModelInDatabase`, `findPriceInDatabase`, `normalizeModel`, `detectServiceType`, `containsTechnicalTerms`, `isComplexProblem`, `canProvideServiceInfo`, `getMetrics`, `setUncertaintyThreshold`, `shutdown`

**Imports (3):**
- 📁 `logger` desde `../../utils/logger`
- 📦 `path` desde `path`
- 📦 `fs` desde `fs`

**Exports (1):**
- 🔄 `uncertaintyDetector` (commonjs)

---

### 📁 src\core\performance

**Archivos encontrados:** 4

#### 📄 ConcurrentProcessor.js

**Ruta:** `src\core\performance\ConcurrentProcessor.js`  
**Tamaño:** 13997 caracteres, 477 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (27):**
- 🔒 `constructor` (unknown, línea 9)
- 🔒 `initializeWorkerPool` (unknown, línea 45)
- 🔒 `for` (unknown, línea 46)
- 🔒 `executeTask` (unknown, línea 68)
- 🔒 `executeBatch` (unknown, línea 98)
- 🔒 `catch` (unknown, línea 137)
- 🔒 `enqueueTask` (unknown, línea 150)
- 🔒 `processQueue` (unknown, línea 168)
- 🔒 `while` (unknown, línea 169)
- 🔒 `if` (unknown, línea 172)
- 🔒 `assignTaskToWorker` (unknown, línea 188)
- 🔒 `executeTaskInWorker` (unknown, línea 221)
- 🔒 `executeTaskDirect` (unknown, línea 243)
- 🔒 `handleTaskCompletion` (unknown, línea 269)
- 🔒 `findAvailableWorker` (unknown, línea 296)
- 🔒 `createOptimalBatches` (unknown, línea 312)
- 🔒 `findInsertionIndex` (unknown, línea 326)
- 🔒 `updateAverageExecutionTime` (unknown, línea 344)
- 🔒 `startMetricsCollection` (unknown, línea 352)
- 🔒 `collectMetrics` (unknown, línea 361)
- 🔒 `getMetrics` (unknown, línea 375)
- 🔒 `generateTaskId` (unknown, línea 390)
- 🔒 `generateBatchId` (unknown, línea 394)
- 🔒 `sleep` (unknown, línea 398)
- 🔒 `optimize` (unknown, línea 406)
- 🔒 `forEach` (arrow, línea 419)
- 🔒 `shutdown` (unknown, línea 457)

**Clases (1):**
- 🔄 `ConcurrentProcessor` (línea 8)
  - Métodos: `initializeWorkerPool`, `for`, `executeTask`, `executeBatch`, `catch`, `enqueueTask`, `processQueue`, `while`, `if`, `assignTaskToWorker`, `executeTaskInWorker`, `executeTaskDirect`, `handleTaskCompletion`, `findAvailableWorker`, `createOptimalBatches`, `findInsertionIndex`, `updateAverageExecutionTime`, `startMetricsCollection`, `collectMetrics`, `getMetrics`, `generateTaskId`, `generateBatchId`, `sleep`, `optimize`, `forEach`, `shutdown`

**Imports (3):**
- 📦 `Worker` desde `worker_threads`
- 📦 `performance` desde `perf_hooks`
- 📁 `logger` desde `../../utils/logger`

**Exports (1):**
- 🔄 `ConcurrentProcessor` (commonjs)

#### 📄 MemoryManager.js

**Ruta:** `src\core\performance\MemoryManager.js`  
**Tamaño:** 11548 caracteres, 391 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (20):**
- 🔒 `constructor` (unknown, línea 8)
- 🔒 `initializeMemoryPools` (unknown, línea 42)
- 🔒 `allocateMemory` (unknown, línea 73)
- 🔒 `if` (unknown, línea 76)
- 🔒 `allocateFromPool` (unknown, línea 104)
- 🔒 `performIntelligentCleanup` (unknown, línea 144)
- 🔒 `cleanupPool` (unknown, línea 181)
- 🔒 `filter` (arrow, línea 186)
- 🔒 `forceGarbageCollection` (unknown, línea 211)
- 🔒 `getCurrentMemoryUsage` (unknown, línea 232)
- 🔒 `getAvailableMemory` (unknown, línea 242)
- 🔒 `getTotalSystemMemory` (unknown, línea 258)
- 🔒 `startMonitoring` (unknown, línea 266)
- 🔒 `monitorMemoryUsage` (unknown, línea 279)
- 🔒 `getMemoryMetrics` (unknown, línea 306)
- 🔒 `generateAllocationId` (unknown, línea 322)
- 🔒 `fallbackAllocation` (unknown, línea 326)
- 🔒 `optimizeForOperation` (unknown, línea 342)
- 🔒 `forceCleanup` (unknown, línea 355)
- 🔒 `shutdown` (unknown, línea 375)

**Clases (1):**
- 🔄 `MemoryManager` (línea 7)
  - Métodos: `initializeMemoryPools`, `allocateMemory`, `if`, `allocateFromPool`, `performIntelligentCleanup`, `cleanupPool`, `filter`, `forceGarbageCollection`, `getCurrentMemoryUsage`, `getAvailableMemory`, `getTotalSystemMemory`, `startMonitoring`, `monitorMemoryUsage`, `getMemoryMetrics`, `generateAllocationId`, `fallbackAllocation`, `optimizeForOperation`, `forceCleanup`, `shutdown`

**Imports (2):**
- 📁 `logger` desde `../../utils/logger`
- 📦 `performance` desde `perf_hooks`

**Exports (1):**
- 🔄 `MemoryManager` (commonjs)

#### 📄 PerformanceController.js

**Ruta:** `src\core\performance\PerformanceController.js`  
**Tamaño:** 12648 caracteres, 390 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (21):**
- 🔒 `constructor` (unknown, línea 10)
- 🔒 `if` (unknown, línea 37)
- 🔒 `initialize` (unknown, línea 46)
- 🔒 `catch` (unknown, línea 58)
- 🔒 `initializeComponents` (unknown, línea 67)
- 🔒 `executeOptimizedQuery` (unknown, línea 92)
- 🔒 `executeConcurrentOperations` (unknown, línea 123)
- 🔒 `allocateOptimizedMemory` (unknown, línea 154)
- 🔒 `getPerformanceMetrics` (unknown, línea 166)
- 🔒 `updateMetrics` (unknown, línea 190)
- 🔒 `triggerPerformanceDegradation` (unknown, línea 208)
- 🔒 `startPerformanceMonitoring` (unknown, línea 221)
- 🔒 `performanceHealthCheck` (unknown, línea 230)
- 🔒 `executeSequential` (unknown, línea 246)
- 🔒 `for` (unknown, línea 249)
- 🔒 `optimizeOperation` (unknown, línea 267)
- 🔒 `activateEmergencyMode` (unknown, línea 287)
- 🔒 `deactivateEmergencyMode` (unknown, línea 300)
- 🔒 `optimize` (unknown, línea 314)
- 🔒 `getStatus` (unknown, línea 352)
- 🔒 `shutdown` (unknown, línea 368)

**Clases (1):**
- 🔄 `PerformanceController` (línea 9)
  - Métodos: `if`, `initialize`, `catch`, `initializeComponents`, `executeOptimizedQuery`, `executeConcurrentOperations`, `allocateOptimizedMemory`, `getPerformanceMetrics`, `updateMetrics`, `triggerPerformanceDegradation`, `startPerformanceMonitoring`, `performanceHealthCheck`, `executeSequential`, `for`, `optimizeOperation`, `activateEmergencyMode`, `deactivateEmergencyMode`, `optimize`, `getStatus`, `shutdown`

**Imports (4):**
- 📁 `QueryOptimizer` desde `./QueryOptimizer`
- 📁 `MemoryManager` desde `./MemoryManager`
- 📁 `ConcurrentProcessor` desde `./ConcurrentProcessor`
- 📁 `logger` desde `../../utils/logger`

**Exports (1):**
- 🔄 `PerformanceController` (commonjs)

#### 📄 QueryOptimizer.js

**Ruta:** `src\core\performance\QueryOptimizer.js`  
**Tamaño:** 14745 caracteres, 458 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (26):**
- 🔒 `setMode` (unknown, línea 5)
- 🔒 `if` (unknown, línea 8)
- 🔒 `optimize` (unknown, línea 25)
- 🔒 `optimizeCacheContents` (unknown, línea 59)
- 🔒 `cleanupFrequencyMap` (unknown, línea 75)
- 🔒 `constructor` (unknown, línea 91)
- 🔒 `executeOptimizedQuery` (unknown, línea 128)
- 🔒 `catch` (unknown, línea 161)
- 🔒 `findSemanticMatch` (unknown, línea 172)
- 🔒 `executeWithOptimization` (unknown, línea 193)
- 🔒 `preprocessQuery` (unknown, línea 210)
- 🔒 `calculateAdaptiveTTL` (unknown, línea 230)
- 🔒 `generateQueryKey` (unknown, línea 243)
- 🔒 `updatePerformanceMetrics` (unknown, línea 256)
- 🔒 `getPerformanceMetrics` (unknown, línea 267)
- 🔒 `hashString` (unknown, línea 282)
- 🔒 `for` (unknown, línea 284)
- 🔒 `updateFrequencyMap` (unknown, línea 292)
- 🔒 `createTimeoutPromise` (unknown, línea 297)
- 🔒 `enrichCachedResult` (unknown, línea 303)
- 🔒 `enrichResult` (unknown, línea 312)
- 🔒 `generateQueryVector` (unknown, línea 321)
- 🔒 `calculateSimilarity` (unknown, línea 326)
- 🔒 `extractContextualTerms` (unknown, línea 337)
- 🔒 `expandQueryWithContext` (unknown, línea 351)
- 🔒 `postProcessResult` (unknown, línea 361)

**Clases (1):**
- 🔄 `QueryOptimizer` (línea 90)
  - Métodos: `executeOptimizedQuery`, `if`, `catch`, `findSemanticMatch`, `executeWithOptimization`, `preprocessQuery`, `calculateAdaptiveTTL`, `generateQueryKey`, `updatePerformanceMetrics`, `getPerformanceMetrics`, `hashString`, `for`, `updateFrequencyMap`, `createTimeoutPromise`, `enrichCachedResult`, `enrichResult`, `generateQueryVector`, `calculateSimilarity`, `extractContextualTerms`, `expandQueryWithContext`, `postProcessResult`, `setMode`, `optimize`, `optimizeCacheContents`, `cleanupFrequencyMap`

**Imports (2):**
- 📁 `logger` desde `../../utils/logger`
- 📦 `LRU` desde `lru-cache`

**Exports (1):**
- 🔄 `QueryOptimizer` (commonjs)

---

### 📁 src\core\resilience

**Archivos encontrados:** 5

#### 📄 AdvancedCircuitBreaker.js

**Ruta:** `src\core\resilience\AdvancedCircuitBreaker.js`  
**Tamaño:** 15575 caracteres, 486 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (21):**
- 🔒 `constructor` (unknown, línea 8)
- 🔒 `execute` (unknown, línea 67)
- 🔒 `catch` (unknown, línea 85)
- 🔒 `checkCircuitState` (unknown, línea 95)
- 🔒 `switch` (unknown, línea 98)
- 🔒 `if` (unknown, línea 108)
- 🔒 `executeWithMonitoring` (unknown, línea 130)
- 🔒 `handleSuccess` (unknown, línea 170)
- 🔒 `handleFailure` (unknown, línea 208)
- 🔒 `transitionToOpen` (unknown, línea 251)
- 🔒 `transitionToHalfOpen` (unknown, línea 276)
- 🔒 `transitionToClosed` (unknown, línea 298)
- 🔒 `shouldAdaptThreshold` (unknown, línea 321)
- 🔒 `adaptFailureThreshold` (unknown, línea 332)
- 🔒 `recordResponseTime` (unknown, línea 374)
- 🔒 `handleSlowResponse` (unknown, línea 395)
- 🔒 `startAdaptiveMonitoring` (unknown, línea 415)
- 🔒 `performHealthCheck` (unknown, línea 424)
- 🔒 `getMetrics` (unknown, línea 446)
- 🔒 `generateRequestId` (unknown, línea 460)
- 🔒 `forceState` (unknown, línea 467)

**Clases (1):**
- 🔄 `AdvancedCircuitBreaker` ← EventEmitter (línea 7)
  - Métodos: `execute`, `catch`, `checkCircuitState`, `switch`, `if`, `executeWithMonitoring`, `handleSuccess`, `handleFailure`, `transitionToOpen`, `transitionToHalfOpen`, `transitionToClosed`, `shouldAdaptThreshold`, `adaptFailureThreshold`, `recordResponseTime`, `handleSlowResponse`, `startAdaptiveMonitoring`, `performHealthCheck`, `getMetrics`, `generateRequestId`, `forceState`

**Imports (2):**
- 📁 `logger` desde `../../utils/logger`
- 📦 `EventEmitter` desde `events`

**Exports (1):**
- 🔄 `AdvancedCircuitBreaker` (commonjs)

#### 📄 GracefulDegradationManager.js

**Ruta:** `src\core\resilience\GracefulDegradationManager.js`  
**Tamaño:** 20699 caracteres, 654 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (33):**
- 🔒 `constructor` (unknown, línea 8)
- 🔒 `initializeServiceRegistry` (unknown, línea 60)
- 🔒 `registerService` (unknown, línea 87)
- 🔒 `reportServiceHealth` (unknown, línea 112)
- 🔒 `if` (unknown, línea 115)
- 🔒 `handleServiceFailure` (unknown, línea 152)
- 🔒 `handleServiceRecovery` (unknown, línea 176)
- 🔒 `applyServiceDegradation` (unknown, línea 198)
- 🔒 `switch` (unknown, línea 199)
- 🔒 `handleCriticalServiceFailure` (unknown, línea 215)
- 🔒 `handleImportantServiceFailure` (unknown, línea 231)
- 🔒 `handleOptionalServiceFailure` (unknown, línea 249)
- 🔒 `increaseDegradationLevel` (unknown, línea 262)
- 🔒 `decreaseDegradationLevel` (unknown, línea 286)
- 🔒 `applyDegradationMode` (unknown, línea 310)
- 🔒 `activateFullOperation` (unknown, línea 330)
- 🔒 `activatePartialDegradation` (unknown, línea 352)
- 🔒 `activateMinimalOperation` (unknown, línea 370)
- 🔒 `activateCriticalMode` (unknown, línea 396)
- 🔒 `disableFeature` (unknown, línea 417)
- 🔒 `enableFeature` (unknown, línea 435)
- 🔒 `isFeatureActive` (unknown, línea 453)
- 🔒 `evaluateSystemHealth` (unknown, línea 460)
- 🔒 `getUnhealthyServicesCount` (unknown, línea 488)
- 🔒 `adjustDegradationLevel` (unknown, línea 497)
- 🔒 `getDegradationMode` (unknown, línea 513)
- 🔒 `activateEmergencyProtocols` (unknown, línea 521)
- 🔒 `initiateEmergencyRecovery` (unknown, línea 540)
- 🔒 `initiateServiceRecovery` (unknown, línea 559)
- 🔒 `canEnableFeature` (unknown, línea 582)
- 🔒 `startHealthMonitoring` (unknown, línea 605)
- 🔒 `performHealthCheck` (unknown, línea 614)
- 🔒 `getSystemStatus` (unknown, línea 635)

**Clases (1):**
- 🔄 `GracefulDegradationManager` ← EventEmitter (línea 7)
  - Métodos: `initializeServiceRegistry`, `registerService`, `reportServiceHealth`, `if`, `handleServiceFailure`, `handleServiceRecovery`, `applyServiceDegradation`, `switch`, `handleCriticalServiceFailure`, `handleImportantServiceFailure`, `handleOptionalServiceFailure`, `increaseDegradationLevel`, `decreaseDegradationLevel`, `applyDegradationMode`, `activateFullOperation`, `activatePartialDegradation`, `activateMinimalOperation`, `activateCriticalMode`, `disableFeature`, `enableFeature`, `isFeatureActive`, `evaluateSystemHealth`, `getUnhealthyServicesCount`, `adjustDegradationLevel`, `getDegradationMode`, `activateEmergencyProtocols`, `initiateEmergencyRecovery`, `initiateServiceRecovery`, `canEnableFeature`, `startHealthMonitoring`, `performHealthCheck`, `getSystemStatus`

**Imports (2):**
- 📁 `logger` desde `../../utils/logger`
- 📦 `EventEmitter` desde `events`

**Exports (1):**
- 🔄 `GracefulDegradationManager` (commonjs)

#### 📄 HealthMonitoringSystem.js

**Ruta:** `src\core\resilience\HealthMonitoringSystem.js`  
**Tamaño:** 5054 caracteres, 132 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (10):**
- 🔒 `constructor` (unknown, línea 12)
- 🔒 `startMonitoring` (unknown, línea 22)
- 🔒 `if` (unknown, línea 23)
- 🔒 `stopMonitoring` (unknown, línea 34)
- 🔒 `runHealthChecks` (unknown, línea 46)
- 🔒 `for` (unknown, línea 50)
- 🔒 `catch` (unknown, línea 60)
- 🔒 `updateHealthStatus` (unknown, línea 89)
- 🔒 `analyzeTrends` (unknown, línea 109)
- 🔒 `getSystemHealth` (unknown, línea 125)

**Clases (1):**
- 🔒 `HealthMonitoringSystem` (línea 11)
  - Métodos: `startMonitoring`, `if`, `stopMonitoring`, `runHealthChecks`, `for`, `catch`, `updateHealthStatus`, `analyzeTrends`, `getSystemHealth`

**Imports (3):**
- 📁 `logger` desde `../../utils/logger`
- 📁 `services` desde `../../services/serviceRegistry`
- 📁 `selfHealingManager` desde `./SelfHealingManager`

**Exports (1):**
- 🔄 `healthMonitoringSystem` (commonjs)

#### 📄 ResilienceController.js

**Ruta:** `src\core\resilience\ResilienceController.js`  
**Tamaño:** 9774 caracteres, 267 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (15):**
- 🔒 `constructor` (unknown, línea 15)
- 🔒 `initialize` (unknown, línea 27)
- 🔒 `if` (unknown, línea 28)
- 🔒 `catch` (unknown, línea 56)
- 🔒 `shutdown` (unknown, línea 66)
- 🔒 `executeWithProtection` (unknown, línea 94)
- 🔒 `reportFailure` (unknown, línea 121)
- 🔒 `activateDegradationMode` (unknown, línea 129)
- 🔒 `notifyHealthChange` (unknown, línea 140)
- 🔒 `getOverallHealth` (unknown, línea 160)
- 🔒 `getSystemHealth` (unknown, línea 181)
- 🔒 `getStatus` (unknown, línea 194)
- 🔒 `optimize` (unknown, línea 210)
- 🔒 `getCircuitBreaker` (unknown, línea 251)
- 🔒 `getGracefulDegradationManager` (unknown, línea 259)

**Clases (1):**
- 🔒 `ResilienceController` (línea 14)
  - Métodos: `initialize`, `if`, `catch`, `shutdown`, `executeWithProtection`, `reportFailure`, `activateDegradationMode`, `notifyHealthChange`, `getOverallHealth`, `getSystemHealth`, `getStatus`, `optimize`, `getCircuitBreaker`, `getGracefulDegradationManager`

**Imports (6):**
- 📁 `logger` desde `../../utils/logger`
- 📁 `healthMonitoringSystem` desde `./HealthMonitoringSystem`
- 📁 `selfHealingManager` desde `./SelfHealingManager`
- 📁 `AdvancedCircuitBreaker` desde `./AdvancedCircuitBreaker`
- 📁 `GracefulDegradationManager` desde `./GracefulDegradationManager`
- 📁 `config` desde `../../utils/config`

**Exports (1):**
- 🔄 `resilienceController` (commonjs)

#### 📄 SelfHealingManager.js

**Ruta:** `src\core\resilience\SelfHealingManager.js`  
**Tamaño:** 5739 caracteres, 127 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (8):**
- 🔒 `constructor` (unknown, línea 11)
- 🔒 `reportFailure` (unknown, línea 23)
- 🔒 `if` (unknown, línea 29)
- 🔒 `initiateRecovery` (unknown, línea 53)
- 🔒 `catch` (unknown, línea 72)
- 🔒 `restartService` (unknown, línea 84)
- 🔒 `injectDependencies` (unknown, línea 102)
- 🔒 `validateRecovery` (unknown, línea 113)

**Clases (1):**
- 🔒 `SelfHealingManager` (línea 10)
  - Métodos: `reportFailure`, `if`, `initiateRecovery`, `catch`, `restartService`, `injectDependencies`, `validateRecovery`

**Imports (2):**
- 📁 `logger` desde `../../utils/logger`
- 📁 `services, restartService` desde `../../services/serviceRegistry`

**Exports (1):**
- 🔄 `selfHealingManager` (commonjs)

---

### 📁 src\database

**Archivos encontrados:** 1

#### 📄 pg.js

**Ruta:** `src\database\pg.js`  
**Tamaño:** 14010 caracteres, 384 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (15):**
- 🔒 `initializeDatabase` (function, línea 20)
- 🔒 `inspectAndNormalizeSchema` (function, línea 45)
- 🔒 `normalizeAdminUsersColumns` (function, línea 82)
- 🔒 `createBasicTablesWithInspection` (function, línea 115)
- 🔒 `createAdminUsersTableSafely` (function, línea 182)
- 🔒 `insertDefaultAdminSafely` (function, línea 216)
- 🔒 `verifyTables` (function, línea 250)
- 🔒 `getClientByNumber` (function, línea 285)
- 🔒 `addOrUpdateClient` (function, línea 298)
- 🔒 `buildConversationalContext` (function, línea 325)
- 🔒 `getTimeFrame` (function, línea 361)
- 🔒 `closeDatabase` (function, línea 367)
- 🔒 `catch` (unknown, línea 39)
- 🔒 `if` (unknown, línea 58)
- 🔒 `for` (unknown, línea 254)

**Imports (2):**
- 📦 `Pool` desde `pg`
- 📁 `logger` desde `../utils/logger`

**Exports (1):**
- 🔄 `{
    pool,
    initializeDatabase,
    getClientByNumber,
    addOrUpdateClient,
    buildConversationalContext,
    closeDatabase
}` (commonjs)

---

### 📁 src\excel

**Archivos encontrados:** 2

#### 📄 processor.js

**Ruta:** `src\excel\processor.js`  
**Tamaño:** 3733 caracteres, 116 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (6):**
- 🔒 `validateColumns` (function, línea 11)
- 🔒 `insertDataIntoDB` (function, línea 38)
- 🔒 `processExcelFile` (function, línea 83)
- 🔒 `if` (unknown, línea 20)
- 🔒 `for` (unknown, línea 27)
- 🔒 `catch` (unknown, línea 69)

**Imports (2):**
- 📦 `xlsx` desde `xlsx`
- 📁 `pool` desde `../database/pg`

**Exports (1):**
- 🔄 `{
    processExcelFile,
    validateColumns, // Exportado para pruebas unitarias si es necesario
}` (commonjs)

#### 📄 validator.js

**Ruta:** `src\excel\validator.js`  
**Tamaño:** 32 caracteres, 1 líneas  
**Tipo:** Script 

---

### 📁 src\monitoring

**Archivos encontrados:** 1

#### 📄 intelligentMonitor.js

**Ruta:** `src\monitoring\intelligentMonitor.js`  
**Tamaño:** 1493 caracteres, 51 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (4):**
- 🔒 `constructor` (unknown, línea 9)
- 🔒 `analyze` (unknown, línea 23)
- 🔒 `if` (unknown, línea 25)
- 🔒 `selfHeal` (unknown, línea 37)

**Clases (1):**
- 🔒 `IntelligentMonitor` ← EventEmitter (línea 8)
  - Métodos: `analyze`, `if`, `selfHeal`

**Imports (2):**
- 📦 `EventEmitter` desde `events`
- 📁 `logger` desde `../utils/logger`

**Exports (1):**
- 🔄 `{
    IntelligentMonitor,
    intelligentMonitor
}` (commonjs)

---

### 📁 src\responses

**Archivos encontrados:** 1

#### 📄 templates.js

**Ruta:** `src\responses\templates.js`  
**Tamaño:** 5895 caracteres, 148 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (11):**
- 🔒 `getGreeting` (function, línea 7)
- 🔒 `getAIPresentation` (function, línea 18)
- 🔒 `welcomeNewUser` (function, línea 26)
- 🔒 `welcomeBackUser` (function, línea 35)
- 🔒 `askForName` (function, línea 43)
- 🔒 `formatRepairInfo` (function, línea 52)
- 🔒 `notFound` (function, línea 75)
- 🔒 `generalError` (function, línea 83)
- 🔒 `adminModeActivated` (function, línea 88)
- 🔒 `adminModeDeactivated` (function, línea 92)
- 🔒 `adminHelp` (function, línea 96)

**Exports (1):**
- 🔄 `{
    getGreeting,
    getAIPresentation,
    welcomeNewUser,
    welcomeBackUser,
    askForName,
    formatRepairInfo,
    notFound,
    generalError,
    adminModeActivated,
    adminModeDeactivated,
    adminHelp,
}` (commonjs)

---

### 📁 src\scripts

**Archivos encontrados:** 13

#### Grupo 1

#### 📄 architectural_health_check.js

**Ruta:** `src\scripts\architectural_health_check.js`  
**Tamaño:** 4919 caracteres, 130 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (3):**
- 🔒 `architecturalHealthCheck` (function, línea 6)
- 🔒 `if` (unknown, línea 20)
- 🔒 `catch` (unknown, línea 27)

**Imports (2):**
- 📁 `logger` desde `../utils/logger`
- 📦 `Pool` desde `pg`

**Exports (1):**
- 🔄 `{ architecturalHealthCheck }` (commonjs)

#### 📄 clear_cache_collection.js

**Ruta:** `src\scripts\clear_cache_collection.js`  
**Tamaño:** 1362 caracteres, 29 líneas  
**Tipo:** Script 

**Funciones (2):**
- 🔒 `clearCacheCollection` (function, línea 11)
- 🔒 `catch` (unknown, línea 22)

**Imports (2):**
- 📦 `ChromaClient` desde `chromadb`
- 📁 `logger` desde `../utils/logger`

#### 📄 convertMarkdownToPostgreSQL.js

**Ruta:** `src\scripts\convertMarkdownToPostgreSQL.js`  
**Tamaño:** 16053 caracteres, 467 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (16):**
- 🔒 `constructor` (unknown, línea 25)
- 🔒 `executeMigration` (unknown, línea 46)
- 🔒 `catch` (unknown, línea 64)
- 🔒 `verifyMarkdownFiles` (unknown, línea 73)
- 🔒 `if` (unknown, línea 82)
- 🔒 `cleanCurrentData` (unknown, línea 101)
- 🔒 `processAllMarkdownFiles` (unknown, línea 136)
- 🔒 `for` (unknown, línea 141)
- 🔒 `processSingleMarkdownFile` (unknown, línea 151)
- 🔒 `parseMarkdownTable` (unknown, línea 209)
- 🔒 `parseTableHeader` (unknown, línea 253)
- 🔒 `parseTableRow` (unknown, línea 276)
- 🔒 `parsePrice` (unknown, línea 330)
- 🔒 `normalizeModel` (unknown, línea 342)
- 🔒 `insertRecord` (unknown, línea 356)
- 🔒 `generateMigrationReport` (unknown, línea 399)

**Clases (1):**
- 🔄 `MarkdownToPostgreSQLConverter` (línea 24)
  - Métodos: `executeMigration`, `catch`, `verifyMarkdownFiles`, `if`, `cleanCurrentData`, `processAllMarkdownFiles`, `for`, `processSingleMarkdownFile`, `parseMarkdownTable`, `parseTableHeader`, `parseTableRow`, `parsePrice`, `normalizeModel`, `insertRecord`, `generateMigrationReport`

**Imports (4):**
- 📦 `fs` desde `fs`
- 📦 `path` desde `path`
- 📁 `pool` desde `../database/pg`
- 📁 `logger` desde `../utils/logger`

**Exports (1):**
- 🔄 `MarkdownToPostgreSQLConverter` (commonjs)

#### 📄 generateSQLFromExcel.js

**Ruta:** `src\scripts\generateSQLFromExcel.js`  
**Tamaño:** 9376 caracteres, 293 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (14):**
- 🔒 `constructor` (unknown, línea 12)
- 🔒 `processTestFiles` (unknown, línea 21)
- 🔒 `for` (unknown, línea 31)
- 🔒 `processExcelFile` (unknown, línea 41)
- 🔒 `catch` (unknown, línea 71)
- 🔒 `parseSheetData` (unknown, línea 79)
- 🔒 `if` (unknown, línea 91)
- 🔒 `looksLikeHeader` (unknown, línea 102)
- 🔒 `detectColumns` (unknown, línea 115)
- 🔒 `parseDataRowDirect` (unknown, línea 145)
- 🔒 `parseDataRow` (unknown, línea 187)
- 🔒 `normalizeModel` (unknown, línea 216)
- 🔒 `generateInsertSQL` (unknown, línea 229)
- 🔒 `generateSQLFile` (unknown, línea 242)

**Clases (1):**
- 🔄 `SQLGenerator` (línea 11)
  - Métodos: `processTestFiles`, `for`, `processExcelFile`, `catch`, `parseSheetData`, `if`, `looksLikeHeader`, `detectColumns`, `parseDataRowDirect`, `parseDataRow`, `normalizeModel`, `generateInsertSQL`, `generateSQLFile`

**Imports (3):**
- 📦 `XLSX` desde `xlsx`
- 📦 `path` desde `path`
- 📦 `fs` desde `fs`

**Exports (1):**
- 🔄 `SQLGenerator` (commonjs)

#### 📄 importExcelData.js

**Ruta:** `src\scripts\importExcelData.js`  
**Tamaño:** 9412 caracteres, 298 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (13):**
- 🔒 `constructor` (unknown, línea 13)
- 🔒 `importTestFiles` (unknown, línea 23)
- 🔒 `for` (unknown, línea 34)
- 🔒 `processExcelFile` (unknown, línea 44)
- 🔒 `catch` (unknown, línea 76)
- 🔒 `parseSheetData` (unknown, línea 85)
- 🔒 `if` (unknown, línea 116)
- 🔒 `looksLikeHeader` (unknown, línea 127)
- 🔒 `detectColumns` (unknown, línea 144)
- 🔒 `parseDataRow` (unknown, línea 182)
- 🔒 `normalizeModel` (unknown, línea 213)
- 🔒 `insertRepairData` (unknown, línea 227)
- 🔒 `printSummary` (unknown, línea 267)

**Clases (1):**
- 🔄 `ExcelDataImporter` (línea 12)
  - Métodos: `importTestFiles`, `for`, `processExcelFile`, `catch`, `parseSheetData`, `if`, `looksLikeHeader`, `detectColumns`, `parseDataRow`, `normalizeModel`, `insertRepairData`, `printSummary`

**Imports (4):**
- 📦 `XLSX` desde `xlsx`
- 📦 `path` desde `path`
- 📁 `pool` desde `../database/pg`
- 📁 `logger` desde `../utils/logger`

**Exports (1):**
- 🔄 `ExcelDataImporter` (commonjs)

#### Grupo 2

#### 📄 index_intentions.js

**Ruta:** `src\scripts\index_intentions.js`  
**Tamaño:** 2976 caracteres, 87 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (5):**
- 🔒 `indexIntentions` (function, línea 35)
- 🔒 `constructor` (unknown, línea 17)
- 🔒 `generate` (unknown, línea 21)
- 🔒 `catch` (unknown, línea 28)
- 🔒 `if` (unknown, línea 40)

**Clases (1):**
- 🔒 `LangChainEmbeddingAdapter` (línea 16)
  - Métodos: `generate`, `catch`

**Imports (4):**
- 📦 `ChromaClient` desde `chromadb`
- 📁 `embeddingEngine` desde `../services/embeddingEngine`
- 📁 `intentionsData` desde `../../intentions_dataset.json`
- 📁 `logger` desde `../utils/logger`

**Exports (1):**
- 🔄 `{ indexIntentions }` (commonjs)

#### 📄 index_knowledge.js

**Ruta:** `src\scripts\index_knowledge.js`  
**Tamaño:** 4941 caracteres, 127 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (5):**
- 🔒 `indexKnowledge` (function, línea 38)
- 🔒 `constructor` (unknown, línea 20)
- 🔒 `generate` (unknown, línea 24)
- 🔒 `catch` (unknown, línea 31)
- 🔒 `if` (unknown, línea 44)

**Clases (1):**
- 🔒 `LangChainEmbeddingAdapter` (línea 19)
  - Métodos: `generate`, `catch`

**Imports (6):**
- 📦 `ChromaClient` desde `chromadb`
- 📁 `embeddingEngine` desde `../services/embeddingEngine`
- 📁 `pool` desde `../database/pg`
- 📁 `logger` desde `../utils/logger`
- 📦 `fs` desde `fs`
- 📦 `path` desde `path`

**Exports (1):**
- 🔄 `{ indexKnowledge }` (commonjs)

#### 📄 index_markdown_prices.js

**Ruta:** `src\scripts\index_markdown_prices.js`  
**Tamaño:** 9208 caracteres, 254 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (6):**
- 🔒 `processMarkdownFile` (function, línea 24)
- 🔒 `indexMarkdownPrices` (function, línea 100)
- 🔒 `cleanExistingPriceChunks` (function, línea 202)
- 🔒 `for` (unknown, línea 34)
- 🔒 `if` (unknown, línea 40)
- 🔒 `catch` (unknown, línea 133)

**Imports (5):**
- 📦 `fs` desde `fs`
- 📦 `path` desde `path`
- 📦 `ChromaClient` desde `chromadb`
- 📁 `embeddingEngine` desde `../services/embeddingEngine`
- 📁 `logger` desde `../utils/logger`

**Exports (1):**
- 🔄 `{
    indexMarkdownPrices,
    cleanExistingPriceChunks,
    processMarkdownFile
}` (commonjs)

#### 📄 migrate_to_task_prefixes.js

**Ruta:** `src\scripts\migrate_to_task_prefixes.js`  
**Tamaño:** 13113 caracteres, 351 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (11):**
- 🔒 `checkCollections` (function, línea 22)
- 🔒 `getCollectionStats` (function, línea 44)
- 🔒 `createCollectionBackup` (function, línea 74)
- 🔒 `planMigrationStrategy` (function, línea 128)
- 🔒 `executeMigrationStrategy` (function, línea 175)
- 🔒 `runMigration` (function, línea 258)
- 🔒 `catch` (unknown, línea 35)
- 🔒 `if` (unknown, línea 84)
- 🔒 `for` (unknown, línea 98)
- 🔒 `switch` (unknown, línea 185)
- 🔒 `then` (arrow, línea 331)

**Imports (2):**
- 📦 `ChromaClient` desde `chromadb`
- 📁 `logger` desde `../utils/logger`

**Exports (1):**
- 🔄 `{
    runMigration,
    checkCollections,
    getCollectionStats,
    createCollectionBackup
}` (commonjs)

#### 📄 migrateConversations.js

**Ruta:** `src\scripts\migrateConversations.js`  
**Tamaño:** 9293 caracteres, 249 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (10):**
- 🔒 `constructor` (unknown, línea 14)
- 🔒 `migrateAllConversations` (unknown, línea 23)
- 🔒 `if` (unknown, línea 30)
- 🔒 `for` (unknown, línea 44)
- 🔒 `catch` (unknown, línea 51)
- 🔒 `fetchExistingConversations` (unknown, línea 62)
- 🔒 `processConversation` (unknown, línea 95)
- 🔒 `extractConversationData` (unknown, línea 133)
- 🔒 `updateConversationWithChunkId` (unknown, línea 192)
- 🔒 `printMigrationSummary` (unknown, línea 207)

**Clases (1):**
- 🔄 `ConversationMigrator` (línea 13)
  - Métodos: `migrateAllConversations`, `if`, `for`, `catch`, `fetchExistingConversations`, `processConversation`, `extractConversationData`, `updateConversationWithChunkId`, `printMigrationSummary`

**Imports (3):**
- 📁 `pool` desde `../database/pg`
- 📁 `conversationMemory` desde `../services/conversationMemory`
- 📁 `logger` desde `../utils/logger`

**Exports (1):**
- 🔄 `ConversationMigrator` (commonjs)

#### Grupo 3

#### 📄 run_evals.js

**Ruta:** `src\scripts\run_evals.js`  
**Tamaño:** 3228 caracteres, 83 líneas  
**Tipo:** Script 

**Funciones (4):**
- 🔒 `runEvals` (function, línea 12)
- 🔒 `for` (unknown, línea 32)
- 🔒 `catch` (unknown, línea 42)
- 🔒 `if` (unknown, línea 51)

**Imports (5):**
- 📦 `fs` desde `fs`
- 📦 `path` desde `path`
- 📁 `SimpleAgentExecutor` desde `../services/simpleAgentExecutor`
- 📁 `initializeDatabase` desde `../database/pg`
- 📁 `logger` desde `../utils/logger`

#### 📄 seed_proactive_knowledge.js

**Ruta:** `src\scripts\seed_proactive_knowledge.js`  
**Tamaño:** 3687 caracteres, 67 líneas  
**Tipo:** Script 

**Funciones (4):**
- 🔒 `seedKnowledge` (function, línea 28)
- 🔒 `if` (unknown, línea 39)
- 🔒 `for` (unknown, línea 46)
- 🔒 `catch` (unknown, línea 57)

**Imports (2):**
- 📁 `pool` desde `../database/pg`
- 📁 `logger` desde `../utils/logger`

#### 📄 verifyMigration.js

**Ruta:** `src\scripts\verifyMigration.js`  
**Tamaño:** 10326 caracteres, 246 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (8):**
- 🔒 `constructor` (unknown, línea 13)
- 🔒 `verifyMigration` (unknown, línea 24)
- 🔒 `catch` (unknown, línea 41)
- 🔒 `verifyPostgreSQL` (unknown, línea 51)
- 🔒 `verifyChromaDB` (unknown, línea 96)
- 🔒 `if` (unknown, línea 104)
- 🔒 `verifyIntegration` (unknown, línea 126)
- 🔒 `printVerificationResults` (unknown, línea 168)

**Clases (1):**
- 🔄 `MigrationVerifier` (línea 12)
  - Métodos: `verifyMigration`, `catch`, `verifyPostgreSQL`, `verifyChromaDB`, `if`, `verifyIntegration`, `printVerificationResults`

**Imports (4):**
- 📁 `pool` desde `../database/pg`
- 📁 `conversationMemory` desde `../services/conversationMemory`
- 📁 `logger` desde `../utils/logger`
- 📁 `tools` desde `../services/tools`

**Exports (1):**
- 🔄 `MigrationVerifier` (commonjs)

---

### 📁 src\security

**Archivos encontrados:** 3

#### 📄 advancedRateLimiter.js

**Ruta:** `src\security\advancedRateLimiter.js`  
**Tamaño:** 26918 caracteres, 802 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (31):**
- 🔒 `constructor` (unknown, línea 19)
- 🔒 `refill` (unknown, línea 28)
- 🔒 `if` (unknown, línea 33)
- 🔒 `consume` (unknown, línea 39)
- 🔒 `peek` (unknown, línea 50)
- 🔒 `getWaitTime` (unknown, línea 55)
- 🔒 `getInfo` (unknown, línea 66)
- 🔒 `cleanExpiredRequests` (unknown, línea 89)
- 🔒 `addRequest` (unknown, línea 95)
- 🔒 `getCurrentCount` (unknown, línea 101)
- 🔒 `getResetTime` (unknown, línea 106)
- 🔒 `recordActivity` (unknown, línea 143)
- 🔒 `analyzePattern` (unknown, línea 174)
- 🔒 `for` (unknown, línea 195)
- 🔒 `flagAsSuspicious` (unknown, línea 221)
- 🔒 `addToBlacklist` (unknown, línea 244)
- 🔒 `removeFromBlacklist` (unknown, línea 255)
- 🔒 `isBlacklisted` (unknown, línea 264)
- 🔒 `isSuspicious` (unknown, línea 268)
- 🔒 `getClientInfo` (unknown, línea 272)
- 🔒 `cleanup` (unknown, línea 280)
- 🔒 `getUserLimits` (unknown, línea 389)
- 🔒 `getOrCreateClientBucket` (unknown, línea 397)
- 🔒 `checkRateLimit` (unknown, línea 435)
- 🔒 `catch` (unknown, línea 571)
- 🔒 `updateClientLimits` (unknown, línea 589)
- 🔒 `getClientStats` (unknown, línea 610)
- 🔒 `getSystemMetrics` (unknown, línea 631)
- 🔒 `destroy` (unknown, línea 689)
- 🔒 `enableBypass` (unknown, línea 717)
- 🔒 `middleware` (unknown, línea 722)

**Clases (5):**
- 🔒 `TokenBucket` (línea 18)
  - Métodos: `refill`, `if`, `consume`, `peek`, `getWaitTime`, `getInfo`
- 🔒 `SlidingWindowLimiter` (línea 81)
  - Métodos: `cleanExpiredRequests`, `addRequest`, `getCurrentCount`, `getResetTime`, `if`, `getInfo`
- 🔒 `AbusePatternDetector` (línea 131)
  - Métodos: `recordActivity`, `if`, `analyzePattern`, `for`, `flagAsSuspicious`, `addToBlacklist`, `removeFromBlacklist`, `isBlacklisted`, `isSuspicious`, `getClientInfo`, `cleanup`
- 🔒 `AdvancedRateLimiter` (línea 310)
  - Métodos: `getUserLimits`, `getOrCreateClientBucket`, `checkRateLimit`, `if`, `catch`, `updateClientLimits`, `getClientStats`, `getSystemMetrics`, `cleanup`, `for`, `destroy`
- 🔒 `RateLimitMiddleware` (línea 705)
  - Métodos: `enableBypass`, `middleware`, `if`, `catch`

**Imports (2):**
- 📦 `v4: uuidv4` desde `uuid`
- 📁 `logger` desde `../utils/logger`

**Exports (1):**
- 🔄 `{
    TokenBucket,
    SlidingWindowLimiter,
    AbusePatternDetector,
    AdvancedRateLimiter,
    RateLimitMiddleware
}` (commonjs)

#### 📄 authLayer.js

**Ruta:** `src\security\authLayer.js`  
**Tamaño:** 27539 caracteres, 850 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (41):**
- 🔒 `constructor` (unknown, línea 21)
- 🔒 `matches` (unknown, línea 29)
- 🔒 `addPermission` (unknown, línea 45)
- 🔒 `removePermission` (unknown, línea 53)
- 🔒 `for` (unknown, línea 54)
- 🔒 `if` (unknown, línea 55)
- 🔒 `hasPermission` (unknown, línea 63)
- 🔒 `getPermissionsList` (unknown, línea 72)
- 🔒 `sanitizePhoneNumber` (unknown, línea 104)
- 🔒 `addRole` (unknown, línea 117)
- 🔒 `removeRole` (unknown, línea 126)
- 🔒 `hasRole` (unknown, línea 146)
- 🔒 `updateActivity` (unknown, línea 155)
- 🔒 `setTrustLevel` (unknown, línea 160)
- 🔒 `blockUntil` (unknown, línea 170)
- 🔒 `isBlocked` (unknown, línea 175)
- 🔒 `logAction` (unknown, línea 179)
- 🔒 `getHighestRoleLevel` (unknown, línea 194)
- 🔒 `toJSON` (unknown, línea 202)
- 🔒 `generateToken` (unknown, línea 240)
- 🔒 `validateToken` (unknown, línea 253)
- 🔒 `refreshActivity` (unknown, línea 267)
- 🔒 `isExpired` (unknown, línea 271)
- 🔒 `invalidate` (unknown, línea 275)
- 🔒 `initializeDefaultRoles` (unknown, línea 323)
- 🔒 `authenticateUser` (unknown, línea 362)
- 🔒 `catch` (unknown, línea 472)
- 🔒 `authorizeAction` (unknown, línea 488)
- 🔒 `checkRateLimit` (unknown, línea 566)
- 🔒 `resetRateLimit` (unknown, línea 622)
- 🔒 `getUserByPhone` (unknown, línea 634)
- 🔒 `getSession` (unknown, línea 638)
- 🔒 `blockUser` (unknown, línea 642)
- 🔒 `unblockUser` (unknown, línea 658)
- 🔒 `promoteUser` (unknown, línea 672)
- 🔒 `getMetrics` (unknown, línea 704)
- 🔒 `cleanup` (unknown, línea 730)
- 🔒 `enableBypass` (unknown, línea 770)
- 🔒 `authenticate` (unknown, línea 775)
- 🔒 `authorize` (unknown, línea 784)
- 🔒 `middleware` (unknown, línea 793)

**Clases (6):**
- 🔒 `Permission` (línea 20)
  - Métodos: `matches`
- 🔒 `Role` (línea 35)
  - Métodos: `addPermission`, `removePermission`, `for`, `if`, `hasPermission`, `getPermissionsList`
- 🔒 `WhatsAppUser` (línea 85)
  - Métodos: `sanitizePhoneNumber`, `addRole`, `removeRole`, `for`, `if`, `hasPermission`, `hasRole`, `updateActivity`, `setTrustLevel`, `blockUntil`, `isBlocked`, `logAction`, `getHighestRoleLevel`, `toJSON`
- 🔒 `Session` (línea 222)
  - Métodos: `generateToken`, `validateToken`, `if`, `refreshActivity`, `isExpired`, `invalidate`, `addPermission`, `hasPermission`
- 🔒 `AuthenticationManager` (línea 292)
  - Métodos: `initializeDefaultRoles`, `authenticateUser`, `if`, `catch`, `authorizeAction`, `checkRateLimit`, `resetRateLimit`, `sanitizePhoneNumber`, `getUserByPhone`, `getSession`, `blockUser`, `unblockUser`, `promoteUser`, `getMetrics`, `for`, `cleanup`
- 🔒 `AuthMiddleware` (línea 764)
  - Métodos: `enableBypass`, `authenticate`, `if`, `authorize`, `middleware`, `catch`

**Imports (4):**
- 📦 `crypto` desde `crypto`
- 📦 `v4: uuidv4` desde `uuid`
- 📁 `logger` desde `../utils/logger`
- 📁 `config` desde `../utils/config`

**Exports (1):**
- 🔄 `{
    Permission,
    Role,
    WhatsAppUser,
    Session,
    AuthenticationManager,
    AuthMiddleware
}` (commonjs)

#### 📄 inputValidator.js

**Ruta:** `src\security\inputValidator.js`  
**Tamaño:** 17865 caracteres, 536 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (16):**
- 🔒 `constructor` (unknown, línea 18)
- 🔒 `validate` (unknown, línea 24)
- 🔒 `createResult` (unknown, línea 28)
- 🔒 `for` (unknown, línea 61)
- 🔒 `if` (unknown, línea 143)
- 🔒 `addValidator` (unknown, línea 302)
- 🔒 `removeValidator` (unknown, línea 311)
- 🔒 `validateInput` (unknown, línea 319)
- 🔒 `catch` (unknown, línea 390)
- 🔒 `getMetrics` (unknown, línea 415)
- 🔒 `enableBypass` (unknown, línea 438)
- 🔒 `middleware` (unknown, línea 443)
- 🔒 `createDefault` (unknown, línea 504)
- 🔒 `createStrict` (unknown, línea 508)
- 🔒 `createPermissive` (unknown, línea 514)
- 🔒 `createMiddleware` (unknown, línea 520)

**Clases (9):**
- 🔒 `ValidationRule` (línea 17)
  - Métodos: `validate`, `createResult`
- 🔒 `SQLInjectionValidator` ← ValidationRule (línea 45)
  - Métodos: `validate`, `for`
- 🔒 `XSSValidator` ← ValidationRule (línea 86)
  - Métodos: `validate`, `for`
- 🔒 `LengthValidator` ← ValidationRule (línea 132)
  - Métodos: `validate`, `if`
- 🔒 `EncodingValidator` ← ValidationRule (línea 177)
  - Métodos: `validate`, `for`, `if`
- 🔒 `BusinessRuleValidator` ← ValidationRule (línea 236)
  - Métodos: `validate`, `for`, `if`
- 🔒 `InputValidationChain` (línea 281)
  - Métodos: `addValidator`, `removeValidator`, `if`, `validateInput`, `for`, `catch`, `getMetrics`
- 🔒 `ValidationMiddleware` (línea 432)
  - Métodos: `enableBypass`, `middleware`, `if`, `catch`
- 🔒 `InputValidatorFactory` (línea 503)
  - Métodos: `createDefault`, `createStrict`, `createPermissive`, `createMiddleware`

**Imports (2):**
- 📁 `logger` desde `../utils/logger`
- 📦 `v4: uuidv4` desde `uuid`

**Exports (1):**
- 🔄 `{
    ValidationRule,
    SQLInjectionValidator,
    XSSValidator,
    LengthValidator,
    EncodingValidator,
    BusinessRuleValidator,
    InputValidationChain,
    ValidationMiddleware,
    InputValidatorFactory
}` (commonjs)

---

### 📁 src\services

**Archivos encontrados:** 21

#### Grupo 1

#### 📄 agentExecutor.js

**Ruta:** `src\services\agentExecutor.js`  
**Tamaño:** 5577 caracteres, 160 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (5):**
- 🔒 `constructor` (unknown, línea 15)
- 🔒 `initialize` (unknown, línea 92)
- 🔒 `execute` (unknown, línea 110)
- 🔒 `if` (unknown, línea 118)
- 🔒 `catch` (unknown, línea 126)

**Clases (4):**
- 🔒 `OllamaError` ← Error (línea 14)
- 🔒 `ToolError` ← Error (línea 21)
- 🔒 `ValidationError` ← Error (línea 28)
- 🔒 `SalvaCellAgentExecutor` (línea 35)
  - Métodos: `initialize`, `execute`, `if`, `catch`

**Imports (9):**
- 📦 `AgentExecutor, createReactAgent` desde `langchain/agents`
- 📦 `ChatOllama` desde `@langchain/community/chat_models/ollama`
- 📦 `PromptTemplate` desde `@langchain/core/prompts`
- 📦 `RateLimiterMemory` desde `rate-limiter-flexible`
- 📁 `tools` desde `./tools`
- 📁 `logger` desde `../utils/logger`
- 📁 `config` desde `../utils/config`
- 📁 `findInCache, addToCache` desde `./semanticCache`
- 📁 `Guardrails` desde `./guardrails`

**Exports (1):**
- 🔄 `{ SalvaCellAgentExecutor, OllamaError, ToolError, ValidationError }` (commonjs)

#### 📄 clientHistorySearchEngine.js

**Ruta:** `src\services\clientHistorySearchEngine.js`  
**Tamaño:** 24743 caracteres, 804 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (28):**
- 🔒 `constructor` (unknown, línea 21)
- 🔒 `searchClientHistory` (unknown, línea 64)
- 🔒 `if` (unknown, línea 73)
- 🔒 `catch` (unknown, línea 122)
- 🔒 `normalizeClientIdentifier` (unknown, línea 135)
- 🔒 `searchByAlternativeIdentifiers` (unknown, línea 191)
- 🔒 `for` (unknown, línea 195)
- 🔒 `generateAlternativeIdentifiers` (unknown, línea 223)
- 🔒 `formatClientHistory` (unknown, línea 260)
- 🔒 `extractClientProfile` (unknown, línea 307)
- 🔒 `groupByIntent` (unknown, línea 431)
- 🔒 `analyzeTemporalPatterns` (unknown, línea 481)
- 🔒 `searchInClientHistory` (unknown, línea 509)
- 🔒 `processSearchResults` (unknown, línea 579)
- 🔒 `removeDuplicateResults` (unknown, línea 600)
- 🔒 `calculateInteractionFrequency` (unknown, línea 615)
- 🔒 `calculateProfileConfidence` (unknown, línea 626)
- 🔒 `enrichResultsWithClientContext` (unknown, línea 644)
- 🔒 `calculateProfileRelevance` (unknown, línea 661)
- 🔒 `getAppliedFilters` (unknown, línea 677)
- 🔒 `getEmptyClientHistory` (unknown, línea 686)
- 🔒 `getCachedResult` (unknown, línea 708)
- 🔒 `cacheResult` (unknown, línea 721)
- 🔒 `generateCacheKey` (unknown, línea 734)
- 🔒 `cleanExpiredCache` (unknown, línea 743)
- 🔒 `getSearchStats` (unknown, línea 755)
- 🔒 `clearCache` (unknown, línea 780)
- 🔒 `resetMetrics` (unknown, línea 788)

**Clases (1):**
- 🔒 `ClientHistorySearchEngine` (línea 20)
  - Métodos: `searchClientHistory`, `if`, `catch`, `normalizeClientIdentifier`, `searchByAlternativeIdentifiers`, `for`, `generateAlternativeIdentifiers`, `formatClientHistory`, `extractClientProfile`, `groupByIntent`, `analyzeTemporalPatterns`, `searchInClientHistory`, `processSearchResults`, `removeDuplicateResults`, `calculateInteractionFrequency`, `calculateProfileConfidence`, `enrichResultsWithClientContext`, `calculateProfileRelevance`, `getAppliedFilters`, `getEmptyClientHistory`, `getCachedResult`, `cacheResult`, `generateCacheKey`, `cleanExpiredCache`, `getSearchStats`, `clearCache`, `resetMetrics`

**Imports (1):**
- 📁 `logger` desde `../utils/logger`

**Exports (1):**
- 🔄 `{
    ClientHistorySearchEngine
}` (commonjs)

#### 📄 conversationMemory.js

**Ruta:** `src\services\conversationMemory.js`  
**Tamaño:** 38386 caracteres, 1234 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (32):**
- 🔒 `constructor` (unknown, línea 55)
- 🔒 `generate` (unknown, línea 64)
- 🔒 `switch` (unknown, línea 72)
- 🔒 `catch` (unknown, línea 86)
- 🔒 `generateQuery` (unknown, línea 98)
- 🔒 `generateDocument` (unknown, línea 111)
- 🔒 `initialize` (unknown, línea 195)
- 🔒 `if` (unknown, línea 197)
- 🔒 `storeConversationChunk` (unknown, línea 227)
- 🔒 `for` (unknown, línea 260)
- 🔒 `searchConversationMemory` (unknown, línea 377)
- 🔒 `searchConversationMemoryFallback` (unknown, línea 484)
- 🔒 `getClientMemory` (unknown, línea 535)
- 🔒 `getClientMemoryFallback` (unknown, línea 630)
- 🔒 `storeTraditionalChunk` (unknown, línea 682)
- 🔒 `createChunkText` (unknown, línea 746)
- 🔒 `buildWhereFilter` (unknown, línea 753)
- 🔒 `classifyResponseType` (unknown, línea 782)
- 🔒 `getHourCategory` (unknown, línea 798)
- 🔒 `storeInPostgreSQL` (unknown, línea 808)
- 🔒 `ensureInitialized` (unknown, línea 846)
- 🔒 `getMemoryStats` (unknown, línea 859)
- 🔒 `calculateSystemHealth` (unknown, línea 899)
- 🔒 `getRecentChunksForDeduplication` (unknown, línea 943)
- 🔒 `searchClientHistory` (unknown, línea 983)
- 🔒 `searchInClientHistory` (unknown, línea 1005)
- 🔒 `getClientProfile` (unknown, línea 1030)
- 🔒 `findSimilarClients` (unknown, línea 1059)
- 🔒 `calculateLoyaltyScore` (unknown, línea 1101)
- 🔒 `configureSemanticChunker` (unknown, línea 1136)
- 🔒 `configureMetadataEnhancer` (unknown, línea 1148)
- 🔒 `getArchitecturalHealth` (unknown, línea 1160)

**Clases (2):**
- 🔒 `EnhancedLangChainEmbeddingAdapter` (línea 54)
  - Métodos: `generate`, `switch`, `catch`, `generateQuery`, `generateDocument`
- 🔒 `ConversationMemory` (línea 140)
  - Métodos: `initialize`, `if`, `catch`, `storeConversationChunk`, `for`, `switch`, `searchConversationMemory`, `searchConversationMemoryFallback`, `getClientMemory`, `getClientMemoryFallback`, `storeTraditionalChunk`, `createChunkText`, `buildWhereFilter`, `classifyResponseType`, `getHourCategory`, `storeInPostgreSQL`, `ensureInitialized`, `getMemoryStats`, `calculateSystemHealth`, `getRecentChunksForDeduplication`, `searchClientHistory`, `searchInClientHistory`, `getClientProfile`, `findSimilarClients`, `calculateLoyaltyScore`, `configureSemanticChunker`, `configureMetadataEnhancer`, `getArchitecturalHealth`

**Imports (12):**
- 📦 `ChromaClient` desde `chromadb`
- 📁 `pool` desde `../database/pg`
- 📁 `embeddingEngine, getEmbedding` desde `./embeddingEngine`
- 📁 `SemanticChunker` desde `./semanticChunker`
- 📁 `DeterministicSearchEngine` desde `./deterministicSearchEngine`
- 📁 `DynamicLimitOptimizer` desde `./dynamicLimitOptimizer`
- 📁 `MarkdownContextEnricher` desde `./markdownContextEnricher`
- 📁 `SimpleDeduplicationEngine` desde `./simpleDeduplicationEngine`
- 📁 `MetadataEnhancer` desde `./metadataEnhancer`
- 📁 `ClientHistorySearchEngine` desde `./clientHistorySearchEngine`
- 📁 `logger` desde `../utils/logger`
- 📦 `URL` desde `url`

**Exports (1):**
- 🔄 `{
  ConversationMemory,
  conversationMemory,
}` (commonjs)

#### 📄 deterministicSearchEngine.js

**Ruta:** `src\services\deterministicSearchEngine.js`  
**Tamaño:** 27880 caracteres, 723 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (27):**
- 🔒 `constructor` (unknown, línea 22)
- 🔒 `performStabilizedSearch` (unknown, línea 118)
- 🔒 `if` (unknown, línea 132)
- 🔒 `catch` (unknown, línea 168)
- 🔒 `performMultipleSearches` (unknown, línea 182)
- 🔒 `for` (unknown, línea 187)
- 🔒 `performSingleSearch` (unknown, línea 217)
- 🔒 `stabilizeResults` (unknown, línea 249)
- 🔒 `enrichWithMarkdownContext` (unknown, línea 344)
- 🔒 `detectQueryContext` (unknown, línea 398)
- 🔒 `generateQueryHash` (unknown, línea 429)
- 🔒 `normalizeFilters` (unknown, línea 449)
- 🔒 `getCachedResult` (unknown, línea 465)
- 🔒 `cacheResults` (unknown, línea 482)
- 🔒 `getCacheByContext` (unknown, línea 500)
- 🔒 `switch` (unknown, línea 501)
- 🔒 `cleanupCache` (unknown, línea 515)
- 🔒 `invalidatePriceCache` (unknown, línea 543)
- 🔒 `performFallbackSearch` (unknown, línea 555)
- 🔒 `containsAny` (unknown, línea 575)
- 🔒 `buildWhereFilter` (unknown, línea 579)
- 🔒 `recordMetrics` (unknown, línea 609)
- 🔒 `getDeterminismStats` (unknown, línea 632)
- 🔒 `getContextHealth` (unknown, línea 659)
- 🔒 `calculateContextHealth` (unknown, línea 675)
- 🔒 `performMaintenance` (unknown, línea 690)
- 🔒 `resetMetrics` (unknown, línea 707)

**Clases (1):**
- 🔒 `DeterministicSearchEngine` (línea 21)
  - Métodos: `performStabilizedSearch`, `if`, `catch`, `performMultipleSearches`, `for`, `performSingleSearch`, `stabilizeResults`, `enrichWithMarkdownContext`, `detectQueryContext`, `generateQueryHash`, `normalizeFilters`, `getCachedResult`, `cacheResults`, `getCacheByContext`, `switch`, `cleanupCache`, `invalidatePriceCache`, `performFallbackSearch`, `containsAny`, `buildWhereFilter`, `recordMetrics`, `getDeterminismStats`, `getContextHealth`, `calculateContextHealth`, `performMaintenance`, `resetMetrics`

**Imports (2):**
- 📦 `crypto` desde `crypto`
- 📁 `logger` desde `../utils/logger`

**Exports (1):**
- 🔄 `{
    DeterministicSearchEngine
}` (commonjs)

#### 📄 dynamicLimitOptimizer.js

**Ruta:** `src\services\dynamicLimitOptimizer.js`  
**Tamaño:** 22909 caracteres, 589 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (22):**
- 🔒 `constructor` (unknown, línea 21)
- 🔒 `optimizeLimits` (unknown, línea 147)
- 🔒 `catch` (unknown, línea 187)
- 🔒 `analyzeQueryComplexity` (unknown, línea 198)
- 🔒 `if` (unknown, línea 209)
- 🔒 `detectQueryContext` (unknown, línea 252)
- 🔒 `isMultiDeviceQuery` (unknown, línea 293)
- 🔒 `calculateOptimalLimits` (unknown, línea 316)
- 🔒 `applySafetyConstraints` (unknown, línea 361)
- 🔒 `determineSearchStrategy` (unknown, línea 388)
- 🔒 `estimateSearchTime` (unknown, línea 404)
- 🔒 `getComplexityWeight` (unknown, línea 429)
- 🔒 `getComplexityLevel` (unknown, línea 440)
- 🔒 `containsAny` (unknown, línea 447)
- 🔒 `getFallbackLimits` (unknown, línea 451)
- 🔒 `recordOptimization` (unknown, línea 470)
- 🔒 `updateAverage` (unknown, línea 498)
- 🔒 `getOptimizationStats` (unknown, línea 505)
- 🔒 `getContextHealth` (unknown, línea 516)
- 🔒 `calculateSystemHealth` (unknown, línea 538)
- 🔒 `performMaintenance` (unknown, línea 561)
- 🔒 `resetOldMetrics` (unknown, línea 573)

**Clases (1):**
- 🔒 `DynamicLimitOptimizer` (línea 20)
  - Métodos: `optimizeLimits`, `catch`, `analyzeQueryComplexity`, `if`, `detectQueryContext`, `isMultiDeviceQuery`, `calculateOptimalLimits`, `applySafetyConstraints`, `determineSearchStrategy`, `estimateSearchTime`, `getComplexityWeight`, `getComplexityLevel`, `containsAny`, `getFallbackLimits`, `recordOptimization`, `updateAverage`, `getOptimizationStats`, `getContextHealth`, `calculateSystemHealth`, `performMaintenance`, `resetOldMetrics`

**Imports (1):**
- 📁 `logger` desde `../utils/logger`

**Exports (1):**
- 🔄 `{
    DynamicLimitOptimizer
}` (commonjs)

#### Grupo 2

#### 📄 embeddingCircuitBreaker.js

**Ruta:** `src\services\embeddingCircuitBreaker.js`  
**Tamaño:** 20809 caracteres, 605 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (33):**
- 🔒 `constructor` (unknown, línea 21)
- 🔒 `execute` (unknown, línea 85)
- 🔒 `if` (unknown, línea 96)
- 🔒 `catch` (unknown, línea 108)
- 🔒 `canExecuteOperation` (unknown, línea 125)
- 🔒 `switch` (unknown, línea 128)
- 🔒 `canExecuteInDegradedMode` (unknown, línea 166)
- 🔒 `executeWithTimeout` (unknown, línea 196)
- 🔒 `handleBlockedOperation` (unknown, línea 219)
- 🔒 `recordSuccess` (unknown, línea 238)
- 🔒 `recordFailure` (unknown, línea 261)
- 🔒 `checkStateTransitionsOnSuccess` (unknown, línea 285)
- 🔒 `checkStateTransitionsOnFailure` (unknown, línea 305)
- 🔒 `transitionToClosed` (unknown, línea 334)
- 🔒 `transitionToOpen` (unknown, línea 341)
- 🔒 `transitionToHalfOpen` (unknown, línea 351)
- 🔒 `transitionToDegraded` (unknown, línea 359)
- 🔒 `shouldAttemptRecovery` (unknown, línea 372)
- 🔒 `shouldUseDegradedMode` (unknown, línea 376)
- 🔒 `isOperationCritical` (unknown, línea 385)
- 🔒 `initializeFallbackStrategies` (unknown, línea 409)
- 🔒 `hasFallbackStrategy` (unknown, línea 448)
- 🔒 `executeFallback` (unknown, línea 453)
- 🔒 `getTimeoutForContext` (unknown, línea 485)
- 🔒 `generateOperationId` (unknown, línea 499)
- 🔒 `recordOperationAttempt` (unknown, línea 503)
- 🔒 `addToHistory` (unknown, línea 507)
- 🔒 `resetMetrics` (unknown, línea 516)
- 🔒 `notifyStateChange` (unknown, línea 522)
- 🔒 `getStatus` (unknown, línea 541)
- 🔒 `calculateHealthScore` (unknown, línea 571)
- 🔒 `getOperationHistory` (unknown, línea 588)
- 🔒 `reset` (unknown, línea 592)

**Clases (1):**
- 🔒 `EmbeddingCircuitBreaker` (línea 20)
  - Métodos: `execute`, `if`, `catch`, `canExecuteOperation`, `switch`, `canExecuteInDegradedMode`, `executeWithTimeout`, `handleBlockedOperation`, `recordSuccess`, `recordFailure`, `checkStateTransitionsOnSuccess`, `checkStateTransitionsOnFailure`, `transitionToClosed`, `transitionToOpen`, `transitionToHalfOpen`, `transitionToDegraded`, `shouldAttemptRecovery`, `shouldUseDegradedMode`, `isOperationCritical`, `initializeFallbackStrategies`, `hasFallbackStrategy`, `executeFallback`, `getTimeoutForContext`, `generateOperationId`, `recordOperationAttempt`, `addToHistory`, `resetMetrics`, `notifyStateChange`, `getStatus`, `calculateHealthScore`, `getOperationHistory`, `reset`

**Imports (1):**
- 📁 `logger` desde `../utils/logger`

**Exports (1):**
- 🔄 `{
    EmbeddingCircuitBreaker
}` (commonjs)

#### 📄 embeddingEngine.js

**Ruta:** `src\services\embeddingEngine.js`  
**Tamaño:** 1861 caracteres, 39 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (3):**
- 🔒 `getEmbeddingEngine` (function, línea 15)
- 🔒 `if` (unknown, línea 16)
- 🔒 `catch` (unknown, línea 28)

**Imports (3):**
- 📦 `OllamaEmbeddings` desde `@langchain/community/embeddings/ollama`
- 📁 `logger` desde `../utils/logger`
- 📁 `retryHandler` desde `../utils/retryHandler`

**Exports (1):**
- 🔄 `{
    getEmbeddingEngine // Solo exportar la función, la instancia se obtiene asíncronamente
}` (commonjs)

#### 📄 guardrails.js

**Ruta:** `src\services\guardrails.js`  
**Tamaño:** 5443 caracteres, 133 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (10):**
- 🔒 `constructor` (unknown, línea 11)
- 🔒 `processResponse` (unknown, línea 30)
- 🔒 `for` (unknown, línea 34)
- 🔒 `if` (unknown, línea 36)
- 🔒 `checkNoPromises` (unknown, línea 59)
- 🔒 `checkNoToxicity` (unknown, línea 71)
- 🔒 `checkNoOffTopic` (unknown, línea 84)
- 🔒 `checkNoPersonalOpinions` (unknown, línea 100)
- 🔒 `checkNoSensitiveInfoRequest` (unknown, línea 112)
- 🔒 `checkResponseLength` (unknown, línea 124)

**Clases (1):**
- 🔒 `Guardrails` (línea 10)
  - Métodos: `processResponse`, `for`, `if`, `checkNoPromises`, `checkNoToxicity`, `checkNoOffTopic`, `checkNoPersonalOpinions`, `checkNoSensitiveInfoRequest`, `checkResponseLength`

**Imports (2):**
- 📁 `logger` desde `../utils/logger`
- 📁 `config` desde `../utils/config`

**Exports (1):**
- 🔄 `{ Guardrails }` (commonjs)

#### 📄 hallucinationDetector.js

**Ruta:** `src\services\hallucinationDetector.js`  
**Tamaño:** 1315 caracteres, 34 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (1):**
- 🔒 `detectHallucination` (function, línea 13)

**Imports (1):**
- 📁 `responseValidatorPipeline` desde `../utils/responseValidator`

**Exports (1):**
- 🔄 `{
    detectHallucination
}` (commonjs)

#### 📄 markdownContextEnricher.js

**Ruta:** `src\services\markdownContextEnricher.js`  
**Tamaño:** 19554 caracteres, 560 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (25):**
- 🔒 `constructor` (unknown, línea 23)
- 🔒 `initializeCache` (unknown, línea 78)
- 🔒 `if` (unknown, línea 82)
- 🔒 `catch` (unknown, línea 89)
- 🔒 `refreshMarkdownCache` (unknown, línea 98)
- 🔒 `for` (unknown, línea 117)
- 🔒 `extractBrandFromFilename` (unknown, línea 155)
- 🔒 `parseMarkdownContent` (unknown, línea 167)
- 🔒 `extractPriceRanges` (unknown, línea 200)
- 🔒 `extractServiceTypes` (unknown, línea 219)
- 🔒 `extractMetadata` (unknown, línea 236)
- 🔒 `parseTableModels` (unknown, línea 271)
- 🔒 `parsePrice` (unknown, línea 301)
- 🔒 `buildGlobalMetadata` (unknown, línea 311)
- 🔒 `enrichSearchResults` (unknown, línea 341)
- 🔒 `detectEnrichmentType` (unknown, línea 375)
- 🔒 `extractBrandsFromQuery` (unknown, línea 391)
- 🔒 `buildEnrichmentForResult` (unknown, línea 407)
- 🔒 `forEach` (arrow, línea 423)
- 🔒 `getRelevantGlobalInfo` (unknown, línea 495)
- 🔒 `getBrandInfo` (unknown, línea 527)
- 🔒 `getGlobalMetadata` (unknown, línea 531)
- 🔒 `getStandardInfo` (unknown, línea 535)
- 🔒 `getCacheStats` (unknown, línea 539)
- 🔒 `forceRefresh` (unknown, línea 552)

**Clases (1):**
- 🔒 `MarkdownContextEnricher` (línea 22)
  - Métodos: `initializeCache`, `if`, `catch`, `refreshMarkdownCache`, `for`, `extractBrandFromFilename`, `parseMarkdownContent`, `extractPriceRanges`, `extractServiceTypes`, `extractMetadata`, `parseTableModels`, `parsePrice`, `buildGlobalMetadata`, `enrichSearchResults`, `detectEnrichmentType`, `extractBrandsFromQuery`, `buildEnrichmentForResult`, `forEach`, `getRelevantGlobalInfo`, `getBrandInfo`, `getGlobalMetadata`, `getStandardInfo`, `getCacheStats`, `forceRefresh`

**Imports (3):**
- 📦 `fs` desde `fs`
- 📦 `path` desde `path`
- 📁 `logger` desde `../utils/logger`

**Exports (1):**
- 🔄 `{
    MarkdownContextEnricher
}` (commonjs)

#### Grupo 3

#### 📄 markdownMetadataExtractor.js

**Ruta:** `src\services\markdownMetadataExtractor.js`  
**Tamaño:** 18701 caracteres, 592 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (21):**
- 🔒 `constructor` (unknown, línea 23)
- 🔒 `if` (unknown, línea 84)
- 🔒 `initializeCache` (unknown, línea 93)
- 🔒 `catch` (unknown, línea 106)
- 🔒 `refreshCache` (unknown, línea 115)
- 🔒 `for` (unknown, línea 132)
- 🔒 `extractMetadataFromFile` (unknown, línea 170)
- 🔒 `extractBasicInfoFromContent` (unknown, línea 205)
- 🔒 `extractBrandFromFilename` (unknown, línea 258)
- 🔒 `getDeviceInfo` (unknown, línea 273)
- 🔒 `getGlobalInfo` (unknown, línea 341)
- 🔒 `getBrandInfo` (unknown, línea 354)
- 🔒 `getAllBrands` (unknown, línea 383)
- 🔒 `getGlobalStats` (unknown, línea 397)
- 🔒 `searchInMetadata` (unknown, línea 422)
- 🔒 `ensureCacheValid` (unknown, línea 471)
- 🔒 `getTotalModelsCount` (unknown, línea 483)
- 🔒 `getCacheStats` (unknown, línea 496)
- 🔒 `forceRefresh` (unknown, línea 513)
- 🔒 `clearCache` (unknown, línea 522)
- 🔒 `healthCheck` (unknown, línea 538)

**Clases (1):**
- 🔒 `MarkdownMetadataExtractor` (línea 22)
  - Métodos: `if`, `initializeCache`, `catch`, `refreshCache`, `for`, `extractMetadataFromFile`, `extractBasicInfoFromContent`, `extractBrandFromFilename`, `getDeviceInfo`, `getGlobalInfo`, `getBrandInfo`, `getAllBrands`, `getGlobalStats`, `searchInMetadata`, `ensureCacheValid`, `getTotalModelsCount`, `getCacheStats`, `forceRefresh`, `clearCache`, `healthCheck`

**Imports (4):**
- 📦 `fs` desde `fs`
- 📦 `path` desde `path`
- 📦 `yaml` desde `js-yaml`
- 📁 `logger` desde `../utils/logger`

**Exports (1):**
- 🔄 `{
    MarkdownMetadataExtractor
}` (commonjs)

#### 📄 metadataEnhancer.js

**Ruta:** `src\services\metadataEnhancer.js`  
**Tamaño:** 23316 caracteres, 668 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (27):**
- 🔒 `constructor` (unknown, línea 21)
- 🔒 `if` (unknown, línea 37)
- 🔒 `enhanceMetadata` (unknown, línea 121)
- 🔒 `catch` (unknown, línea 172)
- 🔒 `cleanRawMetadata` (unknown, línea 183)
- 🔒 `validateMetadata` (unknown, línea 210)
- 🔒 `validateField` (unknown, línea 256)
- 🔒 `enrichWithMarkdownData` (unknown, línea 294)
- 🔒 `applyAutoEnrichment` (unknown, línea 343)
- 🔒 `finalizeMetadata` (unknown, línea 371)
- 🔒 `isValidType` (unknown, línea 388)
- 🔒 `switch` (unknown, línea 391)
- 🔒 `isChromaCompatibleType` (unknown, línea 403)
- 🔒 `attemptTypeConversion` (unknown, línea 408)
- 🔒 `mapToValidEnum` (unknown, línea 447)
- 🔒 `for` (unknown, línea 484)
- 🔒 `normalizeFieldName` (unknown, línea 497)
- 🔒 `normalizeClientId` (unknown, línea 514)
- 🔒 `normalizeTimestamp` (unknown, línea 532)
- 🔒 `normalizeIntent` (unknown, línea 547)
- 🔒 `cleanFieldValue` (unknown, línea 558)
- 🔒 `calculateConfidenceScore` (unknown, línea 578)
- 🔒 `mapServiceType` (unknown, línea 590)
- 🔒 `extractDeviceBrand` (unknown, línea 603)
- 🔒 `createFallbackMetadata` (unknown, línea 622)
- 🔒 `getEnhancementStats` (unknown, línea 637)
- 🔒 `resetMetrics` (unknown, línea 653)

**Clases (1):**
- 🔒 `MetadataEnhancer` (línea 20)
  - Métodos: `if`, `enhanceMetadata`, `catch`, `cleanRawMetadata`, `validateMetadata`, `validateField`, `enrichWithMarkdownData`, `applyAutoEnrichment`, `finalizeMetadata`, `isValidType`, `switch`, `isChromaCompatibleType`, `attemptTypeConversion`, `mapToValidEnum`, `for`, `normalizeFieldName`, `normalizeClientId`, `normalizeTimestamp`, `normalizeIntent`, `cleanFieldValue`, `calculateConfidenceScore`, `mapServiceType`, `extractDeviceBrand`, `createFallbackMetadata`, `getEnhancementStats`, `resetMetrics`

**Imports (2):**
- 📁 `MarkdownMetadataExtractor` desde `./markdownMetadataExtractor`
- 📁 `logger` desde `../utils/logger`

**Exports (1):**
- 🔄 `{
    MetadataEnhancer
}` (commonjs)

#### 📄 priceExtractionSystem.js

**Ruta:** `src\services\priceExtractionSystem.js`  
**Tamaño:** 11948 caracteres, 276 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (12):**
- 🔒 `constructor` (unknown, línea 36)
- 🔒 `extractWithLLM` (unknown, línea 44)
- 🔒 `catch` (unknown, línea 53)
- 🔒 `extractPrice` (unknown, línea 59)
- 🔒 `if` (unknown, línea 67)
- 🔒 `for` (unknown, línea 79)
- 🔒 `exactDatabaseMatch` (unknown, línea 119)
- 🔒 `fuzzyDatabaseMatch` (unknown, línea 146)
- 🔒 `fallbackSearch` (unknown, línea 210)
- 🔒 `normalizeQuery` (unknown, línea 244)
- 🔒 `getStrategyName` (unknown, línea 252)
- 🔒 `validateResult` (unknown, línea 261)

**Clases (1):**
- 🔒 `PriceExtractionSystem` (línea 35)
  - Métodos: `extractWithLLM`, `catch`, `extractPrice`, `if`, `for`, `exactDatabaseMatch`, `fuzzyDatabaseMatch`, `fallbackSearch`, `normalizeQuery`, `getStrategyName`, `validateResult`

**Imports (8):**
- 📁 `pool` desde `../database/pg`
- 📦 `ChromaClient` desde `chromadb`
- 📁 `getEmbeddingEngine` desde `./embeddingEngine`
- 📁 `KnowledgeCoherenceLayer` desde `./knowledge/KnowledgeCoherenceLayer`
- 📁 `logger` desde `../utils/logger`
- 📦 `ChatOllama` desde `@langchain/community/chat_models/ollama`
- 📦 `JsonOutputParser` desde `@langchain/core/output_parsers`
- 📁 `config` desde `../utils/config`

**Exports (1):**
- 🔄 `{
    PriceExtractionSystem,
    priceExtractionSystem
}` (commonjs)

#### 📄 semanticCache.js

**Ruta:** `src\services\semanticCache.js`  
**Tamaño:** 9004 caracteres, 217 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (9):**
- 🔒 `initializeCache` (function, línea 37)
- 🔒 `findInCache` (function, línea 68)
- 🔒 `addToCache` (function, línea 132)
- 🔒 `invalidateCache` (function, línea 165)
- 🔒 `constructor` (unknown, línea 17)
- 🔒 `generate` (unknown, línea 21)
- 🔒 `if` (unknown, línea 41)
- 🔒 `catch` (unknown, línea 55)
- 🔒 `for` (unknown, línea 180)

**Clases (1):**
- 🔒 `LangChainEmbeddingAdapter` (línea 16)
  - Métodos: `generate`

**Imports (4):**
- 📦 `ChromaClient` desde `chromadb`
- 📁 `getEmbeddingEngine` desde `./embeddingEngine`
- 📁 `logger` desde `../utils/logger`
- 📁 `retryHandler` desde `../utils/retryHandler`

**Exports (1):**
- 🔄 `{
    findInCache,
    addToCache,
    invalidateCache,
    initializeCache // Exportar para permitir inicialización explícita si es necesario
}` (commonjs)

#### 📄 semanticChunker.js

**Ruta:** `src\services\semanticChunker.js`  
**Tamaño:** 26314 caracteres, 675 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (27):**
- 🔒 `constructor` (unknown, línea 21)
- 🔒 `createSemanticChunks` (unknown, línea 81)
- 🔒 `catch` (unknown, línea 113)
- 🔒 `createSlidingWindowChunks` (unknown, línea 129)
- 🔒 `if` (unknown, línea 135)
- 🔒 `for` (unknown, línea 144)
- 🔒 `createContextualChunk` (unknown, línea 178)
- 🔒 `extractMarkdownContext` (unknown, línea 246)
- 🔒 `buildEnhancedMetadata` (unknown, línea 280)
- 🔒 `analyzeConversationFlow` (unknown, línea 327)
- 🔒 `calculateSemanticDensity` (unknown, línea 359)
- 🔒 `determineFlowStage` (unknown, línea 396)
- 🔒 `calculateContinuityScore` (unknown, línea 414)
- 🔒 `areRelatedIntents` (unknown, línea 459)
- 🔒 `extractMarkdownKeywords` (unknown, línea 479)
- 🔒 `createConversationEntry` (unknown, línea 490)
- 🔒 `updateConversationBuffer` (unknown, línea 501)
- 🔒 `getClientConversations` (unknown, línea 517)
- 🔒 `getWindowConfig` (unknown, línea 521)
- 🔒 `createFallbackChunk` (unknown, línea 536)
- 🔒 `truncateChunk` (unknown, línea 554)
- 🔒 `containsAny` (unknown, línea 568)
- 🔒 `classifyResponseType` (unknown, línea 573)
- 🔒 `getHourCategory` (unknown, línea 582)
- 🔒 `getChunkerStats` (unknown, línea 594)
- 🔒 `detectPattern` (unknown, línea 623)
- 🔒 `matchesPattern` (unknown, línea 654)

**Clases (2):**
- 🔒 `SemanticChunker` (línea 20)
  - Métodos: `createSemanticChunks`, `catch`, `createSlidingWindowChunks`, `if`, `for`, `createContextualChunk`, `extractMarkdownContext`, `buildEnhancedMetadata`, `analyzeConversationFlow`, `calculateSemanticDensity`, `determineFlowStage`, `calculateContinuityScore`, `areRelatedIntents`, `extractMarkdownKeywords`, `createConversationEntry`, `updateConversationBuffer`, `getClientConversations`, `getWindowConfig`, `createFallbackChunk`, `truncateChunk`, `containsAny`, `classifyResponseType`, `getHourCategory`, `getChunkerStats`
- 🔒 `ConversationPatternAnalyzer` (línea 613)
  - Métodos: `detectPattern`, `if`, `matchesPattern`, `for`

**Imports (2):**
- 📁 `logger` desde `../utils/logger`
- 📁 `embeddingEngine` desde `./embeddingEngine`

**Exports (1):**
- 🔄 `{
    SemanticChunker,
    ConversationPatternAnalyzer
}` (commonjs)

#### Grupo 4

#### 📄 semanticRouter.js

**Ruta:** `src\services\semanticRouter.js`  
**Tamaño:** 7437 caracteres, 170 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (6):**
- 🔒 `classifyIntent` (function, línea 44)
- 🔒 `determineIntentByKeywords` (function, línea 110)
- 🔒 `constructor` (unknown, línea 18)
- 🔒 `generate` (unknown, línea 22)
- 🔒 `catch` (unknown, línea 29)
- 🔒 `if` (unknown, línea 49)

**Clases (1):**
- 🔒 `LangChainEmbeddingAdapter` (línea 17)
  - Métodos: `generate`, `catch`

**Imports (3):**
- 📦 `ChromaClient` desde `chromadb`
- 📁 `embeddingEngine` desde `./embeddingEngine`
- 📁 `logger` desde `../utils/logger`

**Exports (1):**
- 🔄 `{
    classifyIntent,
}` (commonjs)

#### 📄 serviceRegistry.js

**Ruta:** `src\services\serviceRegistry.js`  
**Tamaño:** 2066 caracteres, 56 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (4):**
- 🔒 `registerService` (function, línea 19)
- 🔒 `restartService` (function, línea 31)
- 🔒 `if` (function, línea 35)
- 🔒 `catch` (unknown, línea 41)

**Imports (1):**
- 📁 `logger` desde `../utils/logger`

**Exports (1):**
- 🔄 `{
    services,
    registerService,
    restartService,
}` (commonjs)

#### 📄 simpleAgentExecutor.js

**Ruta:** `src\services\simpleAgentExecutor.js`  
**Tamaño:** 5184 caracteres, 127 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (5):**
- 🔒 `constructor` (unknown, línea 14)
- 🔒 `execute` (unknown, línea 46)
- 🔒 `if` (unknown, línea 55)
- 🔒 `catch` (unknown, línea 75)
- 🔒 `executeWithLLM` (unknown, línea 107)

**Clases (2):**
- 🔒 `OllamaError` ← Error (línea 13)
- 🔒 `SimpleAgentExecutor` (línea 20)
  - Métodos: `execute`, `if`, `catch`, `executeWithLLM`

**Imports (7):**
- 📦 `ChatOllama` desde `@langchain/community/chat_models/ollama`
- 📦 `RateLimiterMemory` desde `rate-limiter-flexible`
- 📁 `tools` desde `./tools`
- 📁 `logger` desde `../utils/logger`
- 📁 `config` desde `../utils/config`
- 📁 `findInCache, addToCache` desde `./semanticCache`
- 📁 `Guardrails` desde `./guardrails`

**Exports (1):**
- 🔄 `{ SimpleAgentExecutor }` (commonjs)

#### 📄 simpleDeduplicationEngine.js

**Ruta:** `src\services\simpleDeduplicationEngine.js`  
**Tamaño:** 22466 caracteres, 614 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (28):**
- 🔒 `constructor` (unknown, línea 22)
- 🔒 `checkForDuplicates` (unknown, línea 84)
- 🔒 `catch` (unknown, línea 124)
- 🔒 `classifyInformationType` (unknown, línea 140)
- 🔒 `findDuplicatesWithContext` (unknown, línea 172)
- 🔒 `for` (unknown, línea 179)
- 🔒 `if` (unknown, línea 189)
- 🔒 `calculateContextualSimilarity` (unknown, línea 218)
- 🔒 `calculateJaccardSimilarity` (unknown, línea 265)
- 🔒 `calculateMetadataSimilarity` (unknown, línea 281)
- 🔒 `switch` (unknown, línea 292)
- 🔒 `calculateMarkdownContextSimilarity` (unknown, línea 328)
- 🔒 `makeConservativeDecision` (unknown, línea 369)
- 🔒 `isPriorityType` (unknown, línea 420)
- 🔒 `getThresholdForType` (unknown, línea 424)
- 🔒 `getWeightsForType` (unknown, línea 428)
- 🔒 `containsPatterns` (unknown, línea 440)
- 🔒 `tokenizeText` (unknown, línea 445)
- 🔒 `hashText` (unknown, línea 452)
- 🔒 `calculateDeviceSimilarity` (unknown, línea 462)
- 🔒 `getDuplicateReason` (unknown, línea 476)
- 🔒 `getRelevantMarkdownContext` (unknown, línea 483)
- 🔒 `recordMetrics` (unknown, línea 508)
- 🔒 `recordPreservation` (unknown, línea 541)
- 🔒 `getDeduplicationStats` (unknown, línea 546)
- 🔒 `calculateSystemHealth` (unknown, línea 563)
- 🔒 `performMaintenance` (unknown, línea 588)
- 🔒 `resetDailyMetrics` (unknown, línea 605)

**Clases (1):**
- 🔒 `SimpleDeduplicationEngine` (línea 21)
  - Métodos: `checkForDuplicates`, `catch`, `classifyInformationType`, `findDuplicatesWithContext`, `for`, `if`, `calculateContextualSimilarity`, `calculateJaccardSimilarity`, `calculateMetadataSimilarity`, `switch`, `calculateMarkdownContextSimilarity`, `makeConservativeDecision`, `isPriorityType`, `getThresholdForType`, `getWeightsForType`, `containsPatterns`, `tokenizeText`, `hashText`, `calculateDeviceSimilarity`, `getDuplicateReason`, `getRelevantMarkdownContext`, `recordMetrics`, `recordPreservation`, `getDeduplicationStats`, `calculateSystemHealth`, `performMaintenance`, `resetDailyMetrics`

**Imports (2):**
- 📁 `MarkdownContextEnricher` desde `./markdownContextEnricher`
- 📁 `logger` desde `../utils/logger`

**Exports (1):**
- 🔄 `{
    SimpleDeduplicationEngine
}` (commonjs)

#### 📄 tools.js

**Ruta:** `src\services\tools.js`  
**Tamaño:** 41919 caracteres, 992 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (20):**
- 🔒 `validateArguments` (function, línea 21)
- 🔒 `determineKnowledgeContext` (function, línea 613)
- 🔒 `knowledgeSearchFallback` (function, línea 638)
- 🔒 `getArchitecturalHealth` (function, línea 930)
- 🔒 `for` (unknown, línea 28)
- 🔒 `if` (unknown, línea 37)
- 🔒 `constructor` (unknown, línea 58)
- 🔒 `generate` (unknown, línea 65)
- 🔒 `switch` (unknown, línea 73)
- 🔒 `catch` (unknown, línea 87)
- 🔒 `generateQuery` (unknown, línea 96)
- 🔒 `generateDocument` (unknown, línea 109)
- 🔒 `validatePriceConsistency` (unknown, línea 145)
- 🔒 `extractDeviceInfo` (unknown, línea 228)
- 🔒 `extractPrices` (unknown, línea 266)
- 🔒 `comparePrices` (unknown, línea 293)
- 🔒 `calculatePriceVariance` (unknown, línea 338)
- 🔒 `validateProductAvailability` (unknown, línea 348)
- 🔒 `clearCache` (unknown, línea 391)
- 🔒 `getValidationStats` (unknown, línea 399)

**Clases (2):**
- 🔒 `EnhancedLangChainEmbeddingAdapter` (línea 57)
  - Métodos: `generate`, `switch`, `catch`, `generateQuery`, `generateDocument`
- 🔒 `CrossSourceValidator` (línea 132)
  - Métodos: `validatePriceConsistency`, `if`, `catch`, `extractDeviceInfo`, `for`, `extractPrices`, `comparePrices`, `calculatePriceVariance`, `validateProductAvailability`, `clearCache`, `getValidationStats`

**Imports (10):**
- 📦 `DynamicTool` desde `langchain/tools`
- 📦 `ChromaClient` desde `chromadb`
- 📁 `embeddingEngine, getEmbedding` desde `./embeddingEngine`
- 📁 `pool` desde `../database/pg`
- 📁 `priceExtractionSystem` desde `./priceExtractionSystem`
- 📁 `conversationMemory` desde `./conversationMemory`
- 📁 `DeterministicSearchEngine` desde `./deterministicSearchEngine`
- 📁 `DynamicLimitOptimizer` desde `./dynamicLimitOptimizer`
- 📁 `MarkdownContextEnricher` desde `./markdownContextEnricher`
- 📁 `logger` desde `../utils/logger`

**Exports (1):**
- 🔄 `{
    tools,
    crossSourceValidator,
    performanceMonitor,
    getArchitecturalHealth
}` (commonjs)

#### Grupo 5

#### 📄 validatedEmbeddingEngine.js

**Ruta:** `src\services\validatedEmbeddingEngine.js`  
**Tamaño:** 27444 caracteres, 668 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (27):**
- 🔒 `constructor` (unknown, línea 22)
- 🔒 `initializeDimensions` (unknown, línea 91)
- 🔒 `catch` (unknown, línea 110)
- 🔒 `embedDocument` (unknown, línea 120)
- 🔒 `if` (unknown, línea 133)
- 🔒 `embedQuery` (unknown, línea 162)
- 🔒 `embedDocuments` (unknown, línea 203)
- 🔒 `for` (unknown, línea 214)
- 🔒 `validateEmbedding` (unknown, línea 264)
- 🔒 `detectSalvaCellContext` (unknown, línea 357)
- 🔒 `validateMarkdownEmbedding` (unknown, línea 383)
- 🔒 `calculateEmbeddingQuality` (unknown, línea 423)
- 🔒 `attemptRecovery` (unknown, línea 451)
- 🔒 `containsAny` (unknown, línea 515)
- 🔒 `checkTimeConsistency` (unknown, línea 519)
- 🔒 `checkWarrantyConsistency` (unknown, línea 525)
- 🔒 `checkPriceConsistency` (unknown, línea 531)
- 🔒 `checkContextConsistency` (unknown, línea 537)
- 🔒 `checkSalvaCellRelevance` (unknown, línea 542)
- 🔒 `calculateVariance` (unknown, línea 549)
- 🔒 `cleanTextForEmbedding` (unknown, línea 554)
- 🔒 `recordValidation` (unknown, línea 566)
- 🔒 `checkAlertThresholds` (unknown, línea 586)
- 🔒 `triggerAlert` (unknown, línea 602)
- 🔒 `ensureDimensionsInitialized` (unknown, línea 619)
- 🔒 `getValidationStats` (unknown, línea 631)
- 🔒 `resetStats` (unknown, línea 651)

**Clases (1):**
- 🔒 `ValidatedEmbeddingEngine` ← EnhancedEmbeddingEngine (línea 21)
  - Métodos: `initializeDimensions`, `catch`, `embedDocument`, `if`, `embedQuery`, `embedDocuments`, `for`, `validateEmbedding`, `detectSalvaCellContext`, `validateMarkdownEmbedding`, `calculateEmbeddingQuality`, `attemptRecovery`, `containsAny`, `checkTimeConsistency`, `checkWarrantyConsistency`, `checkPriceConsistency`, `checkContextConsistency`, `checkSalvaCellRelevance`, `calculateVariance`, `cleanTextForEmbedding`, `recordValidation`, `checkAlertThresholds`, `triggerAlert`, `ensureDimensionsInitialized`, `getValidationStats`, `resetStats`

**Imports (2):**
- 📁 `logger` desde `../utils/logger`
- 📁 `EnhancedEmbeddingEngine` desde `./embeddingEngine`

**Exports (1):**
- 🔄 `{
    ValidatedEmbeddingEngine
}` (commonjs)

---

### 📁 src\services\classifiers

**Archivos encontrados:** 1

#### 📄 qwenClassifier.js

**Ruta:** `src\services\classifiers\qwenClassifier.js`  
**Tamaño:** 4312 caracteres, 117 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (6):**
- 🔒 `constructor` (unknown, línea 13)
- 🔒 `classify` (unknown, línea 24)
- 🔒 `if` (unknown, línea 38)
- 🔒 `catch` (unknown, línea 44)
- 🔒 `buildClassificationPrompt` (unknown, línea 55)
- 🔒 `parseResponse` (unknown, línea 86)

**Clases (1):**
- 🔒 `QwenClassifier` (línea 12)
  - Métodos: `classify`, `if`, `catch`, `buildClassificationPrompt`, `parseResponse`

**Imports (3):**
- 📁 `QwenLocalClient` desde `../../utils/qwenLocal`
- 📁 `logger` desde `../../utils/logger`
- 📁 `intentions` desde `../../../intentions_dataset.json`

**Exports (1):**
- 🔄 `{ QwenClassifier }` (commonjs)

---

### 📁 src\services\eventSourcing

**Archivos encontrados:** 1

#### 📄 EventStore.js

**Ruta:** `src\services\eventSourcing\EventStore.js`  
**Tamaño:** 2886 caracteres, 101 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (8):**
- 🔒 `constructor` (unknown, línea 17)
- 🔒 `appendEvent` (unknown, línea 31)
- 🔒 `getAllEvents` (unknown, línea 49)
- 🔒 `getEventsByType` (unknown, línea 58)
- 🔒 `_persistEvent` (unknown, línea 66)
- 🔒 `_loadEvents` (unknown, línea 74)
- 🔒 `_enforceRetention` (unknown, línea 86)
- 🔒 `if` (unknown, línea 87)

**Clases (1):**
- 🔒 `EventStore` ← EventEmitter (línea 16)
  - Métodos: `appendEvent`, `getAllEvents`, `getEventsByType`, `_persistEvent`, `_loadEvents`, `_enforceRetention`, `if`

**Imports (4):**
- 📦 `fs` desde `fs`
- 📦 `path` desde `path`
- 📦 `v4: uuidv4` desde `uuid`
- 📦 `EventEmitter` desde `events`

**Exports (1):**
- 🔄 `{
    EventStore,
    eventStore
}` (commonjs)

---

### 📁 src\services\knowledge

**Archivos encontrados:** 2

#### 📄 KnowledgeCoherenceLayer.js

**Ruta:** `src\services\knowledge\KnowledgeCoherenceLayer.js`  
**Tamaño:** 76593 caracteres, 2310 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (95):**
- 🔒 `constructor` (unknown, línea 21)
- 🔒 `setupCoherenceMonitoring` (unknown, línea 83)
- 🔒 `if` (unknown, línea 85)
- 🔒 `catch` (unknown, línea 89)
- 🔒 `searchWithValidation` (unknown, línea 114)
- 🔒 `validateSearchResults` (unknown, línea 197)
- 🔒 `validateDataFreshness` (unknown, línea 284)
- 🔒 `validateSemanticConsistency` (unknown, línea 340)
- 🔒 `for` (unknown, línea 349)
- 🔒 `validateBusinessLogic` (unknown, línea 401)
- 🔒 `performContinuousValidation` (unknown, línea 459)
- 🔒 `performHealthCheck` (unknown, línea 526)
- 🔒 `calculateValidationScore` (unknown, línea 586)
- 🔒 `detectValidationConflicts` (unknown, línea 607)
- 🔒 `getIssueSeverity` (unknown, línea 627)
- 🔒 `calculateSemanticRelevance` (unknown, línea 633)
- 🔒 `detectSemanticContradictions` (unknown, línea 656)
- 🔒 `validatePriceRange` (unknown, línea 696)
- 🔒 `getBusinessHours` (unknown, línea 714)
- 🔒 `isWithinBusinessHours` (unknown, línea 723)
- 🔒 `getRecentSearchSamples` (unknown, línea 728)
- 🔒 `calculateSearchCoherenceScore` (unknown, línea 734)
- 🔒 `updateCoherenceHistory` (unknown, línea 742)
- 🔒 `handleSearchConflicts` (unknown, línea 754)
- 🔒 `checkPostgreSQLFreshness` (unknown, línea 780)
- 🔒 `checkChromaDBFreshness` (unknown, línea 810)
- 🔒 `checkPostgreSQLHealth` (unknown, línea 820)
- 🔒 `checkChromaDBHealth` (unknown, línea 837)
- 🔒 `checkEmbeddingEngineHealth` (unknown, línea 854)
- 🔒 `checkCrossValidationHealth` (unknown, línea 871)
- 🔒 `handleConflictDetected` (unknown, línea 897)
- 🔒 `handleCoherenceDegraded` (unknown, línea 911)
- 🔒 `handleValidationCompleted` (unknown, línea 924)
- 🔒 `initiateAutoRecovery` (unknown, línea 928)
- 🔒 `getCoherenceMetrics` (unknown, línea 944)
- 🔒 `getEnhancedMetrics` (unknown, línea 1139)
- 🔒 `analyzeCoherenceTrend` (unknown, línea 1158)
- 🔒 `search` (unknown, línea 1186)
- 🔒 `switch` (unknown, línea 1189)
- 🔒 `determineOptimalStrategy` (unknown, línea 1205)
- 🔒 `executePriceSpecificSearch` (unknown, línea 1243)
- 🔒 `executeSemanticSearch` (unknown, línea 1278)
- 🔒 `executeHybridSearch` (unknown, línea 1307)
- 🔒 `validateSemanticCoherence` (unknown, línea 1354)
- 🔒 `enrichWithSemanticContext` (unknown, línea 1382)
- 🔒 `formatCoherentResponse` (unknown, línea 1419)
- 🔒 `analyzeQuery` (unknown, línea 1442)
- 🔒 `detectPriceKeywords` (unknown, línea 1452)
- 🔒 `detectDeviceSpecificity` (unknown, línea 1457)
- 🔒 `detectGeneralInformation` (unknown, línea 1468)
- 🔒 `calculateQueryComplexity` (unknown, línea 1473)
- 🔒 `classifyIntent` (unknown, línea 1486)
- 🔒 `matchesCategory` (unknown, línea 1510)
- 🔒 `basicIntentClassification` (unknown, línea 1522)
- 🔒 `extractPriceSearchTerms` (unknown, línea 1539)
- 🔒 `mentionsPricing` (unknown, línea 1580)
- 🔒 `calculateCoherenceScore` (unknown, línea 1585)
- 🔒 `analyzeContext` (unknown, línea 1593)
- 🔒 `buildSemanticFilters` (unknown, línea 1602)
- 🔒 `processParallelResults` (unknown, línea 1616)
- 🔒 `validatePriceCoherence` (unknown, línea 1633)
- 🔒 `calculateRecommendationLevel` (unknown, línea 1641)
- 🔒 `extractCustomerBenefits` (unknown, línea 1656)
- 🔒 `identifySources` (unknown, línea 1676)
- 🔒 `forEach` (arrow, línea 1679)
- 🔒 `getProcessingLatency` (unknown, línea 1690)
- 🔒 `assessCompleteness` (unknown, línea 1695)
- 🔒 `assessConsistency` (unknown, línea 1700)
- 🔒 `assessRelevance` (unknown, línea 1705)
- 🔒 `searchPrices` (unknown, línea 1713)
- 🔒 `semanticSearch` (unknown, línea 1750)
- 🔒 `findRelatedContext` (unknown, línea 1768)
- 🔒 `fuseMultiSourceResults` (unknown, línea 1785)
- 🔒 `calculateScore` (unknown, línea 1808)
- 🔒 `calculateSourceConsistency` (unknown, línea 1823)
- 🔒 `calculateCompleteness` (unknown, línea 1828)
- 🔒 `calculateContextualRelevance` (unknown, línea 1833)
- 🔒 `get` (unknown, línea 1845)
- 🔒 `set` (unknown, línea 1857)
- 🔒 `validate` (unknown, línea 1866)
- 🔒 `initializeValidationRules` (unknown, línea 1890)
- 🔒 `findMatchingResult` (unknown, línea 1977)
- 🔒 `calculateSimilarity` (unknown, línea 1993)
- 🔒 `stringSimilarity` (unknown, línea 2012)
- 🔒 `levenshteinDistance` (unknown, línea 2022)
- 🔒 `healthCheck` (unknown, línea 2050)
- 🔒 `recordHealthScore` (unknown, línea 2084)
- 🔒 `checkHealthAlerts` (unknown, línea 2106)
- 🔒 `getHealthTrend` (unknown, línea 2114)
- 🔒 `initializeStrategies` (unknown, línea 2158)
- 🔒 `resolve` (unknown, línea 2187)
- 🔒 `calculateOverallScore` (unknown, línea 2234)
- 🔒 `getHealthStatus` (unknown, línea 2248)
- 🔒 `generateHealthReport` (unknown, línea 2256)
- 🔒 `generateRecommendations` (unknown, línea 2266)

**Clases (11):**
- 🔒 `KnowledgeCoherenceLayer` ← EventEmitter (línea 20)
  - Métodos: `setupCoherenceMonitoring`, `if`, `catch`, `searchWithValidation`, `validateSearchResults`, `validateDataFreshness`, `validateSemanticConsistency`, `for`, `validateBusinessLogic`, `performContinuousValidation`, `performHealthCheck`, `calculateValidationScore`, `detectValidationConflicts`, `getIssueSeverity`, `calculateSemanticRelevance`, `detectSemanticContradictions`, `validatePriceRange`, `getBusinessHours`, `isWithinBusinessHours`, `getRecentSearchSamples`, `calculateSearchCoherenceScore`, `updateCoherenceHistory`, `handleSearchConflicts`, `checkPostgreSQLFreshness`, `checkChromaDBFreshness`, `checkPostgreSQLHealth`, `checkChromaDBHealth`, `checkEmbeddingEngineHealth`, `checkCrossValidationHealth`, `handleConflictDetected`, `handleCoherenceDegraded`, `handleValidationCompleted`, `initiateAutoRecovery`, `getCoherenceMetrics`, `getEnhancedMetrics`, `analyzeCoherenceTrend`, `search`, `switch`, `determineOptimalStrategy`, `executePriceSpecificSearch`, `executeSemanticSearch`, `executeHybridSearch`, `validateSemanticCoherence`, `enrichWithSemanticContext`, `formatCoherentResponse`, `analyzeQuery`, `detectPriceKeywords`, `detectDeviceSpecificity`, `detectGeneralInformation`, `calculateQueryComplexity`, `classifyIntent`, `matchesCategory`, `basicIntentClassification`, `extractPriceSearchTerms`, `mentionsPricing`, `calculateCoherenceScore`, `analyzeContext`, `buildSemanticFilters`, `processParallelResults`, `validatePriceCoherence`, `calculateRecommendationLevel`, `extractCustomerBenefits`, `identifySources`, `forEach`, `getProcessingLatency`, `assessCompleteness`, `assessConsistency`, `assessRelevance`
- 🔒 `PostgreSQLConnector` (línea 1712)
  - Métodos: `searchPrices`, `if`, `catch`
- 🔒 `ChromaDBConnector` (línea 1749)
  - Métodos: `semanticSearch`, `catch`, `findRelatedContext`
- 🔒 `CoherenceEngine` (línea 1784)
  - Métodos: `fuseMultiSourceResults`, `if`, `calculateScore`, `calculateSourceConsistency`, `calculateCompleteness`, `calculateContextualRelevance`
- 🔒 `IntelligentCaching` (línea 1839)
  - Métodos: `get`, `set`
- 🔒 `ConsistencyValidator` (línea 1865)
  - Métodos: `validate`
- 🔒 `RealTimeCrossValidator` (línea 1884)
  - Métodos: `initializeValidationRules`, `if`, `validate`, `for`, `catch`, `findMatchingResult`, `calculateSimilarity`, `stringSimilarity`, `levenshteinDistance`, `healthCheck`
- 🔒 `CoherenceHealthMonitor` ← EventEmitter (línea 2074)
  - Métodos: `recordHealthScore`, `if`, `checkHealthAlerts`, `getHealthTrend`
- 🔒 `AutomaticConflictResolver` (línea 2152)
  - Métodos: `initializeStrategies`, `resolve`, `for`, `if`, `catch`
- 🔒 `HealthScoringEngine` (línea 2224)
  - Métodos: `calculateOverallScore`, `if`, `getHealthStatus`, `generateHealthReport`, `generateRecommendations`
- 🔒 `CoherenceLayerError` ← Error (línea 2290)

**Imports (5):**
- 📁 `logger` desde `../../utils/logger`
- 📁 `pool` desde `../../database/pg`
- 📁 `embeddingEngine` desde `../embeddingEngine`
- 📦 `v4: uuidv4` desde `uuid`
- 📦 `EventEmitter` desde `events`

**Exports (1):**
- 🔄 `{
    KnowledgeCoherenceLayer,
    PostgreSQLConnector,
    ChromaDBConnector,
    CoherenceEngine,
    IntelligentCaching,
    ConsistencyValidator,
    RealTimeCrossValidator,
    CoherenceHealthMonitor,
    AutomaticConflictResolver,
    HealthScoringEngine,
    CoherenceLayerError
}` (commonjs)

#### 📄 TemporalConsistencyEngine.js

**Ruta:** `src\services\knowledge\TemporalConsistencyEngine.js`  
**Tamaño:** 69058 caracteres, 2138 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (110):**
- 🔒 `constructor` (unknown, línea 22)
- 🔒 `setupEventHandlers` (unknown, línea 84)
- 🔒 `startMonitoring` (unknown, línea 104)
- 🔒 `if` (unknown, línea 105)
- 🔒 `stopMonitoring` (unknown, línea 134)
- 🔒 `performProactiveCheck` (unknown, línea 155)
- 🔒 `catch` (unknown, línea 200)
- 🔒 `processCheckResults` (unknown, línea 218)
- 🔒 `handleDataChangeEvent` (unknown, línea 264)
- 🔒 `handleSemanticDriftEvent` (unknown, línea 278)
- 🔒 `handleConflictEvent` (unknown, línea 296)
- 🔒 `handleCoherenceDegradationEvent` (unknown, línea 318)
- 🔒 `handleRecoveryEvent` (unknown, línea 336)
- 🔒 `calculateCurrentCoherenceScore` (unknown, línea 363)
- 🔒 `calculateVectorSpaceCoherence` (unknown, línea 417)
- 🔒 `calculateRelationalCoherence` (unknown, línea 440)
- 🔒 `calculateConversationalCoherence` (unknown, línea 462)
- 🔒 `calculateTemporalCoherence` (unknown, línea 481)
- 🔒 `updateCoherenceHistory` (unknown, línea 498)
- 🔒 `calculateAverageCoherence` (unknown, línea 514)
- 🔒 `analyzeCoherenceTrend` (unknown, línea 526)
- 🔒 `shouldTriggerRecovery` (unknown, línea 549)
- 🔒 `getRecoveryTriggers` (unknown, línea 570)
- 🔒 `calculateRecoveryUrgency` (unknown, línea 595)
- 🔒 `performHealthCheck` (unknown, línea 611)
- 🔒 `getEnhancedMetrics` (unknown, línea 648)
- 🔒 `orchestrateKnowledgeEvolution` (unknown, línea 668)
- 🔒 `detectSemanticDrift` (unknown, línea 703)
- 🔒 `analyzeEvolutionRequirements` (unknown, línea 725)
- 🔒 `captureKnowledgeSnapshot` (unknown, línea 747)
- 🔒 `captureOperationalReality` (unknown, línea 769)
- 🔒 `executeMigrationStrategy` (unknown, línea 790)
- 🔒 `switch` (unknown, línea 798)
- 🔒 `executeIncrementalMigration` (unknown, línea 819)
- 🔒 `for` (unknown, línea 823)
- 🔒 `analyzeChangeScope` (unknown, línea 867)
- 🔒 `identifyAffectedComponents` (unknown, línea 876)
- 🔒 `calculateMigrationComplexity` (unknown, línea 885)
- 🔒 `assessEvolutionRisks` (unknown, línea 895)
- 🔒 `determineEvolutionStrategy` (unknown, línea 905)
- 🔒 `estimateMigrationDuration` (unknown, línea 929)
- 🔒 `createRollbackPlan` (unknown, línea 939)
- 🔒 `captureVectorSpaceState` (unknown, línea 948)
- 🔒 `captureRelationalDataState` (unknown, línea 966)
- 🔒 `captureConversationalMemoryState` (unknown, línea 980)
- 🔒 `captureSystemConfiguration` (unknown, línea 1000)
- 🔒 `generateCoherenceHash` (unknown, línea 1012)
- 🔒 `extractCurrentPricing` (unknown, línea 1018)
- 🔒 `extractServiceOfferings` (unknown, línea 1035)
- 🔒 `extractOperationalPolicies` (unknown, línea 1051)
- 🔒 `extractPerformanceMetrics` (unknown, línea 1060)
- 🔒 `extractUsagePatterns` (unknown, línea 1069)
- 🔒 `extractConversationQuality` (unknown, línea 1088)
- 🔒 `extractErrorPatterns` (unknown, línea 1106)
- 🔒 `createMigrationPhases` (unknown, línea 1115)
- 🔒 `createMigrationCheckpoint` (unknown, línea 1142)
- 🔒 `executeMigrationPhase` (unknown, línea 1154)
- 🔒 `validatePhaseCoherence` (unknown, línea 1168)
- 🔒 `rollbackToCheckpoint` (unknown, línea 1178)
- 🔒 `triggerDriftMitigation` (unknown, línea 1187)
- 🔒 `analyzeSystemicImpact` (unknown, línea 1200)
- 🔒 `validatePreMigrationCoherence` (unknown, línea 1209)
- 🔒 `validatePostMigrationCoherence` (unknown, línea 1218)
- 🔒 `triggerAutomaticRollback` (unknown, línea 1228)
- 🔒 `executeBlueGreenMigration` (unknown, línea 1237)
- 🔒 `executeShadowMigration` (unknown, línea 1245)
- 🔒 `sleep` (unknown, línea 1253)
- 🔒 `getSystemHealth` (unknown, línea 1260)
- 🔒 `calculateCoherenceScore` (unknown, línea 1272)
- 🔒 `performMaintenanceCheck` (unknown, línea 1289)
- 🔒 `generateMaintenanceRecommendations` (unknown, línea 1310)
- 🔒 `analyze` (unknown, línea 1341)
- 🔒 `analyzeDriftDimensions` (unknown, línea 1362)
- 🔒 `analyzeSemanticDrift` (unknown, línea 1371)
- 🔒 `analyzeOperationalDrift` (unknown, línea 1381)
- 🔒 `analyzeBehavioralDrift` (unknown, línea 1391)
- 🔒 `analyzePerformanceDrift` (unknown, línea 1401)
- 🔒 `calculateAggregatedSeverity` (unknown, línea 1411)
- 🔒 `generateDriftRecommendations` (unknown, línea 1421)
- 🔒 `storeSnapshot` (unknown, línea 1444)
- 🔒 `generateVersionId` (unknown, línea 1459)
- 🔒 `getVersion` (unknown, línea 1463)
- 🔒 `listVersions` (unknown, línea 1467)
- 🔒 `detectChanges` (unknown, línea 1473)
- 🔒 `validate` (unknown, línea 1483)
- 🔒 `orchestrateMigration` (unknown, línea 1493)
- 🔒 `calculateDistribution` (unknown, línea 1504)
- 🔒 `quantify` (unknown, línea 1520)
- 🔒 `emit` (unknown, línea 1558)
- 🔒 `cleanupOldEvents` (unknown, línea 1576)
- 🔒 `getEventHistory` (unknown, línea 1581)
- 🔒 `isHealthy` (unknown, línea 1589)
- 🔒 `getMetrics` (unknown, línea 1593)
- 🔒 `validateSources` (unknown, línea 1618)
- 🔒 `validatePostgreSQL` (unknown, línea 1691)
- 🔒 `validateChromaDB` (unknown, línea 1728)
- 🔒 `performCrossValidation` (unknown, línea 1749)
- 🔒 `calculateConflictSeverity` (unknown, línea 1801)
- 🔒 `healthCheck` (unknown, línea 1812)
- 🔒 `registerDefaultStrategies` (unknown, línea 1835)
- 🔒 `resolve` (unknown, línea 1867)
- 🔒 `start` (unknown, línea 1973)
- 🔒 `stop` (unknown, línea 1988)
- 🔒 `performWatchCycle` (unknown, línea 2003)
- 🔒 `watchDatabaseChanges` (unknown, línea 2019)
- 🔒 `watchConfigurationChanges` (unknown, línea 2039)
- 🔒 `watchSystemMetrics` (unknown, línea 2058)
- 🔒 `captureDbState` (unknown, línea 2082)
- 🔒 `hasSignificantChange` (unknown, línea 2104)
- 🔒 `getWatchedEntities` (unknown, línea 2120)

**Clases (14):**
- 🔒 `TemporalConsistencyEngine` ← EventEmitter (línea 21)
  - Métodos: `setupEventHandlers`, `startMonitoring`, `if`, `stopMonitoring`, `performProactiveCheck`, `catch`, `processCheckResults`, `handleDataChangeEvent`, `handleSemanticDriftEvent`, `handleConflictEvent`, `handleCoherenceDegradationEvent`, `handleRecoveryEvent`, `calculateCurrentCoherenceScore`, `calculateVectorSpaceCoherence`, `calculateRelationalCoherence`, `calculateConversationalCoherence`, `calculateTemporalCoherence`, `updateCoherenceHistory`, `calculateAverageCoherence`, `analyzeCoherenceTrend`, `shouldTriggerRecovery`, `getRecoveryTriggers`, `calculateRecoveryUrgency`, `performHealthCheck`, `getEnhancedMetrics`, `orchestrateKnowledgeEvolution`, `detectSemanticDrift`, `analyzeEvolutionRequirements`, `captureKnowledgeSnapshot`, `captureOperationalReality`, `executeMigrationStrategy`, `switch`, `executeIncrementalMigration`, `for`, `analyzeChangeScope`, `identifyAffectedComponents`, `calculateMigrationComplexity`, `assessEvolutionRisks`, `determineEvolutionStrategy`, `estimateMigrationDuration`, `createRollbackPlan`, `captureVectorSpaceState`, `captureRelationalDataState`, `captureConversationalMemoryState`, `captureSystemConfiguration`, `generateCoherenceHash`, `extractCurrentPricing`, `extractServiceOfferings`, `extractOperationalPolicies`, `extractPerformanceMetrics`, `extractUsagePatterns`, `extractConversationQuality`, `extractErrorPatterns`, `createMigrationPhases`, `createMigrationCheckpoint`, `executeMigrationPhase`, `validatePhaseCoherence`, `rollbackToCheckpoint`, `triggerDriftMitigation`, `analyzeSystemicImpact`, `validatePreMigrationCoherence`, `validatePostMigrationCoherence`, `triggerAutomaticRollback`, `executeBlueGreenMigration`, `executeShadowMigration`, `sleep`, `getSystemHealth`, `calculateCoherenceScore`, `performMaintenanceCheck`, `generateMaintenanceRecommendations`
- 🔒 `SemanticDriftDetector` (línea 1334)
  - Métodos: `analyze`, `analyzeDriftDimensions`, `analyzeSemanticDrift`, `analyzeOperationalDrift`, `analyzeBehavioralDrift`, `analyzePerformanceDrift`, `calculateAggregatedSeverity`, `generateDriftRecommendations`, `if`
- 🔒 `KnowledgeVersionControl` (línea 1439)
  - Métodos: `storeSnapshot`, `generateVersionId`, `getVersion`, `listVersions`
- 🔒 `ChangeDetectionEngine` (línea 1472)
  - Métodos: `detectChanges`
- 🔒 `ConsistencyValidator` (línea 1482)
  - Métodos: `validate`
- 🔒 `MigrationOrchestrator` (línea 1492)
  - Métodos: `orchestrateMigration`
- 🔒 `EmbeddingComparator` (línea 1503)
  - Métodos: `calculateDistribution`
- 🔒 `ContextualAnalyzer` (línea 1510)
  - Métodos: `analyze`
- 🔒 `DriftQuantifier` (línea 1519)
  - Métodos: `quantify`
- 🔒 `MigrationPhaseError` ← Error (línea 1529)
- 🔒 `TemporalEventBus` ← EventEmitter (línea 1545)
  - Métodos: `emit`, `if`, `cleanupOldEvents`, `getEventHistory`, `isHealthy`, `getMetrics`
- 🔒 `CrossSourceValidator` (línea 1611)
  - Métodos: `validateSources`, `if`, `catch`, `validatePostgreSQL`, `validateChromaDB`, `performCrossValidation`, `calculateConflictSeverity`, `healthCheck`
- 🔒 `ConflictResolver` (línea 1825)
  - Métodos: `registerDefaultStrategies`, `resolve`, `for`, `if`, `catch`, `isHealthy`, `getMetrics`
- 🔒 `TemporalWatcher` (línea 1965)
  - Métodos: `start`, `if`, `stop`, `performWatchCycle`, `catch`, `watchDatabaseChanges`, `watchConfigurationChanges`, `watchSystemMetrics`, `captureDbState`, `hasSignificantChange`, `isHealthy`, `getWatchedEntities`

**Imports (6):**
- 📁 `logger` desde `../../utils/logger`
- 📁 `embeddingEngine` desde `../embeddingEngine`
- 📁 `pool` desde `../../database/pg`
- 📦 `v4: uuidv4` desde `uuid`
- 📦 `EventEmitter` desde `events`
- 📦 `crypto` desde `crypto`

**Exports (1):**
- 🔄 `{
    TemporalConsistencyEngine,
    SemanticDriftDetector,
    KnowledgeVersionControl,
    ChangeDetectionEngine,
    ConsistencyValidator,
    MigrationOrchestrator,
    MigrationPhaseError,
    // FASE 1 Enhanced Components
    TemporalEventBus,
    CrossSourceValidator,
    ConflictResolver,
    TemporalWatcher
}` (commonjs)

---

### 📁 src\services\resilience

**Archivos encontrados:** 1

#### 📄 ResilienceManager.js

**Ruta:** `src\services\resilience\ResilienceManager.js`  
**Tamaño:** 21613 caracteres, 652 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (35):**
- 🔒 `constructor` (unknown, línea 27)
- 🔒 `initializeServices` (unknown, línea 97)
- 🔒 `initializeRateLimiters` (unknown, línea 137)
- 🔒 `executeWithProtection` (unknown, línea 172)
- 🔒 `catch` (unknown, línea 198)
- 🔒 `checkServiceHealth` (unknown, línea 208)
- 🔒 `if` (unknown, línea 211)
- 🔒 `applyRateLimit` (unknown, línea 224)
- 🔒 `checkServiceRateLimit` (unknown, línea 246)
- 🔒 `checkClientRateLimit` (unknown, línea 268)
- 🔒 `executeWithCircuitBreaker` (unknown, línea 293)
- 🔒 `executeWithTimeout` (unknown, línea 323)
- 🔒 `executeWithRetry` (unknown, línea 342)
- 🔒 `for` (unknown, línea 346)
- 🔒 `handleExecutionError` (unknown, línea 380)
- 🔒 `executeAnthropicRequest` (unknown, línea 404)
- 🔒 `executeEmbeddingRequest` (unknown, línea 408)
- 🔒 `executeDatabaseRequest` (unknown, línea 412)
- 🔒 `recordSuccess` (unknown, línea 419)
- 🔒 `updateServiceHealth` (unknown, línea 435)
- 🔒 `updateSystemHealth` (unknown, línea 448)
- 🔒 `isNonRetryableError` (unknown, línea 466)
- 🔒 `isCriticalError` (unknown, línea 475)
- 🔒 `notifyCriticalError` (unknown, línea 483)
- 🔒 `generateExecutionId` (unknown, línea 488)
- 🔒 `startTimer` (unknown, línea 492)
- 🔒 `sleep` (unknown, línea 499)
- 🔒 `getMetrics` (unknown, línea 507)
- 🔒 `getQuickMetrics` (unknown, línea 520)
- 🔒 `getCircuitBreakerStatus` (unknown, línea 529)
- 🔒 `getRateLimiterStatus` (unknown, línea 537)
- 🔒 `reset` (unknown, línea 558)
- 🔒 `forEach` (arrow, línea 560)
- 🔒 `updateConfig` (unknown, línea 595)
- 🔒 `healthCheck` (unknown, línea 603)

**Clases (3):**
- 🔒 `ResilienceManager` (línea 26)
  - Métodos: `initializeServices`, `initializeRateLimiters`, `executeWithProtection`, `catch`, `checkServiceHealth`, `if`, `applyRateLimit`, `checkServiceRateLimit`, `checkClientRateLimit`, `executeWithCircuitBreaker`, `executeWithTimeout`, `executeWithRetry`, `for`, `handleExecutionError`, `executeAnthropicRequest`, `executeEmbeddingRequest`, `executeDatabaseRequest`, `recordSuccess`, `updateServiceHealth`, `updateSystemHealth`, `isNonRetryableError`, `isCriticalError`, `notifyCriticalError`, `generateExecutionId`, `startTimer`, `sleep`, `getMetrics`, `getQuickMetrics`, `getCircuitBreakerStatus`, `getRateLimiterStatus`, `reset`, `forEach`, `updateConfig`, `healthCheck`
- 🔒 `RateLimitError` ← Error (línea 633)
- 🔒 `TimeoutError` ← Error (línea 641)

**Imports (3):**
- 📁 `logger` desde `../../utils/logger`
- 📁 `CircuitBreaker` desde `../../utils/circuitBreaker`
- 📁 `apiRateLimiter` desde `../../utils/rateLimiter`

**Exports (1):**
- 🔄 `{
    ResilienceManager,
    RateLimitError,
    TimeoutError
}` (commonjs)

---

### 📁 src\utils

**Archivos encontrados:** 20

#### Grupo 1

#### 📄 chatState.js

**Ruta:** `src\utils\chatState.js`  
**Tamaño:** 1734 caracteres, 58 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (3):**
- 🔒 `pauseChat` (function, línea 15)
- 🔒 `resumeChat` (function, línea 36)
- 🔒 `isChatPaused` (function, línea 49)

**Imports (1):**
- 📁 `logger` desde `./logger`

**Exports (1):**
- 🔄 `{
    pauseChat,
    resumeChat,
    isChatPaused,
}` (commonjs)

#### 📄 circuitBreaker.js

**Ruta:** `src\utils\circuitBreaker.js`  
**Tamaño:** 5525 caracteres, 175 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (10):**
- 🔒 `constructor` (unknown, línea 10)
- 🔒 `execute` (unknown, línea 47)
- 🔒 `if` (unknown, línea 51)
- 🔒 `catch` (unknown, línea 70)
- 🔒 `executeWithTimeout` (unknown, línea 79)
- 🔒 `onSuccess` (unknown, línea 99)
- 🔒 `onFailure` (unknown, línea 116)
- 🔒 `reset` (unknown, línea 139)
- 🔒 `getStatus` (unknown, línea 152)
- 🔒 `isAvailable` (unknown, línea 168)

**Clases (1):**
- 🔄 `CircuitBreaker` (línea 9)
  - Métodos: `execute`, `if`, `catch`, `executeWithTimeout`, `onSuccess`, `onFailure`, `reset`, `getStatus`, `isAvailable`

**Imports (1):**
- 📁 `logger` desde `./logger`

**Exports (1):**
- 🔄 `CircuitBreaker` (commonjs)

#### 📄 claude.js

**Ruta:** `src\utils\claude.js`  
**Tamaño:** 12421 caracteres, 220 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (4):**
- 🔒 `getSystemPrompt` (function, línea 21)
- 🔒 `interpretQuery` (function, línea 184)
- 🔒 `if` (unknown, línea 35)
- 🔒 `catch` (unknown, línea 207)

**Imports (4):**
- 📦 `Anthropic` desde `@anthropic-ai/sdk`
- 📁 `config` desde `./config`
- 📁 `logger` desde `./logger`
- 📁 `getConocimientos` desde `../database/pg`

**Exports (1):**
- 🔄 `{
    interpretQuery,
}` (commonjs)

#### 📄 config.js

**Ruta:** `src\utils\config.js`  
**Tamaño:** 7391 caracteres, 149 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (2):**
- 🔒 `validateConfig` (arrow, línea 126)
- 🔒 `if` (unknown, línea 136)

**Imports (1):**
- 📁 `logger` desde `./logger`

**Exports (1):**
- 🔄 `config` (commonjs)

#### 📄 contextCache.js

**Ruta:** `src\utils\contextCache.js`  
**Tamaño:** 13880 caracteres, 402 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (13):**
- 🔒 `constructor` (unknown, línea 10)
- 🔒 `initializeStaticCache` (unknown, línea 39)
- 🔒 `if` (unknown, línea 43)
- 🔒 `catch` (unknown, línea 86)
- 🔒 `buildCatalogIndex` (unknown, línea 96)
- 🔒 `extractProductKeywords` (unknown, línea 154)
- 🔒 `extractBrand` (unknown, línea 185)
- 🔒 `getOptimizedClientContext` (unknown, línea 215)
- 🔒 `getRelevantProducts` (unknown, línea 272)
- 🔒 `searchRelevantProducts` (unknown, línea 308)
- 🔒 `normalizeQuery` (unknown, línea 352)
- 🔒 `getCacheStats` (unknown, línea 365)
- 🔒 `clearAllCaches` (unknown, línea 386)

**Clases (1):**
- 🔒 `ContextCache` (línea 9)
  - Métodos: `initializeStaticCache`, `if`, `catch`, `buildCatalogIndex`, `extractProductKeywords`, `extractBrand`, `getOptimizedClientContext`, `getRelevantProducts`, `searchRelevantProducts`, `normalizeQuery`, `getCacheStats`, `clearAllCaches`

**Imports (2):**
- 📁 `logger` desde `./logger`
- 📁 `LRUCache` desde `./lruCache`

**Exports (1):**
- 🔄 `contextCache` (commonjs)

#### Grupo 2

#### 📄 conversationContext.js

**Ruta:** `src\utils\conversationContext.js`  
**Tamaño:** 15468 caracteres, 417 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (14):**
- 🔒 `constructor` (unknown, línea 11)
- 🔒 `getContext` (unknown, línea 52)
- 🔒 `if` (unknown, línea 55)
- 🔒 `createNewContext` (unknown, línea 74)
- 🔒 `updateContext` (unknown, línea 104)
- 🔒 `resolveAnaphora` (unknown, línea 156)
- 🔒 `getEnrichedContextForAgent` (unknown, línea 207)
- 🔒 `shouldResetContext` (unknown, línea 253)
- 🔒 `extractEntities` (unknown, línea 265)
- 🔒 `updateContextEntities` (unknown, línea 311)
- 🔒 `inferCurrentTopic` (unknown, línea 337)
- 🔒 `inferConversationStage` (unknown, línea 362)
- 🔒 `getStats` (unknown, línea 383)
- 🔒 `cleanupExpiredContexts` (unknown, línea 395)

**Clases (1):**
- 🔒 `ConversationContext` (línea 10)
  - Métodos: `getContext`, `if`, `createNewContext`, `updateContext`, `resolveAnaphora`, `getEnrichedContextForAgent`, `shouldResetContext`, `extractEntities`, `updateContextEntities`, `inferCurrentTopic`, `inferConversationStage`, `getStats`, `cleanupExpiredContexts`

**Imports (3):**
- 📁 `LRUCache` desde `./lruCache`
- 📁 `logger` desde `./logger`
- 📁 `normalizeQuery, normalizeDeviceName, normalizeRepairType, normalizeQualityType` desde `./fuzzyMatcher`

**Exports (1):**
- 🔄 `conversationContext` (commonjs)

#### 📄 failureHandler.js

**Ruta:** `src\utils\failureHandler.js`  
**Tamaño:** 10338 caracteres, 270 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (10):**
- 🔒 `constructor` (unknown, línea 10)
- 🔒 `recordFailure` (unknown, línea 34)
- 🔒 `if` (unknown, línea 48)
- 🔒 `catch` (unknown, línea 93)
- 🔒 `recordSuccess` (unknown, línea 111)
- 🔒 `getEscalationMessage` (unknown, línea 144)
- 🔒 `checkFailureStatus` (unknown, línea 155)
- 🔒 `getFailureStats` (unknown, línea 207)
- 🔒 `manualReset` (unknown, línea 252)
- 🔒 `updateConfig` (unknown, línea 261)

**Clases (1):**
- 🔒 `FailureHandler` (línea 9)
  - Métodos: `recordFailure`, `if`, `catch`, `recordSuccess`, `getEscalationMessage`, `checkFailureStatus`, `getFailureStats`, `manualReset`, `updateConfig`

**Imports (2):**
- 📁 `pool` desde `../database/pg`
- 📁 `logger` desde `./logger`

**Exports (1):**
- 🔄 `failureHandler` (commonjs)

#### 📄 fuzzyMatcher.js

**Ruta:** `src\utils\fuzzyMatcher.js`  
**Tamaño:** 12038 caracteres, 336 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (9):**
- 🔒 `levenshteinDistance` (function, línea 13)
- 🔒 `similarity` (function, línea 53)
- 🔒 `findBestMatch` (function, línea 128)
- 🔒 `normalizeDeviceName` (function, línea 172)
- 🔒 `normalizeRepairType` (function, línea 197)
- 🔒 `normalizeQualityType` (function, línea 222)
- 🔒 `normalizeQuery` (function, línea 247)
- 🔒 `for` (unknown, línea 22)
- 🔒 `if` (unknown, línea 152)

**Exports (1):**
- 🔄 `{
    similarity,
    levenshteinDistance,
    normalizeDeviceName,
    normalizeRepairType,
    normalizeQualityType,
    normalizeQuery,
    findBestMatch,
    deviceVariants,
    repairVariants,
    qualityVariants
}` (commonjs)

#### 📄 intelligentRouter.js

**Ruta:** `src\utils\intelligentRouter.js`  
**Tamaño:** 19533 caracteres, 557 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (14):**
- 🔒 `constructor` (unknown, línea 12)
- 🔒 `processQuery` (unknown, línea 59)
- 🔒 `if` (unknown, línea 74)
- 🔒 `catch` (unknown, línea 99)
- 🔒 `analyzeRouting` (unknown, línea 132)
- 🔒 `analyzeComplexity` (unknown, línea 193)
- 🔒 `analyzeIntention` (unknown, línea 258)
- 🔒 `analyzeContext` (unknown, línea 311)
- 🔒 `processWithLocal` (unknown, línea 329)
- 🔒 `processWithRemote` (unknown, línea 405)
- 🔒 `findProductInRelevant` (unknown, línea 434)
- 🔒 `evaluateResponseQuality` (unknown, línea 474)
- 🔒 `updateMetrics` (unknown, línea 523)
- 🔒 `getMetrics` (unknown, línea 541)

**Clases (1):**
- 🔄 `IntelligentRouter` (línea 11)
  - Métodos: `processQuery`, `if`, `catch`, `analyzeRouting`, `analyzeComplexity`, `analyzeIntention`, `analyzeContext`, `processWithLocal`, `processWithRemote`, `findProductInRelevant`, `evaluateResponseQuality`, `updateMetrics`, `getMetrics`

**Imports (4):**
- 📁 `QwenLocalClient` desde `./qwenLocal`
- 📁 `interpretQuery: claudeInterpretQuery` desde `./claude`
- 📁 `contextCache` desde `./contextCache`
- 📁 `logger` desde `./logger`

**Exports (1):**
- 🔄 `IntelligentRouter` (commonjs)

#### 📄 llmJudge.js

**Ruta:** `src\utils\llmJudge.js`  
**Tamaño:** 14774 caracteres, 426 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (16):**
- 🔒 `constructor` (unknown, línea 12)
- 🔒 `evaluateResponse` (unknown, línea 64)
- 🔒 `if` (unknown, línea 68)
- 🔒 `catch` (unknown, línea 102)
- 🔒 `buildEvaluationPrompt` (unknown, línea 116)
- 🔒 `performEvaluation` (unknown, línea 180)
- 🔒 `parseEvaluationResponse` (unknown, línea 201)
- 🔒 `validateEvaluation` (unknown, línea 223)
- 🔒 `for` (unknown, línea 235)
- 🔒 `getFallbackEvaluation` (unknown, línea 263)
- 🔒 `generateCacheKey` (unknown, línea 295)
- 🔒 `updateMetrics` (unknown, línea 311)
- 🔒 `batchEvaluate` (unknown, línea 330)
- 🔒 `getStats` (unknown, línea 373)
- 🔒 `getResponsesNeedingImprovement` (unknown, línea 389)
- 🔒 `cleanupCache` (unknown, línea 409)

**Clases (1):**
- 🔒 `LLMJudge` (línea 11)
  - Métodos: `evaluateResponse`, `if`, `catch`, `buildEvaluationPrompt`, `performEvaluation`, `parseEvaluationResponse`, `validateEvaluation`, `for`, `getFallbackEvaluation`, `generateCacheKey`, `updateMetrics`, `batchEvaluate`, `getStats`, `getResponsesNeedingImprovement`, `cleanupCache`

**Imports (4):**
- 📦 `ChatAnthropic` desde `@langchain/anthropic`
- 📁 `logger` desde `./logger`
- 📁 `LRUCache` desde `./lruCache`
- 📁 `apiRateLimiter` desde `./rateLimiter`

**Exports (1):**
- 🔄 `llmJudge` (commonjs)

#### Grupo 3

#### 📄 logger.js

**Ruta:** `src\utils\logger.js`  
**Tamaño:** 2133 caracteres, 71 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (2):**
- 🔒 `if` (unknown, línea 18)
- 🔒 `catch` (unknown, línea 49)

**Imports (3):**
- 📦 `winston` desde `winston`
- 📦 `fs` desde `fs`
- 📦 `path` desde `path`

**Exports (1):**
- 🔄 `logger` (commonjs)

#### 📄 lruCache.js

**Ruta:** `src\utils\lruCache.js`  
**Tamaño:** 6515 caracteres, 257 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (20):**
- 🔒 `constructor` (unknown, línea 8)
- 🔒 `get` (unknown, línea 25)
- 🔒 `set` (unknown, línea 44)
- 🔒 `if` (unknown, línea 50)
- 🔒 `has` (unknown, línea 66)
- 🔒 `delete` (unknown, línea 75)
- 🔒 `clear` (unknown, línea 86)
- 🔒 `size` (unknown, línea 95)
- 🔒 `keys` (unknown, línea 103)
- 🔒 `values` (unknown, línea 111)
- 🔒 `forEach` (unknown, línea 119)
- 🔒 `getMetrics` (unknown, línea 131)
- 🔒 `resetMetrics` (unknown, línea 146)
- 🔒 `getExpiredKeys` (unknown, línea 161)
- 🔒 `for` (unknown, línea 166)
- 🔒 `evictExpired` (unknown, línea 180)
- 🔒 `addMetric` (unknown, línea 208)
- 🔒 `getRecentMetric` (unknown, línea 221)
- 🔒 `cleanup` (unknown, línea 237)
- 🔒 `setMaxAge` (unknown, línea 249)

**Clases (2):**
- 🔒 `LRUCache` (línea 7)
  - Métodos: `get`, `set`, `if`, `has`, `delete`, `clear`, `size`, `keys`, `values`, `forEach`, `getMetrics`, `resetMetrics`, `getExpiredKeys`, `for`, `evictExpired`
- 🔒 `MetricsLRUCache` ← LRUCache (línea 197)
  - Métodos: `addMetric`, `getRecentMetric`, `if`, `cleanup`, `setMaxAge`

**Exports (1):**
- 🔄 `{
    LRUCache,
    MetricsLRUCache
}` (commonjs)

#### 📄 outOfScopeDetector.js

**Ruta:** `src\utils\outOfScopeDetector.js`  
**Tamaño:** 8182 caracteres, 233 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (7):**
- 🔒 `detectOutOfScope` (function, línea 77)
- 🔒 `calculateConfidence` (function, línea 129)
- 🔒 `generateRecommendation` (function, línea 161)
- 🔒 `generateEmpathicResponse` (function, línea 183)
- 🔒 `for` (unknown, línea 86)
- 🔒 `if` (unknown, línea 162)
- 🔒 `switch` (unknown, línea 194)

**Exports (1):**
- 🔄 `{
    detectOutOfScope,
    generateEmpathicResponse,
    OUT_OF_SCOPE_KEYWORDS,
    IN_SCOPE_SERVICES
}` (commonjs)

#### 📄 performanceMonitor.js

**Ruta:** `src\utils\performanceMonitor.js`  
**Tamaño:** 16229 caracteres, 501 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (21):**
- 🔒 `constructor` (unknown, línea 10)
- 🔒 `recordRequest` (unknown, línea 53)
- 🔒 `if` (unknown, línea 66)
- 🔒 `recordLatency` (unknown, línea 100)
- 🔒 `recordSourceStats` (unknown, línea 122)
- 🔒 `recordIntentionStats` (unknown, línea 137)
- 🔒 `recordHourlyStats` (unknown, línea 165)
- 🔒 `checkAlerts` (unknown, línea 192)
- 🔒 `generateAlert` (unknown, línea 233)
- 🔒 `formatAlertMessage` (unknown, línea 261)
- 🔒 `switch` (unknown, línea 262)
- 🔒 `getErrorRate` (unknown, línea 280)
- 🔒 `periodicCleanup` (unknown, línea 288)
- 🔒 `logIfNeeded` (unknown, línea 314)
- 🔒 `getSummary` (unknown, línea 336)
- 🔒 `getPercentile` (unknown, línea 391)
- 🔒 `getDetailedMetrics` (unknown, línea 402)
- 🔒 `getRecentAlerts` (unknown, línea 417)
- 🔒 `getLatencyTrends` (unknown, línea 436)
- 🔒 `getCurrentHourAverage` (unknown, línea 455)
- 🔒 `reset` (unknown, línea 474)

**Clases (1):**
- 🔒 `PerformanceMonitor` (línea 9)
  - Métodos: `recordRequest`, `if`, `recordLatency`, `recordSourceStats`, `recordIntentionStats`, `recordHourlyStats`, `checkAlerts`, `generateAlert`, `formatAlertMessage`, `switch`, `getErrorRate`, `periodicCleanup`, `logIfNeeded`, `getSummary`, `getPercentile`, `getDetailedMetrics`, `getRecentAlerts`, `getLatencyTrends`, `getCurrentHourAverage`, `reset`

**Imports (2):**
- 📁 `logger` desde `./logger`
- 📁 `MetricsLRUCache` desde `./lruCache`

**Exports (1):**
- 🔄 `performanceMonitor` (commonjs)

#### 📄 proactiveMonitor.js

**Ruta:** `src\utils\proactiveMonitor.js`  
**Tamaño:** 15023 caracteres, 418 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (18):**
- 🔒 `constructor` (unknown, línea 15)
- 🔒 `start` (unknown, línea 50)
- 🔒 `if` (unknown, línea 51)
- 🔒 `stop` (unknown, línea 76)
- 🔒 `performHealthCheck` (unknown, línea 97)
- 🔒 `catch` (unknown, línea 125)
- 🔒 `checkDatabaseHealth` (unknown, línea 134)
- 🔒 `checkAnthropicAPIHealth` (unknown, línea 155)
- 🔒 `checkCircuitBreakerHealth` (unknown, línea 173)
- 🔒 `checkRateLimiterHealth` (unknown, línea 199)
- 🔒 `calculateSystemMetrics` (unknown, línea 221)
- 🔒 `evaluateSystemHealth` (unknown, línea 265)
- 🔒 `generateAlerts` (unknown, línea 293)
- 🔒 `addAlert` (unknown, línea 318)
- 🔒 `checkCriticalAlerts` (unknown, línea 349)
- 🔒 `getStatus` (unknown, línea 366)
- 🔒 `acknowledgeAlert` (unknown, línea 383)
- 🔒 `cleanupAlerts` (unknown, línea 397)

**Clases (1):**
- 🔒 `ProactiveMonitor` (línea 14)
  - Métodos: `start`, `if`, `stop`, `performHealthCheck`, `catch`, `checkDatabaseHealth`, `checkAnthropicAPIHealth`, `checkCircuitBreakerHealth`, `checkRateLimiterHealth`, `calculateSystemMetrics`, `evaluateSystemHealth`, `generateAlerts`, `addAlert`, `checkCriticalAlerts`, `getStatus`, `acknowledgeAlert`, `cleanupAlerts`

**Imports (7):**
- 📁 `logger` desde `./logger`
- 📁 `pool` desde `../database/pg`
- 📁 `circuitBreaker` desde `./circuitBreaker`
- 📁 `apiRateLimiter` desde `./rateLimiter`
- 📁 `failureHandler` desde `./failureHandler`
- 📁 `conversationContext` desde `./conversationContext`
- 📁 `conversationFSM` desde `./conversationFSM`

**Exports (1):**
- 🔄 `proactiveMonitor` (commonjs)

#### Grupo 4

#### 📄 qwenLocal.js

**Ruta:** `src\utils\qwenLocal.js`  
**Tamaño:** 13539 caracteres, 378 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (12):**
- 🔒 `constructor` (unknown, línea 10)
- 🔒 `checkHealth` (unknown, línea 29)
- 🔒 `if` (unknown, línea 33)
- 🔒 `catch` (unknown, línea 55)
- 🔒 `generate` (unknown, línea 69)
- 🔒 `extractQueryInfo` (unknown, línea 125)
- 🔒 `generateConversationalResponse` (unknown, línea 178)
- 🔒 `buildExtractionPrompt` (unknown, línea 206)
- 🔒 `buildConversationalPrompt` (unknown, línea 243)
- 🔒 `getToneStyle` (unknown, línea 297)
- 🔒 `switch` (unknown, línea 298)
- 🔒 `fallbackExtraction` (unknown, línea 314)

**Clases (1):**
- 🔄 `QwenLocalClient` (línea 9)
  - Métodos: `checkHealth`, `if`, `catch`, `generate`, `extractQueryInfo`, `generateConversationalResponse`, `buildExtractionPrompt`, `buildConversationalPrompt`, `getToneStyle`, `switch`, `fallbackExtraction`

**Imports (2):**
- 📦 `axios` desde `axios`
- 📁 `logger` desde `./logger`

**Exports (1):**
- 🔄 `QwenLocalClient` (commonjs)

#### 📄 rateLimiter.js

**Ruta:** `src\utils\rateLimiter.js`  
**Tamaño:** 7833 caracteres, 255 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (10):**
- 🔒 `withRateLimit` (function, línea 233)
- 🔒 `constructor` (unknown, línea 10)
- 🔒 `checkLimit` (unknown, línea 27)
- 🔒 `if` (unknown, línea 34)
- 🔒 `getBucket` (unknown, línea 69)
- 🔒 `refillBucket` (unknown, línea 91)
- 🔒 `startRefillTimer` (unknown, línea 104)
- 🔒 `getStats` (unknown, línea 120)
- 🔒 `resetClient` (unknown, línea 140)
- 🔒 `catch` (unknown, línea 215)

**Clases (2):**
- 🔒 `RateLimiter` (línea 9)
  - Métodos: `checkLimit`, `if`, `getBucket`, `refillBucket`, `startRefillTimer`, `getStats`, `resetClient`
- 🔒 `APIRateLimiter` (línea 154)
  - Métodos: `checkLimit`, `if`, `getStats`, `resetClient`, `catch`

**Imports (2):**
- 📁 `LRUCache` desde `./lruCache`
- 📁 `logger` desde `./logger`

**Exports (1):**
- 🔄 `{
    RateLimiter,
    APIRateLimiter,
    apiRateLimiter,
    withRateLimit
}` (commonjs)

#### 📄 responseValidator.js

**Ruta:** `src\utils\responseValidator.js`  
**Tamaño:** 6167 caracteres, 180 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (10):**
- 🔒 `detectInventedDataValidator` (function, línea 48)
- 🔒 `calculateRiskLevel` (function, línea 129)
- 🔒 `sanitizeResponse` (function, línea 140)
- 🔒 `getRecommendation` (function, línea 154)
- 🔒 `constructor` (unknown, línea 6)
- 🔒 `use` (unknown, línea 14)
- 🔒 `validate` (unknown, línea 24)
- 🔒 `for` (unknown, línea 27)
- 🔒 `if` (unknown, línea 60)
- 🔒 `switch` (unknown, línea 155)

**Clases (1):**
- 🔒 `ValidationPipeline` (línea 5)
  - Métodos: `use`, `validate`, `for`

**Exports (1):**
- 🔄 `{
    responseValidatorPipeline,
    ValidationPipeline,
    detectInventedDataValidator,
    calculateRiskLevel,
    sanitizeResponse,
    getRecommendation
}` (commonjs)

#### 📄 retryHandler.js

**Ruta:** `src\utils\retryHandler.js`  
**Tamaño:** 938 caracteres, 22 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (3):**
- 🔒 `while` (unknown, línea 5)
- 🔒 `catch` (unknown, línea 8)
- 🔒 `if` (unknown, línea 10)

**Imports (1):**
- 📁 `logger` desde `./logger`

**Exports (1):**
- 🔄 `retryHandler` (commonjs)

#### 📄 robustSofiaParser.js

**Ruta:** `src\utils\robustSofiaParser.js`  
**Tamaño:** 11489 caracteres, 345 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (11):**
- 🔒 `parse` (unknown, línea 28)
- 🔒 `if` (unknown, línea 29)
- 🔒 `catch` (unknown, línea 74)
- 🔒 `extractToolCall` (unknown, línea 91)
- 🔒 `for` (unknown, línea 104)
- 🔒 `isValidToolName` (unknown, línea 150)
- 🔒 `parseToolArguments` (unknown, línea 171)
- 🔒 `calculateConfidence` (unknown, línea 212)
- 🔒 `sanitizeUserResponse` (unknown, línea 237)
- 🔒 `validateToolCall` (unknown, línea 261)
- 🔒 `getParsingStats` (unknown, línea 330)

**Clases (1):**
- 🔒 `RobustSofiaParser` (línea 20)
  - Métodos: `parse`, `if`, `catch`, `extractToolCall`

**Imports (1):**
- 📁 `logger` desde `./logger`

**Exports (1):**
- 🔄 `{
    RobustSofiaParser
}` (commonjs)

---

### 📁 task-service

**Archivos encontrados:** 1

#### 📄 index.js

**Ruta:** `task-service\index.js`  
**Tamaño:** 96 caracteres, 2 líneas  
**Tipo:** Script 

---

### 📁 test

**Archivos encontrados:** 1

#### 📄 integration-test.js

**Ruta:** `test\integration-test.js`  
**Tamaño:** 9720 caracteres, 293 líneas  
**Tipo:** Módulo ES6/CommonJS (con exports)

**Funciones (15):**
- 🔒 `constructor` (unknown, línea 16)
- 🔒 `runAllTests` (unknown, línea 28)
- 🔒 `catch` (unknown, línea 42)
- 🔒 `testInitialization` (unknown, línea 53)
- 🔒 `if` (unknown, línea 60)
- 🔒 `testPerformanceLayer` (unknown, línea 74)
- 🔒 `testResilienceLayer` (unknown, línea 102)
- 🔒 `testUnifiedOperation` (unknown, línea 130)
- 🔒 `testSystemStatus` (unknown, línea 160)
- 🔒 `testOptimization` (unknown, línea 184)
- 🔒 `testShutdown` (unknown, línea 205)
- 🔒 `recordSuccess` (unknown, línea 226)
- 🔒 `recordFailure` (unknown, línea 239)
- 🔒 `printResults` (unknown, línea 252)
- 🔒 `sleep` (unknown, línea 273)

**Clases (1):**
- 🔄 `OrchestrationIntegrationTest` (línea 15)
  - Métodos: `runAllTests`, `catch`, `testInitialization`, `if`, `testPerformanceLayer`, `testResilienceLayer`, `testUnifiedOperation`, `testSystemStatus`, `testOptimization`, `testShutdown`, `recordSuccess`, `recordFailure`, `printResults`, `sleep`

**Imports (2):**
- 📁 `logger` desde `../src/utils/logger`
- 📁 `orchestrationController` desde `../src/core/OrchestrationController`

**Exports (1):**
- 🔄 `OrchestrationIntegrationTest` (commonjs)

---

### 📁 venv\lib\python3.12\site-packages\urllib3\contrib\emscripten

**Archivos encontrados:** 1

#### 📄 emscripten_fetch_worker.js

**Ruta:** `venv\lib\python3.12\site-packages\urllib3\contrib\emscripten\emscripten_fetch_worker.js`  
**Tamaño:** 3655 caracteres, 111 líneas  
**Tipo:** Script 

**Funciones (3):**
- 🔒 `addEventListener` (function, línea 12)
- 🔒 `if` (unknown, línea 13)
- 🔒 `catch` (unknown, línea 39)

---

## 🔍 Duplicados Detectados

⚠️ **Se encontraron 108 posibles duplicados:**

### 🔧 function: `constructor`

**Encontrado en:**
- 🔒 `analyzer.js` (línea 54)
- 🔒 `src\bot.js` (línea 15)
- 🔒 `src\core\OrchestrationController.js` (línea 32)
- 🔒 `src\core\intelligence\AdaptiveLearningEngine.js` (línea 18)
- 🔒 `src\core\intelligence\AdminEscalationSystem.js` (línea 22)
- 🔒 `src\core\intelligence\ContextAwareResponseGenerator.js` (línea 21)
- 🔒 `src\core\intelligence\MultiModalReasoningEngine.js` (línea 21)
- 🔒 `src\core\intelligence\PredictiveAnalyticsEngine.js` (línea 21)
- 🔒 `src\core\intelligence\UncertaintyDetector.js` (línea 18)
- 🔒 `src\core\performance\ConcurrentProcessor.js` (línea 9)
- 🔒 `src\core\performance\MemoryManager.js` (línea 8)
- 🔒 `src\core\performance\PerformanceController.js` (línea 10)
- 🔒 `src\core\performance\QueryOptimizer.js` (línea 91)
- 🔒 `src\core\resilience\AdvancedCircuitBreaker.js` (línea 8)
- 🔒 `src\core\resilience\GracefulDegradationManager.js` (línea 8)
- 🔒 `src\core\resilience\HealthMonitoringSystem.js` (línea 12)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 15)
- 🔒 `src\core\resilience\SelfHealingManager.js` (línea 11)
- 🔒 `src\monitoring\intelligentMonitor.js` (línea 9)
- 🔒 `src\scripts\convertMarkdownToPostgreSQL.js` (línea 25)
- 🔒 `src\scripts\generateSQLFromExcel.js` (línea 12)
- 🔒 `src\scripts\importExcelData.js` (línea 13)
- 🔒 `src\scripts\index_intentions.js` (línea 17)
- 🔒 `src\scripts\index_knowledge.js` (línea 20)
- 🔒 `src\scripts\migrateConversations.js` (línea 14)
- 🔒 `src\scripts\verifyMigration.js` (línea 13)
- 🔒 `src\security\advancedRateLimiter.js` (línea 19)
- 🔒 `src\security\authLayer.js` (línea 21)
- 🔒 `src\security\inputValidator.js` (línea 18)
- 🔒 `src\services\agentExecutor.js` (línea 15)
- 🔒 `src\services\clientHistorySearchEngine.js` (línea 21)
- 🔒 `src\services\conversationMemory.js` (línea 55)
- 🔒 `src\services\deterministicSearchEngine.js` (línea 22)
- 🔒 `src\services\dynamicLimitOptimizer.js` (línea 21)
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 21)
- 🔒 `src\services\guardrails.js` (línea 11)
- 🔒 `src\services\markdownContextEnricher.js` (línea 23)
- 🔒 `src\services\markdownMetadataExtractor.js` (línea 23)
- 🔒 `src\services\metadataEnhancer.js` (línea 21)
- 🔒 `src\services\priceExtractionSystem.js` (línea 36)
- 🔒 `src\services\semanticCache.js` (línea 17)
- 🔒 `src\services\semanticChunker.js` (línea 21)
- 🔒 `src\services\semanticRouter.js` (línea 18)
- 🔒 `src\services\simpleAgentExecutor.js` (línea 14)
- 🔒 `src\services\simpleDeduplicationEngine.js` (línea 22)
- 🔒 `src\services\tools.js` (línea 58)
- 🔒 `src\services\validatedEmbeddingEngine.js` (línea 22)
- 🔒 `src\services\classifiers\qwenClassifier.js` (línea 13)
- 🔒 `src\services\eventSourcing\EventStore.js` (línea 17)
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 21)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 22)
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 27)
- 🔒 `src\utils\circuitBreaker.js` (línea 10)
- 🔒 `src\utils\contextCache.js` (línea 10)
- 🔒 `src\utils\conversationContext.js` (línea 11)
- 🔒 `src\utils\failureHandler.js` (línea 10)
- 🔒 `src\utils\intelligentRouter.js` (línea 12)
- 🔒 `src\utils\llmJudge.js` (línea 12)
- 🔒 `src\utils\lruCache.js` (línea 8)
- 🔒 `src\utils\performanceMonitor.js` (línea 10)
- 🔒 `src\utils\proactiveMonitor.js` (línea 15)
- 🔒 `src\utils\qwenLocal.js` (línea 10)
- 🔒 `src\utils\rateLimiter.js` (línea 10)
- 🔒 `src\utils\responseValidator.js` (línea 6)
- 🔒 `test\integration-test.js` (línea 16)

### 🔧 function: `analyze`

**Encontrado en:**
- 🔒 `analyzer.js` (línea 78)
- 🔒 `src\monitoring\intelligentMonitor.js` (línea 23)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 1341)

### 🔧 function: `catch`

**Encontrado en:**
- 🔒 `analyzer.js` (línea 105)
- 🔒 `test-basic.js` (línea 19)
- 🔒 `test-db-connection.js` (línea 29)
- 🔒 `test-very-basic.js` (línea 14)
- 🔒 `src\bot.js` (línea 52)
- 🔒 `src\auth\admin.js` (línea 26)
- 🔒 `src\core\OrchestrationController.js` (línea 104)
- 🔒 `src\core\intelligence\AdaptiveLearningEngine.js` (línea 75)
- 🔒 `src\core\intelligence\AdminEscalationSystem.js` (línea 89)
- 🔒 `src\core\intelligence\ContextAwareResponseGenerator.js` (línea 99)
- 🔒 `src\core\intelligence\MultiModalReasoningEngine.js` (línea 89)
- 🔒 `src\core\intelligence\PredictiveAnalyticsEngine.js` (línea 84)
- 🔒 `src\core\intelligence\UncertaintyDetector.js` (línea 78)
- 🔒 `src\core\performance\ConcurrentProcessor.js` (línea 137)
- 🔒 `src\core\performance\PerformanceController.js` (línea 58)
- 🔒 `src\core\performance\QueryOptimizer.js` (línea 161)
- 🔒 `src\core\resilience\AdvancedCircuitBreaker.js` (línea 85)
- 🔒 `src\core\resilience\HealthMonitoringSystem.js` (línea 60)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 56)
- 🔒 `src\core\resilience\SelfHealingManager.js` (línea 72)
- 🔒 `src\database\pg.js` (línea 39)
- 🔒 `src\excel\processor.js` (línea 69)
- 🔒 `src\scripts\architectural_health_check.js` (línea 27)
- 🔒 `src\scripts\clear_cache_collection.js` (línea 22)
- 🔒 `src\scripts\convertMarkdownToPostgreSQL.js` (línea 64)
- 🔒 `src\scripts\generateSQLFromExcel.js` (línea 71)
- 🔒 `src\scripts\importExcelData.js` (línea 76)
- 🔒 `src\scripts\index_intentions.js` (línea 28)
- 🔒 `src\scripts\index_knowledge.js` (línea 31)
- 🔒 `src\scripts\index_markdown_prices.js` (línea 133)
- 🔒 `src\scripts\migrate_to_task_prefixes.js` (línea 35)
- 🔒 `src\scripts\migrateConversations.js` (línea 51)
- 🔒 `src\scripts\run_evals.js` (línea 42)
- 🔒 `src\scripts\seed_proactive_knowledge.js` (línea 57)
- 🔒 `src\scripts\verifyMigration.js` (línea 41)
- 🔒 `src\security\advancedRateLimiter.js` (línea 571)
- 🔒 `src\security\authLayer.js` (línea 472)
- 🔒 `src\security\inputValidator.js` (línea 390)
- 🔒 `src\services\agentExecutor.js` (línea 126)
- 🔒 `src\services\clientHistorySearchEngine.js` (línea 122)
- 🔒 `src\services\conversationMemory.js` (línea 86)
- 🔒 `src\services\deterministicSearchEngine.js` (línea 168)
- 🔒 `src\services\dynamicLimitOptimizer.js` (línea 187)
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 108)
- 🔒 `src\services\embeddingEngine.js` (línea 28)
- 🔒 `src\services\markdownContextEnricher.js` (línea 89)
- 🔒 `src\services\markdownMetadataExtractor.js` (línea 106)
- 🔒 `src\services\metadataEnhancer.js` (línea 172)
- 🔒 `src\services\priceExtractionSystem.js` (línea 53)
- 🔒 `src\services\semanticCache.js` (línea 55)
- 🔒 `src\services\semanticChunker.js` (línea 113)
- 🔒 `src\services\semanticRouter.js` (línea 29)
- 🔒 `src\services\serviceRegistry.js` (línea 41)
- 🔒 `src\services\simpleAgentExecutor.js` (línea 75)
- 🔒 `src\services\simpleDeduplicationEngine.js` (línea 124)
- 🔒 `src\services\tools.js` (línea 87)
- 🔒 `src\services\validatedEmbeddingEngine.js` (línea 110)
- 🔒 `src\services\classifiers\qwenClassifier.js` (línea 44)
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 89)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 200)
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 198)
- 🔒 `src\utils\circuitBreaker.js` (línea 70)
- 🔒 `src\utils\claude.js` (línea 207)
- 🔒 `src\utils\contextCache.js` (línea 86)
- 🔒 `src\utils\failureHandler.js` (línea 93)
- 🔒 `src\utils\intelligentRouter.js` (línea 99)
- 🔒 `src\utils\llmJudge.js` (línea 102)
- 🔒 `src\utils\logger.js` (línea 49)
- 🔒 `src\utils\proactiveMonitor.js` (línea 125)
- 🔒 `src\utils\qwenLocal.js` (línea 55)
- 🔒 `src\utils\rateLimiter.js` (línea 215)
- 🔒 `src\utils\retryHandler.js` (línea 8)
- 🔒 `src\utils\robustSofiaParser.js` (línea 74)
- 🔒 `test\integration-test.js` (línea 42)
- 🔒 `venv\lib\python3.12\site-packages\urllib3\contrib\emscripten\emscripten_fetch_worker.js` (línea 39)

### 🔧 function: `if`

**Encontrado en:**
- 🔒 `analyzer.js` (línea 133)
- 🔒 `src\bot.js` (línea 42)
- 🔒 `src\auth\admin.js` (línea 13)
- 🔒 `src\core\OrchestrationController.js` (línea 70)
- 🔒 `src\core\intelligence\AdaptiveLearningEngine.js` (línea 111)
- 🔒 `src\core\intelligence\AdminEscalationSystem.js` (línea 60)
- 🔒 `src\core\intelligence\ContextAwareResponseGenerator.js` (línea 176)
- 🔒 `src\core\intelligence\MultiModalReasoningEngine.js` (línea 121)
- 🔒 `src\core\intelligence\PredictiveAnalyticsEngine.js` (línea 111)
- 🔒 `src\core\intelligence\UncertaintyDetector.js` (línea 58)
- 🔒 `src\core\performance\ConcurrentProcessor.js` (línea 172)
- 🔒 `src\core\performance\MemoryManager.js` (línea 76)
- 🔒 `src\core\performance\PerformanceController.js` (línea 37)
- 🔒 `src\core\performance\QueryOptimizer.js` (línea 8)
- 🔒 `src\core\resilience\AdvancedCircuitBreaker.js` (línea 108)
- 🔒 `src\core\resilience\GracefulDegradationManager.js` (línea 115)
- 🔒 `src\core\resilience\HealthMonitoringSystem.js` (línea 23)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 28)
- 🔒 `src\core\resilience\SelfHealingManager.js` (línea 29)
- 🔒 `src\database\pg.js` (línea 58)
- 🔒 `src\excel\processor.js` (línea 20)
- 🔒 `src\monitoring\intelligentMonitor.js` (línea 25)
- 🔒 `src\scripts\architectural_health_check.js` (línea 20)
- 🔒 `src\scripts\convertMarkdownToPostgreSQL.js` (línea 82)
- 🔒 `src\scripts\generateSQLFromExcel.js` (línea 91)
- 🔒 `src\scripts\importExcelData.js` (línea 116)
- 🔒 `src\scripts\index_intentions.js` (línea 40)
- 🔒 `src\scripts\index_knowledge.js` (línea 44)
- 🔒 `src\scripts\index_markdown_prices.js` (línea 40)
- 🔒 `src\scripts\migrate_to_task_prefixes.js` (línea 84)
- 🔒 `src\scripts\migrateConversations.js` (línea 30)
- 🔒 `src\scripts\run_evals.js` (línea 51)
- 🔒 `src\scripts\seed_proactive_knowledge.js` (línea 39)
- 🔒 `src\scripts\verifyMigration.js` (línea 104)
- 🔒 `src\security\advancedRateLimiter.js` (línea 33)
- 🔒 `src\security\authLayer.js` (línea 55)
- 🔒 `src\security\inputValidator.js` (línea 143)
- 🔒 `src\services\agentExecutor.js` (línea 118)
- 🔒 `src\services\clientHistorySearchEngine.js` (línea 73)
- 🔒 `src\services\conversationMemory.js` (línea 197)
- 🔒 `src\services\deterministicSearchEngine.js` (línea 132)
- 🔒 `src\services\dynamicLimitOptimizer.js` (línea 209)
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 96)
- 🔒 `src\services\embeddingEngine.js` (línea 16)
- 🔒 `src\services\guardrails.js` (línea 36)
- 🔒 `src\services\markdownContextEnricher.js` (línea 82)
- 🔒 `src\services\markdownMetadataExtractor.js` (línea 84)
- 🔒 `src\services\metadataEnhancer.js` (línea 37)
- 🔒 `src\services\priceExtractionSystem.js` (línea 67)
- 🔒 `src\services\semanticCache.js` (línea 41)
- 🔒 `src\services\semanticChunker.js` (línea 135)
- 🔒 `src\services\semanticRouter.js` (línea 49)
- 🔒 `src\services\serviceRegistry.js` (línea 35)
- 🔒 `src\services\simpleAgentExecutor.js` (línea 55)
- 🔒 `src\services\simpleDeduplicationEngine.js` (línea 189)
- 🔒 `src\services\tools.js` (línea 37)
- 🔒 `src\services\validatedEmbeddingEngine.js` (línea 133)
- 🔒 `src\services\classifiers\qwenClassifier.js` (línea 38)
- 🔒 `src\services\eventSourcing\EventStore.js` (línea 87)
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 85)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 105)
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 211)
- 🔒 `src\utils\circuitBreaker.js` (línea 51)
- 🔒 `src\utils\claude.js` (línea 35)
- 🔒 `src\utils\config.js` (línea 136)
- 🔒 `src\utils\contextCache.js` (línea 43)
- 🔒 `src\utils\conversationContext.js` (línea 55)
- 🔒 `src\utils\failureHandler.js` (línea 48)
- 🔒 `src\utils\fuzzyMatcher.js` (línea 152)
- 🔒 `src\utils\intelligentRouter.js` (línea 74)
- 🔒 `src\utils\llmJudge.js` (línea 68)
- 🔒 `src\utils\logger.js` (línea 18)
- 🔒 `src\utils\lruCache.js` (línea 50)
- 🔒 `src\utils\outOfScopeDetector.js` (línea 162)
- 🔒 `src\utils\performanceMonitor.js` (línea 66)
- 🔒 `src\utils\proactiveMonitor.js` (línea 51)
- 🔒 `src\utils\qwenLocal.js` (línea 33)
- 🔒 `src\utils\rateLimiter.js` (línea 34)
- 🔒 `src\utils\responseValidator.js` (línea 60)
- 🔒 `src\utils\retryHandler.js` (línea 10)
- 🔒 `src\utils\robustSofiaParser.js` (línea 29)
- 🔒 `test\integration-test.js` (línea 60)
- 🔒 `venv\lib\python3.12\site-packages\urllib3\contrib\emscripten\emscripten_fetch_worker.js` (línea 13)

### 🔧 function: `for`

**Encontrado en:**
- 🔒 `analyzer.js` (línea 142)
- 🔒 `src\core\OrchestrationController.js` (línea 596)
- 🔒 `src\core\intelligence\MultiModalReasoningEngine.js` (línea 230)
- 🔒 `src\core\intelligence\PredictiveAnalyticsEngine.js` (línea 195)
- 🔒 `src\core\intelligence\UncertaintyDetector.js` (línea 174)
- 🔒 `src\core\performance\ConcurrentProcessor.js` (línea 46)
- 🔒 `src\core\performance\PerformanceController.js` (línea 249)
- 🔒 `src\core\performance\QueryOptimizer.js` (línea 284)
- 🔒 `src\core\resilience\HealthMonitoringSystem.js` (línea 50)
- 🔒 `src\database\pg.js` (línea 254)
- 🔒 `src\excel\processor.js` (línea 27)
- 🔒 `src\scripts\convertMarkdownToPostgreSQL.js` (línea 141)
- 🔒 `src\scripts\generateSQLFromExcel.js` (línea 31)
- 🔒 `src\scripts\importExcelData.js` (línea 34)
- 🔒 `src\scripts\index_markdown_prices.js` (línea 34)
- 🔒 `src\scripts\migrate_to_task_prefixes.js` (línea 98)
- 🔒 `src\scripts\migrateConversations.js` (línea 44)
- 🔒 `src\scripts\run_evals.js` (línea 32)
- 🔒 `src\scripts\seed_proactive_knowledge.js` (línea 46)
- 🔒 `src\security\advancedRateLimiter.js` (línea 195)
- 🔒 `src\security\authLayer.js` (línea 54)
- 🔒 `src\security\inputValidator.js` (línea 61)
- 🔒 `src\services\clientHistorySearchEngine.js` (línea 195)
- 🔒 `src\services\conversationMemory.js` (línea 260)
- 🔒 `src\services\deterministicSearchEngine.js` (línea 187)
- 🔒 `src\services\guardrails.js` (línea 34)
- 🔒 `src\services\markdownContextEnricher.js` (línea 117)
- 🔒 `src\services\markdownMetadataExtractor.js` (línea 132)
- 🔒 `src\services\metadataEnhancer.js` (línea 484)
- 🔒 `src\services\priceExtractionSystem.js` (línea 79)
- 🔒 `src\services\semanticCache.js` (línea 180)
- 🔒 `src\services\semanticChunker.js` (línea 144)
- 🔒 `src\services\simpleDeduplicationEngine.js` (línea 179)
- 🔒 `src\services\tools.js` (línea 28)
- 🔒 `src\services\validatedEmbeddingEngine.js` (línea 214)
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 349)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 823)
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 346)
- 🔒 `src\utils\fuzzyMatcher.js` (línea 22)
- 🔒 `src\utils\llmJudge.js` (línea 235)
- 🔒 `src\utils\lruCache.js` (línea 166)
- 🔒 `src\utils\outOfScopeDetector.js` (línea 86)
- 🔒 `src\utils\responseValidator.js` (línea 27)
- 🔒 `src\utils\robustSofiaParser.js` (línea 104)

### 🔧 function: `while`

**Encontrado en:**
- 🔒 `analyzer.js` (línea 421)
- 🔒 `src\core\performance\ConcurrentProcessor.js` (línea 169)
- 🔒 `src\utils\retryHandler.js` (línea 5)

### 🔧 function: `forEach`

**Encontrado en:**
- 🔒 `analyzer.js` (línea 618)
- 🔒 `src\core\intelligence\AdaptiveLearningEngine.js` (línea 479)
- 🔒 `src\core\performance\ConcurrentProcessor.js` (línea 419)
- 🔒 `src\services\markdownContextEnricher.js` (línea 423)
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 1679)
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 560)
- 🔒 `src\utils\lruCache.js` (línea 119)

### 🔧 function: `switch`

**Encontrado en:**
- 🔒 `analyzer.js` (línea 1044)
- 🔒 `src\core\intelligence\AdaptiveLearningEngine.js` (línea 390)
- 🔒 `src\core\intelligence\ContextAwareResponseGenerator.js` (línea 477)
- 🔒 `src\core\intelligence\MultiModalReasoningEngine.js` (línea 255)
- 🔒 `src\core\resilience\AdvancedCircuitBreaker.js` (línea 98)
- 🔒 `src\core\resilience\GracefulDegradationManager.js` (línea 199)
- 🔒 `src\scripts\migrate_to_task_prefixes.js` (línea 185)
- 🔒 `src\services\conversationMemory.js` (línea 72)
- 🔒 `src\services\deterministicSearchEngine.js` (línea 501)
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 128)
- 🔒 `src\services\metadataEnhancer.js` (línea 391)
- 🔒 `src\services\simpleDeduplicationEngine.js` (línea 292)
- 🔒 `src\services\tools.js` (línea 73)
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 1189)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 798)
- 🔒 `src\utils\outOfScopeDetector.js` (línea 194)
- 🔒 `src\utils\performanceMonitor.js` (línea 262)
- 🔒 `src\utils\qwenLocal.js` (línea 298)
- 🔒 `src\utils\responseValidator.js` (línea 155)

### 🔧 function: `initialize`

**Encontrado en:**
- 🔒 `src\bot.js` (línea 33)
- 🔒 `src\core\OrchestrationController.js` (línea 65)
- 🔒 `src\core\performance\PerformanceController.js` (línea 46)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 27)
- 🔒 `src\services\agentExecutor.js` (línea 92)
- 🔒 `src\services\conversationMemory.js` (línea 195)

### 🔧 function: `setupEventHandlers`

**Encontrado en:**
- 🔒 `src\bot.js` (línea 94)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 84)

### 🔧 function: `recordSuccess`

**Encontrado en:**
- 🔒 `src\bot.js` (línea 203)
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 238)
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 419)
- 🔒 `src\utils\failureHandler.js` (línea 111)
- 🔒 `test\integration-test.js` (línea 226)

### 🔧 function: `getMetrics`

**Encontrado en:**
- 🔒 `src\bot.js` (línea 209)
- 🔒 `src\core\intelligence\AdaptiveLearningEngine.js` (línea 497)
- 🔒 `src\core\intelligence\AdminEscalationSystem.js` (línea 382)
- 🔒 `src\core\intelligence\ContextAwareResponseGenerator.js` (línea 1021)
- 🔒 `src\core\intelligence\UncertaintyDetector.js` (línea 429)
- 🔒 `src\core\performance\ConcurrentProcessor.js` (línea 375)
- 🔒 `src\core\resilience\AdvancedCircuitBreaker.js` (línea 446)
- 🔒 `src\security\authLayer.js` (línea 704)
- 🔒 `src\security\inputValidator.js` (línea 415)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 1593)
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 507)
- 🔒 `src\utils\intelligentRouter.js` (línea 541)
- 🔒 `src\utils\lruCache.js` (línea 131)

### 🔧 function: `start`

**Encontrado en:**
- 🔒 `src\bot.js` (línea 221)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 1973)
- 🔒 `src\utils\proactiveMonitor.js` (línea 50)

### 🔧 function: `shutdown`

**Encontrado en:**
- 🔒 `src\bot.js` (línea 231)
- 🔒 `src\core\OrchestrationController.js` (línea 383)
- 🔒 `src\core\intelligence\AdaptiveLearningEngine.js` (línea 531)
- 🔒 `src\core\intelligence\AdminEscalationSystem.js` (línea 393)
- 🔒 `src\core\intelligence\UncertaintyDetector.js` (línea 445)
- 🔒 `src\core\performance\ConcurrentProcessor.js` (línea 457)
- 🔒 `src\core\performance\MemoryManager.js` (línea 375)
- 🔒 `src\core\performance\PerformanceController.js` (línea 368)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 66)

### 🔧 function: `getSystemStatus`

**Encontrado en:**
- 🔒 `src\core\OrchestrationController.js` (línea 289)
- 🔒 `src\core\resilience\GracefulDegradationManager.js` (línea 635)

### 🔧 function: `getCircuitBreaker`

**Encontrado en:**
- 🔒 `src\core\OrchestrationController.js` (línea 421)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 251)

### 🔧 function: `getGracefulDegradationManager`

**Encontrado en:**
- 🔒 `src\core\OrchestrationController.js` (línea 429)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 259)

### 🔧 function: `detectServiceType`

**Encontrado en:**
- 🔒 `src\core\OrchestrationController.js` (línea 604)
- 🔒 `src\core\intelligence\UncertaintyDetector.js` (línea 406)

### 🔧 function: `updateMetrics`

**Encontrado en:**
- 🔒 `src\core\intelligence\ContextAwareResponseGenerator.js` (línea 578)
- 🔒 `src\core\intelligence\MultiModalReasoningEngine.js` (línea 410)
- 🔒 `src\core\performance\PerformanceController.js` (línea 190)
- 🔒 `src\utils\intelligentRouter.js` (línea 523)
- 🔒 `src\utils\llmJudge.js` (línea 311)

### 🔧 function: `processQuery`

**Encontrado en:**
- 🔒 `src\core\intelligence\MultiModalReasoningEngine.js` (línea 48)
- 🔒 `src\utils\intelligentRouter.js` (línea 59)

### 🔧 function: `containsTechnicalTerms`

**Encontrado en:**
- 🔒 `src\core\intelligence\MultiModalReasoningEngine.js` (línea 181)
- 🔒 `src\core\intelligence\UncertaintyDetector.js` (línea 414)

### 🔧 function: `calculateOverallConfidence`

**Encontrado en:**
- 🔒 `src\core\intelligence\MultiModalReasoningEngine.js` (línea 385)
- 🔒 `src\core\intelligence\PredictiveAnalyticsEngine.js` (línea 289)

### 🔧 function: `generateRecommendations`

**Encontrado en:**
- 🔒 `src\core\intelligence\PredictiveAnalyticsEngine.js` (línea 282)
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 2266)

### 🔧 function: `analyzeQuery`

**Encontrado en:**
- 🔒 `src\core\intelligence\UncertaintyDetector.js` (línea 41)
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 1442)

### 🔧 function: `analyzeQueryComplexity`

**Encontrado en:**
- 🔒 `src\core\intelligence\UncertaintyDetector.js` (línea 196)
- 🔒 `src\services\dynamicLimitOptimizer.js` (línea 198)

### 🔧 function: `calculateConfidence`

**Encontrado en:**
- 🔒 `src\core\intelligence\UncertaintyDetector.js` (línea 266)
- 🔒 `src\utils\outOfScopeDetector.js` (línea 129)
- 🔒 `src\utils\robustSofiaParser.js` (línea 212)

### 🔧 function: `extractBrand`

**Encontrado en:**
- 🔒 `src\core\intelligence\UncertaintyDetector.js` (línea 367)
- 🔒 `src\utils\contextCache.js` (línea 185)

### 🔧 function: `normalizeModel`

**Encontrado en:**
- 🔒 `src\core\intelligence\UncertaintyDetector.js` (línea 402)
- 🔒 `src\scripts\convertMarkdownToPostgreSQL.js` (línea 342)
- 🔒 `src\scripts\generateSQLFromExcel.js` (línea 216)
- 🔒 `src\scripts\importExcelData.js` (línea 213)

### 🔧 function: `sleep`

**Encontrado en:**
- 🔒 `src\core\performance\ConcurrentProcessor.js` (línea 398)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 1253)
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 499)
- 🔒 `test\integration-test.js` (línea 273)

### 🔧 function: `optimize`

**Encontrado en:**
- 🔒 `src\core\performance\ConcurrentProcessor.js` (línea 406)
- 🔒 `src\core\performance\PerformanceController.js` (línea 314)
- 🔒 `src\core\performance\QueryOptimizer.js` (línea 25)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 210)

### 🔧 function: `startMonitoring`

**Encontrado en:**
- 🔒 `src\core\performance\MemoryManager.js` (línea 266)
- 🔒 `src\core\resilience\HealthMonitoringSystem.js` (línea 22)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 104)

### 🔧 function: `executeOptimizedQuery`

**Encontrado en:**
- 🔒 `src\core\performance\PerformanceController.js` (línea 92)
- 🔒 `src\core\performance\QueryOptimizer.js` (línea 128)

### 🔧 function: `getPerformanceMetrics`

**Encontrado en:**
- 🔒 `src\core\performance\PerformanceController.js` (línea 166)
- 🔒 `src\core\performance\QueryOptimizer.js` (línea 267)

### 🔧 function: `getStatus`

**Encontrado en:**
- 🔒 `src\core\performance\PerformanceController.js` (línea 352)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 194)
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 541)
- 🔒 `src\utils\circuitBreaker.js` (línea 152)
- 🔒 `src\utils\proactiveMonitor.js` (línea 366)

### 🔧 function: `calculateSimilarity`

**Encontrado en:**
- 🔒 `src\core\performance\QueryOptimizer.js` (línea 326)
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 1993)

### 🔧 function: `execute`

**Encontrado en:**
- 🔒 `src\core\resilience\AdvancedCircuitBreaker.js` (línea 67)
- 🔒 `src\services\agentExecutor.js` (línea 110)
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 85)
- 🔒 `src\services\simpleAgentExecutor.js` (línea 46)
- 🔒 `src\utils\circuitBreaker.js` (línea 47)

### 🔧 function: `transitionToOpen`

**Encontrado en:**
- 🔒 `src\core\resilience\AdvancedCircuitBreaker.js` (línea 251)
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 341)

### 🔧 function: `transitionToHalfOpen`

**Encontrado en:**
- 🔒 `src\core\resilience\AdvancedCircuitBreaker.js` (línea 276)
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 351)

### 🔧 function: `transitionToClosed`

**Encontrado en:**
- 🔒 `src\core\resilience\AdvancedCircuitBreaker.js` (línea 298)
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 334)

### 🔧 function: `performHealthCheck`

**Encontrado en:**
- 🔒 `src\core\resilience\AdvancedCircuitBreaker.js` (línea 424)
- 🔒 `src\core\resilience\GracefulDegradationManager.js` (línea 614)
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 526)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 611)
- 🔒 `src\utils\proactiveMonitor.js` (línea 97)

### 🔧 function: `registerService`

**Encontrado en:**
- 🔒 `src\core\resilience\GracefulDegradationManager.js` (línea 87)
- 🔒 `src\services\serviceRegistry.js` (línea 19)

### 🔧 function: `evaluateSystemHealth`

**Encontrado en:**
- 🔒 `src\core\resilience\GracefulDegradationManager.js` (línea 460)
- 🔒 `src\utils\proactiveMonitor.js` (línea 265)

### 🔧 function: `stopMonitoring`

**Encontrado en:**
- 🔒 `src\core\resilience\HealthMonitoringSystem.js` (línea 34)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 134)

### 🔧 function: `getSystemHealth`

**Encontrado en:**
- 🔒 `src\core\resilience\HealthMonitoringSystem.js` (línea 125)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 181)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 1260)

### 🔧 function: `executeWithProtection`

**Encontrado en:**
- 🔒 `src\core\resilience\ResilienceController.js` (línea 94)
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 172)

### 🔧 function: `reportFailure`

**Encontrado en:**
- 🔒 `src\core\resilience\ResilienceController.js` (línea 121)
- 🔒 `src\core\resilience\SelfHealingManager.js` (línea 23)

### 🔧 function: `restartService`

**Encontrado en:**
- 🔒 `src\core\resilience\SelfHealingManager.js` (línea 84)
- 🔒 `src\services\serviceRegistry.js` (línea 31)

### 🔧 function: `processExcelFile`

**Encontrado en:**
- 🔒 `src\excel\processor.js` (línea 83)
- 🔒 `src\scripts\generateSQLFromExcel.js` (línea 41)
- 🔒 `src\scripts\importExcelData.js` (línea 44)

### 🔧 function: `parsePrice`

**Encontrado en:**
- 🔒 `src\scripts\convertMarkdownToPostgreSQL.js` (línea 330)
- 🔒 `src\services\markdownContextEnricher.js` (línea 301)

### 🔧 function: `parseSheetData`

**Encontrado en:**
- 🔒 `src\scripts\generateSQLFromExcel.js` (línea 79)
- 🔒 `src\scripts\importExcelData.js` (línea 85)

### 🔧 function: `looksLikeHeader`

**Encontrado en:**
- 🔒 `src\scripts\generateSQLFromExcel.js` (línea 102)
- 🔒 `src\scripts\importExcelData.js` (línea 127)

### 🔧 function: `detectColumns`

**Encontrado en:**
- 🔒 `src\scripts\generateSQLFromExcel.js` (línea 115)
- 🔒 `src\scripts\importExcelData.js` (línea 144)

### 🔧 function: `parseDataRow`

**Encontrado en:**
- 🔒 `src\scripts\generateSQLFromExcel.js` (línea 187)
- 🔒 `src\scripts\importExcelData.js` (línea 182)

### 🔧 function: `generate`

**Encontrado en:**
- 🔒 `src\scripts\index_intentions.js` (línea 21)
- 🔒 `src\scripts\index_knowledge.js` (línea 24)
- 🔒 `src\services\conversationMemory.js` (línea 64)
- 🔒 `src\services\semanticCache.js` (línea 21)
- 🔒 `src\services\semanticRouter.js` (línea 22)
- 🔒 `src\services\tools.js` (línea 65)
- 🔒 `src\utils\qwenLocal.js` (línea 69)

### 🔧 function: `executeMigrationStrategy`

**Encontrado en:**
- 🔒 `src\scripts\migrate_to_task_prefixes.js` (línea 175)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 790)

### 🔧 function: `cleanup`

**Encontrado en:**
- 🔒 `src\security\advancedRateLimiter.js` (línea 280)
- 🔒 `src\security\authLayer.js` (línea 730)
- 🔒 `src\utils\lruCache.js` (línea 237)

### 🔧 function: `checkRateLimit`

**Encontrado en:**
- 🔒 `src\security\advancedRateLimiter.js` (línea 435)
- 🔒 `src\security\authLayer.js` (línea 566)

### 🔧 function: `enableBypass`

**Encontrado en:**
- 🔒 `src\security\advancedRateLimiter.js` (línea 717)
- 🔒 `src\security\authLayer.js` (línea 770)
- 🔒 `src\security\inputValidator.js` (línea 438)

### 🔧 function: `middleware`

**Encontrado en:**
- 🔒 `src\security\advancedRateLimiter.js` (línea 722)
- 🔒 `src\security\authLayer.js` (línea 793)
- 🔒 `src\security\inputValidator.js` (línea 443)

### 🔧 function: `validate`

**Encontrado en:**
- 🔒 `src\security\inputValidator.js` (línea 24)
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 1866)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 1483)
- 🔒 `src\utils\responseValidator.js` (línea 24)

### 🔧 function: `searchClientHistory`

**Encontrado en:**
- 🔒 `src\services\clientHistorySearchEngine.js` (línea 64)
- 🔒 `src\services\conversationMemory.js` (línea 983)

### 🔧 function: `searchInClientHistory`

**Encontrado en:**
- 🔒 `src\services\clientHistorySearchEngine.js` (línea 509)
- 🔒 `src\services\conversationMemory.js` (línea 1005)

### 🔧 function: `getCachedResult`

**Encontrado en:**
- 🔒 `src\services\clientHistorySearchEngine.js` (línea 708)
- 🔒 `src\services\deterministicSearchEngine.js` (línea 465)

### 🔧 function: `generateCacheKey`

**Encontrado en:**
- 🔒 `src\services\clientHistorySearchEngine.js` (línea 734)
- 🔒 `src\utils\llmJudge.js` (línea 295)

### 🔧 function: `clearCache`

**Encontrado en:**
- 🔒 `src\services\clientHistorySearchEngine.js` (línea 780)
- 🔒 `src\services\markdownMetadataExtractor.js` (línea 522)
- 🔒 `src\services\tools.js` (línea 391)

### 🔧 function: `resetMetrics`

**Encontrado en:**
- 🔒 `src\services\clientHistorySearchEngine.js` (línea 788)
- 🔒 `src\services\deterministicSearchEngine.js` (línea 707)
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 516)
- 🔒 `src\services\metadataEnhancer.js` (línea 653)
- 🔒 `src\utils\lruCache.js` (línea 146)

### 🔧 function: `generateQuery`

**Encontrado en:**
- 🔒 `src\services\conversationMemory.js` (línea 98)
- 🔒 `src\services\tools.js` (línea 96)

### 🔧 function: `generateDocument`

**Encontrado en:**
- 🔒 `src\services\conversationMemory.js` (línea 111)
- 🔒 `src\services\tools.js` (línea 109)

### 🔧 function: `buildWhereFilter`

**Encontrado en:**
- 🔒 `src\services\conversationMemory.js` (línea 753)
- 🔒 `src\services\deterministicSearchEngine.js` (línea 579)

### 🔧 function: `classifyResponseType`

**Encontrado en:**
- 🔒 `src\services\conversationMemory.js` (línea 782)
- 🔒 `src\services\semanticChunker.js` (línea 573)

### 🔧 function: `getHourCategory`

**Encontrado en:**
- 🔒 `src\services\conversationMemory.js` (línea 798)
- 🔒 `src\services\semanticChunker.js` (línea 582)

### 🔧 function: `calculateSystemHealth`

**Encontrado en:**
- 🔒 `src\services\conversationMemory.js` (línea 899)
- 🔒 `src\services\dynamicLimitOptimizer.js` (línea 538)
- 🔒 `src\services\simpleDeduplicationEngine.js` (línea 563)

### 🔧 function: `getArchitecturalHealth`

**Encontrado en:**
- 🔒 `src\services\conversationMemory.js` (línea 1160)
- 🔒 `src\services\tools.js` (línea 930)

### 🔧 function: `detectQueryContext`

**Encontrado en:**
- 🔒 `src\services\deterministicSearchEngine.js` (línea 398)
- 🔒 `src\services\dynamicLimitOptimizer.js` (línea 252)

### 🔧 function: `cleanupCache`

**Encontrado en:**
- 🔒 `src\services\deterministicSearchEngine.js` (línea 515)
- 🔒 `src\utils\llmJudge.js` (línea 409)

### 🔧 function: `containsAny`

**Encontrado en:**
- 🔒 `src\services\deterministicSearchEngine.js` (línea 575)
- 🔒 `src\services\dynamicLimitOptimizer.js` (línea 447)
- 🔒 `src\services\semanticChunker.js` (línea 568)
- 🔒 `src\services\validatedEmbeddingEngine.js` (línea 515)

### 🔧 function: `recordMetrics`

**Encontrado en:**
- 🔒 `src\services\deterministicSearchEngine.js` (línea 609)
- 🔒 `src\services\simpleDeduplicationEngine.js` (línea 508)

### 🔧 function: `getContextHealth`

**Encontrado en:**
- 🔒 `src\services\deterministicSearchEngine.js` (línea 659)
- 🔒 `src\services\dynamicLimitOptimizer.js` (línea 516)

### 🔧 function: `performMaintenance`

**Encontrado en:**
- 🔒 `src\services\deterministicSearchEngine.js` (línea 690)
- 🔒 `src\services\dynamicLimitOptimizer.js` (línea 561)
- 🔒 `src\services\simpleDeduplicationEngine.js` (línea 588)

### 🔧 function: `executeWithTimeout`

**Encontrado en:**
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 196)
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 323)
- 🔒 `src\utils\circuitBreaker.js` (línea 79)

### 🔧 function: `recordFailure`

**Encontrado en:**
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 261)
- 🔒 `src\utils\failureHandler.js` (línea 34)
- 🔒 `test\integration-test.js` (línea 239)

### 🔧 function: `reset`

**Encontrado en:**
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 592)
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 558)
- 🔒 `src\utils\circuitBreaker.js` (línea 139)
- 🔒 `src\utils\performanceMonitor.js` (línea 474)

### 🔧 function: `initializeCache`

**Encontrado en:**
- 🔒 `src\services\markdownContextEnricher.js` (línea 78)
- 🔒 `src\services\markdownMetadataExtractor.js` (línea 93)
- 🔒 `src\services\semanticCache.js` (línea 37)

### 🔧 function: `extractBrandFromFilename`

**Encontrado en:**
- 🔒 `src\services\markdownContextEnricher.js` (línea 155)
- 🔒 `src\services\markdownMetadataExtractor.js` (línea 258)

### 🔧 function: `getBrandInfo`

**Encontrado en:**
- 🔒 `src\services\markdownContextEnricher.js` (línea 527)
- 🔒 `src\services\markdownMetadataExtractor.js` (línea 354)

### 🔧 function: `getCacheStats`

**Encontrado en:**
- 🔒 `src\services\markdownContextEnricher.js` (línea 539)
- 🔒 `src\services\markdownMetadataExtractor.js` (línea 496)
- 🔒 `src\utils\contextCache.js` (línea 365)

### 🔧 function: `forceRefresh`

**Encontrado en:**
- 🔒 `src\services\markdownContextEnricher.js` (línea 552)
- 🔒 `src\services\markdownMetadataExtractor.js` (línea 513)

### 🔧 function: `healthCheck`

**Encontrado en:**
- 🔒 `src\services\markdownMetadataExtractor.js` (línea 538)
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 2050)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 1812)
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 603)

### 🔧 function: `normalizeQuery`

**Encontrado en:**
- 🔒 `src\services\priceExtractionSystem.js` (línea 244)
- 🔒 `src\utils\contextCache.js` (línea 352)
- 🔒 `src\utils\fuzzyMatcher.js` (línea 247)

### 🔧 function: `classifyIntent`

**Encontrado en:**
- 🔒 `src\services\semanticRouter.js` (línea 44)
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 1486)

### 🔧 function: `getValidationStats`

**Encontrado en:**
- 🔒 `src\services\tools.js` (línea 399)
- 🔒 `src\services\validatedEmbeddingEngine.js` (línea 631)

### 🔧 function: `updateCoherenceHistory`

**Encontrado en:**
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 742)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 498)

### 🔧 function: `getEnhancedMetrics`

**Encontrado en:**
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 1139)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 648)

### 🔧 function: `analyzeCoherenceTrend`

**Encontrado en:**
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 1158)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 526)

### 🔧 function: `calculateCoherenceScore`

**Encontrado en:**
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 1585)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 1272)

### 🔧 function: `analyzeContext`

**Encontrado en:**
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 1593)
- 🔒 `src\utils\intelligentRouter.js` (línea 311)

### 🔧 function: `get`

**Encontrado en:**
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 1845)
- 🔒 `src\utils\lruCache.js` (línea 25)

### 🔧 function: `set`

**Encontrado en:**
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 1857)
- 🔒 `src\utils\lruCache.js` (línea 44)

### 🔧 function: `levenshteinDistance`

**Encontrado en:**
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 2022)
- 🔒 `src\utils\fuzzyMatcher.js` (línea 13)

### 🔧 function: `resolve`

**Encontrado en:**
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 2187)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 1867)

### 🔧 function: `stop`

**Encontrado en:**
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 1988)
- 🔒 `src\utils\proactiveMonitor.js` (línea 76)

### 🔧 function: `updateConfig`

**Encontrado en:**
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 595)
- 🔒 `src\utils\failureHandler.js` (línea 261)

### 🔧 function: `getStats`

**Encontrado en:**
- 🔒 `src\utils\conversationContext.js` (línea 383)
- 🔒 `src\utils\llmJudge.js` (línea 373)
- 🔒 `src\utils\rateLimiter.js` (línea 120)

### 🏗️ class: `LangChainEmbeddingAdapter`

**Encontrado en:**
- 🔒 `src\scripts\index_intentions.js` (línea 16)
- 🔒 `src\scripts\index_knowledge.js` (línea 19)
- 🔒 `src\services\semanticCache.js` (línea 16)
- 🔒 `src\services\semanticRouter.js` (línea 17)

### 🏗️ class: `OllamaError`

**Encontrado en:**
- 🔒 `src\services\agentExecutor.js` (línea 14)
- 🔒 `src\services\simpleAgentExecutor.js` (línea 13)

### 🏗️ class: `EnhancedLangChainEmbeddingAdapter`

**Encontrado en:**
- 🔒 `src\services\conversationMemory.js` (línea 54)
- 🔒 `src\services\tools.js` (línea 57)

### 🏗️ class: `CrossSourceValidator`

**Encontrado en:**
- 🔒 `src\services\tools.js` (línea 132)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 1611)

### 🏗️ class: `ConsistencyValidator`

**Encontrado en:**
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 1865)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 1482)

---

## 🔗 Relaciones entre Archivos

**Mapa de dependencias locales:**

### 📄 test-basic.js

**Importa de:**
- 📁 `./src/utils/logger` → `logger`
- 📁 `./src/utils/config` → `config`
- 📁 `./src/database/pg` → `initializeDatabase`
- 📁 `./src/services/agentExecutor` → `SalvaCellAgentExecutor`

### 📄 src\bot.js

**Importa de:**
- 📁 `./utils/config` → `config`
- 📁 `./database/pg` → `initializeDatabase`
- 📁 `./utils/chatState` → `isChatPaused`
- 📁 `./utils/logger` → `logger`
- 📁 `./services/agentExecutor` → `SalvaCellAgentExecutor, OllamaError`
- 📁 `./core/OrchestrationController` → `orchestrationController`
- 📁 `./services/serviceRegistry` → `registerService`

### 📄 src\auth\admin.js

**Importa de:**
- 📁 `../database/pg` → `pool`

### 📄 src\core\OrchestrationController.js

**Importa de:**
- 📁 `../utils/logger` → `logger`
- 📁 `../utils/config` → `config`
- 📁 `./performance/PerformanceController` → `PerformanceController`
- 📁 `./resilience/ResilienceController` → `ResilienceController`
- 📁 `./intelligence/AdminEscalationSystem` → `AdminEscalationSystem`
- 📁 `./intelligence/AdaptiveLearningEngine` → `AdaptiveLearningEngine`
- 📁 `./intelligence/UncertaintyDetector` → `UncertaintyDetector`

### 📄 src\core\intelligence\AdaptiveLearningEngine.js

**Importa de:**
- 📁 `../../utils/logger` → `logger`
- 📁 `../../database/pg` → `initializeDatabase`

### 📄 src\core\intelligence\AdminEscalationSystem.js

**Importa de:**
- 📁 `../../utils/logger` → `logger`
- 📁 `../../utils/config` → `config`

### 📄 src\core\intelligence\ContextAwareResponseGenerator.js

**Importa de:**
- 📁 `../../utils/logger` → `logger`
- 📁 `../../utils/config` → `config`

### 📄 src\core\intelligence\MultiModalReasoningEngine.js

**Importa de:**
- 📁 `../../utils/logger` → `logger`
- 📁 `../../utils/config` → `config`

### 📄 src\core\intelligence\PredictiveAnalyticsEngine.js

**Importa de:**
- 📁 `../../utils/logger` → `logger`
- 📁 `../../utils/config` → `config`

### 📄 src\core\intelligence\UncertaintyDetector.js

**Importa de:**
- 📁 `../../utils/logger` → `logger`

### 📄 src\core\performance\ConcurrentProcessor.js

**Importa de:**
- 📁 `../../utils/logger` → `logger`

### 📄 src\core\performance\MemoryManager.js

**Importa de:**
- 📁 `../../utils/logger` → `logger`

### 📄 src\core\performance\PerformanceController.js

**Importa de:**
- 📁 `./QueryOptimizer` → `QueryOptimizer`
- 📁 `./MemoryManager` → `MemoryManager`
- 📁 `./ConcurrentProcessor` → `ConcurrentProcessor`
- 📁 `../../utils/logger` → `logger`

### 📄 src\core\performance\QueryOptimizer.js

**Importa de:**
- 📁 `../../utils/logger` → `logger`

### 📄 src\core\resilience\AdvancedCircuitBreaker.js

**Importa de:**
- 📁 `../../utils/logger` → `logger`

### 📄 src\core\resilience\GracefulDegradationManager.js

**Importa de:**
- 📁 `../../utils/logger` → `logger`

### 📄 src\core\resilience\HealthMonitoringSystem.js

**Importa de:**
- 📁 `../../utils/logger` → `logger`
- 📁 `../../services/serviceRegistry` → `services`
- 📁 `./SelfHealingManager` → `selfHealingManager`

### 📄 src\core\resilience\ResilienceController.js

**Importa de:**
- 📁 `../../utils/logger` → `logger`
- 📁 `./HealthMonitoringSystem` → `healthMonitoringSystem`
- 📁 `./SelfHealingManager` → `selfHealingManager`
- 📁 `./AdvancedCircuitBreaker` → `AdvancedCircuitBreaker`
- 📁 `./GracefulDegradationManager` → `GracefulDegradationManager`
- 📁 `../../utils/config` → `config`

### 📄 src\core\resilience\SelfHealingManager.js

**Importa de:**
- 📁 `../../utils/logger` → `logger`
- 📁 `../../services/serviceRegistry` → `services, restartService`

### 📄 src\database\pg.js

**Importa de:**
- 📁 `../utils/logger` → `logger`

### 📄 src\excel\processor.js

**Importa de:**
- 📁 `../database/pg` → `pool`

### 📄 src\monitoring\intelligentMonitor.js

**Importa de:**
- 📁 `../utils/logger` → `logger`

### 📄 src\scripts\architectural_health_check.js

**Importa de:**
- 📁 `../utils/logger` → `logger`

### 📄 src\scripts\clear_cache_collection.js

**Importa de:**
- 📁 `../utils/logger` → `logger`

### 📄 src\scripts\convertMarkdownToPostgreSQL.js

**Importa de:**
- 📁 `../database/pg` → `pool`
- 📁 `../utils/logger` → `logger`

### 📄 src\scripts\importExcelData.js

**Importa de:**
- 📁 `../database/pg` → `pool`
- 📁 `../utils/logger` → `logger`

### 📄 src\scripts\index_intentions.js

**Importa de:**
- 📁 `../services/embeddingEngine` → `embeddingEngine`
- 📁 `../../intentions_dataset.json` → `intentionsData`
- 📁 `../utils/logger` → `logger`

### 📄 src\scripts\index_knowledge.js

**Importa de:**
- 📁 `../services/embeddingEngine` → `embeddingEngine`
- 📁 `../database/pg` → `pool`
- 📁 `../utils/logger` → `logger`

### 📄 src\scripts\index_markdown_prices.js

**Importa de:**
- 📁 `../services/embeddingEngine` → `embeddingEngine`
- 📁 `../utils/logger` → `logger`

### 📄 src\scripts\migrate_to_task_prefixes.js

**Importa de:**
- 📁 `../utils/logger` → `logger`

### 📄 src\scripts\migrateConversations.js

**Importa de:**
- 📁 `../database/pg` → `pool`
- 📁 `../services/conversationMemory` → `conversationMemory`
- 📁 `../utils/logger` → `logger`

### 📄 src\scripts\run_evals.js

**Importa de:**
- 📁 `../services/simpleAgentExecutor` → `SimpleAgentExecutor`
- 📁 `../database/pg` → `initializeDatabase`
- 📁 `../utils/logger` → `logger`

### 📄 src\scripts\seed_proactive_knowledge.js

**Importa de:**
- 📁 `../database/pg` → `pool`
- 📁 `../utils/logger` → `logger`

### 📄 src\scripts\verifyMigration.js

**Importa de:**
- 📁 `../database/pg` → `pool`
- 📁 `../services/conversationMemory` → `conversationMemory`
- 📁 `../utils/logger` → `logger`
- 📁 `../services/tools` → `tools`

### 📄 src\security\advancedRateLimiter.js

**Importa de:**
- 📁 `../utils/logger` → `logger`

### 📄 src\security\authLayer.js

**Importa de:**
- 📁 `../utils/logger` → `logger`
- 📁 `../utils/config` → `config`

### 📄 src\security\inputValidator.js

**Importa de:**
- 📁 `../utils/logger` → `logger`

### 📄 src\services\agentExecutor.js

**Importa de:**
- 📁 `./tools` → `tools`
- 📁 `../utils/logger` → `logger`
- 📁 `../utils/config` → `config`
- 📁 `./semanticCache` → `findInCache, addToCache`
- 📁 `./guardrails` → `Guardrails`

### 📄 src\services\clientHistorySearchEngine.js

**Importa de:**
- 📁 `../utils/logger` → `logger`

### 📄 src\services\conversationMemory.js

**Importa de:**
- 📁 `../database/pg` → `pool`
- 📁 `./embeddingEngine` → `embeddingEngine, getEmbedding`
- 📁 `./semanticChunker` → `SemanticChunker`
- 📁 `./deterministicSearchEngine` → `DeterministicSearchEngine`
- 📁 `./dynamicLimitOptimizer` → `DynamicLimitOptimizer`
- 📁 `./markdownContextEnricher` → `MarkdownContextEnricher`
- 📁 `./simpleDeduplicationEngine` → `SimpleDeduplicationEngine`
- 📁 `./metadataEnhancer` → `MetadataEnhancer`
- 📁 `./clientHistorySearchEngine` → `ClientHistorySearchEngine`
- 📁 `../utils/logger` → `logger`

### 📄 src\services\deterministicSearchEngine.js

**Importa de:**
- 📁 `../utils/logger` → `logger`

### 📄 src\services\dynamicLimitOptimizer.js

**Importa de:**
- 📁 `../utils/logger` → `logger`

### 📄 src\services\embeddingCircuitBreaker.js

**Importa de:**
- 📁 `../utils/logger` → `logger`

### 📄 src\services\embeddingEngine.js

**Importa de:**
- 📁 `../utils/logger` → `logger`
- 📁 `../utils/retryHandler` → `retryHandler`

### 📄 src\services\guardrails.js

**Importa de:**
- 📁 `../utils/logger` → `logger`
- 📁 `../utils/config` → `config`

### 📄 src\services\hallucinationDetector.js

**Importa de:**
- 📁 `../utils/responseValidator` → `responseValidatorPipeline`

### 📄 src\services\markdownContextEnricher.js

**Importa de:**
- 📁 `../utils/logger` → `logger`

### 📄 src\services\markdownMetadataExtractor.js

**Importa de:**
- 📁 `../utils/logger` → `logger`

### 📄 src\services\metadataEnhancer.js

**Importa de:**
- 📁 `./markdownMetadataExtractor` → `MarkdownMetadataExtractor`
- 📁 `../utils/logger` → `logger`

### 📄 src\services\priceExtractionSystem.js

**Importa de:**
- 📁 `../database/pg` → `pool`
- 📁 `./embeddingEngine` → `getEmbeddingEngine`
- 📁 `./knowledge/KnowledgeCoherenceLayer` → `KnowledgeCoherenceLayer`
- 📁 `../utils/logger` → `logger`
- 📁 `../utils/config` → `config`

### 📄 src\services\semanticCache.js

**Importa de:**
- 📁 `./embeddingEngine` → `getEmbeddingEngine`
- 📁 `../utils/logger` → `logger`
- 📁 `../utils/retryHandler` → `retryHandler`

### 📄 src\services\semanticChunker.js

**Importa de:**
- 📁 `../utils/logger` → `logger`
- 📁 `./embeddingEngine` → `embeddingEngine`

### 📄 src\services\semanticRouter.js

**Importa de:**
- 📁 `./embeddingEngine` → `embeddingEngine`
- 📁 `../utils/logger` → `logger`

### 📄 src\services\serviceRegistry.js

**Importa de:**
- 📁 `../utils/logger` → `logger`

### 📄 src\services\simpleAgentExecutor.js

**Importa de:**
- 📁 `./tools` → `tools`
- 📁 `../utils/logger` → `logger`
- 📁 `../utils/config` → `config`
- 📁 `./semanticCache` → `findInCache, addToCache`
- 📁 `./guardrails` → `Guardrails`

### 📄 src\services\simpleDeduplicationEngine.js

**Importa de:**
- 📁 `./markdownContextEnricher` → `MarkdownContextEnricher`
- 📁 `../utils/logger` → `logger`

### 📄 src\services\tools.js

**Importa de:**
- 📁 `./embeddingEngine` → `embeddingEngine, getEmbedding`
- 📁 `../database/pg` → `pool`
- 📁 `./priceExtractionSystem` → `priceExtractionSystem`
- 📁 `./conversationMemory` → `conversationMemory`
- 📁 `./deterministicSearchEngine` → `DeterministicSearchEngine`
- 📁 `./dynamicLimitOptimizer` → `DynamicLimitOptimizer`
- 📁 `./markdownContextEnricher` → `MarkdownContextEnricher`
- 📁 `../utils/logger` → `logger`

### 📄 src\services\validatedEmbeddingEngine.js

**Importa de:**
- 📁 `../utils/logger` → `logger`
- 📁 `./embeddingEngine` → `EnhancedEmbeddingEngine`

### 📄 src\services\classifiers\qwenClassifier.js

**Importa de:**
- 📁 `../../utils/qwenLocal` → `QwenLocalClient`
- 📁 `../../utils/logger` → `logger`
- 📁 `../../../intentions_dataset.json` → `intentions`

### 📄 src\services\knowledge\KnowledgeCoherenceLayer.js

**Importa de:**
- 📁 `../../utils/logger` → `logger`
- 📁 `../../database/pg` → `pool`
- 📁 `../embeddingEngine` → `embeddingEngine`

### 📄 src\services\knowledge\TemporalConsistencyEngine.js

**Importa de:**
- 📁 `../../utils/logger` → `logger`
- 📁 `../embeddingEngine` → `embeddingEngine`
- 📁 `../../database/pg` → `pool`

### 📄 src\services\resilience\ResilienceManager.js

**Importa de:**
- 📁 `../../utils/logger` → `logger`
- 📁 `../../utils/circuitBreaker` → `CircuitBreaker`
- 📁 `../../utils/rateLimiter` → `apiRateLimiter`

### 📄 src\utils\chatState.js

**Importa de:**
- 📁 `./logger` → `logger`

### 📄 src\utils\circuitBreaker.js

**Importa de:**
- 📁 `./logger` → `logger`

### 📄 src\utils\claude.js

**Importa de:**
- 📁 `./config` → `config`
- 📁 `./logger` → `logger`
- 📁 `../database/pg` → `getConocimientos`

### 📄 src\utils\config.js

**Importa de:**
- 📁 `./logger` → `logger`

### 📄 src\utils\contextCache.js

**Importa de:**
- 📁 `./logger` → `logger`
- 📁 `./lruCache` → `LRUCache`

### 📄 src\utils\conversationContext.js

**Importa de:**
- 📁 `./lruCache` → `LRUCache`
- 📁 `./logger` → `logger`
- 📁 `./fuzzyMatcher` → `normalizeQuery, normalizeDeviceName, normalizeRepairType, normalizeQualityType`

### 📄 src\utils\failureHandler.js

**Importa de:**
- 📁 `../database/pg` → `pool`
- 📁 `./logger` → `logger`

### 📄 src\utils\intelligentRouter.js

**Importa de:**
- 📁 `./qwenLocal` → `QwenLocalClient`
- 📁 `./claude` → `interpretQuery: claudeInterpretQuery`
- 📁 `./contextCache` → `contextCache`
- 📁 `./logger` → `logger`

### 📄 src\utils\llmJudge.js

**Importa de:**
- 📁 `./logger` → `logger`
- 📁 `./lruCache` → `LRUCache`
- 📁 `./rateLimiter` → `apiRateLimiter`

### 📄 src\utils\performanceMonitor.js

**Importa de:**
- 📁 `./logger` → `logger`
- 📁 `./lruCache` → `MetricsLRUCache`

### 📄 src\utils\proactiveMonitor.js

**Importa de:**
- 📁 `./logger` → `logger`
- 📁 `../database/pg` → `pool`
- 📁 `./circuitBreaker` → `circuitBreaker`
- 📁 `./rateLimiter` → `apiRateLimiter`
- 📁 `./failureHandler` → `failureHandler`
- 📁 `./conversationContext` → `conversationContext`
- 📁 `./conversationFSM` → `conversationFSM`

### 📄 src\utils\qwenLocal.js

**Importa de:**
- 📁 `./logger` → `logger`

### 📄 src\utils\rateLimiter.js

**Importa de:**
- 📁 `./lruCache` → `LRUCache`
- 📁 `./logger` → `logger`

### 📄 src\utils\retryHandler.js

**Importa de:**
- 📁 `./logger` → `logger`

### 📄 src\utils\robustSofiaParser.js

**Importa de:**
- 📁 `./logger` → `logger`

### 📄 test\integration-test.js

**Importa de:**
- 📁 `../src/utils/logger` → `logger`
- 📁 `../src/core/OrchestrationController` → `orchestrationController`

---

## 📋 Notas y Recomendaciones

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

*Análisis generado automáticamente el 17/7/2025, 6:19:20 p.m.*
