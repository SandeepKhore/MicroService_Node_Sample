require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3003,
  rabbitUrl: process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672',
  emailQueue: process.env.EMAIL_QUEUE || 'email.send',
  smtpHost: process.env.SMTP_HOST || 'smtp.example.com',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || 'user@example.com',
  smtpPass: process.env.SMTP_PASS || 'password',
  smtpSecure: process.env.SMTP_SECURE === 'true',
  fromEmail: process.env.FROM_EMAIL || 'noreply@example.com',
};
