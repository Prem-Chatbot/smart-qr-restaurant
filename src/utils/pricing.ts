export interface PriceSummary {
  subtotal: number;
  serviceCharge: number;
  vatAmount: number;
  total: number;
  itemCount: number;
}

export interface PricingOptions {
  serviceChargeRate?: number; // e.g. 0.00 or 0.10
  vatRate?: number; // e.g. 0.00 or 0.07
}

/**
 * Calculates line subtotal safely
 */
export function calculateItemSubtotal(price: number, quantity: number): number {
  if (price < 0 || quantity <= 0) return 0;
  return Math.round(price * quantity * 100) / 100;
}

/**
 * Calculates cart totals including item counts, subtotal, VAT and final total in THB
 */
export function calculateCartTotals(
  items: Array<{ price: number; quantity: number }>,
  options: PricingOptions = {}
): PriceSummary {
  const { serviceChargeRate = 0, vatRate = 0 } = options;

  let subtotal = 0;
  let itemCount = 0;

  for (const item of items) {
    if (item.quantity > 0 && item.price >= 0) {
      subtotal += calculateItemSubtotal(item.price, item.quantity);
      itemCount += item.quantity;
    }
  }

  const serviceCharge = Math.round(subtotal * serviceChargeRate * 100) / 100;
  const taxableBase = subtotal + serviceCharge;
  const vatAmount = Math.round(taxableBase * vatRate * 100) / 100;
  const total = Math.round((subtotal + serviceCharge + vatAmount) * 100) / 100;

  return {
    subtotal,
    serviceCharge,
    vatAmount,
    total,
    itemCount
  };
}

/**
 * Formats amount into Thai Baht string e.g. ฿150 or ฿150.00
 */
export function formatTHB(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Order status transition logic for Kitchen Display System (KDS)
 */
export const ORDER_FLOW = ['received', 'preparing', 'served'] as const;

export function canTransitionOrderStatus(
  current: 'received' | 'preparing' | 'served' | 'cancelled',
  next: 'received' | 'preparing' | 'served' | 'cancelled'
): boolean {
  if (current === next) return true;
  if (current === 'cancelled') return false; // terminal
  if (current === 'served' && next !== 'cancelled') return false; // terminal fulfilled
  if (next === 'cancelled') return true; // can cancel if not already served

  if (current === 'received' && next === 'preparing') return true;
  if (current === 'preparing' && next === 'served') return true;

  return false;
}
