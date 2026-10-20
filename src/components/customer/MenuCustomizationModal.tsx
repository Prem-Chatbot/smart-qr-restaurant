import React, { useState } from 'react';
import { X, Flame, Minus, Plus, Utensils, AlertCircle } from 'lucide-react';
import { MenuItem, CartItem } from '../../types';
import { formatTHB } from '../../utils/pricing';

interface MenuCustomizationModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

const SPICE_LEVELS = [
  { level: 0, label: 'ไม่เผ็ดเลย' },
  { level: 1, label: 'เผ็ดน้อย' },
  { level: 2, label: 'เผ็ดปานกลาง (ปกติ)' },
  { level: 3, label: 'เผ็ดมาก (สะใจ)' },
];

const QUICK_NOTES = ['ไม่ใส่ผัก', 'ไม่ใส่ชูรส', 'หวานน้อย', 'ขอถ้วยแบ่ง', 'แยกพริกน้ำปลา'];

export const MenuCustomizationModal: React.FC<MenuCustomizationModalProps> = ({
  item,
  onClose,
  onAddToCart
}) => {
  if (!item) return null;

  const [quantity, setQuantity] = useState<number>(1);
  const [spicyLevel, setSpicyLevel] = useState<number>(item.spicyLevel ?? 1);
  const [notes, setNotes] = useState<string>('');

  const handleAddQuickNote = (quickNote: string) => {
    if (notes.includes(quickNote)) {
      setNotes(notes.replace(quickNote, '').trim());
    } else {
      setNotes(notes ? `${notes}, ${quickNote}` : quickNote);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.isAvailable) return;

    const cartItem: CartItem = {
      cartItemId: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      imageUrl: item.imageUrl,
      notes: notes.trim(),
      spicyLevel: item.category === 'beverage' || item.category === 'dessert' ? 0 : spicyLevel
    };

    onAddToCart(cartItem);
    onClose();
  };

  const totalPrice = item.price * quantity;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-100 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-600 flex items-center justify-center shadow-md transition"
          aria-label="ปิดหน้าต่าง"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Item Image */}
        <div className="relative h-56 sm:h-64 w-full bg-stone-100 overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-5">
            <div className="text-white">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/90 text-white mb-1.5 uppercase">
                {item.category === 'main' ? 'อาหารจานหลัก' : item.category === 'appetizer' ? 'ของทานเล่น' : item.category === 'dessert' ? 'ของหวาน' : 'เครื่องดื่ม'}
              </span>
              <h3 id="modal-headline" className="text-xl sm:text-2xl font-bold leading-tight">
                {item.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Content & Options */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Description & Price */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100">
            <p className="text-stone-600 text-sm leading-relaxed">
              {item.description}
            </p>
            <div className="text-right shrink-0">
              <span className="text-2xl font-bold text-amber-600">
                {formatTHB(item.price)}
              </span>
              <span className="block text-[11px] text-stone-400">ต่อที่</span>
            </div>
          </div>

          {/* Spicy Level (for savory items) */}
          {item.category !== 'beverage' && item.category !== 'dessert' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>ระดับความเผ็ด (Spicy Level)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SPICE_LEVELS.map((spice) => (
                  <button
                    key={spice.level}
                    type="button"
                    onClick={() => setSpicyLevel(spice.level)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition ${
                      spicyLevel === spice.level
                        ? 'bg-orange-50 border-orange-500 text-orange-800 ring-2 ring-orange-400/30 font-semibold'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {spice.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Notes / Instructions */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              หมายเหตุเพิ่มเติมต่อจาน
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {QUICK_NOTES.map((qn) => (
                <button
                  key={qn}
                  type="button"
                  onClick={() => handleAddQuickNote(qn)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition ${
                    notes.includes(qn)
                      ? 'bg-amber-100 text-amber-800 border border-amber-300 font-medium'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  + {qn}
                </button>
              ))}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น ไม่ใส่ถั่วงอก, ขอแยกน้ำซุป, ไม่หวาน..."
              rows={2}
              maxLength={200}
              className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 outline-none resize-none"
            />
          </div>

          {/* Quantity and Submit Bar */}
          <div className="pt-2 flex items-center justify-between gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition active:scale-95"
                aria-label="ลดจำนวน"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-bold text-stone-900 text-base">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition active:scale-95"
                aria-label="เพิ่มจำนวน"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              type="submit"
              disabled={!item.isAvailable}
              className={`flex-1 flex items-center justify-between px-5 py-3 rounded-xl font-medium shadow-md transition ${
                item.isAvailable
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/25 active:scale-[0.99]'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <span>{item.isAvailable ? 'ใส่ตะกร้า' : 'สินค้าหมด'}</span>
              <span className="font-bold text-lg">
                {formatTHB(totalPrice)}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
