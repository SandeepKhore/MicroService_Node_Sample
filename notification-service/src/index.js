const express = require('express');
const config = require('./config');
const { EventBus, logger } = require('../shared');
const userEventsWorker = require('./workers/userEventsWorker');

async function bootstrap() {
  const eventBus = new EventBus(config.rabbitUrl);
  await eventBus.connect();
  const worker = userEventsWorker({ eventBus, config });
  await worker.start();

  const app = express();
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.listen(config.port, () => {
    logger.info(`Notification service listening on port ${config.port}`);
  });
}

bootstrap().catch((err) => {
  logger.error(`Failed to start notification service: ${err.message}`);
  process.exit(1);
});
