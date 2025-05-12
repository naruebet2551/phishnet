'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import jsPDF from 'jspdf';

export default function AdminPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const isAdmin = localStorage.getItem('phishnet_admin') === 'true';
    if (!isAdmin) {
      router.push('/login');
      return;
    }

    const saved = JSON.parse(localStorage.getItem('phishnet_admin_history') || '[]');
    setHistory(saved);
  }, []);

  const deleteEntry = (indexToDelete) => {
    const updated = history.filter((_, i) => i !== indexToDelete);
    setHistory(updated);
    localStorage.setItem('phishnet_admin_history', JSON.stringify(updated));
  };

  const filteredHistory = history.filter((item) =>
    item.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportPDF = () => {
    const doc = new jsPDF();
    const lineHeight = 10;
    const startY = 40;
    const maxY = 270;
    let y = startY;
    let page = 1;

    const now = new Date();
    const timestamp = now.toLocaleString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    const addHeader = () => {
      doc.setFontSize(14);
      doc.text('📄 รายงานประวัติการตรวจลิงก์ (PhishNet)', 10, 15);
      doc.setFontSize(10);
      doc.text(`สร้างเมื่อ: ${timestamp}`, 10, 22);
    };

    const addFooter = () => {
      doc.setFontSize(10);
      doc.text(`หน้า ${page}`, 100, 285);
    };

    addHeader();

    filteredHistory.forEach((item, i) => {
      if (y > maxY) {
        addFooter();
        doc.addPage();
        page++;
        y = startY;
        addHeader();
      }

      doc.setFontSize(12);
      doc.text(`• ${item.url} → ${item.result}`, 10, y);
      y += lineHeight;
    });

    addFooter();
    doc.save('phishnet-report.pdf');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">🔐 Admin Dashboard</h1>

        <div className="mb-4 text-center">
          <input
            type="text"
            placeholder="🔍 ค้นหา URL..."
            className="w-full max-w-md p-3 rounded-md text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredHistory.length === 0 ? (
          <p className="text-center text-gray-300">ไม่มีข้อมูลที่ตรงกับคำค้น</p>
        ) : (
          <table className="w-full border border-gray-600 text-sm bg-white text-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 text-left w-2/3">URL</th>
                <th className="py-2 px-4 text-left">ผล</th>
                <th className="py-2 px-4 text-center">ลบ</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item, i) => (
                <tr key={i} className="border-t border-gray-300">
                  <td className="py-2 px-4 break-all">{item.url}</td>
                  <td className="py-2 px-4">{item.result}</td>
                  <td className="py-2 px-4 text-center">
                    <button
                      onClick={() => deleteEntry(history.indexOf(item))}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-6 text-center space-x-3">
          <button
            onClick={exportPDF}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
          >
            ดาวน์โหลด PDF
          </button>

          <button
            onClick={() => {
              localStorage.removeItem('phishnet_admin');
              window.location.href = '/login';
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md"
          >
            ออกจากระบบ
          </button>

          <Link
            href="/"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </main>
  );
}
