'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { distance } from 'fastest-levenshtein';

export default function Home() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  const [lang, setLang] = useState('th');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      checking: 'กำลังตรวจสอบ...'
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
      checking: 'Checking...'
    }
  };

  const knownDomains = ['facebook.com', 'google.com', 'paypal.com', 'apple.com', 'microsoft.com'];
  const gamblingKeywords = ['bet', 'casino', 'slot', 'หวย', 'บาคาร่า', 'แทงบอล', 'jackpot', 'พนัน'];
  const gamblingNumbers = ['888', '777', '168', '999', '123', '456'];

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

    setLoading(true);

    try {
      const hasGamblingKeyword = gamblingKeywords.some((word) => url.toLowerCase().includes(word));
      const hasGamblingNumber = gamblingNumbers.some((num) => url.includes(num));

      if (hasGamblingKeyword || hasGamblingNumber) {
        setResult('warn');
        router.push('/warning');
        return;
      }

      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await res.json();

      const suspiciousWords = ['login', 'bank', 'free'];
      const hasSuspiciousWord = suspiciousWords.some((word) => url.toLowerCase().includes(word));
      const isSpoofed = isSuspiciousDomain();

      const finalResult =
        data.result.includes('danger') || hasSuspiciousWord || isSpoofed ? 'warn' : 'safe';

      setResult(finalResult);

      const newEntry = { url, result: finalResult };
      const updatedUserHistory = [newEntry, ...history].slice(0, 10);
      setHistory(updatedUserHistory);
      localStorage.setItem('phishnet_user_history', JSON.stringify(updatedUserHistory));

      const adminHistory = JSON.parse(localStorage.getItem('phishnet_admin_history') || '[]');
      const updatedAdminHistory = [newEntry, ...adminHistory].slice(0, 100);
      localStorage.setItem('phishnet_admin_history', JSON.stringify(updatedAdminHistory));

      if (finalResult === 'warn') {
        router.push('/warning');
        return;
      }
    } catch (err) {
      console.error(err);
      setResult('error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkPhishing();
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('phishnet_user_history');
    setHistory([]);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 text-white">
      <nav className="w-full bg-blue-950 bg-opacity-80 py-4 shadow-md">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <span className="text-xl font-bold">{text[lang].title}</span>
          <div className="space-x-4 text-sm">
            <Link href="/" className="hover:underline">{text[lang].menuHome}</Link>
            <Link href="/about" className="hover:underline">{text[lang].menuAbout}</Link>
            <select
              value={lang}
              onChange={(e) => {
                setLang(e.target.value);
                localStorage.setItem('phishnet_lang', e.target.value);
              }}
              className="bg-blue-700 px-2 py-1 rounded"
            >
              <option value="th">ไทย</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>
      </nav>

      <div className="flex flex-col items-center p-6 w-full max-w-2xl">
        <div className="bg-white text-gray-800 rounded-2xl shadow-xl p-8 w-full mt-8">
          <h1 className="text-3xl font-bold text-center mb-4">{text[lang].title}</h1>
          <p className="text-center text-gray-600 mb-6">{text[lang].desc}</p>

          <input
            type="text"
            placeholder={text[lang].placeholder}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full p-4 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          {loading ? (
            <div className="text-center mb-4">
              <div className="w-6 h-6 border-4 border-white border-t-yellow-400 rounded-full animate-spin mx-auto"></div>
              <div className="mt-2">{text[lang].checking}</div>
            </div>
          ) : (
            <button
              onClick={checkPhishing}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-xl"
            >
              {text[lang].check}
            </button>
          )}

          {result && result !== 'warn' && (
            <div className={`mt-4 p-3 text-center rounded-xl font-bold text-lg ${
              result === 'safe' ? 'bg-green-500 text-white' :
              result === 'empty' ? 'bg-yellow-200 text-black' :
              'bg-gray-500 text-white'
            }`}>
              {text[lang][result]}
            </div>
          )}

          {history.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">{text[lang].history}</h2>
                <button onClick={clearHistory} className="text-red-600 hover:underline text-sm">
                  {text[lang].clear}
                </button>
              </div>
              <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                {history.map((item, i) => (
                  <li key={i}>
                    {item.url} → {text[lang][item.result]}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-10 text-sm text-white/70 text-center py-4">
        © 2025 {text[lang].title} by ceo boss
      </footer>
    </main>
  );
}
