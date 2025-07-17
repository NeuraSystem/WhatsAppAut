const { PriceExtractionSystem } = require('../services/priceExtractionSystem');

// Mock de la base de datos
jest.mock('../database/pg', () => ({
    pool: {
        query: jest.fn(),
    },
}));

// Mock de servicios externos
jest.mock('../services/semanticCache', () => ({
    findInCache: jest.fn().mockResolvedValue(null),
    addToCache: jest.fn().mockResolvedValue(null),
}));


jest.setTimeout(30000);

const { pool } = require('../database/pg');

describe('PriceExtractionSystem', () => {
    let priceExtractionSystem;
    let llm;

    beforeAll(() => {
        const { ChatOllama } = require("@langchain/community/chat_models/ollama");
        llm = new ChatOllama({
            baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
            model: process.env.OLLAMA_AGENT_MODEL || "qwen2.5:1.5b-instruct-q4_0",
        });
        priceExtractionSystem = new PriceExtractionSystem(llm);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('debería extraer el dispositivo y el servicio de una consulta simple', async () => {
        const query = 'cuánto cuesta cambiar la pantalla de un iphone 12';
        const expectedDevice = 'iphone 12';
        const expectedService = 'pantalla';

        // Mock de la respuesta del LLM
        const mockLLMResponse = {
            device: expectedDevice,
            service: expectedService,
        };

        priceExtractionSystem.entityExtractionChain.invoke = jest.fn().mockResolvedValue(mockLLMResponse);
        pool.query.mockResolvedValue({ rows: [] });

        await priceExtractionSystem.extractPrice(query);

        expect(priceExtractionSystem.entityExtractionChain.invoke).toHaveBeenCalledWith({ query });
    });

    test('debería devolver un precio de una coincidencia exacta en la base de datos', async () => {
        const query = 'precio de la pantalla del samsung a54';
        const mockExtractedEntities = { device: 'samsung a54', service: 'pantalla' };
        const mockDbResponse = {
            rows: [{
                modelo_celular: 'samsung a54',
                tipo_reparacion: 'pantalla',
                precio: 1500,
                tiempo_reparacion: '1 hora',
                disponibilidad: 'disponible',
                notas: 'Calidad original',
            }],
        };

        priceExtractionSystem.entityExtractionChain.invoke = jest.fn().mockResolvedValue(mockExtractedEntities);
        pool.query.mockResolvedValueOnce(mockDbResponse);

        const result = await priceExtractionSystem.extractPrice(query);

        expect(result.price).toBe(1500);
        expect(result.confidence).toBe(1.0);
        expect(result.method).toBe('exact_database_match');
    });

    test('debería devolver un precio de una coincidencia difusa en la base de datos', async () => {
        const query = 'precio de la pantalla del samsun a54'; // "samsun" está mal escrito
        const mockExtractedEntities = { device: 'samsun a54', service: 'pantalla' };
        const mockDbResponse = {
            rows: [{
                modelo_celular: 'samsung a54',
                tipo_reparacion: 'pantalla',
                precio: 1500,
                tiempo_reparacion: '1 hora',
                disponibilidad: 'disponible',
                notas: 'Calidad original',
                device_sim: 0.9,
                service_sim: 1.0,
            }],
        };

        priceExtractionSystem.entityExtractionChain.invoke = jest.fn().mockResolvedValue(mockExtractedEntities);
        pool.query.mockResolvedValueOnce({ rows: [] }); // No exact match
        pool.query.mockResolvedValueOnce(mockDbResponse);

        const result = await priceExtractionSystem.extractPrice(query);

        expect(result.price).toBe(1500);
        expect(result.confidence).toBe(0.95);
        expect(result.method).toBe('fuzzy_database_match');
    });

    test('debería devolver nulo si no se encuentra ningún precio', async () => {
        const query = 'precio de la pantalla del google pixel 9';
        const mockExtractedEntities = { device: 'google pixel 9', service: 'pantalla' };

        priceExtractionSystem.entityExtractionChain.invoke = jest.fn().mockResolvedValue(mockExtractedEntities);
        pool.query.mockResolvedValue({ rows: [] }); // No exact, no fuzzy, no fallback

        const result = await priceExtractionSystem.extractPrice(query);

        expect(result.price).toBeNull();
        expect(result.confidence).toBe(0);
        expect(result.method).toBe('no_encontrado');
    });
});
