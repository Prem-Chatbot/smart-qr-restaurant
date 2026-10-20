/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Navbar 
} from './components/common/Navbar';
import { CustomerView } from './components/customer/CustomerView';
import { MenuCustomizationModal } from './components/customer/MenuCustomizationModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { OrderTracker } from './components/customer/OrderTracker';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { KitchenDisplay } from './components/admin/KitchenDisplay';
import { MenuManagement } from './components/admin/MenuManagement';
import { TableManagement } from './components/admin/TableManagement';
import { AdminLogin } from './components/admin/AdminLogin';

import { MenuItem, RestaurantTable, Order, CartItem } from './types';
import { 
  db, 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { seedDatabase } from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  UtensilsCrossed, 
  ChefHat, 
  QrCode, 
  LayoutDashboard, 
  X 
} from 'lucide-react';

function RestaurantApp() {
  const { currentUser, isAdmin } = useAuth();

  // Navigation view: 'customer' | 'admin' | 'kds' | 'menu-manage' | 'table-manage'
  const [currentView, setCurrentView] = useState<'customer' | 'admin' | 'kds' | 'menu-manage' | 'table-manage'>('customer');

  // Customer table context
  const [tableNumber, setTableNumber] = useState<string>('T01');
  const [isTableSelectModalOpen, setIsTableSelectModalOpen] = useState<boolean>(false);

  // Firestore real-time data
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingMenus, setLoadingMenus] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  // Customer Cart & Order flow
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('smart_qr_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  
  // ให้หน้าจอเริ่มต้นเป็นหน้าเมนูหลักเสมอ
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('smart_qr_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Read ?table=T01 URL query parameter upon boot
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    if (tableParam) {
      setTableNumber(tableParam.toUpperCase());
    }
    const orderParam = params.get('orderId');
    if (orderParam) {
      setActiveOrderId(orderParam);
    }
  }, []);

  // Listen to Menus from Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'menus'),
      (snapshot) => {
        const items: MenuItem[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...(doc.data() as any) });
        });
        setMenus(items);
        setLoadingMenus(false);

        // Auto-seed if database is completely empty on first launch
        if (items.length === 0 && !snapshot.metadata.hasPendingWrites) {
          triggerAutoSeed();
        }
      },
      (err) => {
        console.error('Menus listener error:', err);
        setLoadingMenus(false);
        handleFirestoreError(err, OperationType.LIST, 'menus');
      }
    );
    return () => unsub();
  }, []);

  // Listen to Tables from Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'tables'),
      (snapshot) => {
        const tbls: RestaurantTable[] = [];
        snapshot.forEach((doc) => {
          tbls.push({ id: doc.id, ...(doc.data() as any) });
        });
        tbls.sort((a, b) => a.tableNumber.localeCompare(b.tableNumber));
        setTables(tbls);
      },
      (err) => {
        console.error('Tables listener error:', err);
        handleFirestoreError(err, OperationType.LIST, 'tables');
      }
    );
    return () => unsub();
  }, []);

  // Listen to Orders from Firestore
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const ords: Order[] = [];
        snapshot.forEach((doc) => {
          ords.push({ id: doc.id, ...(doc.data() as any) });
        });
        setOrders(ords);
      },
      (err) => {
        console.error('Orders listener error:', err);
        handleFirestoreError(err, OperationType.LIST, 'orders');
      }
    );
    return () => unsub();
  }, []);

  // Auto seed helper
  const triggerAutoSeed = async () => {
    try {
      setIsSeeding(true);
      await seedDatabase(false);
    } catch (e) {
      console.warn('Auto-seed check complete:', e);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleManualSeed = async () => {
    try {
      setIsSeeding(true);
      const res = await seedDatabase(true);
      alert(res.message || 'นำเข้าเมนูตัวอย่างเรียบร้อยแล้ว');
    } catch (err: any) {
      alert('นำเข้าเมนูล้มเหลว: ' + err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  // Cart operations
  const handleAddToCart = (cartItem: CartItem) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.menuItemId === cartItem.menuItemId && it.notes === cartItem.notes && it.spicyLevel === cartItem.spicyLevel
      );
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += cartItem.quantity;
        return copy;
      }
      return [...prev, cartItem];
    });
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((it) => (it.cartItemId === cartItemId ? { ...it, quantity: newQty } : it))
    );
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((it) => it.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    localStorage.removeItem('smart_qr_cart');
  };

  // Order Placement
  const handleOrderPlaced = (order: Order) => {
    setActiveOrderId(order.id);
    localStorage.setItem('smart_qr_active_order', order.id);
  };

  // Select View Guard
  const handleSelectView = (view: 'customer' | 'admin' | 'kds' | 'menu-manage' | 'table-manage') => {
    if (view === 'customer') {
      setActiveOrderId(null);
      localStorage.removeItem('smart_qr_active_order');
    } else if (!currentUser) {
      setIsAdminLoginOpen(true);
      return;
    }
    setCurrentView(view);
  };

  const handleBackToMenu = () => {
    setActiveOrderId(null);
    localStorage.removeItem('smart_qr_active_order');
    setCurrentView('customer');
  };

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onSelectView={handleSelectView}
        tableNumber={tableNumber}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTableSelect={() => setIsTableSelectModalOpen(true)}
      />

      {/* Staff / Admin Sub-Navigation Header */}
      {currentView !== 'customer' && currentUser && (
        <div className="bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 sm:gap-2 py-2.5 overflow-x-auto scrollbar-none text-xs font-semibold">
              <button
                onClick={() => setCurrentView('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                  currentView === 'admin'
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>ภาพรวม Dashboard</span>
              </button>

              <button
                onClick={() => setCurrentView('kds')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                  currentView === 'kds'
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <ChefHat className="w-4 h-4" />
                <span>หน้าจอครัว KDS</span>
              </button>

              <button
                onClick={() => setCurrentView('menu-manage')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                  currentView === 'menu-manage'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>จัดการเมนูอาหาร</span>
              </button>

              <button
                onClick={() => setCurrentView('table-manage')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                  currentView === 'table-manage'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>จัดการโต๊ะ & QR Code</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* Customer Active Order Tracker View */}
        {currentView === 'customer' && activeOrderId ? (
          <OrderTracker
            orderId={activeOrderId}
            onBackToMenu={handleBackToMenu}
          />
        ) : currentView === 'customer' ? (
          /* Customer Food Catalog View */
          <CustomerView
            menus={menus}
            loadingMenus={loadingMenus}
            tableNumber={tableNumber}
            onOpenTableSelect={() => setIsTableSelectModalOpen(true)}
            onSelectItem={(item) => setCustomizingItem(item)}
            cartItems={cartItems}
            onOpenCart={() => setIsCartOpen(true)}
            onSeedDefaults={handleManualSeed}
          />
        ) : currentView === 'admin' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <AdminDashboard
              orders={orders}
              menus={menus}
              onNavigate={(v) => setCurrentView(v)}
            />
          </div>
        ) : currentView === 'kds' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <KitchenDisplay orders={orders} />
          </div>
        ) : currentView === 'menu-manage' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <MenuManagement
              menus={menus}
              onSeedDefaults={handleManualSeed}
              isSeeding={isSeeding}
            />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <TableManagement
              tables={tables}
              onSelectTableForCustomer={(tbl) => {
                setTableNumber(tbl);
                setCurrentView('customer');
                setActiveOrderId(null);
                localStorage.removeItem('smart_qr_active_order');
              }}
            />
          </div>
        )}

      </main>

      {/* Customization Modal */}
      {customizingItem && (
        <MenuCustomizationModal
          item={customizingItem}
          onClose={() => setCustomizingItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        tableNumber={tableNumber}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Table Selector Modal */}
      {isTableSelectModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-base text-stone-900">เลือกหมายเลขโต๊ะของคุณ</h3>
              <button
                onClick={() => setIsTableSelectModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-stone-100 text-stone-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500 mb-4">
              เลือกรหัสโต๊ะที่นั่งอยู่ เพื่อให้ออเดอร์ถูกส่งไปยังโต๊ะที่ถูกต้อง
            </p>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {(tables.length > 0 ? tables.map(t => t.tableNumber) : ['T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07', 'T08']).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTableNumber(t);
                    setIsTableSelectModalOpen(false);
                    setActiveOrderId(null);
                    localStorage.removeItem('smart_qr_active_order');
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    tableNumber === t
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                      : 'bg-stone-100 text-stone-700 hover:bg-amber-50 hover:text-amber-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsTableSelectModalOpen(false)}
              className="w-full py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {isAdminLoginOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <AdminLogin
              onSuccess={() => {
                setIsAdminLoginOpen(false);
                setCurrentView('admin');
              }}
              onCancel={() => setIsAdminLoginOpen(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RestaurantApp />
    </AuthProvider>
  );
}