const nodemailer = require('nodemailer');

/* ─── Transporter ────────────────────────────────────────────── */
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

/* ─── OTP email template ─────────────────────────────────────── */
const otpEmailHtml = (otp, name = 'there') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your email</title>
  <style>
    body { margin:0; padding:0; background:#08080C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width:480px; margin:40px auto; background:#101014; border-radius:16px; border:1px solid rgba(255,255,255,0.07); overflow:hidden; }
    .header { background:linear-gradient(135deg,#4f46e5,#7c3aed); padding:32px 40px 24px; text-align:center; }
    .header h1 { color:#fff; font-size:22px; font-weight:700; margin:0; letter-spacing:-0.3px; }
    .header p  { color:rgba(255,255,255,0.75); font-size:13px; margin:6px 0 0; }
    .body { padding:32px 40px; }
    .otp-box { background:#18181F; border:1px solid rgba(255,255,255,0.08); border-radius:12px; text-align:center; padding:24px; margin:20px 0; }
    .otp { font-size:38px; font-weight:800; letter-spacing:10px; color:#a5b4fc; font-variant-numeric: tabular-nums; }
    .otp-label { font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:0.08em; margin-top:8px; }
    .note { font-size:13px; color:#64748b; line-height:1.6; margin:0; }
    .note strong { color:#94a3b8; }
    .footer { border-top:1px solid rgba(255,255,255,0.06); padding:20px 40px; text-align:center; }
    .footer p { font-size:11px; color:#475569; margin:0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🍽 UniCanteen</h1>
      <p>Email verification</p>
    </div>
    <div class="body">
      <p style="color:#cbd5e1;font-size:15px;margin:0 0 4px">Hi <strong style="color:#fff">${name}</strong>,</p>
      <p style="color:#64748b;font-size:13px;margin:6px 0 24px">Enter the code below to verify your email and complete registration.</p>
      <div class="otp-box">
        <div class="otp">${otp}</div>
        <div class="otp-label">One-time password · valid for 10 minutes</div>
      </div>
      <p class="note">If you did not request this, you can safely ignore this email.<br/>Never share this OTP with anyone.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} UniCanteen · All rights reserved</p>
    </div>
  </div>
</body>
</html>`;

/* ─── Public helpers ─────────────────────────────────────────── */

/**
 * Send OTP verification email.
 * @param {string} to     recipient email
 * @param {string} otp    6-digit code
 * @param {string} name   recipient first name (for greeting)
 */
const sendOtpEmail = async (to, otp, name = 'there') => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"UniCanteen" <${process.env.SMTP_USER}>`,
    to,
    subject: `${otp} is your UniCanteen verification code`,
    html: otpEmailHtml(otp, name),
    text: `Your UniCanteen OTP is: ${otp}\nValid for 10 minutes.`,
  });
};

module.exports = { sendOtpEmail };
