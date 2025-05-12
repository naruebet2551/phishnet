'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function WarningPage() {
  const [detectedUrl, setDetectedUrl] = useState('');

  useEffect(() => {
    const url = localStorage.getItem('phishnet_last_url');
    setDetectedUrl(url || '');
  }, []);

  return (
    <main className="min-h-screen bg-red-800 text-white flex items-center justify-center px-6 py-12">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl max-w-2xl w-full shadow-2xl animate-fade-in-up">
        <h1 className="text-3xl font-bold text-center mb-4">⚠️ ตรวจพบลิงก์ที่น่าสงสัยหรืออันตราย</h1>

        {detectedUrl && (
          <p className="text-center text-yellow-300 text-md font-mono mb-4 break-all">
            {detectedUrl}
          </p>
        )}

        <p className="text-center text-white/90 text-lg mb-6">
          ลิงก์นี้อาจเกี่ยวข้องกับฟิชชิ่ง การหลอกลวง หรือการขโมยข้อมูลส่วนตัว
        </p>

        <div className="bg-white/20 rounded-xl p-5 space-y-3 text-sm leading-relaxed">
          <ul className="list-disc list-inside space-y-2">
            <li>❗ ห้ามกรอกข้อมูลส่วนตัว รหัสผ่าน หรือรหัส OTP</li>
            <li>❌ หลีกเลี่ยงการคลิกซ้ำ หรือแชร์ลิงก์นี้ให้ผู้อื่น</li>
            <li>✅ ตรวจสอบชื่อเว็บไซต์ให้แน่ใจ เช่น www.facebook.com ไม่ใช่ faceboook.com</li>
            <li>🔒 ใช้งานระบบแจ้งเตือน และเปิด 2FA เสมอ</li>
            <li>⚠️ หากเผลอให้ข้อมูล → เปลี่ยนรหัสผ่านทันทีและติดต่อธนาคาร/แพลตฟอร์มที่เกี่ยวข้อง</li>
          </ul>
        </div>

        <div className="text-center mt-6 space-x-4">
          <Link
            href="/"
            className="bg-white text-red-700 font-bold px-6 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            กลับหน้าหลัก
          </Link>

          <a
            href="https://www.thaipoliceonline.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-400 text-black font-bold px-6 py-2 rounded-lg hover:bg-yellow-500 transition"
          >
            แจ้งเบาะแสกับตำรวจไซเบอร์
          </a>
        </div>
      </div>
    </main>
  );
}
