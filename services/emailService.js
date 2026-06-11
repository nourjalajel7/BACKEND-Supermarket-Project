const nodemailer = require("nodemailer");

const isEmailConfigured = () => {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_FROM);
};

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
      : undefined
  });
};

const sendOtpEmail = async ({ to, otp }) => {
  if (!isEmailConfigured()) {
    const error = new Error("Email service is not configured");
    error.statusCode = 503;
    throw error;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Smart Supermarket Password Reset OTP",
    text: `Your password reset OTP is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your password reset OTP is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`
  });
};

module.exports = {
  isEmailConfigured,
  sendOtpEmail
};
