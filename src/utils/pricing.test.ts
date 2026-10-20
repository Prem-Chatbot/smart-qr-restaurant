import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateCartTotals, 
  calculateItemSubtotal, 
  formatTHB, 
  canTransitionOrderStatus 
} from './pricing.ts';

test('calculateItemSubtotal calculates product correctly', () => {
  assert.equal(calculateItemSubtotal(120, 2), 240);
  assert.equal(calculateItemSubtotal(89.5, 3), 268.5);
  assert.equal(calculateItemSubtotal(-10, 2), 0);
  assert.equal(calculateItemSubtotal(10, 0), 0);
});

test('calculateCartTotals calculates subtotal, vat and items count correctly', () => {
  const items = [
    { price: 150, quantity: 2 }, // 300
    { price: 60, quantity: 1 },  // 60
    { price: 45, quantity: 3 },  // 135
  ];

  const summary = calculateCartTotals(items, { vatRate: 0.07, serviceChargeRate: 0.10 });
  assert.equal(summary.itemCount, 6);
  assert.equal(summary.subtotal, 495);
  // service charge 10% of 495 = 49.5
  assert.equal(summary.serviceCharge, 49.5);
  // taxable = 495 + 49.5 = 544.5 * 0.07 = 38.12
  assert.equal(summary.vatAmount, 38.12);
  // total = 495 + 49.5 + 38.12 = 582.62
  assert.equal(summary.total, 582.62);
});

test('calculateCartTotals handles empty cart cleanly', () => {
  const summary = calculateCartTotals([]);
  assert.equal(summary.itemCount, 0);
  assert.equal(summary.subtotal, 0);
  assert.equal(summary.total, 0);
});

test('formatTHB formats currency in Thai Baht', () => {
  const formatted = formatTHB(250);
  assert.match(formatted, /250/);
});

test('canTransitionOrderStatus enforces proper kitchen progression', () => {
  assert.equal(canTransitionOrderStatus('received', 'preparing'), true);
  assert.equal(canTransitionOrderStatus('preparing', 'served'), true);
  assert.equal(canTransitionOrderStatus('received', 'cancelled'), true);
  assert.equal(canTransitionOrderStatus('preparing', 'cancelled'), true);
  assert.equal(canTransitionOrderStatus('served', 'received'), false);
  assert.equal(canTransitionOrderStatus('cancelled', 'preparing'), false);
});
