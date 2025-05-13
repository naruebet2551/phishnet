'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { distance } from 'fastest-levenshtein';
import Link from 'next/link';

export default function Home() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');
  const [lang, setLang] = useState('th');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedLang = localStorage.getItem('phishnet_lang');
    if (savedLang) setLang(savedLang);
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
      menuHome: 'Home',
      menuAbout: 'About',
      checking: 'Checking...'
    }
  };

  const gamblingKeywords = ['bet', 'casino', 'slot', 'หวย', 'บาคาร่า', 'แทงบอล', 'jackpot', 'พนัน'];
  const gamblingNumbers = ['888', '777', '168', '999', '123', '456'];
  const knownDomains = ['facebook.com', 'google.com', 'paypal.com', 'apple.com', 'microsoft.com'];

  const isStructurallySuspicious = (url) => {
    try {
      const parsed = new URL(url);
      const hostnameParts = parsed.hostname.split('.');
      const queryParams = parsed.searchParams;
      const isLong = url.length > 100;
      const tooManySubdomains = hostnameParts.length > 3;
      const tooManyParams = Array.from(queryParams).length >= 5;
      const looksObfuscated = /[a-zA-Z0-9]{10,}/.test(parsed.pathname.replace(/\//g, ''));
      return isLong || tooManySubdomains || tooManyParams || looksObfuscated;
    } catch {
      return false;
    }
  };

  const isSpoofedDomain = () => {
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
      const parsed = new URL(url);
      const fullText = url.toLowerCase() + parsed.pathname + parsed.search;

      const hasGamblingKeyword = gamblingKeywords.some((word) => fullText.includes(word));
      const hasGamblingNumber = gamblingNumbers.some((num) => fullText.includes(num));
      const isStructureBad = isStructurallySuspicious(url);
      const isSpoofed = isSpoofedDomain();

      if (hasGamblingKeyword || hasGamblingNumber || isStructureBad || isSpoofed) {
        await addDoc(collection(db, 'url_history'), {
          url,
          result: 'warn',
          timestamp: Timestamp.now()
        });
        setResult('warn');
        router.push('/warning');
        return;
      }

      const aiRes = await fetch('/api/ai-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const aiData = await aiRes.json();
      const finalResult = aiData.result === 'warn' ? 'warn' : 'safe';

      await addDoc(collection(db, 'url_history'), {
        url,
        result: finalResult,
        timestamp: Timestamp.now()
      });

      setResult(finalResult);
      if (finalResult === 'warn') {
        router.push('/warning');
      }
    } catch (err) {
      console.error(err);
      setResult('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 text-white px-4">
      <nav className="sticky top-0 z-50 w-full bg-blue-950 bg-opacity-80 py-4 shadow-md">
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
            onKeyDown={(e) => e.key === 'Enter' && checkPhishing()}
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
        </div>
      </div>

      <footer className="mt-10 text-sm text-white/70 text-center py-4">
        © 2025 {text[lang].title} by TEAM F=MAfia SME PRS
      </footer>
    </main>
  );
}