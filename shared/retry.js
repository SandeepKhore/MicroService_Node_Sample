const logger = require('./logger');

/**
 * Retries an async function with exponential backoff
 * @param {Function} fn - The async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retry attempts (default: 10)
 * @param {number} options.delay - Initial delay in milliseconds (default: 2000)
 * @param {number} options.backoff - Backoff multiplier (default: 1.5)
 * @param {Function} options.onRetry - Optional callback called on each retry
 * @returns {Promise} - Result of the function call
 */
async function retry(fn, options = {}) {
  const {
    maxRetries = 10,
    delay = 2000,
    backoff = 1.5,
    onRetry = null,
  } = options;

  let currentDelay = delay;
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries - 1) {
        throw error;
      }

      if (onRetry) {
        onRetry(error, attempt + 1, currentDelay);
      } else {
        logger.warn(
          `Attempt ${attempt + 1} failed, retrying in ${currentDelay}ms...`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      currentDelay = Math.floor(currentDelay * backoff);
    }
  }

  throw lastError;
}

module.exports = retry;

