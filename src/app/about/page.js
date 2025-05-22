'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AboutPage() {
  const [lang, setLang] = useState('th');

  // ดึงค่าภาษาจาก localStorage (ถ้ามี)
  useEffect(() => {
    const savedLang = localStorage.getItem('phishnet_lang');
    if (savedLang) setLang(savedLang);
  }, []);

  const text = {
    th: {
      title: 'เกี่ยวกับ CyberSafeNet',
      desc1: 'CyberSafeNet คือเว็บแอปสำหรับตรวจสอบความปลอดภัยของลิงก์ (URL) ที่อาจเป็นฟิชชิ่งหรือพยายามหลอกขโมยข้อมูลส่วนตัวหรือทางการเงินของผู้ใช้',
      desc2: 'ระบบใช้ Google Safe Browsing API ร่วมกับการวิเคราะห์คำที่น่าสงสัย เช่น login, bank และ free เพื่อประเมินความเสี่ยงของลิงก์',
      back: '← ย้อนกลับหน้าหลัก',
    },
    en: {
      title: 'About CyberSafeNet',
      desc1: 'CyberSafeNet is a web app that helps verify the safety of links (URLs) that may be phishing attempts or scams targeting your personal or financial data.',
      desc2: 'The system uses Google Safe Browsing API combined with keyword analysis like login, bank, and free to assess the risk of each URL.',
      back: '← Back to Home',
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 flex items-center justify-center p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-2xl text-gray-800 border border-gray-200 animate-fade-in-up">
        <h1 className="text-3xl font-bold mb-4 text-center">{text[lang].title}</h1>

        <p className="text-lg text-gray-700 mb-4 leading-relaxed">
          {text[lang].desc1}
        </p>
        <p className="text-gray-700 leading-relaxed mb-6">
          {text[lang].desc2}
        </p>

        <div className="text-center mt-4">
          <Link href="/">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md shadow-md transition">
              {text[lang].back}
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
