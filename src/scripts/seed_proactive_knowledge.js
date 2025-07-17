// src/scripts/seed_proactive_knowledge.js

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { pool } = require('../database/pg');
const logger = require('../utils/logger');

const proactiveKnowledge = [
    {
        texto: 'La principal diferencia entre una pantalla de calidad original y una genérica está en el brillo y la saturación de los colores. La original te dará una imagen idéntica a la de fábrica. La genérica es de muy buena calidad y totalmente funcional, pero podrías notar los colores un 10-15% menos vivos. Ambas tienen la misma garantía.'
    },
    {
        texto: 'Para decidir entre una pantalla original o genérica, considera esto: si usas tu teléfono para diseño, fotografía o eres muy exigente con la calidad de video, la original es tu mejor opción. Si tu uso es más cotidiano (redes sociales, llamadas, mensajes), la genérica ofrece un excelente balance entre costo y beneficio, siendo una opción muy popular entre nuestros clientes.'
    },
    {
        texto: 'El reemplazo de batería es un proceso muy seguro. Usamos baterías de alta calidad certificadas que no afectan ninguna otra función del equipo. De hecho, muchos clientes notan una gran mejora en el rendimiento general del celular, además de la duración de la carga.'
    },
    {
        texto: 'Sofia es nuestra asistente virtual con modelo CEA (Conexión Empática Asistida). Se presenta estratégicamente en la segunda interacción para generar confianza. Si un cliente quiere hablar con una persona, solo debe decirlo naturalmente y se le conectará de inmediato con alguien del equipo.'
    },
    {
        texto: 'SalvaCell está ubicado en Av. C. del Refugio, fraccionamiento Valle de las Misiones. Nuestros horarios de atención son de Lunes a Sábado de 11:00 AM a 9:00 PM, y Domingos de 12:00 PM a 5:00 PM.'
    },
    {
        texto: 'Si un cliente proporciona información sin contexto (como "este es mi número"), no se debe asumir que busca un servicio. Se debe preguntar cortésmente si la consulta es para reparación o si necesita contactar al dueño.'
    }
];

async function seedKnowledge() {
    const client = await pool.connect();
    logger.info('Iniciando el sembrado de conocimiento proactivo...');
    try {
        // 1. Obtener todos los conocimientos existentes
        const existingKnowledgeRes = await client.query('SELECT texto FROM conocimientos');
        const existingKnowledgeSet = new Set(existingKnowledgeRes.rows.map(r => r.texto));

        // 2. Filtrar para encontrar solo el conocimiento nuevo
        const newKnowledge = proactiveKnowledge.filter(item => !existingKnowledgeSet.has(item.texto));

        if (newKnowledge.length === 0) {
            logger.info('No hay nuevo conocimiento proactivo para añadir. La base de datos ya está actualizada.');
            return;
        }

        // 3. Insertar solo el conocimiento nuevo
        await client.query('BEGIN');
        for (const item of newKnowledge) {
            const query = {
                text: `INSERT INTO conocimientos (texto) VALUES ($1);`,
                values: [item.texto],
            };
            await client.query(query);
            logger.info(`Nuevo conocimiento insertado: "${item.texto.substring(0, 40)}..."`);
        }
        await client.query('COMMIT');
        logger.info(`✅ Sembrado de conocimiento proactivo completado. Se añadieron ${newKnowledge.length} nuevos registros.`);

    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error durante el sembrado de conocimiento proactivo:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

seedKnowledge();
