import { WebhookPaymentPayload } from '../types';

export interface CheckoutSessionResponse {
  success: boolean;
  orderId: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  mockSignature: string;
  expiresInSeconds: number;
  sandboxNotice: string;
  promptpayPayload: string;
  receiver?: {
    accountName: string;
    maskedAccount: string;
    reference: string;
    provider: string;
  };
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/health');
    return res.ok;
  } catch {
    return false;
  }
}

export async function seedDatabase(force: boolean = false): Promise<{ success: boolean; message: string; seededMenus: number; seededTables: number }> {
  const res = await fetch('/api/seed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ force })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to seed database');
  }
  return res.json();
}

export async function createCheckoutSession(
  orderId: string,
  amount: number,
  paymentMethod: string = 'promptpay_qr'
): Promise<CheckoutSessionResponse> {
  const res = await fetch('/api/payment/checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, amount, paymentMethod })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create checkout session');
  }
  return res.json();
}

/**
 * Triggers the simulated provider payment webhook on backend
 * This securely notifies the backend server that payment was completed,
 * allowing the backend to verify the signature and change order status to 'paid'.
 */
export async function triggerPaymentWebhook(payload: WebhookPaymentPayload): Promise<{ success: boolean; newPaymentStatus: string }> {
  const res = await fetch('/api/webhooks/payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Webhook delivery failed');
  }
  return res.json();
}
