require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3002,
  rabbitUrl: process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672',
  emailQueue: process.env.EMAIL_QUEUE || 'email.send',
  userExchange: process.env.USER_EXCHANGE || 'user.events',
  notificationQueue: process.env.NOTIFICATION_QUEUE || 'notification.user.events',
};
