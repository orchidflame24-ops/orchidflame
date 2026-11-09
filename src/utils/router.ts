import { PolicyTab } from '../views/PolicyView';

export type AppView =
  | 'home'
  | 'shop'
  | 'about'
  | 'contact'
  | 'profile'
  | 'wishlist'
  | 'policy'
  | 'admin';

export interface AppRoute {
  view: AppView;
  productId?: string;
  category?: string | null;
  policyTab?: PolicyTab;
}

const VALID_POLICY_TABS: PolicyTab[] = [
  'return-policy',
  'candle-care',
  'shipping-policy',
  'ingredients',
  'faq',
  'privacy-policy',
  'terms',
];

/**
 * Parses the current window URL (both pathname and hash) into a normalized AppRoute
 */
export const parseCurrentRoute = (): AppRoute => {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  // 1. Admin Gate route: /ocfl or /ocfl/ or #/ocfl or #ocfl
  if (
    path === '/ocfl' ||
    path === '/ocfl/' ||
    path.startsWith('/ocfl') ||
    hash.startsWith('#/ocfl') ||
    hash.startsWith('#ocfl') ||
    window.location.href.toLowerCase().includes('/ocfl')
  ) {
    return { view: 'admin' };
  }

  // 2. Determine target path string: prioritize hash (e.g. #/shop, #/product/xyz) if present, else pathname
  let cleanPath = '';
  if (hash && hash.startsWith('#/')) {
    cleanPath = hash.slice(2);
  } else if (hash && hash.startsWith('#')) {
    cleanPath = hash.slice(1);
  } else {
    cleanPath = path.startsWith('/') ? path.slice(1) : path;
  }

  // Separate query parameters if any (e.g. shop?category=Candles)
  const [routePart, queryPart] = cleanPath.split('?');
  const queryParams = new URLSearchParams(queryPart || window.location.search);
  const segments = (routePart || '').split('/').filter(Boolean);

  const primarySegment = segments[0] || '';

  if (!primarySegment || primarySegment === 'home') {
    return { view: 'home' };
  }

  if (primarySegment === 'shop') {
    const categoryParam = queryParams.get('category');
    return {
      view: 'shop',
      category: categoryParam ? decodeURIComponent(categoryParam) : null,
    };
  }

  if (primarySegment === 'product' && segments[1]) {
    return {
      view: 'shop', // We will load product detail on top
      productId: decodeURIComponent(segments[1]),
    };
  }

  if (primarySegment === 'about') {
    return { view: 'about' };
  }

  if (primarySegment === 'contact') {
    return { view: 'contact' };
  }

  if (primarySegment === 'profile') {
    return { view: 'profile' };
  }

  if (primarySegment === 'wishlist') {
    return { view: 'wishlist' };
  }

  if (primarySegment === 'policy') {
    const tabCandidate = (segments[1] || queryParams.get('tab') || 'return-policy') as PolicyTab;
    const policyTab = VALID_POLICY_TABS.includes(tabCandidate) ? tabCandidate : 'return-policy';
    return {
      view: 'policy',
      policyTab,
    };
  }

  // Unknown route fallback
  return { view: 'home' };
};

/**
 * Builds the canonical hash URL for a given route
 */
export const buildRouteUrl = (route: AppRoute): string => {
  if (route.view === 'admin') return '#/ocfl';
  if (route.productId) return `#/product/${encodeURIComponent(route.productId)}`;
  if (route.view === 'shop') {
    return route.category ? `#/shop?category=${encodeURIComponent(route.category)}` : '#/shop';
  }
  if (route.view === 'policy') {
    return `#/policy/${route.policyTab || 'return-policy'}`;
  }
  if (route.view === 'home') return '#/';
  return `#/${route.view}`;
};

/**
 * Updates browser history and URL hash cleanly without reload
 */
export const navigateTo = (route: AppRoute, replace = false) => {
  const targetUrl = buildRouteUrl(route);
  if (window.location.hash !== targetUrl) {
    if (replace) {
      window.history.replaceState(null, '', targetUrl);
    } else {
      window.history.pushState(null, '', targetUrl);
    }
    // Dispatch popstate event so listeners immediately fire
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * Dynamically updates document metadata for SEO and tab titles
 */
export const syncDocumentTitle = (route: AppRoute, productName?: string) => {
  const base = 'Orchid Flame | Artisanal Luxury Fragrances';
  if (route.view === 'admin') {
    document.title = 'Atelier Control Center | Orchid Flame';
    return;
  }
  if (route.productId && productName) {
    document.title = `${productName} | Orchid Flame`;
    return;
  }
  switch (route.view) {
    case 'shop':
      document.title = route.category ? `${route.category} | Orchid Flame Catalog` : 'Fragrance Collection | Orchid Flame';
      break;
    case 'about':
      document.title = 'Our Heritage & Story | Orchid Flame';
      break;
    case 'contact':
      document.title = 'Concierge & Atelier Contact | Orchid Flame';
      break;
    case 'profile':
      document.title = 'Patron Sanctuary & Orders | Orchid Flame';
      break;
    case 'wishlist':
      document.title = 'Curated Wishlist | Orchid Flame';
      break;
    case 'policy':
      document.title = 'Policies & Customer Care | Orchid Flame';
      break;
    default:
      document.title = base;
      break;
  }
};
