import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  Utensils, 
  XCircle, 
  CreditCard, 
  ArrowLeft, 
  PlusCircle, 
  AlertCircle,
  Receipt
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { formatTHB } from '../../utils/pricing';
import { db, doc, onSnapshot, updateDoc, handleFirestoreError, OperationType } from '../../firebase';
import { PaymentModal } from './PaymentModal';

interface OrderTrackerProps {
  orderId: string;
  onBackToMenu: () => void;
  onOpenPayment?: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  orderId,
  onBackToMenu
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State สำหรับควบคุมการเปิด-ปิดหน้าต่างชำระเงินในหน้านี้โดยตรง
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isPaid, setIsPaid] = useState<boolean>(() => {
    return localStorage.getItem(`paid_${orderId}`) === 'true';
  });

  useEffect(() => {
    if (!orderId) return;

    setLoading(true);
    const orderRef = doc(db, 'orders', orderId);

    const unsubscribe = onSnapshot(
      orderRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as any;
          setOrder({
            id: snapshot.id,
            ...data
          });
          if (data.paymentStatus === 'paid') {
            setIsPaid(true);
          }
        } else {
          setError('ไม่พบข้อมูลคำสั่งซื้อนี้');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Order listener error:', err);
        setError('เกิดข้อผิดพลาดในการดึงสถานะออเดอร์');
        handleFirestoreError(err, OperationType.GET, `orders/${orderId}`);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  // ฟังก์ชันเมื่อกดยืนยันชำระเงินสำเร็จในหน้าต่าง Popup
  const handlePaymentSuccess = async () => {
    setIsPaid(true);
    setIsModalOpen(false);
    localStorage.setItem(`paid_${orderId}`, 'true');

    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        paymentStatus: 'paid',
        paymentTxnId: 'TXN-' + Date.now()
      });
    } catch (e) {
      console.warn('Update Firestore pass (local saved)');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-semibold text-stone-700">กำลังโหลดสถานะออเดอร์...</p>
        <p className="text-xs text-stone-400 mt-1">ออเดอร์ #{orderId.slice(-6).toUpperCase()}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-stone-900 text-lg mb-1">{error || 'ไม่พบออเดอร์'}</h3>
        <p className="text-xs text-stone-500 mb-6">กรุณาตรวจสอบการเชื่อมต่อหรือสอบถามพนักงานที่ร้าน</p>
        <button
          onClick={onBackToMenu}
          className="px-5 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition"
        >
          กลับสู่หน้าเมนูหลัก
        </button>
      </div>
    );
  }

  const isActuallyPaid = order.paymentStatus === 'paid' || isPaid;

  const getStepState = (target: OrderStatus) => {
    if (order.status === 'cancelled') return 'cancelled';
    const flow = ['received', 'preparing', 'served'];
    const currentIndex = flow.indexOf(order.status);
    const targetIndex = flow.indexOf(target);

    if (currentIndex > targetIndex) return 'completed';
    if (currentIndex === targetIndex) return 'current';
    return 'upcoming';
  };

  const steps = [
    {
      id: 'received' as OrderStatus,
      label: 'รับออเดอร์แล้ว',
      subtext: 'รายการส่งเข้าห้องครัวเรียบร้อย',
      icon: Clock
    },
    {
      id: 'preparing' as OrderStatus,
      label: 'กำลังปรุงอาหาร',
      subtext: 'เชฟกำลังปรุงสดใหม่ด้วยความประณีต',
      icon: ChefHat
    },
    {
      id: 'served' as OrderStatus,
      label: 'เสิร์ฟอาหารแล้ว',
      subtext: 'เสิร์ฟครบทุกจาน ทานให้อร่อยครับ',
      icon: Utensils
    }
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Back button and Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToMenu}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-amber-700 transition py-1 px-2.5 rounded-lg hover:bg-stone-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับสู่หน้าเมนู</span>
        </button>

        <span className="text-xs text-stone-500 font-mono">
          โต๊ะ {order.tableNumber} • ID: #{order.id.slice(-6).toUpperCase()}
        </span>
      </div>

      {/* Main Status Hero Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 text-center relative overflow-hidden">
        {order.status === 'cancelled' ? (
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-red-600">ออเดอร์ถูกยกเลิก</h2>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              คำสั่งซื้อนี้ถูกยกเลิกโดยทางร้าน หากมีข้อสงสัยโปรดสอบถามพนักงานที่เคาน์เตอร์
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
                โต๊ะ {order.tableNumber}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                {order.status === 'received' && 'ร้านได้รับคำสั่งซื้อแล้ว!'}
                {order.status === 'preparing' && '🍳 กำลังปรุงอาหารในครัว...'}
                {order.status === 'served' && '🎉 เสิร์ฟอาหารเรียบร้อยแล้ว'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                ระบบกำลังติดตามแบบ Real-time ข้อมูลจะอัปเดตอัตโนมัติเมื่อสถานะเปลี่ยน
              </p>
            </div>

            {/* Stepper Steps */}
            <div className="pt-2 pb-4">
              <div className="flex items-center justify-between relative max-w-md mx-auto">
                <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-stone-100 z-0" />
                <div 
                  className="absolute top-1/2 left-6 -translate-y-1/2 h-1 bg-amber-500 transition-all duration-500 z-0"
                  style={{
                    width: order.status === 'received' ? '0%' : order.status === 'preparing' ? '50%' : '100%'
                  }}
                />

                {steps.map((st) => {
                  const state = getStepState(st.id);
                  const Icon = st.icon;
                  return (
                    <div key={st.id} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          state === 'completed'
                            ? 'bg-amber-600 text-white shadow-md'
                            : state === 'current'
                            ? 'bg-amber-500 text-white ring-4 ring-amber-200 animate-pulse'
                            : 'bg-stone-100 text-stone-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs mt-2 font-medium ${
                        state === 'current' ? 'text-amber-800 font-bold' : 'text-stone-600'
                      }`}>
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Status Pill & Action */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isActuallyPaid
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {isActuallyPaid ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <CreditCard className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-800">สถานะการชำระเงิน:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActuallyPaid
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isActuallyPaid ? 'ชำระแล้ว (Paid)' : 'รอชำระเงิน (Pending)'}
                    </span>
                  </div>
                  <span className="text-xs text-stone-500 block">
                    ยอดรวมสุทธิ {formatTHB(order.totalAmount)}
                  </span>
                </div>
              </div>

              {!isActuallyPaid ? (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition active:scale-95 cursor-pointer"
                >
                  ชำระเงินตอนนี้ (QR Code)
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>ชำระเงินเรียบร้อยแล้ว</span>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Order Item Details Breakdown */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-stone-500" />
            <h3 className="font-bold text-stone-800 text-sm">รายการอาหารที่สั่ง ({order.items.length} รายการ)</h3>
          </div>
          <span className="text-xs text-stone-400">
            {new Date(order.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="divide-y divide-stone-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-start justify-between gap-4">
              <div>
                <span className="text-sm font-semibold text-stone-800">
                  {item.quantity}x {item.name}
                </span>
                {item.notes && (
                  <p className="text-xs text-stone-400 mt-0.5">
                    หมายเหตุ: {item.notes}
                  </p>
                )}
              </div>
              <span className="text-sm font-bold text-stone-700">
                {formatTHB(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {order.customerNotes && (
          <div className="p-3 bg-amber-50/60 rounded-xl text-xs text-amber-900 border border-amber-200">
            <strong>หมายเหตุถึงครัว:</strong> {order.customerNotes}
          </div>
        )}

        {/* Order Totals Summary */}
        <div className="pt-3 border-t border-stone-200 space-y-1.5 text-xs text-stone-600">
          <div className="flex justify-between">
            <span>ยอดรวมค่าอาหาร</span>
            <span>{formatTHB(order.subtotalAmount || order.totalAmount)}</span>
          </div>
          {order.vatAmount ? (
            <div className="flex justify-between text-stone-400">
              <span>ภาษีมูลค่าเพิ่ม VAT 7%</span>
              <span>{formatTHB(order.vatAmount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
            <span>ยอดสุทธิ</span>
            <span className="text-lg text-amber-600">{formatTHB(order.totalAmount)}</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onBackToMenu}
            className="w-full py-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <PlusCircle className="w-4 h-4 text-amber-600" />
            <span>สั่งอาหารเพิ่มในโต๊ะนี้</span>
          </button>
        </div>
      </div>

      {/* ฝังหน้าต่าง PaymentModal ไว้ตรงนี้โดยตรง ไม่ต้องผ่าน App.tsx */}
      <PaymentModal
        order={order}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

    </div>
  );
};