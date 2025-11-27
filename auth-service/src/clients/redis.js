const { createClient } = require('redis');
const { logger } = require('../../../shared');

async function connectRedis(url) {
  const client = createClient({ url });

  client.on('error', (err) => logger.error(`Redis error: ${err.message}`));
  client.on('connect', () => logger.info('Redis connected.'));

  if (!client.isOpen) {
    await client.connect();
  }

  return client;
}

module.exports = connectRedis;
