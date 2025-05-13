'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { distance } from 'fastest-levenshtein';

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
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 text-white">
      <h1 className="text-4xl font-bold mb-4">{text[lang].title}</h1>
      <p className="mb-8 text-center">{text[lang].desc}</p>
      <input
        type="text"
        placeholder={text[lang].placeholder}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && checkPhishing()}
        className="p-4 text-black rounded-lg w-full max-w-xl mb-4"
      />
      {loading ? (
        <div className="animate-spin h-8 w-8 border-4 border-white border-t-yellow-400 rounded-full mb-4"></div>
      ) : (
        <button onClick={checkPhishing} className="bg-yellow-400 text-black font-bold px-6 py-2 rounded-lg">
          {text[lang].check}
        </button>
      )}
      {result && result !== 'warn' && (
        <p className="mt-6 text-lg font-bold">
          {text[lang][result]}
        </p>
      )}
    </main>
  );
}