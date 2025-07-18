/**
 * @file AdminEscalationSystem.js
 * @description Sistema de escalación inteligente al administrador via WhatsApp
 * @module core/intelligence/AdminEscalationSystem
 * @version 1.0.0
 * @author Claude (Anthropic AI) & Gemini (Google AI)
 * @date 2025-07-17
 */

const logger = require("../../utils/logger");
const config = require("../../utils/config");

/**
 * Sistema de escalación que maneja consultas que requieren intervención del administrador.
 * Características:
 * - Una consulta a la vez para el administrador para evitar saturación.
 * - Identificación única de consultas para seguimiento.
 * - Timeout de 5 minutos para respuesta del administrador.
 * - Formulación natural de respuestas para una comunicación fluida.
 */
class AdminEscalationSystem {
  constructor() {
    this.activeEscalations = new Map(); // consultaId -> datosEscalacion
    this.adminBusy = false;
    this.escalationQueue = [];
    this.adminResponseCallbacks = new Map();
    this.timeoutHandlers = new Map();

    this.metrics = {
      totalEscalations: 0,
      resolvedEscalations: 0,
      timeoutEscalations: 0,
      averageResponseTime: 0,
    };

    logger.info("🚨 AdminEscalationSystem inicializado");
  }

  /**
   * Detecta si una consulta necesita escalación al administrador.
   * @param {Object} queryData - Datos de la consulta (ej. {hasMedia, modelNotFound, agentConfidence})
   * @returns {Boolean} - true si necesita escalación.
   */
  needsEscalation(queryData) {
    const uncertaintyIndicators = [
      // Consultas con imágenes/videos
      queryData.hasMedia,
      // Preguntas sobre modelos no reconocidos
      queryData.modelNotFound,
      // Consultas de precios complejas
      queryData.complexPricing,
      // Solicitudes específicas no estándar
      queryData.customRequest,
      // Confianza del agente muy baja
      queryData.agentConfidence < 0.7,
    ];

    const shouldEscalate = uncertaintyIndicators.some(
      (indicator) => indicator === true,
    );

    if (shouldEscalate) {
      logger.info("🔍 Escalación necesaria detectada", {
        reason: this.getEscalationReason(queryData),
        customerInfo: queryData.customerInfo,
      });
    }

    return shouldEscalate;
  }

  /**
   * Escala una consulta al administrador.
   * @param {Object} escalationData - Datos de la escalación.
   * @param {Object} whatsappClient - Cliente de WhatsApp para enviar mensajes.
   * @returns {Promise<String>} - Mensaje de espera para el cliente.
   */
  async escalateToAdmin(escalationData, whatsappClient) {
    try {
      // Generar ID único para la consulta
      const consultaId = this.generateConsultaId();

      // Si el admin está ocupado, encolar
      if (this.adminBusy) {
        return await this.enqueueEscalation(escalationData, consultaId);
      }

      // Procesar escalación inmediatamente
      return await this.processEscalation(
        escalationData,
        consultaId,
        whatsappClient,
      );
    } catch (error) {
      logger.error("❌ Error en escalación al admin:", error);
      return "Disculpa, hay un problema técnico. Por favor intenta más tarde.";
    }
  }

  /**
   * Procesa una escalación, notificando al admin y gestionando el estado.
   * @param {Object} escalationData - Datos de la escalación.
   * @param {String} consultaId - ID único de la consulta.
   * @param {Object} whatsappClient - Cliente de WhatsApp.
   * @returns {Promise<String>} - Mensaje para el cliente.
   */
  async processEscalation(escalationData, consultaId, whatsappClient) {
    this.adminBusy = true;
    this.metrics.totalEscalations++;

    // Registrar escalación activa
    const escalationRecord = {
      consultaId,
      customerInfo: escalationData.customerInfo,
      originalQuery: escalationData.query,
      mediaAttached: escalationData.media || null,
      aiAnalysis:
        escalationData.aiAnalysis || "Sin análisis automático disponible",
      startTime: Date.now(),
      status: "waiting_admin",
    };

    this.activeEscalations.set(consultaId, escalationRecord);

    // Enviar notificación al administrador
    const adminMessage = this.formatAdminMessage(escalationRecord);
    await this.sendToAdmin(adminMessage, whatsappClient);

    // Configurar timeout de 5 minutos
    this.setupAdminTimeout(consultaId, whatsappClient);

    // Mensaje para el cliente
    const customerMessage = this.getCustomerWaitMessage(
      escalationData.customerInfo,
    );

    logger.info("📤 Escalación enviada al admin", {
      consultaId,
      customer: escalationData.customerInfo.name || "Cliente sin nombre",
    });

    return customerMessage;
  }

  /**
   * Maneja la respuesta recibida del administrador.
   * @param {String} adminResponse - Respuesta textual del administrador.
   * @param {Function} responseCallback - Callback para enviar la respuesta final al cliente.
   */
  async handleAdminResponse(adminResponse, responseCallback) {
    try {
      const activeEscalation = this.getCurrentEscalation();

      if (!activeEscalation) {
        logger.warn("⚠️ Respuesta del admin sin escalación activa");
        return; // Ignorar respuesta si no hay nada activo
      }

      // Limpiar timeout
      this.clearAdminTimeout(activeEscalation.consultaId);

      // Formular respuesta natural
      const naturalResponse = await this.formulateNaturalResponse(
        adminResponse,
        activeEscalation,
      );

      // Enviar respuesta al cliente usando el callback
      await responseCallback(naturalResponse);

      // Registrar resolución exitosa
      this.recordSuccessfulEscalation(activeEscalation);

      // Liberar administrador
      this.releaseAdmin();

      // Procesar siguiente en cola si existe
      await this.processNextInQueue(); // Necesita el whatsappClient
    } catch (error) {
      logger.error("❌ Error procesando respuesta del admin:", error);
      this.releaseAdmin(); // Liberar admin incluso si hay error
    }
  }

  /**
   * Formula una respuesta natural basada en la respuesta del administrador.
   * @param {String} adminResponse - Respuesta del administrador.
   * @param {Object} escalationRecord - Registro de escalación.
   * @returns {Promise<String>} - Respuesta formulada naturalmente.
   */
  async formulateNaturalResponse(adminResponse, escalationRecord) {
    const customerName = escalationRecord.customerInfo.name || "";

    // Limpiar la respuesta del admin para que suene natural
    const cleanResponse = this.cleanAdminResponse(adminResponse);

    // Crear una respuesta base
    const greeting = customerName ? `Hola ${customerName}, ` : "Hola, ";
    let naturalResponse = `${greeting}respecto a tu consulta, me informa el especialista que ${cleanResponse}.`;

    // Añadir un cierre amigable
    naturalResponse += " ¿Hay algo más en lo que pueda ayudarte?";

    return naturalResponse;
  }

  /**
   * Limpia la respuesta del admin para que suene natural, eliminando comandos.
   * @param {String} adminResponse - La respuesta cruda del admin.
   * @returns {String} - La respuesta limpia.
   */
  cleanAdminResponse(adminResponse) {
    // Remover frases como "Dile que", "Responde que", etc. y ajustar capitalización.
    let cleaned = adminResponse.replace(
      /^(dile que|responde que|contestale que)\s*/i,
      "",
    );
    cleaned = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
    return cleaned.trim();
  }

  /**
   * Configura el timeout de 5 minutos para la respuesta del administrador.
   * @param {String} consultaId - El ID de la consulta.
   * @param {Object} whatsappClient - Cliente para enviar mensajes.
   */
  setupAdminTimeout(consultaId, whatsappClient) {
    const timeoutHandler = setTimeout(
      () => {
        this.handleAdminTimeout(consultaId, whatsappClient);
      },
      5 * 60 * 1000,
    ); // 5 minutos

    this.timeoutHandlers.set(consultaId, timeoutHandler);
  }

  /**
   * Maneja el caso en que el admin no responde a tiempo.
   * @param {String} consultaId - El ID de la consulta.
   * @param {Object} whatsappClient - Cliente para enviar mensajes.
   */
  async handleAdminTimeout(consultaId, whatsappClient) {
    const escalation = this.activeEscalations.get(consultaId);

    if (escalation && escalation.status === "waiting_admin") {
      this.metrics.timeoutEscalations++;
      escalation.status = "timed_out";

      // Mensaje de disculpa al cliente
      const timeoutMessage =
        `Disculpa la demora. Nuestro especialista está atendiendo otra consulta en este momento, ` +
        `pero tu pregunta está en espera. En cuanto se libere, te contactará directamente. ` +
        `Gracias por tu paciencia.`;

      // Enviar mensaje de timeout al cliente
      const customerPhone = escalation.customerInfo.phone;
      if (customerPhone && whatsappClient) {
        await whatsappClient.sendMessage(customerPhone, timeoutMessage);
      }

      logger.warn("⏰ Timeout de admin para consulta", {
        consultaId,
        customer: escalation.customerInfo.name,
      });

      // Liberar admin para la siguiente consulta, pero mantener esta activa para respuesta tardía
      this.releaseAdmin();
      await this.processNextInQueue(whatsappClient);
    }
  }

  /**
   * Limpia el timeout del administrador cuando se recibe una respuesta.
   * @param {String} consultaId - El ID de la consulta.
   */
  clearAdminTimeout(consultaId) {
    const timeoutHandler = this.timeoutHandlers.get(consultaId);
    if (timeoutHandler) {
      clearTimeout(timeoutHandler);
      this.timeoutHandlers.delete(consultaId);
    }
  }

  /**
   * Encola una escalación si el administrador está ocupado.
   * @param {Object} escalationData - Los datos a encolar.
   * @param {String} consultaId - El ID de la consulta.
   * @returns {Promise<String>} - Mensaje de espera para el cliente.
   */
  async enqueueEscalation(escalationData, consultaId) {
    this.escalationQueue.push({ escalationData, consultaId });

    const position = this.escalationQueue.length;

    return (
      `📋 Tu consulta ha sido recibida. Hay ${position} persona(s) esperando antes que tú. ` +
      `Te atenderemos en cuanto nuestro especialista esté disponible. Agradecemos tu paciencia.`
    );
  }

  /**
   * Procesa la siguiente escalación en la cola.
   * @param {Object} whatsappClient - El cliente de WhatsApp.
   */
  async processNextInQueue(whatsappClient) {
    if (this.escalationQueue.length > 0 && !this.adminBusy) {
      const { escalationData, consultaId } = this.escalationQueue.shift();
      logger.info("▶️ Procesando siguiente consulta en cola", { consultaId });
      await this.processEscalation(escalationData, consultaId, whatsappClient);
    }
  }

  /**
   * Utilidades del sistema
   */
  generateConsultaId() {
    return `cons_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  getCurrentEscalation() {
    // Retorna la primera escalación activa que está esperando respuesta
    return Array.from(this.activeEscalations.values()).find(
      (esc) => esc.status === "waiting_admin",
    );
  }

  releaseAdmin() {
    this.adminBusy = false;
  }

  recordSuccessfulEscalation(escalationRecord) {
    const responseTime = Date.now() - escalationRecord.startTime;
    this.metrics.resolvedEscalations++;

    // Actualizar tiempo promedio de respuesta
    const totalTime =
      this.metrics.averageResponseTime * (this.metrics.resolvedEscalations - 1);
    this.metrics.averageResponseTime =
      (totalTime + responseTime) / this.metrics.resolvedEscalations;

    // Remover de escalaciones activas
    this.activeEscalations.delete(escalationRecord.consultaId);

    logger.info("✅ Escalación resuelta exitosamente", {
      consultaId: escalationRecord.consultaId,
      responseTime: `${(responseTime / 1000).toFixed(1)}s`,
    });
  }

  formatAdminMessage(escalationRecord) {
    const timestamp = new Date().toLocaleTimeString("es-MX");
    const customerName =
      escalationRecord.customerInfo.name || "Cliente sin nombre";
    const customerPhone = escalationRecord.customerInfo.phone || "Sin teléfono";

    let message = `*🚨 CONSULTA PARA TI [${escalationRecord.consultaId}]* 🚨\n\n`;
    message += `*De:* ${customerName} (${customerPhone})\n`;
    message += `*Pregunta:* "${escalationRecord.originalQuery}"\n`;

    if (escalationRecord.mediaAttached) {
      message += `*Adjunto:* Sí (revisa el chat original del bot)\n`;
    }

    message += `*Análisis IA:* _${escalationRecord.aiAnalysis}_\n\n`;
    message += `*Responde a este mensaje para contestarle al cliente.*`;

    return message;
  }

  async sendToAdmin(message, whatsappClient) {
    const adminNumber = config.bot.forwardingNumber;

    if (!adminNumber) {
      throw new Error("Número de administrador no configurado");
    }

    await whatsappClient.sendMessage(adminNumber, message);

    logger.info("📱 Mensaje enviado al administrador", {
      adminNumber: `...${adminNumber.slice(-4)}`,
    });
  }

  getCustomerWaitMessage(customerInfo) {
    const name = customerInfo.name || "";
    const greeting = name ? `Hola ${name}, ` : "";

    return `📱 ${greeting}un momento, estoy consultando tu solicitud con nuestro especialista para darte la información más precisa. Te respondo en unos minutos.`;
  }

  getEscalationReason(queryData) {
    if (queryData.hasMedia) return "imagen/video adjunto";
    if (queryData.modelNotFound) return "modelo no reconocido";
    if (queryData.complexPricing) return "consulta de precio compleja";
    if (queryData.customRequest) return "solicitud personalizada";
    if (queryData.agentConfidence < 0.7) return "baja confianza del agente";
    return "razón no especificada";
  }

  getMetrics() {
    return {
      ...this.metrics,
      adminBusy: this.adminBusy,
      queueLength: this.escalationQueue.length,
      activeEscalations: this.activeEscalations.size,
      successRate:
        this.metrics.totalEscalations > 0
          ? this.metrics.resolvedEscalations / this.metrics.totalEscalations
          : 0,
    };
  }

  async shutdown() {
    for (const handler of this.timeoutHandlers.values()) {
      clearTimeout(handler);
    }
    this.timeoutHandlers.clear();
    this.activeEscalations.clear();
    this.escalationQueue = [];
    logger.info("🔄 AdminEscalationSystem shutdown completed");
  }
}

// Se exporta como una instancia única (Singleton) para mantener el estado en toda la aplicación.
const adminEscalationSystem = new AdminEscalationSystem();
module.exports = adminEscalationSystem;
