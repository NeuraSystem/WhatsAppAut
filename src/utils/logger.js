// src/utils/logger.js - Sistema de logging

const winston = require('winston');

// Configurar formato de logs
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack }) => {
        if (stack) {
            return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`;
        }
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
);

// Configurar transports basados en entorno
const getTransports = () => {
    const transports = [
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error',
            handleExceptions: true
        })
    ];

    // En desarrollo, log más verboso
    if (process.env.NODE_ENV === 'development') {
        transports.push(
            new winston.transports.File({ 
                filename: 'logs/combined.log',
                handleExceptions: true
            })
        );
    }

    // Console logging condicional
    const logLevel = process.env.LOG_LEVEL || 'info';
    if (logLevel === 'debug' || process.env.NODE_ENV === 'development') {
        transports.push(
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                ),
                handleExceptions: true
            })
        );
    } else {
        // Logging mínimo en producción
        transports.push(
            new winston.transports.Console({
                level: 'warn',
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                ),
                handleExceptions: true
            })
        );
    }

    return transports;
};

// Crear logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'salvacell-bot' },
    transports: getTransports(),
    exitOnError: false
});

// Método para startup consolidado
logger.logStartup = (systemStatus) => {
    logger.info('🚀 SalvaCell Pure Orchestrator INICIALIZANDO...');
    logger.info(`📊 Sistemas Core: ${systemStatus.map(s => `${s.name} ${s.status === 'healthy' ? '✅' : '❌'}`).join(' ')}`);
    logger.info('🎭 Sofía AI Lista - Agent Executor Operacional');
    logger.info('✅ WhatsApp Bot CONECTADO - Listo para Producción');
};

// Crear directorio de logs si no existe
const fs = require('fs');
if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
}

module.exports = logger;