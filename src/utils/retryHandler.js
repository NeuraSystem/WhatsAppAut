const logger = require("./logger");

const retryHandler = async (
  fn,
  retries = 3,
  delay = 1000,
  exponential = true,
  maxDelay = 30000,
) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt < retries) {
        const currentDelay = exponential
          ? Math.min(delay * Math.pow(2, attempt - 1), maxDelay)
          : delay;
        logger.warn(
          `Intento ${attempt}/${retries} fallido. Reintentando en ${currentDelay}ms. Error: ${error.message}`,
        );
        await new Promise((res) => setTimeout(res, currentDelay));
      } else {
        logger.error(
          `Todos los ${retries} intentos fallaron. Último error: ${error.message}`,
        );
        throw error; // Re-lanza el último error después de todos los reintentos
      }
    }
  }
};

module.exports = retryHandler;
