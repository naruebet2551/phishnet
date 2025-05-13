'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [history, setHistory] = useState([]);
  const [lang, setLang] = useState('th');

  useEffect(() => {
    const auth = sessionStorage.getItem('phishnet_admin_auth');
    if (!auth) router.push('/login');
    else setAuthenticated(true);

    const savedLang = localStorage.getItem('phishnet_lang');
    if (savedLang) setLang(savedLang);

    const adminHistory = JSON.parse(localStorage.getItem('phishnet_admin_history') || '[]');
    setHistory(adminHistory);
  }, []);

  const logout = () => {
    sessionStorage.removeItem('phishnet_admin_auth');
    router.push('/login');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('PhishNet Admin Report', 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [['URL', 'Result']],
      body: history.map((item) => [item.url, item.result]),
    });
    doc.save('phishnet_report.pdf');
  };

  const chartData = {
    series: [
      history.filter((h) => h.result === 'safe').length,
      history.filter((h) => h.result === 'warn').length
    ],
    options: {
      labels: ['Safe', 'Dangerous'],
      colors: ['#22c55e', '#ef4444'],
      legend: { position: 'bottom' }
    }
  };

  if (!authenticated) return null;

  return (
    <main className="min-h-screen bg-gray-100 text-gray-800 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">PhishNet Admin Dashboard</h1>
          <div className="space-x-2">
            <button onClick={exportPDF} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Export PDF
            </button>
            <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
              Logout
            </button>
          </div>
        </div>

        <div className="mb-8">
          <Chart type="pie" series={chartData.series} options={chartData.options} width="100%" height={300} />
        </div>

        <h2 className="text-lg font-semibold mb-2">ตรวจสอบล่าสุด</h2>
        <div className="border rounded-lg overflow-y-auto max-h-64">
          <table className="w-full text-sm table-auto">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left">URL</th>
                <th className="px-4 py-2 text-left">ผลการตรวจ</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={index} className="odd:bg-white even:bg-gray-50">
                  <td className="px-4 py-2">{item.url}</td>
                  <td className="px-4 py-2">{item.result === 'safe' ? 'ปลอดภัย' : 'อันตราย'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
