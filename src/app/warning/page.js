'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function WarningPage() {
  const [detectedUrl, setDetectedUrl] = useState('');
  const [lang, setLang] = useState('th');

  useEffect(() => {
    const savedLang = localStorage.getItem('phishnet_lang') || 'th';
    setLang(savedLang);
    const url = localStorage.getItem('phishnet_last_url') || '';
    setDetectedUrl(url);
  }, []);

  const text = {
    th: {
      title: '⚠️ ตรวจพบลิงก์ที่น่าสงสัยหรืออันตราย',
      message: 'ลิงก์นี้อาจเกี่ยวข้องกับการหลอกลวงหรือขโมยข้อมูลส่วนตัว',
      advice: [
        '❗ ห้ามกรอกข้อมูลส่วนตัว รหัสผ่าน หรือ OTP',
        '❌ หลีกเลี่ยงการคลิกซ้ำ หรือแชร์ลิงก์นี้',
        '✅ ตรวจสอบชื่อเว็บไซต์ให้แน่ใจ เช่น www.facebook.com ไม่ใช่ faceboook.com',
        '🔒 เปิด 2FA และการแจ้งเตือนความปลอดภัย',
        '⚠️ หากเผลอให้ข้อมูล → เปลี่ยนรหัสผ่านทันที'
      ],
      back: 'กลับหน้าหลัก',
      report: 'แจ้งเบาะแสกับตำรวจไซเบอร์'
    },
    en: {
      title: '⚠️ Suspicious or Dangerous Link Detected',
      message: 'This link may be related to phishing or data theft attempts.',
      advice: [
        '❗ Do not enter personal information, passwords, or OTP',
        '❌ Avoid clicking this link again or sharing it',
        '✅ Double-check the website address, e.g., www.facebook.com not faceboook.com',
        '🔒 Enable 2FA and security notifications',
        '⚠️ If you gave away info → change your password immediately'
      ],
      back: 'Back to Home',
      report: 'Report to Cyber Police'
    }
  };

  const t = text[lang];

  return (
    <main className="min-h-screen bg-red-800 text-white flex items-center justify-center px-6 py-12">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl max-w-2xl w-full shadow-2xl animate-fade-in-up">
        <h1 className="text-3xl font-bold text-center mb-4">{t.title}</h1>

        {detectedUrl && (
          <p className="text-center text-yellow-300 text-md font-mono mb-4 break-all">
            {detectedUrl}
          </p>
        )}

        <p className="text-center text-white/90 text-lg mb-6">{t.message}</p>

        <div className="bg-white/20 rounded-xl p-5 space-y-3 text-sm leading-relaxed">
          <ul className="list-disc list-inside space-y-2">
            {t.advice.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="text-center mt-6 space-x-4">
          <Link
            href="/"
            className="bg-white text-red-700 font-bold px-6 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            {t.back}
          </Link>

          <a
            href="https://www.thaipoliceonline.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-400 text-black font-bold px-6 py-2 rounded-lg hover:bg-yellow-500 transition"
          >
            {t.report}
          </a>
        </div>
      </div>
    </main>
  );
}
