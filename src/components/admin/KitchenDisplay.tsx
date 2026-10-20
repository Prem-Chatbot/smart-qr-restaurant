import React, { useState } from 'react';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Flame, 
  ArrowRight, 
  RotateCcw,
  Volume2,
  VolumeX,
  CreditCard,
  Filter
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { formatTHB } from '../../utils/pricing';
import { db, doc, updateDoc } from '../../firebase';

interface KitchenDisplayProps {
  orders: Order[];
  onOrderUpdated?: () => void;
}

export const KitchenDisplay: React.FC<KitchenDisplayProps> = ({ orders }) => {
  const [filterView, setFilterView] = useState<'active' | 'all'>('active');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    if (filterView === 'active') {
      return ord.status === 'received' || ord.status === 'preparing';
    }
    return true;
  });

  // Calculate elapsed time from creation
  const getElapsedMinutes = (createdAt: string) => {
    const elapsedMs = Date.now() - new Date(createdAt).getTime();
    return Math.max(0, Math.floor(elapsedMs / (1000 * 60)));
  };

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      setUpdatingId(orderId);
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: nextStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('ไม่สามารถอัปเดตสถานะออเดอร์ได้ กรุณาตรวจสอบสิทธิ์ผู้ดูแลระบบ');
    } finally {
      setUpdatingId(null);
    }
  };

  const receivedOrders = filteredOrders.filter((o) => o.status === 'received');
  const preparingOrders = filteredOrders.filter((o) => o.status === 'preparing');
  const servedOrders = filteredOrders.filter((o) => o.status === 'served');

  return (
    <div className="space-y-6">
      
      {/* KDS Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900">
              หน้าจอจัดการครัวแบบเรียลไทม์ (Kitchen Display System - KDS)
            </h2>
            <p className="text-xs text-stone-500">
              อัปเดตอัตโนมัติผ่าน Cloud Firestore • กำลังทำ {preparingOrders.length} • รอรับ {receivedOrders.length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterView('active')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterView === 'active'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              กำลังทำ ({receivedOrders.length + preparingOrders.length})
            </button>
            <button
              onClick={() => setFilterView('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterView === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              ทั้งหมด ({orders.length})
            </button>
          </div>
        </div>
      </div>

      {/* KDS Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Received / New Orders */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
              <h3 className="font-bold text-stone-800 text-sm">
                1. ออเดอร์ใหม่ ({receivedOrders.length})
              </h3>
            </div>
            <span className="text-[11px] text-stone-400 font-medium">รอเริ่มทำ</span>
          </div>

          <div className="space-y-4">
            {receivedOrders.length === 0 ? (
              <div className="p-8 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-center text-stone-400 text-xs">
                ไม่มีออเดอร์ใหม่ในขณะนี้
              </div>
            ) : (
              receivedOrders.map((ord) => (
                <KdsTicketCard
                  key={ord.id}
                  order={ord}
                  elapsedMin={getElapsedMinutes(ord.createdAt)}
                  isUpdating={updatingId === ord.id}
                  onNext={() => handleUpdateStatus(ord.id, 'preparing')}
                  onCancel={() => handleUpdateStatus(ord.id, 'cancelled')}
                  nextLabel="เริ่มปรุงอาหาร"
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: Preparing */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <h3 className="font-bold text-stone-800 text-sm">
                2. กำลังปรุง ({preparingOrders.length})
              </h3>
            </div>
            <span className="text-[11px] text-stone-400 font-medium">บนเตา / ในครัว</span>
          </div>

          <div className="space-y-4">
            {preparingOrders.length === 0 ? (
              <div className="p-8 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-center text-stone-400 text-xs">
                ไม่มีรายการที่กำลังปรุง
              </div>
            ) : (
              preparingOrders.map((ord) => (
                <KdsTicketCard
                  key={ord.id}
                  order={ord}
                  elapsedMin={getElapsedMinutes(ord.createdAt)}
                  isUpdating={updatingId === ord.id}
                  onNext={() => handleUpdateStatus(ord.id, 'served')}
                  onCancel={() => handleUpdateStatus(ord.id, 'cancelled')}
                  nextLabel="ปรุงเสร็จพร้อมเสิร์ฟ"
                  themeColor="blue"
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Served / Completed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <h3 className="font-bold text-stone-800 text-sm">
                3. เสิร์ฟแล้ว ({servedOrders.length})
              </h3>
            </div>
            <span className="text-[11px] text-stone-400 font-medium">เสร็จสิ้น</span>
          </div>

          <div className="space-y-4">
            {servedOrders.length === 0 ? (
              <div className="p-8 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-center text-stone-400 text-xs">
                ยังไม่มีออเดอร์ที่เสิร์ฟในรอบนี้
              </div>
            ) : (
              servedOrders.slice(0, 10).map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs opacity-75 hover:opacity-100 transition space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-900 bg-stone-100 px-2.5 py-0.5 rounded-md">
                      โต๊ะ {ord.tableNumber}
                    </span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      เสิร์ฟเรียบร้อย
                    </span>
                  </div>
                  <div className="text-xs text-stone-600 divide-y divide-stone-100">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="py-1 flex justify-between">
                        <span>{it.quantity}x {it.name}</span>
                        <span className="text-stone-400">{formatTHB(it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-stone-100 flex justify-between text-[11px] text-stone-400">
                    <span>ยอดชำระ: {formatTHB(ord.totalAmount)}</span>
                    <span className={ord.paymentStatus === 'paid' ? 'text-emerald-600 font-semibold' : 'text-amber-600'}>
                      {ord.paymentStatus === 'paid' ? 'ชำระแล้ว' : 'รอชำระ'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

interface KdsTicketProps {
  order: Order;
  elapsedMin: number;
  isUpdating: boolean;
  onNext: () => void;
  onCancel: () => void;
  nextLabel: string;
  themeColor?: 'amber' | 'blue';
}

const KdsTicketCard: React.FC<KdsTicketProps> = ({
  order,
  elapsedMin,
  isUpdating,
  onNext,
  onCancel,
  nextLabel,
  themeColor = 'amber'
}) => {
  const isUrgent = elapsedMin > 15;

  return (
    <div className={`bg-white rounded-2xl border shadow-xs overflow-hidden transition-all ${
      isUrgent
        ? 'border-red-300 ring-2 ring-red-400/20'
        : themeColor === 'blue'
        ? 'border-blue-200'
        : 'border-amber-200'
    }`}>
      {/* Ticket Header */}
      <div className={`p-3.5 flex items-center justify-between text-xs font-bold ${
        themeColor === 'blue' ? 'bg-blue-50/70 text-blue-950' : 'bg-amber-50/70 text-amber-950'
      }`}>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-white shadow-2xs text-stone-900 font-black text-sm">
            โต๊ะ {order.tableNumber}
          </span>
          <span className="font-mono text-[11px] text-stone-500">
            #{order.id.slice(-6).toUpperCase()}
          </span>
        </div>

        {/* Elapsed Timer */}
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${
          isUrgent ? 'bg-red-500 text-white animate-pulse' : 'bg-stone-200/80 text-stone-700'
        }`}>
          <Clock className="w-3.5 h-3.5" />
          <span>{elapsedMin} นาที</span>
        </div>
      </div>

      {/* Ticket Items */}
      <div className="p-4 space-y-2.5">
        <div className="divide-y divide-stone-100">
          {order.items.map((it, idx) => (
            <div key={idx} className="py-2 flex items-start justify-between gap-3 text-xs">
              <div className="flex-1">
                <span className="font-bold text-stone-900 text-sm">
                  <span className="text-amber-700 font-black mr-1">{it.quantity}x</span>
                  {it.name}
                </span>
                {it.notes && (
                  <p className="mt-0.5 text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-medium inline-block">
                    ⚠️ {it.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* General Customer Notes */}
        {order.customerNotes && (
          <div className="p-2.5 bg-yellow-50 rounded-xl border border-yellow-200 text-xs text-yellow-900">
            <strong>โน้ตจากลูกค้า:</strong> {order.customerNotes}
          </div>
        )}

        {/* Payment indicator badge */}
        <div className="pt-2 flex items-center justify-between text-[11px] border-t border-stone-100">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400">สถานะเงิน:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              order.paymentStatus === 'paid'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {order.paymentStatus === 'paid' ? '✓ จ่ายแล้ว' : 'รอชำระ'}
            </span>
          </div>
          <span className="font-bold text-stone-700">{formatTHB(order.totalAmount)}</span>
        </div>
      </div>

      {/* Ticket Actions */}
      <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center gap-2">
        <button
          onClick={onCancel}
          disabled={isUpdating}
          className="px-3 py-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 text-xs font-semibold transition"
          title="ยกเลิกออเดอร์"
        >
          ยกเลิก
        </button>

        <button
          onClick={onNext}
          disabled={isUpdating}
          className={`flex-1 py-2.5 px-3 rounded-xl text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50 ${
            themeColor === 'blue'
              ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
              : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
          }`}
        >
          {isUpdating ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>{nextLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

    </div>
  );
};
