// src/services/email.js
const nodemailer = require('nodemailer');

const SMTP_HOST   = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT   = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = process.env.SMTP_SECURE !== 'false';
const SMTP_USER   = process.env.SMTP_USER;
const SMTP_PASS   = process.env.SMTP_PASS;
const FROM_EMAIL  = process.env.SMTP_FROM || SMTP_USER; // <— ahora lee SMTP_FROM

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  pool: true,
  maxConnections: 2,
  maxMessages: 50,
  rateDelta: 1000,
  rateLimit: 5,
  connectionTimeout: 30000,
  greetingTimeout: 20000,
  socketTimeout: 30000
});

async function sendEmail({ to, subject, html, text, attachments } = {}, _attempt = 1) {
  if (!to) throw new Error('sendEmail: falta "to"');
  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to, subject, html, text, attachments
    });
    console.log(`📧 Gmail OK: <${info.messageId}> -> ${to}${attachments?.length ? ` (adjuntos: ${attachments.length})` : ''}`);
    return info;
  } catch (e) {
    const retriable = /socket|ECONNRESET|ETIMEDOUT|EPIPE/i.test(String(e?.message || e));
    if (_attempt < 2 && retriable) {
      console.warn('[sendEmail] fallo transitorio, reintentando…', e?.message);
      await new Promise(r => setTimeout(r, 500));
      return sendEmail({ to, subject, html, text, attachments }, _attempt + 1);
    }
    console.error('[sendEmail] error definitivo:', e?.message);
    throw e;
  }
}

module.exports = { sendEmail, transporter };
