import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  ChefHat, 
  CheckCircle2, 
  CreditCard, 
  Clock, 
  DollarSign, 
  UtensilsCrossed,
  ArrowRight,
  Flame,
  QrCode
} from 'lucide-react';
import { Order, MenuItem } from '../../types';
import { formatTHB } from '../../utils/pricing';

interface AdminDashboardProps {
  orders: Order[];
  menus: MenuItem[];
  onNavigate: (view: 'kds' | 'menu-manage' | 'table-manage') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  menus,
  onNavigate
}) => {

  // Metrics calculations
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let paidOrdersCount = 0;
    let pendingOrdersCount = 0;
    let activeKitchenCount = 0;
    let servedCount = 0;

    const itemCounter: { [name: string]: { count: number; revenue: number } } = {};

    for (const ord of orders) {
      if (ord.paymentStatus === 'paid') {
        totalRevenue += ord.totalAmount;
        paidOrdersCount++;
      } else {
        pendingOrdersCount++;
      }

      if (ord.status === 'received' || ord.status === 'preparing') {
        activeKitchenCount++;
      } else if (ord.status === 'served') {
        servedCount++;
      }

      // Track item sales
      if (ord.status !== 'cancelled') {
        for (const it of ord.items) {
          if (!itemCounter[it.name]) {
            itemCounter[it.name] = { count: 0, revenue: 0 };
          }
          itemCounter[it.name].count += it.quantity;
          itemCounter[it.name].revenue += it.price * it.quantity;
        }
      }
    }

    const popularItems = Object.entries(itemCounter)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRevenue,
      totalOrders: orders.length,
      paidOrdersCount,
      pendingOrdersCount,
      activeKitchenCount,
      servedCount,
      popularItems
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Welcome */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
            ภาพรวมร้านอาหารวันนี้
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Dashboard จัดการร้าน & สรุปยอดขาย
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            ข้อมูลอัปเดตแบบ Real-time เชื่อมต่อ Cloud Firestore และระบบชำระเงิน
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('kds')}
            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 flex items-center gap-2 transition"
          >
            <ChefHat className="w-4 h-4" />
            <span>ไปที่หน้า KDS ครัว ({stats.activeKitchenCount})</span>
          </button>
          <button
            onClick={() => onNavigate('menu-manage')}
            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-md transition flex items-center gap-2"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>จัดการเมนู ({menus.length})</span>
          </button>
          <button
            onClick={() => onNavigate('table-manage')}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 flex items-center gap-2 transition"
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code โต๊ะ</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">ยอดขายรวม (ชำระแล้ว)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-stone-900 block tracking-tight">
              {formatTHB(stats.totalRevenue)}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
              จาก {stats.paidOrdersCount} ออเดอร์ที่ชำระสำเร็จ
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">จำนวนออเดอร์ทั้งหมด</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-stone-900 block tracking-tight">
              {stats.totalOrders} <span className="text-sm font-medium text-stone-400">ออเดอร์</span>
            </span>
            <span className="text-[11px] text-stone-400 mt-1 inline-block">
              เสิร์ฟสำเร็จ {stats.servedCount} ออเดอร์
            </span>
          </div>
        </div>

        {/* Active Kitchen Orders */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">ออเดอร์ในครัวขณะนี้</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <ChefHat className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-amber-700 block tracking-tight">
              {stats.activeKitchenCount} <span className="text-sm font-medium text-stone-400">รายการ</span>
            </span>
            <span className="text-[11px] text-amber-700 font-semibold mt-1 inline-block">
              กำลังปรุงและรอเริ่มทำ
            </span>
          </div>
        </div>

        {/* Unpaid / Pending orders */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">รอชำระเงิน</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-stone-900 block tracking-tight">
              {stats.pendingOrdersCount} <span className="text-sm font-medium text-stone-400">ออเดอร์</span>
            </span>
            <span className="text-[11px] text-stone-400 mt-1 inline-block">
              ลูกค้าสั่งทานก่อนจ่าย หรือรอโอน
            </span>
          </div>
        </div>

      </div>

      {/* Grid: Popular items + Recent Orders Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Popular Items Ranking */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-stone-900 text-base">5 เมนูยอดนิยมขายดีที่สุด</h3>
            </div>
            <span className="text-xs text-stone-400">จัดอันดับตามจำนวนจาน</span>
          </div>

          <div className="space-y-3">
            {stats.popularItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400">
                ยังไม่มีข้อมูลการขายในรอบนี้
              </div>
            ) : (
              stats.popularItems.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-stone-50/70 border border-stone-100">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                      idx === 0 ? 'bg-amber-500 text-white' : idx === 1 ? 'bg-stone-300 text-stone-800' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-stone-900">{item.name}</h4>
                      <span className="text-[11px] text-stone-400">ขายแล้ว {item.count} ที่</span>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-amber-700">
                    {formatTHB(item.revenue)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-stone-500" />
              <h3 className="font-bold text-stone-900 text-base">รายการออเดอร์ล่าสุด</h3>
            </div>
            <button
              onClick={() => onNavigate('kds')}
              className="text-xs text-amber-700 font-semibold hover:underline flex items-center gap-1"
            >
              <span>ดูทั้งหมดใน KDS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {orders.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400">
                ยังไม่มีออเดอร์เข้ามา
              </div>
            ) : (
              orders.slice(0, 5).map((ord) => (
                <div key={ord.id} className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">
                        โต๊ะ {ord.tableNumber}
                      </span>
                      <span className="text-xs text-stone-600 font-medium">
                        {ord.items.length} รายการ
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400 mt-1 block">
                      {new Date(ord.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-xs sm:text-sm text-stone-900 block">
                      {formatTHB(ord.totalAmount)}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                      ord.status === 'served'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.status === 'preparing'
                        ? 'bg-blue-100 text-blue-800'
                        : ord.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ord.status === 'received' && 'รับแล้ว'}
                      {ord.status === 'preparing' && 'กำลังทำ'}
                      {ord.status === 'served' && 'เสิร์ฟแล้ว'}
                      {ord.status === 'cancelled' && 'ยกเลิก'}
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
