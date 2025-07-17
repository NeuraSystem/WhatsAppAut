// src/responses/templates.js

/**
 * Obtiene el saludo apropiado según la hora del día.
 * @returns {string} - "Buenos días", "Buenas tardes" o "Buenas noches".
 */
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
}

/**
 * Mensaje de presentación de la IA.
 * @returns {string}
 */
function getAIPresentation() {
    return "Por cierto, soy Salva, un asistente virtual con inteligencia artificial. Estoy aquí para ayudarte a resolver tus dudas de la forma más rápida y eficiente posible. Si en algún momento no puedo resolver tu consulta, la derivaré directamente con un miembro de nuestro equipo humano.";
}

/**
 * Genera el mensaje de bienvenida inicial para un nuevo cliente.
 * @returns {string}
 */
function welcomeNewUser() {
    return `${getGreeting()}, gracias por comunicarte a Salva Cell. Para darte una atención más personalizada, ¿cuál es tu nombre?`;
}

/**
 * Genera un saludo para un cliente que regresa.
 * @param {string} name - El nombre del cliente.
 * @returns {string}
 */
function welcomeBackUser(name) {
    return `${getGreeting()} ${name}, ¡qué bueno verte de nuevo por aquí! ¿En qué te puedo ayudar hoy?`;
}

/**
 * Pregunta el nombre del cliente de forma casual.
 * @returns {string}
 */
function askForName() {
    return "Para seguir, ¿me podrías decir tu nombre, por favor?";
}

/**
 * Formatea la información de una reparación encontrada.
 * @param {Object} reparacion - El objeto con los datos de la reparación.
 * @returns {string}
 */
function formatRepairInfo(reparacion) {
    let response = `¡Claro! Aquí tienes la información sobre la reparación:

`;
    response += `📱 *Modelo:* ${reparacion.modelo_celular}
`;
    response += `🛠️ *Servicio:* ${reparacion.tipo_reparacion}
`;
    response += `💲 *Precio:* ${reparacion.precio.toFixed(2)}
`;
    if (reparacion.tiempo_reparacion) response += `⏱️ *Tiempo estimado:* ${reparacion.tiempo_reparacion}
`;
    response += `✅ *Disponibilidad:* ${reparacion.disponibilidad || 'En stock'}
`;
    if (reparacion.notas) response += `📝 *A tener en cuenta:* ${reparacion.notas}
`;
    return response;
}

/**
 * Mensaje para cuando no se encuentra una reparación o la consulta es ambigua.
 * @returns {string}
 */
function notFound() {
    return "Hmm, no tengo la información exacta sobre esa reparación en mi base de datos. Para darte la mejor atención, voy a pasar tu consulta a uno de nuestros expertos. En breve se pondrá en contacto contigo. 😊";
}

/**
 * Respuesta genérica para cuando ocurre un error inesperado.
 * @returns {string}
 */
function generalError() {
    return "¡Ups! Algo no salió como esperaba. Ya estoy trabajando para solucionarlo. Por favor, intenta de nuevo en un momento.";
}

// --- Plantillas de Administrador ---
function adminModeActivated() {
    return "🔓 *Modo Administrador Activado*. Ahora puedes usar comandos de gestión. Escribe `/ayuda` para ver los comandos disponibles.";
}

function adminModeDeactivated() {
    return "🔒 *Modo Administrador Desactivado*. Has vuelto al modo cliente.";
}

function adminHelp() {
    return `*Comandos de Administrador:*\n\n` +
           `**📚 Gestión de Conocimiento:**\n` +
           `*/aprender <texto>* - Enseña un nuevo conocimiento a la IA.\n` +
           `*/subir-excel* - Adjunta un Excel para actualizar la base de datos.\n\n` +
           `**⚙️ Control de Bot:**\n` +
           `*/pausar <numero> [minutos]* - Pausa al bot para un chat. Por defecto 15 min.\n` +
           `*/reanudar <numero>* - Reactiva al bot para un chat.\n\n` +
           `**👥 Gestión de Admins:**\n` +
           `*/agregar-admin <numero> <nombre>* - Agrega un nuevo admin.\n` +
           `*/quitar-admin <numero>* - Desactiva un admin.\n\n` +
           `**🚨 Gestión de Fallos:**\n` +
           `*/fallos* - Ver estadísticas de fallos del sistema.\n` +
           `*/verificar-fallo <numero>* - Ver estado de fallos de un cliente.\n` +
           `*/reset-fallo <numero>* - Resetear contador de fallos de un cliente.\n\n` +
           `**🧠 Gestión de Contexto:**\n` +
           `*/contexto* - Ver estadísticas de contexto conversacional.\n` +
           `*/ver-contexto <numero>* - Ver contexto específico de un cliente.\n` +
           `*/limpiar-contexto [numero]* - Limpiar contextos (sin número = expirados).\n\n` +
           `**🚦 Gestión de Rate Limiting:**\\n` +
           `*/rate-limit* - Ver estadísticas de rate limiting de APIs.\\n` +
           `*/reset-rate-limit <numero>* - Resetear límites de velocidad de un cliente.\\n\\n` +
           `**🤖 Gestión de Máquina de Estados:**\\n` +
           `*/fsm* - Ver estadísticas de conversaciones FSM.\\n` +
           `*/ver-fsm <numero>* - Ver estado FSM específico de un cliente.\\n` +
           `*/reset-fsm <numero>* - Resetear FSM de un cliente.\\n\\n` +
           `**📊 Monitoreo del Sistema:**\\n` +
           `*/monitor* - Ver estado del sistema de monitoreo proactivo.\\n` +
           `*/alertas* - Ver alertas pendientes del sistema.\\n` +
           `*/health-check* - Ejecutar verificación manual de salud.\\n` +
           `*/iniciar-monitor* - Iniciar monitoreo proactivo.\\n` +
           `*/detener-monitor* - Detener monitoreo proactivo.\\n\\n` +
           `**🎯 Evaluación de Calidad:**\\n` +
           `*/calidad* - Ver estadísticas de calidad de respuestas.\\n` +
           `*/respuestas-mejora* - Ver respuestas que necesitan mejora.\\n` +
           `*/evaluar "<consulta>" "<respuesta>"* - Evaluar respuesta manualmente.\\n\\n` +
           `*/salir* - Vuelve al modo cliente.`;
}

module.exports = {
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
};
