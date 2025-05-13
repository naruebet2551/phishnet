'use client';
import Link from 'next/link';

export default function WarningPage() {
  return (
    <main className="min-h-screen bg-red-700 flex items-center justify-center px-4 text-white text-center">
      <div className="bg-red-600 rounded-xl shadow-2xl p-8 max-w-xl w-full border border-white/20">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-300 mb-3">
          ⚠️ ตรวจพบลิงก์ที่น่าสงสัยหรืออันตราย
        </h1>

        <p className="mb-4">
          ลิงก์นี้อาจเกี่ยวข้องกับการหลอกลวงหรือขโมยข้อมูลส่วนตัว กรุณาอ่านคำแนะนำด้านล่างเพื่อป้องกันตัวเอง
        </p>

        <div className="bg-red-500 text-left text-sm rounded-lg px-5 py-4 mb-6">
          <ul className="space-y-2">
            <li>❌ ห้ามกรอกข้อมูลส่วนตัว รหัสผ่าน หรือ OTP ในเว็บไซต์ที่ไม่น่าเชื่อถือ</li>
            <li>⛔ หลีกเลี่ยงการกดลิงก์จากข้อความที่ไม่รู้จัก หรือที่อ้างว่าได้รางวัล</li>
            <li>✅ ตรวจสอบ URL ว่าตรงกับเว็บไซต์จริง เช่น www.facebook.com ไม่ใช่ faceboook.com</li>
            <li>🔐 เปิดใช้ 2FA (การยืนยันตัวตนสองขั้นตอน) ในบัญชีสำคัญ</li>
            <li>⚠️ หากเผลอให้ข้อมูลไปแล้ว ควรรีบเปลี่ยนรหัสผ่านทันที</li>
            <li>🧠 ฝึกสังเกตความผิดปกติ เช่น ภาษาที่แปลผิด ตัวสะกดผิด หรือโลโก้ไม่ชัดเจน</li>
            <li>🛡️ ติดตั้งโปรแกรมสแกนมัลแวร์ และอัปเดตระบบอย่างสม่ำเสมอ</li>
          </ul>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link
            href="/"
            className="bg-white text-red-700 font-bold py-2 px-6 rounded hover:bg-gray-100 text-center"
          >
            กลับหน้าหลัก
          </Link>
          <a
            href="https://www.thaicybercrime.go.th"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-400 text-black font-bold py-2 px-6 rounded hover:bg-yellow-500 text-center"
          >
            แจ้งเบาะแสกับตำรวจไซเบอร์
          </a>
        </div>
      </div>
    </main>
  );
}