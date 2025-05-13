'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        router.push('/verify-otp');
      } else {
        alert('ส่ง OTP ไม่สำเร็จ');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center px-6">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl shadow-xl w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6">เข้าสู่ระบบผู้ดูแล</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="กรอกอีเมล"
          className="w-full p-3 mb-4 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none"
        />
        {loading ? (
          <div className="flex justify-center py-2">
            <div className="w-6 h-6 border-4 border-white border-t-yellow-400 rounded-full animate-spin"></div>
          </div>
        ) : (
          <button
            onClick={handleSendOtp}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded transition"
          >
            ส่ง OTP
          </button>
        )}
      </div>
    </main>
  );
}