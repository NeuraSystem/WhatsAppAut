
# Plan de Mejora y Presentación del Proyecto SalvaCell AI Bot

Este documento presenta el proyecto del Bot de WhatsApp con IA para SalvaCell, describe su potencial una vez terminado y detalla un plan de mejora basado en una revisión técnica, alineado con las mejores prácticas y documentación oficial de las herramientas clave utilizadas: **PostgreSQL**, **LangchainJS**, **Ollama** (con nomic-embed-text y qwen), y **ChromaDB**, entre otras.

---

## 1. Presentación del Proyecto: SalvaCell AI Bot

### 1.1. ¿Qué es el SalvaCell AI Bot?

El SalvaCell AI Bot es una solución de inteligencia artificial conversacional diseñada para ser integrada como un agente virtual en WhatsApp. Su propósito principal es automatizar y mejorar la interacción con los clientes de SalvaCell, proporcionando respuestas rápidas, precisas y personalizadas sobre los servicios de reparación de celulares.

Utilizando una arquitectura híbrida, el bot combina la potencia de los modelos de lenguaje local (Ollama) con bases de datos estructuradas (PostgreSQL) y vectoriales (ChromaDB), orquestado por un framework de agentes (LangchainJS), para entender las consultas de los clientes, buscar información relevante y generar respuestas coherentes.

### 1.2. Visión del Bot Terminado: Un Asistente Inteligente y Eficiente

Una vez que el proyecto esté completamente desarrollado y optimizado, el SalvaCell AI Bot funcionará como un asistente virtual proactivo y eficiente, capaz de:

* **Entender el Lenguaje Natural:** Procesar y comprender consultas de clientes expresadas en lenguaje natural, identificando la intención (ej. preguntar precio, disponibilidad, tiempo de reparación) y las entidades clave (ej. modelo de teléfono, tipo de reparación).
* **Proporcionar Información Precisa de Precios y Servicios:** Acceder a una base de datos actualizada para ofrecer precios exactos de reparaciones para modelos específicos de celulares, tiempos estimados de servicio y detalles sobre la disponibilidad.
* **Responder Preguntas Frecuentes:** Utilizar una base de conocimiento general (almacenada semánticamente) para responder a preguntas comunes sobre el negocio de SalvaCell que no estén directamente relacionadas con precios específicos, como políticas de garantía, ubicación, horarios, etc.
* **Recordar Contexto Conversacional:** Mantener un historial de interacciones con cada cliente (memoria conversacional) para ofrecer respuestas personalizadas, recordar consultas pasadas y crear una experiencia de usuario más fluida y continua.
* **Manejar Casos de Uso Comunes:** Guiar a los clientes a través de flujos de conversación típicos, como solicitar una cotización, entender el proceso de reparación o preguntar sobre el estado de una reparación (si se integra con un sistema de seguimiento).
* **Escalar a Agentes Humanos:** Identificar situaciones complejas, consultas fuera de alcance o clientes insatisfechos para escalar la conversación a un agente humano de SalvaCell, proporcionando un resumen relevante del historial de la conversación.
* **Mantener la Coherencia y Veracidad:** Utilizar mecanismos de validación cruzada y guardrails para asegurar que la información proporcionada sea consistente entre diferentes fuentes y que las respuestas sean seguras y apropiadas.

### 1.3. Impacto para SalvaCell (Ejemplos en Producción)

La implementación exitosa del SalvaCell AI Bot tendrá un impacto significativo y positivo en las operaciones y la experiencia del cliente de SalvaCell:

* **Reducción de la Carga del Personal:** Al automatizar las respuestas a consultas frecuentes (precios, disponibilidad, horarios), el bot liberará al personal de SalvaCell para que se enfoque en tareas más complejas que requieran interacción humana y experiencia técnica.
  * *Ejemplo en Producción:* Un cliente envía un mensaje preguntando: "¿Cuánto cuesta cambiar la pantalla de un Samsung A54?". El bot, de forma autónoma, consulta la base de datos, encuentra el precio exacto y responde en segundos, sin necesidad de que un empleado intervenga. Esto reduce el tiempo de respuesta y permite que el personal se dedique a reparaciones o casos más difíciles.
* **Mejora en el Tiempo de Respuesta al Cliente:** Los clientes recibirán respuestas instantáneas o casi instantáneas a sus preguntas, lo que mejora su satisfacción y reduce la frustración de esperar una respuesta humana.
  * *Ejemplo en Producción:* Un cliente consulta a las 10 PM sobre el precio de una batería de iPhone 11. En lugar de esperar hasta el horario comercial del día siguiente, recibe la información al instante, pudiendo tomar una decisión más rápida sobre si visitar la tienda.
* **Disponibilidad 24/7:** El bot puede operar las 24 horas del día, los 7 días de la semana, respondiendo consultas fuera del horario laboral y fines de semana, capturando interés y proporcionando información preliminar en todo momento.
  * *Ejemplo en Producción:* Un cliente potencial investigando opciones de reparación un domingo por la tarde puede obtener información de precios y disponibilidad a través del bot, aumentando la probabilidad de que elija SalvaCell el lunes.
* **Consistencia en la Información:** El bot siempre proporcionará la información más actualizada y consistente disponible en las bases de datos, reduciendo errores humanos en la comunicación de precios o políticas.
  * *Ejemplo en Producción:* Con el bot, todos los clientes reciben el mismo precio y detalles sobre la reparación de un modelo específico, eliminando la posibilidad de que diferentes empleados citen precios ligeramente distintos por error.
* **Personalización a Escala:** Utilizando la memoria conversacional y el contexto del cliente, el bot puede adaptar sus respuestas para ser más relevantes y amigables, incluso en interacciones automatizadas.
  * *Ejemplo en Producción:* Un cliente recurrente pregunta sobre "mi teléfono". El bot, recordando de conversaciones anteriores que tiene un iPhone 12 con problemas de batería, podría preguntar "¿Te refieres a la reparación de la batería de tu iPhone 12 que comentaste la vez pasada?".
* **Recopilación de Datos Valiosos:** Las interacciones del bot pueden registrarse detalladamente (consultas, intenciones, productos mencionados, resultados de búsqueda) para proporcionar a SalvaCell información valiosa sobre las necesidades y preguntas más comunes de los clientes, lo que puede informar decisiones de inventario, marketing y capacitación del personal.
  * *Ejemplo en Producción:* Al analizar los registros del bot, SalvaCell identifica que la consulta más frecuente es sobre el precio de cambio de pantallas para modelos específicos de Samsung y iPhone. Esto puede llevar a SalvaCell a asegurar un stock adecuado de esas pantallas.

En resumen, el SalvaCell AI Bot no es solo un chatbot, sino una herramienta estratégica para escalar la atención al cliente, mejorar la eficiencia operativa y obtener insights valiosos, permitiendo a SalvaCell ofrecer un servicio más rápido, accesible y profesional.

---

## 2. Áreas de Oportunidad y Plan de Mejora Detallado

Durante la revisión del código, se identificaron varias áreas donde se pueden implementar mejoras para aumentar la robustez, mantenibilidad, eficiencia y alineación con las mejores prácticas de las herramientas utilizadas en un entorno de producción. Abordar estas áreas es crucial para garantizar el rendimiento óptimo y la fiabilidad a largo plazo del SalvaCell AI Bot.

### 2.1. Gestión Robusta de la Base de Datos (PostgreSQL)

* **Descripción del Problema:** La inicialización de la base de datos en `src/database/pg.js` realiza una verificación básica de la existencia de una tabla. Si bien es funcional, un sistema de migración de base de datos más formal es esencial para gestionar los cambios en el esquema a medida que el proyecto evoluciona, asegurando que la estructura de la base de datos esté siempre actualizada de manera controlada y reproducible en diferentes entornos (desarrollo, staging, producción).
* **Impacto en Producción si No se Resuelve:**
  * **Problemas de Implementación:** Despliegues a producción pueden fallar si el esquema de la base de datos en el entorno de producción no coincide exactamente con lo que espera el código debido a migraciones manuales o inconsistentes.
  * **Dificultad de Reversión:** Revertir a una versión anterior del código puede ser difícil si los cambios en la base de datos no se han gestionado con un sistema de migración que soporte reversiones.
  * **Inconsistencia entre Entornos:** El esquema de la base de datos podría variar entre entornos de desarrollo y producción, llevando a errores difíciles de depurar que solo aparecen en producción.
  * **Pérdida de Datos:** Errores en la aplicación manual de cambios de esquema pueden llevar a la pérdida o corrupción de datos.
* **Ejemplo en Producción (Sin Resolver):** Se despliega una nueva versión del bot que espera una columna `fecha_actualizacion` en la tabla `reparaciones`. En el servidor de producción, esta columna no fue añadida manualmente o se añadió con un nombre ligeramente diferente. Cuando el bot intenta insertar/actualizar datos en esta tabla, las consultas SQL fallan con un error como `column "fecha_actualizacion" does not exist`, causando que el bot no pueda procesar consultas de precios y dejando a los clientes sin respuesta.
  * **Fragmento de Código Relevante (`src/database/pg.js`):**
    <CODE_BLOCK>
    async function initializeDatabase() {
    try {
    const client = await pool.connect();
    console.log('Conexión exitosa con PostgreSQL');

    // Verificar que las tablas existen - Básico y no gestiona evolución
    const result = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reparaciones'`);

    if (result.rows.length === 0) {
    console.log('⚠️  Tablas no encontradas. Ejecuta: docker-compose up -d postgres');
    throw new Error('Base de datos no inicializada');
    }
    // ... otras verificaciones y lógica ...
    client.release();
    console.log('✅ Base de datos PostgreSQL inicializada correctamente');
    } catch (error) {
    console.error('❌ Error al inicializar PostgreSQL:', error.message);
    throw error;
    }
    }
    </CODE_BLOCK>
* **Argumentación y Documentación Oficial:** Los sistemas de migración de base de datos son un estándar de la industria para manejar cambios de esquema en aplicaciones versionadas. Aseguran que los cambios se apliquen de forma incremental, controlada y que puedan ser revertidos si es necesario.
  * **Documentación de PostgreSQL (Concepto de Esquemas y Versiones - aunque no directamente migración):** Aunque PostgreSQL no tiene una herramienta de migración nativa, su documentación describe cómo funcionan los esquemas y la gestión de objetos de base de datos, lo que subraya la importancia de una gestión estructurada. [https://www.postgresql.org/docs/current/ddl-schemas.html](https://www.postgresql.org/docs/current/ddl-schemas.html)
  * **Herramientas Recomendadas (Ej. `node-pg-migrate`):** Herramientas como `node-pg-migrate` para Node.js permiten definir migraciones en archivos separados, aplicar cambios, revertirlos y gestionar el estado de la base de datos.
    * **Documentación de `node-pg-migrate`:** [https://salsita.github.io/node-pg-migrate/](https://salsita.github.io/node-pg-migrate/)
* **Recomendación para Resolverlo:** Implementar un sistema formal de migración de base de datos utilizando una herramienta como `node-pg-migrate`. Definir cada cambio de esquema (creación de tablas, adición de columnas, etc.) como una migración separada. Integrar la ejecución de migraciones en el proceso de despliegue de la aplicación para asegurar que la base de datos esté actualizada antes de que el bot intente iniciar.

### 2.2. Resiliencia en la Conexión a Servicios Externos (Ollama, ChromaDB)

* **Descripción del Problema:** La inicialización y el uso de los clientes de Ollama y ChromaDB (`src/services/embeddingEngine.js`, `src/services/semanticCache.js`, `src/services/tools.js`) tienen un manejo básico de errores. Si la conexión a estos servicios falla durante la inicialización o durante una operación, el bot puede quedar en un estado no funcional para ciertas tareas sin intentar recuperarse.
* **Impacto en Producción si No se Resuelve:**
  * **Caídas del Servicio:** Si Ollama o ChromaDB no están disponibles al iniciar el bot o fallan temporalmente durante la operación, las funcionalidades que dependen de ellos (generación de embeddings, búsqueda semántica, caché) dejarán de funcionar.
  * **Experiencia del Usuario Degradada:** Los clientes que realicen consultas que requieran estas funcionalidades recibirán errores genéricos o el bot simplemente no responderá a esas preguntas.
  * **Problemas de Disponibilidad:** El bot podría no iniciar correctamente si alguno de los servicios dependientes no está disponible durante el despliegue.
* **Ejemplo en Producción (Sin Resolver):** El servidor de Ollama se reinicia o tiene un problema temporal de red. Cuando el bot intenta generar un embedding para una consulta utilizando `embeddingEngine.embedQuery`, la llamada falla. Sin un manejo de reintentos, esta operación lanza una excepción que podría no ser manejada elegantemente en todo el flujo, resultando en que el bot no pueda procesar esa consulta o futuras consultas que requieran embeddings.
  * **Fragmento de Código Relevante (`src/services/embeddingEngine.js`):**
    <CODE_BLOCK>
    function getEmbeddingEngine() {
    if (!embeddingEngineInstance) {
    try {
    embeddingEngineInstance = new OllamaEmbeddings({
    baseUrl: OLLAMA_BASE_URL,
    model: OLLAMA_EMBEDDING_MODEL,
    });
    logger.info(`EmbeddingEngine: OllamaEmbeddings inicializado...`);
    } catch (error) {
    logger.error('EmbeddingEngine: Error al inicializar OllamaEmbeddings:', error);
    // Simplemente registra el error y establece la instancia a null
    embeddingEngineInstance = null;
    }
    }
    return embeddingEngineInstance;
    }
    </CODE_BLOCK>
  * **Fragmento de Código Relevante (`src/services/semanticCache.js`):**
    <CODE_BLOCK>
    async function findInCache(userQuery, options = {}) {
    if (!cacheCollection) {
    logger.warn("El caché semántico no está disponible. Saltando búsqueda.");
    return null;
    }
    try {
    // ... lógica de caché ...
    const results = await cacheCollection.query({ /* ... */ }); // Si ChromaDB falla aquí
    // ...
    } catch (error) {
    logger.error("Error al buscar en el caché semántico:", error);
    return null; // Devuelve null, pero la operación falló
    }
    }
    </CODE_BLOCK>
* **Argumentación y Documentación Oficial:** Los sistemas distribuidos deben ser resilientes a fallos temporales de red o de servicios dependientes. Los patrones de diseño comunes incluyen reintentos con backoff exponencial y Circuit Breakers (ya implementado en parte en `bot.js` para el agente general, pero podría ser más granular). Las bibliotecas cliente a menudo proporcionan opciones para manejar la conexión y los errores.
  * **Documentación de `node-postgres` (Manejo de Errores y Conexiones):** Aunque para PostgreSQL, los conceptos de manejar errores de conexión y consultas son relevantes. [https://node-postgres.com/api/pool#events](https://node-postgres.com/api/pool#events)
  * **Documentación de LangchainJS (Manejo de Errores - General):** La documentación de Langchain menciona el manejo de errores, pero la resiliencia a nivel de red o servicio dependiente a menudo requiere envolver las llamadas. [https://js.langchain.com/docs/guides/debugging/error_handling/](https://js.langchain.com/docs/guides/debugging/error_handling/)
* **Recomendación para Resolverlo:** Implementar lógica de reintentos con backoff exponencial alrededor de las llamadas a las APIs de Ollama (a través de Langchain) y a las operaciones de ChromaDB en los servicios (`embeddingEngine.js`, `semanticCache.js`, partes de `tools.js`). Considerar bibliotecas dedicadas para reintentos si la lógica se vuelve compleja. Asegurar que los errores a nivel de servicio se propaguen o manejen de manera que no detengan completamente otras partes del bot.

### 2.3. Sofisticación y Mantenibilidad de Guardrails

* **Descripción del Problema:** La implementación actual de los guardrails en `src/services/guardrails.js` se basa en expresiones regulares y lógica de cadena simple. Esto es limitado para detectar contenido tóxico, juicios de valor sutiles o estar fuera de tema de manera efectiva en el lenguaje natural complejo. Además, las reglas están hardcodeadas, lo que dificulta su actualización y gestión sin cambios en el código.
* **Impacto en Producción si No se Resuelve:**
  * **Violaciones de Política:** El bot podría generar respuestas inapropiadas (tóxicas, fuera de tema, con opiniones) que dañen la reputación de SalvaCell o proporcionen información incorrecta/engañosa.
  * **Falsos Positivos/Negativos:** Las reglas basadas en regex son propensas a marcar contenido válido (falsos positivos) o no detectar contenido problemático (falsos negativos).
  * **Dificultad de Adaptación:** No es fácil ajustar las reglas para responder a nuevas formas de lenguaje inapropiado o a cambios en los requisitos del negocio sin modificar y desplegar código nuevo.
* **Ejemplo en Producción (Sin Resolver):** Un cliente pregunta sobre un competidor de SalvaCell. El agente podría generar una respuesta que, sin ser explícitamente ofensiva en términos de palabras clave, contenga un juicio de valor negativo implícito (ej. "Ese competidor no usa piezas originales"). Las reglas actuales basadas en regex simple probablemente no detectarían esto, pero es una violación de la política de SalvaCell de no hablar negativamente de la competencia.
  * **Fragmento de Código Relevante (`src/services/guardrails.js`):**
    <CODE_BLOCK>
    checkNoToxicity(response) {
    const toxicKeywords = [/idiota/i, /estúpido/i, /maldito/i, /grosero/i, /ofensivo/i]; // Ejemplos, expandir con un modelo de toxicidad real
    if (toxicKeywords.some(keyword => keyword.test(response))) {
    return { violation: true, message: 'Respuesta contiene lenguaje tóxico.', critical: true };
    }
    return { violation: false };
    }

    checkNoOffTopic(response, userQuery) {
    // Lógica simple basada en palabras clave, limitada
    const isBusinessRelated = businessKeywords.some(keyword => keyword.test(response) || keyword.test(userQuery));
    const isOffTopic = offTopicKeywords.some(keyword => keyword.test(response));

    if (!isBusinessRelated && isOffTopic) {
    return { violation: true, message: 'Respuesta fuera de tema.', critical: false };
    }
    return { violation: false };
    }
    </CODE_BLOCK>
* **Argumentación y Documentación Oficial:** Para guardrails más avanzados, la industria se mueve hacia enfoques que utilizan modelos de clasificación o incluso LLMs dedicados para evaluar la seguridad y la relevancia de las respuestas. La configuración externa de políticas es un patrón común.
  * **Conceptos de Salvaguardas (NeMo Guardrails - Nvidia):** Aunque es un framework separado, NeMo Guardrails ilustra la complejidad y las técnicas utilizadas en guardrails avanzados (tópicos, seguridad, formato). [https://docs.nvidia.com/nemo-guardrails/user_guide/define_guardrails.html](https://docs.nvidia.com/nemo-guardrails/user_guide/define_guardrails.html)
  * **Langchain Expression Language (LCEL) para flujos complejos:** LangchainJS permite construir flujos complejos (incluyendo pasos de validación) usando LCEL, que podría envolver las llamadas al LLM principal con validadores secundarios (quizás otro LLM). [https://js.langchain.com/docs/expression_language/](https://js.langchain.com/docs/expression_language/)
* **Recomendación para Resolverlo:** Explorar la integración con modelos de clasificación de lenguaje (quizás usando un modelo pequeño de Ollama especializado si hay uno disponible para clasificación, o un servicio externo si la precisión es crítica y justifica el costo) para las reglas de toxicidad y fuera de tema. Implementar un mecanismo para cargar las reglas y umbrales de los guardrails desde un archivo de configuración o una base de datos para facilitar su gestión. Considerar el uso de LCEL para integrar validadores más sofisticados en el flujo del agente.

### 2.4. Robustez y Adaptabilidad de la Extracción de Información (PriceExtractionSystem)

* **Descripción del Problema:** La extracción de dispositivo y servicio en `src/services/priceExtractionSystem.js` se basa principalmente en expresiones regulares y un orden fijo de patrones. Esto puede fallar con variaciones en el lenguaje del usuario, sinónimos o descripciones menos directas, limitando la capacidad del sistema para entender consultas de precios complejas o ambiguas.
* **Impacto en Producción si No se Resuelve:**
  * **Frustración del Cliente:** Los clientes cuyas consultas no se ajusten a los patrones de regex no recibirán una respuesta de precio, o recibirán una respuesta incorrecta basada en una mala extracción, lo que lleva a la frustración.
  * **Altos Índices de Fallo en Extracción:** Un porcentaje significativo de consultas de precios podría no ser procesado correctamente por el `PriceExtractionSystem`.
  * **Dependencia de Consultas Específicas:** El sistema funcionará mejor con consultas que sigan un formato esperado, en lugar de adaptarse al lenguaje natural variado de los usuarios.
* **Ejemplo en Producción (Sin Resolver):** Un cliente pregunta: "Necesito saber cuánto sale arreglar la pantalla de mi Galaxy S20 FE". El patrón regex para dispositivos <CODE_BLOCK>/(?:para\\s+(?:un\\s+)?)?(\\w+\\s+\\w+\\d+(?:\\s+\\w+)?)/i</CODE_BLOCK> podría no manejar correctamente "S20 FE" o "Galaxy S20 FE" como una única entidad de dispositivo, o no reconocer "arreglar" como sinónimo de reparación de pantalla en el contexto adecuado, llevando a que el sistema no encuentre una coincidencia exacta o difusa relevante en la base de datos.
  * **Fragmento de Código Relevante (`src/services/priceExtractionSystem.js`):**
    <CODE_BLOCK>
    extractDeviceAndService(query) {
    // Patrones comunes de dispositivos - Basado en regex fijo
    const devicePatterns = [ /* ... */ ];
    // Patrones de servicios - Basado en regex fijo y orden
    const servicePatterns = [ /* ... */ ];

    let device = '';
    let service = 'pantalla'; // Default

    // Lógica de extracción secuencial basada en regex
    for (const pattern of devicePatterns) { /* ... */ }
    for (const { pattern, service: serviceName } of servicePatterns) { /* ... */ }

    return { device, service };
    }
    </CODE_BLOCK>
* **Argumentación y Documentación Oficial:** La extracción de información (Information Extraction - IE) es un campo de PLN que utiliza técnicas más avanzadas que las simples expresiones regulares para identificar y clasificar entidades y relaciones en texto no estructurado. Para casos de uso más complejos, se recomiendan enfoques basados en modelos.
  * **Langchain Output Parsers:** Langchain proporciona Output Parsers que pueden estructurar la salida de un LLM en formatos específicos (como JSON), lo cual podría usarse con un LLM sintonizado para la extracción. [https://js.langchain.com/docs/modules/model_io/output_parsers/](https://js.langchain.com/docs/modules/model_io/output_parsers/)
  * **Bibliotecas de PLN (spaCy, NLTK - aunque NLTK es más Python):** Bibliotecas como spaCy están diseñadas para el procesamiento de lenguaje robusto, incluyendo el reconocimiento de entidades nombradas (NER) y la vinculación de entidades.
    * **Documentación de spaCy (NER):** [https://spacy.io/usage/linguistic-features#named-entities](https://spacy.io/usage/linguistic-features#named-entities)
* **Recomendación para Resolverlo:** Mejorar la etapa de extracción de información. Considerar entrenar un modelo de clasificación pequeño (quizás utilizando embeddings y un clasificador simple) o usar una biblioteca de PLN como spaCy (si es viable en el entorno Node.js, o considerar un microservicio Python) para identificar dispositivos y servicios de manera más flexible. Alternativamente, si el agente (LLM principal) es capaz, se le podría pedir que extraiga la información clave en un formato estructurado (ej. JSON) usando un Output Parser de Langchain antes de llamar a la herramienta `consultar_precio_preciso`.

### 2.5. Gestión del Ciclo de Vida del Caché Semántico (ChromaDB)

* **Descripción del Problema:** La lógica de inicialización del caché semántico en `src/services/semanticCache.js` intenta eliminar la colección al inicio ("Colección de caché rota eliminada"), lo cual puede no ser el comportamiento deseado si se busca persistir el caché entre reinicios. Además, la función `invalidateCache` identifica entradas para eliminar pero no ejecuta la operación de eliminación en ChromaDB.
* **Impacto en Producción si No se Resuelve:**
  * **Pérdida Innecesaria de Datos:** Si el bot se reinicia, el caché semántico podría borrarse por completo, perdiendo las entradas cacheadas que podrían haber acelerado futuras respuestas.
  * **Caché Stale/Ineficiente:** Sin una invalidación adecuada, el caché podría acumular entradas obsoletas o de baja coherencia, ocupando espacio y potencialmente devolviendo resultados menos relevantes.
  * **Problemas de Rendimiento a Largo Plazo:** Si el caché no se limpia o gestiona, su tamaño podría crecer descontroladamente, afectando el rendimiento de las búsquedas.
* **Ejemplo en Producción (Sin Resolver):** El bot se reinicia por mantenimiento. La lógica de inicialización del caché semántico elimina la colección existente. Durante las siguientes horas, las consultas de clientes que antes hubieran sido un "cache hit" ahora son "cache miss", lo que aumenta el tiempo de respuesta para esas consultas y la carga en el LLM principal hasta que el caché se vuelve a poblar.
  * **Fragmento de Código Relevante (`src/services/semanticCache.js`):**
    <CODE_BLOCK>
    async function initializeCache() {
    try {
    // PRIMERO: Intentar eliminar la colección rota - Puede borrar datos persistentes
    try {
    await client.deleteCollection({ name: CACHE_COLLECTION_NAME });
    logger.info("Colección de caché rota eliminada");
    } catch (deleteError) {
    logger.info("No había colección de caché previa o ya estaba eliminada");
    }

    // SEGUNDO: Crear nueva con adapter correcto - Crea siempre nueva
    cacheCollection = await client.getOrCreateCollection({
    name: CACHE_COLLECTION_NAME,
    embeddingFunction: embeddingAdapter
    });
    logger.info("Caché semántico inicializado CORRECTAMENTE con adapter compatible.");
    } catch (error) {
    logger.error("Error al inicializar el caché semántico:", error);
    cacheCollection = null;
    }
    }

    async function invalidateCache(options = {}) {
    if (!cacheCollection) return;
    // ... lógica para identificar idsToDelete ...
    if (idsToDelete.length > 0) {
    // Falta la llamada a collection.delete({ ids: idsToDelete });
    logger.info(`Entradas inválidas identificadas para eliminar: ${idsToDelete.length}`);
    }
    }
    </CODE_BLOCK>
* **Argumentación y Documentación Oficial:** Los cachés, especialmente los cachés distribuidos o persistentes como los basados en bases de datos vectoriales, requieren una gestión explícita de su ciclo de vida: inicialización segura (reutilizar si existe), adición, recuperación, y invalidación/expiración. La documentación de ChromaDB describe cómo realizar operaciones de eliminación.
  * **Documentación de ChromaDB sobre `deleteCollection` y `collection.delete`:** [https://docs.trychroma.com/usage#deleting-data](https://docs.trychroma.com/usage#deleting-data)
* **Recomendación para Resolverlo:** Modificar la función `initializeCache` para simplemente usar `client.getOrCreateCollection` sin intentar eliminar primero, a menos que haya una razón específica para forzar una reconstrucción. Completar la implementación de `invalidateCache` para ejecutar `cacheCollection.delete({ ids: idsToDelete })`. Implementar un mecanismo (por ejemplo, un trabajo programado - cron job) para llamar a `invalidateCache` periódicamente y limpiar el caché basándose en criterios de antigüedad o coherencia.

### 2.6. Configuración Externa y Centralizada

* **Descripción del Problema:** Aunque se utiliza un archivo `.env` para algunas configuraciones (`src/utils/config.js` probablemente carga estas), algunas configuraciones importantes o umbrales están hardcodeados dentro del código (ej. umbrales en `src/services/guardrails.js`, umbral de similitud del caché en `src/services/semanticCache.js`, umbrales de validación en `src/services/priceExtractionSystem.js`).
* **Impacto en Producción si No se Resuelve:**
  * **Dificultad de Ajuste:** Modificar umbrales, parámetros de guardrails o la lógica de validación requiere cambiar el código fuente y redeployar el bot.
  * **Inconsistencia entre Entornos:** Diferentes entornos (desarrollo, staging, producción) pueden necesitar configuraciones ligeramente diferentes (ej. umbrales de logging, verbosidad), lo cual es difícil de gestionar con valores hardcodeados.
  * **Menor Flexibilidad Operacional:** No se pueden ajustar aspectos del comportamiento del bot (como la agresividad del caché o la sensibilidad de los guardrails) sin un ciclo de desarrollo y despliegue.
* **Ejemplo en Producción (Sin Resolver):** Después de desplegar en producción, se observa que el caché semántico tiene una tasa de aciertos (hit rate) muy baja porque el `SIMILARITY_THRESHOLD` de 0.95 es demasiado alto para las variaciones naturales en las consultas de los usuarios. Para intentar mejorar el hit rate, es necesario modificar el código en `src/services/semanticCache.js`, cambiar `0.95` a un valor menor (ej. 0.90), reconstruir la imagen del contenedor y redeployar. Sería mucho más sencillo si este valor se pudiera cambiar en un archivo de configuración externa.
  * **Fragmento de Código Relevante (`src/services/semanticCache.js`):**
    <CODE_BLOCK>
    const SIMILARITY_THRESHOLD = process.env.SEMANTIC_CACHE_THRESHOLD || 0.95; // Umbral de similitud muy alto - Hardcodeado si no está en ENV
    </CODE_BLOCK>
  * **Fragmento de Código Relevante (`src/services/guardrails.js`):**
    <CODE_BLOCK>
    checkResponseLength(response) {
    const maxLength = 500; // Caracteres - Hardcodeado
    if (response.length > maxLength) {
    return { violation: true, message: `Respuesta excede la longitud máxima de ${maxLength} caracteres.`, critical: false };
    }
    return { violation: false };
    }
    </CODE_BLOCK>
* **Argumentación y Documentación Oficial:** El Principio de los Doce Factores para aplicaciones cloud-native recomienda almacenar la configuración en el entorno (variables de entorno) o en un sistema de configuración centralizado, separada del código base. Esto permite desplegar la misma base de código con diferentes configuraciones.
  * **The Twelve-Factor App (Config):** [https://12factor.net/config](https://12factor.net/config)
  * **Bibliotecas de Configuración (Config, dotenv):** Bibliotecas como `config` o `dotenv` (ya usado parcialmente con `.env`) en Node.js facilitan la carga de configuración desde múltiples fuentes (archivos, variables de entorno).
    * **Documentación de la biblioteca `config`:** [https://github.com/node-config/node-config](https://github.com/node-config/node-config)
* **Recomendación para Resolverlo:** Identificar todos los valores y umbrales hardcodeados relevantes para la operación y el ajuste del bot. Mover estos valores al sistema de configuración centralizado del proyecto (probablemente extendiendo el uso de `src/utils/config.js` y cargándolos desde variables de entorno o archivos de configuración). Asegurarse de que todos los módulos accedan a estos valores a través del objeto de configuración en lugar de tenerlos hardcodeados o depender solo de `process.env` disperso.

---

Este plan de mejora detallado busca abordar las áreas identificadas para hacer el SalvaCell AI Bot más robusto, mantenible y adaptable en un entorno de producción,
