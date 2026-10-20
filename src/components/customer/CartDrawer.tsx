import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, UtensilsCrossed, AlertCircle, Sparkles } from 'lucide-react';
import { CartItem, Order } from '../../types';
import { calculateCartTotals, formatTHB } from '../../utils/pricing';
import { db, collection, addDoc } from '../../firebase';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  tableNumber: string;
  onOrderPlaced: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  tableNumber,
  onOrderPlaced
}) => {
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const { subtotal, serviceCharge, vatAmount, total, itemCount } = calculateCartTotals(items, {
    vatRate: 0.07, // 7% VAT
    serviceChargeRate: 0.00 // 0% Service Charge
  });

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    if (!tableNumber) {
      setSubmitError('กรุณาระบุเลขโต๊ะก่อนสั่งอาหาร');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const orderData = {
        tableNumber,
        items: items.map((it) => ({
          menuItemId: it.menuItemId,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          notes: it.notes || '',
          subtotal: it.price * it.quantity
        })),
        subtotalAmount: subtotal,
        serviceCharge,
        vatAmount,
        totalAmount: total,
        status: 'received' as const,
        paymentStatus: 'pending' as const,
        customerNotes: customerNotes.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add order to Firestore orders collection
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      const createdOrder: Order = {
        id: docRef.id,
        ...orderData
      };

      onClearCart();
      onOrderPlaced(createdOrder);
      onClose();
    } catch (err: any) {
      console.error('Error placing order:', err);
      setSubmitError(err.message || 'เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ โปรดลองอีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-lg">ตะกร้าของคุณ</h2>
              <p className="text-xs text-stone-500">
                โต๊ะ {tableNumber || '-'} • ทั้งหมด {itemCount} รายการ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-200 text-stone-500 flex items-center justify-center transition"
            aria-label="ปิดตะกร้า"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {submitError && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                <UtensilsCrossed className="w-8 h-8 text-stone-300" />
              </div>
              <p className="font-medium text-stone-700 mb-1">ยังไม่มีอาหารในตะกร้า</p>
              <p className="text-xs text-stone-400 max-w-xs mb-4">
                เลือกเมนูอาหารจานโปรดและกด "ใส่ตะกร้า" เพื่อเริ่มสั่งอาหาร
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition"
              >
                ดูเมนูอาหาร
              </button>
            </div>
          ) : (
            items.map((it) => (
              <div
                key={it.cartItemId}
                className="flex items-start gap-3 p-3 bg-stone-50/70 rounded-xl border border-stone-100 relative group"
              >
                {/* Photo thumbnail */}
                {it.imageUrl && (
                  <img
                    src={it.imageUrl}
                    alt={it.name}
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                  />
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-semibold text-sm text-stone-900 truncate">
                      {it.name}
                    </h4>
                    <button
                      onClick={() => onRemoveItem(it.cartItemId)}
                      className="text-stone-400 hover:text-red-500 p-0.5 transition"
                      title="ลบรายการ"
                      aria-label={`ลบรายการ ${it.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Notes / Customization */}
                  {(it.notes || (it.spicyLevel !== undefined && it.spicyLevel > 0)) && (
                    <div className="text-[11px] text-amber-800 bg-amber-50/60 rounded px-1.5 py-0.5 inline-block mt-0.5">
                      {it.spicyLevel ? `เผ็ดระดับ ${it.spicyLevel}` : ''}
                      {it.spicyLevel && it.notes ? ' • ' : ''}
                      {it.notes}
                    </div>
                  )}

                  {/* Price and Counter */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-amber-700 text-sm">
                      {formatTHB(it.price * it.quantity)}
                    </span>

                    <div className="flex items-center border border-stone-200 bg-white rounded-lg">
                      <button
                        onClick={() => onUpdateQuantity(it.cartItemId, it.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-stone-500 hover:bg-stone-100 rounded-l transition"
                        aria-label="ลดจำนวน"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-semibold">
                        {it.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(it.cartItemId, it.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-stone-500 hover:bg-stone-100 rounded-r transition"
                        aria-label="เพิ่มจำนวน"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Notes & Totals */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50/50 space-y-3.5">
            {/* Table Level Instruction */}
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                หมายเหตุรวมถึงครัว (Optional)
              </label>
              <input
                type="text"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="เช่น เสิร์ฟพร้อมกัน, ขอช้อนส้อมเพิ่ม..."
                className="w-full text-xs bg-white rounded-lg border border-stone-200 px-3 py-2 outline-none focus:border-amber-500"
              />
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-200">
              <div className="flex justify-between">
                <span>ยอดรวมค่าอาหาร</span>
                <span className="font-medium text-stone-900">{formatTHB(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>ภาษีมูลค่าเพิ่ม VAT 7% (รวมแล้ว)</span>
                <span>{formatTHB(vatAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 pt-1.5 border-t border-dashed border-stone-200">
                <span>ยอดสุทธิทั้งหมด</span>
                <span className="text-xl text-amber-600 font-extrabold">{formatTHB(total)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังส่งคำสั่งซื้อไปยังครัว...</span>
                </div>
              ) : (
                <>
                  <span>ยืนยันการสั่งอาหาร (โต๊ะ {tableNumber})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
