import { SiteSettings } from '../types';

const SETTINGS_KEY = 'orchid_flame_site_settings';
export const SETTINGS_CHANGE_EVENT = 'orchid_flame_settings_updated';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  merchantUpiId: '7023377369@ybl',
  merchantUpiNumber: '7023377369',
  paymentQrImage: '/payment-qr.png',
  merchantName: 'Orchid Flame',
  whatsappPhone: '919026006766',
  contactEmail: 'care@orchidflame.com',
  freeShippingThreshold: 1500,
  shippingFee: 99,
  announcementEnabled: true,
  announcements: [
    'Orchid Flame · Free Express Delivery Above ₹1,500',
    '100% Pure Natural Soy Wax & Botanical Oils',
    '10 Products Sold = 1 Cataract Surgery Funded',
    'Festive Paradise & Heritage Vessels Now Live',
  ],
};

export const getSiteSettings = (): SiteSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Auto-migrate legacy UPI values to the official PhonePe UPI ID & QR code
      const merchantUpiId = (!parsed.merchantUpiId || parsed.merchantUpiId === '9026006766@upi') 
        ? '7023377369@ybl' 
        : parsed.merchantUpiId;
      const merchantUpiNumber = (!parsed.merchantUpiNumber || parsed.merchantUpiNumber === '9026006766') 
        ? '7023377369' 
        : parsed.merchantUpiNumber;
      const paymentQrImage = parsed.paymentQrImage || '/payment-qr.png';

      return {
        ...DEFAULT_SITE_SETTINGS,
        ...parsed,
        merchantUpiNumber,
        merchantUpiId,
        paymentQrImage,
        whatsappPhone: parsed.whatsappPhone || '919026006766',
      };
    }
  } catch (e) {
    console.error('Error reading site settings:', e);
  }
  return DEFAULT_SITE_SETTINGS;
};

export const saveSiteSettings = (updates: Partial<SiteSettings>): SiteSettings => {
  const current = getSiteSettings();
  const next: SiteSettings = {
    ...current,
    ...updates,
  };

  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch (e) {
    console.error('Error saving site settings:', e);
  }

  // Notify active components in real time
  window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT, { detail: next }));
  return next;
};
