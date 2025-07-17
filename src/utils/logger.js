const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

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

// Configurar transports
const transports = [
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
        handleExceptions: true
    })
];

// Agregar archivos de log solo si el directorio existe
try {
    transports.push(
        new winston.transports.File({ 
            filename: path.join(logsDir, 'error.log'), 
            level: 'error',
            handleExceptions: true
        }),
        new winston.transports.File({ 
            filename: path.join(logsDir, 'combined.log'),
            handleExceptions: true
        })
    );
} catch (error) {
    console.warn('No se pudieron crear archivos de log, usando solo console');
}

// Crear logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'salvacell-bot' },
    transports: transports,
    exitOnError: false
});

// Método para startup consolidado
logger.logStartup = (systemStatus) => {
    logger.info('🚀 SalvaCell Pure Orchestrator INICIALIZANDO...');
    logger.info(`📊 Sistemas Core: ${systemStatus.map(s => `${s.name} ${s.status === 'healthy' ? '✅' : '❌'}`).join(' ')}`);
    logger.info('🎭 Sofía AI Lista - Agent Executor Operacional');
    logger.info('✅ WhatsApp Bot CONECTADO - Listo para Producción');
};

module.exports = logger;
