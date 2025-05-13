'use client';
import { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'url_history'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => doc.data());
      setHistory(items);
    });
    return () => unsubscribe();
  }, []);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('PhishNet Report', 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [['URL', 'Result']],
      body: history.map((item) => [item.url, item.result]),
    });
    doc.save('phishnet_report.pdf');
  };

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">PhishNet Admin Dashboard</h1>
          <button onClick={exportPDF} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Export PDF
          </button>
        </div>
        <table className="w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">URL</th>
              <th className="px-4 py-2 text-left">ผลการตรวจ</th>
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