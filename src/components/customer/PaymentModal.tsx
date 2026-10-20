import React, { useState, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  CreditCard, 
  Banknote, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import { Order, PaymentMethod } from '../../types';
import { formatTHB } from '../../utils/pricing';

interface PaymentModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  isOpen,
  onClose,
  onPaymentSuccess
}) => {
  if (!isOpen || !order) return null;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('promptpay_qr');
  const [secondsLeft, setSecondsLeft] = useState<number>(300);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  // เมื่อกดปุ่ม -> ปรับสถานะสำเร็จและปิดหน้าต่าง Popup ทันทีในครั้งเดียว
  const handleSimulatePayment = () => {
    try {
      if (typeof onPaymentSuccess === 'function') {
        onPaymentSuccess();
      }
    } catch (e) {
      console.log('Error triggering payment success:', e);
    }
    // ปิดหน้าต่างทันที ไม่ต้องรอหน้าจอสำเร็จซ้อนอีกรอบ
    onClose();
  };

  const minutes = Math.floor(secondsLeft / 60);
  const remainingSeconds = secondsLeft % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Sandbox Warning Banner */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2.5 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0" />
            <span>โหมดจำลองการชำระเงิน (Sandbox/Demo Mode) • ไม่มีการตัดเงินจริง</span>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full hover:bg-black/20 text-white flex items-center justify-center cursor-pointer"
            aria-label="ปิด"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div>
            <h3 className="font-bold text-lg text-stone-900">ชำระค่าอาหาร</h3>
            <p className="text-xs text-stone-500">
              ออเดอร์ #{order.id.slice(-6).toUpperCase()} โต๊ะ {order.tableNumber}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-stone-400 block">ยอดชำระสุทธิ</span>
            <span className="text-2xl font-black text-amber-600">
              {formatTHB(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('promptpay_qr')}
              className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                paymentMethod === 'promptpay_qr'
                  ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold ring-1 ring-blue-500'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <QrCode className="w-5 h-5 text-blue-600" />
              <span className="text-xs">Thai QR PromptPay</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('credit_card_demo')}
              className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                paymentMethod === 'credit_card_demo'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold ring-1 ring-indigo-500'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <span className="text-xs">บัตรเครดิต (Demo)</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('cash_counter')}
              className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                paymentMethod === 'cash_counter'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-500'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Banknote className="w-5 h-5 text-emerald-600" />
              <span className="text-xs">ชำระเงินสดหน้าร้าน</span>
            </button>
          </div>

          {/* Method Details */}
          {paymentMethod === 'promptpay_qr' && (
            <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-white text-center flex flex-col items-center">
              <div className="p-4 flex flex-col items-center w-full">
                <img
                  src="/assets/aistudio/Image.jpg"
                  alt="QR PromptPay"
                  className="w-72 max-w-full h-auto mx-auto rounded-xl shadow-xs"
                />

                <span className="mt-3 text-base font-bold text-amber-600">
                  ยอดชำระ {formatTHB(order.totalAmount)}
                </span>

                <div className="w-full border-t border-stone-200 mt-3 pt-3 flex items-center justify-between text-xs text-stone-500">
                  <span className="text-left">Accepts all banks<br />รับเงินได้จากทุกธนาคาร</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    หมดอายุใน <strong className="text-stone-700">{timeDisplay}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'credit_card_demo' && (
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>แบบจำลองการชำระผ่านบัตร (PCI-DSS Compliant Demo)</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200 text-xs text-stone-500 space-y-2">
                <div className="p-2 bg-amber-50 rounded border border-amber-200 text-amber-800 text-[11px]">
                  *คำเตือนความปลอดภัย: ระบบ Smart QR Restaurant ใช้ Payment Gateway Tokenization ภายนอก จะไม่มีการเก็บข้อมูลบัตรเครดิตตรงๆ ในเซิร์ฟเวอร์
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>เลขบัตรจำลอง:</span>
                  <span className="font-mono font-medium">•••• •••• •••• 4242</span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>ประเภท:</span>
                  <span>Visa Sandbox Test Card</span>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'cash_counter' && (
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 text-center space-y-2">
              <Banknote className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-stone-800 text-sm">แจ้งชำระเงินสดที่เคาน์เตอร์</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                พนักงานจะมารับชำระเงินที่โต๊ะ หรือสามารถเดินไปชำระที่เคาน์เตอร์แคชเชียร์ได้ทันที
              </p>
            </div>
          )}

          {/* Action: Simulate Payment Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSimulatePayment}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>จำลองการชำระเงินสำเร็จ (Simulate Webhook Trigger)</span>
            </button>
            <p className="text-[11px] text-stone-400 text-center mt-2">
              ปุ่มนี้จะทำการยืนยันยอดเงินและปรับสถานะเป็น "paid" ทันที
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};