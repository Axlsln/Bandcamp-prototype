import {
  Barcode,
  Check,
  CloudUpload,
  Mail,
  PackageCheck,
  RotateCcw,
  Truck,
} from 'lucide-react';
import { MerchOrder } from '../types';

interface ScreenConfirmationProps {
  order: MerchOrder;
  nextOpenOrder?: MerchOrder;
  onQuickScanNext: (orderId: string) => void;
  onInspectNext: (orderId: string) => void;
  onUndoShipment: (orderId: string) => void;
  onReturnDashboard: () => void;
}

export function ScreenConfirmation({
  order,
  nextOpenOrder,
  onQuickScanNext,
  onInspectNext,
  onUndoShipment,
  onReturnDashboard,
}: ScreenConfirmationProps) {
  const isQueuedOffline = order.status === 'queued';

  const methodText =
    order.fulfillmentMethod === 'mobile_qr'
      ? `${order.carrier} mobile QR & tracking synced`
      : `${order.carrier} tracking synced`;

  return (
    <div className="flex flex-col h-full bg-[#F4F5F7]">
      {/* Top Bar */}
      <header className="px-4 h-[52px] bg-[#1F2326] text-white flex items-center justify-between shrink-0">
        <span className="font-display text-[15px] font-bold">Fulfillment</span>
        <span
          className={`text-xs font-semibold inline-flex items-center gap-1 ${
            isQueuedOffline ? 'text-amber-300' : 'text-[#7AD992]'
          }`}
        >
          {isQueuedOffline ? (
            <>
              <CloudUpload className="w-3.5 h-3.5" />
              <span>Queued</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Done</span>
            </>
          )}
        </span>
      </header>

      {/* Confirmation Content */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-between">
        <div className="pt-3 space-y-5">
          <div className="text-center space-y-2">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                isQueuedOffline
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-[#E8F5E9] text-[#1E6F38]'
              }`}
            >
              {isQueuedOffline ? (
                <CloudUpload className="w-7 h-7" />
              ) : (
                <Check className="w-7 h-7 stroke-[2.5]" />
              )}
            </div>
            <h1 className="font-display text-xl font-bold text-[#1F2326] tabular-nums">
              {isQueuedOffline
                ? `Order #${order.id} Saved Offline!`
                : `Order #${order.id} Shipped!`}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-[275px] mx-auto">
              {isQueuedOffline
                ? 'Barcode cached on device. Tracking and fan email will auto-sync when signal returns.'
                : 'Tracking uploaded and fan notification email dispatched automatically.'}
            </p>
          </div>

          {/* Automated Actions Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
            <div className="p-3.5 flex items-start gap-3">
              <Truck className="w-4 h-4 text-[#356C78] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#1F2326]">
                  {isQueuedOffline
                    ? `${order.carrier} tracking queued`
                    : methodText}
                </p>
                <p className="font-mono text-xs text-slate-600 tabular-nums mt-0.5 break-all">
                  {order.trackingNumber}
                </p>
              </div>
            </div>

            <div className="p-3.5 flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#356C78] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#1F2326]">
                  {isQueuedOffline
                    ? 'Fan notification queued'
                    : 'Fan confirmation sent'}
                </p>
                <p className="text-xs text-slate-600 truncate mt-0.5">
                  {order.buyerName} · {order.buyerEmail}
                </p>
              </div>
            </div>

            <div className="p-3.5 flex items-start gap-3">
              <PackageCheck className="w-4 h-4 text-[#356C78] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#1F2326]">
                  Tour merch stock updated
                </p>
                <p className="text-xs text-slate-600 tabular-nums mt-0.5">
                  {order.itemTitle} · {order.stockCount} remaining
                </p>
              </div>
            </div>
          </div>

          {/* Mistake Recovery Undo (Fix #2) */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => onUndoShipment(order.id)}
              className="min-h-[40px] px-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#1F2326] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Wrong label? Undo &amp; reopen order</span>
            </button>
          </div>
        </div>

        {/* Thumb-Zone Batch Completion Actions (Fix #3) */}
        <div className="pt-4 space-y-2">
          {nextOpenOrder && (
            <>
              <button
                type="button"
                onClick={() => onQuickScanNext(nextOpenOrder.id)}
                className="w-full min-h-[48px] px-4 rounded-xl bg-[#356C78] hover:bg-[#2B5963] active:scale-[0.99] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Barcode className="w-4 h-4" />
                <span>Scan Next Order (#{nextOpenOrder.id})</span>
              </button>
              <button
                type="button"
                onClick={() => onInspectNext(nextOpenOrder.id)}
                className="w-full min-h-[42px] px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-[#1F2326] transition-colors cursor-pointer"
              >
                Review #{nextOpenOrder.id} Details ({nextOpenOrder.buyerName})
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onReturnDashboard}
            className={`w-full min-h-[48px] px-4 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              nextOpenOrder
                ? 'bg-[#1F2326] hover:bg-slate-800 text-white'
                : 'bg-[#356C78] hover:bg-[#2B5963] text-white'
            }`}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
