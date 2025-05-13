'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from './firebase';
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
      checking: 'กำลังตรวจสอบ...',
      menuHome: 'หน้าหลัก',
      menuAbout: 'เกี่ยวกับ'
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
      checking: 'Checking...',
      menuHome: 'Home',
      menuAbout: 'About'
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
      const keywords = ['login', 'bank', 'free', '888', 'slot', 'casino', 'หวย'];
      const spoofedDomains = ['facebook.com', 'google.com', 'apple.com', 'paypal.com'];
      const isKeyword = keywords.some((k) => fullText.includes(k));
      const isSpoof = spoofedDomains.some((domain) => {
        const d = distance(parsed.hostname, domain);
        return d > 0 && d <= 2 && parsed.hostname !== domain;
      });

      const aiRes = await fetch('/api/ai-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const aiData = await aiRes.json();

      const isDanger = isKeyword || isSpoof || aiData.result === 'warn';
      const finalResult = isDanger ? 'warn' : 'safe';

      await addDoc(collection(db, 'url_history'), {
        url,
        result: finalResult,
        timestamp: Timestamp.now()
      });

      setResult(finalResult);

      if (finalResult === 'warn') {
        localStorage.setItem('phishnet_last_url', url);  // <- บันทึก URL ที่อันตราย
        router.push('/warning');                         // <- ไปหน้าเตือน
        return;
      }
    } catch (err) {
      console.error(err);
      setResult('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 text-white">
      <nav className="sticky top-0 w-full bg-blue-950 bg-opacity-80 py-4 shadow-md">
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

      <div className="p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-4 text-center">{text[lang].title}</h1>
        <p className="text-center mb-6">{text[lang].desc}</p>
        <input
          type="text"
          placeholder={text[lang].placeholder}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && checkPhishing()}
          className="w-full p-4 rounded-xl border border-gray-300 text-black mb-4"
        />
        <button
          onClick={checkPhishing}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-xl mb-4"
        >
          {loading ? text[lang].checking : text[lang].check}
        </button>
        {result && result !== 'warn' && (
          <div className={`text-center py-3 px-4 rounded-xl text-lg font-bold ${
            result === 'safe' ? 'bg-green-500' :
            result === 'empty' ? 'bg-yellow-200 text-black' :
            'bg-gray-400'
          }`}>
            {text[lang][result]}
          </div>
        )}
      </div>
    </main>
  );
}