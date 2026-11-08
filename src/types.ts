export type Category =
  | 'Signature candles'
  | 'Premium candles'
  | 'Decorative candles'
  | 'Ceramic candle'
  | 'Scented wax sachet'
  | 'Mini jar combos'
  | 'Combos'
  | 'Candles'
  | 'Diffusers'
  | 'Fresheners'
  | 'Accessories'
  | 'Gift Sets'
  | 'Gift Hampers'
  | string;

export interface FragranceNotes {
  top?: string;
  heart?: string;
  base?: string;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  collectionName?: string; // e.g. "Paradise Collection", "Nature Series", "Hues Collection"
  price: number;
  originalPrice?: number;
  description: string;
  longDescription: string;
  image: string;
  additionalImages?: string[];
  fragranceNotes?: FragranceNotes;
  burnTime?: string; // e.g. "Classic - 35 Hours, Large - 50 Hours"
  weight: string; // e.g. "Classic - 330 gms, Large - 740 gms"
  noOfWicks?: string; // e.g. "Classic - 2 Wick, Large - 3 Wicks"
  dimensions?: string; // e.g. 'Classic - 3.67" x 2.48" x 3.12"'
  countryOfOrigin?: string; // e.g. "India"
  ingredients: string[];
  benefits?: string[];
  zodiacSign?: string;
  vastuPlacement?: string;
  rating: number;
  reviewsCount: number;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  inStock?: boolean;
  isVisible?: boolean; // Show or Hide product from store
  hsnCode?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export interface OrderAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  addressType: 'home' | 'work' | 'other';
  deliveryNotes?: string;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  taxAmount: number;
  grandTotal: number;
  address: OrderAddress;
  paymentMethod: 'upi' | 'cod';
  paymentStatus: 'paid' | 'pending_verification' | 'pending_cod';
  upiTransactionId?: string;
  status: 'confirmed' | 'processing' | 'dispatched' | 'delivered' | 'cancelled';
  cancelledAt?: string;
  cancelReason?: string;
  userId?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  savedAddress?: OrderAddress;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  isActive: boolean;
  description?: string;
}

export interface SiteSettings {
  merchantUpiId: string;
  merchantUpiNumber: string;
  merchantName: string;
  whatsappPhone: string;
  contactEmail: string;
  freeShippingThreshold: number;
  shippingFee: number;
  announcementEnabled: boolean;
  announcements: string[];
}

