import React, { useState, useMemo } from 'react';
import { 
  Search, 
  UtensilsCrossed, 
  Flame, 
  Clock, 
  Plus, 
  ShoppingBag, 
  Sparkles,
  QrCode,
  AlertCircle
} from 'lucide-react';
import { MenuItem, MenuCategory, CartItem } from '../../types';
import { formatTHB } from '../../utils/pricing';

interface CustomerViewProps {
  menus: MenuItem[];
  loadingMenus: boolean;
  tableNumber: string;
  onOpenTableSelect: () => void;
  onSelectItem: (item: MenuItem) => void;
  cartItems: CartItem[];
  onOpenCart: () => void;
  onSeedDefaults: () => void;
}

const CATEGORIES: { id: MenuCategory; label: string }[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'main', label: 'อาหารจานหลัก' },
  { id: 'appetizer', label: 'ของทานเล่น / ทอด' },
  { id: 'dessert', label: 'ของหวาน' },
  { id: 'beverage', label: 'เครื่องดื่ม' },
];

export const CustomerView: React.FC<CustomerViewProps> = ({
  menus,
  loadingMenus,
  tableNumber,
  onOpenTableSelect,
  onSelectItem,
  cartItems,
  onOpenCart,
  onSeedDefaults
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter menus based on category and query
  const filteredMenus = useMemo(() => {
    return menus.filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchQuery =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [menus, selectedCategory, searchQuery]);

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24">
      
      {/* Table Welcome Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/20 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-stone-950 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5" />
                <span>โต๊ะ {tableNumber}</span>
              </span>
              <span className="text-xs text-amber-300 font-medium">ระบบเปิดรับออเดอร์ปกติ</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              ยินดีต้อนรับสู่ Smart QR Restaurant
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-xl">
              เลือกเมนูอาหารจานโปรด สั่งตรงถึงห้องครัวได้ทันทีผ่านระบบอัตโนมัติ ไม่ต้องรอเรียกพนักงาน
            </p>
          </div>

          <button
            onClick={onOpenTableSelect}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-medium backdrop-blur-xs transition"
          >
            เปลี่ยนเลขโต๊ะ
          </button>
        </div>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="space-y-4 mb-6">
        
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่ออาหาร ส่วนผสม หรือเครื่องดื่ม..."
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-stone-200 text-xs sm:text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none shadow-xs transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
            >
              ล้าง
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20 font-semibold scale-[1.02]'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menus List State */}
      {loadingMenus ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-stone-200 animate-pulse space-y-3">
              <div className="h-44 bg-stone-200 rounded-xl" />
              <div className="h-4 bg-stone-200 rounded w-3/4" />
              <div className="h-3 bg-stone-200 rounded w-full" />
              <div className="h-6 bg-stone-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredMenus.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-stone-200 max-w-md mx-auto my-8">
          <UtensilsCrossed className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-bold text-stone-800 text-base mb-1">
            {menus.length === 0 ? 'ยังไม่มีรายการอาหารในระบบ' : 'ไม่พบเมนูที่ค้นหา'}
          </h3>
          <p className="text-xs text-stone-400 mb-5">
            {menus.length === 0
              ? 'ต้องการนำเข้าเมนูตัวอย่างอาหารไทยเพื่อเริ่มใช้งานทันทีหรือไม่?'
              : 'ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่อื่น'}
          </p>
          {menus.length === 0 && (
            <button
              onClick={onSeedDefaults}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md shadow-amber-600/20 flex items-center gap-1.5 mx-auto transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>นำเข้า 16 เมนูยอดนิยมทันที</span>
            </button>
          )}
        </div>
      ) : (
        /* Menu Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredMenus.map((item) => (
            <div
              key={item.id}
              onClick={() => item.isAvailable && onSelectItem(item)}
              className={`group bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col ${
                item.isAvailable ? 'cursor-pointer' : 'opacity-65 cursor-not-allowed'
              }`}
            >
              {/* Dish Photo */}
              <div className="relative h-44 sm:h-48 w-full bg-stone-100 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Spicy Badge */}
                {item.spicyLevel !== undefined && item.spicyLevel > 0 && (
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-orange-400 text-[10px] font-semibold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                    <span>เผ็ดระดับ {item.spicyLevel}</span>
                  </span>
                )}

                {/* Out of stock overlay */}
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-2xs flex items-center justify-center">
                    <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold shadow-md">
                      สินค้าหมดชั่วคราว
                    </span>
                  </div>
                )}
              </div>

              {/* Item Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-base leading-snug group-hover:text-amber-700 transition line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-stone-500 text-xs mt-1 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Price and Add button */}
                <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-extrabold text-amber-700">
                      {formatTHB(item.price)}
                    </span>
                  </div>

                  <button
                    disabled={!item.isAvailable}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.isAvailable) onSelectItem(item);
                    }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs transition active:scale-90 ${
                      item.isAvailable
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white'
                        : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    }`}
                    aria-label={`เพิ่ม ${item.name}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Cart Bar (Customer Mobile / Sticky CTA) */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-30">
          <button
            onClick={onOpenCart}
            className="w-full py-3.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white shadow-xl shadow-amber-600/30 flex items-center justify-between font-bold text-sm transition-all duration-150 active:scale-[0.99] border border-amber-500"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-800 text-white text-xs flex items-center justify-center font-bold">
                {totalCartCount}
              </div>
              <span>เปิดตะกร้าสั่งอาหาร</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">{formatTHB(totalCartPrice)}</span>
              <ShoppingBag className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

    </div>
  );
};
