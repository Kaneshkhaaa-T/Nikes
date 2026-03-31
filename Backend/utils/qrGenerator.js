// utils/qrGenerator.js
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

/**
 * Generates a secret code and a QR code image (base64)
 * The QR encodes: { orderId, secretCode }
 */
const generateOrderQR = async (orderId) => {
  const secretCode = uuidv4(); // unique, unguessable secret

  const payload = JSON.stringify({
    orderId: orderId.toString(),
    secretCode,
  });

  // Generate QR as base64 PNG (for storing / printing)
  const qrCodeImage = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'H',
    width: 300,
    margin: 2,
  });

  return { secretCode, qrCodeImage };
};

module.exports = { generateOrderQR };