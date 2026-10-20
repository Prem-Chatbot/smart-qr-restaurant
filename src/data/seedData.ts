import { MenuItem } from '../types';

export const INITIAL_MENUS: MenuItem[] = [
  // --- อาหารจานหลัก (Main Courses) ---
  {
    id: 'm-01',
    name: 'ข้าวหน้าเนื้อวากิวไข่ดองโชยุ',
    category: 'main',
    price: 249,
    description: 'เนื้อวากิวสไลซ์บางย่างไฟหอมกรุ่น ท็อปด้วยไข่แดงดองซีอิ๊วญี่ปุ่น โรยต้นหอมซอย',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    spicyLevel: 0
  },
  {
    id: 'm-02',
    name: 'สปาเก็ตตี้คาโบนาร่าเบคอนกรอบ',
    category: 'main',
    price: 189,
    description: 'เส้นสปาเก็ตตี้อัลเดนเต้ คลุกเคล้าครีมซอสพาร์เมซานชีสเข้มข้น และเบคอนรมควันทอดกรอบ',
    imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    spicyLevel: 0
  },
  {
    id: 'm-03',
    name: 'สเต๊กแซลมอนย่างเนยซอสเทอริยากิ',
    category: 'main',
    price: 289,
    description: 'แซลมอนนอร์เวย์ชิ้นโต หนังกรอบเนื้อนุ่ม ชุ่มฉ่ำด้วยซอสเทอริยากิ เสิร์ฟพร้อมผักย่างเนยสด',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    spicyLevel: 0
  },
  {
    id: 'm-04',
    name: 'เบอร์เกอร์เนื้อแองกัสทรัฟเฟิลชีส',
    category: 'main',
    price: 279,
    description: 'เนื้อเบอร์เกอร์แองกัสบดหยาบ ชีสเชดด้าเยิ้มๆ และทรัฟเฟิลมาโยหอมละมุน ขนมปังบริออชนุ่มฟู',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    spicyLevel: 0
  },
  {
    id: 'm-05',
    name: 'สปาเก็ตตี้ขี้เมาทะเลเดือด',
    category: 'main',
    price: 219,
    description: 'เส้นเหนียวนุ่มผัดพริกสด กระเทียม ใบกะเพรา พร้อมกุ้งสด ปลาหมึก และหอยแมลงภู่นิวซีแลนด์',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    spicyLevel: 3
  },

  // --- ของทานเล่น / ทอด (Appetizers) ---
  {
    id: 'm-06',
    name: 'ไก่ทอดซอสเกาหลีการ์ลิค',
    category: 'appetizer',
    price: 119,
    description: 'ไก่ทอดกรอบนอกนุ่มใน คลุกเคล้าซอสกระเทียมสูตรเกาหลี หวานเค็มกลมกล่อม โรยงาขาว',
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    spicyLevel: 1
  },
  {
    id: 'm-07',
    name: 'เฟรนช์ฟรายส์ทรัฟเฟิลดิป',
    category: 'appetizer',
    price: 99,
    description: 'มันฝรั่งแท่งทอดสีเหลืองทอง คลุกเคล้าเกลือทะเลและพาร์สลีย์ เสิร์ฟคู่ทรัฟเฟิลมาโยดิป',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-nSwMM0Zkgqogc-gssnXSVi30Y7IoXemy9EaW3r5RhO2X1Em7_yTfypx7&s=10',
    isAvailable: true,
    spicyLevel: 0
  },
  {
    id: 'm-08',
    name: 'ชีสบอลทอดไส้ลาวาเยิ้ม',
    category: 'appetizer',
    price: 99,
    description: 'แป้งกรอบไม่อมน้ำมัน กัดแล้วชีสมอสซาเรลล่าด้านในยืดเยิ้มจุใจ เสิร์ฟร้อนๆ 5 ลูก',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTokbr-xDo_njiZa47TizqS5AUmdxKWuRGAp0Lxim33Kw&s=10',
    isAvailable: true,
    spicyLevel: 0
  },

  // --- ของหวาน (Desserts) ---
  {
    id: 'm-09',
    name: 'ครอฟเฟิลไอศกรีมวานิลลาคาราเมล',
    category: 'dessert',
    price: 69,
    description: 'ครัวซองต์อบในเตาวาฟเฟิลกรอบนอกนุ่มชุ่มเนย ท็อปปิ้งไอศกรีมวานิลลา ราดซอสคาราเมล',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqr0n1kjfR44WztFJ4KPsKAk8Gg0VinYum76eP7pHaDw&s=10',
    isAvailable: true,
    spicyLevel: 0
  },
  {
    id: 'm-10',
    name: 'บิงซูสตรอว์เบอร์รีชีสเค้ก',
    category: 'dessert',
    price: 79,
    description: 'น้ำแข็งไสเกล็ดหิมะรสนมสด สตรอว์เบอร์รีสดชิ้นโต คิวบ์ชีสเค้ก และนมข้นหวานเข้มข้น',
    imageUrl: 'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    spicyLevel: 0
  },

  // --- เครื่องดื่ม (Beverages) ---
  {
    id: 'm-11',
    name: 'มัทฉะลาเต้พรีเมียมญี่ปุ่น',
    category: 'beverage',
    price: 85,
    description: 'ผงมัทฉะเกรดพิธีการชงสด ผสมนมสดแท้ 100% หอมกลิ่นชาเขียว ละมุน ไม่หวานแสบคอ',
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    spicyLevel: 0
  },
  {
    id: 'm-12',
    name: 'ยูซุอเมริกาโน่สปาร์คกลิ้ง',
    category: 'beverage',
    price: 79,
    description: 'กาแฟเอสเพรสโซ่ช็อตเข้มข้น ผสานน้ำส้มยูซุแท้และโซดา ให้ความสดชื่นกระปรี้กระเปร่า',
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    spicyLevel: 0
  }
];