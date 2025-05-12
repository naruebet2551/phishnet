'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyOTPPage() {
  const [inputOtp, setInputOtp] = useState('');
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();

  // ⏳ Countdown 60 วินาที
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // ✅ ตรวจ OTP
  const verifyOtp = () => {
    const otpFromServer = localStorage.getItem('phishnet_otp');
    const otpExp = parseInt(localStorage.getItem('phishnet_otp_exp'), 10);
    const maxTry = 3;
    let tries = parseInt(localStorage.getItem('phishnet_otp_try') || '0', 10);
    const now = Date.now();

    if (now > otpExp) {
      setError('รหัส OTP หมดอายุ กรุณาขอใหม่');
      return;
    }

    if (tries >= maxTry) {
      setError('คุณกรอกรหัสผิดเกินจำนวนที่อนุญาต');
      return;
    }

    if (inputOtp === otpFromServer) {
      localStorage.removeItem('phishnet_otp');
      localStorage.removeItem('phishnet_otp_exp');
      localStorage.removeItem('phishnet_otp_try');
      localStorage.setItem('phishnet_admin', 'true');
      router.push('/admin');
    } else {
      tries++;
      localStorage.setItem('phishnet_otp_try', tries.toString());
      setError(`รหัสไม่ถูกต้อง (พยายาม ${tries}/${maxTry})`);
    }
  };

  // 🔁 ส่ง OTP ใหม่
  const resendOtp = async () => {
    const email = localStorage.getItem('phishnet_pending_email');
    if (!email) return setError('ไม่พบอีเมลของคุณ');

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      const now = Date.now();
      localStorage.setItem('phishnet_otp', data.otp);
      localStorage.setItem('phishnet_otp_exp', (now + 5 * 60 * 1000).toString());
      localStorage.setItem('phishnet_otp_try', '0');
      setError('ส่งรหัส OTP ใหม่เรียบร้อยแล้ว');
      setCooldown(60);
    } catch (err) {
      console.error(err);
      setError('ส่ง OTP ไม่สำเร็จ');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm text-gray-800">
        <h1 className="text-2xl font-bold mb-4 text-center">ยืนยันรหัส OTP</h1>

        <input
          type="text"
          placeholder="กรอกรหัส OTP ที่ได้รับทางอีเมล"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg text-center"
          value={inputOtp}
          onChange={(e) => setInputOtp(e.target.value)}
        />

        {error && <p className="text-red-600 text-sm mb-3 text-center">{error}</p>}

        <button
          onClick={verifyOtp}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg"
        >
          ยืนยันรหัส OTP
        </button>

        {cooldown > 0 ? (
          <p className="text-sm text-gray-500 mt-3 text-center">
            ขอรหัสใหม่ได้ใน {cooldown} วินาที
          </p>
        ) : (
          <button
            onClick={resendOtp}
            className="text-sm text-blue-600 hover:underline mt-3 block text-center"
          >
            ส่ง OTP ใหม่
          </button>
        )}
      </div>
    </main>
  );
}
