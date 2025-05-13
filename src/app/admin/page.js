'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function AdminPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'url_history'), orderBy('timestamp', 'desc')),
      (snapshot) => {
        const items = snapshot.docs.map(doc => doc.data());
        setHistory(items);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-4">PhishNet Admin</h1>
        <table className="w-full table-auto border">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">URL</th>
              <th className="px-4 py-2 text-left">ผลตรวจ</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-2">{item.url}</td>
                <td className="px-4 py-2">{item.result === 'warn' ? 'อันตราย' : 'ปลอดภัย'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
