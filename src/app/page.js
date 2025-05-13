'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export default function Home() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const checkPhishing = async () => {
    if (!url.trim()) {
      setResult('empty');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ai-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const ai = await res.json();
      const finalResult = ai.result || 'safe';

      setResult(finalResult);

      await addDoc(collection(db, 'url_history'), {
        url,
        result: finalResult,
        timestamp: Timestamp.now()
      });

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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">PhishNet</h1>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && checkPhishing()}
        placeholder="Paste URL to check..."
        className="p-3 border rounded w-full max-w-lg"
      />
      <button
        onClick={checkPhishing}
        className="mt-4 px-6 py-2 bg-yellow-400 rounded font-bold"
      >
        ตรวจสอบ
      </button>
      {result && <p className="mt-4 text-lg">{result === 'warn' ? 'ลิงก์น่าสงสัย' : 'ปลอดภัย'}</p>}
    </main>
  );
}
