export type MenuCategory = 'all' | 'main' | 'appetizer' | 'dessert' | 'beverage' | 'special';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number; // in THB
  category: 'main' | 'appetizer' | 'dessert' | 'beverage' | 'special';
  imageUrl: string;
  isAvailable: boolean;
  preparationTimeMinutes?: number;
  spicyLevel?: number; // 0 = not spicy, 1 = mild, 2 = medium, 3 = very spicy
  createdAt?: string;
}

export interface CartItem {
  cartItemId: string; // unique item instance ID in cart
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  notes?: string; // e.g., 'เผ็ดน้อย', 'ไม่ใส่ผัก'
  spicyLevel?: number;
}

export type OrderStatus = 'received' | 'preparing' | 'served' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'promptpay_qr' | 'credit_card_demo' | 'cash_counter';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  subtotal: number;
}

export interface Order {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  totalAmount: number;
  subtotalAmount: number;
  serviceCharge?: number;
  vatAmount?: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentTxnId?: string;
  customerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantTable {
  id: string;
  tableNumber: string;
  status: 'available' | 'occupied' | 'reserved';
  capacity: number;
  currentOrderId?: string;
}

export interface WebhookPaymentPayload {
  orderId: string;
  eventType: 'payment.succeeded' | 'payment.failed';
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  signature?: string;
}
