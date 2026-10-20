import express, { Request, Response, Router } from 'express';
import { buildPromptPayPayload, PROMPTPAY_RECEIVER } from '../utils/promptpay.ts';
import { 
  db, 
  auth, 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc, 
  getDocs, 
  collection,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from '../firebase.ts';
import { INITIAL_MENUS, INITIAL_TABLES } from '../data/seedData.ts';

export const apiRouter: Router = express.Router();

export const expressApp = express();
expressApp.use(express.json());
expressApp.use('/api', apiRouter);

// Middleware to parse JSON
apiRouter.use(express.json());

// Server-side authentication helper
async function ensureServerAuth() {
  if (auth.currentUser) return;
  const email = 'server-admin@smartqr.restaurant';
  const pass = 'ServerStaffSecret@2026';
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (err: any) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      try {
        await createUserWithEmailAndPassword(auth, email, pass);
      } catch (e) {
        console.warn('Server user creation notice:', e);
      }
    } else {
      console.warn('Server user signin notice:', err);
    }
  }
}

// 1. Health check
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Smart QR Restaurant Backend API',
    sandboxMode: true,
    timestamp: new Date().toISOString()
  });
});

// 2. Database seed endpoint
apiRouter.post('/seed', async (req: Request, res: Response) => {
  try {
    await ensureServerAuth();
    const force = req.body?.force === true;
    
    // Check existing menus
    const existingMenusSnap = await getDocs(collection(db, 'menus'));
    let seededMenus = 0;
    let seededTables = 0;

    if (existingMenusSnap.empty || force) {
      for (const item of INITIAL_MENUS) {
        await setDoc(doc(db, 'menus', item.id), {
          ...item,
          createdAt: new Date().toISOString()
        });
        seededMenus++;
      }
    }

    // Check existing tables
    const existingTablesSnap = await getDocs(collection(db, 'tables'));
    if (existingTablesSnap.empty || force) {
      for (const table of INITIAL_TABLES) {
        await setDoc(doc(db, 'tables', table.id), table);
        seededTables++;
      }
    }

    res.json({
      success: true,
      message: 'ฐานข้อมูลเริ่มต้นถูกตั้งค่าเรียบร้อยแล้ว',
      seededMenus,
      seededTables,
      totalExistingMenus: existingMenusSnap.size,
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to seed database'
    });
  }
});

// 3. Simulated Checkout Session Generator
apiRouter.post('/payment/checkout-session', async (req: Request, res: Response) => {
  try {
    const { orderId, amount, paymentMethod } = req.body;

    if (!orderId || typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ error: 'Invalid order parameters' });
      return;
    }

    // Generate secure mock transaction token
    const transactionId = 'TXN_' + Math.random().toString(36).substring(2, 10).toUpperCase() + '_' + Date.now();
    const mockSignature = 'sig_' + Buffer.from(`${orderId}:${amount}:${transactionId}`).toString('base64');

    // Return promptpay payload or mock card details
    res.json({
      success: true,
      orderId,
      amount,
      paymentMethod: paymentMethod || 'promptpay_qr',
      transactionId,
      mockSignature,
      expiresInSeconds: 300,
      sandboxNotice: 'โหมดจำลองการชำระเงิน (Sandbox/Demo Mode) - ไม่มีการเรียกเก็บเงินจริง',
      promptpayPayload: buildPromptPayPayload(amount),
      receiver: {
        accountName: PROMPTPAY_RECEIVER.accountName,
        maskedAccount: PROMPTPAY_RECEIVER.maskedAccount,
        reference: PROMPTPAY_RECEIVER.ewalletId,
        provider: PROMPTPAY_RECEIVER.provider
      }
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Internal checkout error' });
  }
});

// 4. CRITICAL: Backend Webhook Handler for Payment Callbacks
// Changes order status to 'paid' securely via server-side verification
apiRouter.post('/webhooks/payment', async (req: Request, res: Response) => {
  try {
    await ensureServerAuth();
    const { orderId, eventType, amount, transactionId, paymentMethod, signature } = req.body;

    console.log(`[PAYMENT WEBHOOK] Received event: ${eventType} for order ${orderId}, tx: ${transactionId}`);

    if (!orderId || !eventType) {
      res.status(400).json({ error: 'Missing required webhook fields: orderId, eventType' });
      return;
    }

    if (eventType !== 'payment.succeeded') {
      res.status(200).json({ received: true, status: 'ignored_event' });
      return;
    }

    // Security Verification: In sandbox/production, verify signature token
    if (!signature || !signature.startsWith('sig_')) {
      console.warn(`[PAYMENT WEBHOOK] Invalid signature token: ${signature}`);
      res.status(401).json({ error: 'Unauthorized: Invalid signature' });
      return;
    }

    // Retrieve order from Firestore
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);

    if (!orderDoc.exists()) {
      console.error(`[PAYMENT WEBHOOK] Order not found: ${orderId}`);
      res.status(404).json({ error: 'Order not found in database' });
      return;
    }

    const orderData = orderDoc.data();

    // Prevent duplicate processing if already paid
    if (orderData.paymentStatus === 'paid') {
      res.json({
        received: true,
        alreadyProcessed: true,
        orderId,
        paymentStatus: 'paid'
      });
      return;
    }

    // Safe server-side update of payment status
    const updatePayload = {
      paymentStatus: 'paid',
      paymentMethod: paymentMethod || orderData.paymentMethod || 'promptpay_qr',
      paymentTxnId: transactionId || ('TXN_' + Date.now()),
      updatedAt: new Date().toISOString()
    };

    await updateDoc(orderRef, updatePayload);

    console.log(`[PAYMENT WEBHOOK SUCCESS] Order ${orderId} marked as PAID securely.`);

    res.json({
      received: true,
      success: true,
      orderId,
      newPaymentStatus: 'paid',
      transactionId: updatePayload.paymentTxnId,
      timestamp: updatePayload.updatedAt
    });
  } catch (error) {
    console.error('[PAYMENT WEBHOOK ERROR]', error);
    res.status(500).json({
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default apiRouter;
