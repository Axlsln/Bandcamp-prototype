import { useState } from 'react';
import {
  Barcode,
  CheckCircle2,
  ChevronRight,
  CloudUpload,
  Disc3,
  Headphones,
  MessageSquare,
  PackageCheck,
  Pencil,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { AppMode, MerchOrder } from '../types';
import { ProductThumbnail } from './ProductThumbnail';

interface ScreenDashboardProps {
  appMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  orders: MerchOrder[];
  isOffline: boolean;
  onToggleOffline: () => void;
  onSyncQueued: () => void;
  onInspectOrder: (orderId: string) => void;
  onQuickScanOrder: (orderId: string) => void;
  releasePublished: boolean;
  onTogglePublishRelease: () => void;
}

export function ScreenDashboard({
  appMode,
  onModeChange,
  orders,
  isOffline,
  onToggleOffline,
  onSyncQueued,
  onInspectOrder,
  onQuickScanOrder,
  releasePublished,
  onTogglePublishRelease,
}: ScreenDashboardProps) {
  const [filter, setFilter] = useState<'open' | 'shipped'>('open');
  const [confirmPublishOpen, setConfirmPublishOpen] = useState(false);

  const openOrders = orders.filter((o) => o.status === 'open');
  const completedOrders = orders.filter(
    (o) => o.status === 'shipped' || o.status === 'queued'
  );
  const queuedCount = orders.filter((o) => o.status === 'queued').length;
  const visibleOrders = filter === 'open' ? openOrders : completedOrders;

  return (
    <div className="flex flex-col h-full bg-[#F4F5F7] relative">
      {/* Sticky Top App Bar (52px) */}
      <header className="sticky top-0 z-20 bg-[#1F2326] text-white px-4 h-[52px] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-display text-[15px] font-bold tracking-tight whitespace-nowrap">
            Artist Mode
          </span>
        </div>

        <div
          className="flex items-center bg-white/10 rounded-xl p-1"
          role="group"
          aria-label="App view mode"
        >
          <button
            type="button"
            onClick={() => onModeChange('fan')}
            className={`min-h-[32px] px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              appMode === 'fan'
                ? 'bg-[#619AA6] text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Fan
          </button>
          <button
            type="button"
            onClick={() => onModeChange('artist')}
            className={`min-h-[32px] px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              appMode === 'artist'
                ? 'bg-[#619AA6] text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Artist
          </button>
        </div>
      </header>

      {appMode === 'fan' ? (
        <div className="flex-1 flex flex-col justify-between p-5 bg-white">
          <div className="space-y-4 pt-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
              <Headphones className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500">
                Listener Experience · Current App Behavior
              </p>
              <h1 className="font-display text-xl font-bold text-[#1F2326] text-balance">
                Fan Stream Only
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                In standard Fan view, touring artists only see their listener
                collection and feed—forcing them into a mobile desktop browser
                just to ship merch or publish a release.
              </p>
            </div>
            <div className="border-t border-slate-200 pt-4 space-y-1.5">
              <p className="text-xs font-semibold text-[#1F2326]">
                Waiting in your tour fulfillment queue
              </p>
              <p className="text-sm text-slate-600 tabular-nums">
                {openOrders.length} open merch{' '}
                {openOrders.length === 1 ? 'order' : 'orders'} · Ready for
                barcode scan or mobile QR
              </p>
            </div>
          </div>

          <div className="pt-4 pb-2">
            <button
              type="button"
              onClick={() => onModeChange('artist')}
              className="w-full min-h-[48px] px-4 rounded-xl bg-[#356C78] hover:bg-[#2B5963] active:scale-[0.99] text-white text-sm font-semibold transition-all cursor-pointer"
            >
              Switch to Artist Mode
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pt-3.5 pb-5 space-y-3.5">
          {/* Artist Context + Offline Signal Toggle */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="font-display text-lg font-bold text-[#1F2326]">
                Tour Fulfillment
              </h1>
              <p className="text-xs text-slate-500 tabular-nums truncate">
                Ed · Desert Echoes · {openOrders.length} pending
              </p>
            </div>

            <button
              type="button"
              onClick={onToggleOffline}
              className={`min-h-[36px] px-2.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isOffline
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-[#1F2326]'
              }`}
              title="Simulate venue dead-zone / offline tour van connection"
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                  <span>Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-[#1E6F38]" />
                  <span>Online</span>
                </>
              )}
            </button>
          </div>

          {/* Offline Queue Sync Bar */}
          {queuedCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <CloudUpload className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-amber-950 tabular-nums">
                    {queuedCount} {queuedCount === 1 ? 'scan' : 'scans'} cached
                    offline
                  </p>
                  <p className="text-[11px] text-amber-800">
                    {isOffline
                      ? 'Saved on device. Reconnect to upload tracking.'
                      : 'Signal restored — ready to sync tracking.'}
                  </p>
                </div>
              </div>
              {!isOffline && (
                <button
                  type="button"
                  onClick={onSyncQueued}
                  className="min-h-[36px] px-3 rounded-lg bg-amber-900 hover:bg-amber-800 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Sync Now
                </button>
              )}
            </div>
          )}

          {/* Open / Shipped Tabs */}
          <div
            className="grid grid-cols-2 gap-1 p-1 bg-slate-200/70 rounded-xl"
            role="tablist"
            aria-label="Filter orders"
          >
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'open'}
              onClick={() => setFilter('open')}
              className={`min-h-[40px] px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap tabular-nums cursor-pointer ${
                filter === 'open'
                  ? 'bg-white text-[#1F2326] shadow-xs'
                  : 'text-slate-600 hover:text-[#1F2326]'
              }`}
            >
              Open Orders ({openOrders.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'shipped'}
              onClick={() => setFilter('shipped')}
              className={`min-h-[40px] px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap tabular-nums cursor-pointer ${
                filter === 'shipped'
                  ? 'bg-white text-[#1F2326] shadow-xs'
                  : 'text-slate-600 hover:text-[#1F2326]'
              }`}
            >
              Shipped ({completedOrders.length})
            </button>
          </div>

          {/* Orders List */}
          {visibleOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#E8F5E9] text-[#1E6F38] flex items-center justify-center mx-auto">
                <PackageCheck className="w-5 h-5" />
              </div>
              <p className="font-display text-sm font-semibold text-[#1F2326]">
                All tour orders fulfilled
              </p>
              <p className="text-xs text-slate-500">
                Every open order has tracking uploaded or queued for sync.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleOrders.map((order, index) => (
                <article
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200 p-3.5 space-y-3"
                >
                  <button
                    type="button"
                    onClick={() => onInspectOrder(order.id)}
                    className="w-full text-left flex items-start gap-3 group cursor-pointer"
                  >
                    <ProductThumbnail
                      src={order.imageUrl}
                      alt={order.itemTitle}
                      sizeClass="w-14 h-14"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-semibold text-[#1F2326] tabular-nums">
                          Order #{order.id}
                        </span>
                        <span className="text-xs text-slate-500 tabular-nums shrink-0">
                          {order.status === 'open'
                            ? order.orderedAgo
                            : order.status === 'queued'
                              ? `Queued ${order.shippedAgo}`
                              : `Shipped ${order.shippedAgo}`}
                        </span>
                      </div>
                      <h2 className="font-display text-sm font-semibold text-[#1F2326] truncate group-hover:text-[#356C78] transition-colors">
                        {order.itemTitle}
                      </h2>
                      <p className="text-xs text-slate-500 truncate tabular-nums">
                        {order.cityStateZip.replace(/\s+\d{5}$/, '')} · $
                        {order.price}.00 · {order.buyerName}
                        {order.bundleItems && order.bundleItems.length > 1
                          ? ` · ${order.bundleItems.length}-item bundle`
                          : ''}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {/* Surface Fan Note Directly on Card (Fix #6) */}
                  {order.status === 'open' && order.fanNote && (
                    <div className="bg-slate-50 rounded-xl px-3 py-2 flex items-start gap-2 text-xs text-slate-700">
                      <MessageSquare className="w-3.5 h-3.5 text-[#356C78] shrink-0 mt-0.5" />
                      <span className="leading-snug line-clamp-2">
                        <span className="font-semibold text-[#1F2326]">
                          Fan note:
                        </span>{' '}
                        {order.fanNote}
                      </span>
                    </div>
                  )}

                  {order.status === 'open' ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onQuickScanOrder(order.id)}
                        className={`flex-1 min-h-[44px] px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer whitespace-nowrap ${
                          index === 0
                            ? 'bg-[#356C78] hover:bg-[#2B5963] text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-[#1F2326]'
                        }`}
                      >
                        <Barcode className="w-4 h-4 shrink-0" />
                        <span>Scan Tracking Barcode</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onInspectOrder(order.id)}
                        className="min-h-[44px] px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 whitespace-nowrap cursor-pointer"
                      >
                        Pack / QR
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <span
                        className={`inline-flex items-center gap-1.5 font-medium ${
                          order.status === 'queued'
                            ? 'text-amber-800'
                            : 'text-[#1E6F38]'
                        }`}
                      >
                        {order.status === 'queued' ? (
                          <>
                            <CloudUpload className="w-3.5 h-3.5 shrink-0" />
                            <span>Saved offline · Pending sync</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Tracking synced</span>
                          </>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => onInspectOrder(order.id)}
                        className="min-h-[32px] px-2 inline-flex items-center gap-1 text-xs font-semibold text-[#356C78] hover:text-[#2B5963] cursor-pointer whitespace-nowrap"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Edit / Undo</span>
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}

          {/* Quick Release Action with Safe Confirmation Guard (Fix #5) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                <Disc3 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-xs font-semibold text-[#1F2326] truncate">
                  Live at Mohawk (4-Track EP)
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {releasePublished
                    ? 'Live on storefront · Followers notified'
                    : 'Draft release · Ready to publish'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (releasePublished) {
                  onTogglePublishRelease();
                } else {
                  setConfirmPublishOpen(true);
                }
              }}
              className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                releasePublished
                  ? 'bg-[#E8F5E9] text-[#1E6F38] border border-[#1E6F38]/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {releasePublished ? 'Published' : 'Publish'}
            </button>
          </div>
        </div>
      )}

      {/* Safe Publish Confirmation Sheet (Fix #5) */}
      {confirmPublishOpen && (
        <div
          className="absolute inset-0 z-30 bg-black/50 backdrop-blur-[2px] flex items-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="publish-dialog-title"
        >
          <div className="w-full bg-white rounded-t-3xl p-5 space-y-4 shadow-xl">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto" />
            <div className="space-y-1.5">
              <h2
                id="publish-dialog-title"
                className="font-display text-base font-bold text-[#1F2326]"
              >
                Publish &ldquo;Live at Mohawk (4-Track EP)&rdquo;?
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                This sets the release live on your storefront and emails 1,420
                followers immediately. Confirming prevents accidental pocket
                taps while on tour.
              </p>
            </div>
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setConfirmPublishOpen(false)}
                className="flex-1 min-h-[44px] px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onTogglePublishRelease();
                  setConfirmPublishOpen(false);
                }}
                className="flex-1 min-h-[44px] px-4 rounded-xl bg-[#356C78] hover:bg-[#2B5963] text-white text-xs font-semibold cursor-pointer"
              >
                Confirm Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
