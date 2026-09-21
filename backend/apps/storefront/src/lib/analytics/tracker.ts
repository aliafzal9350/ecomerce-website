/**
 * Shopify-Grade Telemetry Event Tracker for Next.js Storefront
 * Captures user behavior, conversion funnels, and marketing attribution.
 */

export interface TelemetryEvent {
  event_type: 'page_view' | 'view_item' | 'add_to_cart' | 'checkout_step' | 'purchase' | 'search';
  product_id?: string;
  product_title?: string;
  category?: string;
  price?: number;
  quantity?: number;
  cart_value?: number;
  order_id?: string;
  properties?: Record<string, any>;
}

class LuxuryAnalyticsTracker {
  private sessionId: string = '';
  private anonymousId: string = '';
  private utmParams: Record<string, string> = {};
  private endpoint: string = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '/api/analytics/events';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initIdentifiers();
      this.captureAttribution();
    }
  }

  private initIdentifiers() {
    // 30-minute rolling session ID
    let currentSession = sessionStorage.getItem('ecom_session_id');
    if (!currentSession) {
      currentSession = 'sess_' + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('ecom_session_id', currentSession);
    }
    this.sessionId = currentSession;

    // Persistent anonymous visitor ID
    let anonId = localStorage.getItem('ecom_anon_id');
    if (!anonId) {
      anonId = 'anon_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('ecom_anon_id', anonId);
    }
    this.anonymousId = anonId;
  }

  private captureAttribution() {
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    
    utmKeys.forEach((key) => {
      const val = params.get(key);
      if (val) {
        this.utmParams[key] = val;
        // Persist first-touch attribution in local storage
        if (!localStorage.getItem(`first_${key}`)) {
          localStorage.setItem(`first_${key}`, val);
        }
      }
    });
  }

  public track(event: TelemetryEvent) {
    if (typeof window === 'undefined') return;

    const payload = {
      ...event,
      session_id: this.sessionId,
      anonymous_id: this.anonymousId,
      event_time: new Date().toISOString(),
      page_path: window.location.pathname,
      referrer: document.referrer || '',
      utm_source: this.utmParams['utm_source'] || localStorage.getItem('first_utm_source') || '',
      utm_medium: this.utmParams['utm_medium'] || localStorage.getItem('first_utm_medium') || '',
      utm_campaign: this.utmParams['utm_campaign'] || localStorage.getItem('first_utm_campaign') || '',
      device_type: window.innerWidth < 768 ? 'mobile' : 'desktop',
    };

    const data = JSON.stringify(payload);

    // Use navigator.sendBeacon for non-blocking telemetry delivery
    if (navigator.sendBeacon) {
      const blob = new Blob([data], { type: 'application/json' });
      navigator.sendBeacon(this.endpoint, blob);
    } else {
      fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
        keepalive: true,
      }).catch((err) => console.debug('[Telemetry] send failed:', err));
    }
  }

  public trackPageView(path?: string) {
    this.track({
      event_type: 'page_view',
      properties: { path: path || window.location.pathname },
    });
  }

  public trackViewItem(product: {
    id: string;
    title: string;
    category?: string;
    price?: number;
    properties?: Record<string, any>;
  }) {
    this.track({
      event_type: 'view_item',
      product_id: product.id,
      product_title: product.title,
      category: product.category,
      price: product.price,
      properties: product.properties,
    });
  }

  public trackAddToCart(item: {
    id: string;
    title: string;
    price: number;
    quantity: number;
    category?: string;
  }) {
    this.track({
      event_type: 'add_to_cart',
      product_id: item.id,
      product_title: item.title,
      price: item.price,
      quantity: item.quantity,
      category: item.category,
    });
  }

  public trackCheckoutStep(step: string, cartValue: number) {
    this.track({
      event_type: 'checkout_step',
      cart_value: cartValue,
      properties: { step },
    });
  }

  public trackPurchase(order: { id: string; revenue: number; currency?: string }) {
    this.track({
      event_type: 'purchase',
      order_id: order.id,
      price: order.revenue,
      properties: { currency: order.currency || 'USD' },
    });
  }
}

export const analytics = new LuxuryAnalyticsTracker();
