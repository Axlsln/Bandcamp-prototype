import { useEffect, useState } from 'react';
import { Check, Flashlight, Keyboard, WifiOff, X } from 'lucide-react';
import { FulfillmentMethod, MerchOrder } from '../types';

interface ScreenScannerProps {
  order: MerchOrder;
  openOrderPosition: { current: number; total: number };
  isOffline: boolean;
  initialManual?: boolean;
  onClose: () => void;
  onScanComplete: (trackingNumber: string, method: FulfillmentMethod) => void;
}

export function ScreenScanner({
  order,
  openOrderPosition,
  isOffline,
  initialManual = false,
  onClose,
  onScanComplete,
}: ScreenScannerProps) {
  const [torchOn, setTorchOn] = useState(false);
  const [manualMode, setManualMode] = useState(initialManual);
  const [manualInput, setManualInput] = useState(order.suggestedTracking);
  const [scanPhase, setScanPhase] = useState<'ready' | 'locked'>('ready');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setManualMode(initialManual);
    setManualInput(order.suggestedTracking);
    setScanPhase('ready');
    setErrorMsg('');
  }, [order, initialManual]);

  const triggerBarcodeCapture = () => {
    if (scanPhase === 'locked') return;
    setScanPhase('locked');
    window.setTimeout(() => {
      onScanComplete(order.suggestedTracking, 'barcode');
    }, 360);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualInput.trim();
    if (trimmed.length < 8) {
      setErrorMsg('Enter at least 8 characters from the carrier tracking label.');
      return;
    }
    setErrorMsg('');
    onScanComplete(trimmed, 'manual');
  };

  return (
    <div className="flex flex-col h-full bg-[#111518] text-white">
      {/* Top Bar */}
      <header className="px-4 h-[52px] bg-[#1F2326] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-display text-[15px] font-bold whitespace-nowrap">
            Scan Label
          </span>
          <span className="text-slate-500" aria-hidden="true">
            ·
          </span>
          <span className="font-mono text-xs text-slate-300 tabular-nums whitespace-nowrap">
            #{order.id}
          </span>
          {openOrderPosition.total > 1 && (
            <span className="text-[11px] text-slate-400 tabular-nums whitespace-nowrap">
              ({openOrderPosition.current} of {openOrderPosition.total})
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
          aria-label="Close viewfinder"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Offline Queue Notice */}
      {isOffline && (
        <div className="px-4 py-2 bg-amber-950/80 border-b border-amber-700/50 text-amber-200 text-[11px] flex items-center gap-2">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>Offline mode — scan will save locally and sync later.</span>
        </div>
      )}

      {/* Camera Viewport Area */}
      <div className="flex-1 p-4 flex flex-col justify-between gap-4 relative overflow-hidden">
        <div
          className={`flex-1 rounded-2xl border-2 transition-colors relative flex flex-col items-center justify-center p-5 ${
            scanPhase === 'locked'
              ? 'border-[#2E7D32] bg-[#16271A]'
              : torchOn
                ? 'border-[#619AA6] bg-[#1D2429]'
                : 'border-dashed border-[#4A515A] bg-[#0B0E11]'
          }`}
        >
          {/* Interactive Label Target inside Camera Frame */}
          <button
            type="button"
            onClick={triggerBarcodeCapture}
            className="w-full max-w-[240px] bg-white text-[#1F2326] rounded-xl p-3.5 shadow-lg text-left relative overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
            aria-label={`Simulate scanning barcode for Order ${order.id}`}
          >
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 border-b border-slate-200 pb-1.5 mb-2">
              <span>{order.carrier}</span>
              <span className="font-mono tabular-nums">#{order.id}</span>
            </div>
            <p className="text-[11px] font-medium text-slate-700 truncate mb-2.5">
              {order.buyerName} · {order.cityStateZip}
            </p>

            {/* Realistic CSS Barcode Graphic */}
            <div className="h-12 w-full flex items-stretch justify-between gap-[2px] px-1">
              {[
                3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 4, 1, 2, 1, 3, 1,
                2, 2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 1, 2,
              ].map((w, i) => (
                <span
                  key={i}
                  className="bg-[#1F2326]"
                  style={{ width: `${w * 2}px` }}
                />
              ))}
            </div>

            <p className="mt-1.5 text-center font-mono text-[10px] tracking-wider text-slate-700 tabular-nums">
              {order.suggestedTracking}
            </p>

            {/* Laser Scan Line */}
            {scanPhase === 'ready' && (
              <div
                className="scan-sweep absolute left-2 right-2 top-1/2 h-[2px] bg-[#FF3B30] shadow-[0_0_10px_#FF3B30]"
                aria-hidden="true"
              />
            )}

            {/* Locked Overlay */}
            {scanPhase === 'locked' && (
              <div className="absolute inset-0 bg-[#1E6F38]/90 text-white flex flex-col items-center justify-center gap-1">
                <Check className="w-7 h-7" />
                <span className="text-xs font-semibold">
                  {isOffline ? 'Cached Offline' : 'Barcode Captured'}
                </span>
              </div>
            )}
          </button>

          <p className="mt-5 text-xs text-slate-300 text-center max-w-[230px] leading-relaxed">
            {scanPhase === 'locked'
              ? isOffline
                ? 'Saving scan to device queue...'
                : 'Uploading tracking & notifying fan...'
              : 'Align shipping label barcode within frame or tap label to capture'}
          </p>
        </div>

        {/* Manual Entry Drawer OR Primary Capture Controls */}
        {manualMode ? (
          <form
            onSubmit={handleManualSubmit}
            className="bg-[#1F2326] rounded-2xl border border-slate-700 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <label
                htmlFor="manual-tracking"
                className="font-display text-xs font-semibold text-white"
              >
                Enter Tracking Number
              </label>
              <button
                type="button"
                onClick={() => setManualMode(false)}
                className="text-xs text-[#619AA6] hover:text-white cursor-pointer"
              >
                Use camera
              </button>
            </div>
            <input
              id="manual-tracking"
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="e.g. 9400 1118 9956 2841 0094 12"
              className="w-full h-11 px-3 rounded-xl bg-[#111518] border border-slate-600 text-white font-mono text-xs tabular-nums focus:outline-none focus:border-[#619AA6]"
            />
            {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}
            <button
              type="submit"
              className="w-full min-h-[44px] px-4 rounded-xl bg-[#356C78] hover:bg-[#2B5963] text-white text-sm font-semibold cursor-pointer"
            >
              {isOffline ? 'Save Offline to Queue' : 'Confirm & Mark Shipped'}
            </button>
          </form>
        ) : (
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={triggerBarcodeCapture}
              disabled={scanPhase === 'locked'}
              className="w-full min-h-[48px] px-4 rounded-xl bg-[#356C78] hover:bg-[#2B5963] disabled:opacity-70 active:scale-[0.99] text-white text-sm font-semibold transition-all cursor-pointer"
            >
              {scanPhase === 'locked' ? 'Capturing...' : 'Capture Label Barcode'}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTorchOn((v) => !v)}
                className={`min-h-[44px] px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  torchOn
                    ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                    : 'bg-[#1F2326] border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Flashlight className="w-4 h-4" />
                <span>{torchOn ? 'Light On' : 'Light Off'}</span>
              </button>

              <button
                type="button"
                onClick={() => setManualMode(true)}
                className="min-h-[44px] px-3 rounded-xl bg-[#1F2326] border border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Keyboard className="w-4 h-4" />
                <span>Type Code</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
