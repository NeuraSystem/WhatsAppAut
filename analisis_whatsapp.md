# 📱 Análisis de Proyecto WhatsAppAut

**Proyecto:** WhatsAppAut  
**Ruta:** C:\Users\neura\OneDrive\Desktop\WhatsAppAut  
**Fecha de análisis:** 18/7/2025, 12:08:09 a.m.  
**Generado por:** Analizador WhatsAppAut

---

## 📈 Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| **Directorios analizados** | 31 |
| **Archivos totales** | 91 |
| **Archivos JavaScript/TypeScript** | 81 |
| **Archivos Python** | 1 |
| **Archivos de configuración** | 9 |
| **Funciones totales** | 1438 |
| **Clases totales** | 118 |
| **Imports totales** | 246 |
| **Duplicados detectados** | 101 |
| **Relaciones entre archivos** | 246 |

### 📊 Distribución por Extensión

- **.js**: 81 archivos
- **.json**: 9 archivos
- **.py**: 1 archivos

### 🛠️ Tecnologías Detectadas

- ✅ Node.js Package
- ✅ WhatsApp Integration
- ✅ WhatsApp Web API
- ✅ Puppeteer
- ✅ QR Code
- ✅ Express.js
- ✅ Socket.IO
- ✅ HTTP Client
- ✅ MongoDB/Mongoose
- ✅ Pandas

---

## 📂 Análisis por Directorio

### 📁 raíz

**Archivos:** 6  
**Tecnologías:** Node.js Package, WhatsApp Integration, WhatsApp Web API, Puppeteer, QR Code, Express.js, Socket.IO, HTTP Client, MongoDB/Mongoose

#### 📄 eslint.config.js

**Ruta:** `eslint.config.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 1469 caracteres, 54 líneas  
**Módulo:** Sí  

**Imports (1):**
- 📦 `js` desde `@eslint/js`

#### 📄 eval_dataset.json

**Ruta:** `eval_dataset.json`  
**Tipo:** JSON  
**Tamaño:** 1223 caracteres, 39 líneas  

**Estructura JSON:**
- Claves principales: evaluaciones

#### 📄 package-lock.json

**Ruta:** `package-lock.json`  
**Tipo:** JSON  
**Tamaño:** 429096 caracteres, 11912 líneas  

**Estructura JSON:**
- Claves principales: name, version, lockfileVersion, requires, packages

#### 📄 package.json

**Ruta:** `package.json`  
**Tipo:** JSON  
**Tamaño:** 3842 caracteres, 117 líneas  
**Tecnologías:** Node.js Package, WhatsApp Integration  

**Estructura JSON:**
- Claves principales: name, version, description, main, scripts, keywords, author, dependencies, devDependencies, engines, repository, bugs, homepage, config
- ✅ Contiene scripts
- 📦 Contiene dependencias
- 🛠️ Contiene dependencias de desarrollo

#### 📄 pg-migrate-config.js

**Ruta:** `pg-migrate-config.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 204 caracteres, 10 líneas  
**Módulo:** Sí  

#### 📄 whatsapp_analyzer.js

**Ruta:** `whatsapp_analyzer.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 40458 caracteres, 1394 líneas  
**Tecnologías:** WhatsApp Web API, Puppeteer, QR Code, Express.js, Socket.IO, HTTP Client, MongoDB/Mongoose  
**Módulo:** Sí  

**Funciones (54):**
- 🔒 `main` (function, línea 1306)
- 🔒 `constructor` (unknown, línea 60)
- 🔒 `analyze` (unknown, línea 91)
- 🔒 `catch` (unknown, línea 108)
- 🔒 `validateProjectPath` (unknown, línea 117)
- 🔒 `analyzeDirectory` (unknown, línea 131)
- 🔒 `if` (unknown, línea 135)
- 🔒 `for` (unknown, línea 143)
- 🔒 `shouldExcludeDirectory` (unknown, línea 181)
- 🔒 `shouldExcludeFile` (unknown, línea 193)
- 🔒 `isTargetFile` (unknown, línea 208)
- 🔒 `analyzeFiles` (unknown, línea 215)
- 🔒 `createFileGroups` (unknown, línea 264)
- 🔒 `analyzeFile` (unknown, línea 278)
- 🔒 `switch` (unknown, línea 290)
- 🔒 `updateFileStats` (unknown, línea 338)
- 🔒 `parseJavaScriptFile` (unknown, línea 348)
- 🔒 `parsePythonFile` (unknown, línea 387)
- 🔒 `parseJsonFile` (unknown, línea 415)
- 🔒 `parseGenericFile` (unknown, línea 440)
- 🔒 `extractJavaScriptFunctions` (unknown, línea 454)
- 🔒 `extractPythonFunctions` (unknown, línea 485)
- 🔒 `extractJavaScriptClasses` (unknown, línea 505)
- 🔒 `extractPythonClasses` (unknown, línea 525)
- 🔒 `extractJavaScriptImports` (unknown, línea 544)
- 🔒 `extractPythonImports` (unknown, línea 570)
- 🔒 `extractJavaScriptExports` (unknown, línea 605)
- 🔒 `detectJavaScriptTechnologies` (unknown, línea 630)
- 🔒 `detectPythonTechnologies` (unknown, línea 664)
- 🔒 `detectJsonTechnologies` (unknown, línea 703)
- 🔒 `analyzeJsonStructure` (unknown, línea 728)
- 🔒 `updateTechnologies` (unknown, línea 740)
- 🔒 `detectTechnologies` (unknown, línea 752)
- 🔒 `isJavaScriptExported` (unknown, línea 759)
- 🔒 `getFunctionType` (unknown, línea 771)
- 🔒 `registerFunctions` (function, línea 781)
- 🔒 `registerClasses` (unknown, línea 796)
- 🔒 `registerImports` (unknown, línea 811)
- 🔒 `detectDuplicates` (unknown, línea 821)
- 🔒 `buildRelationships` (unknown, línea 856)
- 🔒 `printSummary` (unknown, línea 876)
- 🔒 `generateMarkdownReport` (unknown, línea 893)
- 🔒 `generateMarkdownContent` (unknown, línea 906)
- 🔒 `generateDirectoriesSection` (unknown, línea 996)
- 🔒 `map` (arrow, línea 997)
- 🔒 `generateFileSection` (unknown, línea 1026)
- 🔒 `forEach` (arrow, línea 1068)
- 🔒 `generateDuplicatesSection` (unknown, línea 1101)
- 🔒 `generateRelationshipsSection` (unknown, línea 1126)
- 🔒 `generateJsonReport` (unknown, línea 1157)
- 🔒 `validateWhatsAppProject` (unknown, línea 1183)
- 🔒 `detectWhatsAppPatterns` (unknown, línea 1213)
- 🔒 `analyzeWhatsAppConfig` (unknown, línea 1234)
- 🔒 `generateWhatsAppRecommendations` (unknown, línea 1269)

**Clases (2):**
- 🔒 `WhatsAppAnalyzer` (línea 59)
- 🔒 `WhatsAppAnalyzerUtils` (línea 1179)

**Imports (2):**
- 📦 `fs` desde `fs`
- 📦 `path` desde `path`


---

### 📁 agent-service

**Archivos:** 1  
**Tecnologías:** Node.js Package

#### 📄 package.json

**Ruta:** `agent-service\package.json`  
**Tipo:** JSON  
**Tamaño:** 187 caracteres, 11 líneas  
**Tecnologías:** Node.js Package  

**Estructura JSON:**
- Claves principales: name, version, description, main, scripts, dependencies
- ✅ Contiene scripts
- 📦 Contiene dependencias


---

### 📁 config

**Archivos:** 1  
**Tecnologías:** WhatsApp Web API

#### 📄 config.js

**Ruta:** `config\config.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 8115 caracteres, 223 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (2):**
- 🔒 `validateConfig` (arrow, línea 196)
- 🔒 `if` (unknown, línea 206)

**Imports (1):**
- 📁 `logger` desde `../src/utils/logger`


---

### 📁 config-service

**Archivos:** 2  
**Tecnologías:** Node.js Package

#### 📄 index.js

**Ruta:** `config-service\index.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 119 caracteres, 3 líneas  
**Módulo:** No  

#### 📄 package.json

**Ruta:** `config-service\package.json`  
**Tipo:** JSON  
**Tamaño:** 205 caracteres, 11 líneas  
**Tecnologías:** Node.js Package  

**Estructura JSON:**
- Claves principales: name, version, description, main, scripts, dependencies
- ✅ Contiene scripts
- 📦 Contiene dependencias


---

### 📁 data\processed_for_ai

**Archivos:** 1

#### 📄 PERFIL_EMPRESARIAL_SALVACELL_CHUNKS.json

**Ruta:** `data\processed_for_ai\PERFIL_EMPRESARIAL_SALVACELL_CHUNKS.json`  
**Tipo:** JSON  
**Tamaño:** 36723 caracteres, 603 líneas  

**Estructura JSON:**
- Claves principales: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52


---

### 📁 database\migrations

**Archivos:** 1

#### 📄 1709212800000_initial_schema.js

**Ruta:** `database\migrations\1709212800000_initial_schema.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 691 caracteres, 25 líneas  
**Módulo:** No  


---

### 📁 knowledge-service

**Archivos:** 2  
**Tecnologías:** Node.js Package

#### 📄 index.js

**Ruta:** `knowledge-service\index.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 130 caracteres, 3 líneas  
**Módulo:** No  

#### 📄 package.json

**Ruta:** `knowledge-service\package.json`  
**Tipo:** JSON  
**Tamaño:** 194 caracteres, 11 líneas  
**Tecnologías:** Node.js Package  

**Estructura JSON:**
- Claves principales: name, version, description, main, scripts, dependencies
- ✅ Contiene scripts
- 📦 Contiene dependencias


---

### 📁 src

**Archivos:** 1  
**Tecnologías:** WhatsApp Web API, Puppeteer, QR Code

#### 📄 bot.js

**Ruta:** `src\bot.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 10082 caracteres, 283 líneas  
**Tecnologías:** WhatsApp Web API, Puppeteer, QR Code  
**Módulo:** Sí  

**Funciones (13):**
- 🔒 `constructor` (unknown, línea 18)
- 🔒 `initialize` (unknown, línea 38)
- 🔒 `if` (unknown, línea 47)
- 🔒 `catch` (unknown, línea 59)
- 🔒 `initializePureOrchestrator` (unknown, línea 67)
- 🔒 `initializeWhatsAppClient` (unknown, línea 90)
- 🔒 `setupEventHandlers` (unknown, línea 101)
- 🔒 `handleIncomingMessage` (unknown, línea 129)
- 🔒 `handleMessageError` (unknown, línea 187)
- 🔒 `recordSuccess` (unknown, línea 222)
- 🔒 `getMetrics` (unknown, línea 231)
- 🔒 `start` (unknown, línea 246)
- 🔒 `shutdown` (unknown, línea 256)

**Clases (1):**
- 🔒 `SalvaCellPureOrchestrator` (línea 17)

**Imports (9):**
- 📦 `Client, LocalAuth` desde `whatsapp-web.js`
- 📦 `qrcode` desde `qrcode-terminal`
- 📁 `config` desde `../config/config`
- 📁 `initializeDatabase` desde `./database/pg`
- 📁 `isChatPaused` desde `./utils/chatState`
- 📁 `logger` desde `./utils/logger`
- 📁 `SalvaCellAgentExecutor, OllamaError` desde `./services/agentExecutor`
- 📁 `orchestrationController` desde `./core/OrchestrationController`
- 📁 `registerService` desde `./services/serviceRegistry`


---

### 📁 src\auth

**Archivos:** 1

#### 📄 admin.js

**Ruta:** `src\auth\admin.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 2635 caracteres, 88 líneas  
**Módulo:** Sí  

**Funciones (5):**
- 🔒 `isAdmin` (function, línea 11)
- 🔒 `addAdmin` (function, línea 38)
- 🔒 `removeAdmin` (function, línea 61)
- 🔒 `if` (unknown, línea 13)
- 🔒 `catch` (unknown, línea 26)

**Imports (1):**
- 📁 `pool` desde `../database/pg`


---

### 📁 src\core

**Archivos:** 1  
**Tecnologías:** WhatsApp Web API

#### 📄 OrchestrationController.js

**Ruta:** `src\core\OrchestrationController.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 27569 caracteres, 789 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (29):**
- 🔒 `constructor` (unknown, línea 38)
- 🔒 `initialize` (unknown, línea 71)
- 🔒 `if` (unknown, línea 78)
- 🔒 `catch` (unknown, línea 129)
- 🔒 `establishCrossLayerCoordination` (unknown, línea 143)
- 🔒 `executeOperation` (unknown, línea 175)
- 🔒 `handlePerformanceDegradation` (unknown, línea 260)
- 🔒 `handleSystemHealthChange` (unknown, línea 285)
- 🔒 `updateSuccessMetrics` (unknown, línea 309)
- 🔒 `updateFailureMetrics` (unknown, línea 333)
- 🔒 `getSystemStatus` (unknown, línea 353)
- 🔒 `optimizeSystem` (unknown, línea 411)
- 🔒 `shutdown` (unknown, línea 465)
- 🔒 `getCircuitBreaker` (unknown, línea 507)
- 🔒 `getGracefulDegradationManager` (unknown, línea 517)
- 🔒 `getPerformanceController` (unknown, línea 527)
- 🔒 `getResilienceController` (unknown, línea 535)
- 🔒 `getAdminEscalationSystem` (unknown, línea 543)
- 🔒 `getAdaptiveLearningEngine` (unknown, línea 553)
- 🔒 `getUncertaintyDetector` (unknown, línea 563)
- 🔒 `processIntelligentQuery` (unknown, línea 575)
- 🔒 `extractSituationFromQuery` (unknown, línea 672)
- 🔒 `detectQueryType` (unknown, línea 688)
- 🔒 `extractDeviceModel` (unknown, línea 696)
- 🔒 `for` (unknown, línea 703)
- 🔒 `detectServiceType` (unknown, línea 711)
- 🔒 `setupIntelligenceCoordination` (unknown, línea 722)
- 🔒 `recordAdminDecisionForLearning` (unknown, línea 747)
- 🔒 `extractSituationFromEscalation` (unknown, línea 774)

**Clases (1):**
- 🔒 `OrchestrationController` (línea 37)

**Imports (6):**
- 📁 `logger` desde `../utils/logger`
- 📁 `config` desde `../../config/config`
- 📁 `PerformanceController` desde `./performance/PerformanceController`
- 📁 `resilienceController` desde `./resilience/ResilienceController`
- 📁 `adaptiveLearningEngine, predictiveAnalyticsEngine, multiModalReasoningEngine` desde `./intelligence/IntelligenceService`
- 📁 `adminEscalationSystem, uncertaintyDetector` desde `./intelligence/EscalationService`


---

### 📁 src\core\intelligence

**Archivos:** 3  
**Tecnologías:** WhatsApp Web API, Express.js

#### 📄 EscalationService.js

**Ruta:** `src\core\intelligence\EscalationService.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 26653 caracteres, 570 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (46):**
- 🔒 `constructor` (unknown, línea 9)
- 🔒 `needsEscalation` (unknown, línea 24)
- 🔒 `if` (unknown, línea 33)
- 🔒 `escalateToAdmin` (unknown, línea 42)
- 🔒 `catch` (unknown, línea 49)
- 🔒 `processEscalation` (unknown, línea 55)
- 🔒 `handleAdminResponse` (unknown, línea 79)
- 🔒 `formulateNaturalResponse` (unknown, línea 98)
- 🔒 `cleanAdminResponse` (unknown, línea 107)
- 🔒 `setupAdminTimeout` (unknown, línea 113)
- 🔒 `handleAdminTimeout` (unknown, línea 120)
- 🔒 `clearAdminTimeout` (unknown, línea 139)
- 🔒 `enqueueEscalation` (unknown, línea 147)
- 🔒 `processNextInQueue` (unknown, línea 153)
- 🔒 `generateConsultaId` (unknown, línea 161)
- 🔒 `getCurrentEscalation` (unknown, línea 165)
- 🔒 `releaseAdmin` (unknown, línea 169)
- 🔒 `recordSuccessfulEscalation` (unknown, línea 173)
- 🔒 `formatAdminMessage` (unknown, línea 185)
- 🔒 `sendToAdmin` (unknown, línea 200)
- 🔒 `getCustomerWaitMessage` (unknown, línea 211)
- 🔒 `getEscalationReason` (unknown, línea 217)
- 🔒 `getMetrics` (unknown, línea 226)
- 🔒 `shutdown` (unknown, línea 236)
- 🔒 `analyzeQuery` (unknown, línea 270)
- 🔒 `detectUncertaintyIndicators` (unknown, línea 311)
- 🔒 `analyzeDeviceModel` (unknown, línea 341)
- 🔒 `for` (unknown, línea 346)
- 🔒 `analyzeQueryComplexity` (unknown, línea 361)
- 🔒 `analyzePriceAvailability` (unknown, línea 374)
- 🔒 `detectCustomRequests` (unknown, línea 380)
- 🔒 `analyzeTechnicalComplexity` (unknown, línea 394)
- 🔒 `calculateConfidence` (unknown, línea 403)
- 🔒 `prepareEscalationData` (unknown, línea 415)
- 🔒 `assessAgentCapabilities` (unknown, línea 428)
- 🔒 `loadPriceDatabase` (unknown, línea 443)
- 🔒 `parseMarkdownPrices` (unknown, línea 460)
- 🔒 `extractBrand` (unknown, línea 479)
- 🔒 `checkModelInDatabase` (unknown, línea 488)
- 🔒 `findPriceInDatabase` (unknown, línea 500)
- 🔒 `normalizeModel` (unknown, línea 512)
- 🔒 `detectServiceType` (unknown, línea 516)
- 🔒 `containsTechnicalTerms` (unknown, línea 524)
- 🔒 `isComplexProblem` (unknown, línea 529)
- 🔒 `canProvideServiceInfo` (unknown, línea 534)
- 🔒 `setUncertaintyThreshold` (unknown, línea 548)

**Clases (2):**
- 🔒 `AdminEscalationSystem` (línea 8)
- 🔒 `UncertaintyDetector` (línea 249)

**Imports (4):**
- 📁 `logger` desde `../../utils/logger`
- 📁 `config` desde `../../../config/config`
- 📦 `path` desde `path`
- 📦 `fs` desde `fs`

#### 📄 IntelligenceService.js

**Ruta:** `src\core\intelligence\IntelligenceService.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 39134 caracteres, 869 líneas  
**Tecnologías:** WhatsApp Web API, Express.js  
**Módulo:** Sí  

**Funciones (77):**
- 🔒 `constructor` (unknown, línea 8)
- 🔒 `recordAdminDecision` (unknown, línea 26)
- 🔒 `catch` (unknown, línea 53)
- 🔒 `checkForAutoDecision` (unknown, línea 58)
- 🔒 `checkForNewAutoDecision` (unknown, línea 74)
- 🔒 `if` (unknown, línea 77)
- 🔒 `analyzeDecisionConsistency` (unknown, línea 100)
- 🔒 `requestAutoDecisionApproval` (unknown, línea 133)
- 🔒 `formatApprovalRequest` (unknown, línea 141)
- 🔒 `handleApprovalResponse` (unknown, línea 160)
- 🔒 `approveAutoDecision` (unknown, línea 171)
- 🔒 `rejectAutoDecision` (unknown, línea 197)
- 🔒 `generateSituationPattern` (unknown, línea 209)
- 🔒 `normalizeResponse` (unknown, línea 220)
- 🔒 `normalizeDeviceModel` (unknown, línea 224)
- 🔒 `categorizeTimeOfDay` (unknown, línea 228)
- 🔒 `describeSituationFromPattern` (unknown, línea 235)
- 🔒 `switch` (unknown, línea 240)
- 🔒 `saveDecisionToDatabase` (unknown, línea 252)
- 🔒 `saveAutoDecisionToDatabase` (unknown, línea 262)
- 🔒 `markDecisionSuccess` (unknown, línea 272)
- 🔒 `updateAccuracyMetrics` (unknown, línea 288)
- 🔒 `getMetrics` (unknown, línea 304)
- 🔒 `getPendingApprovals` (unknown, línea 313)
- 🔒 `getActiveAutoDecisions` (unknown, línea 317)
- 🔒 `shutdown` (unknown, línea 329)
- 🔒 `generatePredictions` (unknown, línea 360)
- 🔒 `predictBehavior` (unknown, línea 399)
- 🔒 `predictNeeds` (unknown, línea 420)
- 🔒 `predictOptimalTiming` (unknown, línea 440)
- 🔒 `predictDeviceLifecycle` (unknown, línea 459)
- 🔒 `for` (unknown, línea 469)
- 🔒 `generateProactiveActions` (unknown, línea 484)
- 🔒 `initializePredictionModels` (unknown, línea 539)
- 🔒 `loadHistoricalTrends` (unknown, línea 543)
- 🔒 `aggregateInsights` (unknown, línea 549)
- 🔒 `generateRecommendations` (unknown, línea 563)
- 🔒 `calculateOverallConfidence` (unknown, línea 570)
- 🔒 `countHighConfidencePredictions` (unknown, línea 576)
- 🔒 `calculateContactProbability` (unknown, línea 580)
- 🔒 `predictPreferredTime` (unknown, línea 581)
- 🔒 `predictCommunicationStyle` (unknown, línea 582)
- 🔒 `predictUrgencyPattern` (unknown, línea 583)
- 🔒 `calculateServiceLoyalty` (unknown, línea 584)
- 🔒 `predictLikelyServices` (unknown, línea 585)
- 🔒 `predictUpgradeWindow` (unknown, línea 586)
- 🔒 `predictMaintenanceNeeds` (unknown, línea 587)
- 🔒 `estimateBudgetRange` (unknown, línea 588)
- 🔒 `analyzeBestHours` (unknown, línea 589)
- 🔒 `predictBestDays` (unknown, línea 590)
- 🔒 `estimateResponseExpectation` (unknown, línea 591)
- 🔒 `getSeasonalFactors` (unknown, línea 592)
- 🔒 `getGenericLifecycle` (unknown, línea 593)
- 🔒 `determineCurrentPhase` (unknown, línea 594)
- 🔒 `predictExpectedIssues` (unknown, línea 595)
- 🔒 `suggestMaintenanceSchedule` (unknown, línea 596)
- 🔒 `predictReplacementWindow` (unknown, línea 597)
- 🔒 `calculateProactiveConfidence` (unknown, línea 598)
- 🔒 `processQuery` (unknown, línea 623)
- 🔒 `classifyQuery` (unknown, línea 664)
- 🔒 `analyzeTextComplexity` (unknown, línea 694)
- 🔒 `containsTechnicalTerms` (unknown, línea 715)
- 🔒 `selectReasoningStrategy` (unknown, línea 720)
- 🔒 `executeReasoning` (unknown, línea 730)
- 🔒 `executeReasoningStep` (unknown, línea 756)
- 🔒 `performTextAnalysis` (unknown, línea 774)
- 🔒 `performImageAnalysis` (unknown, línea 780)
- 🔒 `performKnowledgeLookup` (unknown, línea 784)
- 🔒 `performPriceAnalysis` (unknown, línea 788)
- 🔒 `performContextIntegration` (unknown, línea 792)
- 🔒 `performSynthesis` (unknown, línea 796)
- 🔒 `assessConfidence` (unknown, línea 802)
- 🔒 `decideAction` (unknown, línea 808)
- 🔒 `generateConclusions` (unknown, línea 824)
- 🔒 `formulateReasoning` (unknown, línea 835)
- 🔒 `updateMetrics` (unknown, línea 839)
- 🔒 `initializeReasoningStrategies` (unknown, línea 847)

**Clases (3):**
- 🔒 `AdaptiveLearningEngine` (línea 7)
- 🔒 `PredictiveAnalyticsEngine` (línea 339)
- 🔒 `MultiModalReasoningEngine` (línea 603)

**Imports (3):**
- 📁 `logger` desde `../../utils/logger`
- 📁 `initializeDatabase` desde `../../database/pg`
- 📁 `config` desde `../../../config/config`

#### 📄 ResponseService.js

**Ruta:** `src\core\intelligence\ResponseService.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 46384 caracteres, 1341 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (35):**
- 🔒 `constructor` (unknown, línea 19)
- 🔒 `generateResponse` (unknown, línea 47)
- 🔒 `catch` (unknown, línea 105)
- 🔒 `analyzeClientContext` (unknown, línea 128)
- 🔒 `updateClientContext` (unknown, línea 172)
- 🔒 `if` (unknown, línea 182)
- 🔒 `determineResponseType` (unknown, línea 234)
- 🔒 `getTemporalContext` (unknown, línea 301)
- 🔒 `createPersonalizedResponse` (unknown, línea 354)
- 🔒 `createPersonalizationVariables` (unknown, línea 428)
- 🔒 `getResponseTemplate` (unknown, línea 505)
- 🔒 `populateTemplate` (unknown, línea 524)
- 🔒 `applyPersonalityStyle` (unknown, línea 551)
- 🔒 `switch` (unknown, línea 555)
- 🔒 `addContextualElements` (unknown, línea 592)
- 🔒 `updateConversationMemory` (unknown, línea 631)
- 🔒 `getConversationHistory` (unknown, línea 655)
- 🔒 `updateMetrics` (unknown, línea 664)
- 🔒 `generateFallbackResponse` (unknown, línea 688)
- 🔒 `extractDeviceType` (unknown, línea 710)
- 🔒 `extractServiceType` (unknown, línea 728)
- 🔒 `analyzeCommunicationStyle` (unknown, línea 745)
- 🔒 `initializeTemplates` (unknown, línea 760)
- 🔒 `loadBusinessContext` (unknown, línea 833)
- 🔒 `addAdditionalTemplates` (unknown, línea 867)
- 🔒 `enrichClientBehavior` (unknown, línea 974)
- 🔒 `analyzeSentiment` (unknown, línea 1025)
- 🔒 `applySentimentAdjustments` (unknown, línea 1069)
- 🔒 `getContextStats` (unknown, línea 1097)
- 🔒 `getMetrics` (unknown, línea 1157)
- 🔒 `cleanupOldData` (unknown, línea 1183)
- 🔒 `exportContextData` (unknown, línea 1209)
- 🔒 `importContextData` (unknown, línea 1241)
- 🔒 `optimizeTemplates` (unknown, línea 1286)
- 🔒 `generateOptimizationSuggestions` (unknown, línea 1316)

**Clases (1):**
- 🔄 `ContextAwareResponseGenerator` (línea 18)

**Imports (2):**
- 📁 `logger` desde `../../utils/logger`
- 📁 `config` desde `../../../config/config`


---

### 📁 src\core\performance

**Archivos:** 1

#### 📄 PerformanceController.js

**Ruta:** `src\core\performance\PerformanceController.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 43959 caracteres, 1182 líneas  
**Módulo:** Sí  

**Funciones (74):**
- 🔒 `constructor` (unknown, línea 9)
- 🔒 `initializeWorkerPool` (unknown, línea 38)
- 🔒 `for` (unknown, línea 39)
- 🔒 `executeTask` (unknown, línea 56)
- 🔒 `executeBatch` (unknown, línea 80)
- 🔒 `catch` (unknown, línea 108)
- 🔒 `enqueueTask` (unknown, línea 118)
- 🔒 `processQueue` (unknown, línea 130)
- 🔒 `while` (unknown, línea 131)
- 🔒 `if` (unknown, línea 133)
- 🔒 `assignTaskToWorker` (unknown, línea 143)
- 🔒 `executeTaskInWorker` (unknown, línea 167)
- 🔒 `executeTaskDirect` (unknown, línea 181)
- 🔒 `handleTaskCompletion` (unknown, línea 200)
- 🔒 `findAvailableWorker` (unknown, línea 219)
- 🔒 `createOptimalBatches` (unknown, línea 229)
- 🔒 `findInsertionIndex` (unknown, línea 238)
- 🔒 `updateAverageExecutionTime` (unknown, línea 251)
- 🔒 `startMetricsCollection` (unknown, línea 256)
- 🔒 `collectMetrics` (unknown, línea 262)
- 🔒 `getMetrics` (unknown, línea 272)
- 🔒 `generateTaskId` (unknown, línea 284)
- 🔒 `generateBatchId` (unknown, línea 288)
- 🔒 `sleep` (unknown, línea 292)
- 🔒 `optimize` (unknown, línea 296)
- 🔒 `shutdown` (unknown, línea 337)
- 🔒 `initializeMemoryPools` (unknown, línea 379)
- 🔒 `allocateMemory` (unknown, línea 386)
- 🔒 `allocateFromPool` (unknown, línea 406)
- 🔒 `performIntelligentCleanup` (unknown, línea 434)
- 🔒 `cleanupPool` (unknown, línea 461)
- 🔒 `forceGarbageCollection` (unknown, línea 482)
- 🔒 `getCurrentMemoryUsage` (unknown, línea 498)
- 🔒 `getAvailableMemory` (unknown, línea 504)
- 🔒 `getTotalSystemMemory` (unknown, línea 516)
- 🔒 `startMonitoring` (unknown, línea 520)
- 🔒 `monitorMemoryUsage` (unknown, línea 529)
- 🔒 `getMemoryMetrics` (unknown, línea 547)
- 🔒 `generateAllocationId` (unknown, línea 560)
- 🔒 `fallbackAllocation` (unknown, línea 564)
- 🔒 `optimizeForOperation` (unknown, línea 577)
- 🔒 `forceCleanup` (unknown, línea 585)
- 🔒 `initializeOptimizer` (unknown, línea 646)
- 🔒 `setMode` (unknown, línea 656)
- 🔒 `optimizeCacheContents` (unknown, línea 712)
- 🔒 `cleanupFrequencyMap` (unknown, línea 728)
- 🔒 `executeOptimizedQuery` (unknown, línea 742)
- 🔒 `detectQueryType` (unknown, línea 782)
- 🔒 `selectTargetCache` (unknown, línea 798)
- 🔒 `switch` (unknown, línea 799)
- 🔒 `findSemanticMatch` (unknown, línea 808)
- 🔒 `executeWithOptimization` (unknown, línea 829)
- 🔒 `calculateAdaptiveTTL` (unknown, línea 845)
- 🔒 `generateQueryKey` (unknown, línea 853)
- 🔒 `hashString` (unknown, línea 859)
- 🔒 `updateFrequencyMap` (unknown, línea 869)
- 🔒 `createTimeoutPromise` (unknown, línea 877)
- 🔒 `enrichCachedResult` (unknown, línea 883)
- 🔒 `enrichResult` (unknown, línea 887)
- 🔒 `calculateSimilarity` (unknown, línea 891)
- 🔒 `updateMetrics` (unknown, línea 904)
- 🔒 `getPerformanceMetrics` (unknown, línea 910)
- 🔒 `initialize` (unknown, línea 956)
- 🔒 `initializeComponents` (unknown, línea 972)
- 🔒 `executeConcurrentOperations` (unknown, línea 1003)
- 🔒 `allocateOptimizedMemory` (unknown, línea 1025)
- 🔒 `triggerPerformanceDegradation` (unknown, línea 1061)
- 🔒 `startPerformanceMonitoring` (unknown, línea 1071)
- 🔒 `performanceHealthCheck` (unknown, línea 1077)
- 🔒 `executeSequential` (unknown, línea 1087)
- 🔒 `optimizeOperation` (unknown, línea 1100)
- 🔒 `activateEmergencyMode` (unknown, línea 1112)
- 🔒 `deactivateEmergencyMode` (unknown, línea 1120)
- 🔒 `getStatus` (unknown, línea 1153)

**Clases (4):**
- 🔒 `ConcurrentProcessor` (línea 8)
- 🔒 `MemoryManager` (línea 351)
- 🔒 `QueryOptimizer` (línea 611)
- 🔄 `PerformanceController` (línea 927)

**Imports (6):**
- 📦 `Worker` desde `worker_threads`
- 📦 `performance` desde `perf_hooks`
- 📁 `logger` desde `../../utils/logger`
- 📁 `LRUCache, MetricsLRUCache` desde `../../utils/cache`
- 📁 `getEmbeddingEngine` desde `../../services/embeddingEngine`
- 📁 `config` desde `../../../config/config`


---

### 📁 src\core\resilience

**Archivos:** 1

#### 📄 ResilienceController.js

**Ruta:** `src\core\resilience\ResilienceController.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 34866 caracteres, 804 líneas  
**Módulo:** Sí  

**Funciones (72):**
- 🔒 `constructor` (unknown, línea 7)
- 🔒 `execute` (unknown, línea 53)
- 🔒 `catch` (unknown, línea 62)
- 🔒 `checkCircuitState` (unknown, línea 68)
- 🔒 `switch` (unknown, línea 70)
- 🔒 `if` (unknown, línea 77)
- 🔒 `executeWithMonitoring` (unknown, línea 94)
- 🔒 `handleSuccess` (unknown, línea 116)
- 🔒 `handleFailure` (unknown, línea 129)
- 🔒 `transitionToOpen` (unknown, línea 144)
- 🔒 `transitionToHalfOpen` (unknown, línea 154)
- 🔒 `transitionToClosed` (unknown, línea 164)
- 🔒 `shouldAdaptThreshold` (unknown, línea 175)
- 🔒 `adaptFailureThreshold` (unknown, línea 181)
- 🔒 `recordResponseTime` (unknown, línea 201)
- 🔒 `handleSlowResponse` (unknown, línea 210)
- 🔒 `startAdaptiveMonitoring` (unknown, línea 216)
- 🔒 `performHealthCheck` (unknown, línea 222)
- 🔒 `getMetrics` (unknown, línea 237)
- 🔒 `generateRequestId` (unknown, línea 248)
- 🔒 `forceState` (unknown, línea 252)
- 🔒 `initializeServiceRegistry` (unknown, línea 298)
- 🔒 `registerService` (unknown, línea 305)
- 🔒 `reportServiceHealth` (unknown, línea 321)
- 🔒 `handleServiceFailure` (unknown, línea 344)
- 🔒 `handleServiceRecovery` (unknown, línea 352)
- 🔒 `applyServiceDegradation` (unknown, línea 360)
- 🔒 `handleCriticalServiceFailure` (unknown, línea 368)
- 🔒 `handleImportantServiceFailure` (unknown, línea 374)
- 🔒 `handleOptionalServiceFailure` (unknown, línea 382)
- 🔒 `increaseDegradationLevel` (unknown, línea 387)
- 🔒 `decreaseDegradationLevel` (unknown, línea 397)
- 🔒 `applyDegradationMode` (unknown, línea 407)
- 🔒 `activateFullOperation` (unknown, línea 416)
- 🔒 `activatePartialDegradation` (unknown, línea 423)
- 🔒 `activateMinimalOperation` (unknown, línea 429)
- 🔒 `activateCriticalMode` (unknown, línea 441)
- 🔒 `disableFeature` (unknown, línea 448)
- 🔒 `enableFeature` (unknown, línea 457)
- 🔒 `isFeatureActive` (unknown, línea 466)
- 🔒 `evaluateSystemHealth` (unknown, línea 470)
- 🔒 `getUnhealthyServicesCount` (unknown, línea 488)
- 🔒 `adjustDegradationLevel` (unknown, línea 492)
- 🔒 `getDegradationMode` (unknown, línea 500)
- 🔒 `activateEmergencyProtocols` (unknown, línea 505)
- 🔒 `initiateEmergencyRecovery` (unknown, línea 511)
- 🔒 `initiateServiceRecovery` (unknown, línea 518)
- 🔒 `canEnableFeature` (unknown, línea 530)
- 🔒 `startHealthMonitoring` (unknown, línea 542)
- 🔒 `getSystemStatus` (unknown, línea 554)
- 🔒 `startMonitoring` (unknown, línea 580)
- 🔒 `stopMonitoring` (unknown, línea 589)
- 🔒 `runHealthChecks` (unknown, línea 597)
- 🔒 `for` (unknown, línea 600)
- 🔒 `updateHealthStatus` (unknown, línea 626)
- 🔒 `analyzeTrends` (unknown, línea 639)
- 🔒 `getSystemHealth` (unknown, línea 648)
- 🔒 `reportFailure` (unknown, línea 661)
- 🔒 `initiateRecovery` (unknown, línea 680)
- 🔒 `restartService` (unknown, línea 701)
- 🔒 `injectDependencies` (unknown, línea 709)
- 🔒 `validateRecovery` (unknown, línea 713)
- 🔒 `initialize` (unknown, línea 734)
- 🔒 `shutdown` (unknown, línea 742)
- 🔒 `executeWithProtection` (unknown, línea 749)
- 🔒 `activateDegradationMode` (unknown, línea 757)
- 🔒 `notifyHealthChange` (unknown, línea 761)
- 🔒 `getOverallHealth` (unknown, línea 765)
- 🔒 `getStatus` (unknown, línea 773)
- 🔒 `optimize` (unknown, línea 781)
- 🔒 `getCircuitBreaker` (unknown, línea 786)
- 🔒 `getGracefulDegradationManager` (unknown, línea 790)

**Clases (5):**
- 🔒 `AdvancedCircuitBreaker` ← EventEmitter (línea 6)
- 🔒 `GracefulDegradationManager` ← EventEmitter (línea 260)
- 🔒 `HealthMonitoringSystem` (línea 572)
- 🔒 `SelfHealingManager` (línea 653)
- 🔒 `ResilienceController` (línea 727)

**Imports (4):**
- 📁 `logger` desde `../../utils/logger`
- 📦 `EventEmitter` desde `events`
- 📁 `services, restartService` desde `../../services/serviceRegistry`
- 📁 `config` desde `../../../config/config`


---

### 📁 src\database

**Archivos:** 1  
**Tecnologías:** WhatsApp Web API

#### 📄 pg.js

**Ruta:** `src\database\pg.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 14324 caracteres, 425 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (15):**
- 🔒 `initializeDatabase` (function, línea 20)
- 🔒 `inspectAndNormalizeSchema` (function, línea 47)
- 🔒 `normalizeAdminUsersColumns` (function, línea 85)
- 🔒 `createBasicTablesWithInspection` (function, línea 127)
- 🔒 `createAdminUsersTableSafely` (function, línea 193)
- 🔒 `insertDefaultAdminSafely` (function, línea 228)
- 🔒 `verifyTables` (function, línea 264)
- 🔒 `getClientByNumber` (function, línea 313)
- 🔒 `addOrUpdateClient` (function, línea 326)
- 🔒 `buildConversationalContext` (function, línea 363)
- 🔒 `getTimeFrame` (function, línea 402)
- 🔒 `closeDatabase` (function, línea 408)
- 🔒 `catch` (unknown, línea 38)
- 🔒 `if` (unknown, línea 60)
- 🔒 `for` (unknown, línea 274)

**Imports (2):**
- 📦 `Pool` desde `pg`
- 📁 `logger` desde `../utils/logger`


---

### 📁 src\excel

**Archivos:** 1

#### 📄 processor.js

**Ruta:** `src\excel\processor.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 3816 caracteres, 121 líneas  
**Módulo:** Sí  

**Funciones (6):**
- 🔒 `validateColumns` (function, línea 11)
- 🔒 `insertDataIntoDB` (function, línea 40)
- 🔒 `processExcelFile` (function, línea 87)
- 🔒 `if` (unknown, línea 20)
- 🔒 `for` (unknown, línea 27)
- 🔒 `catch` (unknown, línea 70)

**Imports (2):**
- 📦 `xlsx` desde `xlsx`
- 📁 `pool` desde `../database/pg`


---

### 📁 src\monitoring

**Archivos:** 1

#### 📄 intelligentMonitor.js

**Ruta:** `src\monitoring\intelligentMonitor.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 1475 caracteres, 51 líneas  
**Módulo:** Sí  

**Funciones (4):**
- 🔒 `constructor` (unknown, línea 9)
- 🔒 `analyze` (unknown, línea 23)
- 🔒 `if` (unknown, línea 25)
- 🔒 `selfHeal` (unknown, línea 37)

**Clases (1):**
- 🔒 `IntelligentMonitor` ← EventEmitter (línea 8)

**Imports (2):**
- 📦 `EventEmitter` desde `events`
- 📁 `logger` desde `../utils/logger`


---

### 📁 src\responses

**Archivos:** 1

#### 📄 templates.js

**Ruta:** `src\responses\templates.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 5681 caracteres, 152 líneas  
**Módulo:** Sí  

**Funciones (11):**
- 🔒 `getGreeting` (function, línea 7)
- 🔒 `getAIPresentation` (function, línea 18)
- 🔒 `welcomeNewUser` (function, línea 26)
- 🔒 `welcomeBackUser` (function, línea 35)
- 🔒 `askForName` (function, línea 43)
- 🔒 `formatRepairInfo` (function, línea 52)
- 🔒 `notFound` (function, línea 77)
- 🔒 `generalError` (function, línea 85)
- 🔒 `adminModeActivated` (function, línea 90)
- 🔒 `adminModeDeactivated` (function, línea 94)
- 🔒 `adminHelp` (function, línea 98)


---

### 📁 src\scripts

**Archivos:** 2  
**Tecnologías:** HTTP Client, Pandas

#### 📄 architectural_health_check.js

**Ruta:** `src\scripts\architectural_health_check.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 5264 caracteres, 156 líneas  
**Tecnologías:** HTTP Client  
**Módulo:** Sí  

**Funciones (3):**
- 🔒 `architecturalHealthCheck` (function, línea 7)
- 🔒 `if` (unknown, línea 21)
- 🔒 `catch` (unknown, línea 28)

**Imports (3):**
- 📁 `logger` desde `../../utils/logger`
- 📦 `fetch` desde `node-fetch`
- 📦 `Pool` desde `pg`

#### 📄 convert_excel_to_markdown.py

**Ruta:** `src\scripts\convert_excel_to_markdown.py`  
**Tipo:** PYTHON  
**Tamaño:** 5103 caracteres, 128 líneas  
**Tecnologías:** Pandas  

**Funciones (1):**
- 🔒 `convert_excel_to_markdown` (function, línea 10)

**Imports (5):**
- 📦 `datetime` desde `datetime`
- 📦 `` desde `pandas as pd`
- 📦 `` desde `argparse`
- 📦 `` desde `os`
- 📦 `` desde `datetime`


---

### 📁 src\scripts\chroma

**Archivos:** 5  
**Tecnologías:** WhatsApp Web API

#### 📄 clear_cache_collection.js

**Ruta:** `src\scripts\chroma\clear_cache_collection.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 1531 caracteres, 44 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** No  

**Funciones (2):**
- 🔒 `clearCacheCollection` (function, línea 13)
- 🔒 `catch` (unknown, línea 32)

**Imports (2):**
- 📦 `ChromaClient` desde `chromadb`
- 📁 `logger` desde `../../utils/logger`

#### 📄 index_intentions.js

**Ruta:** `src\scripts\chroma\index_intentions.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 3102 caracteres, 97 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (5):**
- 🔒 `indexIntentions` (function, línea 39)
- 🔒 `constructor` (unknown, línea 18)
- 🔒 `generate` (unknown, línea 22)
- 🔒 `catch` (unknown, línea 29)
- 🔒 `if` (unknown, línea 44)

**Clases (1):**
- 🔒 `LangChainEmbeddingAdapter` (línea 17)

**Imports (4):**
- 📦 `ChromaClient` desde `chromadb`
- 📁 `embeddingEngine` desde `../../services/embeddingEngine`
- 📁 `intentionsData` desde `../../../intentions_dataset.json`
- 📁 `logger` desde `../../utils/logger`

#### 📄 index_knowledge.js

**Ruta:** `src\scripts\chroma\index_knowledge.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 5314 caracteres, 155 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (5):**
- 🔒 `indexKnowledge` (function, línea 45)
- 🔒 `constructor` (unknown, línea 24)
- 🔒 `generate` (unknown, línea 28)
- 🔒 `catch` (unknown, línea 35)
- 🔒 `if` (unknown, línea 51)

**Clases (1):**
- 🔒 `LangChainEmbeddingAdapter` (línea 23)

**Imports (6):**
- 📦 `ChromaClient` desde `chromadb`
- 📁 `embeddingEngine` desde `../../services/embeddingEngine`
- 📁 `pool` desde `../../database/pg`
- 📁 `logger` desde `../../utils/logger`
- 📦 `fs` desde `fs`
- 📦 `path` desde `path`

#### 📄 index_markdown_prices.js

**Ruta:** `src\scripts\chroma\index_markdown_prices.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 9195 caracteres, 274 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (6):**
- 🔒 `processMarkdownFile` (function, línea 27)
- 🔒 `indexMarkdownPrices` (function, línea 109)
- 🔒 `cleanExistingPriceChunks` (function, línea 220)
- 🔒 `for` (unknown, línea 37)
- 🔒 `if` (unknown, línea 43)
- 🔒 `catch` (unknown, línea 145)

**Imports (5):**
- 📦 `fs` desde `fs`
- 📦 `path` desde `path`
- 📦 `ChromaClient` desde `chromadb`
- 📁 `embeddingEngine` desde `../../services/embeddingEngine`
- 📁 `logger` desde `../../utils/logger`

#### 📄 migrate_to_task_prefixes.js

**Ruta:** `src\scripts\chroma\migrate_to_task_prefixes.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 13368 caracteres, 411 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (10):**
- 🔒 `checkCollections` (function, línea 22)
- 🔒 `getCollectionStats` (function, línea 54)
- 🔒 `createCollectionBackup` (function, línea 86)
- 🔒 `planMigrationStrategy` (function, línea 151)
- 🔒 `executeMigrationStrategy` (function, línea 198)
- 🔒 `runMigration` (function, línea 296)
- 🔒 `catch` (unknown, línea 41)
- 🔒 `if` (unknown, línea 98)
- 🔒 `for` (unknown, línea 114)
- 🔒 `switch` (unknown, línea 208)

**Imports (2):**
- 📦 `ChromaClient` desde `chromadb`
- 📁 `logger` desde `../../utils/logger`


---

### 📁 src\scripts\db

**Archivos:** 6  
**Tecnologías:** HTTP Client, WhatsApp Web API

#### 📄 convertMarkdownToPostgreSQL.js

**Ruta:** `src\scripts\db\convertMarkdownToPostgreSQL.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 15887 caracteres, 502 líneas  
**Módulo:** Sí  

**Funciones (16):**
- 🔒 `constructor` (unknown, línea 24)
- 🔒 `executeMigration` (unknown, línea 48)
- 🔒 `catch` (unknown, línea 65)
- 🔒 `verifyMarkdownFiles` (unknown, línea 74)
- 🔒 `if` (unknown, línea 85)
- 🔒 `cleanCurrentData` (unknown, línea 104)
- 🔒 `processAllMarkdownFiles` (unknown, línea 138)
- 🔒 `for` (unknown, línea 145)
- 🔒 `processSingleMarkdownFile` (unknown, línea 157)
- 🔒 `parseMarkdownTable` (unknown, línea 215)
- 🔒 `parseTableHeader` (unknown, línea 259)
- 🔒 `parseTableRow` (unknown, línea 288)
- 🔒 `parsePrice` (unknown, línea 347)
- 🔒 `normalizeModel` (unknown, línea 359)
- 🔒 `insertRecord` (unknown, línea 373)
- 🔒 `generateMigrationReport` (unknown, línea 421)

**Clases (1):**
- 🔄 `MarkdownToPostgreSQLConverter` (línea 23)

**Imports (3):**
- 📦 `fs` desde `fs`
- 📦 `path` desde `path`
- 📁 `pool` desde `../../database/pg`

#### 📄 generateSQLFromExcel.js

**Ruta:** `src\scripts\db\generateSQLFromExcel.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 9329 caracteres, 306 líneas  
**Módulo:** Sí  

**Funciones (14):**
- 🔒 `constructor` (unknown, línea 12)
- 🔒 `processTestFiles` (unknown, línea 21)
- 🔒 `for` (unknown, línea 31)
- 🔒 `processExcelFile` (unknown, línea 41)
- 🔒 `catch` (unknown, línea 70)
- 🔒 `parseSheetData` (unknown, línea 78)
- 🔒 `if` (unknown, línea 92)
- 🔒 `looksLikeHeader` (unknown, línea 103)
- 🔒 `detectColumns` (unknown, línea 118)
- 🔒 `parseDataRowDirect` (unknown, línea 154)
- 🔒 `parseDataRow` (unknown, línea 196)
- 🔒 `normalizeModel` (unknown, línea 227)
- 🔒 `generateInsertSQL` (unknown, línea 240)
- 🔒 `generateSQLFile` (unknown, línea 253)

**Clases (1):**
- 🔄 `SQLGenerator` (línea 11)

**Imports (3):**
- 📦 `XLSX` desde `xlsx`
- 📦 `path` desde `path`
- 📦 `fs` desde `fs`

#### 📄 importExcelData.js

**Ruta:** `src\scripts\db\importExcelData.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 9639 caracteres, 331 líneas  
**Módulo:** Sí  

**Funciones (13):**
- 🔒 `constructor` (unknown, línea 12)
- 🔒 `importTestFiles` (unknown, línea 22)
- 🔒 `for` (unknown, línea 33)
- 🔒 `processExcelFile` (unknown, línea 43)
- 🔒 `catch` (unknown, línea 76)
- 🔒 `parseSheetData` (unknown, línea 85)
- 🔒 `if` (unknown, línea 116)
- 🔒 `looksLikeHeader` (unknown, línea 127)
- 🔒 `detectColumns` (unknown, línea 150)
- 🔒 `parseDataRow` (unknown, línea 203)
- 🔒 `normalizeModel` (unknown, línea 236)
- 🔒 `insertRepairData` (unknown, línea 250)
- 🔒 `printSummary` (unknown, línea 296)

**Clases (1):**
- 🔄 `ExcelDataImporter` (línea 11)

**Imports (3):**
- 📦 `XLSX` desde `xlsx`
- 📦 `path` desde `path`
- 📁 `pool` desde `../../database/pg`

#### 📄 migrateConversations.js

**Ruta:** `src\scripts\db\migrateConversations.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 9556 caracteres, 271 líneas  
**Tecnologías:** HTTP Client  
**Módulo:** Sí  

**Funciones (10):**
- 🔒 `constructor` (unknown, línea 14)
- 🔒 `migrateAllConversations` (unknown, línea 23)
- 🔒 `if` (unknown, línea 32)
- 🔒 `for` (unknown, línea 48)
- 🔒 `catch` (unknown, línea 54)
- 🔒 `fetchExistingConversations` (unknown, línea 65)
- 🔒 `processConversation` (unknown, línea 98)
- 🔒 `extractConversationData` (unknown, línea 138)
- 🔒 `updateConversationWithChunkId` (unknown, línea 204)
- 🔒 `printMigrationSummary` (unknown, línea 225)

**Clases (1):**
- 🔄 `ConversationMigrator` (línea 13)

**Imports (3):**
- 📁 `pool` desde `../../database/pg`
- 📁 `conversationMemory` desde `../../services/conversationMemory`
- 📁 `logger` desde `../../utils/logger`

#### 📄 seed_proactive_knowledge.js

**Ruta:** `src\scripts\db\seed_proactive_knowledge.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 3879 caracteres, 86 líneas  
**Módulo:** No  

**Funciones (4):**
- 🔒 `seedKnowledge` (function, línea 36)
- 🔒 `if` (unknown, línea 53)
- 🔒 `for` (unknown, línea 62)
- 🔒 `catch` (unknown, línea 76)

**Imports (2):**
- 📁 `pool` desde `../../database/pg`
- 📁 `logger` desde `../../utils/logger`

#### 📄 verifyMigration.js

**Ruta:** `src\scripts\db\verifyMigration.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 10953 caracteres, 304 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (8):**
- 🔒 `constructor` (unknown, línea 12)
- 🔒 `verifyMigration` (unknown, línea 23)
- 🔒 `catch` (unknown, línea 43)
- 🔒 `verifyPostgreSQL` (unknown, línea 53)
- 🔒 `verifyChromaDB` (unknown, línea 111)
- 🔒 `if` (unknown, línea 119)
- 🔒 `verifyIntegration` (unknown, línea 142)
- 🔒 `printVerificationResults` (unknown, línea 196)

**Clases (1):**
- 🔄 `MigrationVerifier` (línea 11)

**Imports (3):**
- 📁 `pool` desde `../../database/pg`
- 📁 `conversationMemory` desde `../../services/conversationMemory`
- 📁 `tools` desde `../../services/tools`


---

### 📁 src\scripts\evals

**Archivos:** 1

#### 📄 run_evals.js

**Ruta:** `src\scripts\evals\run_evals.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 3338 caracteres, 90 líneas  
**Módulo:** No  

**Funciones (4):**
- 🔒 `runEvals` (function, línea 12)
- 🔒 `for` (unknown, línea 32)
- 🔒 `catch` (unknown, línea 45)
- 🔒 `if` (unknown, línea 54)

**Imports (5):**
- 📦 `fs` desde `fs`
- 📦 `path` desde `path`
- 📁 `SimpleAgentExecutor` desde `../../services/simpleAgentExecutor`
- 📁 `initializeDatabase` desde `../../database/pg`
- 📁 `logger` desde `../../utils/logger`


---

### 📁 src\security

**Archivos:** 3  
**Tecnologías:** WhatsApp Web API, Express.js

#### 📄 advancedRateLimiter.js

**Ruta:** `src\security\advancedRateLimiter.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 26406 caracteres, 837 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (31):**
- 🔒 `constructor` (unknown, línea 19)
- 🔒 `refill` (unknown, línea 28)
- 🔒 `if` (unknown, línea 35)
- 🔒 `consume` (unknown, línea 41)
- 🔒 `peek` (unknown, línea 52)
- 🔒 `getWaitTime` (unknown, línea 57)
- 🔒 `getInfo` (unknown, línea 68)
- 🔒 `cleanExpiredRequests` (unknown, línea 91)
- 🔒 `addRequest` (unknown, línea 97)
- 🔒 `getCurrentCount` (unknown, línea 103)
- 🔒 `getResetTime` (unknown, línea 108)
- 🔒 `recordActivity` (unknown, línea 145)
- 🔒 `analyzePattern` (unknown, línea 176)
- 🔒 `for` (unknown, línea 197)
- 🔒 `flagAsSuspicious` (unknown, línea 231)
- 🔒 `addToBlacklist` (unknown, línea 254)
- 🔒 `removeFromBlacklist` (unknown, línea 265)
- 🔒 `isBlacklisted` (unknown, línea 277)
- 🔒 `isSuspicious` (unknown, línea 281)
- 🔒 `getClientInfo` (unknown, línea 285)
- 🔒 `cleanup` (unknown, línea 293)
- 🔒 `getUserLimits` (unknown, línea 402)
- 🔒 `getOrCreateClientBucket` (unknown, línea 413)
- 🔒 `checkRateLimit` (unknown, línea 451)
- 🔒 `catch` (unknown, línea 589)
- 🔒 `updateClientLimits` (unknown, línea 607)
- 🔒 `getClientStats` (unknown, línea 631)
- 🔒 `getSystemMetrics` (unknown, línea 653)
- 🔒 `destroy` (unknown, línea 712)
- 🔒 `enableBypass` (unknown, línea 740)
- 🔒 `middleware` (unknown, línea 745)

**Clases (5):**
- 🔒 `TokenBucket` (línea 18)
- 🔒 `SlidingWindowLimiter` (línea 83)
- 🔒 `AbusePatternDetector` (línea 133)
- 🔒 `AdvancedRateLimiter` (línea 323)
- 🔒 `RateLimitMiddleware` (línea 728)

**Imports (2):**
- 📦 `v4: uuidv4` desde `uuid`
- 📁 `logger` desde `../utils/logger`

#### 📄 authLayer.js

**Ruta:** `src\security\authLayer.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 27924 caracteres, 928 líneas  
**Módulo:** Sí  

**Funciones (41):**
- 🔒 `constructor` (unknown, línea 21)
- 🔒 `matches` (unknown, línea 29)
- 🔒 `addPermission` (unknown, línea 47)
- 🔒 `removePermission` (unknown, línea 55)
- 🔒 `for` (unknown, línea 56)
- 🔒 `if` (unknown, línea 57)
- 🔒 `hasPermission` (unknown, línea 65)
- 🔒 `getPermissionsList` (unknown, línea 74)
- 🔒 `sanitizePhoneNumber` (unknown, línea 106)
- 🔒 `addRole` (unknown, línea 119)
- 🔒 `removeRole` (unknown, línea 128)
- 🔒 `hasRole` (unknown, línea 148)
- 🔒 `updateActivity` (unknown, línea 157)
- 🔒 `setTrustLevel` (unknown, línea 162)
- 🔒 `blockUntil` (unknown, línea 172)
- 🔒 `isBlocked` (unknown, línea 177)
- 🔒 `logAction` (unknown, línea 183)
- 🔒 `getHighestRoleLevel` (unknown, línea 198)
- 🔒 `toJSON` (unknown, línea 206)
- 🔒 `generateToken` (unknown, línea 244)
- 🔒 `validateToken` (unknown, línea 258)
- 🔒 `refreshActivity` (unknown, línea 272)
- 🔒 `isExpired` (unknown, línea 276)
- 🔒 `invalidate` (unknown, línea 281)
- 🔒 `initializeDefaultRoles` (unknown, línea 329)
- 🔒 `authenticateUser` (unknown, línea 415)
- 🔒 `catch` (unknown, línea 537)
- 🔒 `authorizeAction` (unknown, línea 553)
- 🔒 `checkRateLimit` (unknown, línea 633)
- 🔒 `resetRateLimit` (unknown, línea 689)
- 🔒 `getUserByPhone` (unknown, línea 701)
- 🔒 `getSession` (unknown, línea 705)
- 🔒 `blockUser` (unknown, línea 709)
- 🔒 `unblockUser` (unknown, línea 725)
- 🔒 `promoteUser` (unknown, línea 739)
- 🔒 `getMetrics` (unknown, línea 771)
- 🔒 `cleanup` (unknown, línea 798)
- 🔒 `enableBypass` (unknown, línea 838)
- 🔒 `authenticate` (unknown, línea 843)
- 🔒 `authorize` (unknown, línea 857)
- 🔒 `middleware` (unknown, línea 871)

**Clases (6):**
- 🔒 `Permission` (línea 20)
- 🔒 `Role` (línea 37)
- 🔒 `WhatsAppUser` (línea 87)
- 🔒 `Session` (línea 226)
- 🔒 `AuthenticationManager` (línea 298)
- 🔒 `AuthMiddleware` (línea 832)

**Imports (4):**
- 📦 `crypto` desde `crypto`
- 📦 `v4: uuidv4` desde `uuid`
- 📁 `logger` desde `../utils/logger`
- 📁 `config` desde `../../config/config`

#### 📄 inputValidator.js

**Ruta:** `src\security\inputValidator.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 17525 caracteres, 546 líneas  
**Tecnologías:** Express.js  
**Módulo:** Sí  

**Funciones (16):**
- 🔒 `constructor` (unknown, línea 18)
- 🔒 `validate` (unknown, línea 24)
- 🔒 `createResult` (unknown, línea 28)
- 🔒 `for` (unknown, línea 61)
- 🔒 `if` (unknown, línea 143)
- 🔒 `addValidator` (unknown, línea 302)
- 🔒 `removeValidator` (unknown, línea 313)
- 🔒 `validateInput` (unknown, línea 321)
- 🔒 `catch` (unknown, línea 391)
- 🔒 `getMetrics` (unknown, línea 418)
- 🔒 `enableBypass` (unknown, línea 444)
- 🔒 `middleware` (unknown, línea 449)
- 🔒 `createDefault` (unknown, línea 512)
- 🔒 `createStrict` (unknown, línea 516)
- 🔒 `createPermissive` (unknown, línea 522)
- 🔒 `createMiddleware` (unknown, línea 528)

**Clases (9):**
- 🔒 `ValidationRule` (línea 17)
- 🔒 `SQLInjectionValidator` ← ValidationRule (línea 45)
- 🔒 `XSSValidator` ← ValidationRule (línea 86)
- 🔒 `LengthValidator` ← ValidationRule (línea 132)
- 🔒 `EncodingValidator` ← ValidationRule (línea 177)
- 🔒 `BusinessRuleValidator` ← ValidationRule (línea 236)
- 🔒 `InputValidationChain` (línea 281)
- 🔒 `ValidationMiddleware` (línea 438)
- 🔒 `InputValidatorFactory` (línea 511)

**Imports (2):**
- 📁 `logger` desde `../utils/logger`
- 📦 `v4: uuidv4` desde `uuid`


---

### 📁 src\services

**Archivos:** 21  
**Tecnologías:** WhatsApp Web API

#### Grupo 1

#### 📄 agentExecutor.js

**Ruta:** `src\services\agentExecutor.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 5861 caracteres, 181 líneas  
**Módulo:** Sí  

**Funciones (5):**
- 🔒 `constructor` (unknown, línea 15)
- 🔒 `initialize` (unknown, línea 92)
- 🔒 `execute` (unknown, línea 113)
- 🔒 `if` (unknown, línea 121)
- 🔒 `catch` (unknown, línea 129)

**Clases (4):**
- 🔒 `OllamaError` ← Error (línea 14)
- 🔒 `ToolError` ← Error (línea 21)
- 🔒 `ValidationError` ← Error (línea 28)
- 🔒 `SalvaCellAgentExecutor` (línea 35)

**Imports (9):**
- 📦 `AgentExecutor, createReactAgent` desde `langchain/agents`
- 📦 `ChatOllama` desde `@langchain/community/chat_models/ollama`
- 📦 `PromptTemplate` desde `@langchain/core/prompts`
- 📦 `RateLimiterMemory` desde `rate-limiter-flexible`
- 📁 `tools` desde `./tools`
- 📁 `logger` desde `../utils/logger`
- 📁 `config` desde `../../config/config`
- 📁 `findInCache, addToCache` desde `./semanticCache`
- 📁 `Guardrails` desde `./guardrails`

#### 📄 clientHistorySearchEngine.js

**Ruta:** `src\services\clientHistorySearchEngine.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 26421 caracteres, 807 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (28):**
- 🔒 `constructor` (unknown, línea 21)
- 🔒 `searchClientHistory` (unknown, línea 64)
- 🔒 `if` (unknown, línea 74)
- 🔒 `catch` (unknown, línea 123)
- 🔒 `normalizeClientIdentifier` (unknown, línea 136)
- 🔒 `searchByAlternativeIdentifiers` (unknown, línea 192)
- 🔒 `for` (unknown, línea 197)
- 🔒 `generateAlternativeIdentifiers` (unknown, línea 225)
- 🔒 `formatClientHistory` (unknown, línea 262)
- 🔒 `extractClientProfile` (unknown, línea 310)
- 🔒 `groupByIntent` (unknown, línea 434)
- 🔒 `analyzeTemporalPatterns` (unknown, línea 484)
- 🔒 `searchInClientHistory` (unknown, línea 512)
- 🔒 `processSearchResults` (unknown, línea 582)
- 🔒 `removeDuplicateResults` (unknown, línea 603)
- 🔒 `calculateInteractionFrequency` (unknown, línea 618)
- 🔒 `calculateProfileConfidence` (unknown, línea 629)
- 🔒 `enrichResultsWithClientContext` (unknown, línea 647)
- 🔒 `calculateProfileRelevance` (unknown, línea 664)
- 🔒 `getAppliedFilters` (unknown, línea 680)
- 🔒 `getEmptyClientHistory` (unknown, línea 689)
- 🔒 `getCachedResult` (unknown, línea 711)
- 🔒 `cacheResult` (unknown, línea 724)
- 🔒 `generateCacheKey` (unknown, línea 737)
- 🔒 `cleanExpiredCache` (unknown, línea 746)
- 🔒 `getSearchStats` (unknown, línea 758)
- 🔒 `clearCache` (unknown, línea 783)
- 🔒 `resetMetrics` (unknown, línea 791)

**Clases (1):**
- 🔒 `ClientHistorySearchEngine` (línea 20)

**Imports (1):**
- 📁 `logger` desde `../utils/logger`

#### 📄 conversationMemory.js

**Ruta:** `src\services\conversationMemory.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 44459 caracteres, 1234 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (32):**
- 🔒 `constructor` (unknown, línea 56)
- 🔒 `generate` (unknown, línea 65)
- 🔒 `switch` (unknown, línea 73)
- 🔒 `catch` (unknown, línea 87)
- 🔒 `generateQuery` (unknown, línea 99)
- 🔒 `generateDocument` (unknown, línea 112)
- 🔒 `initialize` (unknown, línea 196)
- 🔒 `if` (unknown, línea 198)
- 🔒 `storeConversationChunk` (unknown, línea 228)
- 🔒 `for` (unknown, línea 261)
- 🔒 `searchConversationMemory` (unknown, línea 378)
- 🔒 `searchConversationMemoryFallback` (unknown, línea 485)
- 🔒 `getClientMemory` (unknown, línea 536)
- 🔒 `getClientMemoryFallback` (unknown, línea 631)
- 🔒 `storeTraditionalChunk` (unknown, línea 683)
- 🔒 `createChunkText` (unknown, línea 747)
- 🔒 `buildWhereFilter` (unknown, línea 754)
- 🔒 `classifyResponseType` (unknown, línea 783)
- 🔒 `getHourCategory` (unknown, línea 799)
- 🔒 `storeInPostgreSQL` (unknown, línea 809)
- 🔒 `ensureInitialized` (unknown, línea 847)
- 🔒 `getMemoryStats` (unknown, línea 860)
- 🔒 `calculateSystemHealth` (unknown, línea 900)
- 🔒 `getRecentChunksForDeduplication` (unknown, línea 944)
- 🔒 `searchClientHistory` (unknown, línea 984)
- 🔒 `searchInClientHistory` (unknown, línea 1006)
- 🔒 `getClientProfile` (unknown, línea 1031)
- 🔒 `findSimilarClients` (unknown, línea 1060)
- 🔒 `calculateLoyaltyScore` (unknown, línea 1101)
- 🔒 `configureSemanticChunker` (unknown, línea 1136)
- 🔒 `configureMetadataEnhancer` (unknown, línea 1148)
- 🔒 `getArchitecturalHealth` (unknown, línea 1160)

**Clases (2):**
- 🔒 `EnhancedLangChainEmbeddingAdapter` (línea 55)
- 🔒 `ConversationMemory` (línea 141)

**Imports (13):**
- 📦 `ChromaClient` desde `chromadb`
- 📁 `pool` desde `../database/pg`
- 📁 `embeddingEngine` desde `./embeddingEngine`
- 📁 `SemanticChunker` desde `./semanticChunker`
- 📁 `DeterministicSearchEngine` desde `./deterministicSearchEngine`
- 📁 `DynamicLimitOptimizer` desde `./dynamicLimitOptimizer`
- 📁 `MarkdownContextEnricher` desde `./markdownContextEnricher`
- 📁 `SimpleDeduplicationEngine` desde `./simpleDeduplicationEngine`
- 📁 `MetadataEnhancer` desde `./metadataEnhancer`
- 📁 `ClientHistorySearchEngine` desde `./clientHistorySearchEngine`
- 📁 `logger` desde `../utils/logger`
- 📦 `performance` desde `perf_hooks`
- 📦 `URL` desde `url`

#### 📄 deterministicSearchEngine.js

**Ruta:** `src\services\deterministicSearchEngine.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 28054 caracteres, 817 líneas  
**Módulo:** Sí  

**Funciones (27):**
- 🔒 `constructor` (unknown, línea 22)
- 🔒 `performStabilizedSearch` (unknown, línea 118)
- 🔒 `if` (unknown, línea 140)
- 🔒 `catch` (unknown, línea 195)
- 🔒 `performMultipleSearches` (unknown, línea 209)
- 🔒 `for` (unknown, línea 214)
- 🔒 `performSingleSearch` (unknown, línea 250)
- 🔒 `stabilizeResults` (unknown, línea 281)
- 🔒 `enrichWithMarkdownContext` (unknown, línea 384)
- 🔒 `detectQueryContext` (unknown, línea 452)
- 🔒 `generateQueryKey` (unknown, línea 492)
- 🔒 `normalizeFilters` (unknown, línea 514)
- 🔒 `getCachedResult` (unknown, línea 530)
- 🔒 `cacheResults` (unknown, línea 547)
- 🔒 `getCacheByContext` (unknown, línea 567)
- 🔒 `switch` (unknown, línea 568)
- 🔒 `cleanupCache` (unknown, línea 588)
- 🔒 `invalidatePriceCache` (unknown, línea 619)
- 🔒 `performFallbackSearch` (unknown, línea 633)
- 🔒 `containsAny` (unknown, línea 652)
- 🔒 `buildWhereFilter` (unknown, línea 656)
- 🔒 `recordMetrics` (unknown, línea 686)
- 🔒 `getDeterminismStats` (unknown, línea 711)
- 🔒 `getContextHealth` (unknown, línea 749)
- 🔒 `calculateContextHealth` (unknown, línea 766)
- 🔒 `performMaintenance` (unknown, línea 782)
- 🔒 `resetMetrics` (unknown, línea 800)

**Clases (1):**
- 🔒 `DeterministicSearchEngine` (línea 21)

**Imports (2):**
- 📦 `crypto` desde `crypto`
- 📁 `logger` desde `../utils/logger`

#### 📄 dynamicLimitOptimizer.js

**Ruta:** `src\services\dynamicLimitOptimizer.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 24223 caracteres, 713 líneas  
**Módulo:** Sí  

**Funciones (22):**
- 🔒 `constructor` (unknown, línea 21)
- 🔒 `optimizeLimits` (unknown, línea 147)
- 🔒 `catch` (unknown, línea 197)
- 🔒 `analyzeQueryComplexity` (unknown, línea 208)
- 🔒 `if` (unknown, línea 220)
- 🔒 `detectQueryContext` (unknown, línea 268)
- 🔒 `isMultiDeviceQuery` (unknown, línea 356)
- 🔒 `calculateOptimalLimits` (unknown, línea 385)
- 🔒 `applySafetyConstraints` (unknown, línea 434)
- 🔒 `determineSearchStrategy` (unknown, línea 474)
- 🔒 `estimateSearchTime` (unknown, línea 490)
- 🔒 `getComplexityWeight` (unknown, línea 516)
- 🔒 `getComplexityLevel` (unknown, línea 527)
- 🔒 `containsAny` (unknown, línea 534)
- 🔒 `getFallbackLimits` (unknown, línea 538)
- 🔒 `recordOptimization` (unknown, línea 558)
- 🔒 `updateAverage` (unknown, línea 602)
- 🔒 `getOptimizationStats` (unknown, línea 609)
- 🔒 `getContextHealth` (unknown, línea 620)
- 🔒 `calculateSystemHealth` (unknown, línea 653)
- 🔒 `performMaintenance` (unknown, línea 683)
- 🔒 `resetOldMetrics` (unknown, línea 696)

**Clases (1):**
- 🔒 `DynamicLimitOptimizer` (línea 20)

**Imports (1):**
- 📁 `logger` desde `../utils/logger`

#### Grupo 2

#### 📄 embeddingCircuitBreaker.js

**Ruta:** `src\services\embeddingCircuitBreaker.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 20380 caracteres, 650 líneas  
**Módulo:** Sí  

**Funciones (33):**
- 🔒 `constructor` (unknown, línea 21)
- 🔒 `execute` (unknown, línea 85)
- 🔒 `if` (unknown, línea 96)
- 🔒 `catch` (unknown, línea 111)
- 🔒 `canExecuteOperation` (unknown, línea 130)
- 🔒 `switch` (unknown, línea 133)
- 🔒 `canExecuteInDegradedMode` (unknown, línea 171)
- 🔒 `executeWithTimeout` (unknown, línea 204)
- 🔒 `handleBlockedOperation` (unknown, línea 227)
- 🔒 `recordSuccess` (unknown, línea 246)
- 🔒 `recordFailure` (unknown, línea 269)
- 🔒 `checkStateTransitionsOnSuccess` (unknown, línea 295)
- 🔒 `checkStateTransitionsOnFailure` (unknown, línea 315)
- 🔒 `transitionToClosed` (unknown, línea 344)
- 🔒 `transitionToOpen` (unknown, línea 351)
- 🔒 `transitionToHalfOpen` (unknown, línea 364)
- 🔒 `transitionToDegraded` (unknown, línea 372)
- 🔒 `shouldAttemptRecovery` (unknown, línea 385)
- 🔒 `shouldUseDegradedMode` (unknown, línea 391)
- 🔒 `isOperationCritical` (unknown, línea 400)
- 🔒 `initializeFallbackStrategies` (unknown, línea 426)
- 🔒 `hasFallbackStrategy` (unknown, línea 473)
- 🔒 `executeFallback` (unknown, línea 479)
- 🔒 `getTimeoutForContext` (unknown, línea 511)
- 🔒 `generateOperationId` (unknown, línea 525)
- 🔒 `recordOperationAttempt` (unknown, línea 529)
- 🔒 `addToHistory` (unknown, línea 536)
- 🔒 `resetMetrics` (unknown, línea 545)
- 🔒 `notifyStateChange` (unknown, línea 551)
- 🔒 `getStatus` (unknown, línea 573)
- 🔒 `calculateHealthScore` (unknown, línea 612)
- 🔒 `getOperationHistory` (unknown, línea 632)
- 🔒 `reset` (unknown, línea 636)

**Clases (1):**
- 🔒 `EmbeddingCircuitBreaker` (línea 20)

**Imports (1):**
- 📁 `logger` desde `../utils/logger`

#### 📄 embeddingEngine.js

**Ruta:** `src\services\embeddingEngine.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 2070 caracteres, 51 líneas  
**Módulo:** Sí  

**Funciones (3):**
- 🔒 `getEmbeddingEngine` (function, línea 16)
- 🔒 `if` (unknown, línea 17)
- 🔒 `catch` (unknown, línea 36)

**Imports (3):**
- 📦 `OllamaEmbeddings` desde `@langchain/community/embeddings/ollama`
- 📁 `logger` desde `../utils/logger`
- 📁 `retryHandler` desde `../utils/resilience`

#### 📄 guardrails.js

**Ruta:** `src\services\guardrails.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 6035 caracteres, 180 líneas  
**Módulo:** Sí  

**Funciones (10):**
- 🔒 `constructor` (unknown, línea 11)
- 🔒 `processResponse` (unknown, línea 32)
- 🔒 `for` (unknown, línea 36)
- 🔒 `if` (unknown, línea 38)
- 🔒 `checkNoPromises` (unknown, línea 65)
- 🔒 `checkNoToxicity` (unknown, línea 83)
- 🔒 `checkNoOffTopic` (unknown, línea 102)
- 🔒 `checkNoPersonalOpinions` (unknown, línea 126)
- 🔒 `checkNoSensitiveInfoRequest` (unknown, línea 146)
- 🔒 `checkResponseLength` (unknown, línea 166)

**Clases (1):**
- 🔒 `Guardrails` (línea 10)

**Imports (2):**
- 📁 `logger` desde `../utils/logger`
- 📁 `config` desde `../utils/config`

#### 📄 hallucinationDetector.js

**Ruta:** `src\services\hallucinationDetector.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 1336 caracteres, 38 líneas  
**Módulo:** Sí  

**Funciones (1):**
- 🔒 `detectHallucination` (function, línea 13)

**Imports (1):**
- 📁 `responseValidatorPipeline` desde `../utils/validators`

#### 📄 markdownContextEnricher.js

**Ruta:** `src\services\markdownContextEnricher.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 20345 caracteres, 637 líneas  
**Módulo:** Sí  

**Funciones (25):**
- 🔒 `constructor` (unknown, línea 23)
- 🔒 `initializeCache` (unknown, línea 123)
- 🔒 `if` (unknown, línea 127)
- 🔒 `catch` (unknown, línea 133)
- 🔒 `refreshMarkdownCache` (unknown, línea 142)
- 🔒 `for` (unknown, línea 163)
- 🔒 `extractBrandFromFilename` (unknown, línea 201)
- 🔒 `parseMarkdownContent` (unknown, línea 213)
- 🔒 `extractPriceRanges` (unknown, línea 246)
- 🔒 `extractServiceTypes` (unknown, línea 265)
- 🔒 `extractMetadata` (unknown, línea 290)
- 🔒 `parseTableModels` (unknown, línea 328)
- 🔒 `parsePrice` (unknown, línea 361)
- 🔒 `buildGlobalMetadata` (unknown, línea 371)
- 🔒 `enrichSearchResults` (unknown, línea 407)
- 🔒 `detectEnrichmentType` (unknown, línea 448)
- 🔒 `extractBrandsFromQuery` (unknown, línea 464)
- 🔒 `buildEnrichmentForResult` (unknown, línea 483)
- 🔒 `switch` (unknown, línea 500)
- 🔒 `getRelevantGlobalInfo` (unknown, línea 571)
- 🔒 `getBrandInfo` (unknown, línea 603)
- 🔒 `getGlobalMetadata` (unknown, línea 607)
- 🔒 `getStandardInfo` (unknown, línea 611)
- 🔒 `getCacheStats` (unknown, línea 615)
- 🔒 `forceRefresh` (unknown, línea 628)

**Clases (1):**
- 🔒 `MarkdownContextEnricher` (línea 22)

**Imports (3):**
- 📦 `fs` desde `fs`
- 📦 `path` desde `path`
- 📁 `logger` desde `../utils/logger`

#### Grupo 3

#### 📄 markdownMetadataExtractor.js

**Ruta:** `src\services\markdownMetadataExtractor.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 18652 caracteres, 606 líneas  
**Módulo:** Sí  

**Funciones (21):**
- 🔒 `constructor` (unknown, línea 23)
- 🔒 `if` (unknown, línea 91)
- 🔒 `initializeCache` (unknown, línea 100)
- 🔒 `catch` (unknown, línea 112)
- 🔒 `refreshCache` (unknown, línea 121)
- 🔒 `for` (unknown, línea 138)
- 🔒 `extractMetadataFromFile` (unknown, línea 174)
- 🔒 `extractBasicInfoFromContent` (unknown, línea 208)
- 🔒 `extractBrandFromFilename` (unknown, línea 265)
- 🔒 `getDeviceInfo` (unknown, línea 280)
- 🔒 `getGlobalInfo` (unknown, línea 347)
- 🔒 `getBrandInfo` (unknown, línea 360)
- 🔒 `getAllBrands` (unknown, línea 388)
- 🔒 `getGlobalStats` (unknown, línea 402)
- 🔒 `searchInMetadata` (unknown, línea 426)
- 🔒 `ensureCacheValid` (unknown, línea 476)
- 🔒 `getTotalModelsCount` (unknown, línea 490)
- 🔒 `getCacheStats` (unknown, línea 503)
- 🔒 `forceRefresh` (unknown, línea 522)
- 🔒 `clearCache` (unknown, línea 531)
- 🔒 `healthCheck` (unknown, línea 547)

**Clases (1):**
- 🔒 `MarkdownMetadataExtractor` (línea 22)

**Imports (4):**
- 📦 `fs` desde `fs`
- 📦 `path` desde `path`
- 📦 `yaml` desde `js-yaml`
- 📁 `logger` desde `../utils/logger`

#### 📄 metadataEnhancer.js

**Ruta:** `src\services\metadataEnhancer.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 23166 caracteres, 703 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (27):**
- 🔒 `constructor` (unknown, línea 21)
- 🔒 `if` (unknown, línea 37)
- 🔒 `enhanceMetadata` (unknown, línea 135)
- 🔒 `catch` (unknown, línea 182)
- 🔒 `cleanRawMetadata` (unknown, línea 193)
- 🔒 `validateMetadata` (unknown, línea 220)
- 🔒 `validateField` (unknown, línea 266)
- 🔒 `enrichWithMarkdownData` (unknown, línea 306)
- 🔒 `applyAutoEnrichment` (unknown, línea 354)
- 🔒 `finalizeMetadata` (unknown, línea 387)
- 🔒 `isValidType` (unknown, línea 404)
- 🔒 `switch` (unknown, línea 407)
- 🔒 `isChromaCompatibleType` (unknown, línea 419)
- 🔒 `attemptTypeConversion` (unknown, línea 424)
- 🔒 `mapToValidEnum` (unknown, línea 463)
- 🔒 `for` (unknown, línea 500)
- 🔒 `normalizeFieldName` (unknown, línea 515)
- 🔒 `normalizeClientId` (unknown, línea 532)
- 🔒 `normalizeTimestamp` (unknown, línea 550)
- 🔒 `normalizeIntent` (unknown, línea 565)
- 🔒 `cleanFieldValue` (unknown, línea 579)
- 🔒 `calculateConfidenceScore` (unknown, línea 599)
- 🔒 `mapServiceType` (unknown, línea 611)
- 🔒 `extractDeviceBrand` (unknown, línea 626)
- 🔒 `createFallbackMetadata` (unknown, línea 650)
- 🔒 `getEnhancementStats` (unknown, línea 667)
- 🔒 `resetMetrics` (unknown, línea 687)

**Clases (1):**
- 🔒 `MetadataEnhancer` (línea 20)

**Imports (2):**
- 📁 `MarkdownMetadataExtractor` desde `./markdownMetadataExtractor`
- 📁 `logger` desde `../utils/logger`

#### 📄 priceExtractionSystem.js

**Ruta:** `src\services\priceExtractionSystem.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 12791 caracteres, 323 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (12):**
- 🔒 `constructor` (unknown, línea 40)
- 🔒 `extractWithLLM` (unknown, línea 48)
- 🔒 `catch` (unknown, línea 57)
- 🔒 `extractPrice` (unknown, línea 63)
- 🔒 `if` (unknown, línea 71)
- 🔒 `for` (unknown, línea 86)
- 🔒 `exactDatabaseMatch` (unknown, línea 149)
- 🔒 `fuzzyDatabaseMatch` (unknown, línea 176)
- 🔒 `fallbackSearch` (unknown, línea 245)
- 🔒 `normalizeQuery` (unknown, línea 284)
- 🔒 `getStrategyName` (unknown, línea 292)
- 🔒 `validateResult` (unknown, línea 301)

**Clases (1):**
- 🔒 `PriceExtractionSystem` (línea 39)

**Imports (8):**
- 📁 `pool` desde `../database/pg`
- 📦 `ChromaClient` desde `chromadb`
- 📁 `getEmbeddingEngine` desde `./embeddingEngine`
- 📁 `KnowledgeCoherenceLayer` desde `./knowledge/KnowledgeCoherenceLayer`
- 📁 `logger` desde `../utils/logger`
- 📦 `ChatOllama` desde `@langchain/community/chat_models/ollama`
- 📦 `JsonOutputParser` desde `@langchain/core/output_parsers`
- 📁 `config` desde `../../config/config`

#### 📄 semanticCache.js

**Ruta:** `src\services\semanticCache.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 9660 caracteres, 269 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (9):**
- 🔒 `initializeCache` (function, línea 42)
- 🔒 `findInCache` (function, línea 80)
- 🔒 `addToCache` (function, línea 160)
- 🔒 `invalidateCache` (function, línea 201)
- 🔒 `constructor` (unknown, línea 18)
- 🔒 `generate` (unknown, línea 22)
- 🔒 `if` (unknown, línea 46)
- 🔒 `catch` (unknown, línea 64)
- 🔒 `for` (unknown, línea 220)

**Clases (1):**
- 🔒 `LangChainEmbeddingAdapter` (línea 17)

**Imports (4):**
- 📦 `ChromaClient` desde `chromadb`
- 📁 `getEmbeddingEngine` desde `./embeddingEngine`
- 📁 `logger` desde `../utils/logger`
- 📁 `retryHandler` desde `../utils/resilience`

#### 📄 semanticChunker.js

**Ruta:** `src\services\semanticChunker.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 27097 caracteres, 805 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (27):**
- 🔒 `constructor` (unknown, línea 21)
- 🔒 `createSemanticChunks` (unknown, línea 88)
- 🔒 `catch` (unknown, línea 131)
- 🔒 `createSlidingWindowChunks` (unknown, línea 155)
- 🔒 `if` (unknown, línea 161)
- 🔒 `for` (unknown, línea 173)
- 🔒 `createContextualChunk` (unknown, línea 213)
- 🔒 `extractMarkdownContext` (unknown, línea 289)
- 🔒 `buildEnhancedMetadata` (unknown, línea 342)
- 🔒 `analyzeConversationFlow` (unknown, línea 396)
- 🔒 `calculateSemanticDensity` (unknown, línea 435)
- 🔒 `determineFlowStage` (unknown, línea 483)
- 🔒 `calculateContinuityScore` (unknown, línea 501)
- 🔒 `areRelatedIntents` (unknown, línea 555)
- 🔒 `extractMarkdownKeywords` (unknown, línea 575)
- 🔒 `createConversationEntry` (unknown, línea 586)
- 🔒 `updateConversationBuffer` (unknown, línea 603)
- 🔒 `getClientConversations` (unknown, línea 619)
- 🔒 `getWindowConfig` (unknown, línea 623)
- 🔒 `createFallbackChunk` (unknown, línea 638)
- 🔒 `truncateChunk` (unknown, línea 662)
- 🔒 `containsAny` (unknown, línea 676)
- 🔒 `classifyResponseType` (unknown, línea 683)
- 🔒 `getHourCategory` (unknown, línea 696)
- 🔒 `getChunkerStats` (unknown, línea 708)
- 🔒 `detectPattern` (unknown, línea 747)
- 🔒 `matchesPattern` (unknown, línea 783)

**Clases (2):**
- 🔒 `SemanticChunker` (línea 20)
- 🔒 `ConversationPatternAnalyzer` (línea 729)

**Imports (2):**
- 📁 `logger` desde `../utils/logger`
- 📁 `embeddingEngine` desde `./embeddingEngine`

#### Grupo 4

#### 📄 semanticRouter.js

**Ruta:** `src\services\semanticRouter.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 8313 caracteres, 254 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (6):**
- 🔒 `classifyIntent` (function, línea 48)
- 🔒 `determineIntentByKeywords` (function, línea 134)
- 🔒 `constructor` (unknown, línea 19)
- 🔒 `generate` (unknown, línea 23)
- 🔒 `catch` (unknown, línea 30)
- 🔒 `if` (unknown, línea 53)

**Clases (1):**
- 🔒 `LangChainEmbeddingAdapter` (línea 18)

**Imports (3):**
- 📦 `ChromaClient` desde `chromadb`
- 📁 `embeddingEngine` desde `./embeddingEngine`
- 📁 `logger` desde `../utils/logger`

#### 📄 serviceRegistry.js

**Ruta:** `src\services\serviceRegistry.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 2176 caracteres, 64 líneas  
**Módulo:** Sí  

**Funciones (4):**
- 🔒 `registerService` (function, línea 18)
- 🔒 `restartService` (function, línea 30)
- 🔒 `if` (function, línea 36)
- 🔒 `catch` (unknown, línea 44)

**Imports (1):**
- 📁 `logger` desde `../utils/logger`

#### 📄 simpleAgentExecutor.js

**Ruta:** `src\services\simpleAgentExecutor.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 5527 caracteres, 150 líneas  
**Módulo:** Sí  

**Funciones (5):**
- 🔒 `constructor` (unknown, línea 14)
- 🔒 `execute` (unknown, línea 52)
- 🔒 `if` (unknown, línea 61)
- 🔒 `catch` (unknown, línea 82)
- 🔒 `executeWithLLM` (unknown, línea 129)

**Clases (2):**
- 🔒 `OllamaError` ← Error (línea 13)
- 🔒 `SimpleAgentExecutor` (línea 20)

**Imports (7):**
- 📦 `ChatOllama` desde `@langchain/community/chat_models/ollama`
- 📦 `RateLimiterMemory` desde `rate-limiter-flexible`
- 📁 `tools` desde `./tools`
- 📁 `logger` desde `../utils/logger`
- 📁 `config` desde `../../config/config`
- 📁 `findInCache, addToCache` desde `./semanticCache`
- 📁 `Guardrails` desde `./guardrails`

#### 📄 simpleDeduplicationEngine.js

**Ruta:** `src\services\simpleDeduplicationEngine.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 23338 caracteres, 714 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (28):**
- 🔒 `constructor` (unknown, línea 22)
- 🔒 `checkForDuplicates` (unknown, línea 84)
- 🔒 `catch` (unknown, línea 128)
- 🔒 `classifyInformationType` (unknown, línea 144)
- 🔒 `findDuplicatesWithContext` (unknown, línea 202)
- 🔒 `for` (unknown, línea 217)
- 🔒 `if` (unknown, línea 227)
- 🔒 `calculateContextualSimilarity` (unknown, línea 258)
- 🔒 `calculateJaccardSimilarity` (unknown, línea 312)
- 🔒 `calculateMetadataSimilarity` (unknown, línea 328)
- 🔒 `switch` (unknown, línea 339)
- 🔒 `calculateMarkdownContextSimilarity` (unknown, línea 382)
- 🔒 `makeConservativeDecision` (unknown, línea 441)
- 🔒 `isPriorityType` (unknown, línea 492)
- 🔒 `getThresholdForType` (unknown, línea 496)
- 🔒 `getWeightsForType` (unknown, línea 502)
- 🔒 `containsPatterns` (unknown, línea 514)
- 🔒 `tokenizeText` (unknown, línea 521)
- 🔒 `hashText` (unknown, línea 529)
- 🔒 `calculateDeviceSimilarity` (unknown, línea 539)
- 🔒 `getDuplicateReason` (unknown, línea 553)
- 🔒 `getRelevantMarkdownContext` (unknown, línea 560)
- 🔒 `recordMetrics` (unknown, línea 588)
- 🔒 `recordPreservation` (unknown, línea 623)
- 🔒 `getDeduplicationStats` (unknown, línea 628)
- 🔒 `calculateSystemHealth` (unknown, línea 650)
- 🔒 `performMaintenance` (unknown, línea 686)
- 🔒 `resetDailyMetrics` (unknown, línea 704)

**Clases (1):**
- 🔒 `SimpleDeduplicationEngine` (línea 21)

**Imports (2):**
- 📁 `MarkdownContextEnricher` desde `./markdownContextEnricher`
- 📁 `logger` desde `../utils/logger`

#### 📄 tools.js

**Ruta:** `src\services\tools.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 41692 caracteres, 1089 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (19):**
- 🔒 `validateArguments` (function, línea 22)
- 🔒 `determineKnowledgeContext` (function, línea 689)
- 🔒 `getArchitecturalHealth` (function, línea 1021)
- 🔒 `for` (unknown, línea 29)
- 🔒 `if` (unknown, línea 40)
- 🔒 `constructor` (unknown, línea 63)
- 🔒 `generate` (unknown, línea 72)
- 🔒 `switch` (unknown, línea 80)
- 🔒 `catch` (unknown, línea 94)
- 🔒 `generateQuery` (unknown, línea 106)
- 🔒 `generateDocument` (unknown, línea 119)
- 🔒 `validatePriceConsistency` (unknown, línea 161)
- 🔒 `extractDeviceInfo` (unknown, línea 253)
- 🔒 `extractPrices` (unknown, línea 291)
- 🔒 `comparePrices` (unknown, línea 318)
- 🔒 `calculatePriceVariance` (unknown, línea 369)
- 🔒 `validateProductAvailability` (unknown, línea 382)
- 🔒 `clearCache` (unknown, línea 425)
- 🔒 `getValidationStats` (unknown, línea 433)

**Clases (2):**
- 🔒 `EnhancedLangChainEmbeddingAdapter` (línea 62)
- 🔒 `CrossSourceValidator` (línea 148)

**Imports (11):**
- 📦 `DynamicTool` desde `langchain/tools`
- 📦 `ChromaClient` desde `chromadb`
- 📁 `embeddingEngine` desde `./embeddingEngine`
- 📁 `pool` desde `../database/pg`
- 📁 `priceExtractionSystem` desde `./priceExtractionSystem`
- 📁 `conversationMemory` desde `./conversationMemory`
- 📁 `DeterministicSearchEngine` desde `./deterministicSearchEngine`
- 📁 `DynamicLimitOptimizer` desde `./dynamicLimitOptimizer`
- 📁 `MarkdownContextEnricher` desde `./markdownContextEnricher`
- 📁 `logger` desde `../utils/logger`
- 📦 `performance` desde `perf_hooks`

#### Grupo 5

#### 📄 validatedEmbeddingEngine.js

**Ruta:** `src\services\validatedEmbeddingEngine.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 29627 caracteres, 872 líneas  
**Módulo:** Sí  

**Funciones (27):**
- 🔒 `constructor` (unknown, línea 22)
- 🔒 `initializeDimensions` (unknown, línea 91)
- 🔒 `catch` (unknown, línea 115)
- 🔒 `embedDocument` (unknown, línea 125)
- 🔒 `if` (unknown, línea 142)
- 🔒 `embedQuery` (unknown, línea 188)
- 🔒 `embedDocuments` (unknown, línea 255)
- 🔒 `for` (unknown, línea 266)
- 🔒 `validateEmbedding` (unknown, línea 342)
- 🔒 `detectSalvaCellContext` (unknown, línea 455)
- 🔒 `validateMarkdownEmbedding` (unknown, línea 501)
- 🔒 `calculateEmbeddingQuality` (unknown, línea 558)
- 🔒 `attemptRecovery` (unknown, línea 592)
- 🔒 `containsAny` (unknown, línea 675)
- 🔒 `checkTimeConsistency` (unknown, línea 679)
- 🔒 `checkWarrantyConsistency` (unknown, línea 686)
- 🔒 `checkPriceConsistency` (unknown, línea 692)
- 🔒 `checkContextConsistency` (unknown, línea 698)
- 🔒 `checkSalvaCellRelevance` (unknown, línea 703)
- 🔒 `calculateVariance` (unknown, línea 720)
- 🔒 `cleanTextForEmbedding` (unknown, línea 728)
- 🔒 `recordValidation` (unknown, línea 740)
- 🔒 `checkAlertThresholds` (unknown, línea 766)
- 🔒 `triggerAlert` (unknown, línea 796)
- 🔒 `ensureDimensionsInitialized` (unknown, línea 813)
- 🔒 `getValidationStats` (unknown, línea 825)
- 🔒 `resetStats` (unknown, línea 854)

**Clases (1):**
- 🔒 `ValidatedEmbeddingEngine` ← EnhancedEmbeddingEngine (línea 21)

**Imports (2):**
- 📁 `logger` desde `../utils/logger`
- 📁 `EnhancedEmbeddingEngine` desde `./embeddingEngine`


---

### 📁 src\services\classifiers

**Archivos:** 1  
**Tecnologías:** WhatsApp Web API

#### 📄 qwenClassifier.js

**Ruta:** `src\services\classifiers\qwenClassifier.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 4416 caracteres, 122 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (6):**
- 🔒 `constructor` (unknown, línea 12)
- 🔒 `classify` (unknown, línea 23)
- 🔒 `if` (unknown, línea 43)
- 🔒 `catch` (unknown, línea 48)
- 🔒 `buildClassificationPrompt` (unknown, línea 59)
- 🔒 `parseResponse` (unknown, línea 90)

**Clases (1):**
- 🔒 `QwenClassifier` (línea 11)

**Imports (3):**
- 📁 `QwenLocalClient` desde `../../utils/qwenLocal`
- 📁 `logger` desde `../../utils/logger`
- 📁 `intentions` desde `../../../intentions_dataset.json`


---

### 📁 src\services\eventSourcing

**Archivos:** 1

#### 📄 EventStore.js

**Ruta:** `src\services\eventSourcing\EventStore.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 3047 caracteres, 114 líneas  
**Módulo:** Sí  

**Funciones (8):**
- 🔒 `constructor` (unknown, línea 17)
- 🔒 `appendEvent` (unknown, línea 32)
- 🔒 `getAllEvents` (unknown, línea 50)
- 🔒 `getEventsByType` (unknown, línea 59)
- 🔒 `_persistEvent` (unknown, línea 67)
- 🔒 `_loadEvents` (unknown, línea 75)
- 🔒 `_enforceRetention` (unknown, línea 96)
- 🔒 `if` (unknown, línea 97)

**Clases (1):**
- 🔒 `EventStore` ← EventEmitter (línea 16)

**Imports (4):**
- 📦 `fs` desde `fs`
- 📦 `path` desde `path`
- 📦 `v4: uuidv4` desde `uuid`
- 📦 `EventEmitter` desde `events`


---

### 📁 src\services\knowledge

**Archivos:** 2  
**Tecnologías:** WhatsApp Web API

#### 📄 KnowledgeCoherenceLayer.js

**Ruta:** `src\services\knowledge\KnowledgeCoherenceLayer.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 47222 caracteres, 1487 líneas  
**Módulo:** Sí  

**Funciones (61):**
- 🔒 `constructor` (unknown, línea 21)
- 🔒 `setupCoherenceMonitoring` (unknown, línea 87)
- 🔒 `if` (unknown, línea 89)
- 🔒 `catch` (unknown, línea 93)
- 🔒 `searchWithValidation` (unknown, línea 118)
- 🔒 `validateSearchResults` (unknown, línea 200)
- 🔒 `validateDataFreshness` (unknown, línea 290)
- 🔒 `validateSemanticConsistency` (unknown, línea 347)
- 🔒 `for` (unknown, línea 356)
- 🔒 `validateBusinessLogic` (unknown, línea 409)
- 🔒 `performContinuousValidation` (unknown, línea 475)
- 🔒 `performHealthCheck` (unknown, línea 540)
- 🔒 `calculateValidationScore` (unknown, línea 604)
- 🔒 `detectValidationConflicts` (unknown, línea 625)
- 🔒 `getIssueSeverity` (unknown, línea 645)
- 🔒 `calculateSemanticRelevance` (unknown, línea 651)
- 🔒 `detectSemanticContradictions` (unknown, línea 673)
- 🔒 `validatePriceRange` (unknown, línea 719)
- 🔒 `getBusinessHours` (unknown, línea 738)
- 🔒 `isWithinBusinessHours` (unknown, línea 747)
- 🔒 `getRecentSearchSamples` (unknown, línea 752)
- 🔒 `calculateSearchCoherenceScore` (unknown, línea 758)
- 🔒 `handleSearchConflicts` (unknown, línea 766)
- 🔒 `checkPostgreSQLFreshness` (unknown, línea 791)
- 🔒 `checkChromaDBFreshness` (unknown, línea 823)
- 🔒 `checkPostgreSQLHealth` (unknown, línea 832)
- 🔒 `checkChromaDBHealth` (unknown, línea 856)
- 🔒 `checkEmbeddingEngineHealth` (unknown, línea 873)
- 🔒 `checkCrossValidationHealth` (unknown, línea 890)
- 🔒 `initiateAutoRecovery` (unknown, línea 915)
- 🔒 `getCoherenceMetrics` (unknown, línea 920)
- 🔒 `handleConflictDetected` (unknown, línea 930)
- 🔒 `handleCoherenceDegraded` (unknown, línea 943)
- 🔒 `handleValidationCompleted` (unknown, línea 955)
- 🔒 `updateCoherenceHistory` (unknown, línea 959)
- 🔒 `searchPrices` (unknown, línea 973)
- 🔒 `semanticSearch` (unknown, línea 1009)
- 🔒 `findRelatedContext` (unknown, línea 1025)
- 🔒 `fuseMultiSourceResults` (unknown, línea 1041)
- 🔒 `calculateScore` (unknown, línea 1067)
- 🔒 `calculateSourceConsistency` (unknown, línea 1081)
- 🔒 `calculateCompleteness` (unknown, línea 1085)
- 🔒 `calculateContextualRelevance` (unknown, línea 1089)
- 🔒 `get` (unknown, línea 1100)
- 🔒 `set` (unknown, línea 1112)
- 🔒 `validate` (unknown, línea 1121)
- 🔒 `initializeValidationRules` (unknown, línea 1135)
- 🔒 `findMatchingResult` (unknown, línea 1210)
- 🔒 `calculateSimilarity` (unknown, línea 1223)
- 🔒 `stringSimilarity` (unknown, línea 1238)
- 🔒 `levenshteinDistance` (unknown, línea 1246)
- 🔒 `healthCheck` (unknown, línea 1266)
- 🔒 `recordHealthScore` (unknown, línea 1296)
- 🔒 `checkHealthAlerts` (unknown, línea 1312)
- 🔒 `getHealthTrend` (unknown, línea 1320)
- 🔒 `initializeStrategies` (unknown, línea 1353)
- 🔒 `resolve` (unknown, línea 1377)
- 🔒 `calculateOverallScore` (unknown, línea 1417)
- 🔒 `getHealthStatus` (unknown, línea 1429)
- 🔒 `generateHealthReport` (unknown, línea 1437)
- 🔒 `generateRecommendations` (unknown, línea 1447)

**Clases (11):**
- 🔒 `KnowledgeCoherenceLayer` ← EventEmitter (línea 20)
- 🔒 `PostgreSQLConnector` (línea 972)
- 🔒 `ChromaDBConnector` (línea 1008)
- 🔒 `CoherenceEngine` (línea 1040)
- 🔒 `IntelligentCaching` (línea 1094)
- 🔒 `ConsistencyValidator` (línea 1120)
- 🔒 `RealTimeCrossValidator` (línea 1129)
- 🔒 `CoherenceHealthMonitor` ← EventEmitter (línea 1286)
- 🔒 `AutomaticConflictResolver` (línea 1347)
- 🔒 `HealthScoringEngine` (línea 1407)
- 🔒 `CoherenceLayerError` ← Error (línea 1466)

**Imports (5):**
- 📁 `logger` desde `../../utils/logger`
- 📁 `pool` desde `../../database/pg`
- 📁 `embeddingEngine` desde `../embeddingEngine`
- 📦 `v4: uuidv4` desde `uuid`
- 📦 `EventEmitter` desde `events`

#### 📄 TemporalConsistencyEngine.js

**Ruta:** `src\services\knowledge\TemporalConsistencyEngine.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 68070 caracteres, 2211 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (110):**
- 🔒 `constructor` (unknown, línea 22)
- 🔒 `setupEventHandlers` (unknown, línea 88)
- 🔒 `startMonitoring` (unknown, línea 125)
- 🔒 `if` (unknown, línea 126)
- 🔒 `stopMonitoring` (unknown, línea 155)
- 🔒 `performProactiveCheck` (unknown, línea 176)
- 🔒 `catch` (unknown, línea 220)
- 🔒 `processCheckResults` (unknown, línea 238)
- 🔒 `handleDataChangeEvent` (unknown, línea 284)
- 🔒 `handleSemanticDriftEvent` (unknown, línea 298)
- 🔒 `handleConflictEvent` (unknown, línea 316)
- 🔒 `handleCoherenceDegradationEvent` (unknown, línea 340)
- 🔒 `handleRecoveryEvent` (unknown, línea 358)
- 🔒 `calculateCurrentCoherenceScore` (unknown, línea 384)
- 🔒 `calculateVectorSpaceCoherence` (unknown, línea 437)
- 🔒 `calculateRelationalCoherence` (unknown, línea 460)
- 🔒 `calculateConversationalCoherence` (unknown, línea 482)
- 🔒 `calculateTemporalCoherence` (unknown, línea 506)
- 🔒 `updateCoherenceHistory` (unknown, línea 523)
- 🔒 `calculateAverageCoherence` (unknown, línea 539)
- 🔒 `analyzeCoherenceTrend` (unknown, línea 554)
- 🔒 `shouldTriggerRecovery` (unknown, línea 579)
- 🔒 `getRecoveryTriggers` (unknown, línea 603)
- 🔒 `calculateRecoveryUrgency` (unknown, línea 628)
- 🔒 `performHealthCheck` (unknown, línea 644)
- 🔒 `getEnhancedMetrics` (unknown, línea 680)
- 🔒 `orchestrateKnowledgeEvolution` (unknown, línea 703)
- 🔒 `detectSemanticDrift` (unknown, línea 738)
- 🔒 `analyzeEvolutionRequirements` (unknown, línea 760)
- 🔒 `captureKnowledgeSnapshot` (unknown, línea 783)
- 🔒 `captureOperationalReality` (unknown, línea 805)
- 🔒 `executeMigrationStrategy` (unknown, línea 826)
- 🔒 `switch` (unknown, línea 834)
- 🔒 `executeIncrementalMigration` (unknown, línea 857)
- 🔒 `for` (unknown, línea 861)
- 🔒 `analyzeChangeScope` (unknown, línea 906)
- 🔒 `identifyAffectedComponents` (unknown, línea 915)
- 🔒 `calculateMigrationComplexity` (unknown, línea 924)
- 🔒 `assessEvolutionRisks` (unknown, línea 935)
- 🔒 `determineEvolutionStrategy` (unknown, línea 945)
- 🔒 `estimateMigrationDuration` (unknown, línea 974)
- 🔒 `createRollbackPlan` (unknown, línea 986)
- 🔒 `captureVectorSpaceState` (unknown, línea 995)
- 🔒 `captureRelationalDataState` (unknown, línea 1013)
- 🔒 `captureConversationalMemoryState` (unknown, línea 1029)
- 🔒 `captureSystemConfiguration` (unknown, línea 1049)
- 🔒 `generateCoherenceHash` (unknown, línea 1061)
- 🔒 `extractCurrentPricing` (unknown, línea 1067)
- 🔒 `extractServiceOfferings` (unknown, línea 1084)
- 🔒 `extractOperationalPolicies` (unknown, línea 1100)
- 🔒 `extractPerformanceMetrics` (unknown, línea 1109)
- 🔒 `extractUsagePatterns` (unknown, línea 1118)
- 🔒 `extractConversationQuality` (unknown, línea 1137)
- 🔒 `extractErrorPatterns` (unknown, línea 1155)
- 🔒 `createMigrationPhases` (unknown, línea 1164)
- 🔒 `createMigrationCheckpoint` (unknown, línea 1191)
- 🔒 `executeMigrationPhase` (unknown, línea 1203)
- 🔒 `validatePhaseCoherence` (unknown, línea 1217)
- 🔒 `rollbackToCheckpoint` (unknown, línea 1227)
- 🔒 `triggerDriftMitigation` (unknown, línea 1236)
- 🔒 `analyzeSystemicImpact` (unknown, línea 1249)
- 🔒 `validatePreMigrationCoherence` (unknown, línea 1258)
- 🔒 `validatePostMigrationCoherence` (unknown, línea 1267)
- 🔒 `triggerAutomaticRollback` (unknown, línea 1277)
- 🔒 `executeBlueGreenMigration` (unknown, línea 1286)
- 🔒 `executeShadowMigration` (unknown, línea 1294)
- 🔒 `sleep` (unknown, línea 1302)
- 🔒 `getSystemHealth` (unknown, línea 1309)
- 🔒 `calculateCoherenceScore` (unknown, línea 1324)
- 🔒 `performMaintenanceCheck` (unknown, línea 1341)
- 🔒 `generateMaintenanceRecommendations` (unknown, línea 1365)
- 🔒 `analyze` (unknown, línea 1396)
- 🔒 `analyzeDriftDimensions` (unknown, línea 1421)
- 🔒 `analyzeSemanticDrift` (unknown, línea 1430)
- 🔒 `analyzeOperationalDrift` (unknown, línea 1440)
- 🔒 `analyzeBehavioralDrift` (unknown, línea 1450)
- 🔒 `analyzePerformanceDrift` (unknown, línea 1460)
- 🔒 `calculateAggregatedSeverity` (unknown, línea 1470)
- 🔒 `generateDriftRecommendations` (unknown, línea 1480)
- 🔒 `storeSnapshot` (unknown, línea 1505)
- 🔒 `generateVersionId` (unknown, línea 1520)
- 🔒 `getVersion` (unknown, línea 1524)
- 🔒 `listVersions` (unknown, línea 1528)
- 🔒 `detectChanges` (unknown, línea 1534)
- 🔒 `validate` (unknown, línea 1544)
- 🔒 `orchestrateMigration` (unknown, línea 1554)
- 🔒 `calculateDistribution` (unknown, línea 1565)
- 🔒 `quantify` (unknown, línea 1581)
- 🔒 `emit` (unknown, línea 1619)
- 🔒 `cleanupOldEvents` (unknown, línea 1637)
- 🔒 `getEventHistory` (unknown, línea 1642)
- 🔒 `isHealthy` (unknown, línea 1650)
- 🔒 `getMetrics` (unknown, línea 1654)
- 🔒 `validateSources` (unknown, línea 1679)
- 🔒 `validatePostgreSQL` (unknown, línea 1755)
- 🔒 `validateChromaDB` (unknown, línea 1791)
- 🔒 `performCrossValidation` (unknown, línea 1811)
- 🔒 `calculateConflictSeverity` (unknown, línea 1863)
- 🔒 `healthCheck` (unknown, línea 1874)
- 🔒 `registerDefaultStrategies` (unknown, línea 1897)
- 🔒 `resolve` (unknown, línea 1929)
- 🔒 `start` (unknown, línea 2037)
- 🔒 `stop` (unknown, línea 2052)
- 🔒 `performWatchCycle` (unknown, línea 2067)
- 🔒 `watchDatabaseChanges` (unknown, línea 2082)
- 🔒 `watchConfigurationChanges` (unknown, línea 2104)
- 🔒 `watchSystemMetrics` (unknown, línea 2126)
- 🔒 `captureDbState` (unknown, línea 2153)
- 🔒 `hasSignificantChange` (unknown, línea 2174)
- 🔒 `getWatchedEntities` (unknown, línea 2192)

**Clases (14):**
- 🔒 `TemporalConsistencyEngine` ← EventEmitter (línea 21)
- 🔒 `SemanticDriftDetector` (línea 1389)
- 🔒 `KnowledgeVersionControl` (línea 1500)
- 🔒 `ChangeDetectionEngine` (línea 1533)
- 🔒 `ConsistencyValidator` (línea 1543)
- 🔒 `MigrationOrchestrator` (línea 1553)
- 🔒 `EmbeddingComparator` (línea 1564)
- 🔒 `ContextualAnalyzer` (línea 1571)
- 🔒 `DriftQuantifier` (línea 1580)
- 🔒 `MigrationPhaseError` ← Error (línea 1590)
- 🔒 `TemporalEventBus` ← EventEmitter (línea 1606)
- 🔒 `CrossSourceValidator` (línea 1672)
- 🔒 `ConflictResolver` (línea 1887)
- 🔒 `TemporalWatcher` (línea 2029)

**Imports (6):**
- 📁 `logger` desde `../../utils/logger`
- 📁 `embeddingEngine` desde `../embeddingEngine`
- 📁 `pool` desde `../../database/pg`
- 📦 `v4: uuidv4` desde `uuid`
- 📦 `EventEmitter` desde `events`
- 📦 `crypto` desde `crypto`


---

### 📁 src\services\resilience

**Archivos:** 1  
**Tecnologías:** WhatsApp Web API

#### 📄 ResilienceManager.js

**Ruta:** `src\services\resilience\ResilienceManager.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 21349 caracteres, 686 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (34):**
- 🔒 `constructor` (unknown, línea 26)
- 🔒 `initializeServices` (unknown, línea 98)
- 🔒 `initializeRateLimiters` (unknown, línea 140)
- 🔒 `executeWithProtection` (unknown, línea 175)
- 🔒 `catch` (unknown, línea 202)
- 🔒 `checkServiceHealth` (unknown, línea 217)
- 🔒 `if` (unknown, línea 220)
- 🔒 `applyRateLimit` (unknown, línea 235)
- 🔒 `checkServiceRateLimit` (unknown, línea 257)
- 🔒 `checkClientRateLimit` (unknown, línea 279)
- 🔒 `executeWithCircuitBreaker` (unknown, línea 304)
- 🔒 `executeWithTimeout` (unknown, línea 334)
- 🔒 `executeWithRetry` (unknown, línea 353)
- 🔒 `for` (unknown, línea 357)
- 🔒 `handleExecutionError` (unknown, línea 394)
- 🔒 `executeAnthropicRequest` (unknown, línea 418)
- 🔒 `executeEmbeddingRequest` (unknown, línea 425)
- 🔒 `executeDatabaseRequest` (unknown, línea 432)
- 🔒 `recordSuccess` (unknown, línea 442)
- 🔒 `updateServiceHealth` (unknown, línea 458)
- 🔒 `updateSystemHealth` (unknown, línea 473)
- 🔒 `isNonRetryableError` (unknown, línea 493)
- 🔒 `isCriticalError` (unknown, línea 502)
- 🔒 `notifyCriticalError` (unknown, línea 507)
- 🔒 `generateExecutionId` (unknown, línea 512)
- 🔒 `startTimer` (unknown, línea 516)
- 🔒 `sleep` (unknown, línea 523)
- 🔒 `getMetrics` (unknown, línea 531)
- 🔒 `getQuickMetrics` (unknown, línea 546)
- 🔒 `getCircuitBreakerStatus` (unknown, línea 560)
- 🔒 `getRateLimiterStatus` (unknown, línea 568)
- 🔒 `reset` (unknown, línea 591)
- 🔒 `updateConfig` (unknown, línea 628)
- 🔒 `healthCheck` (unknown, línea 636)

**Clases (3):**
- 🔒 `ResilienceManager` (línea 25)
- 🔒 `RateLimitError` ← Error (línea 666)
- 🔒 `TimeoutError` ← Error (línea 674)

**Imports (2):**
- 📁 `logger` desde `../../utils/logger`
- 📁 `CircuitBreaker, apiRateLimiter` desde `../../utils/resilience`


---

### 📁 src\utils

**Archivos:** 14  
**Tecnologías:** WhatsApp Web API, HTTP Client

#### Grupo 1

#### 📄 cache.js

**Ruta:** `src\utils\cache.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 19899 caracteres, 665 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (31):**
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
- 🔒 `initializeStaticCache` (unknown, línea 287)
- 🔒 `catch` (unknown, línea 339)
- 🔒 `buildCatalogIndex` (unknown, línea 349)
- 🔒 `extractProductKeywords` (unknown, línea 410)
- 🔒 `extractBrand` (unknown, línea 443)
- 🔒 `getOptimizedClientContext` (unknown, línea 473)
- 🔒 `getRelevantProducts` (unknown, línea 530)
- 🔒 `searchRelevantProducts` (unknown, línea 566)
- 🔒 `normalizeQuery` (unknown, línea 610)
- 🔒 `getCacheStats` (unknown, línea 622)
- 🔒 `clearAllCaches` (unknown, línea 643)

**Clases (3):**
- 🔒 `LRUCache` (línea 7)
- 🔒 `MetricsLRUCache` ← LRUCache (línea 197)
- 🔒 `ContextCache` (línea 257)

**Imports (1):**
- 📁 `logger` desde `./logger`

#### 📄 chatState.js

**Ruta:** `src\utils\chatState.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 1769 caracteres, 62 líneas  
**Módulo:** Sí  

**Funciones (3):**
- 🔒 `pauseChat` (function, línea 15)
- 🔒 `resumeChat` (function, línea 40)
- 🔒 `isChatPaused` (function, línea 53)

**Imports (1):**
- 📁 `logger` desde `./logger`

#### 📄 claude.js

**Ruta:** `src\utils\claude.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 12476 caracteres, 224 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (4):**
- 🔒 `getSystemPrompt` (function, línea 21)
- 🔒 `interpretQuery` (function, línea 184)
- 🔒 `if` (unknown, línea 35)
- 🔒 `catch` (unknown, línea 210)

**Imports (4):**
- 📦 `Anthropic` desde `@anthropic-ai/sdk`
- 📁 `config` desde `../../config/config`
- 📁 `logger` desde `./logger`
- 📁 `getConocimientos` desde `../database/pg`

#### 📄 conversationContext.js

**Ruta:** `src\utils\conversationContext.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 15815 caracteres, 482 líneas  
**Módulo:** Sí  

**Funciones (14):**
- 🔒 `constructor` (unknown, línea 16)
- 🔒 `getContext` (unknown, línea 107)
- 🔒 `if` (unknown, línea 110)
- 🔒 `createNewContext` (unknown, línea 129)
- 🔒 `updateContext` (unknown, línea 159)
- 🔒 `resolveAnaphora` (unknown, línea 213)
- 🔒 `getEnrichedContextForAgent` (unknown, línea 266)
- 🔒 `shouldResetContext` (unknown, línea 313)
- 🔒 `extractEntities` (unknown, línea 325)
- 🔒 `updateContextEntities` (unknown, línea 373)
- 🔒 `inferCurrentTopic` (unknown, línea 399)
- 🔒 `inferConversationStage` (unknown, línea 424)
- 🔒 `getStats` (unknown, línea 445)
- 🔒 `cleanupExpiredContexts` (unknown, línea 457)

**Clases (1):**
- 🔒 `ConversationContext` (línea 15)

**Imports (3):**
- 📁 `LRUCache` desde `./cache`
- 📁 `logger` desde `./logger`
- 📁 `normalizeQuery, normalizeDeviceName, normalizeRepairType, normalizeQualityType` desde `./validators`

#### 📄 failureHandler.js

**Ruta:** `src\utils\failureHandler.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 10456 caracteres, 280 líneas  
**Módulo:** Sí  

**Funciones (10):**
- 🔒 `constructor` (unknown, línea 10)
- 🔒 `recordFailure` (unknown, línea 35)
- 🔒 `if` (unknown, línea 49)
- 🔒 `catch` (unknown, línea 101)
- 🔒 `recordSuccess` (unknown, línea 119)
- 🔒 `getEscalationMessage` (unknown, línea 152)
- 🔒 `checkFailureStatus` (unknown, línea 163)
- 🔒 `getFailureStats` (unknown, línea 215)
- 🔒 `manualReset` (unknown, línea 261)
- 🔒 `updateConfig` (unknown, línea 270)

**Clases (1):**
- 🔒 `FailureHandler` (línea 9)

**Imports (2):**
- 📁 `pool` desde `../database/pg`
- 📁 `logger` desde `./logger`

#### Grupo 2

#### 📄 intelligentRouter.js

**Ruta:** `src\utils\intelligentRouter.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 20203 caracteres, 627 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (14):**
- 🔒 `constructor` (unknown, línea 12)
- 🔒 `processQuery` (unknown, línea 56)
- 🔒 `if` (unknown, línea 74)
- 🔒 `catch` (unknown, línea 110)
- 🔒 `analyzeRouting` (unknown, línea 148)
- 🔒 `analyzeComplexity` (unknown, línea 209)
- 🔒 `analyzeIntention` (unknown, línea 295)
- 🔒 `analyzeContext` (unknown, línea 366)
- 🔒 `processWithLocal` (unknown, línea 384)
- 🔒 `processWithRemote` (unknown, línea 468)
- 🔒 `findProductInRelevant` (unknown, línea 496)
- 🔒 `evaluateResponseQuality` (unknown, línea 537)
- 🔒 `updateMetrics` (unknown, línea 588)
- 🔒 `getMetrics` (unknown, línea 606)

**Clases (1):**
- 🔄 `IntelligentRouter` (línea 11)

**Imports (4):**
- 📁 `QwenLocalClient` desde `./qwenLocal`
- 📁 `interpretQuery: claudeInterpretQuery` desde `./claude`
- 📁 `contextCache` desde `./cache`
- 📁 `logger` desde `./logger`

#### 📄 llmJudge.js

**Ruta:** `src\utils\llmJudge.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 14557 caracteres, 450 líneas  
**Módulo:** Sí  

**Funciones (16):**
- 🔒 `constructor` (unknown, línea 12)
- 🔒 `evaluateResponse` (unknown, línea 65)
- 🔒 `if` (unknown, línea 77)
- 🔒 `catch` (unknown, línea 115)
- 🔒 `buildEvaluationPrompt` (unknown, línea 129)
- 🔒 `performEvaluation` (unknown, línea 193)
- 🔒 `parseEvaluationResponse` (unknown, línea 213)
- 🔒 `validateEvaluation` (unknown, línea 234)
- 🔒 `for` (unknown, línea 252)
- 🔒 `getFallbackEvaluation` (unknown, línea 280)
- 🔒 `generateCacheKey` (unknown, línea 312)
- 🔒 `updateMetrics` (unknown, línea 328)
- 🔒 `batchEvaluate` (unknown, línea 350)
- 🔒 `getStats` (unknown, línea 392)
- 🔒 `getResponsesNeedingImprovement` (unknown, línea 408)
- 🔒 `cleanupCache` (unknown, línea 430)

**Clases (1):**
- 🔒 `LLMJudge` (línea 11)

**Imports (4):**
- 📦 `ChatAnthropic` desde `@langchain/anthropic`
- 📁 `logger` desde `./logger`
- 📁 `LRUCache` desde `./cache`
- 📁 `apiRateLimiter` desde `./resilience`

#### 📄 logger.js

**Ruta:** `src\utils\logger.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 2146 caracteres, 73 líneas  
**Módulo:** Sí  

**Funciones (2):**
- 🔒 `if` (unknown, línea 18)
- 🔒 `catch` (unknown, línea 49)

**Imports (3):**
- 📦 `winston` desde `winston`
- 📦 `fs` desde `fs`
- 📦 `path` desde `path`

#### 📄 outOfScopeDetector.js

**Ruta:** `src\utils\outOfScopeDetector.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 8789 caracteres, 332 líneas  
**Módulo:** Sí  

**Funciones (7):**
- 🔒 `detectOutOfScope` (function, línea 169)
- 🔒 `calculateConfidence` (function, línea 227)
- 🔒 `generateRecommendation` (function, línea 259)
- 🔒 `generateEmpathicResponse` (function, línea 281)
- 🔒 `for` (unknown, línea 178)
- 🔒 `if` (unknown, línea 260)
- 🔒 `switch` (unknown, línea 292)

#### 📄 performanceMonitor.js

**Ruta:** `src\utils\performanceMonitor.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 15798 caracteres, 511 líneas  
**Módulo:** Sí  

**Funciones (21):**
- 🔒 `constructor` (unknown, línea 10)
- 🔒 `recordRequest` (unknown, línea 53)
- 🔒 `if` (unknown, línea 59)
- 🔒 `recordLatency` (unknown, línea 93)
- 🔒 `recordSourceStats` (unknown, línea 115)
- 🔒 `recordIntentionStats` (unknown, línea 134)
- 🔒 `recordHourlyStats` (unknown, línea 162)
- 🔒 `checkAlerts` (unknown, línea 189)
- 🔒 `generateAlert` (unknown, línea 233)
- 🔒 `formatAlertMessage` (unknown, línea 261)
- 🔒 `switch` (unknown, línea 262)
- 🔒 `getErrorRate` (unknown, línea 280)
- 🔒 `periodicCleanup` (unknown, línea 288)
- 🔒 `logIfNeeded` (unknown, línea 314)
- 🔒 `getSummary` (unknown, línea 336)
- 🔒 `getPercentile` (unknown, línea 400)
- 🔒 `getDetailedMetrics` (unknown, línea 411)
- 🔒 `getRecentAlerts` (unknown, línea 426)
- 🔒 `getLatencyTrends` (unknown, línea 445)
- 🔒 `getCurrentHourAverage` (unknown, línea 464)
- 🔒 `reset` (unknown, línea 483)

**Clases (1):**
- 🔒 `PerformanceMonitor` (línea 9)

**Imports (2):**
- 📁 `logger` desde `./logger`
- 📁 `MetricsLRUCache` desde `./cache`

#### Grupo 3

#### 📄 proactiveMonitor.js

**Ruta:** `src\utils\proactiveMonitor.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 15888 caracteres, 499 líneas  
**Módulo:** Sí  

**Funciones (18):**
- 🔒 `constructor` (unknown, línea 18)
- 🔒 `start` (unknown, línea 53)
- 🔒 `if` (unknown, línea 54)
- 🔒 `stop` (unknown, línea 79)
- 🔒 `performHealthCheck` (unknown, línea 100)
- 🔒 `catch` (unknown, línea 130)
- 🔒 `checkDatabaseHealth` (unknown, línea 143)
- 🔒 `checkAnthropicAPIHealth` (unknown, línea 173)
- 🔒 `checkCircuitBreakerHealth` (unknown, línea 198)
- 🔒 `checkRateLimiterHealth` (unknown, línea 239)
- 🔒 `calculateSystemMetrics` (unknown, línea 269)
- 🔒 `evaluateSystemHealth` (unknown, línea 315)
- 🔒 `generateAlerts` (unknown, línea 352)
- 🔒 `addAlert` (unknown, línea 393)
- 🔒 `checkCriticalAlerts` (unknown, línea 425)
- 🔒 `getStatus` (unknown, línea 445)
- 🔒 `acknowledgeAlert` (unknown, línea 462)
- 🔒 `cleanupAlerts` (unknown, línea 476)

**Clases (1):**
- 🔒 `ProactiveMonitor` (línea 17)

**Imports (6):**
- 📁 `logger` desde `./logger`
- 📁 `pool` desde `../database/pg`
- 📁 `CircuitBreaker, apiRateLimiter` desde `./resilience`
- 📁 `failureHandler` desde `./failureHandler`
- 📁 `conversationContext` desde `./conversationContext`
- 📁 `conversationFSM` desde `./conversationFSM`

#### 📄 qwenLocal.js

**Ruta:** `src\utils\qwenLocal.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 13575 caracteres, 400 líneas  
**Tecnologías:** WhatsApp Web API, HTTP Client  
**Módulo:** Sí  

**Funciones (12):**
- 🔒 `constructor` (unknown, línea 10)
- 🔒 `checkHealth` (unknown, línea 30)
- 🔒 `if` (unknown, línea 34)
- 🔒 `catch` (unknown, línea 62)
- 🔒 `generate` (unknown, línea 76)
- 🔒 `extractQueryInfo` (unknown, línea 136)
- 🔒 `generateConversationalResponse` (unknown, línea 188)
- 🔒 `buildExtractionPrompt` (unknown, línea 220)
- 🔒 `buildConversationalPrompt` (unknown, línea 257)
- 🔒 `getToneStyle` (unknown, línea 311)
- 🔒 `switch` (unknown, línea 312)
- 🔒 `fallbackExtraction` (unknown, línea 328)

**Clases (1):**
- 🔄 `QwenLocalClient` (línea 9)

**Imports (2):**
- 📦 `axios` desde `axios`
- 📁 `logger` desde `./logger`

#### 📄 resilience.js

**Ruta:** `src\utils\resilience.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 14081 caracteres, 479 líneas  
**Tecnologías:** WhatsApp Web API  
**Módulo:** Sí  

**Funciones (18):**
- 🔒 `withRateLimit` (function, línea 452)
- 🔒 `constructor` (unknown, línea 9)
- 🔒 `execute` (unknown, línea 46)
- 🔒 `if` (unknown, línea 50)
- 🔒 `catch` (unknown, línea 72)
- 🔒 `executeWithTimeout` (unknown, línea 81)
- 🔒 `onSuccess` (unknown, línea 105)
- 🔒 `onFailure` (unknown, línea 124)
- 🔒 `reset` (unknown, línea 149)
- 🔒 `getStatus` (unknown, línea 164)
- 🔒 `isAvailable` (unknown, línea 180)
- 🔒 `checkLimit` (unknown, línea 210)
- 🔒 `getBucket` (unknown, línea 252)
- 🔒 `refillBucket` (unknown, línea 274)
- 🔒 `startRefillTimer` (unknown, línea 287)
- 🔒 `getStats` (unknown, línea 305)
- 🔒 `resetClient` (unknown, línea 325)
- 🔒 `while` (unknown, línea 421)

**Clases (3):**
- 🔒 `CircuitBreaker` (línea 8)
- 🔒 `RateLimiter` (línea 192)
- 🔒 `APIRateLimiter` (línea 339)

**Imports (2):**
- 📁 `LRUCache` desde `./cache`
- 📁 `logger` desde `./logger`

#### 📄 validators.js

**Ruta:** `src\utils\validators.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 30080 caracteres, 1049 líneas  
**Módulo:** Sí  

**Funciones (26):**
- 🔒 `levenshteinDistance` (function, línea 15)
- 🔒 `similarity` (function, línea 55)
- 🔒 `findBestMatch` (function, línea 321)
- 🔒 `normalizeDeviceName` (function, línea 365)
- 🔒 `normalizeRepairType` (function, línea 390)
- 🔒 `normalizeQualityType` (function, línea 415)
- 🔒 `normalizeQuery` (function, línea 440)
- 🔒 `detectInventedDataValidator` (function, línea 903)
- 🔒 `calculateRiskLevel` (function, línea 984)
- 🔒 `sanitizeResponse` (function, línea 997)
- 🔒 `getRecommendation` (function, línea 1011)
- 🔒 `for` (unknown, línea 24)
- 🔒 `if` (unknown, línea 345)
- 🔒 `parse` (unknown, línea 533)
- 🔒 `catch` (unknown, línea 580)
- 🔒 `extractToolCall` (unknown, línea 598)
- 🔒 `isValidToolName` (unknown, línea 659)
- 🔒 `parseToolArguments` (unknown, línea 680)
- 🔒 `calculateConfidence` (unknown, línea 720)
- 🔒 `sanitizeUserResponse` (unknown, línea 745)
- 🔒 `validateToolCall` (unknown, línea 769)
- 🔒 `getParsingStats` (unknown, línea 840)
- 🔒 `constructor` (unknown, línea 856)
- 🔒 `use` (unknown, línea 864)
- 🔒 `validate` (unknown, línea 874)
- 🔒 `switch` (unknown, línea 1012)

**Clases (2):**
- 🔒 `RobustSofiaParser` (línea 526)
- 🔒 `ValidationPipeline` (línea 855)

**Imports (1):**
- 📁 `logger` desde `./logger`


---

### 📁 task-service

**Archivos:** 2  
**Tecnologías:** Node.js Package

#### 📄 index.js

**Ruta:** `task-service\index.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 96 caracteres, 3 líneas  
**Módulo:** No  

#### 📄 package.json

**Ruta:** `task-service\package.json`  
**Tipo:** JSON  
**Tamaño:** 193 caracteres, 11 líneas  
**Tecnologías:** Node.js Package  

**Estructura JSON:**
- Claves principales: name, version, description, main, scripts, dependencies
- ✅ Contiene scripts
- 📦 Contiene dependencias


---

### 📁 test

**Archivos:** 5

#### 📄 integration-test.js

**Ruta:** `test\integration-test.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 10397 caracteres, 350 líneas  
**Módulo:** Sí  

**Funciones (15):**
- 🔒 `constructor` (unknown, línea 16)
- 🔒 `runAllTests` (unknown, línea 28)
- 🔒 `catch` (unknown, línea 41)
- 🔒 `testInitialization` (unknown, línea 52)
- 🔒 `if` (unknown, línea 59)
- 🔒 `testPerformanceLayer` (unknown, línea 75)
- 🔒 `testResilienceLayer` (unknown, línea 112)
- 🔒 `testUnifiedOperation` (unknown, línea 149)
- 🔒 `testSystemStatus` (unknown, línea 187)
- 🔒 `testOptimization` (unknown, línea 227)
- 🔒 `testShutdown` (unknown, línea 254)
- 🔒 `recordSuccess` (unknown, línea 277)
- 🔒 `recordFailure` (unknown, línea 290)
- 🔒 `printResults` (unknown, línea 303)
- 🔒 `sleep` (unknown, línea 329)

**Clases (1):**
- 🔄 `OrchestrationIntegrationTest` (línea 15)

**Imports (2):**
- 📁 `logger` desde `../src/utils/logger`
- 📁 `orchestrationController` desde `../src/core/OrchestrationController`

#### 📄 test-basic.js

**Ruta:** `test\test-basic.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 1352 caracteres, 42 líneas  
**Módulo:** No  

**Funciones (2):**
- 🔒 `testBasicComponents` (function, línea 6)
- 🔒 `catch` (unknown, línea 19)

**Imports (4):**
- 📁 `logger` desde `../src/utils/logger`
- 📁 `config` desde `../config/config`
- 📁 `initializeDatabase` desde `../src/database/pg`
- 📁 `SalvaCellAgentExecutor` desde `../src/services/agentExecutor`

#### 📄 test-db-connection.js

**Ruta:** `test\test-db-connection.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 1051 caracteres, 36 líneas  
**Módulo:** No  

**Funciones (2):**
- 🔒 `testConnection` (function, línea 15)
- 🔒 `catch` (unknown, línea 29)

**Imports (1):**
- 📦 `Pool` desde `pg`

#### 📄 test-node.js

**Ruta:** `test\test-node.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 91 caracteres, 3 líneas  
**Módulo:** No  

#### 📄 test-very-basic.js

**Ruta:** `test\test-very-basic.js`  
**Tipo:** JAVASCRIPT  
**Tamaño:** 427 caracteres, 18 líneas  
**Módulo:** No  

**Funciones (1):**
- 🔒 `catch` (unknown, línea 14)


---

### 📁 user-service

**Archivos:** 1  
**Tecnologías:** Node.js Package

#### 📄 package.json

**Ruta:** `user-service\package.json`  
**Tipo:** JSON  
**Tamaño:** 192 caracteres, 11 líneas  
**Tecnologías:** Node.js Package  

**Estructura JSON:**
- Claves principales: name, version, description, main, scripts, dependencies
- ✅ Contiene scripts
- 📦 Contiene dependencias



---

## 🔍 Duplicados Detectados

⚠️ **Se encontraron 101 posibles duplicados:**

### 🔧 function: `constructor`

**Encontrado en:**
- 🔒 `whatsapp_analyzer.js` (línea 60)
- 🔒 `src\bot.js` (línea 18)
- 🔒 `src\core\OrchestrationController.js` (línea 38)
- 🔒 `src\core\intelligence\EscalationService.js` (línea 9)
- 🔒 `src\core\intelligence\IntelligenceService.js` (línea 8)
- 🔒 `src\core\intelligence\ResponseService.js` (línea 19)
- 🔒 `src\core\performance\PerformanceController.js` (línea 9)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 7)
- 🔒 `src\monitoring\intelligentMonitor.js` (línea 9)
- 🔒 `src\scripts\chroma\index_intentions.js` (línea 18)
- 🔒 `src\scripts\chroma\index_knowledge.js` (línea 24)
- 🔒 `src\scripts\db\convertMarkdownToPostgreSQL.js` (línea 24)
- 🔒 `src\scripts\db\generateSQLFromExcel.js` (línea 12)
- 🔒 `src\scripts\db\importExcelData.js` (línea 12)
- 🔒 `src\scripts\db\migrateConversations.js` (línea 14)
- 🔒 `src\scripts\db\verifyMigration.js` (línea 12)
- 🔒 `src\security\advancedRateLimiter.js` (línea 19)
- 🔒 `src\security\authLayer.js` (línea 21)
- 🔒 `src\security\inputValidator.js` (línea 18)
- 🔒 `src\services\agentExecutor.js` (línea 15)
- 🔒 `src\services\clientHistorySearchEngine.js` (línea 21)
- 🔒 `src\services\conversationMemory.js` (línea 56)
- 🔒 `src\services\deterministicSearchEngine.js` (línea 22)
- 🔒 `src\services\dynamicLimitOptimizer.js` (línea 21)
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 21)
- 🔒 `src\services\guardrails.js` (línea 11)
- 🔒 `src\services\markdownContextEnricher.js` (línea 23)
- 🔒 `src\services\markdownMetadataExtractor.js` (línea 23)
- 🔒 `src\services\metadataEnhancer.js` (línea 21)
- 🔒 `src\services\priceExtractionSystem.js` (línea 40)
- 🔒 `src\services\semanticCache.js` (línea 18)
- 🔒 `src\services\semanticChunker.js` (línea 21)
- 🔒 `src\services\semanticRouter.js` (línea 19)
- 🔒 `src\services\simpleAgentExecutor.js` (línea 14)
- 🔒 `src\services\simpleDeduplicationEngine.js` (línea 22)
- 🔒 `src\services\tools.js` (línea 63)
- 🔒 `src\services\validatedEmbeddingEngine.js` (línea 22)
- 🔒 `src\services\classifiers\qwenClassifier.js` (línea 12)
- 🔒 `src\services\eventSourcing\EventStore.js` (línea 17)
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 21)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 22)
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 26)
- 🔒 `src\utils\cache.js` (línea 8)
- 🔒 `src\utils\conversationContext.js` (línea 16)
- 🔒 `src\utils\failureHandler.js` (línea 10)
- 🔒 `src\utils\intelligentRouter.js` (línea 12)
- 🔒 `src\utils\llmJudge.js` (línea 12)
- 🔒 `src\utils\performanceMonitor.js` (línea 10)
- 🔒 `src\utils\proactiveMonitor.js` (línea 18)
- 🔒 `src\utils\qwenLocal.js` (línea 10)
- 🔒 `src\utils\resilience.js` (línea 9)
- 🔒 `src\utils\validators.js` (línea 856)
- 🔒 `test\integration-test.js` (línea 16)

### 🔧 function: `analyze`

**Encontrado en:**
- 🔒 `whatsapp_analyzer.js` (línea 91)
- 🔒 `src\monitoring\intelligentMonitor.js` (línea 23)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 1396)

### 🔧 function: `catch`

**Encontrado en:**
- 🔒 `whatsapp_analyzer.js` (línea 108)
- 🔒 `src\bot.js` (línea 59)
- 🔒 `src\auth\admin.js` (línea 26)
- 🔒 `src\core\OrchestrationController.js` (línea 129)
- 🔒 `src\core\intelligence\EscalationService.js` (línea 49)
- 🔒 `src\core\intelligence\IntelligenceService.js` (línea 53)
- 🔒 `src\core\intelligence\ResponseService.js` (línea 105)
- 🔒 `src\core\performance\PerformanceController.js` (línea 108)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 62)
- 🔒 `src\database\pg.js` (línea 38)
- 🔒 `src\excel\processor.js` (línea 70)
- 🔒 `src\scripts\architectural_health_check.js` (línea 28)
- 🔒 `src\scripts\chroma\clear_cache_collection.js` (línea 32)
- 🔒 `src\scripts\chroma\index_intentions.js` (línea 29)
- 🔒 `src\scripts\chroma\index_knowledge.js` (línea 35)
- 🔒 `src\scripts\chroma\index_markdown_prices.js` (línea 145)
- 🔒 `src\scripts\chroma\migrate_to_task_prefixes.js` (línea 41)
- 🔒 `src\scripts\db\convertMarkdownToPostgreSQL.js` (línea 65)
- 🔒 `src\scripts\db\generateSQLFromExcel.js` (línea 70)
- 🔒 `src\scripts\db\importExcelData.js` (línea 76)
- 🔒 `src\scripts\db\migrateConversations.js` (línea 54)
- 🔒 `src\scripts\db\seed_proactive_knowledge.js` (línea 76)
- 🔒 `src\scripts\db\verifyMigration.js` (línea 43)
- 🔒 `src\scripts\evals\run_evals.js` (línea 45)
- 🔒 `src\security\advancedRateLimiter.js` (línea 589)
- 🔒 `src\security\authLayer.js` (línea 537)
- 🔒 `src\security\inputValidator.js` (línea 391)
- 🔒 `src\services\agentExecutor.js` (línea 129)
- 🔒 `src\services\clientHistorySearchEngine.js` (línea 123)
- 🔒 `src\services\conversationMemory.js` (línea 87)
- 🔒 `src\services\deterministicSearchEngine.js` (línea 195)
- 🔒 `src\services\dynamicLimitOptimizer.js` (línea 197)
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 111)
- 🔒 `src\services\embeddingEngine.js` (línea 36)
- 🔒 `src\services\markdownContextEnricher.js` (línea 133)
- 🔒 `src\services\markdownMetadataExtractor.js` (línea 112)
- 🔒 `src\services\metadataEnhancer.js` (línea 182)
- 🔒 `src\services\priceExtractionSystem.js` (línea 57)
- 🔒 `src\services\semanticCache.js` (línea 64)
- 🔒 `src\services\semanticChunker.js` (línea 131)
- 🔒 `src\services\semanticRouter.js` (línea 30)
- 🔒 `src\services\serviceRegistry.js` (línea 44)
- 🔒 `src\services\simpleAgentExecutor.js` (línea 82)
- 🔒 `src\services\simpleDeduplicationEngine.js` (línea 128)
- 🔒 `src\services\tools.js` (línea 94)
- 🔒 `src\services\validatedEmbeddingEngine.js` (línea 115)
- 🔒 `src\services\classifiers\qwenClassifier.js` (línea 48)
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 93)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 220)
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 202)
- 🔒 `src\utils\cache.js` (línea 339)
- 🔒 `src\utils\claude.js` (línea 210)
- 🔒 `src\utils\failureHandler.js` (línea 101)
- 🔒 `src\utils\intelligentRouter.js` (línea 110)
- 🔒 `src\utils\llmJudge.js` (línea 115)
- 🔒 `src\utils\logger.js` (línea 49)
- 🔒 `src\utils\proactiveMonitor.js` (línea 130)
- 🔒 `src\utils\qwenLocal.js` (línea 62)
- 🔒 `src\utils\resilience.js` (línea 72)
- 🔒 `src\utils\validators.js` (línea 580)
- 🔒 `test\integration-test.js` (línea 41)
- 🔒 `test\test-basic.js` (línea 19)
- 🔒 `test\test-db-connection.js` (línea 29)
- 🔒 `test\test-very-basic.js` (línea 14)

### 🔧 function: `if`

**Encontrado en:**
- 🔒 `whatsapp_analyzer.js` (línea 135)
- 🔒 `config\config.js` (línea 206)
- 🔒 `src\bot.js` (línea 47)
- 🔒 `src\auth\admin.js` (línea 13)
- 🔒 `src\core\OrchestrationController.js` (línea 78)
- 🔒 `src\core\intelligence\EscalationService.js` (línea 33)
- 🔒 `src\core\intelligence\IntelligenceService.js` (línea 77)
- 🔒 `src\core\intelligence\ResponseService.js` (línea 182)
- 🔒 `src\core\performance\PerformanceController.js` (línea 133)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 77)
- 🔒 `src\database\pg.js` (línea 60)
- 🔒 `src\excel\processor.js` (línea 20)
- 🔒 `src\monitoring\intelligentMonitor.js` (línea 25)
- 🔒 `src\scripts\architectural_health_check.js` (línea 21)
- 🔒 `src\scripts\chroma\index_intentions.js` (línea 44)
- 🔒 `src\scripts\chroma\index_knowledge.js` (línea 51)
- 🔒 `src\scripts\chroma\index_markdown_prices.js` (línea 43)
- 🔒 `src\scripts\chroma\migrate_to_task_prefixes.js` (línea 98)
- 🔒 `src\scripts\db\convertMarkdownToPostgreSQL.js` (línea 85)
- 🔒 `src\scripts\db\generateSQLFromExcel.js` (línea 92)
- 🔒 `src\scripts\db\importExcelData.js` (línea 116)
- 🔒 `src\scripts\db\migrateConversations.js` (línea 32)
- 🔒 `src\scripts\db\seed_proactive_knowledge.js` (línea 53)
- 🔒 `src\scripts\db\verifyMigration.js` (línea 119)
- 🔒 `src\scripts\evals\run_evals.js` (línea 54)
- 🔒 `src\security\advancedRateLimiter.js` (línea 35)
- 🔒 `src\security\authLayer.js` (línea 57)
- 🔒 `src\security\inputValidator.js` (línea 143)
- 🔒 `src\services\agentExecutor.js` (línea 121)
- 🔒 `src\services\clientHistorySearchEngine.js` (línea 74)
- 🔒 `src\services\conversationMemory.js` (línea 198)
- 🔒 `src\services\deterministicSearchEngine.js` (línea 140)
- 🔒 `src\services\dynamicLimitOptimizer.js` (línea 220)
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 96)
- 🔒 `src\services\embeddingEngine.js` (línea 17)
- 🔒 `src\services\guardrails.js` (línea 38)
- 🔒 `src\services\markdownContextEnricher.js` (línea 127)
- 🔒 `src\services\markdownMetadataExtractor.js` (línea 91)
- 🔒 `src\services\metadataEnhancer.js` (línea 37)
- 🔒 `src\services\priceExtractionSystem.js` (línea 71)
- 🔒 `src\services\semanticCache.js` (línea 46)
- 🔒 `src\services\semanticChunker.js` (línea 161)
- 🔒 `src\services\semanticRouter.js` (línea 53)
- 🔒 `src\services\serviceRegistry.js` (línea 36)
- 🔒 `src\services\simpleAgentExecutor.js` (línea 61)
- 🔒 `src\services\simpleDeduplicationEngine.js` (línea 227)
- 🔒 `src\services\tools.js` (línea 40)
- 🔒 `src\services\validatedEmbeddingEngine.js` (línea 142)
- 🔒 `src\services\classifiers\qwenClassifier.js` (línea 43)
- 🔒 `src\services\eventSourcing\EventStore.js` (línea 97)
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 89)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 126)
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 220)
- 🔒 `src\utils\cache.js` (línea 50)
- 🔒 `src\utils\claude.js` (línea 35)
- 🔒 `src\utils\conversationContext.js` (línea 110)
- 🔒 `src\utils\failureHandler.js` (línea 49)
- 🔒 `src\utils\intelligentRouter.js` (línea 74)
- 🔒 `src\utils\llmJudge.js` (línea 77)
- 🔒 `src\utils\logger.js` (línea 18)
- 🔒 `src\utils\outOfScopeDetector.js` (línea 260)
- 🔒 `src\utils\performanceMonitor.js` (línea 59)
- 🔒 `src\utils\proactiveMonitor.js` (línea 54)
- 🔒 `src\utils\qwenLocal.js` (línea 34)
- 🔒 `src\utils\resilience.js` (línea 50)
- 🔒 `src\utils\validators.js` (línea 345)
- 🔒 `test\integration-test.js` (línea 59)

### 🔧 function: `for`

**Encontrado en:**
- 🔒 `whatsapp_analyzer.js` (línea 143)
- 🔒 `src\core\OrchestrationController.js` (línea 703)
- 🔒 `src\core\intelligence\EscalationService.js` (línea 346)
- 🔒 `src\core\intelligence\IntelligenceService.js` (línea 469)
- 🔒 `src\core\performance\PerformanceController.js` (línea 39)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 600)
- 🔒 `src\database\pg.js` (línea 274)
- 🔒 `src\excel\processor.js` (línea 27)
- 🔒 `src\scripts\chroma\index_markdown_prices.js` (línea 37)
- 🔒 `src\scripts\chroma\migrate_to_task_prefixes.js` (línea 114)
- 🔒 `src\scripts\db\convertMarkdownToPostgreSQL.js` (línea 145)
- 🔒 `src\scripts\db\generateSQLFromExcel.js` (línea 31)
- 🔒 `src\scripts\db\importExcelData.js` (línea 33)
- 🔒 `src\scripts\db\migrateConversations.js` (línea 48)
- 🔒 `src\scripts\db\seed_proactive_knowledge.js` (línea 62)
- 🔒 `src\scripts\evals\run_evals.js` (línea 32)
- 🔒 `src\security\advancedRateLimiter.js` (línea 197)
- 🔒 `src\security\authLayer.js` (línea 56)
- 🔒 `src\security\inputValidator.js` (línea 61)
- 🔒 `src\services\clientHistorySearchEngine.js` (línea 197)
- 🔒 `src\services\conversationMemory.js` (línea 261)
- 🔒 `src\services\deterministicSearchEngine.js` (línea 214)
- 🔒 `src\services\guardrails.js` (línea 36)
- 🔒 `src\services\markdownContextEnricher.js` (línea 163)
- 🔒 `src\services\markdownMetadataExtractor.js` (línea 138)
- 🔒 `src\services\metadataEnhancer.js` (línea 500)
- 🔒 `src\services\priceExtractionSystem.js` (línea 86)
- 🔒 `src\services\semanticCache.js` (línea 220)
- 🔒 `src\services\semanticChunker.js` (línea 173)
- 🔒 `src\services\simpleDeduplicationEngine.js` (línea 217)
- 🔒 `src\services\tools.js` (línea 29)
- 🔒 `src\services\validatedEmbeddingEngine.js` (línea 266)
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 356)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 861)
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 357)
- 🔒 `src\utils\cache.js` (línea 166)
- 🔒 `src\utils\llmJudge.js` (línea 252)
- 🔒 `src\utils\outOfScopeDetector.js` (línea 178)
- 🔒 `src\utils\validators.js` (línea 24)

### 🔧 function: `switch`

**Encontrado en:**
- 🔒 `whatsapp_analyzer.js` (línea 290)
- 🔒 `src\core\intelligence\IntelligenceService.js` (línea 240)
- 🔒 `src\core\intelligence\ResponseService.js` (línea 555)
- 🔒 `src\core\performance\PerformanceController.js` (línea 799)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 70)
- 🔒 `src\scripts\chroma\migrate_to_task_prefixes.js` (línea 208)
- 🔒 `src\services\conversationMemory.js` (línea 73)
- 🔒 `src\services\deterministicSearchEngine.js` (línea 568)
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 133)
- 🔒 `src\services\markdownContextEnricher.js` (línea 500)
- 🔒 `src\services\metadataEnhancer.js` (línea 407)
- 🔒 `src\services\simpleDeduplicationEngine.js` (línea 339)
- 🔒 `src\services\tools.js` (línea 80)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 834)
- 🔒 `src\utils\outOfScopeDetector.js` (línea 292)
- 🔒 `src\utils\performanceMonitor.js` (línea 262)
- 🔒 `src\utils\qwenLocal.js` (línea 312)
- 🔒 `src\utils\validators.js` (línea 1012)

### 🔧 function: `printSummary`

**Encontrado en:**
- 🔒 `whatsapp_analyzer.js` (línea 876)
- 🔒 `src\scripts\db\importExcelData.js` (línea 296)

### 🔧 function: `forEach`

**Encontrado en:**
- 🔒 `whatsapp_analyzer.js` (línea 1068)
- 🔒 `src\utils\cache.js` (línea 119)

### 🔧 function: `initialize`

**Encontrado en:**
- 🔒 `src\bot.js` (línea 38)
- 🔒 `src\core\OrchestrationController.js` (línea 71)
- 🔒 `src\core\performance\PerformanceController.js` (línea 956)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 734)
- 🔒 `src\services\agentExecutor.js` (línea 92)
- 🔒 `src\services\conversationMemory.js` (línea 196)

### 🔧 function: `setupEventHandlers`

**Encontrado en:**
- 🔒 `src\bot.js` (línea 101)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 88)

### 🔧 function: `recordSuccess`

**Encontrado en:**
- 🔒 `src\bot.js` (línea 222)
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 246)
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 442)
- 🔒 `src\utils\failureHandler.js` (línea 119)
- 🔒 `test\integration-test.js` (línea 277)

### 🔧 function: `getMetrics`

**Encontrado en:**
- 🔒 `src\bot.js` (línea 231)
- 🔒 `src\core\intelligence\EscalationService.js` (línea 226)
- 🔒 `src\core\intelligence\IntelligenceService.js` (línea 304)
- 🔒 `src\core\intelligence\ResponseService.js` (línea 1157)
- 🔒 `src\core\performance\PerformanceController.js` (línea 272)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 237)
- 🔒 `src\security\authLayer.js` (línea 771)
- 🔒 `src\security\inputValidator.js` (línea 418)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 1654)
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 531)
- 🔒 `src\utils\cache.js` (línea 131)
- 🔒 `src\utils\intelligentRouter.js` (línea 606)

### 🔧 function: `start`

**Encontrado en:**
- 🔒 `src\bot.js` (línea 246)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 2037)
- 🔒 `src\utils\proactiveMonitor.js` (línea 53)

### 🔧 function: `shutdown`

**Encontrado en:**
- 🔒 `src\bot.js` (línea 256)
- 🔒 `src\core\OrchestrationController.js` (línea 465)
- 🔒 `src\core\intelligence\EscalationService.js` (línea 236)
- 🔒 `src\core\intelligence\IntelligenceService.js` (línea 329)
- 🔒 `src\core\performance\PerformanceController.js` (línea 337)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 742)

### 🔧 function: `getSystemStatus`

**Encontrado en:**
- 🔒 `src\core\OrchestrationController.js` (línea 353)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 554)

### 🔧 function: `getCircuitBreaker`

**Encontrado en:**
- 🔒 `src\core\OrchestrationController.js` (línea 507)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 786)

### 🔧 function: `getGracefulDegradationManager`

**Encontrado en:**
- 🔒 `src\core\OrchestrationController.js` (línea 517)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 790)

### 🔧 function: `detectQueryType`

**Encontrado en:**
- 🔒 `src\core\OrchestrationController.js` (línea 688)
- 🔒 `src\core\performance\PerformanceController.js` (línea 782)

### 🔧 function: `detectServiceType`

**Encontrado en:**
- 🔒 `src\core\OrchestrationController.js` (línea 711)
- 🔒 `src\core\intelligence\EscalationService.js` (línea 516)

### 🔧 function: `analyzeQueryComplexity`

**Encontrado en:**
- 🔒 `src\core\intelligence\EscalationService.js` (línea 361)
- 🔒 `src\services\dynamicLimitOptimizer.js` (línea 208)

### 🔧 function: `calculateConfidence`

**Encontrado en:**
- 🔒 `src\core\intelligence\EscalationService.js` (línea 403)
- 🔒 `src\utils\outOfScopeDetector.js` (línea 227)
- 🔒 `src\utils\validators.js` (línea 720)

### 🔧 function: `extractBrand`

**Encontrado en:**
- 🔒 `src\core\intelligence\EscalationService.js` (línea 479)
- 🔒 `src\utils\cache.js` (línea 443)

### 🔧 function: `normalizeModel`

**Encontrado en:**
- 🔒 `src\core\intelligence\EscalationService.js` (línea 512)
- 🔒 `src\scripts\db\convertMarkdownToPostgreSQL.js` (línea 359)
- 🔒 `src\scripts\db\generateSQLFromExcel.js` (línea 227)
- 🔒 `src\scripts\db\importExcelData.js` (línea 236)

### 🔧 function: `containsTechnicalTerms`

**Encontrado en:**
- 🔒 `src\core\intelligence\EscalationService.js` (línea 524)
- 🔒 `src\core\intelligence\IntelligenceService.js` (línea 715)

### 🔧 function: `generateRecommendations`

**Encontrado en:**
- 🔒 `src\core\intelligence\IntelligenceService.js` (línea 563)
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 1447)

### 🔧 function: `processQuery`

**Encontrado en:**
- 🔒 `src\core\intelligence\IntelligenceService.js` (línea 623)
- 🔒 `src\utils\intelligentRouter.js` (línea 56)

### 🔧 function: `updateMetrics`

**Encontrado en:**
- 🔒 `src\core\intelligence\IntelligenceService.js` (línea 839)
- 🔒 `src\core\intelligence\ResponseService.js` (línea 664)
- 🔒 `src\core\performance\PerformanceController.js` (línea 904)
- 🔒 `src\utils\intelligentRouter.js` (línea 588)
- 🔒 `src\utils\llmJudge.js` (línea 328)

### 🔧 function: `while`

**Encontrado en:**
- 🔒 `src\core\performance\PerformanceController.js` (línea 131)
- 🔒 `src\utils\resilience.js` (línea 421)

### 🔧 function: `sleep`

**Encontrado en:**
- 🔒 `src\core\performance\PerformanceController.js` (línea 292)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 1302)
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 523)
- 🔒 `test\integration-test.js` (línea 329)

### 🔧 function: `optimize`

**Encontrado en:**
- 🔒 `src\core\performance\PerformanceController.js` (línea 296)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 781)

### 🔧 function: `startMonitoring`

**Encontrado en:**
- 🔒 `src\core\performance\PerformanceController.js` (línea 520)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 580)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 125)

### 🔧 function: `generateQueryKey`

**Encontrado en:**
- 🔒 `src\core\performance\PerformanceController.js` (línea 853)
- 🔒 `src\services\deterministicSearchEngine.js` (línea 492)

### 🔧 function: `calculateSimilarity`

**Encontrado en:**
- 🔒 `src\core\performance\PerformanceController.js` (línea 891)
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 1223)

### 🔧 function: `getStatus`

**Encontrado en:**
- 🔒 `src\core\performance\PerformanceController.js` (línea 1153)
- 🔒 `src\core\resilience\ResilienceController.js` (línea 773)
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 573)
- 🔒 `src\utils\proactiveMonitor.js` (línea 445)
- 🔒 `src\utils\resilience.js` (línea 164)

### 🔧 function: `execute`

**Encontrado en:**
- 🔒 `src\core\resilience\ResilienceController.js` (línea 53)
- 🔒 `src\services\agentExecutor.js` (línea 113)
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 85)
- 🔒 `src\services\simpleAgentExecutor.js` (línea 52)
- 🔒 `src\utils\resilience.js` (línea 46)

### 🔧 function: `transitionToOpen`

**Encontrado en:**
- 🔒 `src\core\resilience\ResilienceController.js` (línea 144)
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 351)

### 🔧 function: `transitionToHalfOpen`

**Encontrado en:**
- 🔒 `src\core\resilience\ResilienceController.js` (línea 154)
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 364)

### 🔧 function: `transitionToClosed`

**Encontrado en:**
- 🔒 `src\core\resilience\ResilienceController.js` (línea 164)
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 344)

### 🔧 function: `performHealthCheck`

**Encontrado en:**
- 🔒 `src\core\resilience\ResilienceController.js` (línea 222)
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 540)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 644)
- 🔒 `src\utils\proactiveMonitor.js` (línea 100)

### 🔧 function: `registerService`

**Encontrado en:**
- 🔒 `src\core\resilience\ResilienceController.js` (línea 305)
- 🔒 `src\services\serviceRegistry.js` (línea 18)

### 🔧 function: `evaluateSystemHealth`

**Encontrado en:**
- 🔒 `src\core\resilience\ResilienceController.js` (línea 470)
- 🔒 `src\utils\proactiveMonitor.js` (línea 315)

### 🔧 function: `stopMonitoring`

**Encontrado en:**
- 🔒 `src\core\resilience\ResilienceController.js` (línea 589)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 155)

### 🔧 function: `getSystemHealth`

**Encontrado en:**
- 🔒 `src\core\resilience\ResilienceController.js` (línea 648)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 1309)

### 🔧 function: `restartService`

**Encontrado en:**
- 🔒 `src\core\resilience\ResilienceController.js` (línea 701)
- 🔒 `src\services\serviceRegistry.js` (línea 30)

### 🔧 function: `executeWithProtection`

**Encontrado en:**
- 🔒 `src\core\resilience\ResilienceController.js` (línea 749)
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 175)

### 🔧 function: `processExcelFile`

**Encontrado en:**
- 🔒 `src\excel\processor.js` (línea 87)
- 🔒 `src\scripts\db\generateSQLFromExcel.js` (línea 41)
- 🔒 `src\scripts\db\importExcelData.js` (línea 43)

### 🔧 function: `generate`

**Encontrado en:**
- 🔒 `src\scripts\chroma\index_intentions.js` (línea 22)
- 🔒 `src\scripts\chroma\index_knowledge.js` (línea 28)
- 🔒 `src\services\conversationMemory.js` (línea 65)
- 🔒 `src\services\semanticCache.js` (línea 22)
- 🔒 `src\services\semanticRouter.js` (línea 23)
- 🔒 `src\services\tools.js` (línea 72)
- 🔒 `src\utils\qwenLocal.js` (línea 76)

### 🔧 function: `executeMigrationStrategy`

**Encontrado en:**
- 🔒 `src\scripts\chroma\migrate_to_task_prefixes.js` (línea 198)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 826)

### 🔧 function: `parsePrice`

**Encontrado en:**
- 🔒 `src\scripts\db\convertMarkdownToPostgreSQL.js` (línea 347)
- 🔒 `src\services\markdownContextEnricher.js` (línea 361)

### 🔧 function: `parseSheetData`

**Encontrado en:**
- 🔒 `src\scripts\db\generateSQLFromExcel.js` (línea 78)
- 🔒 `src\scripts\db\importExcelData.js` (línea 85)

### 🔧 function: `looksLikeHeader`

**Encontrado en:**
- 🔒 `src\scripts\db\generateSQLFromExcel.js` (línea 103)
- 🔒 `src\scripts\db\importExcelData.js` (línea 127)

### 🔧 function: `detectColumns`

**Encontrado en:**
- 🔒 `src\scripts\db\generateSQLFromExcel.js` (línea 118)
- 🔒 `src\scripts\db\importExcelData.js` (línea 150)

### 🔧 function: `parseDataRow`

**Encontrado en:**
- 🔒 `src\scripts\db\generateSQLFromExcel.js` (línea 196)
- 🔒 `src\scripts\db\importExcelData.js` (línea 203)

### 🔧 function: `cleanup`

**Encontrado en:**
- 🔒 `src\security\advancedRateLimiter.js` (línea 293)
- 🔒 `src\security\authLayer.js` (línea 798)
- 🔒 `src\utils\cache.js` (línea 237)

### 🔧 function: `checkRateLimit`

**Encontrado en:**
- 🔒 `src\security\advancedRateLimiter.js` (línea 451)
- 🔒 `src\security\authLayer.js` (línea 633)

### 🔧 function: `enableBypass`

**Encontrado en:**
- 🔒 `src\security\advancedRateLimiter.js` (línea 740)
- 🔒 `src\security\authLayer.js` (línea 838)
- 🔒 `src\security\inputValidator.js` (línea 444)

### 🔧 function: `middleware`

**Encontrado en:**
- 🔒 `src\security\advancedRateLimiter.js` (línea 745)
- 🔒 `src\security\authLayer.js` (línea 871)
- 🔒 `src\security\inputValidator.js` (línea 449)

### 🔧 function: `validate`

**Encontrado en:**
- 🔒 `src\security\inputValidator.js` (línea 24)
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 1121)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 1544)
- 🔒 `src\utils\validators.js` (línea 874)

### 🔧 function: `searchClientHistory`

**Encontrado en:**
- 🔒 `src\services\clientHistorySearchEngine.js` (línea 64)
- 🔒 `src\services\conversationMemory.js` (línea 984)

### 🔧 function: `searchInClientHistory`

**Encontrado en:**
- 🔒 `src\services\clientHistorySearchEngine.js` (línea 512)
- 🔒 `src\services\conversationMemory.js` (línea 1006)

### 🔧 function: `getCachedResult`

**Encontrado en:**
- 🔒 `src\services\clientHistorySearchEngine.js` (línea 711)
- 🔒 `src\services\deterministicSearchEngine.js` (línea 530)

### 🔧 function: `generateCacheKey`

**Encontrado en:**
- 🔒 `src\services\clientHistorySearchEngine.js` (línea 737)
- 🔒 `src\utils\llmJudge.js` (línea 312)

### 🔧 function: `clearCache`

**Encontrado en:**
- 🔒 `src\services\clientHistorySearchEngine.js` (línea 783)
- 🔒 `src\services\markdownMetadataExtractor.js` (línea 531)
- 🔒 `src\services\tools.js` (línea 425)

### 🔧 function: `resetMetrics`

**Encontrado en:**
- 🔒 `src\services\clientHistorySearchEngine.js` (línea 791)
- 🔒 `src\services\deterministicSearchEngine.js` (línea 800)
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 545)
- 🔒 `src\services\metadataEnhancer.js` (línea 687)
- 🔒 `src\utils\cache.js` (línea 146)

### 🔧 function: `generateQuery`

**Encontrado en:**
- 🔒 `src\services\conversationMemory.js` (línea 99)
- 🔒 `src\services\tools.js` (línea 106)

### 🔧 function: `generateDocument`

**Encontrado en:**
- 🔒 `src\services\conversationMemory.js` (línea 112)
- 🔒 `src\services\tools.js` (línea 119)

### 🔧 function: `buildWhereFilter`

**Encontrado en:**
- 🔒 `src\services\conversationMemory.js` (línea 754)
- 🔒 `src\services\deterministicSearchEngine.js` (línea 656)

### 🔧 function: `classifyResponseType`

**Encontrado en:**
- 🔒 `src\services\conversationMemory.js` (línea 783)
- 🔒 `src\services\semanticChunker.js` (línea 683)

### 🔧 function: `getHourCategory`

**Encontrado en:**
- 🔒 `src\services\conversationMemory.js` (línea 799)
- 🔒 `src\services\semanticChunker.js` (línea 696)

### 🔧 function: `calculateSystemHealth`

**Encontrado en:**
- 🔒 `src\services\conversationMemory.js` (línea 900)
- 🔒 `src\services\dynamicLimitOptimizer.js` (línea 653)
- 🔒 `src\services\simpleDeduplicationEngine.js` (línea 650)

### 🔧 function: `getArchitecturalHealth`

**Encontrado en:**
- 🔒 `src\services\conversationMemory.js` (línea 1160)
- 🔒 `src\services\tools.js` (línea 1021)

### 🔧 function: `detectQueryContext`

**Encontrado en:**
- 🔒 `src\services\deterministicSearchEngine.js` (línea 452)
- 🔒 `src\services\dynamicLimitOptimizer.js` (línea 268)

### 🔧 function: `cleanupCache`

**Encontrado en:**
- 🔒 `src\services\deterministicSearchEngine.js` (línea 588)
- 🔒 `src\utils\llmJudge.js` (línea 430)

### 🔧 function: `containsAny`

**Encontrado en:**
- 🔒 `src\services\deterministicSearchEngine.js` (línea 652)
- 🔒 `src\services\dynamicLimitOptimizer.js` (línea 534)
- 🔒 `src\services\semanticChunker.js` (línea 676)
- 🔒 `src\services\validatedEmbeddingEngine.js` (línea 675)

### 🔧 function: `recordMetrics`

**Encontrado en:**
- 🔒 `src\services\deterministicSearchEngine.js` (línea 686)
- 🔒 `src\services\simpleDeduplicationEngine.js` (línea 588)

### 🔧 function: `getContextHealth`

**Encontrado en:**
- 🔒 `src\services\deterministicSearchEngine.js` (línea 749)
- 🔒 `src\services\dynamicLimitOptimizer.js` (línea 620)

### 🔧 function: `performMaintenance`

**Encontrado en:**
- 🔒 `src\services\deterministicSearchEngine.js` (línea 782)
- 🔒 `src\services\dynamicLimitOptimizer.js` (línea 683)
- 🔒 `src\services\simpleDeduplicationEngine.js` (línea 686)

### 🔧 function: `executeWithTimeout`

**Encontrado en:**
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 204)
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 334)
- 🔒 `src\utils\resilience.js` (línea 81)

### 🔧 function: `recordFailure`

**Encontrado en:**
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 269)
- 🔒 `src\utils\failureHandler.js` (línea 35)
- 🔒 `test\integration-test.js` (línea 290)

### 🔧 function: `reset`

**Encontrado en:**
- 🔒 `src\services\embeddingCircuitBreaker.js` (línea 636)
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 591)
- 🔒 `src\utils\performanceMonitor.js` (línea 483)
- 🔒 `src\utils\resilience.js` (línea 149)

### 🔧 function: `initializeCache`

**Encontrado en:**
- 🔒 `src\services\markdownContextEnricher.js` (línea 123)
- 🔒 `src\services\markdownMetadataExtractor.js` (línea 100)
- 🔒 `src\services\semanticCache.js` (línea 42)

### 🔧 function: `extractBrandFromFilename`

**Encontrado en:**
- 🔒 `src\services\markdownContextEnricher.js` (línea 201)
- 🔒 `src\services\markdownMetadataExtractor.js` (línea 265)

### 🔧 function: `getBrandInfo`

**Encontrado en:**
- 🔒 `src\services\markdownContextEnricher.js` (línea 603)
- 🔒 `src\services\markdownMetadataExtractor.js` (línea 360)

### 🔧 function: `getCacheStats`

**Encontrado en:**
- 🔒 `src\services\markdownContextEnricher.js` (línea 615)
- 🔒 `src\services\markdownMetadataExtractor.js` (línea 503)
- 🔒 `src\utils\cache.js` (línea 622)

### 🔧 function: `forceRefresh`

**Encontrado en:**
- 🔒 `src\services\markdownContextEnricher.js` (línea 628)
- 🔒 `src\services\markdownMetadataExtractor.js` (línea 522)

### 🔧 function: `healthCheck`

**Encontrado en:**
- 🔒 `src\services\markdownMetadataExtractor.js` (línea 547)
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 1266)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 1874)
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 636)

### 🔧 function: `normalizeQuery`

**Encontrado en:**
- 🔒 `src\services\priceExtractionSystem.js` (línea 284)
- 🔒 `src\utils\cache.js` (línea 610)
- 🔒 `src\utils\validators.js` (línea 440)

### 🔧 function: `getValidationStats`

**Encontrado en:**
- 🔒 `src\services\tools.js` (línea 433)
- 🔒 `src\services\validatedEmbeddingEngine.js` (línea 825)

### 🔧 function: `updateCoherenceHistory`

**Encontrado en:**
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 959)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 523)

### 🔧 function: `get`

**Encontrado en:**
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 1100)
- 🔒 `src\utils\cache.js` (línea 25)

### 🔧 function: `set`

**Encontrado en:**
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 1112)
- 🔒 `src\utils\cache.js` (línea 44)

### 🔧 function: `levenshteinDistance`

**Encontrado en:**
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 1246)
- 🔒 `src\utils\validators.js` (línea 15)

### 🔧 function: `resolve`

**Encontrado en:**
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 1377)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 1929)

### 🔧 function: `stop`

**Encontrado en:**
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 2052)
- 🔒 `src\utils\proactiveMonitor.js` (línea 79)

### 🔧 function: `updateConfig`

**Encontrado en:**
- 🔒 `src\services\resilience\ResilienceManager.js` (línea 628)
- 🔒 `src\utils\failureHandler.js` (línea 270)

### 🔧 function: `getStats`

**Encontrado en:**
- 🔒 `src\utils\conversationContext.js` (línea 445)
- 🔒 `src\utils\llmJudge.js` (línea 392)
- 🔒 `src\utils\resilience.js` (línea 305)

### 🏗️ class: `LangChainEmbeddingAdapter`

**Encontrado en:**
- 🔒 `src\scripts\chroma\index_intentions.js` (línea 17)
- 🔒 `src\scripts\chroma\index_knowledge.js` (línea 23)
- 🔒 `src\services\semanticCache.js` (línea 17)
- 🔒 `src\services\semanticRouter.js` (línea 18)

### 🏗️ class: `OllamaError`

**Encontrado en:**
- 🔒 `src\services\agentExecutor.js` (línea 14)
- 🔒 `src\services\simpleAgentExecutor.js` (línea 13)

### 🏗️ class: `EnhancedLangChainEmbeddingAdapter`

**Encontrado en:**
- 🔒 `src\services\conversationMemory.js` (línea 55)
- 🔒 `src\services\tools.js` (línea 62)

### 🏗️ class: `CrossSourceValidator`

**Encontrado en:**
- 🔒 `src\services\tools.js` (línea 148)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 1672)

### 🏗️ class: `ConsistencyValidator`

**Encontrado en:**
- 🔒 `src\services\knowledge\KnowledgeCoherenceLayer.js` (línea 1120)
- 🔒 `src\services\knowledge\TemporalConsistencyEngine.js` (línea 1543)



---

## 🔗 Relaciones entre Archivos

**Mapa de dependencias del proyecto WhatsAppAut:**

### 📄 eslint.config.js

**Importa de:**
- 📁 `@eslint/js` → ``

### 📄 whatsapp_analyzer.js

**Importa de:**
- 📁 `fs` → ``
- 📁 `path` → ``

### 📄 config\config.js

**Importa de:**
- 📁 `../src/utils/logger` → ``

### 📄 src\bot.js

**Importa de:**
- 📁 `whatsapp-web.js` → `Client, LocalAuth`
- 📁 `qrcode-terminal` → ``
- 📁 `../config/config` → ``
- 📁 `./database/pg` → `initializeDatabase`
- 📁 `./utils/chatState` → `isChatPaused`
- 📁 `./utils/logger` → ``
- 📁 `./services/agentExecutor` → `SalvaCellAgentExecutor, OllamaError`
- 📁 `./core/OrchestrationController` → ``
- 📁 `./services/serviceRegistry` → `registerService`

### 📄 src\auth\admin.js

**Importa de:**
- 📁 `../database/pg` → `pool`

### 📄 src\core\OrchestrationController.js

**Importa de:**
- 📁 `../utils/logger` → ``
- 📁 `../../config/config` → ``
- 📁 `./performance/PerformanceController` → ``
- 📁 `./resilience/ResilienceController` → `resilienceController`
- 📁 `./intelligence/IntelligenceService` → `adaptiveLearningEngine, predictiveAnalyticsEngine, multiModalReasoningEngine`
- 📁 `./intelligence/EscalationService` → `adminEscalationSystem, uncertaintyDetector`

### 📄 src\core\intelligence\EscalationService.js

**Importa de:**
- 📁 `../../utils/logger` → ``
- 📁 `../../../config/config` → ``
- 📁 `path` → ``
- 📁 `fs` → ``

### 📄 src\core\intelligence\IntelligenceService.js

**Importa de:**
- 📁 `../../utils/logger` → ``
- 📁 `../../database/pg` → `initializeDatabase`
- 📁 `../../../config/config` → ``

### 📄 src\core\intelligence\ResponseService.js

**Importa de:**
- 📁 `../../utils/logger` → ``
- 📁 `../../../config/config` → ``

### 📄 src\core\performance\PerformanceController.js

**Importa de:**
- 📁 `worker_threads` → `Worker`
- 📁 `perf_hooks` → `performance`
- 📁 `../../utils/logger` → ``
- 📁 `../../utils/cache` → `LRUCache, MetricsLRUCache`
- 📁 `../../services/embeddingEngine` → `getEmbeddingEngine`
- 📁 `../../../config/config` → ``

### 📄 src\core\resilience\ResilienceController.js

**Importa de:**
- 📁 `../../utils/logger` → ``
- 📁 `events` → `EventEmitter`
- 📁 `../../services/serviceRegistry` → `services, restartService`
- 📁 `../../../config/config` → ``

### 📄 src\database\pg.js

**Importa de:**
- 📁 `pg` → `Pool`
- 📁 `../utils/logger` → ``

### 📄 src\excel\processor.js

**Importa de:**
- 📁 `xlsx` → ``
- 📁 `../database/pg` → `pool`

### 📄 src\monitoring\intelligentMonitor.js

**Importa de:**
- 📁 `events` → ``
- 📁 `../utils/logger` → ``

### 📄 src\scripts\architectural_health_check.js

**Importa de:**
- 📁 `../../utils/logger` → ``
- 📁 `node-fetch` → ``
- 📁 `pg` → `Pool`

### 📄 src\scripts\convert_excel_to_markdown.py

**Importa de:**
- 📁 `datetime` → `datetime`
- 📁 `pandas as pd` → ``
- 📁 `argparse` → ``
- 📁 `os` → ``
- 📁 `datetime` → ``

### 📄 src\scripts\chroma\clear_cache_collection.js

**Importa de:**
- 📁 `chromadb` → `ChromaClient`
- 📁 `../../utils/logger` → ``

### 📄 src\scripts\chroma\index_intentions.js

**Importa de:**
- 📁 `chromadb` → `ChromaClient`
- 📁 `../../services/embeddingEngine` → `embeddingEngine`
- 📁 `../../../intentions_dataset.json` → ``
- 📁 `../../utils/logger` → ``

### 📄 src\scripts\chroma\index_knowledge.js

**Importa de:**
- 📁 `chromadb` → `ChromaClient`
- 📁 `../../services/embeddingEngine` → `embeddingEngine`
- 📁 `../../database/pg` → `pool`
- 📁 `../../utils/logger` → ``
- 📁 `fs` → ``
- 📁 `path` → ``

### 📄 src\scripts\chroma\index_markdown_prices.js

**Importa de:**
- 📁 `fs` → ``
- 📁 `path` → ``
- 📁 `chromadb` → `ChromaClient`
- 📁 `../../services/embeddingEngine` → `embeddingEngine`
- 📁 `../../utils/logger` → ``

### 📄 src\scripts\chroma\migrate_to_task_prefixes.js

**Importa de:**
- 📁 `chromadb` → `ChromaClient`
- 📁 `../../utils/logger` → ``

### 📄 src\scripts\db\convertMarkdownToPostgreSQL.js

**Importa de:**
- 📁 `fs` → ``
- 📁 `path` → ``
- 📁 `../../database/pg` → `pool`

### 📄 src\scripts\db\generateSQLFromExcel.js

**Importa de:**
- 📁 `xlsx` → ``
- 📁 `path` → ``
- 📁 `fs` → ``

### 📄 src\scripts\db\importExcelData.js

**Importa de:**
- 📁 `xlsx` → ``
- 📁 `path` → ``
- 📁 `../../database/pg` → `pool`

### 📄 src\scripts\db\migrateConversations.js

**Importa de:**
- 📁 `../../database/pg` → `pool`
- 📁 `../../services/conversationMemory` → `conversationMemory`
- 📁 `../../utils/logger` → ``

### 📄 src\scripts\db\seed_proactive_knowledge.js

**Importa de:**
- 📁 `../../database/pg` → `pool`
- 📁 `../../utils/logger` → ``

### 📄 src\scripts\db\verifyMigration.js

**Importa de:**
- 📁 `../../database/pg` → `pool`
- 📁 `../../services/conversationMemory` → `conversationMemory`
- 📁 `../../services/tools` → `tools`

### 📄 src\scripts\evals\run_evals.js

**Importa de:**
- 📁 `fs` → ``
- 📁 `path` → ``
- 📁 `../../services/simpleAgentExecutor` → `SimpleAgentExecutor`
- 📁 `../../database/pg` → `initializeDatabase`
- 📁 `../../utils/logger` → ``

### 📄 src\security\advancedRateLimiter.js

**Importa de:**
- 📁 `uuid` → `v4: uuidv4`
- 📁 `../utils/logger` → ``

### 📄 src\security\authLayer.js

**Importa de:**
- 📁 `crypto` → ``
- 📁 `uuid` → `v4: uuidv4`
- 📁 `../utils/logger` → ``
- 📁 `../../config/config` → ``

### 📄 src\security\inputValidator.js

**Importa de:**
- 📁 `../utils/logger` → ``
- 📁 `uuid` → `v4: uuidv4`

### 📄 src\services\agentExecutor.js

**Importa de:**
- 📁 `langchain/agents` → `AgentExecutor, createReactAgent`
- 📁 `@langchain/community/chat_models/ollama` → `ChatOllama`
- 📁 `@langchain/core/prompts` → `PromptTemplate`
- 📁 `rate-limiter-flexible` → `RateLimiterMemory`
- 📁 `./tools` → `tools`
- 📁 `../utils/logger` → ``
- 📁 `../../config/config` → ``
- 📁 `./semanticCache` → `findInCache, addToCache`
- 📁 `./guardrails` → `Guardrails`

### 📄 src\services\clientHistorySearchEngine.js

**Importa de:**
- 📁 `../utils/logger` → ``

### 📄 src\services\conversationMemory.js

**Importa de:**
- 📁 `chromadb` → `ChromaClient`
- 📁 `../database/pg` → `pool`
- 📁 `./embeddingEngine` → `embeddingEngine`
- 📁 `./semanticChunker` → `SemanticChunker`
- 📁 `./deterministicSearchEngine` → `DeterministicSearchEngine`
- 📁 `./dynamicLimitOptimizer` → `DynamicLimitOptimizer`
- 📁 `./markdownContextEnricher` → `MarkdownContextEnricher`
- 📁 `./simpleDeduplicationEngine` → `SimpleDeduplicationEngine`
- 📁 `./metadataEnhancer` → `MetadataEnhancer`
- 📁 `./clientHistorySearchEngine` → `ClientHistorySearchEngine`
- 📁 `../utils/logger` → ``
- 📁 `perf_hooks` → `performance`
- 📁 `url` → `URL`

### 📄 src\services\deterministicSearchEngine.js

**Importa de:**
- 📁 `crypto` → ``
- 📁 `../utils/logger` → ``

### 📄 src\services\dynamicLimitOptimizer.js

**Importa de:**
- 📁 `../utils/logger` → ``

### 📄 src\services\embeddingCircuitBreaker.js

**Importa de:**
- 📁 `../utils/logger` → ``

### 📄 src\services\embeddingEngine.js

**Importa de:**
- 📁 `@langchain/community/embeddings/ollama` → `OllamaEmbeddings`
- 📁 `../utils/logger` → ``
- 📁 `../utils/resilience` → `retryHandler`

### 📄 src\services\guardrails.js

**Importa de:**
- 📁 `../utils/logger` → ``
- 📁 `../utils/config` → ``

### 📄 src\services\hallucinationDetector.js

**Importa de:**
- 📁 `../utils/validators` → `responseValidatorPipeline`

### 📄 src\services\markdownContextEnricher.js

**Importa de:**
- 📁 `fs` → ``
- 📁 `path` → ``
- 📁 `../utils/logger` → ``

### 📄 src\services\markdownMetadataExtractor.js

**Importa de:**
- 📁 `fs` → ``
- 📁 `path` → ``
- 📁 `js-yaml` → ``
- 📁 `../utils/logger` → ``

### 📄 src\services\metadataEnhancer.js

**Importa de:**
- 📁 `./markdownMetadataExtractor` → `MarkdownMetadataExtractor`
- 📁 `../utils/logger` → ``

### 📄 src\services\priceExtractionSystem.js

**Importa de:**
- 📁 `../database/pg` → `pool`
- 📁 `chromadb` → `ChromaClient`
- 📁 `./embeddingEngine` → `getEmbeddingEngine`
- 📁 `./knowledge/KnowledgeCoherenceLayer` → `KnowledgeCoherenceLayer`
- 📁 `../utils/logger` → ``
- 📁 `@langchain/community/chat_models/ollama` → `ChatOllama`
- 📁 `@langchain/core/output_parsers` → `JsonOutputParser`
- 📁 `../../config/config` → ``

### 📄 src\services\semanticCache.js

**Importa de:**
- 📁 `chromadb` → `ChromaClient`
- 📁 `./embeddingEngine` → `getEmbeddingEngine`
- 📁 `../utils/logger` → ``
- 📁 `../utils/resilience` → `retryHandler`

### 📄 src\services\semanticChunker.js

**Importa de:**
- 📁 `../utils/logger` → ``
- 📁 `./embeddingEngine` → `embeddingEngine`

### 📄 src\services\semanticRouter.js

**Importa de:**
- 📁 `chromadb` → `ChromaClient`
- 📁 `./embeddingEngine` → `embeddingEngine`
- 📁 `../utils/logger` → ``

### 📄 src\services\serviceRegistry.js

**Importa de:**
- 📁 `../utils/logger` → ``

### 📄 src\services\simpleAgentExecutor.js

**Importa de:**
- 📁 `@langchain/community/chat_models/ollama` → `ChatOllama`
- 📁 `rate-limiter-flexible` → `RateLimiterMemory`
- 📁 `./tools` → `tools`
- 📁 `../utils/logger` → ``
- 📁 `../../config/config` → ``
- 📁 `./semanticCache` → `findInCache, addToCache`
- 📁 `./guardrails` → `Guardrails`

### 📄 src\services\simpleDeduplicationEngine.js

**Importa de:**
- 📁 `./markdownContextEnricher` → `MarkdownContextEnricher`
- 📁 `../utils/logger` → ``

### 📄 src\services\tools.js

**Importa de:**
- 📁 `langchain/tools` → `DynamicTool`
- 📁 `chromadb` → `ChromaClient`
- 📁 `./embeddingEngine` → `embeddingEngine`
- 📁 `../database/pg` → `pool`
- 📁 `./priceExtractionSystem` → `priceExtractionSystem`
- 📁 `./conversationMemory` → `conversationMemory`
- 📁 `./deterministicSearchEngine` → `DeterministicSearchEngine`
- 📁 `./dynamicLimitOptimizer` → `DynamicLimitOptimizer`
- 📁 `./markdownContextEnricher` → `MarkdownContextEnricher`
- 📁 `../utils/logger` → ``
- 📁 `perf_hooks` → `performance`

### 📄 src\services\validatedEmbeddingEngine.js

**Importa de:**
- 📁 `../utils/logger` → ``
- 📁 `./embeddingEngine` → `EnhancedEmbeddingEngine`

### 📄 src\services\classifiers\qwenClassifier.js

**Importa de:**
- 📁 `../../utils/qwenLocal` → ``
- 📁 `../../utils/logger` → ``
- 📁 `../../../intentions_dataset.json` → ``

### 📄 src\services\eventSourcing\EventStore.js

**Importa de:**
- 📁 `fs` → ``
- 📁 `path` → ``
- 📁 `uuid` → `v4: uuidv4`
- 📁 `events` → ``

### 📄 src\services\knowledge\KnowledgeCoherenceLayer.js

**Importa de:**
- 📁 `../../utils/logger` → ``
- 📁 `../../database/pg` → `pool`
- 📁 `../embeddingEngine` → `embeddingEngine`
- 📁 `uuid` → `v4: uuidv4`
- 📁 `events` → ``

### 📄 src\services\knowledge\TemporalConsistencyEngine.js

**Importa de:**
- 📁 `../../utils/logger` → ``
- 📁 `../embeddingEngine` → `embeddingEngine`
- 📁 `../../database/pg` → `pool`
- 📁 `uuid` → `v4: uuidv4`
- 📁 `events` → ``
- 📁 `crypto` → ``

### 📄 src\services\resilience\ResilienceManager.js

**Importa de:**
- 📁 `../../utils/logger` → ``
- 📁 `../../utils/resilience` → `CircuitBreaker, apiRateLimiter`

### 📄 src\utils\cache.js

**Importa de:**
- 📁 `./logger` → ``

### 📄 src\utils\chatState.js

**Importa de:**
- 📁 `./logger` → ``

### 📄 src\utils\claude.js

**Importa de:**
- 📁 `@anthropic-ai/sdk` → ``
- 📁 `../../config/config` → ``
- 📁 `./logger` → ``
- 📁 `../database/pg` → `getConocimientos`

### 📄 src\utils\conversationContext.js

**Importa de:**
- 📁 `./cache` → `LRUCache`
- 📁 `./logger` → ``
- 📁 `./validators` → `normalizeQuery, normalizeDeviceName, normalizeRepairType, normalizeQualityType`

### 📄 src\utils\failureHandler.js

**Importa de:**
- 📁 `../database/pg` → `pool`
- 📁 `./logger` → ``

### 📄 src\utils\intelligentRouter.js

**Importa de:**
- 📁 `./qwenLocal` → ``
- 📁 `./claude` → `interpretQuery: claudeInterpretQuery`
- 📁 `./cache` → `contextCache`
- 📁 `./logger` → ``

### 📄 src\utils\llmJudge.js

**Importa de:**
- 📁 `@langchain/anthropic` → `ChatAnthropic`
- 📁 `./logger` → ``
- 📁 `./cache` → `LRUCache`
- 📁 `./resilience` → `apiRateLimiter`

### 📄 src\utils\logger.js

**Importa de:**
- 📁 `winston` → ``
- 📁 `fs` → ``
- 📁 `path` → ``

### 📄 src\utils\performanceMonitor.js

**Importa de:**
- 📁 `./logger` → ``
- 📁 `./cache` → `MetricsLRUCache`

### 📄 src\utils\proactiveMonitor.js

**Importa de:**
- 📁 `./logger` → ``
- 📁 `../database/pg` → `pool`
- 📁 `./resilience` → `CircuitBreaker, apiRateLimiter`
- 📁 `./failureHandler` → ``
- 📁 `./conversationContext` → ``
- 📁 `./conversationFSM` → `conversationFSM`

### 📄 src\utils\qwenLocal.js

**Importa de:**
- 📁 `axios` → ``
- 📁 `./logger` → ``

### 📄 src\utils\resilience.js

**Importa de:**
- 📁 `./cache` → `LRUCache`
- 📁 `./logger` → ``

### 📄 src\utils\validators.js

**Importa de:**
- 📁 `./logger` → ``

### 📄 test\integration-test.js

**Importa de:**
- 📁 `../src/utils/logger` → ``
- 📁 `../src/core/OrchestrationController` → ``

### 📄 test\test-basic.js

**Importa de:**
- 📁 `../src/utils/logger` → ``
- 📁 `../config/config` → ``
- 📁 `../src/database/pg` → `initializeDatabase`
- 📁 `../src/services/agentExecutor` → `SalvaCellAgentExecutor`

### 📄 test\test-db-connection.js

**Importa de:**
- 📁 `pg` → `Pool`



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

*Análisis generado automáticamente el 18/7/2025, 12:08:09 a.m.*
