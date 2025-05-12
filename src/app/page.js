'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { distance } from 'fastest-levenshtein';

export default function Home() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  const [lang, setLang] = useState('th');
  const [loading, setLoading] = useState(false); // ✅ animation loading

  useEffect(() => {
    const savedLang = localStorage.getItem('phishnet_lang');
    if (savedLang) setLang(savedLang);

    const saved = JSON.parse(localStorage.getItem('phishnet_user_history') || '[]');
    setHistory(saved);
  }, []);

  const text = {
    th: {
      title: 'PhishNet',
      desc: 'ระบบตรวจจับการหลอกลวงทางการเงินออนไลน์แบบเรียลไทม์',
      placeholder: 'วาง URL ที่ต้องการตรวจสอบ...',
      check: 'ตรวจสอบ',
      safe: '✅ เว็บไซต์นี้ดูปลอดภัย',
      warn: '⚠️ ลิงก์น่าสงสัยหรืออันตราย',
      error: 'เกิดข้อผิดพลาดในการตรวจสอบลิงก์',
      empty: '⚠️ กรุณากรอกลิงก์',
      history: 'ประวัติการตรวจ',
      clear: 'ล้างประวัติ',
      menuHome: 'หน้าหลัก',
      menuAbout: 'เกี่ยวกับ',
      checking: 'กำลังตรวจสอบ...',
    },
    en: {
      title: 'PhishNet',
      desc: 'Real-time anti-phishing URL scanner',
      placeholder: 'Paste URL to check...',
      check: 'Check',
      safe: '✅ This website looks safe',
      warn: '⚠️ This link looks suspicious or dangerous',
      error: 'An error occurred while checking the link',
      empty: '⚠️ Please enter a URL',
      history: 'Scan History',
      clear: 'Clear history',
      menuHome: 'Home',
      menuAbout: 'About',
      checking: 'Checking...',
    },
  };

  const knownDomains = ['facebook.com', 'google.com', 'paypal.com', 'apple.com', 'microsoft.com'];

  const isSuspiciousDomain = () => {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname;

      return knownDomains.some((domain) => {
        const d = distance(domain, hostname);
        return d <= 2 && hostname !== domain;
      });
    } catch {
      return false;
    }
  };

  const checkPhishing = async () => {
    if (!url.trim()) {
      setResult('empty');
      return;
    }

    setLoading(true); // ✅ เริ่มโหลด

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      const suspiciousWords = ['login', 'bank', 'free'];
      const hasSuspiciousWord = suspiciousWords.some((word) =>
        url.toLowerCase().includes(word)
      );

      const isSpoofed = isSuspiciousDomain();
      const isDangerous =
        data.result.includes('อันตราย') ||
        data.result.includes('dangerous') ||
        hasSuspiciousWord ||
        isSpoofed;

      const finalResult = isDangerous ? 'warn' : 'safe';
      setResult(finalResult);

      const newEntry = { url, result: finalResult };

      const updatedUserHistory = [newEntry, ...history].slice(0, 10);
      setHistory(updatedUserHistory);
      localStorage.setItem('phishnet_user_history', JSON.stringify(updatedUserHistory));

      const adminHistory = JSON.parse(localStorage.getItem('phishnet_admin_history') || '[]');
      const updatedAdminHistory = [newEntry, ...adminHistory].slice(0, 100);
      localStorage.setItem('phishnet_admin_history', JSON.stringify(updatedAdminHistory));
    } catch (error) {
      console.error('เกิดข้อผิดพลาด:', error);
      setResult('error');
    } finally {
      setLoading(false); // ✅ จบโหลด
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('phishnet_user_history');
    setHistory([]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-600 to-blue-300 flex flex-col">
      <nav className="sticky top-0 z-50 w-full bg-white/10 backdrop-blur-md shadow-md border-b border-white/20 text-white">
        <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
          <span className="text-xl font-bold tracking-wide">{text[lang].title}</span>
          <div className="space-x-6 text-sm flex items-center">
            <Link href="/" className="hover:underline">{text[lang].menuHome}</Link>
            <Link href="/about" className="hover:underline">{text[lang].menuAbout}</Link>
            <select
              onChange={(e) => {
                setLang(e.target.value);
                localStorage.setItem('phishnet_lang', e.target.value);
              }}
              value={lang}
              className="bg-transparent border px-2 py-1 rounded text-white"
            >
              <option value="th">ไทย</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>
      </nav>

      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-2xl text-gray-800 border border-gray-200 animate-fade-in-up">
          <h1 className="text-4xl font-extrabold mb-4 text-center">{text[lang].title}</h1>
          <p className="text-center text-gray-600 mb-8 text-lg">{text[lang].desc}</p>

          <input
            type="text"
            placeholder={text[lang].placeholder}
            className="w-full p-4 rounded-xl border border-gray-300 bg-gray-100 text-gray-800 placeholder-gray-500 mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          {loading ? (
            <div className="flex items-center justify-center mb-6">
              <div className="w-6 h-6 border-4 border-white border-t-yellow-400 rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-700 font-medium">{text[lang].checking}</span>
            </div>
          ) : (
            <button
              onClick={checkPhishing}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-xl shadow-md transition duration-200 mb-6"
            >
              {text[lang].check}
            </button>
          )}

          {result && (
            <div
              className={`p-4 text-lg font-bold text-center rounded-lg ${
                result === 'warn'
                  ? 'bg-red-600 text-white'
                  : result === 'safe'
                  ? 'bg-green-500 text-white'
                  : result === 'empty'
                  ? 'bg-yellow-300 text-black'
                  : 'bg-gray-400 text-white'
              }`}
            >
              {text[lang][result]}
            </div>
          )}

          {history.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-md font-semibold text-gray-800">{text[lang].history}</h2>
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-500 hover:text-red-700 underline"
                >
                  {text[lang].clear}
                </button>
              </div>
              <ul className="space-y-1 text-sm text-gray-700 max-h-40 overflow-y-auto">
                {history.map((item, index) => (
                  <li key={index}>
                    <span className="font-medium">{item.url}</span> → {text[lang][item.result]}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <footer className="text-center py-4 text-sm text-white/70">
        © 2025 {text[lang].title} by F=MAfia SME
      </footer>
    </main>
  );
}
