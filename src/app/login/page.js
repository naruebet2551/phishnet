'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    if (password !== correctPassword) {
      setError('รหัสผ่านไม่ถูกต้อง');
      return;
    }

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error('ส่ง OTP ไม่สำเร็จ');

      const data = await res.json();

      const now = Date.now();
      localStorage.setItem('phishnet_otp', data.otp); // 💡 ชั่วคราว
      localStorage.setItem('phishnet_otp_exp', (now + 5 * 60 * 1000).toString()); // หมดอายุใน 5 นาที
      localStorage.setItem('phishnet_otp_try', '0');
      localStorage.setItem('phishnet_pending_email', email); // เผื่อใช้ในหน้าอื่น

      router.push('/verify-otp');
    } catch (err) {
      console.error(err);
      setError('เกิดปัญหาในการส่ง OTP');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm text-gray-800">
        <h1 className="text-2xl font-bold mb-4 text-center">เข้าสู่ระบบผู้ดูแล</h1>
        <input
          type="email"
          placeholder="กรอกอีเมล"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="รหัสผ่านผู้ดูแล"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleLogin();
          }}
        />
        {error && <p className="text-red-600 text-sm mb-3 text-center">{error}</p>}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg"
        >
          ส่ง OTP ไปยังอีเมล
        </button>
      </div>
    </main>
  );
}
