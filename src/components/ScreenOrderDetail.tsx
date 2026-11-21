import { useState } from 'react';
import {
  ArrowLeft,
  Barcode,
  Check,
  CheckCircle2,
  CloudUpload,
  MapPin,
  MessageSquare,
  Minus,
  Package,
  Plus,
  QrCode,
  RotateCcw,
  Truck,
  X,
} from 'lucide-react';
import { FulfillmentMethod, MerchOrder } from '../types';
import { ProductThumbnail } from './ProductThumbnail';
import { QrBrokerGraphic } from './QrBrokerGraphic';

interface ScreenOrderDetailProps {
  order: MerchOrder;
  onBack: () => void;
  onOpenScanner: (startManual?: boolean) => void;
  onCompleteWithMethod: (tracking: string, method: FulfillmentMethod) => void;
  onAdjustStock: (sku: string, delta: number) => void;
  onUpdateTracking: (orderId: string, tracking: string) => void;
  onRevertToOpen: (orderId: string) => void;
}

export function ScreenOrderDetail({
  order,
  onBack,
  onOpenScanner,
  onCompleteWithMethod,
  onAdjustStock,
  onUpdateTracking,
  onRevertToOpen,
}: ScreenOrderDetailProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [qrSheetOpen, setQrSheetOpen] = useState(false);
  const [qrProvider, setQrProvider] = useState<'usps' | 'ups'>('usps');
  const [editingTracking, setEditingTracking] = useState(false);
  const [trackingDraft, setTrackingDraft] = useState(
    order.trackingNumber ?? order.suggestedTracking
  );
  const [trackingError, setTrackingError] = useState('');

  const bundleList = order.bundleItems ?? [order.itemTitle];

  const toggleItem = (item: string) => {
    setCheckedItems((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const handleSaveEditedTracking = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = trackingDraft.trim();
    if (trimmed.length < 8) {
      setTrackingError('Enter at least 8 characters from the carrier label.');
      return;
    }
    setTrackingError('');
    onUpdateTracking(order.id, trimmed);
    setEditingTracking(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F5F7] relative">
      {/* Sticky Top Bar (52px) */}
      <header className="sticky top-0 z-20 bg-[#1F2326] text-white px-2 h-[52px] flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] min-w-[44px] px-2 flex items-center gap-1.5 text-sm font-medium text-slate-200 hover:text-white cursor-pointer"
          aria-label="Back to Artist Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Orders</span>
        </button>
        <span className="font-mono text-xs font-semibold text-white tabular-nums">
          Order #{order.id}
        </span>
        <div className="w-[68px]" aria-hidden="true" />
      </header>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Item Summary + Tour Table Stock Adjuster (Fix #5) */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <ProductThumbnail
              src={order.imageUrl}
              alt={order.itemTitle}
              sizeClass="w-16 h-16"
            />
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-xs text-slate-500 tabular-nums">
                {order.orderedAgo} · ${order.price}.00 paid
              </p>
              <h1 className="font-display text-base font-bold text-[#1F2326] leading-snug">
                {order.itemTitle}
              </h1>
              <p className="text-xs text-slate-600">{order.format}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-slate-600 inline-flex items-center gap-1.5 truncate">
                <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{order.binLocation}</span>
              </p>
              <p className="text-xs font-semibold text-[#1F2326] tabular-nums mt-0.5">
                {order.stockCount} remaining in tour bin
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onAdjustStock(order.sku, -1)}
                disabled={order.stockCount <= 0}
                className="min-h-[38px] px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-[11px] font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                title="Decrement inventory after an in-person merch table sale"
              >
                <Minus className="w-3 h-3" />
                <span>Sold at table</span>
              </button>
              <button
                type="button"
                onClick={() => onAdjustStock(order.sku, 1)}
                className="min-h-[38px] min-w-[38px] rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center cursor-pointer"
                aria-label="Restock 1 unit"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Prominent Fan Note Alert (Fix #6) */}
        {order.fanNote && (
          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5">
            <MessageSquare className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs font-semibold text-amber-950">
                Note from {order.buyerName}
              </p>
              <p className="text-xs text-amber-900 leading-relaxed">
                &ldquo;{order.fanNote}&rdquo;
              </p>
            </div>
          </section>
        )}

        {/* Shipping Destination */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ship To
            </h2>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#356C78]">
              <Truck className="w-3.5 h-3.5" />
              {order.carrier}
            </span>
          </div>

          <div className="flex items-start gap-2.5 text-sm text-[#1F2326]">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold">{order.buyerName}</p>
              <p className="text-xs text-slate-600">{order.streetAddress}</p>
              <p className="text-xs text-slate-600">{order.cityStateZip}</p>
            </div>
          </div>
        </section>

        {/* Bundle-Aware Pack Check OR Shipped Mistake Recovery (Fix #2 & #6) */}
        {order.status === 'open' ? (
          <section className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1.5">
            <h2 className="font-display text-xs font-semibold uppercase tracking-wide text-slate-500 pb-1">
              {bundleList.length > 1
                ? `Bundle Pack Check (${bundleList.length} Items)`
                : 'Item Pack Check'}
            </h2>
            {bundleList.map((item, idx) => {
              const checked = Boolean(checkedItems[item]);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleItem(item)}
                  className={`w-full min-h-[44px] flex items-center justify-between py-1.5 text-left cursor-pointer ${
                    idx > 0 ? 'border-t border-slate-100' : ''
                  }`}
                >
                  <span className="text-sm text-[#1F2326] pr-3">{item}</span>
                  <span
                    className={`w-6 h-6 shrink-0 rounded-md border flex items-center justify-center transition-colors ${
                      checked
                        ? 'bg-[#356C78] border-[#356C78] text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {checked && <Check className="w-3.5 h-3.5" />}
                  </span>
                </button>
              );
            })}
          </section>
        ) : (
          <section className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div
                className={`flex items-center gap-2 text-sm font-semibold ${
                  order.status === 'queued'
                    ? 'text-amber-800'
                    : 'text-[#1E6F38]'
                }`}
              >
                {order.status === 'queued' ? (
                  <>
                    <CloudUpload className="w-4 h-4" />
                    <span>Saved offline ({order.shippedAgo})</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Shipped {order.shippedAgo}</span>
                  </>
                )}
              </div>
              {!editingTracking && (
                <button
                  type="button"
                  onClick={() => {
                    setTrackingDraft(
                      order.trackingNumber ?? order.suggestedTracking
                    );
                    setEditingTracking(true);
                  }}
                  className="text-xs font-semibold text-[#356C78] hover:text-[#2B5963] cursor-pointer"
                >
                  Edit tracking
                </button>
              )}
            </div>

            {editingTracking ? (
              <form onSubmit={handleSaveEditedTracking} className="space-y-2.5">
                <input
                  type="text"
                  value={trackingDraft}
                  onChange={(e) => setTrackingDraft(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 font-mono text-xs text-[#1F2326] tabular-nums focus:outline-none focus:border-[#356C78]"
                />
                {trackingError && (
                  <p className="text-xs text-rose-600">{trackingError}</p>
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTracking(false);
                      setTrackingError('');
                    }}
                    className="flex-1 min-h-[40px] rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 min-h-[40px] rounded-xl bg-[#356C78] text-white text-xs font-semibold cursor-pointer"
                  >
                    Save Tracking
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-slate-600">
                Tracking:{' '}
                <span className="font-mono text-[#1F2326] tabular-nums">
                  {order.trackingNumber}
                </span>
              </p>
            )}

            <button
              type="button"
              onClick={() => onRevertToOpen(order.id)}
              className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo Shipment &amp; Reopen Order</span>
            </button>
          </section>
        )}
      </div>

      {/* Thumb-Zone Bottom CTA Bar */}
      <div className="p-4 bg-white border-t border-slate-200 space-y-2 shrink-0">
        {order.status === 'open' ? (
          <>
            <button
              type="button"
              onClick={() => onOpenScanner(false)}
              className="w-full min-h-[48px] px-4 rounded-xl bg-[#356C78] hover:bg-[#2B5963] active:scale-[0.99] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Barcode className="w-4 h-4" />
              <span>Scan Tracking Barcode</span>
            </button>

            <button
              type="button"
              onClick={() => setQrSheetOpen(true)}
              className="w-full min-h-[44px] px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1F2326] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#356C78]" />
              <span>No Printer? Create Mobile Label / QR</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenScanner(true)}
              className="w-full min-h-[36px] text-xs font-medium text-slate-500 hover:text-[#1F2326] cursor-pointer"
            >
              Label smudged? Enter tracking manually
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onBack}
            className="w-full min-h-[48px] px-4 rounded-xl bg-[#1F2326] hover:bg-slate-800 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Return to Dashboard
          </button>
        )}
      </div>

      {/* Mobile Label / Carrier QR Bottom Sheet (Fix #1) */}
      {qrSheetOpen && (
        <div
          className="absolute inset-0 z-30 bg-black/50 backdrop-blur-[2px] flex items-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-sheet-title"
        >
          <div className="w-full bg-white rounded-t-3xl p-5 space-y-4 shadow-xl max-h-[88%] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2
                id="qr-sheet-title"
                className="font-display text-base font-bold text-[#1F2326]"
              >
                Mobile Drop-Off Label QR
              </h2>
              <button
                type="button"
                onClick={() => setQrSheetOpen(false)}
                className="min-h-[40px] min-w-[40px] -mr-2 flex items-center justify-center text-slate-500 hover:text-[#1F2326] cursor-pointer"
                aria-label="Close mobile label QR sheet"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              No printer needed on the road. Show this QR code at any post
              office counter or kiosk to print and attach the label for{' '}
              <span className="font-semibold text-[#1F2326]">
                {order.buyerName}
              </span>
              .
            </p>

            {/* Carrier Selector */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setQrProvider('usps')}
                className={`min-h-[38px] rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  qrProvider === 'usps'
                    ? 'bg-white text-[#1F2326] shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                USPS Label Broker
              </button>
              <button
                type="button"
                onClick={() => setQrProvider('ups')}
                className={`min-h-[38px] rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  qrProvider === 'ups'
                    ? 'bg-white text-[#1F2326] shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                UPS Store QR
              </button>
            </div>

            {/* QR Display */}
            <div className="bg-[#F4F5F7] rounded-2xl p-4 flex flex-col items-center gap-2.5 border border-slate-200">
              <QrBrokerGraphic
                seed={`${qrProvider}-${order.id}-${order.qrBrokerCode}`}
              />
              <div className="text-center space-y-0.5">
                <p className="font-mono text-xs font-semibold text-[#1F2326] tabular-nums">
                  {qrProvider === 'usps' ? order.qrBrokerCode : `UPS-${order.qrBrokerCode}`}
                </p>
                <p className="text-[11px] text-slate-500 tabular-nums">
                  {qrProvider === 'usps' ? order.carrier : 'UPS Ground Saver'} ·{' '}
                  {order.labelCost} deducted from payouts
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setQrSheetOpen(false);
                onCompleteWithMethod(order.suggestedTracking, 'mobile_qr');
              }}
              className="w-full min-h-[48px] px-4 rounded-xl bg-[#356C78] hover:bg-[#2B5963] text-white text-sm font-semibold cursor-pointer"
            >
              Sync Tracking &amp; Mark Shipped
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
