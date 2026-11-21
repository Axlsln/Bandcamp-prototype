export type ScreenId = 'dashboard' | 'detail' | 'scanner' | 'confirmation';

export type AppMode = 'artist' | 'fan';

export type OrderStatus = 'open' | 'queued' | 'shipped';

export type FulfillmentMethod = 'barcode' | 'mobile_qr' | 'manual';

export interface MerchOrder {
  id: string;
  sku: string;
  itemTitle: string;
  format: string;
  imageUrl: string;
  buyerName: string;
  buyerEmail: string;
  streetAddress: string;
  cityStateZip: string;
  carrier: string;
  labelCost: string;
  price: number;
  orderedAgo: string;
  stockCount: number;
  binLocation: string;
  suggestedTracking: string;
  qrBrokerCode: string;
  trackingNumber?: string;
  shippedAgo?: string;
  fulfillmentMethod?: FulfillmentMethod;
  fanNote?: string;
  bundleItems?: string[];
  status: OrderStatus;
}
