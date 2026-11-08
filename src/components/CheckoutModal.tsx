import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, 
  faQrcode, 
  faPaperPlane, 
  faCopy, 
  faCheck, 
  faCircleCheck, 
  faShieldHalved, 
  faCircleQuestion,
  faMagnifyingGlass,
  faChevronDown,
  faLock,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, Order, OrderAddress, Coupon, UserProfile } from '../types';
import { getSiteSettings, SETTINGS_CHANGE_EVENT } from '../services/siteSettings';
import { isValidEmail } from '../services/firebase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  user: UserProfile | null;
  onOpenAuthModal: () => void;
  onUserChange?: (user: UserProfile | null) => void;
  onOrderSuccess: (order: Order) => void;
  onClearCart: () => void;
  onNavigateToOrders?: () => void;
}

const INDIAN_STATES = [
  'Delhi', 'Maharashtra', 'Karnataka', 'Uttar Pradesh', 'Haryana',
  'Tamil Nadu', 'Gujarat', 'West Bengal', 'Rajasthan', 'Punjab',
  'Telangana', 'Kerala', 'Madhya Pradesh', 'Bihar', 'Andhra Pradesh',
  'Assam', 'Odisha', 'Goa', 'Uttarakhand', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Chandigarh', 'Puducherry'
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  user,
  onOpenAuthModal,
  onUserChange,
  onOrderSuccess,
  onClearCart,
  onNavigateToOrders,
}) => {
  const bodyScrollRef = useRef<HTMLDivElement>(null);

  // Step state: 'form' | 'upi_pay' | 'success'
  const [currentStep, setCurrentStep] = useState<'form' | 'upi_pay' | 'success'>('form');

  // Contact & Delivery fields
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [newsletter, setNewsletter] = useState(true);
  const [country, setCountry] = useState('India');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Delhi');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [saveInfo, setSaveInfo] = useState(true);

  // Auto-fill contact & delivery fields when authenticated user changes
  useEffect(() => {
    if (user) {
      if (!emailOrPhone && user.email) setEmailOrPhone(user.email);
      if (!phone && (user.phone || user.savedAddress?.phone)) {
        setPhone(user.phone || user.savedAddress?.phone || '');
      }
      if (!firstName && user.displayName) {
        const parts = user.displayName.trim().split(' ');
        setFirstName(parts[0] || '');
        if (!lastName && parts.length > 1) {
          setLastName(parts.slice(1).join(' '));
        }
      }
      if (user.savedAddress) {
        if (!addressLine && user.savedAddress.addressLine1) setAddressLine(user.savedAddress.addressLine1);
        if (!apartment && user.savedAddress.addressLine2) setApartment(user.savedAddress.addressLine2);
        if (!city && user.savedAddress.city) setCity(user.savedAddress.city);
        if (user.savedAddress.state) setState(user.savedAddress.state);
        if (!pincode && user.savedAddress.pincode) setPincode(user.savedAddress.pincode);
      }
    }
  }, [user]);

  // Discount code field
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [discountMsg, setDiscountMsg] = useState('');

  // Real-time site settings
  const [siteSettings, setSiteSettings] = useState(() => getSiteSettings());

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setSiteSettings(getSiteSettings());
    };
    window.addEventListener(SETTINGS_CHANGE_EVENT, handleSettingsUpdate);
    window.addEventListener('storage', handleSettingsUpdate);
    return () => {
      window.removeEventListener(SETTINGS_CHANGE_EVENT, handleSettingsUpdate);
      window.removeEventListener('storage', handleSettingsUpdate);
    };
  }, []);

  // Payment state - strictly online payment
  const [upiTxnId, setUpiTxnId] = useState('');
  const [upiCopied, setUpiCopied] = useState(false);
  const [upiNumberCopied, setUpiNumberCopied] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShippingThreshold = siteSettings.freeShippingThreshold || 1500;
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : (siteSettings.shippingFee || 99);
  const grandTotal = Math.max(0, subtotal - appliedDiscount) + shipping;
  const taxAmount = Math.round((subtotal - subtotal / 1.18) * 100) / 100;

  // STRICT UPI NUMBER & VPA (9026006766)
  const MERCHANT_UPI_ID = siteSettings.merchantUpiId || '9026006766@upi';
  const MERCHANT_UPI_NUMBER = siteSettings.merchantUpiNumber || '9026006766';
  const WHATSAPP_PHONE = siteSettings.whatsappPhone || '919026006766';

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    const code = discountCode.trim().toUpperCase();
    if (!code) return;

    let availableCoupons: Coupon[] = [];
    try {
      const stored = localStorage.getItem('orchid_flame_coupons');
      if (stored) {
        availableCoupons = JSON.parse(stored);
      } else {
        availableCoupons = [
          { id: 'c1', code: 'ORCHID10', discountType: 'percentage', discountValue: 10, isActive: true, description: '10% Inaugural Discount' },
          { id: 'c2', code: 'WELCOME10', discountType: 'percentage', discountValue: 10, isActive: true, description: '10% Welcome Discount' },
          { id: 'c3', code: 'FLAME100', discountType: 'fixed', discountValue: 100, isActive: true, description: '₹100 Celebratory Voucher' },
        ];
      }
    } catch {
      availableCoupons = [];
    }

    const matched = availableCoupons.find((c) => c.code.toUpperCase() === code);
    if (!matched) {
      setAppliedDiscount(0);
      setDiscountMsg('Invalid promotional coupon code.');
      return;
    }

    if (!matched.isActive) {
      setAppliedDiscount(0);
      setDiscountMsg(`Coupon code "${code}" is currently deactivated or expired.`);
      return;
    }

    if (matched.minOrderAmount && subtotal < matched.minOrderAmount) {
      setAppliedDiscount(0);
      setDiscountMsg(`Minimum cart subtotal of ₹${matched.minOrderAmount} required for coupon "${code}".`);
      return;
    }

    let calculated = 0;
    if (matched.discountType === 'percentage') {
      calculated = Math.round((subtotal * matched.discountValue) / 100);
      setDiscountMsg(`${matched.discountValue}% discount applied successfully!`);
    } else {
      calculated = Math.min(matched.discountValue, subtotal);
      setDiscountMsg(`₹${matched.discountValue} voucher discount applied successfully!`);
    }

    setAppliedDiscount(calculated);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(MERCHANT_UPI_ID);
    setUpiCopied(true);
    setTimeout(() => setUpiCopied(false), 2500);
  };

  const handleCopyUpiNumber = () => {
    navigator.clipboard.writeText(MERCHANT_UPI_NUMBER);
    setUpiNumberCopied(true);
    setTimeout(() => setUpiNumberCopied(false), 2500);
  };

  const upiPayload = `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(siteSettings.merchantName || 'Orchid Flame')}&am=${grandTotal}&cu=INR&tn=Orchid+Flame+Candles`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiPayload)}&margin=10`;

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const cleanContact = emailOrPhone.trim();
    if (!cleanContact) {
      errors.emailOrPhone = 'Enter email address or mobile number';
    } else if (cleanContact.includes('@')) {
      if (!isValidEmail(cleanContact)) {
        errors.emailOrPhone = 'Enter a valid email address (e.g. name@example.com)';
      }
    } else {
      const cleanDigits = cleanContact.replace(/[^0-9]/g, '');
      if (cleanDigits.length < 10) {
        errors.emailOrPhone = 'Enter a valid 10-digit mobile number or valid email';
      }
    }

    if (!firstName.trim()) errors.firstName = 'Enter first name';
    if (!addressLine.trim()) errors.addressLine = 'Enter delivery street address';
    if (!city.trim()) errors.city = 'Enter city';
    if (!pincode.trim() || !/^\d{6}$/.test(pincode.trim())) errors.pincode = 'Enter a valid 6-digit PIN code';

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      errors.phone = 'Enter a valid 10-digit contact mobile number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = () => {
    if (!user) {
      onOpenAuthModal();
      return;
    }
    if (validateForm()) {
      setCurrentStep('upi_pay');
      setTimeout(() => {
        bodyScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  };

  const processOrder = (txnId?: string) => {
    if (!user) {
      onOpenAuthModal();
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `OF-2026-${randomNum}`;
    const invoiceNumber = `INV-2026-${randomNum}`;
    const timestamp = new Date().toISOString();

    const orderAddress: OrderAddress = {
      fullName: `${firstName} ${lastName}`.trim() || user.displayName,
      phone: phone || user.phone || '9876543210',
      email: user.email || (emailOrPhone.includes('@') ? emailOrPhone : 'customer@orchidflame.com'),
      addressLine1: addressLine,
      addressLine2: apartment,
      city: city,
      state: state,
      pincode: pincode,
      addressType: 'home',
    };

    const newOrder: Order = {
      id: orderId,
      invoiceNumber,
      createdAt: timestamp,
      items: [...cartItems],
      subtotal,
      shipping,
      discount: appliedDiscount,
      taxAmount,
      grandTotal,
      address: orderAddress,
      paymentMethod: 'upi',
      paymentStatus: 'paid',
      upiTransactionId: txnId?.trim() || 'UPI_ONLINE_TRANSFER',
      status: 'confirmed',
      userId: user.uid,
    };

    if (saveInfo && user) {
      const updatedUser: UserProfile = {
        ...user,
        phone: phone || user.phone,
        savedAddress: orderAddress,
      };
      if (onUserChange) onUserChange(updatedUser);
    }

    try {
      const existing = localStorage.getItem('orchid_flame_orders');
      const ordersList: Order[] = existing ? JSON.parse(existing) : [];
      ordersList.unshift(newOrder);
      localStorage.setItem('orchid_flame_orders', JSON.stringify(ordersList));
    } catch (err) {
      console.error('Failed to save order to localStorage', err);
    }

    setPlacedOrder(newOrder);
    onOrderSuccess(newOrder);
    onClearCart();
    setCurrentStep('success');
    setTimeout(() => {
      bodyScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);

    sendOrderToWhatsApp(newOrder);
  };

  const sendOrderToWhatsApp = (ord: Order) => {
    let msg = `🌸 *ORCHID FLAME — NEW ORDER* 🌸\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🧾 *Order ID*: #${ord.id}\n`;
    msg += `📑 *Invoice No*: ${ord.invoiceNumber}\n`;
    msg += `📅 *Date*: ${new Date(ord.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}\n\n`;

    msg += `👤 *CUSTOMER DETAILS*:\n`;
    msg += `• *Name*: ${ord.address.fullName}\n`;
    msg += `• *Phone*: +91 ${ord.address.phone}\n`;
    msg += `• *Email*: ${ord.address.email}\n\n`;

    msg += `📍 *DELIVERY ADDRESS*:\n`;
    msg += `${ord.address.addressLine1}\n`;
    if (ord.address.addressLine2) msg += `${ord.address.addressLine2}\n`;
    msg += `${ord.address.city}, ${ord.address.state} — *${ord.address.pincode}*\n\n`;

    msg += `🛒 *ORDERED ITEMS*:\n`;
    ord.items.forEach((item, index) => {
      msg += `${index + 1}. *${item.product.name}*\n`;
      msg += `   • Qty: ${item.quantity} | Rate: ₹${item.product.price}\n`;
      msg += `   • Line Total: ₹${item.product.price * item.quantity}\n`;
    });

    msg += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💰 *ORDER BREAKDOWN*:\n`;
    msg += `• *Subtotal*: ₹${ord.subtotal}\n`;
    if (ord.discount > 0) msg += `• *Discount*: -₹${ord.discount}\n`;
    msg += `• *Shipping*: ${ord.shipping === 0 ? 'FREE' : `₹${ord.shipping}`}\n`;
    msg += `• *Grand Total Paid*: *₹${ord.grandTotal}*\n`;
    msg += `• *Payment Mode*: Online UPI (${MERCHANT_UPI_ID})\n`;
    if (ord.upiTransactionId && ord.upiTransactionId !== 'UPI_DIRECT_APP' && ord.upiTransactionId !== 'UPI_ONLINE_TRANSFER') {
      msg += `• *UTR / Ref No*: ${ord.upiTransactionId}\n`;
    }
    msg += `• *Status*: Payment Done & Order Placed\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📸 *Please share the screenshot (SS) of the payment to confirm your order.* ✨\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `Thank you! Sent via Orchid Flame Official Online Store.`;

    const encoded = encodeURIComponent(msg);
    const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto" id="checkout-modal">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="relative w-full max-w-5xl bg-white shadow-2xl rounded-none sm:rounded-md overflow-hidden my-auto h-full sm:h-auto sm:max-h-[94vh] flex flex-col border-0 sm:border border-stone-200"
      >
        
        {/* Top Slim Header Bar */}
        <div className="bg-[#FAF8F5] border-b border-stone-200 px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="font-serif text-xs sm:text-base font-bold tracking-[0.1em] sm:tracking-[0.2em] uppercase text-stone-900 truncate">
              ORCHID FLAME
            </span>
            <span className="text-stone-400 text-xs hidden xs:inline">|</span>
            <span className="text-[10px] sm:text-[11px] font-sans text-stone-500 uppercase tracking-wider hidden xs:inline truncate">
              Express Checkout
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-stone-500 hover:text-stone-900 rounded transition-colors cursor-pointer flex-shrink-0"
            aria-label="Close Checkout"
          >
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>
        </div>

        {/* Modal 2-Column Body (Matching Uploaded Image 1) */}
        <div ref={bodyScrollRef} className="flex-grow overflow-y-auto flex flex-col lg:flex-row">

          {/* LEFT COLUMN: CONTACT & DELIVERY FORM WITH BOTANICAL BACKGROUND */}
          <div className="lg:w-7/12 p-3.5 xs:p-4 sm:p-8 bg-botanical-wallpaper border-b lg:border-b-0 lg:border-r border-stone-200 text-left space-y-5 sm:space-y-6">
            
            {currentStep === 'form' && (
              <div className="space-y-6 max-w-lg mx-auto lg:mx-0">
                
                {/* 1. Contact Section (Matching Image 1) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-sans text-base sm:text-lg font-bold text-stone-900">
                      Contact
                    </h2>
                    {!user ? (
                      <button
                        type="button"
                        onClick={onOpenAuthModal}
                        className="text-xs text-[#825936] hover:underline cursor-pointer font-bold flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={faLock} className="text-[10px]" />
                        <span>Sign in to order</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                        <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                        <span>Signed in</span>
                      </span>
                    )}
                  </div>

                  {/* Prominent Authentication Banner if not logged in */}
                  {!user ? (
                    <div className="p-3.5 bg-amber-50/90 border border-amber-300 rounded-md space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faLock} className="text-[#825936]" />
                          <span>Login Required to Place Order</span>
                        </span>
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded font-mono">
                          Mandatory
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-900 leading-snug">
                        No one can place an order without signing in or logging in. Please sign in or register to complete your order, track delivery, and receive your official invoice.
                      </p>
                      <button
                        type="button"
                        onClick={onOpenAuthModal}
                        className="w-full py-2.5 bg-stone-900 hover:bg-[#825936] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                      >
                        <FontAwesomeIcon icon={faUser} className="text-xs" />
                        <span>Sign In or Register Now</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-md flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold font-serif border border-emerald-200">
                          {user.displayName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-stone-900">{user.displayName}</span>
                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-mono">Verified Patron</span>
                          </div>
                          <span className="text-[11px] text-stone-500 font-mono block">{user.email}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onOpenAuthModal}
                        className="text-[11px] text-[#825936] hover:underline font-medium cursor-pointer"
                      >
                        Switch Account
                      </button>
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Email or mobile phone number"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      className="w-full text-xs font-sans bg-white border border-stone-300 rounded-md p-3 pr-8 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                    />
                    <FontAwesomeIcon 
                      icon={faCircleQuestion} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs" 
                    />
                  </div>
                  {formErrors.emailOrPhone && <p className="text-red-600 text-[10px]">{formErrors.emailOrPhone}</p>}

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 select-none pt-0.5">
                    <input
                      type="checkbox"
                      checked={newsletter}
                      onChange={(e) => setNewsletter(e.target.checked)}
                      className="w-4 h-4 rounded text-[#825936] focus:ring-[#825936]"
                    />
                    <span>Email me with news and offers</span>
                  </label>
                </div>

                {/* 2. Delivery Section (Matching Image 1) */}
                <div className="space-y-3 pt-2">
                  <h2 className="font-sans text-base sm:text-lg font-bold text-stone-900">
                    Delivery
                  </h2>

                  {/* Country/Region dropdown */}
                  <div className="relative">
                    <label className="block text-[10px] font-medium text-stone-500 uppercase tracking-wider mb-0.5">
                      Country/Region
                    </label>
                    <div className="relative">
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full text-xs font-sans bg-white border border-stone-300 rounded-md p-3 pr-8 focus:outline-none focus:border-stone-900 appearance-none cursor-pointer"
                      >
                        <option value="India">India</option>
                      </select>
                      <FontAwesomeIcon icon={faChevronDown} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" />
                    </div>
                  </div>

                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="min-w-0">
                      <input
                        type="text"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full text-xs font-sans bg-white border border-stone-300 rounded-md p-2.5 sm:p-3 focus:outline-none focus:border-stone-900 min-w-0"
                      />
                      {formErrors.firstName && <p className="text-red-600 text-[10px] mt-0.5">{formErrors.firstName}</p>}
                    </div>

                    <div className="min-w-0">
                      <input
                        type="text"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full text-xs font-sans bg-white border border-stone-300 rounded-md p-2.5 sm:p-3 focus:outline-none focus:border-stone-900 min-w-0"
                      />
                    </div>
                  </div>

                  {/* Address with Search icon on right (Matching Image 1) */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Address"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      className="w-full text-xs font-sans bg-white border border-stone-300 rounded-md p-2.5 sm:p-3 pr-8 focus:outline-none focus:border-stone-900"
                    />
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
                  </div>
                  {formErrors.addressLine && <p className="text-red-600 text-[10px]">{formErrors.addressLine}</p>}

                  {/* Apartment, suite etc (optional) */}
                  <div>
                    <input
                      type="text"
                      placeholder="Apartment, suite, etc. (optional)"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      className="w-full text-xs font-sans bg-white border border-stone-300 rounded-md p-2.5 sm:p-3 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  {/* City, State, PIN Code 3-columns row (Matching Image 1) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    <div className="min-w-0">
                      <input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full text-xs font-sans bg-white border border-stone-300 rounded-md p-2.5 sm:p-3 focus:outline-none focus:border-stone-900 min-w-0"
                      />
                      {formErrors.city && <p className="text-red-600 text-[10px] mt-0.5">{formErrors.city}</p>}
                    </div>

                    <div className="relative min-w-0">
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full text-xs font-sans bg-white border border-stone-300 rounded-md p-2.5 sm:p-3 pr-6 focus:outline-none focus:border-stone-900 appearance-none cursor-pointer min-w-0"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                      <FontAwesomeIcon icon={faChevronDown} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" />
                    </div>

                    <div className="min-w-0">
                      <input
                        type="text"
                        placeholder="PIN code"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full text-xs font-sans bg-white border border-stone-300 rounded-md p-2.5 sm:p-3 focus:outline-none focus:border-stone-900 font-mono min-w-0"
                      />
                      {formErrors.pincode && <p className="text-red-600 text-[10px] mt-0.5">{formErrors.pincode}</p>}
                    </div>
                  </div>

                  {/* Phone with help icon */}
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="Phone"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs font-sans bg-white border border-stone-300 rounded-md p-2.5 sm:p-3 pr-8 focus:outline-none focus:border-stone-900"
                    />
                    <FontAwesomeIcon icon={faCircleQuestion} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
                  </div>
                  {formErrors.phone && <p className="text-red-600 text-[10px]">{formErrors.phone}</p>}

                  {/* Save info checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 select-none pt-0.5">
                    <input
                      type="checkbox"
                      checked={saveInfo}
                      onChange={(e) => setSaveInfo(e.target.checked)}
                      className="w-4 h-4 rounded text-[#825936] focus:ring-[#825936]"
                    />
                    <span>Save this information for next time</span>
                  </label>
                </div>

                {/* 3. Online Payment Assurance (COD Removed) */}
                <div className="space-y-3 pt-3 border-t border-stone-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-sans text-sm font-bold text-stone-900">
                      Payment Method
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded font-bold uppercase">
                      Online Payment Only
                    </span>
                  </div>

                  <div className="p-3.5 border border-stone-900 bg-stone-50/70 rounded-md flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon icon={faQrcode} className="text-base" />
                    </div>
                    <div className="text-left flex-grow">
                      <span className="font-bold text-xs text-stone-900 block">UPI & Instant Online Payment</span>
                      <span className="text-[10px] text-stone-500">GPay, PhonePe, Paytm, BHIM, Cred or Any UPI App</span>
                    </div>
                    <FontAwesomeIcon icon={faCheck} className="text-emerald-700 text-sm" />
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleProceedToPayment}
                    className="w-full py-4 bg-stone-900 hover:bg-[#825936] text-white text-xs font-bold uppercase tracking-widest rounded-md transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    {!user ? (
                      <>
                        <FontAwesomeIcon icon={faLock} className="text-xs" />
                        <span>Sign In to Place Order (₹{grandTotal})</span>
                      </>
                    ) : (
                      <>
                        <span>Proceed to Payment (₹{grandTotal})</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                  {!user && (
                    <p className="text-[10.5px] text-center text-amber-900 mt-2 font-medium bg-amber-50 py-1.5 px-2 rounded border border-amber-200">
                      🔒 You must sign in or register before you can place an order.
                    </p>
                  )}
                </div>

              </div>
            )}

            {/* UPI SCAN & PAY STEP */}
            {currentStep === 'upi_pay' && (
              <div className="space-y-5 max-w-md mx-auto text-center bg-white p-6 rounded-md border border-stone-200 shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#825936] font-mono block">
                    Instant Online Payment
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    Pay ₹{grandTotal}
                  </h3>
                  <p className="text-stone-500 text-xs">
                    Deliver to: <strong className="text-stone-800">{firstName} {lastName}</strong> ({city}, {state})
                  </p>
                </div>

                {/* Direct Pay with UPI App (One-click default UPI app open for phones) */}
                <div className="space-y-2">
                  <a
                    href={upiPayload}
                    className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded-md transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faQrcode} className="text-sm" />
                    <span>Pay ₹{grandTotal} with UPI App</span>
                  </a>
                  <p className="text-[10px] text-stone-500">
                    Opens Google Pay, PhonePe, Paytm, Cred, or your device's default UPI app
                  </p>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-grow border-t border-stone-200" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">or scan qr code</span>
                  <div className="flex-grow border-t border-stone-200" />
                </div>

                {/* Official UPI Safety Banner */}
                <div className="bg-amber-50/80 border border-amber-200/90 p-2.5 rounded text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-[#825936] font-bold text-[11px]">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-xs" />
                    <span>Official Orchid Flame UPI Guarantee</span>
                  </div>
                  <p className="text-[10px] text-stone-600 leading-snug">
                    Payment should be done strictly on official number <strong className="font-mono text-stone-900">{MERCHANT_UPI_NUMBER}</strong> or verified UPI ID. Instant verification on WhatsApp.
                  </p>
                </div>

                {/* High Res QR Box */}
                <div className="p-3 bg-stone-50 border border-stone-200 inline-block mx-auto rounded shadow-xs">
                  <img src={qrCodeUrl} alt="UPI QR for 9026006766" className="w-52 h-52 object-contain mx-auto bg-white p-1" />
                  <div className="pt-2 text-center space-y-0.5">
                    <span className="text-[11px] text-stone-800 font-bold block font-sans">
                      Scan with GPay, PhonePe, Paytm, or Cred
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono block">
                      Pay to: {MERCHANT_UPI_NUMBER} ({siteSettings.merchantName || 'Orchid Flame'})
                    </span>
                  </div>
                </div>

                {/* Copy UPI Number & UPI ID */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-stone-50 p-2.5 border border-stone-200 rounded text-xs gap-2">
                    <div className="text-left min-w-0 flex-grow">
                      <span className="text-[9px] text-stone-500 uppercase font-bold block truncate">Official UPI Mobile Number</span>
                      <span className="font-mono text-stone-900 text-xs font-bold tracking-wider block truncate">{MERCHANT_UPI_NUMBER}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpiNumber}
                      className="px-2.5 sm:px-3 py-1.5 bg-stone-900 hover:bg-[#825936] text-white text-[10px] font-bold uppercase rounded cursor-pointer transition-colors flex items-center gap-1.5 flex-shrink-0"
                    >
                      <FontAwesomeIcon icon={upiNumberCopied ? faCheck : faCopy} className="text-[10px]" />
                      <span>{upiNumberCopied ? 'Copied ✓' : 'Copy Number'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-stone-50 p-2.5 border border-stone-200 rounded text-xs gap-2">
                    <div className="text-left min-w-0 flex-grow">
                      <span className="text-[9px] text-stone-500 uppercase font-bold block truncate">Official UPI ID / VPA</span>
                      <span className="font-mono text-stone-800 text-[11px] font-semibold block truncate">{MERCHANT_UPI_ID}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-2.5 sm:px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-[10px] font-bold uppercase rounded cursor-pointer transition-colors flex items-center gap-1.5 flex-shrink-0"
                    >
                      <FontAwesomeIcon icon={upiCopied ? faCheck : faCopy} className="text-[10px]" />
                      <span>{upiCopied ? 'Copied ✓' : 'Copy UPI ID'}</span>
                    </button>
                  </div>
                </div>

                {/* Optional UTR Field */}
                <div className="space-y-1.5 text-left pt-1">
                  <label className="block text-[11px] font-bold uppercase text-stone-800">
                    UPI Reference / UTR Number <span className="text-stone-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 12-digit UTR from payment app (if available)"
                    value={upiTxnId}
                    onChange={(e) => setUpiTxnId(e.target.value)}
                    className="w-full text-xs font-mono bg-stone-50 border border-stone-300 rounded p-2.5 focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                  <p className="text-[10px] text-stone-500 leading-tight">
                    After making the payment in your UPI app or scanning the QR, click the button below to complete your order and send your details to WhatsApp.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('form')}
                    className="w-full sm:w-1/3 py-2.5 sm:py-3 border border-stone-300 text-stone-700 text-xs font-bold uppercase rounded cursor-pointer hover:bg-stone-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => processOrder(upiTxnId)}
                    className="w-full sm:w-2/3 py-3.5 px-3 bg-stone-900 hover:bg-[#825936] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2 text-center"
                  >
                    <FontAwesomeIcon icon={faPaperPlane} className="text-xs flex-shrink-0" />
                    <span>I Have Paid · Confirm Order</span>
                  </button>
                </div>
              </div>
            )}

            {/* SUCCESS SCREEN */}
            {currentStep === 'success' && placedOrder && (
              <div className="space-y-4 sm:space-y-5 max-w-md mx-auto text-center bg-white p-4 sm:p-6 rounded-md border border-stone-200 shadow-sm">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
                  <FontAwesomeIcon icon={faCircleCheck} className="text-xl sm:text-2xl" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Order Placed Successfully!
                  </h3>
                  <p className="text-stone-600 text-xs break-words">
                    Thank you, {placedOrder.address.fullName}! Your order <b>#{placedOrder.id}</b> is booked and saved to your account.
                  </p>
                  
                  {/* Highlighted WhatsApp Payment Screenshot Notice */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-950 text-left space-y-1 mt-2">
                    <p className="font-bold flex items-center gap-1.5 text-amber-900 text-xs">
                      <span>📸 Next Step: Share Payment Screenshot</span>
                    </p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Please share the screenshot (SS) of your completed UPI payment on WhatsApp to verify your transaction and begin packaging!
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => sendOrderToWhatsApp(placedOrder)}
                    className="w-full py-3.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wide rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md leading-tight text-center"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="text-base sm:text-lg flex-shrink-0" />
                    <span className="text-center">Send Order & Screenshot to WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onNavigateToOrders) {
                        onNavigateToOrders();
                      }
                    }}
                    className="w-full py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                  >
                    Done & View in My Orders
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY SIDEBAR (MATCHING UPLOADED IMAGE 1) */}
          <div className="lg:w-5/12 p-3.5 xs:p-4 sm:p-8 bg-[#FAF8F5] text-left space-y-5 sm:space-y-6 flex flex-col justify-between">
            
            <div className="space-y-5">
              
              {/* Cart Items List with Image Quantity Badge (Matching Image 1) */}
              <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2.5 sm:gap-3">
                    
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-grow">
                      {/* Image Thumbnail with Top-Right Count Badge (Matching Image 1) */}
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-white border border-stone-200 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute -top-1 -right-1 w-4.5 h-4.5 sm:w-5 sm:h-5 bg-stone-900 text-white rounded-full text-[9px] sm:text-[10px] font-bold flex items-center justify-center shadow-xs">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="min-w-0 flex-grow">
                        <h4 className="font-sans text-xs font-bold text-stone-900 line-clamp-1 break-words">
                          {item.product.name}
                        </h4>
                        <span className="text-[10px] text-stone-500 block truncate">
                          {item.product.weight || 'Standard Size'}
                        </span>
                      </div>
                    </div>

                    <span className="font-sans text-xs font-medium text-stone-900 flex-shrink-0 font-mono">
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Discount Code Input + Apply Button (Matching Image 1) */}
              <form onSubmit={handleApplyDiscount} className="flex gap-2 pt-2 border-t border-stone-200">
                <input
                  type="text"
                  placeholder="Discount code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="w-full min-w-0 text-xs font-sans bg-white border border-stone-300 rounded-md p-2 sm:p-2.5 focus:outline-none focus:border-stone-900 uppercase"
                />
                <button
                  type="submit"
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-md border border-stone-300 cursor-pointer transition-colors flex-shrink-0"
                >
                  Apply
                </button>
              </form>
              {discountMsg && (
                <p className={`text-[10px] ${appliedDiscount > 0 ? 'text-emerald-700 font-bold' : 'text-stone-500'}`}>
                  {discountMsg}
                </p>
              )}

              {/* Subtotal, Shipping, Total (Matching Image 1) */}
              <div className="space-y-2 pt-3 border-t border-stone-200 text-xs text-stone-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-900">₹{subtotal.toFixed(2)}</span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span>-₹{appliedDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <span>Shipping</span>
                    <FontAwesomeIcon icon={faCircleQuestion} className="text-stone-400 text-[10px]" />
                  </span>
                  <span className="text-stone-600">
                    {shipping === 0 ? <span className="text-emerald-700 font-bold uppercase text-[10px]">Free</span> : `₹${shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline font-sans text-base font-bold text-stone-900">
                  <span className="text-sm">Total</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] font-normal text-stone-500">INR</span>
                    <span className="text-lg">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Security note */}
            <div className="pt-4 border-t border-stone-200 text-[10px] text-stone-500 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faShieldHalved} className="text-[#825936]" />
              <span>Orchid Flame Verified Official Checkout</span>
            </div>

          </div>

        </div>

      </motion.div>
    </div>
  );
};
