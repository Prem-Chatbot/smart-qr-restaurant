/**
 * Thai QR Payment (PromptPay) payload builder — EMVCo format.
 *
 * Receiver info taken from the shop's "make by KBank" Thai QR:
 *   00020101021129390016A000000677010111031500466600218263653037645802TH63045CD2
 *   → PromptPay e-Wallet ID (tag 29/03) = 004666002182636
 */
export const PROMPTPAY_RECEIVER = {
  ewalletId: '004666002182636',
  accountName: 'นาย ภูวนนท์ ผินประดับ',
  maskedAccount: 'xxx-x-x6486-x',
  provider: 'make by KBank',
};

const PROMPTPAY_AID = 'A000000677010111';

function tlv(tag: string, value: string): string {
  return tag + value.length.toString().padStart(2, '0') + value;
}

/** CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF) as required by EMVCo */
export function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Build a PromptPay payload. When `amount` is given the QR becomes
 * a dynamic (one-time) QR with the amount pre-filled in the bank app.
 */
export function buildPromptPayPayload(
  amount?: number,
  ewalletId: string = PROMPTPAY_RECEIVER.ewalletId
): string {
  const hasAmount = typeof amount === 'number' && amount > 0;
  let payload =
    tlv('00', '01') +
    tlv('01', hasAmount ? '12' : '11') +
    tlv('29', tlv('00', PROMPTPAY_AID) + tlv('03', ewalletId)) +
    tlv('53', '764') +
    (hasAmount ? tlv('54', amount!.toFixed(2)) : '') +
    tlv('58', 'TH');
  payload += '6304';
  return payload + crc16(payload);
}
