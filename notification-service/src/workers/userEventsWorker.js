const { logger } = require('../../shared');

module.exports = ({ eventBus, config }) => {
  const queueName = config.notificationQueue;

  const buildEmailPayload = (payload, routingKey) => {
    switch (routingKey) {
      case 'user.registered':
        return {
          to: payload.email,
          subject: 'Welcome to the platform',
          template: 'welcome',
          variables: { name: payload.name },
        };
      case 'user.loggedin':
        return {
          to: payload.email,
          subject: 'New login detected',
          template: 'login-alert',
          variables: { name: payload.name, timestamp: new Date().toISOString() },
        };
      default:
        return null;
    }
  };

  const start = async () => {
    await eventBus.consume({
      queue: queueName,
      exchange: config.userExchange,
      pattern: 'user.*',
      onMessage: async (payload, routingKey) => {
        const emailPayload = buildEmailPayload(payload, routingKey);
        if (!emailPayload) {
          logger.warn(`No handler for routing key ${routingKey}`);
          return;
        }
        await eventBus.sendToQueue(config.emailQueue, emailPayload);
        logger.info(`Queued email task for ${routingKey}`);
      },
    });
  };

  return {
    start,
  };
};
