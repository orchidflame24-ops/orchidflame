import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faBagShopping, 
  faTruckFast, 
  faLocationDot, 
  faHeart, 
  faHeadset, 
  faArrowRightFromBracket,
  faFileInvoice,
  faCircleCheck,
  faBoxOpen,
  faPaperPlane,
  faXmark,
  faPenToSquare,
  faCheck,
  faPhone,
  faEnvelope,
  faMapPin,
  faPlus,
  faArrowRight,
  faArrowLeft,
  faBan,
  faClock,
  faBars
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Order, OrderAddress, Product } from '../types';
import { signOutUser } from '../services/firebase';

interface ProfileViewProps {
  user: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
  orders: Order[];
  onCancelOrder: (orderId: string, reason?: string) => void;
  onViewInvoice: (order: Order) => void;
  onNavigate: (view: 'home' | 'shop' | 'about' | 'contact') => void;
  onOpenAuthModal: () => void;
  wishlist?: Product[];
  onAddToCart?: (product: Product, quantity: number, size?: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUserChange,
  orders,
  onCancelOrder,
  onViewInvoice,
  onNavigate,
  onOpenAuthModal,
  wishlist = [],
  onAddToCart,
}) => {
  // Navigation Tabs matching reference: 'overview' | 'orders' | 'addresses' | 'wishlist' | 'concierge'
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'wishlist' | 'concierge'>('orders');
  
  // Orders Sub-filter: 'all' | 'active' | 'delivered' | 'cancelled'
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');

  // Selected Order for Individual Inspection (Card -> Individual Detail View)
  const [selectedDetailOrderId, setSelectedDetailOrderId] = useState<string | null>(null);

  // Modals & Confirmation States
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of delivery plans');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Profile Edit State
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Address Edit State
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [addrName, setAddrName] = useState(user?.savedAddress?.fullName || user?.displayName || '');
  const [addrPhone, setAddrPhone] = useState(user?.savedAddress?.phone || user?.phone || '');
  const [addrLine, setAddrLine] = useState(user?.savedAddress?.addressLine1 || '');
  const [addrCity, setAddrCity] = useState(user?.savedAddress?.city || 'Delhi');
  const [addrState, setAddrState] = useState(user?.savedAddress?.state || 'Delhi');
  const [addrPin, setAddrPin] = useState(user?.savedAddress?.pincode || '110030');

  // Filtered orders
  const activeOrders = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'delivered');
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled');

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'active') return o.status !== 'cancelled' && o.status !== 'delivered';
    if (orderFilter === 'delivered') return o.status === 'delivered';
    if (orderFilter === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  const handleSignOutConfirm = async () => {
    await signOutUser();
    onUserChange(null);
    setConfirmSignOut(false);
    onNavigate('home');
  };

  const handleConfirmCancelOrder = () => {
    if (orderToCancel) {
      onCancelOrder(orderToCancel.id, cancelReason);
      setOrderToCancel(null);
    }
  };

  const handleSavePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      displayName: editName.trim() || user.displayName,
      phone: editPhone.trim() || user.phone,
    };
    onUserChange(updated);
    setIsEditingInfo(false);
    setProfileSuccessMsg('Personal information updated successfully.');
    setTimeout(() => setProfileSuccessMsg(''), 3000);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updatedAddress: OrderAddress = {
      fullName: addrName.trim() || user.displayName,
      phone: addrPhone.trim() || '9876543210',
      email: user.email,
      addressLine1: addrLine.trim(),
      city: addrCity.trim(),
      state: addrState.trim(),
      pincode: addrPin.trim(),
      addressType: 'home',
    };
    const updatedProfile: UserProfile = {
      ...user,
      displayName: addrName.trim() || user.displayName,
      phone: addrPhone.trim() || user.phone,
      savedAddress: updatedAddress,
    };
    onUserChange(updatedProfile);
    setIsEditingAddress(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase() || 'P';
  };

  // 1. GUEST / UNAUTHENTICATED STATE
  if (!user) {
    return (
      <div className="min-h-[75vh] bg-[#FAF8F5] bg-candle-wallpaper-faint py-12 px-4 sm:px-6 flex items-center justify-center text-left">
        <div className="max-w-md w-full bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-10 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border border-stone-200 bg-[#FAF8F5] p-1">
            <img src="/orchid-flame-logo.png" alt="Orchid Flame" className="w-full h-full object-cover rounded-full" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#825936] font-semibold block">
              Patron Sanctuary Access
            </span>
            <h1 className="font-serif text-2xl text-stone-900 font-bold">
              Sign In to Your Account
            </h1>
            <p className="text-stone-600 text-xs leading-relaxed max-w-sm mx-auto">
              View your active orders, real-time courier dispatch status, download official tax invoices, and manage saved shipping addresses.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={onOpenAuthModal}
              className="w-full py-3 bg-[#1C2A1E] hover:bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <FontAwesomeIcon icon={faUser} className="text-xs" />
              <span>Sign In with Email or Google</span>
            </button>

            <button
              onClick={() => onNavigate('shop')}
              className="w-full py-2.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold uppercase tracking-wider transition-colors border border-stone-300 rounded-full cursor-pointer"
            >
              Explore Fragrance Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Current primary address display
  const primaryCity = user.savedAddress?.city || addrCity || 'Delhi';
  const primaryState = user.savedAddress?.state || addrState || 'Delhi';
  const primaryPin = user.savedAddress?.pincode || addrPin || '110035';

  return (
    <div className="bg-[#FAF8F5] bg-candle-wallpaper-faint text-stone-900 text-left py-8 sm:py-10 px-4 sm:px-6 lg:px-8 pb-16">
      <div className="max-w-6xl mx-auto">
        
        {/* Mobile Profile Navigation Header (Hides ugly stacked menu from top of phone UI) */}
        <div className="lg:hidden mb-5 space-y-3">
          <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {user.photoURL ? (
                <div className="w-10 h-10 rounded-full overflow-hidden border border-stone-200 flex-shrink-0">
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#1C2A1E] text-white flex items-center justify-center font-serif text-sm font-bold flex-shrink-0">
                  {getInitials(user.displayName)}
                </div>
              )}
              <div className="min-w-0">
                <h3 className="font-serif text-sm font-bold text-stone-900 truncate">{user.displayName}</h3>
                <p className="text-[11px] text-stone-500 truncate">Delivering to {primaryCity}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="px-3.5 py-1.5 bg-[#1C2A1E] hover:bg-stone-900 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer flex-shrink-0"
            >
              <FontAwesomeIcon icon={faBars} className="text-xs" />
              <span>Menu</span>
            </button>
          </div>

          {/* Quick horizontal tab pills for mobile */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#1C2A1E] text-white shadow-2xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              My Orders {activeOrders.length > 0 && `(${activeOrders.length})`}
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#1C2A1E] text-white shadow-2xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              Personal Info
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'addresses'
                  ? 'bg-[#1C2A1E] text-white shadow-2xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              Addresses
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'wishlist'
                  ? 'bg-[#1C2A1E] text-white shadow-2xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              Saved ({wishlist.length})
            </button>
            <button
              onClick={() => setActiveTab('concierge')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'concierge'
                  ? 'bg-[#1C2A1E] text-white shadow-2xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              Concierge
            </button>
          </div>
        </div>

        {/* Mobile Slide-In Side Drawer (Hiding menu in side on phone UI) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black z-50 lg:hidden backdrop-blur-2xs"
              />

              {/* Drawer Container */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                className="fixed top-0 bottom-0 left-0 w-[85%] max-w-xs bg-[#FAF8F5] bg-candle-wallpaper-faint z-50 lg:hidden p-5 overflow-y-auto space-y-4 shadow-2xl border-r border-stone-300 text-left"
              >
                {/* Drawer Close Button */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <span className="font-serif text-sm font-bold text-stone-900 uppercase tracking-wider">
                    Profile Navigation
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-base" />
                  </button>
                </div>

                {/* Identity Card inside drawer */}
                <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-stone-200 flex-shrink-0">
                        <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#1C2A1E] text-white flex items-center justify-center font-serif text-lg font-bold flex-shrink-0">
                        {getInitials(user.displayName)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-serif text-base font-bold text-stone-900 truncate">{user.displayName}</h3>
                      <p className="text-stone-500 text-xs font-mono truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="bg-[#F5F2EC] rounded-xl p-2.5 text-xs text-stone-700 flex items-start gap-2">
                    <FontAwesomeIcon icon={faMapPin} className="text-[#825936] text-xs mt-0.5" />
                    <div>
                      <span className="text-stone-500">Delivering to </span>
                      <b className="text-stone-900">{primaryCity}</b>
                      <span className="text-stone-600 block text-[11px]">{primaryState} {primaryPin}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('overview');
                      setIsEditingInfo(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 border border-stone-300 text-stone-800 text-xs font-semibold rounded-full hover:bg-stone-50 transition-colors text-center cursor-pointer"
                  >
                    Edit profile
                  </button>
                </div>

                {/* Menu list inside drawer */}
                <div className="bg-white border border-stone-200/90 rounded-2xl p-2.5 shadow-xs space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('orders');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs font-medium rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                      activeTab === 'orders' ? 'bg-[#1C2A1E] text-white font-semibold' : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faTruckFast} className="text-xs" />
                      <span>My Orders</span>
                    </div>
                    {activeOrders.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {activeOrders.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('overview');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs font-medium rounded-xl flex items-center gap-3 transition-colors cursor-pointer ${
                      activeTab === 'overview' ? 'bg-[#1C2A1E] text-white font-semibold' : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <FontAwesomeIcon icon={faUser} className="text-xs" />
                    <span>Personal Info</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('addresses');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs font-medium rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                      activeTab === 'addresses' ? 'bg-[#1C2A1E] text-white font-semibold' : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faLocationDot} className="text-xs" />
                      <span>Addresses</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                      1
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('wishlist');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs font-medium rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                      activeTab === 'wishlist' ? 'bg-[#1C2A1E] text-white font-semibold' : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faHeart} className="text-xs" />
                      <span>Saved Fragrances</span>
                    </div>
                    {wishlist.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                        {wishlist.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('concierge');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs font-medium rounded-xl flex items-center gap-3 transition-colors cursor-pointer ${
                      activeTab === 'concierge' ? 'bg-[#1C2A1E] text-white font-semibold' : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <FontAwesomeIcon icon={faHeadset} className="text-xs" />
                    <span>Concierge & Help</span>
                  </button>

                  <div className="pt-2 mt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setConfirmSignOut(true);
                      }}
                      className="w-full px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                    >
                      <FontAwesomeIcon icon={faArrowRightFromBracket} className="text-xs" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Responsive 2-Column Grid Matching Reference Screenshots */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: PATRON PROFILE CARD & NAVIGATION MENU (DESKTOP) */}
          {/* ======================================================== */}
          <div className="hidden lg:flex lg:flex-col lg:col-span-4 w-full sticky top-28 self-start z-20 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-none">
            
            {/* Card 1: User Identity Card (Matching Reference 1, 2, 3) */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs text-left space-y-4">
              <div className="flex items-center gap-3.5">
                {user.photoURL ? (
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full overflow-hidden border border-stone-200 flex-shrink-0">
                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#1C2A1E] text-white flex items-center justify-center font-serif text-xl font-bold flex-shrink-0">
                    {getInitials(user.displayName)}
                  </div>
                )}

                <div className="space-y-0.5 min-w-0">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-tight truncate">
                    {user.displayName}
                  </h2>
                  <p className="text-stone-500 text-xs font-mono truncate">{user.email}</p>
                </div>
              </div>

              {/* Soft Beige Delivery Info Capsule (Matching Reference) */}
              <div className="bg-[#F5F2EC] rounded-xl p-3 sm:p-3.5 flex items-start gap-2.5 text-xs text-stone-700">
                <FontAwesomeIcon icon={faMapPin} className="text-[#825936] text-xs mt-0.5 flex-shrink-0" />
                <div className="leading-snug">
                  <span className="text-stone-500">Delivering to </span>
                  <span className="font-bold text-stone-900">{primaryCity}</span>
                  <span className="text-stone-600 block text-[11px]">{primaryState} {primaryPin}</span>
                </div>
              </div>

              {/* Edit Profile Outline Pill Button */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('overview');
                  setIsEditingInfo(true);
                }}
                className="w-full py-2 border border-stone-300 hover:border-stone-800 text-stone-800 text-xs font-semibold rounded-full transition-colors cursor-pointer text-center"
              >
                Edit profile
              </button>
            </div>

            {/* Card 2: Navigation Menu List (Matching Reference 1, 2, 3) */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-3 shadow-xs space-y-1">
              
              {/* Overview / Personal Info */}
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full px-4 py-2.5 text-xs font-medium rounded-xl flex items-center gap-3 transition-colors cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#1C2A1E] text-white font-semibold shadow-xs'
                    : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <FontAwesomeIcon icon={faUser} className="text-xs" />
                <span>Overview</span>
              </button>

              {/* My Orders */}
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full px-4 py-2.5 text-xs font-medium rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-[#1C2A1E] text-white font-semibold shadow-xs'
                    : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faTruckFast} className="text-xs" />
                  <span>My Orders</span>
                </div>
                {activeOrders.length > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {activeOrders.length}
                  </span>
                )}
              </button>

              {/* Addresses */}
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full px-4 py-2.5 text-xs font-medium rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'addresses'
                    ? 'bg-[#1C2A1E] text-white font-semibold shadow-xs'
                    : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faLocationDot} className="text-xs" />
                  <span>Addresses</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'addresses' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                }`}>
                  1
                </span>
              </button>

              {/* Saved Fragrances */}
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full px-4 py-2.5 text-xs font-medium rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'wishlist'
                    ? 'bg-[#1C2A1E] text-white font-semibold shadow-xs'
                    : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faHeart} className="text-xs" />
                  <span>Saved Fragrances</span>
                </div>
                {wishlist.length > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'wishlist' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Concierge & Care */}
              <button
                onClick={() => setActiveTab('concierge')}
                className={`w-full px-4 py-2.5 text-xs font-medium rounded-xl flex items-center gap-3 transition-colors cursor-pointer ${
                  activeTab === 'concierge'
                    ? 'bg-[#1C2A1E] text-white font-semibold shadow-xs'
                    : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <FontAwesomeIcon icon={faHeadset} className="text-xs" />
                <span>Concierge & Help</span>
              </button>

              {/* Understated Minimal Sign Out at bottom of menu (Matching Reference 1, 2, 3) */}
              <div className="pt-2 mt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setConfirmSignOut(true)}
                  className="w-full px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 hover:text-red-900 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                >
                  <FontAwesomeIcon icon={faArrowRightFromBracket} className="text-xs" />
                  <span>Sign out</span>
                </button>
              </div>

            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: MAIN CONTENT PANEL (NO OVERLAPPING)         */}
          {/* ======================================================== */}
          <div className="lg:col-span-8 w-full space-y-6">
            
            {/* ------------------------------------------------------ */}
            {/* TAB 1: OVERVIEW / PERSONAL INFORMATION (REFERENCE 2)    */}
            {/* ------------------------------------------------------ */}
            {activeTab === 'overview' && (
              <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 text-left">
                
                {/* Header (Matching Reference 2) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                      Personal Information
                    </h2>
                    <p className="text-stone-500 text-xs mt-0.5">
                      Your name, email and phone number.
                    </p>
                  </div>

                  {!isEditingInfo && (
                    <button
                      type="button"
                      onClick={() => setIsEditingInfo(true)}
                      className="px-5 py-2 bg-[#1C2A1E] hover:bg-stone-900 text-white text-xs font-semibold rounded-full transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
                    >
                      Edit Info
                    </button>
                  )}
                </div>

                {profileSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                {!isEditingInfo ? (
                  /* 4 Rounded Info Capsule Boxes in 2x2 Grid (Matching Reference 2) */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Box 1: Full Display Name */}
                    <div className="bg-[#F7F4EE] border border-stone-200/70 p-4 sm:p-5 rounded-2xl space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block">
                        FULL DISPLAY NAME
                      </span>
                      <p className="font-serif text-base font-bold text-stone-900">
                        {user.displayName}
                      </p>
                    </div>

                    {/* Box 2: Primary Email */}
                    <div className="bg-[#F7F4EE] border border-stone-200/70 p-4 sm:p-5 rounded-2xl space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block">
                        PRIMARY EMAIL
                      </span>
                      <p className="font-mono text-xs sm:text-sm font-medium text-stone-800 break-all">
                        {user.email}
                      </p>
                    </div>

                    {/* Box 3: Mobile Phone Number */}
                    <div className="bg-[#F7F4EE] border border-stone-200/70 p-4 sm:p-5 rounded-2xl space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block">
                        MOBILE PHONE NUMBER
                      </span>
                      <p className="text-sm font-sans font-medium text-stone-900">
                        {user.phone || 'Not added yet'}
                      </p>
                    </div>

                    {/* Box 4: Member Since */}
                    <div className="bg-[#F7F4EE] border border-stone-200/70 p-4 sm:p-5 rounded-2xl space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block">
                        MEMBER SINCE
                      </span>
                      <p className="text-sm font-serif font-medium text-stone-900">
                        October 2026
                      </p>
                    </div>

                  </div>
                ) : (
                  /* Edit Personal Info Form */
                  <form onSubmit={handleSavePersonalInfo} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1 text-[11px]">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl p-3 text-xs focus:outline-none focus:border-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1 text-[11px]">
                        Mobile Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        placeholder="e.g. +91 90260 06766"
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl p-3 text-xs focus:outline-none focus:border-stone-900"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingInfo(false)}
                        className="px-5 py-2 border border-stone-300 text-stone-700 text-xs font-semibold rounded-full hover:bg-stone-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#1C2A1E] hover:bg-stone-900 text-white text-xs font-semibold rounded-full transition-colors cursor-pointer shadow-xs"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}

              </div>
            )}

            {/* ------------------------------------------------------ */}
            {/* TAB 2: MY ORDERS & VERTICAL TRACKING (REFERENCE 1)     */}
            {/* ------------------------------------------------------ */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                
                {/* Header Card (Matching Reference 1) */}
                <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs text-left space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#F5F2EC] text-[#825936] flex items-center justify-center">
                        <FontAwesomeIcon icon={faTruckFast} className="text-sm" />
                      </div>
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                        My Orders & Shipments
                      </h2>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                      <button
                        onClick={() => setOrderFilter('all')}
                        className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                          orderFilter === 'all' ? 'bg-[#1C2A1E] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        All ({orders.length})
                      </button>
                      <button
                        onClick={() => setOrderFilter('active')}
                        className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                          orderFilter === 'active' ? 'bg-[#1C2A1E] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        Active ({activeOrders.length})
                      </button>
                      <button
                        onClick={() => setOrderFilter('delivered')}
                        className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                          orderFilter === 'delivered' ? 'bg-[#1C2A1E] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        Delivered ({deliveredOrders.length})
                      </button>
                      {cancelledOrders.length > 0 && (
                        <button
                          onClick={() => setOrderFilter('cancelled')}
                          className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                            orderFilter === 'cancelled' ? 'bg-[#1C2A1E] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          Cancelled ({cancelledOrders.length})
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-stone-500 text-xs">
                    Monitor real-time dispatch, transit milestones, courier AWB, and doorstep delivery for all your fragrance orders.
                  </p>
                </div>

                {/* Empty State Card (Matching Reference 1 exactly) */}
                {filteredOrders.length === 0 ? (
                  <div className="bg-[#F7F4EE] border border-stone-200/70 rounded-3xl p-8 sm:p-14 text-center space-y-4 shadow-2xs">
                    <div className="w-16 h-16 rounded-full bg-stone-200/70 text-stone-600 flex items-center justify-center mx-auto text-2xl">
                      <FontAwesomeIcon icon={faBoxOpen} />
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                        No Orders Yet
                      </h3>
                      <p className="text-stone-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                        Looks like you haven't placed any fragrance orders yet. Start browsing our curated artisanal collection and bring fragrance to your doorstep.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onNavigate('shop')}
                      className="px-6 py-2.5 bg-[#1C2A1E] hover:bg-stone-900 text-white text-xs font-semibold rounded-full transition-colors cursor-pointer inline-flex items-center gap-2 shadow-sm"
                    >
                      <span>Start Browsing</span>
                      <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                    </button>
                  </div>
                ) : selectedDetailOrderId && orders.find((o) => o.id === selectedDetailOrderId) ? (
                  /* ======================================================== */
                  /* INDIVIDUAL ORDER DETAIL INSPECTION VIEW                  */
                  /* ======================================================== */
                  (() => {
                    const ord = orders.find((o) => o.id === selectedDetailOrderId)!;
                    const isDelivered = ord.status === 'delivered';
                    const isDispatched = ord.status === 'dispatched' || isDelivered;
                    const isProcessing = ord.status === 'processing' || isDispatched;
                    const isCancelled = ord.status === 'cancelled';

                    return (
                      <div className="space-y-5 text-left">
                        
                        {/* Top Back Navigation Bar */}
                        <div className="flex items-center justify-between bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailOrderId(null)}
                            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-800 hover:text-stone-950 transition-colors cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                            <span>Back to All Orders</span>
                          </button>
                          <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
                            Order #{ord.id}
                          </span>
                        </div>

                        {/* Order Detail Card */}
                        <div className={`bg-white border rounded-2xl p-5 sm:p-7 shadow-xs space-y-6 ${
                          isCancelled ? 'border-stone-300 filter grayscale opacity-85' : 'border-stone-200/90'
                        }`}>
                          
                          {/* Order Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                                  Order #{ord.id}
                                </h3>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                  isCancelled ? 'bg-stone-300 text-stone-700 border border-stone-400' :
                                  isDelivered ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                  isDispatched ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                                  'bg-[#F5F2EC] text-stone-800'
                                }`}>
                                  {isCancelled ? 'Cancelled' : isDelivered ? 'Delivered' : isDispatched ? 'Dispatched' : 'In Fulfillment'}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-stone-100 text-stone-600 rounded">
                                  {ord.paymentMethod === 'upi' ? 'UPI' : 'Cash On Delivery'}
                                </span>
                              </div>
                              <span className="text-[11px] text-stone-500 block">
                                Booked on {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                              <div className="text-left sm:text-right">
                                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
                                  Grand Total
                                </span>
                                <span className={`font-mono text-base sm:text-lg font-bold ${
                                  isCancelled ? 'text-stone-700' : 'text-[#825936]'
                                }`}>
                                  ₹{ord.grandTotal}
                                </span>
                              </div>

                              <button
                                onClick={() => onViewInvoice(ord)}
                                className="px-3.5 py-1.5 border border-stone-300 hover:border-stone-900 bg-white text-stone-800 text-xs font-semibold rounded-full transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                                title="Download official Tax Invoice"
                              >
                                <FontAwesomeIcon icon={faFileInvoice} className="text-xs text-stone-500" />
                                <span>Invoice</span>
                              </button>
                            </div>
                          </div>

                          {/* ======================================================== */}
                          {/* VERTICAL UP-TO-DOWN TRACKING SYSTEM WITH CONNECTING DOTS */}
                          {/* ======================================================== */}
                          {!isCancelled ? (
                            <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-4 sm:p-6 space-y-4">
                              <div className="flex items-center justify-between border-b border-stone-200/70 pb-3">
                                <div className="flex items-center gap-2">
                                  <FontAwesomeIcon icon={faTruckFast} className="text-[#825936] text-sm" />
                                  <span className="font-serif text-sm font-bold text-stone-900">
                                    Live Delivery Milestones
                                  </span>
                                </div>
                                <span className="text-[11px] font-mono text-stone-500">
                                  {isDelivered ? 'Milestone: Delivered (Final)' : 'Forward Progression Only'}
                                </span>
                              </div>

                              {/* Stepper with vertical line and dots */}
                              <div className="relative pl-7 sm:pl-9 space-y-6 before:absolute before:left-[11px] sm:before:left-[13px] before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-300">
                                
                                {/* Step 1: Order Confirmed */}
                                <div className="relative space-y-0.5">
                                  <div className="absolute -left-[27px] sm:-left-[35px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-2xs bg-stone-900 text-white">
                                    <FontAwesomeIcon icon={faCheck} />
                                  </div>
                                  <h5 className="font-serif text-xs sm:text-sm font-bold text-stone-900">
                                    1. Order Confirmed & Verified
                                  </h5>
                                  <p className="text-stone-500 text-[11px]">
                                    Artisanal order registered in atelier registry. Payment verified.
                                  </p>
                                </div>

                                {/* Step 2: Handcrafting & Curing */}
                                <div className="relative space-y-0.5">
                                  <div className={`absolute -left-[27px] sm:-left-[35px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-2xs ${
                                    isProcessing ? 'bg-stone-900 text-white' : 'bg-white border-2 border-stone-300 text-stone-300'
                                  }`}>
                                    {isProcessing ? <FontAwesomeIcon icon={faCheck} /> : <div className="w-2 h-2 rounded-full bg-stone-300" />}
                                  </div>
                                  <h5 className={`font-serif text-xs sm:text-sm font-bold ${
                                    isProcessing ? 'text-stone-900' : 'text-stone-400'
                                  }`}>
                                    2. Artisanal Handcrafting & Quality Check
                                  </h5>
                                  <p className="text-stone-500 text-[11px]">
                                    Soy wax curing, pure botanical infusion, and eco-luxury packaging.
                                  </p>
                                </div>

                                {/* Step 3: Air Express Dispatched */}
                                <div className="relative space-y-0.5">
                                  <div className={`absolute -left-[27px] sm:-left-[35px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-2xs ${
                                    isDispatched ? 'bg-stone-900 text-white' : 'bg-white border-2 border-stone-300 text-stone-300'
                                  }`}>
                                    {isDispatched ? <FontAwesomeIcon icon={faCheck} /> : <div className="w-2 h-2 rounded-full bg-stone-300" />}
                                  </div>
                                  <h5 className={`font-serif text-xs sm:text-sm font-bold ${
                                    isDispatched ? 'text-stone-900' : 'text-stone-400'
                                  }`}>
                                    3. Dispatched via Air Express Courier
                                  </h5>
                                  <p className="text-stone-500 text-[11px]">
                                    Package in transit with national express logistics partner. AWB logged.
                                  </p>
                                </div>

                                {/* Step 4: Delivered to Doorstep */}
                                <div className="relative space-y-0.5">
                                  <div className={`absolute -left-[27px] sm:-left-[35px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-2xs ${
                                    isDelivered ? 'bg-emerald-700 text-white' : 'bg-white border-2 border-stone-300 text-stone-300'
                                  }`}>
                                    {isDelivered ? <FontAwesomeIcon icon={faCheck} /> : <div className="w-2 h-2 rounded-full bg-stone-300" />}
                                  </div>
                                  <h5 className={`font-serif text-xs sm:text-sm font-bold ${
                                    isDelivered ? 'text-emerald-800' : 'text-stone-400'
                                  }`}>
                                    4. Delivered to Doorstep
                                  </h5>
                                  <p className="text-stone-500 text-[11px]">
                                    {isDelivered 
                                      ? 'Order successfully delivered. Once delivered, tracking is locked and completed.' 
                                      : 'Awaiting final delivery to destination address.'}
                                  </p>
                                </div>

                              </div>
                            </div>
                          ) : (
                            /* Cancelled order banner */
                            <div className="bg-stone-200/80 border border-stone-300 rounded-xl p-4 text-xs space-y-1">
                              <span className="font-bold text-stone-900 block">Order Cancellation Notice:</span>
                              <p className="text-stone-700">{ord.cancelReason || 'Cancelled upon patron request.'}</p>
                              <p className="text-[11px] text-stone-500">This order was cancelled and closed. No further charges or shipments will be processed.</p>
                            </div>
                          )}

                          {/* Items in this Order */}
                          <div className="space-y-2.5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block">
                              Ordered Items ({ord.items.length})
                            </span>
                            <div className="divide-y divide-stone-100">
                              {ord.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3.5 py-2.5">
                                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-stone-200 bg-stone-50 flex-shrink-0">
                                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-grow min-w-0 space-y-0.5">
                                    <h4 className="font-serif text-xs sm:text-sm font-bold text-stone-900 truncate">
                                      {item.product.name}
                                    </h4>
                                    <span className="text-[11px] text-stone-500 block">
                                      Qty: {item.quantity} · Rate: ₹{item.product.price}
                                    </span>
                                  </div>
                                  <div className="text-right font-mono text-xs font-bold text-stone-900 whitespace-nowrap">
                                    ₹{item.product.price * item.quantity}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Delivery Address & Contact */}
                          <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-xl p-4 text-xs space-y-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#825936] font-bold block">
                              Delivery Destination
                            </span>
                            <div className="space-y-0.5 text-stone-700">
                              <p className="font-bold text-stone-900 text-sm">{ord.address.fullName}</p>
                              <p>{ord.address.addressLine1}</p>
                              <p>{ord.address.city}, {ord.address.state} - {ord.address.pincode}</p>
                              <p className="text-stone-500 pt-1 font-mono">Contact: +91 {ord.address.phone}</p>
                            </div>
                          </div>

                          {/* Actions Bar */}
                          <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <button
                              type="button"
                              onClick={() => setSelectedDetailOrderId(null)}
                              className="px-4 py-2 border border-stone-300 hover:border-stone-800 text-stone-800 text-xs font-semibold rounded-full transition-colors cursor-pointer inline-flex items-center gap-2"
                            >
                              <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                              <span>Back to All Orders</span>
                            </button>

                            <div className="flex items-center gap-2">
                              <a
                                href={`https://wa.me/919026006766?text=${encodeURIComponent(`Hello Orchid Flame, I would like an update regarding my booked Order #${ord.id}.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-full transition-colors inline-flex items-center gap-1.5"
                              >
                                <FontAwesomeIcon icon={faPaperPlane} className="text-[10px]" />
                                <span>WhatsApp Concierge</span>
                              </a>

                              {!isDelivered && !isCancelled && (
                                <button
                                  onClick={() => setOrderToCancel(ord)}
                                  className="px-4 py-2 border border-stone-300 hover:border-red-400 text-stone-600 hover:text-red-700 text-xs font-semibold rounded-full transition-colors cursor-pointer"
                                >
                                  Cancel Order
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })()
                ) : (
                  /* ======================================================== */
                  /* 2-COLUMN ORDER SUMMARY CARDS GRID (FOR ALL ORDERS)       */
                  /* ======================================================== */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {filteredOrders.map((ord) => {
                      const isDelivered = ord.status === 'delivered';
                      const isDispatched = ord.status === 'dispatched' || isDelivered;
                      const isProcessing = ord.status === 'processing' || isDispatched;
                      const isCancelled = ord.status === 'cancelled';

                      return (
                        <div
                          key={ord.id}
                          onClick={() => setSelectedDetailOrderId(ord.id)}
                          className={`border rounded-2xl p-4 sm:p-5 transition-all text-left flex flex-col justify-between cursor-pointer group shadow-2xs ${
                            isCancelled
                              ? 'bg-stone-100/90 border-stone-300 filter grayscale opacity-75 hover:opacity-90 hover:border-stone-400'
                              : 'bg-white border-stone-200/90 hover:border-stone-400 hover:shadow-xs'
                          }`}
                        >
                          
                          {/* Order Card Top Bar */}
                          <div className="space-y-1.5 border-b border-stone-100 pb-3">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className={`font-serif text-sm sm:text-base font-bold transition-colors ${
                                isCancelled ? 'text-stone-700' : 'text-stone-900 group-hover:text-[#825936]'
                              }`}>
                                Order #{ord.id}
                              </span>
                              <span className={`text-[9.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                isCancelled ? 'bg-stone-300 text-stone-700 border border-stone-400' :
                                isDelivered ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                isDispatched ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                                'bg-[#F5F2EC] text-stone-800'
                              }`}>
                                {isCancelled ? 'Cancelled' : isDelivered ? 'Delivered' : isDispatched ? 'Dispatched' : 'In Fulfillment'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-stone-400">
                              <span>Booked on {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              <span className="font-semibold uppercase tracking-wider text-[9.5px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                                {ord.paymentMethod === 'upi' ? 'UPI' : 'COD'}
                              </span>
                            </div>
                          </div>

                          {/* Order Card Middle: Thumbnails & Items Summary */}
                          <div className="py-3 space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center -space-x-2 flex-shrink-0">
                                {ord.items.slice(0, 3).map((item, i) => (
                                  <img
                                    key={i}
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className={`w-12 h-12 rounded-xl object-cover border-2 border-white shadow-xs ${
                                      isCancelled ? 'filter grayscale contrast-90' : ''
                                    }`}
                                  />
                                ))}
                                {ord.items.length > 3 && (
                                  <div className="w-12 h-12 rounded-xl bg-stone-100 border-2 border-white text-stone-600 font-bold text-xs flex items-center justify-center shadow-xs">
                                    +{ord.items.length - 3}
                                  </div>
                                )}
                              </div>

                              <div className="space-y-0.5 min-w-0">
                                <h4 className="font-serif text-xs sm:text-sm font-bold text-stone-900 truncate">
                                  {ord.items[0]?.product.name} {ord.items.length > 1 ? `+ ${ord.items.length - 1} more` : ''}
                                </h4>
                                <span className="text-[11px] text-stone-500 block truncate">
                                  {ord.items.reduce((sum, item) => sum + item.quantity, 0)} items · {ord.address.city}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Order Card Bottom Row */}
                          <div 
                            className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div>
                              <span className="text-[9.5px] uppercase tracking-wider text-stone-400 font-semibold block leading-none">
                                Total
                              </span>
                              <span className={`font-mono text-base font-bold ${
                                isCancelled ? 'text-stone-700' : 'text-[#825936]'
                              }`}>
                                ₹{ord.grandTotal}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => onViewInvoice(ord)}
                                className="px-3 py-1.5 border border-stone-300 hover:border-stone-900 bg-white text-stone-800 text-[11px] font-semibold rounded-full transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                                title="Download official Tax Invoice"
                              >
                                <FontAwesomeIcon icon={faFileInvoice} className="text-xs text-stone-500" />
                                <span>Invoice</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedDetailOrderId(ord.id)}
                                className={`px-3.5 py-1.5 text-[11px] font-semibold rounded-full transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs ${
                                  isCancelled
                                    ? 'bg-stone-300 hover:bg-stone-400 text-stone-800'
                                    : 'bg-[#1C2A1E] hover:bg-stone-900 text-white'
                                }`}
                              >
                                <span>Details</span>
                                <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* ------------------------------------------------------ */}
            {/* TAB 3: SAVED DELIVERY ADDRESSES (REFERENCE 3)          */}
            {/* ------------------------------------------------------ */}
            {activeTab === 'addresses' && (
              <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 text-left">
                
                {/* Header (Matching Reference 3) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                      Saved Delivery Addresses
                    </h2>
                    <p className="text-stone-500 text-xs mt-0.5">
                      Manage your shipping destinations for 1-click checkout.
                    </p>
                  </div>

                  {!isEditingAddress && (
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(true)}
                      className="px-5 py-2 bg-[#1C2A1E] hover:bg-stone-900 text-white text-xs font-semibold rounded-full transition-colors cursor-pointer shadow-xs self-start sm:self-auto flex items-center gap-1.5"
                    >
                      <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                      <span>Add / Edit Address</span>
                    </button>
                  )}
                </div>

                {savedSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} />
                    <span>Shipping address updated successfully.</span>
                  </div>
                )}

                {!isEditingAddress ? (
                  /* Address Card (Matching Reference 3) */
                  <div className="border border-stone-200 rounded-2xl p-5 sm:p-6 bg-white space-y-3 relative hover:border-stone-400 transition-colors shadow-2xs max-w-lg">
                    
                    {/* Top Row: Name and DEFAULT ADDRESS Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-serif text-base font-bold text-stone-900">
                        {addrName || user.displayName}
                      </h4>
                      <span className="bg-[#1C2A1E] text-white text-[9.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                        DEFAULT ADDRESS
                      </span>
                    </div>

                    {/* Address Details */}
                    <div className="text-xs text-stone-600 leading-relaxed space-y-0.5">
                      <p>{addrLine || '1427/98 Ganesh Pura, Tri Nagar'}</p>
                      <p>{addrCity}, {addrState} - {addrPin}</p>
                      <p className="text-stone-500 pt-1 flex items-center gap-1.5 font-sans">
                        <FontAwesomeIcon icon={faPhone} className="text-[10px] text-stone-400" />
                        <span>+91 {addrPhone || '9026006766'}</span>
                      </p>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-stone-100 flex items-center gap-4 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(true)}
                        className="text-stone-700 hover:text-stone-950 flex items-center gap-1.5 cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} className="text-xs text-stone-500" />
                        <span>Edit Address</span>
                      </button>
                    </div>

                  </div>
                ) : (
                  /* Edit Address Form */
                  <form onSubmit={handleSaveAddress} className="space-y-4 text-xs max-w-lg">
                    <div>
                      <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1 text-[11px]">
                        Recipient Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl p-3 text-xs focus:outline-none focus:border-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1 text-[11px]">
                        Contact Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl p-3 text-xs focus:outline-none focus:border-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1 text-[11px]">
                        Street Address & Landmark *
                      </label>
                      <input
                        type="text"
                        required
                        value={addrLine}
                        onChange={(e) => setAddrLine(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl p-3 text-xs focus:outline-none focus:border-stone-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1 text-[11px]">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={addrCity}
                          onChange={(e) => setAddrCity(e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1 text-[11px]">
                          State *
                        </label>
                        <input
                          type="text"
                          required
                          value={addrState}
                          onChange={(e) => setAddrState(e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1 text-[11px]">
                          PIN Code *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={addrPin}
                          onChange={(e) => setAddrPin(e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl p-2.5 text-xs font-mono focus:outline-none focus:border-stone-900"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(false)}
                        className="px-5 py-2 border border-stone-300 text-stone-700 text-xs font-semibold rounded-full hover:bg-stone-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#1C2A1E] hover:bg-stone-900 text-white text-xs font-semibold rounded-full transition-colors cursor-pointer shadow-xs"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}

              </div>
            )}

            {/* ------------------------------------------------------ */}
            {/* TAB 4: SAVED SCENTS / WISHLIST                         */}
            {/* ------------------------------------------------------ */}
            {activeTab === 'wishlist' && (
              <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 text-left">
                <div className="border-b border-stone-200 pb-4">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                    Saved Fragrances ({wishlist.length})
                  </h2>
                  <p className="text-stone-500 text-xs mt-0.5">
                    Your personal wishlisted artisanal candles and reed diffusers.
                  </p>
                </div>

                {wishlist.length === 0 ? (
                  <div className="text-center py-12 space-y-3 bg-[#F7F4EE] rounded-2xl p-6">
                    <FontAwesomeIcon icon={faHeart} className="text-3xl text-stone-300" />
                    <h3 className="font-serif text-base font-bold text-stone-800">No Saved Fragrances</h3>
                    <p className="text-stone-500 text-xs max-w-sm mx-auto">
                      Explore our collections and tap the heart icon to curate your personal fragrance wishlist.
                    </p>
                    <button
                      onClick={() => onNavigate('shop')}
                      className="px-5 py-2 bg-[#1C2A1E] text-white text-xs font-semibold rounded-full cursor-pointer"
                    >
                      Browse Boutique
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlist.map((item) => (
                      <div key={item.id} className="border border-stone-200 rounded-xl p-3 flex gap-3 bg-[#FAF8F5]">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-grow min-w-0 space-y-1">
                          <h4 className="font-serif text-xs font-bold text-stone-900 truncate">{item.name}</h4>
                          <span className="font-mono text-xs font-bold text-[#825936] block">₹{item.price}</span>
                          {onAddToCart && (
                            <button
                              onClick={() => onAddToCart(item, 1, item.weight)}
                              className="px-3 py-1 bg-stone-900 text-white text-[10.5px] font-semibold rounded-full cursor-pointer hover:bg-[#825936] transition-colors"
                            >
                              Add to Bag
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------ */}
            {/* TAB 5: CONCIERGE & HELP                                 */}
            {/* ------------------------------------------------------ */}
            {activeTab === 'concierge' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                
                {/* Contact Card */}
                <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#825936] font-bold block">
                      Direct Support
                    </span>
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      Atelier Concierge
                    </h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <a
                      href="https://wa.me/919026006766?text=Hello%20Orchid%20Flame,%20I%20am%20inquiring%20about%20my%20account%20and%20orders."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl flex items-center gap-3 transition-colors"
                    >
                      <FontAwesomeIcon icon={faPaperPlane} className="text-emerald-700 text-sm" />
                      <div>
                        <span className="font-bold block text-stone-900">WhatsApp Concierge</span>
                        <span className="text-[11px] text-stone-500">+91 90260 06766</span>
                      </div>
                    </a>

                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center gap-3">
                      <FontAwesomeIcon icon={faPhone} className="text-stone-500 text-sm" />
                      <div>
                        <span className="font-bold block text-stone-900">Phone Helpline</span>
                        <span className="text-[11px] text-stone-500">+91 90260 06766 (10 AM - 7 PM)</span>
                      </div>
                    </div>

                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center gap-3">
                      <FontAwesomeIcon icon={faEnvelope} className="text-stone-500 text-sm" />
                      <div>
                        <span className="font-bold block text-stone-900">Support Email</span>
                        <span className="text-[11px] text-stone-500">orchidflame24@gmail.com</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Candle Care */}
                <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#825936] font-bold block">
                      Fragrance Guidance
                    </span>
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      Soy Wax Care Guide
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
                    <div>
                      <h4 className="font-bold text-stone-900 mb-0.5">Initial Memory Burn</h4>
                      <p className="text-[11px]">Allow the melted wax pool to reach the edge on the first burn to prevent candle tunneling.</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-stone-900 mb-0.5">Trim Organic Wick</h4>
                      <p className="text-[11px]">Trim wick to 1/4 inch before each relighting for a soot-free, tranquil flame.</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-stone-900 mb-0.5">Eco Safe Delivery</h4>
                      <p className="text-[11px]">Shipped in shock-absorbing thermal luxury boxes with pan-India express guarantee.</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* 1. THEMED IN-SCREEN SIGN OUT CONFIRMATION MODAL CARD     */}
      {/* ======================================================== */}
      {confirmSignOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white border border-stone-300 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-left space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">Sign Out</h3>
                <span className="text-[10px] text-stone-500 font-mono">End current session</span>
              </div>
              <button
                type="button"
                onClick={() => setConfirmSignOut(false)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} className="text-sm" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to sign out of your Orchid Flame account? Your order history and saved delivery addresses remain safe.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmSignOut(false)}
                className="w-1/2 py-2 border border-stone-300 text-stone-700 text-xs font-semibold rounded-full cursor-pointer hover:bg-stone-50"
              >
                Stay Logged In
              </button>
              <button
                type="button"
                onClick={handleSignOutConfirm}
                className="w-1/2 py-2 bg-[#1C2A1E] hover:bg-stone-900 text-white text-xs font-semibold rounded-full cursor-pointer transition-colors shadow-xs"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. THEMED IN-SCREEN ORDER CANCELLATION CONFIRMATION CARD  */}
      {/* ======================================================== */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white border border-stone-300 rounded-2xl max-w-md w-full p-6 shadow-2xl text-left space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">
                  Cancel Order #{orderToCancel.id}?
                </h3>
                <span className="text-[10px] text-red-700 font-mono font-semibold uppercase">
                  Cancellation Confirmation
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="bg-[#FAF8F5] p-3.5 border border-stone-200 rounded-xl text-xs space-y-1">
              <p><b>Total Amount:</b> ₹{orderToCancel.grandTotal} ({orderToCancel.paymentMethod === 'upi' ? 'UPI' : 'Cash On Delivery'})</p>
              <p className="text-stone-600"><b>Creations:</b> {orderToCancel.items.map(i => i.product.name).join(', ')}</p>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                Reason for Cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-stone-900 cursor-pointer"
              >
                <option value="Change of delivery plans">Change of delivery plans</option>
                <option value="Ordered duplicate items by mistake">Ordered duplicate items by mistake</option>
                <option value="Need to change shipping address">Need to change shipping address</option>
                <option value="Other personal preference">Other personal preference</option>
              </select>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              Are you sure you wish to cancel this order? It will be marked cancelled in your account and fulfillment will stop.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                className="w-1/2 py-2 border border-stone-300 text-stone-700 text-xs font-semibold rounded-full cursor-pointer hover:bg-stone-50"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelOrder}
                className="w-1/2 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-full cursor-pointer transition-colors shadow-xs"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
