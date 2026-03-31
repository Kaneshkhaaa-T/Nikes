import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ScanReturnPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanInput, setScanInput] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef(null);

  // ── Fix 1: keep scanner reference so we can stop it cleanly ──
  const stopCamera = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch (e) {}
      scannerRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    const { Html5Qrcode } = await import('html5-qrcode');
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;
    setCameraActive(true);

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (decodedText) => {
        await stopCamera();
        verifyQR(decodedText);
      },
      () => {}
    );
  };

  // Cleanup on page leave
  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  const verifyQR = async (payload) => {
    setLoading(true);
    setScanResult(null);
    try {
      // ── Fix 2: correct backend URL + correct token key ──
      const token = localStorage.getItem('userToken');   // ← check this key below
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/verify-return`,
        { scannedPayload: payload },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setScanResult(data);
    } catch (err) {
      setScanResult({
        success: false,
        message: err.response?.data?.message || 'Verification failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Scan Return QR</h1>

      {/* Camera area */}
      <div id="qr-reader" className="w-full rounded-lg overflow-hidden mb-4" />

      {!cameraActive ? (
        <button
          onClick={startCamera}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium mb-4 hover:bg-blue-700"
        >
          Open Camera & Scan
        </button>
      ) : (
        <button
          onClick={stopCamera}
          className="w-full bg-red-500 text-white py-3 rounded-lg font-medium mb-4 hover:bg-red-600"
        >
          Stop Camera
        </button>
      )}

      {/* Manual fallback */}
      <div className="border-t pt-4">
        <p className="text-sm text-gray-500 mb-2">Or paste QR data manually:</p>
        <textarea
          className="w-full border rounded p-2 text-sm font-mono h-20 focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder='{"orderId":"...","secretCode":"..."}'
          value={scanInput}
          onChange={(e) => setScanInput(e.target.value)}
        />
        <button
          onClick={() => verifyQR(scanInput)}
          disabled={!scanInput || loading}
          className="w-full mt-2 bg-gray-700 text-white py-2 rounded disabled:opacity-40 hover:bg-gray-800"
        >
          Verify Manually
        </button>
      </div>

      {loading && (
        <div className="text-center mt-6 text-gray-500 animate-pulse">
          Verifying...
        </div>
      )}

      {scanResult && (
        <div className={`mt-6 p-4 rounded-xl border-2 text-center ${
          scanResult.verified
            ? 'border-green-500 bg-green-50'
            : 'border-red-500 bg-red-50'
        }`}>
          <div className="text-4xl mb-2">
            {scanResult.verified ? '✅' : '❌'}
          </div>
          <p className={`font-bold text-lg ${
            scanResult.verified ? 'text-green-700' : 'text-red-700'
          }`}>
            {scanResult.verified ? 'AUTHENTIC — Accept Return' : 'REJECTED — Possible Counterfeit'}
          </p>
          <p className="text-sm text-gray-600 mt-2">{scanResult.message}</p>
          {scanResult.orderDetails && (
            <div className="mt-3 text-left text-sm bg-white rounded p-3 border">
              <p className="font-medium">
                Total: ${scanResult.orderDetails.totalPrice?.toFixed(2)}
              </p>
              <p className="text-gray-500">
                {scanResult.orderDetails.orderItems?.length} item(s)
              </p>
            </div>
          )}
          <button
            onClick={() => { setScanResult(null); setScanInput(''); }}
            className="mt-4 text-sm text-gray-500 underline"
          >
            Scan another
          </button>
        </div>
      )}
    </div>
  );
};

export default ScanReturnPage;