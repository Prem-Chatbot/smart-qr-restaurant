import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Users, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  X,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { RestaurantTable } from '../../types';
import { db, doc, updateDoc, setDoc } from '../../firebase';
import { INITIAL_TABLES } from '../../data/seedData';

interface TableManagementProps {
  tables: RestaurantTable[];
  onSelectTableForCustomer: (tableNumber: string) => void;
}

// โดเมนหลักบน Vercel สำหรับให้สมาร์ตโฟนสแกนเข้าได้จากทุกที่
const PRODUCTION_URL = 'https://smart-qr-restaurant.vercel.app';

export const TableManagement: React.FC<TableManagementProps> = ({
  tables,
  onSelectTableForCustomer
}) => {
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [qrModalDataUrl, setQrModalDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [qrThumbnails, setQrThumbnails] = useState<{ [tableNumber: string]: string }>({});

  // ฟังก์ชันหา URL ฐาน: ถ้ากำลังรัน localhost ให้ใช้ลิงก์ Vercel ทันที เพื่อให้มือถือสแกนติด
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return PRODUCTION_URL;
      }
      return window.location.origin;
    }
    return PRODUCTION_URL;
  };

  // Generate QR thumbnail for tables
  useEffect(() => {
    let isMounted = true;
    async function genThumbnails() {
      const thumbs: { [key: string]: string } = {};
      const base = getBaseUrl();
      for (const t of tables) {
        try {
          const url = `${base}/?table=${t.tableNumber}`;
          thumbs[t.tableNumber] = await QRCode.toDataURL(url, {
            width: 140,
            margin: 1,
            color: { dark: '#292524', light: '#ffffff' }
          });
        } catch (e) {
          console.error(e);
        }
      }
      if (isMounted) setQrThumbnails(thumbs);
    }
    if (tables.length > 0) genThumbnails();
    return () => { isMounted = false; };
  }, [tables]);

  const handleOpenQrModal = async (table: RestaurantTable) => {
    setSelectedTable(table);
    try {
      const base = getBaseUrl();
      const targetUrl = `${base}/?table=${table.tableNumber}`;
      const fullQr = await QRCode.toDataURL(targetUrl, {
        width: 320,
        margin: 2,
        color: { dark: '#1c1917', light: '#ffffff' }
      });
      setQrModalDataUrl(fullQr);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyLink = (tableNumber: string) => {
    const base = getBaseUrl();
    const url = `${base}/?table=${tableNumber}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChangeTableStatus = async (table: RestaurantTable, status: 'available' | 'occupied' | 'reserved') => {
    try {
      const tableRef = doc(db, 'tables', table.id);
      await updateDoc(tableRef, { status });
      if (selectedTable && selectedTable.id === table.id) {
        setSelectedTable({ ...selectedTable, status });
      }
    } catch (err) {
      console.error('Failed to update table status:', err);
    }
  };

  const handleInitDefaultTables = async () => {
    try {
      for (const t of INITIAL_TABLES) {
        await setDoc(doc(db, 'tables', (t as any).id || t.tableNumber), t);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            ระบบจัดการโต๊ะ & QR Code ประจำโต๊ะ
          </h2>
          <p className="text-xs text-stone-500">
            พิมพ์ QR Code วางบนโต๊ะ เพื่อให้ลูกค้าสแกนสั่งอาหารและบันทึกเลขโต๊ะอัตโนมัติ
          </p>
        </div>

        {tables.length === 0 && (
          <button
            onClick={handleInitDefaultTables}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>สร้างโต๊ะเริ่มต้น (T01 - T08)</span>
          </button>
        )}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {tables.map((table) => {
          const qrUrl = qrThumbnails[table.tableNumber];
          return (
            <div
              key={table.id}
              className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 font-extrabold flex items-center justify-center text-sm">
                      {table.tableNumber}
                    </span>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">โต๊ะ {table.tableNumber}</h4>
                      <span className="text-[11px] text-stone-400 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{table.capacity} ที่นั่ง</span>
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    table.status === 'available'
                      ? 'bg-emerald-100 text-emerald-800'
                      : table.status === 'occupied'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {table.status === 'available' && 'ว่าง'}
                    {table.status === 'occupied' && 'มีลูกค้า'}
                    {table.status === 'reserved' && 'จอง'}
                  </span>
                </div>

                {/* QR Code Preview Thumbnail */}
                <div 
                  onClick={() => handleOpenQrModal(table)}
                  className="bg-stone-50 rounded-xl p-3 border border-stone-100 flex flex-col items-center justify-center cursor-pointer hover:bg-stone-100/80 transition group"
                  title="คลิกเพื่อดูและพิมพ์ QR Code ขนาดใหญ่"
                >
                  {qrUrl ? (
                    <img
                      src={qrUrl}
                      alt={`QR โต๊ะ ${table.tableNumber}`}
                      className="w-24 h-24 rounded-lg group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-stone-200 animate-pulse rounded-lg" />
                  )}
                  <span className="text-[10px] text-amber-700 font-medium mt-1.5 flex items-center gap-1 group-hover:underline">
                    <QrCode className="w-3 h-3" />
                    <span>กดดู / พิมพ์ QR Code</span>
                  </span>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="pt-3 mt-3 border-t border-stone-100 space-y-2">
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-stone-400 mr-1">สถานะ:</span>
                  <button
                    onClick={() => handleChangeTableStatus(table, 'available')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                      table.status === 'available' ? 'bg-emerald-600 text-white font-bold' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    ว่าง
                  </button>
                  <button
                    onClick={() => handleChangeTableStatus(table, 'occupied')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                      table.status === 'occupied' ? 'bg-amber-600 text-white font-bold' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    มีลูกค้า
                  </button>
                </div>

                <button
                  onClick={() => onSelectTableForCustomer(table.tableNumber)}
                  className="w-full py-1.5 px-3 rounded-lg bg-stone-100 hover:bg-amber-50 hover:text-amber-800 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3 text-amber-600" />
                  <span>เปิดมุมมองลูกค้าโต๊ะนี้</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* QR Code Big Display Modal */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Smart QR Order Code
              </span>
              <button
                onClick={() => setSelectedTable(null)}
                className="w-7 h-7 rounded-full hover:bg-stone-100 text-stone-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <span className="text-3xl font-black text-stone-900 block">
                โต๊ะ {selectedTable.tableNumber}
              </span>
              <span className="text-xs text-stone-400">
                สแกนด้วยสมาร์ทโฟนเพื่อเปิดเมนูสั่งอาหารได้ทันที
              </span>
            </div>

            {/* Big QR Image */}
            <div className="p-4 bg-white rounded-2xl border-2 border-stone-900 shadow-md inline-block mb-4">
              {qrModalDataUrl && (
                <img
                  src={qrModalDataUrl}
                  alt={`QR Code โต๊ะ ${selectedTable.tableNumber}`}
                  className="w-56 h-56 mx-auto"
                />
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleCopyLink(selectedTable.tableNumber)}
                className="w-full py-2.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">คัดลอกลิงก์สำเร็จแล้ว!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-stone-400" />
                    <span>คัดลอกลิงก์สั่งอาหาร (URL)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  onSelectTableForCustomer(selectedTable.tableNumber);
                  setSelectedTable(null);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>เปิดทดสอบสั่งอาหารโต๊ะนี้ทันที</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};