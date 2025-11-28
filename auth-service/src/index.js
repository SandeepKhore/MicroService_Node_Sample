const express = require('express');
const connectMongo = require('./clients/mongo');
const connectRedis = require('./clients/redis');
const config = require('./config');
const buildAuthRoutes = require('./routes/authRoutes');
const { logger, EventBus } = require('../shared');

async function bootstrap() {
  await connectMongo(config.mongoUri);
  const redisClient = await connectRedis(config.redisUrl);
  const eventBus = new EventBus(config.rabbitUrl);
  await eventBus.connect();

  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/', buildAuthRoutes({ redisClient, eventBus, config }));

  app.use((err, _req, res, _next) => {
    logger.error(err.message, err);
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
  });

  app.listen(config.port, () => {
    logger.info(`Auth service listening on port ${config.port}`);
  });
}

bootstrap().catch((err) => {
  logger.error(`Failed to start auth service: ${err.message}`);
  process.exit(1);
});
