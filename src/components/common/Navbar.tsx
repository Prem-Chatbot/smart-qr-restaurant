import React from 'react';
import { UtensilsCrossed, ShoppingBag, ShieldCheck, QrCode, LogOut, User, ChefHat } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentView: 'customer' | 'admin' | 'kds' | 'menu-manage' | 'table-manage';
  onSelectView: (view: 'customer' | 'admin' | 'kds' | 'menu-manage' | 'table-manage') => void;
  tableNumber: string;
  cartCount: number;
  onOpenCart: () => void;
  onOpenTableSelect: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  tableNumber,
  cartCount,
  onOpenCart,
  onOpenTableSelect
}) => {
  const { currentUser, logout, isAdmin } = useAuth();

  const isStaffArea = currentView !== 'customer';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectView('customer')}
              className="flex items-center gap-2.5 text-left group transition"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg sm:text-xl text-stone-900 tracking-tight block leading-tight">
                  Smart QR <span className="text-amber-600">Restaurant</span>
                </span>
                <span className="text-xs text-stone-500 hidden sm:inline-block">
                  สั่งอาหารสะดวกผ่าน QR Code เรียลไทม์
                </span>
              </div>
            </button>

            {/* Current Table Indicator (Customer View) */}
            {tableNumber && (
              <button
                onClick={onOpenTableSelect}
                className="ml-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium hover:bg-amber-100 transition"
                title="คลิกเพื่อเปลี่ยนโต๊ะ"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-600" />
                <span>โต๊ะ {tableNumber}</span>
                <span className="text-[10px] text-amber-600 underline ml-0.5">เปลี่ยน</span>
              </button>
            )}
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* View Switcher: Customer vs Staff / KDS */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => onSelectView('customer')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all ${
                  currentView === 'customer'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>เมนู<span className="hidden sm:inline">สั่งอาหาร</span></span>
              </button>

              <button
                onClick={() => onSelectView('admin')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all ${
                  isStaffArea
                    ? 'bg-amber-600 text-white shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ระบบร้านอาหาร</span>
                <span className="sm:hidden">หลังร้าน</span>
              </button>
            </div>

            {/* Cart Button (Visible on customer view) */}
            {currentView === 'customer' && (
              <button
                onClick={onOpenCart}
                className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25 active:scale-95 transition"
                aria-label="เปิดตะกร้าสินค้า"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center animate-pulse">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Admin User Status */}
            {isStaffArea && currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-medium text-stone-800 leading-tight truncate max-w-[120px]">
                    {currentUser.email?.split('@')[0] || 'เจ้าหน้าที่'}
                  </span>
                  <span className="text-[10px] text-amber-600 font-medium">ผู้ดูแลระบบ</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 transition"
                  title="ออกจากระบบ"
                  aria-label="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
