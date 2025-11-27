const amqp = require('amqplib');
const logger = require('./logger');

class EventBus {
  constructor(url) {
    this.url = url;
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    if (this.channel) {
      return this.channel;
    }

    this.connection = await amqp.connect(this.url);
    this.connection.on('error', (err) => logger.error(`RabbitMQ error: ${err.message}`));
    this.connection.on('close', () => {
      logger.warn('RabbitMQ connection closed, clearing channel.');
      this.channel = null;
      this.connection = null;
    });

    this.channel = await this.connection.createChannel();
    return this.channel;
  }

  async publish(exchange, routingKey, payload, options = {}) {
    const channel = await this.connect();
    await channel.assertExchange(exchange, 'topic', { durable: true });
    const buffer = Buffer.from(JSON.stringify(payload));
    channel.publish(exchange, routingKey, buffer, {
      contentType: 'application/json',
      persistent: true,
      ...options,
    });
    logger.info(`Published event ${routingKey}`);
  }

  async consume({ queue, onMessage, exchange, pattern = '#' }) {
    const channel = await this.connect();

    if (exchange) {
      await channel.assertExchange(exchange, 'topic', { durable: true });
      await channel.assertQueue(queue, { durable: true });
      await channel.bindQueue(queue, exchange, pattern);
    } else {
      await channel.assertQueue(queue, { durable: true });
    }

    await channel.consume(
      queue,
      async (msg) => {
        if (!msg) return;
        try {
          const data = JSON.parse(msg.content.toString());
          await onMessage(data, msg.fields.routingKey, msg);
          channel.ack(msg);
        } catch (err) {
          logger.error(`Failed to process message ${msg.fields.routingKey}: ${err.message}`);
          channel.nack(msg, false, false);
        }
      },
      { noAck: false }
    );
    logger.info(`Consuming queue ${queue}`);
  }

  async sendToQueue(queue, payload, options = {}) {
    const channel = await this.connect();
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
      contentType: 'application/json',
      persistent: true,
      ...options,
    });
    logger.info(`Queued message for ${queue}`);
  }
}

module.exports = EventBus;
