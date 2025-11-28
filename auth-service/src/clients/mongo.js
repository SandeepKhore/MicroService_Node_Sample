const mongoose = require('mongoose');
const { logger } = require('../../shared');

async function connectMongo(uri) {
  mongoose.connection.on('connected', () => logger.info('MongoDB connected.'));
  mongoose.connection.on('error', (err) => logger.error(`MongoDB error: ${err.message}`));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected.'));

  await mongoose.connect(uri, {
    autoIndex: true,
  });
}

module.exports = connectMongo;
