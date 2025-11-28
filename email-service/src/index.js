const express = require('express');
const config = require('./config');
const { EventBus, logger } = require('../shared');
const emailWorker = require('./workers/emailWorker');

async function bootstrap() {
  const eventBus = new EventBus(config.rabbitUrl);
  await eventBus.connect();
  const worker = emailWorker({ eventBus, config });
  await worker.start();

  const app = express();
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.listen(config.port, () => {
    logger.info(`Email service listening on port ${config.port}`);
  });
}

bootstrap().catch((err) => {
  logger.error(`Failed to start email service: ${err.message}`);
  process.exit(1);
});
