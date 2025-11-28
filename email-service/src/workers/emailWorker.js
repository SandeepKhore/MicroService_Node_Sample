const nodemailer = require('nodemailer');
const { logger } = require('../../shared');

module.exports = ({ eventBus, config }) => {
  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });

  const renderBody = (template, variables = {}) => {
    switch (template) {
      case 'welcome':
        return `Hi ${variables.name || 'there'}, welcome aboard!`;
      case 'login-alert':
        return `Hi ${variables.name || 'there'}, we noticed a login at ${variables.timestamp}. If this wasn't you, please reset your password.`;
      default:
        return 'Hello!';
    }
  };

  const sendEmail = async ({ to, subject, template, variables }) => {
    const mailOptions = {
      from: config.fromEmail,
      to,
      subject,
      text: renderBody(template, variables),
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to} with subject ${subject}`);
  };

  const start = async () => {
    await eventBus.consume({
      queue: config.emailQueue,
      onMessage: async (payload) => {
        await sendEmail(payload);
      },
    });
  };

  return { start };
};
