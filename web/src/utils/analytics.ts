/**
 * Analytics Utility - Phase 1 Validation
 * 
 * Simple event tracking for validating the MVP.
 * Stores events locally and can be extended to send to external services.
 * 
 * To enable Vercel Analytics, uncomment the Vercel Analytics script in index.html
 * or install @vercel/analytics package.
 */

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp: string;
  page: string;
}

// Local storage key for analytics
const ANALYTICS_KEY = 'hobihobby_analytics';

// Get stored events
const getStoredEvents = (): AnalyticsEvent[] => {
  try {
    return JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]');
  } catch {
    return [];
  }
};

// Store event
const storeEvent = (event: AnalyticsEvent) => {
  const events = getStoredEvents();
  events.push(event);
  // Keep only last 100 events to avoid storage issues
  const trimmedEvents = events.slice(-100);
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(trimmedEvents));
};

/**
 * Track a custom event
 */
export const trackEvent = (name: string, properties?: Record<string, unknown>) => {
  const event: AnalyticsEvent = {
    name,
    properties,
    timestamp: new Date().toISOString(),
    page: window.location.pathname,
  };

  // Store locally
  storeEvent(event);

  if (typeof window !== 'undefined' && (window as any).va) {
    (window as any).va('event', { name, ...properties });
  }
};

/**
 * Track page view
 */
export const trackPageView = (path: string) => {
  trackEvent('page_view', { path });
};

/**
 * Track hobby view
 */
export const trackHobbyView = (hobbyId: string, hobbyName: string) => {
  trackEvent('hobby_view', { hobbyId, hobbyName });
};

/**
 * Track hobby save/unsave
 */
export const trackHobbySave = (hobbyId: string, hobbyName: string, saved: boolean) => {
  trackEvent(saved ? 'hobby_save' : 'hobby_unsave', { hobbyId, hobbyName });
};

/**
 * Track filter usage
 */
export const trackFilterUse = (filterType: string, filterValue: string) => {
  trackEvent('filter_use', { filterType, filterValue });
};

/**
 * Track time spent on hobby detail page
 */
export const trackTimeOnPage = (hobbyId: string, seconds: number) => {
  trackEvent('time_on_page', { hobbyId, seconds });
};

/**
 * Get the user's current daily visit streak (consecutive days ending today
 * with at least one recorded page view). Used for the streak badge in the UI.
 */
export const getVisitStreak = (): number => {
  const visitDays = new Set(
    getStoredEvents()
      .filter((e) => e.name === 'page_view')
      .map((e) => {
        const day = new Date(e.timestamp);
        day.setHours(0, 0, 0, 0);
        return day.getTime();
      })
  );

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let cursor = today.getTime();
  while (visitDays.has(cursor)) {
    streak += 1;
    cursor -= ONE_DAY_MS;
  }
  return streak;
};

/**
 * Get this week's activity (Monday-Sunday), each entry true if the user
 * recorded a page view on that day. Used for the 7-day activity grid.
 */
export const getWeekActivity = (): boolean[] => {
  const visitDays = new Set(
    getStoredEvents()
      .filter((e) => e.name === 'page_view')
      .map((e) => {
        const day = new Date(e.timestamp);
        day.setHours(0, 0, 0, 0);
        return day.getTime();
      })
  );

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // getDay(): 0=Sun..6=Sat. Convert to Monday-first index (0=Mon..6=Sun).
  const mondayIndex = (today.getDay() + 6) % 7;
  const monday = today.getTime() - mondayIndex * ONE_DAY_MS;

  return Array.from({ length: 7 }, (_, i) => visitDays.has(monday + i * ONE_DAY_MS));
};

/**
 * Get analytics summary (for debugging/export)
 */
export const getAnalyticsSummary = () => {
  const events = getStoredEvents();
  const summary = {
    totalEvents: events.length,
    pageViews: events.filter(e => e.name === 'page_view').length,
    hobbyViews: events.filter(e => e.name === 'hobby_view').length,
    hobbySaves: events.filter(e => e.name === 'hobby_save').length,
    uniqueHobbiesViewed: new Set(
      events.filter(e => e.name === 'hobby_view').map(e => (e.properties as any)?.hobbyId)
    ).size,
    events,
  };
  return summary;
};

/**
 * Clear analytics (for testing)
 */
export const clearAnalytics = () => {
  localStorage.removeItem(ANALYTICS_KEY);
};

