// src/services/eventSourcing/EventStore.js
// EVENT SOURCING PREPARATION LAYER - FASE 1 DATA COHERENCE FOUNDATION
//
// Arquitectura: Append-only event log foundation
// Key Innovation: Gradual migration path hacia immutable data

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('events');

/**
 * EVENT STORE - Append-only event sourcing foundation
 * Permite registrar eventos de cambios en el sistema para trazabilidad y migración futura
 */
class EventStore extends EventEmitter {
    constructor(options = {}) {
        super();
        this.eventLogPath =
      options.eventLogPath || path.join(__dirname, 'event_log.jsonl');
        this.retentionLimit = options.retentionLimit || 10000; // Máximo de eventos a retener
        this.events = [];
        this._loadEvents();
    }

    /**
   * Registra un nuevo evento en el log (append-only)
   * @param {string} type - Tipo de evento
   * @param {object} payload - Datos del evento
   * @returns {object} Evento registrado
   */
    appendEvent(type, payload) {
        const event = {
            id: uuidv4(),
            type,
            payload,
            timestamp: Date.now()
        };
        this.events.push(event);
        this._persistEvent(event);
        this.emit('event_appended', event);
        this._enforceRetention();
        return event;
    }

    /**
   * Obtiene todos los eventos registrados
   * @returns {Array} Lista de eventos
   */
    getAllEvents() {
        return [...this.events];
    }

    /**
   * Filtra eventos por tipo
   * @param {string} type - Tipo de evento
   * @returns {Array} Eventos filtrados
   */
    getEventsByType(type) {
        return this.events.filter((e) => e.type === type);
    }

    /**
   * Persiste un evento en disco (append-only)
   * @private
   */
    _persistEvent(event) {
        fs.appendFileSync(this.eventLogPath, JSON.stringify(event) + '\n');
    }

    /**
   * Carga eventos existentes desde disco
   * @private
   */
    _loadEvents() {
        if (!fs.existsSync(this.eventLogPath)) return;
        const lines = fs
            .readFileSync(this.eventLogPath, 'utf-8')
            .split('\n')
            .filter(Boolean);
        this.events = lines
            .map((line) => {
                try {
                    return JSON.parse(line);
                } catch {
                    return null;
                }
            })
            .filter(Boolean);
    }

    /**
   * Aplica política de retención (borra eventos antiguos si excede el límite)
   * @private
   */
    _enforceRetention() {
        if (this.events.length > this.retentionLimit) {
            this.events = this.events.slice(-this.retentionLimit);
            fs.writeFileSync(
                this.eventLogPath,
                this.events.map((e) => JSON.stringify(e)).join('\n') + '\n'
            );
        }
    }
}

// Instancia singleton
const eventStore = new EventStore();

module.exports = {
    EventStore,
    eventStore
};
