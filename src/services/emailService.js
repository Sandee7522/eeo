const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendEmail({ to, subject, body }) {
  if (!to || !subject || !body) {
    throw new Error("Missing required email fields: to, subject, body");
  }

  const transport = getTransporter();

  const info = await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text: body,
    html: escapeHtml(body).replace(/\n/g, "<br>"),
  });

  console.log(`    📧 Email sent to: ${to}`);
  console.log(`    📋 Subject: ${subject}`);
  console.log(`    🆔 MessageID: ${info.messageId}`);

  return { messageId: info.messageId, accepted: info.accepted };
}

module.exports = { sendEmail };
