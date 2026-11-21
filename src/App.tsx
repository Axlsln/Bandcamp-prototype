import { useState } from 'react';
import { RotateCcw, Wifi, WifiOff } from 'lucide-react';
import { ScreenConfirmation } from './components/ScreenConfirmation';
import { ScreenDashboard } from './components/ScreenDashboard';
import { ScreenOrderDetail } from './components/ScreenOrderDetail';
import { ScreenScanner } from './components/ScreenScanner';
import { INITIAL_ORDERS } from './data/orders';
import { AppMode, FulfillmentMethod, MerchOrder, ScreenId } from './types';

const FLOW_STEPS: { id: ScreenId; num: string; title: string; subtitle: string }[] = [
  {
    id: 'dashboard',
    num: '01',
    title: 'Artist Dashboard',
    subtitle: 'Fan/Artist toggle, buyer notes, offline sync & safe publish',
  },
  {
    id: 'detail',
    num: '02',
    title: 'Pick, Pack & Mobile QR',
    subtitle: 'Bundle checks, table stock sync, or USPS/UPS QR label',
  },
  {
    id: 'scanner',
    num: '03',
    title: 'Camera Barcode Scan',
    subtitle: 'Rapid viewfinder capture, torch, or manual tracking code',
  },
  {
    id: 'confirmation',
    num: '04',
    title: 'Fulfillment Confirmed',
    subtitle: 'Batch scan next order, offline queue, or 1-tap undo',
  },
];

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('artist');
  const [screen, setScreen] = useState<ScreenId>('dashboard');
  const [orders, setOrders] = useState<MerchOrder[]>(INITIAL_ORDERS);
  const [activeOrderId, setActiveOrderId] = useState<string>(INITIAL_ORDERS[0].id);
  const [lastConfirmedOrderId, setLastConfirmedOrderId] = useState<string>(
    INITIAL_ORDERS[0].id
  );
  const [scannerManual, setScannerManual] = useState(false);
  const [releasePublished, setReleasePublished] = useState(false);
  const [sessionFulfilledCount, setSessionFulfilledCount] = useState(0);
  const [isOffline, setIsOffline] = useState(false);

  const activeOrder = orders.find((o) => o.id === activeOrderId) ?? orders[0];
  const confirmedOrder =
    orders.find((o) => o.id === lastConfirmedOrderId) ?? activeOrder;

  const openOrders = orders.filter((o) => o.status === 'open');
  const queuedCount = orders.filter((o) => o.status === 'queued').length;
  const nextOpenOrder = openOrders.find((o) => o.id !== confirmedOrder.id);

  const activeOpenIndex = Math.max(
    1,
    openOrders.findIndex((o) => o.id === activeOrder.id) + 1
  );

  const handleInspectOrder = (orderId: string) => {
    setActiveOrderId(orderId);
    setScreen('detail');
  };

  const handleQuickScanOrder = (orderId: string) => {
    setActiveOrderId(orderId);
    setScannerManual(false);
    setScreen('scanner');
  };

  const handleOpenScanner = (startManual = false) => {
    setScannerManual(startManual);
    setScreen('scanner');
  };

  const handleAdjustStock = (sku: string, delta: number) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.sku === sku
          ? { ...o, stockCount: Math.max(0, o.stockCount + delta) }
          : o
      )
    );
  };

  const handleFulfillOrder = (
    trackingNumber: string,
    method: FulfillmentMethod
  ) => {
    const targetSku = activeOrder.sku;
    const nextStatus = isOffline ? 'queued' : 'shipped';

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === activeOrder.id) {
          return {
            ...o,
            status: nextStatus,
            trackingNumber,
            fulfillmentMethod: method,
            shippedAgo: 'Just now',
            stockCount: Math.max(0, o.stockCount - 1),
          };
        }
        if (o.sku === targetSku) {
          return { ...o, stockCount: Math.max(0, o.stockCount - 1) };
        }
        return o;
      })
    );

    setLastConfirmedOrderId(activeOrder.id);
    setSessionFulfilledCount((c) => c + 1);
    setScreen('confirmation');
  };

  const handleRevertToOpen = (orderId: string, returnTo: ScreenId = 'detail') => {
    const target = orders.find((o) => o.id === orderId);
    if (!target || target.status === 'open') return;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'open',
            trackingNumber: undefined,
            shippedAgo: undefined,
            fulfillmentMethod: undefined,
            stockCount: o.stockCount + 1,
          };
        }
        if (o.sku === target.sku) {
          return { ...o, stockCount: o.stockCount + 1 };
        }
        return o;
      })
    );

    setSessionFulfilledCount((c) => Math.max(0, c - 1));
    setActiveOrderId(orderId);
    setScreen(returnTo);
  };

  const handleUpdateTracking = (orderId: string, tracking: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, trackingNumber: tracking } : o
      )
    );
  };

  const handleSyncQueued = () => {
    setOrders((prev) =>
      prev.map((o) =>
        o.status === 'queued'
          ? { ...o, status: 'shipped', shippedAgo: 'Synced now' }
          : o
      )
    );
  };

  const handleToggleOffline = () => {
    setIsOffline((prev) => !prev);
  };

  const handleJumpToStep = (targetScreen: ScreenId) => {
    setAppMode('artist');
    if (targetScreen === 'dashboard') {
      setScreen('dashboard');
      return;
    }
    const targetOpen = openOrders[0] ?? orders[0];
    if (targetScreen === 'detail') {
      setActiveOrderId(targetOpen.id);
      setScreen('detail');
      return;
    }
    if (targetScreen === 'scanner') {
      setActiveOrderId(targetOpen.id);
      setScannerManual(false);
      setScreen('scanner');
      return;
    }
    if (targetScreen === 'confirmation') {
      const completed =
        orders.find((o) => o.status === 'shipped' || o.status === 'queued') ??
        orders[0];
      setLastConfirmedOrderId(completed.id);
      setScreen('confirmation');
    }
  };

  const handleResetDemo = () => {
    setOrders(INITIAL_ORDERS);
    setAppMode('artist');
    setActiveOrderId(INITIAL_ORDERS[0].id);
    setLastConfirmedOrderId(INITIAL_ORDERS[0].id);
    setScannerManual(false);
    setReleasePublished(false);
    setSessionFulfilledCount(0);
    setIsOffline(false);
    setScreen('dashboard');
  };

  const renderMobileScreen = () => {
    if (screen === 'dashboard') {
      return (
        <ScreenDashboard
          appMode={appMode}
          onModeChange={setAppMode}
          orders={orders}
          isOffline={isOffline}
          onToggleOffline={handleToggleOffline}
          onSyncQueued={handleSyncQueued}
          onInspectOrder={handleInspectOrder}
          onQuickScanOrder={handleQuickScanOrder}
          releasePublished={releasePublished}
          onTogglePublishRelease={() => setReleasePublished((v) => !v)}
        />
      );
    }
    if (screen === 'detail') {
      return (
        <ScreenOrderDetail
          order={activeOrder}
          onBack={() => setScreen('dashboard')}
          onOpenScanner={handleOpenScanner}
          onCompleteWithMethod={handleFulfillOrder}
          onAdjustStock={handleAdjustStock}
          onUpdateTracking={handleUpdateTracking}
          onRevertToOpen={(id) => handleRevertToOpen(id, 'detail')}
        />
      );
    }
    if (screen === 'scanner') {
      return (
        <ScreenScanner
          order={activeOrder}
          openOrderPosition={{
            current: activeOpenIndex,
            total: Math.max(1, openOrders.length),
          }}
          isOffline={isOffline}
          initialManual={scannerManual}
          onClose={() => setScreen('detail')}
          onScanComplete={handleFulfillOrder}
        />
      );
    }
    return (
      <ScreenConfirmation
        order={confirmedOrder}
        nextOpenOrder={nextOpenOrder}
        onQuickScanNext={(nextId) => {
          setActiveOrderId(nextId);
          setScannerManual(false);
          setScreen('scanner');
        }}
        onInspectNext={(nextId) => {
          setActiveOrderId(nextId);
          setScreen('detail');
        }}
        onUndoShipment={(id) => handleRevertToOpen(id, 'detail')}
        onReturnDashboard={() => setScreen('dashboard')}
      />
    );
  };

  const renderPrototypeShell = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">{renderMobileScreen()}</div>
      <footer className="h-[28px] px-4 bg-[#E6E9EE] border-t border-slate-300/80 flex items-center justify-center shrink-0">
        <span className="text-[11px] font-medium text-slate-600">
          Concept prototype for MIS 4397
        </span>
      </footer>
    </div>
  );

  return (
    <div className="min-h-dvh bg-[#ECEEF2] text-[#1F2326]">
      {/* Mobile Full-Bleed View (< lg) */}
      <main className="lg:hidden h-dvh w-full max-w-[440px] mx-auto bg-[#F4F5F7] shadow-sm overflow-hidden">
        {renderPrototypeShell()}
      </main>

      {/* Desktop Prototype Studio View (>= lg) */}
      <div className="hidden lg:grid max-w-6xl mx-auto px-8 py-8 min-h-dvh grid-cols-[1fr_390px] gap-12 items-center">
        {/* Left: Persona Context & Interactive Stepper */}
        <section className="space-y-7 max-w-xl">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#356C78]">
              Concept prototype for MIS 4397
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[#1F2326] text-balance">
              Artist Mode: Mobile Tour Fulfillment
            </h1>
            <p className="text-[15px] text-slate-600 leading-relaxed">
              Built for <span className="font-semibold text-[#1F2326]">Ed</span>
              , an independent touring musician fulfilling vinyl and merch
              orders from the road—with barcode scanning, printer-free mobile
              QR labels, offline queueing, and 1-tap undo.
            </p>
          </div>

          {/* 4-Screen Interactive Stepper */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              End-to-End Task Flow (4 Screens)
            </p>
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
              {FLOW_STEPS.map((step) => {
                const isActive = screen === step.id;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => handleJumpToStep(step.id)}
                    className={`w-full px-4 py-3 text-left flex items-start gap-3.5 transition-colors cursor-pointer first:rounded-t-2xl last:rounded-b-2xl ${
                      isActive ? 'bg-[#356C78]/8' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`font-mono text-xs font-semibold mt-0.5 tabular-nums ${
                        isActive ? 'text-[#356C78]' : 'text-slate-400'
                      }`}
                    >
                      {step.num}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-display text-sm font-semibold ${
                          isActive ? 'text-[#356C78]' : 'text-[#1F2326]'
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {step.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Session Metrics & Studio Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-300/70">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[11px] text-slate-500">Open Orders</p>
                <p className="font-display text-lg font-bold text-[#1F2326] tabular-nums">
                  {openOrders.length}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Fulfilled</p>
                <p className="font-display text-lg font-bold text-[#1E6F38] tabular-nums">
                  {sessionFulfilledCount}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Queued Offline</p>
                <p className="font-display text-lg font-bold text-amber-800 tabular-nums">
                  {queuedCount}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleOffline}
                className={`min-h-[40px] px-3 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  isOffline
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {isOffline ? (
                  <>
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>Offline Dead Zone</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-[#1E6F38]" />
                    <span>Signal: Online</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResetDemo}
                className="min-h-[40px] px-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>
        </section>

        {/* Right: Clickable Mobile Device Viewport */}
        <main className="flex flex-col items-center">
          <div className="w-[390px] h-[732px] rounded-[36px] border-[8px] border-[#2B2E33] bg-[#F4F5F7] shadow-[0_24px_48px_rgba(15,23,42,0.16)] overflow-hidden flex flex-col">
            {renderPrototypeShell()}
          </div>
        </main>
      </div>
    </div>
  );
}
