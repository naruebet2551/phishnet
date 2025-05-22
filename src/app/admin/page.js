'use client';
import { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, getDocs } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, 'url_history'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => {
        const data = doc.data();
        const ts = data.timestamp?.toDate();
        return { id: doc.id, ...data, timestamp: ts };
      });
      setHistory(items);
    });
    return () => unsubscribe();
  }, []);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('CyberSafeNet URL Scan Report', 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [['URL', 'Result', 'Checked At']],
      body: filtered.map((item) => [
        item.url,
        item.result,
        item.timestamp?.toLocaleString() || '-',
      ]),
    });
    doc.save('cybersafenet_report.pdf');
  };

  const handleLogout = () => {
    router.push('/login');
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const deleteSelected = async () => {
    const confirmed1 = confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการที่เลือก?");
    if (!confirmed1) return;
    if (selected.length === 0) return;
   
    for (const id of selected) {
      await deleteDoc(doc(db, 'url_history', id));
    }
    setSelected([]);
  };

  const clearAll = async () => {
    const confirmClear = confirm('ลบประวัติทั้งหมดออกจากระบบ? (ไม่สามารถย้อนกลับได้)');
    if (!confirmClear) return;
    const allDocs = await getDocs(collection(db, 'url_history'));
    for (const d of allDocs.docs) {
      await deleteDoc(doc(db, 'url_history', d.id));
    }
    setSelected([]);
  };

  const filtered = history.filter((item) => item.url.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">CybersafeNet Admin Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={exportPDF}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded shadow"
            >
              Export PDF
            </button>
            <button
              onClick={clearAll}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
            >
              ล้างข้อมูลทั้งหมด
            </button>
            <button
              onClick={handleLogout}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
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
            <div className="text-2xl font-bold">{history.filter(i => i.result === 'safe').length}</div>
          </div>
          <div className="bg-red-600 p-4 rounded-lg shadow text-center">
            <div className="text-sm text-red-100">อันตราย</div>
            <div className="text-2xl font-bold">{history.filter(i => i.result === 'warn').length}</div>
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

        {selected.length > 0 && (
          <div className="mb-4">
            <button
              onClick={deleteSelected}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              ลบรายการที่เลือก ({selected.length})
            </button>
          </div>
        )}

        <div className="bg-gray-800 rounded-xl shadow p-6 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">ประวัติการตรวจ URL</h2>
          <table className="min-w-full text-sm text-left text-gray-200">
            <thead className="bg-gray-700 text-gray-100">
              <tr>
                <th className="px-4 py-2">เลือก</th>
                <th className="px-4 py-2">URL</th>
                <th className="px-4 py-2">ผลการตรวจ</th>
                <th className="px-4 py-2">เวลา</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={item.id} className="border-t border-gray-700">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </td>
                  <td className="px-4 py-2 break-all">{item.url}</td>
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