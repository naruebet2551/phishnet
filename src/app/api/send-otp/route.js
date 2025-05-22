import nodemailer from 'nodemailer';

export async function POST(req) {
  const { email } = await req.json();
  if (!email) return new Response('Missing email', { status: 400 });

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // สร้าง OTP 6 หลัก

  // ✅ ส่ง OTP ผ่าน Email
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"CyberSafeNet" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'รหัส OTP สำหรับเข้าสู่ระบบ',
    text: `รหัส OTP ของคุณคือ: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    // เก็บ OTP ฝั่ง server-side ชั่วคราว (เช่น redis/db) — แต่ที่นี่เราจะ return ไปให้ client ใช้ทดสอบ
    return new Response(JSON.stringify({ success: true, otp }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('ส่งอีเมลไม่สำเร็จ:', err);
    return new Response('Failed to send OTP', { status: 500 });
  }
}
