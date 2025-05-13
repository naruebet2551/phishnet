'use client';
import { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, 'url_history'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => {
        const data = doc.data();
        const ts = data.timestamp?.toDate();
        return { ...data, timestamp: ts };
      });
      setHistory(items);
    });
    return () => unsubscribe();
  }, []);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('PhishNet URL Scan Report', 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [['URL', 'Result', 'Checked At']],
      body: filtered.map((item) => [
        item.url,
        item.result,
        item.timestamp?.toLocaleString() || '-',
      ]),
    });
    doc.save('phishnet_report.pdf');
  };

  const countByType = (type) => history.filter((item) => item.result === type).length;

  const handleLogout = () => {
    router.push('/login');
  };

  const filtered = history.filter(item => item.url.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">PhishNet Admin Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={exportPDF}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded shadow"
            >
              Export PDF
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg shadow text-center">
            <div className="text-sm text-gray-400">รวมทั้งหมด</div>
            <div className="text-2xl font-bold">{history.length}</div>
          </div>
          <div className="bg-green-600 p-4 rounded-lg shadow text-center">
            <div className="text-sm text-green-100">ปลอดภัย</div>
            <div className="text-2xl font-bold">{countByType('safe')}</div>
          </div>
          <div className="bg-red-600 p-4 rounded-lg shadow text-center">
            <div className="text-sm text-red-100">อันตราย</div>
            <div className="text-2xl font-bold">{countByType('warn')}</div>
          </div>
        </section>

        <div className="mb-4">
          <input
            type="text"
            placeholder="ค้นหา URL..."
            className="w-full md:w-1/2 p-3 rounded bg-gray-700 text-white placeholder-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="bg-gray-800 rounded-xl shadow p-6 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">ประวัติการตรวจ URL</h2>
          <table className="min-w-full text-sm text-left text-gray-200">
            <thead className="bg-gray-700 text-gray-100">
              <tr>
                <th className="px-4 py-2">URL</th>
                <th className="px-4 py-2">ผลการตรวจ</th>
                <th className="px-4 py-2">เวลา</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={i} className="border-t border-gray-700">
                  <td className="px-4 py-2">{item.url}</td>
                  <td className={`px-4 py-2 font-semibold ${
                    item.result === 'warn' ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {item.result === 'warn' ? 'อันตราย' : 'ปลอดภัย'}
                  </td>
                  <td className="px-4 py-2">{item.timestamp?.toLocaleString() || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}