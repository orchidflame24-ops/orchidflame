import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, 
  faUser, 
  faBagShopping, 
  faLocationDot, 
  faArrowRightFromBracket,
  faFileInvoice,
  faBan,
  faCircleCheck,
  faClock,
  faTruckFast,
  faBoxOpen
} from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { UserProfile, Order, OrderAddress } from '../types';
import { signInWithGoogle, signInWithEmail, signOutUser, saveStoredUserProfile, isValidEmail } from '../services/firebase';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
  orders: Order[];
  onCancelOrder: (orderId: string, reason?: string) => void;
  onViewInvoice: (order: Order) => void;
  onNavigateToProfile?: () => void;
  checkoutIntent?: boolean;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserChange,
  orders,
  onCancelOrder,
  onViewInvoice,
  onNavigateToProfile,
  checkoutIntent = false,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'address'>('orders');
  
  // Auth Form State
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  // Address edit state
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addrName, setAddrName] = useState(user?.savedAddress?.fullName || user?.displayName || '');
  const [addrPhone, setAddrPhone] = useState(user?.savedAddress?.phone || '');
  const [addrStreet, setAddrStreet] = useState(user?.savedAddress?.addressLine1 || '');
  const [addrCity, setAddrCity] = useState(user?.savedAddress?.city || 'Delhi');
  const [addrState, setAddrState] = useState(user?.savedAddress?.state || 'Delhi');
  const [addrPin, setAddrPin] = useState(user?.savedAddress?.pincode || '110030');

  // Confirmation Modals State
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setAuthError('');
      const profile = await signInWithGoogle();
      onUserChange(profile);
      setLoading(false);
      onClose();
      if (onNavigateToProfile && !checkoutIntent) onNavigateToProfile();
    } catch (err: any) {
      setLoading(false);
      // Clean cancellation: user dismissed Google popup. Do not set fake user or show error.
      if (err?.message === 'Sign in was cancelled.') {
        return;
      }
      setAuthError(err?.message || 'Sign in could not be completed. Please try again.');
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const cleanEmail = emailInput.trim();
    if (!cleanEmail) {
      setAuthError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setAuthError('Please enter a valid email address (e.g., name@example.com).');
      return;
    }
    try {
      setLoading(true);
      const profile = await signInWithEmail(cleanEmail, nameInput);
      onUserChange(profile);
      setLoading(false);
      onClose();
      if (onNavigateToProfile && !checkoutIntent) onNavigateToProfile();
    } catch (err: any) {
      setAuthError(err?.message || 'Failed to sign in. Please verify your details.');
      setLoading(false);
    }
  };

  const handleSignOutConfirmed = async () => {
    await signOutUser();
    onUserChange(null);
    setConfirmSignOut(false);
    onClose();
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updatedAddress: OrderAddress = {
      fullName: addrName,
      phone: addrPhone,
      email: user.email,
      addressLine1: addrStreet,
      city: addrCity,
      state: addrState,
      pincode: addrPin,
      addressType: 'home',
    };

    const updatedProfile: UserProfile = {
      ...user,
      savedAddress: updatedAddress,
    };

    saveStoredUserProfile(updatedProfile);
    onUserChange(updatedProfile);
    setIsEditingAddress(false);
  };

  const handleCancelOrderConfirmed = () => {
    if (orderToCancel) {
      onCancelOrder(orderToCancel.id, 'Cancelled by customer from profile dashboard');
      setOrderToCancel(null);
    }
  };

  // Filter orders for user (or all if email matches, fallback to all local customer orders)
  const userOrders = user 
    ? orders.filter((o) => !o.address.email || o.address.email.toLowerCase() === user.email.toLowerCase() || orders.length <= 5)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
      <div className={`relative w-full ${!user ? 'max-w-3xl' : 'max-w-2xl'} bg-white border-0 sm:border border-stone-300 shadow-2xl rounded-none sm:rounded-md overflow-hidden my-auto h-full sm:h-auto sm:max-h-[94vh] flex flex-col text-left`}>
        
        {/* If Logged In: Show Clean Minimal Top Bar */}
        {user && (
          <div className="bg-[#FAF8F5] text-stone-900 px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between border-b border-stone-200 flex-shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full border border-stone-300 overflow-hidden flex-shrink-0">
                <img src="/orchid-flame-logo.png" alt="Orchid Flame" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <span className="font-serif text-xs sm:text-sm font-semibold tracking-wide text-stone-900 block truncate">
                  {user.displayName}
                </span>
                <span className="text-[10px] text-stone-500 font-mono block truncate">
                  {user.email}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-900 transition-colors cursor-pointer flex-shrink-0"
              aria-label="Close Profile"
            >
              <FontAwesomeIcon icon={faXmark} className="text-base" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className={`overflow-y-auto flex-grow ${!user ? 'p-0' : 'p-4 sm:p-6 space-y-5 sm:space-y-6'}`}>
          
          {/* 1. NOT LOGGED IN STATE - MATCHING USER'S UPLOADED IMAGE */}
          {!user ? (
            <div className="flex flex-col md:flex-row min-h-[460px]">
              
              {/* Left Column: Ambient Luxury Candle Photography */}
              <div className="md:w-1/2 relative bg-stone-900 hidden md:block overflow-hidden min-h-[460px]">
                <img
                  src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85"
                  alt="Orchid Flame Ambiance"
                  className="w-full h-full object-cover opacity-90 scale-102 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/30" />
                <div className="absolute bottom-8 left-8 right-8 text-white space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-[#C29B64] font-bold block">
                    Hand-Poured Soy Wax
                  </span>
                  <p className="font-serif text-lg font-bold">
                    Orchid Flame Luxury Home Fragrances
                  </p>
                  <p className="text-[11px] text-stone-300 leading-relaxed font-sans">
                    Pure botanical oils, heritage brass bowls, and mindful olfactory indulgence.
                  </p>
                </div>
              </div>

              {/* Right Column: Clean Minimalist Auth Card Matching Uploaded Image */}
              <div className="md:w-1/2 p-6 sm:p-10 flex flex-col justify-between bg-white relative">
                
                {/* Close Button top-right */}
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-900 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-lg" />
                </button>

                <div className="space-y-6 pt-2">
                  
                  {checkoutIntent && (
                    <div className="p-3 bg-amber-50 border border-amber-200/90 rounded-md text-amber-950 text-xs flex items-center gap-2.5 shadow-2xs">
                      <FontAwesomeIcon icon={faBagShopping} className="text-[#825936] text-sm flex-shrink-0" />
                      <div>
                        <span className="font-bold block">Sign In Required to Place Order</span>
                        <span className="text-[11px] text-amber-800">Please sign in or create an account to proceed with your order and unlock live dispatch tracking.</span>
                      </div>
                    </div>
                  )}

                  {/* Header Text matching image */}
                  <div className="space-y-2 text-center md:text-left pr-4">
                    <h2 className="font-serif text-2xl sm:text-3xl text-[#7E5738] font-normal leading-tight">
                      {checkoutIntent ? (
                        <>Sign In to Place<br />Your Order</>
                      ) : (
                        <>Exclusive Access<br />Awaits</>
                      )}
                    </h2>
                    <p className="text-stone-600 text-xs sm:text-[13px] leading-relaxed">
                      {checkoutIntent
                        ? 'Sign in with your email or Google account to continue to checkout and complete your payment.'
                        : 'Be the first to discover new products, design collaborations, and curated gifting.'}
                    </p>
                  </div>

                  {authError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded text-left">
                      {authError}
                    </div>
                  )}

                  {/* Form matching uploaded screenshot */}
                  <form onSubmit={handleEmailSignIn} className="space-y-3.5">
                    
                    {/* Name input */}
                    <div>
                      <input
                        type="text"
                        placeholder="Name (Optional)"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full text-xs font-sans bg-white border border-stone-300 rounded p-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all"
                      />
                    </div>

                    {/* Email input */}
                    <div>
                      <input
                        type="email"
                        required
                        placeholder="Email address (e.g. patron@example.com)"
                        value={emailInput}
                        onChange={(e) => {
                          setEmailInput(e.target.value);
                          if (authError) setAuthError('');
                        }}
                        className="w-full text-xs font-sans bg-white border border-stone-300 rounded p-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-[#202020] hover:bg-stone-900 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer shadow-md mt-1"
                    >
                      {loading ? 'Processing...' : 'Continue with Email'}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-2">
                    <div className="h-px bg-stone-200 flex-grow" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400">or</span>
                    <div className="h-px bg-stone-200 flex-grow" />
                  </div>

                  {/* Google Sign In Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-3 bg-white hover:bg-stone-50 border border-stone-300 hover:border-stone-800 text-stone-800 text-xs font-bold tracking-wider rounded transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-2xs"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  {/* Microtext footer matching uploaded image */}
                  <p className="text-[10px] text-stone-500 leading-normal text-center pt-2">
                    By signing up, you agree to receive promotional text messages or emails. View our privacy policy and terms of service for more info.
                  </p>
                </div>

              </div>

            </div>
          ) : (
            
            /* 2. LOGGED IN PROFILE WORKSPACE */
            <div className="space-y-6">
              
              {/* Profile Card Header */}
              <div className="bg-stone-50 border border-stone-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-11 h-11 rounded-full object-cover border border-stone-300" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-stone-100 border border-stone-300 text-stone-700 font-serif font-bold text-base flex items-center justify-center">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-serif text-base font-normal text-stone-900">
                      {user.displayName}
                    </h3>
                    <span className="text-xs text-stone-500 font-mono block">
                      {user.email}
                    </span>
                  </div>
                </div>

                {onNavigateToProfile && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToProfile();
                    }}
                    className="px-3.5 py-1.5 border border-stone-300 hover:border-stone-900 text-stone-800 text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    View Account Page
                  </button>
                )}
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-stone-200 gap-4 text-xs font-bold uppercase tracking-wider">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`pb-2.5 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                    activeTab === 'orders'
                      ? 'border-stone-900 text-stone-900'
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  <FontAwesomeIcon icon={faBagShopping} />
                  <span>My Orders ({userOrders.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('address')}
                  className={`pb-2.5 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                    activeTab === 'address'
                      ? 'border-stone-900 text-stone-900'
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  <FontAwesomeIcon icon={faLocationDot} />
                  <span>Saved Address</span>
                </button>
              </div>

              {/* TAB 1: ORDERS LIST WITH CANCEL AND INVOICE */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {userOrders.length === 0 ? (
                    <div className="text-center py-12 space-y-2 border border-dashed border-stone-300 p-6 bg-stone-50">
                      <FontAwesomeIcon icon={faBoxOpen} className="text-3xl text-stone-400" />
                      <h4 className="font-serif text-base font-bold text-stone-800">No Orders Yet</h4>
                      <p className="text-stone-500 text-xs">
                        When you order candles from our boutique, your dispatch updates and downloadable invoices will appear right here.
                      </p>
                    </div>
                  ) : (
                    userOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="border border-stone-200 bg-white p-4 space-y-3 shadow-xs text-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                          <div>
                            <span className="font-mono font-bold text-stone-900 text-sm">
                              #{ord.id}
                            </span>
                            <span className="text-stone-400 text-[11px] ml-2">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {ord.status === 'cancelled' ? (
                              <span className="bg-red-100 text-red-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1">
                                <FontAwesomeIcon icon={faBan} />
                                <span>Order Cancelled</span>
                              </span>
                            ) : ord.status === 'delivered' ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1">
                                <FontAwesomeIcon icon={faCircleCheck} />
                                <span>Delivered</span>
                              </span>
                            ) : ord.status === 'dispatched' ? (
                              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1">
                                <FontAwesomeIcon icon={faTruckFast} />
                                <span>Dispatched</span>
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1">
                                <FontAwesomeIcon icon={faClock} />
                                <span>Order Booked</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-1.5 py-1">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-stone-700">
                              <span>
                                <b>{item.quantity}x</b> {item.product.name}
                              </span>
                              <span className="font-mono">
                                ₹{item.product.price * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Order Totals & Action Buttons */}
                        <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="text-stone-900">
                            <span>Total: </span>
                            <span className="font-mono font-bold text-sm">₹{ord.grandTotal}</span>
                            <span className="text-[10px] text-stone-500 ml-2">
                              ({ord.paymentMethod === 'upi' ? `UPI Online` : 'Cash on Delivery'})
                            </span>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <button
                              onClick={() => onViewInvoice(ord)}
                              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <FontAwesomeIcon icon={faFileInvoice} className="text-xs" />
                              <span>Tax Invoice</span>
                            </button>

                            {ord.status !== 'cancelled' && ord.status !== 'delivered' && (
                              <button
                                onClick={() => setOrderToCancel(ord)}
                                className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <FontAwesomeIcon icon={faBan} className="text-xs" />
                                <span>Cancel Order</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: SAVED ADDRESS */}
              {activeTab === 'address' && (
                <div className="space-y-4">
                  {user.savedAddress && !isEditingAddress ? (
                    <div className="border border-stone-200 p-4 bg-stone-50/70 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-stone-900 text-sm">
                          {user.savedAddress.fullName}
                        </span>
                        <button
                          onClick={() => setIsEditingAddress(true)}
                          className="text-[#825936] hover:underline font-bold text-xs cursor-pointer"
                        >
                          Edit Address
                        </button>
                      </div>
                      <p className="text-stone-700">{user.savedAddress.addressLine1}</p>
                      <p className="text-stone-700">{user.savedAddress.city}, {user.savedAddress.state} - {user.savedAddress.pincode}</p>
                      <p className="text-stone-500 font-mono">Phone: +91 {user.savedAddress.phone}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveAddress} className="space-y-3 text-xs border border-stone-200 p-4 bg-white">
                      <h4 className="font-serif font-bold text-stone-900 text-sm mb-2">
                        {isEditingAddress ? 'Update Delivery Sanctuary' : 'Save Default Delivery Address'}
                      </h4>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            value={addrName}
                            onChange={(e) => setAddrName(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-300 rounded p-2"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 mb-1">Contact Phone</label>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={addrPhone}
                            onChange={(e) => setAddrPhone(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-300 rounded p-2"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">Street Address</label>
                        <input
                          type="text"
                          required
                          value={addrStreet}
                          onChange={(e) => setAddrStreet(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-300 rounded p-2"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                        <div className="min-w-0">
                          <label className="block text-[11px] font-bold text-stone-700 mb-1">City</label>
                          <input
                            type="text"
                            required
                            value={addrCity}
                            onChange={(e) => setAddrCity(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-300 rounded p-2 text-xs"
                          />
                        </div>

                        <div className="min-w-0">
                          <label className="block text-[11px] font-bold text-stone-700 mb-1">State</label>
                          <input
                            type="text"
                            required
                            value={addrState}
                            onChange={(e) => setAddrState(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-300 rounded p-2 text-xs"
                          />
                        </div>

                        <div className="min-w-0">
                          <label className="block text-[11px] font-bold text-stone-700 mb-1">PIN Code</label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            value={addrPin}
                            onChange={(e) => setAddrPin(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-300 rounded p-2 font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        {isEditingAddress && (
                          <button
                            type="button"
                            onClick={() => setIsEditingAddress(false)}
                            className="px-4 py-2 border border-stone-300 rounded cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="submit"
                          className="px-6 py-2 bg-stone-900 hover:bg-[#825936] text-white font-bold rounded cursor-pointer transition-colors"
                        >
                          Save Address
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Understated Minimal Sign Out at Bottom */}
              <div className="pt-6 border-t border-stone-200 text-center space-y-2">
                <p className="text-[11px] text-stone-400">Signed in as {user.email}</p>
                <button
                  type="button"
                  onClick={() => setConfirmSignOut(true)}
                  className="px-5 py-2 border border-stone-300 hover:border-stone-400 text-stone-600 hover:text-stone-900 bg-white text-xs uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faArrowRightFromBracket} className="text-xs text-stone-400" />
                  <span>Sign Out</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* INBUILT CONFIRMATION MODAL: SIGN OUT (PLAIN & MINIMAL) */}
      {confirmSignOut && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-2xs">
          <div className="bg-[#FAF8F5] border border-stone-300 p-6 max-w-sm w-full space-y-4 shadow-xl text-left">
            <div className="space-y-1 border-b border-stone-200 pb-2.5">
              <h3 className="font-serif text-base font-semibold text-stone-900">Sign Out</h3>
              <p className="text-stone-500 text-xs">
                Are you sure you want to sign out of your account?
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmSignOut(false)}
                className="w-1/2 py-2 border border-stone-300 text-stone-700 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignOutConfirmed}
                className="w-1/2 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INBUILT CONFIRMATION MODAL: CANCEL ORDER */}
      {orderToCancel && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-2xs">
          <div className="bg-white border-2 border-stone-300 p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-700">
              <FontAwesomeIcon icon={faBan} className="text-lg" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-stone-900">Cancel Order #{orderToCancel.id}?</h3>
              <p className="text-stone-600 text-xs">
                Are you sure you wish to cancel this order? This action will immediately void the booking.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                className="w-1/2 py-2.5 border border-stone-300 text-stone-700 text-xs font-bold uppercase rounded cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelOrderConfirmed}
                className="w-1/2 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase rounded transition-colors cursor-pointer"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
