import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Check, 
  X, 
  Flame, 
  UtensilsCrossed, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { MenuItem, MenuCategory } from '../../types';
import { formatTHB } from '../../utils/pricing';
import { db, doc, setDoc, updateDoc, deleteDoc } from '../../firebase';

interface MenuManagementProps {
  menus: MenuItem[];
  onSeedDefaults: () => void;
  isSeeding: boolean;
}

export const MenuManagement: React.FC<MenuManagementProps> = ({
  menus,
  onSeedDefaults,
  isSeeding
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal state
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<number>(100);
  const [category, setCategory] = useState<'main' | 'appetizer' | 'dessert' | 'beverage' | 'special'>('main');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [spicyLevel, setSpicyLevel] = useState<number>(0);

  const openCreateModal = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setPrice(120);
    setCategory('main');
    setImageUrl('https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=800&q=80');
    setIsAvailable(true);
    setSpicyLevel(0);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price);
    setCategory(item.category);
    setImageUrl(item.imageUrl);
    setIsAvailable(item.isAvailable);
    setSpicyLevel(item.spicyLevel || 0);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleToggleStock = async (item: MenuItem) => {
    try {
      const menuRef = doc(db, 'menus', item.id);
      await updateDoc(menuRef, {
        isAvailable: !item.isAvailable
      });
    } catch (err: any) {
      console.error('Failed to toggle stock:', err);
      alert('ไม่สามารถอัปเดตสถานะพร้อมขายได้: ' + (err.message || ''));
    }
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเมนู "${itemName}" ออกจากระบบ?`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'menus', itemId));
    } catch (err: any) {
      console.error('Failed to delete menu:', err);
      alert('ลบเมนูไม่สำเร็จ: ' + (err.message || ''));
    }
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('กรุณาระบุชื่อเมนู');
      return;
    }
    if (price <= 0) {
      setFormError('ราคาต้องมากกว่า 0 บาท');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      const id = editingItem ? editingItem.id : `menu-${Date.now().toString(36)}`;
      const payload = {
        id,
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        category,
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        isAvailable,
        spicyLevel,
        createdAt: editingItem?.createdAt || new Date().toISOString()
      };

      await setDoc(doc(db, 'menus', id), payload);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save menu:', err);
      setFormError(err.message || 'บันทึกเมนูไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const filtered = menus.filter((item) => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            ระบบจัดการเมนูอาหาร (Menu Management)
          </h2>
          <p className="text-xs text-stone-500">
            เพิ่ม แก้ไข ลบ และเปิด-ปิดสถานะพร้อมขายแบบเรียลไทม์
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSeedDefaults}
            disabled={isSeeding}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            title="นำเข้าเมนูตัวอย่าง 16 รายการ"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{isSeeding ? 'กำลังนำเข้า...' : 'รีเซ็ต/นำเข้าเมนูตัวอย่าง'}</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มเมนูใหม่</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่ออาหาร..."
            className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-stone-200 text-xs outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(['all', 'main', 'appetizer', 'dessert', 'beverage'] as MenuCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat === 'all' && 'ทั้งหมด'}
              {cat === 'main' && 'จานหลัก'}
              {cat === 'appetizer' && 'ของทานเล่น'}
              {cat === 'dessert' && 'ของหวาน'}
              {cat === 'beverage' && 'เครื่องดื่ม'}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Table / Cards */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 text-stone-500 uppercase border-b border-stone-200 font-semibold">
              <tr>
                <th className="py-3 px-4">เมนู</th>
                <th className="py-3 px-4">หมวดหมู่</th>
                <th className="py-3 px-4">ราคา (฿)</th>
                <th className="py-3 px-4">ระดับความเผ็ด</th>
                <th className="py-3 px-4">สถานะพร้อมขาย</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    ไม่พบรายการอาหารในหมวดนี้
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                        <div>
                          <span className="font-bold text-stone-900 text-sm block">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-stone-400 line-clamp-1 max-w-xs">
                            {item.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700">
                        {item.category === 'main' ? 'อาหารจานหลัก' : item.category === 'appetizer' ? 'ของทานเล่น' : item.category === 'dessert' ? 'ของหวาน' : 'เครื่องดื่ม'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-amber-700 text-sm">
                      {formatTHB(item.price)}
                    </td>

                    <td className="py-3 px-4">
                      {item.spicyLevel ? (
                        <span className="flex items-center gap-1 text-orange-600 font-medium">
                          <Flame className="w-3.5 h-3.5" />
                          <span>ระดับ {item.spicyLevel}</span>
                        </span>
                      ) : (
                        <span className="text-stone-300">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStock(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                          item.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        {item.isAvailable ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>พร้อมขาย (In Stock)</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>สินค้าหมด (Out of Stock)</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-amber-700 hover:bg-amber-50 transition"
                          title="แก้ไข"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 transition"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-lg text-stone-900">
                {editingItem ? 'แก้ไขเมนูอาหาร' : 'เพิ่มเมนูอาหารใหม่'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-100 text-stone-500 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveMenu} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  ชื่อเมนูอาหาร *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น ต้มยำกุ้งแม่น้ำ"
                  className="w-full text-xs rounded-xl border border-stone-200 p-2.5 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    ราคา (บาท THB) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full text-xs rounded-xl border border-stone-200 p-2.5 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    หมวดหมู่ *
                  </label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full text-xs rounded-xl border border-stone-200 p-2.5 outline-none focus:border-amber-500 bg-white"
                  >
                    <option value="main">อาหารจานหลัก</option>
                    <option value="appetizer">ของทานเล่น / ของทอด</option>
                    <option value="dessert">ของหวาน</option>
                    <option value="beverage">เครื่องดื่ม</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  รายละเอียด / ส่วนผสม
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="อธิบายรสชาติหรือวัตถุดิบเด่น..."
                  className="w-full text-xs rounded-xl border border-stone-200 p-2.5 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  URL รูปภาพ (Image URL)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs rounded-xl border border-stone-200 p-2.5 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    ระดับความเผ็ด (0-3)
                  </label>
                  <select
                    value={spicyLevel}
                    onChange={(e) => setSpicyLevel(Number(e.target.value))}
                    className="w-full text-xs rounded-xl border border-stone-200 p-2.5 outline-none focus:border-amber-500 bg-white"
                  >
                    <option value={0}>0 - ไม่เผ็ด</option>
                    <option value={1}>1 - เผ็ดน้อย</option>
                    <option value={2}>2 - เผ็ดปานกลาง</option>
                    <option value={3}>3 - เผ็ดมาก</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    สถานะการจำหน่าย
                  </label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAvailable}
                      onChange={(e) => setIsAvailable(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs text-stone-700 font-medium">
                      พร้อมจำหน่าย (In Stock)
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 disabled:opacity-50"
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึกเมนู'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
