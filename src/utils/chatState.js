// src/utils/chatState.js

const logger = require('./logger');

// Almacena los chats que están actualmente en pausa.
// La clave es el ID del chat (ej: '5491123456789@c.us')
// El valor es el temporizador (de setTimeout) que reanudará el chat.
const pausedChats = new Map();

/**
 * Pausa un chat para que el bot no responda en él.
 * @param {string} chatId - El ID del chat a pausar.
 * @param {number} durationInMinutes - La duración de la pausa en minutos.
 */
function pauseChat(chatId, durationInMinutes) {
    // Si ya hay una pausa para este chat, la cancelamos antes de crear una nueva.
    if (pausedChats.has(chatId)) {
        clearTimeout(pausedChats.get(chatId));
    }

    const durationInMs = durationInMinutes * 60 * 1000;

    const timer = setTimeout(() => {
        resumeChat(chatId);
        logger.info(
            `Pausa expirada. El bot se ha reanudado automáticamente para el chat ${chatId}.`
        );
    }, durationInMs);

    pausedChats.set(chatId, timer);
    logger.info(
        `Bot pausado para el chat ${chatId} durante ${durationInMinutes} minutos.`
    );
}

/**
 * Reanuda un chat que estaba en pausa.
 * @param {string} chatId - El ID del chat a reanudar.
 */
function resumeChat(chatId) {
    if (pausedChats.has(chatId)) {
        clearTimeout(pausedChats.get(chatId));
        pausedChats.delete(chatId);
        logger.info(`Bot reanudado manualmente para el chat ${chatId}.`);
    }
}

/**
 * Verifica si un chat está actualmente en pausa.
 * @param {string} chatId - El ID del chat a verificar.
 * @returns {boolean} - True si el chat está pausado, false en caso contrario.
 */
function isChatPaused(chatId) {
    return pausedChats.has(chatId);
}

module.exports = {
    pauseChat,
    resumeChat,
    isChatPaused
};
