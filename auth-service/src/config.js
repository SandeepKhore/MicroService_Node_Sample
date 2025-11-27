require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  mongoUri: process.env.MONGO_URI || 'mongodb://mongo:27017/auth-db',
  redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
  rabbitUrl: process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672',
  jwtSecret: process.env.JWT_SECRET || 'change_me',
  sessionTtlSeconds: Number(process.env.SESSION_TTL_SECONDS || 3600),
};
