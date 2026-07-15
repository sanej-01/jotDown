/**
 * Tracking and monitoring utilities for Jot.
 *
 * This module provides functions for tracking user interactions, performance metrics,
 * and other monitoring data. Designed for observability and analytics purposes.
 */

/**
 * Track a user interaction event.
 * @param eventName - Name of the event being tracked
 * @param metadata - Optional metadata about the event
 */
export function trackEvent(eventName: string, metadata?: Record<string, unknown>): void {
  // Track event with optional metadata
  const event = {
    timestamp: new Date().toISOString(),
    name: eventName,
    ...metadata,
  };

  // Log for development
  if (import.meta.env.DEV) {
    console.debug('[Tracking]', event);
  }

  // TODO: Send to analytics service (Segment, Posthog, etc.)
  // analytics.track(eventName, metadata);
}

/**
 * Track performance metrics.
 * @param metricName - Name of the metric
 * @param value - Numeric value of the metric
 * @param unit - Optional unit of measurement
 */
export function trackMetric(
  metricName: string,
  value: number,
  unit?: string,
): void {
  const metric = {
    timestamp: new Date().toISOString(),
    name: metricName,
    value,
    unit: unit ?? 'ms',
  };

  if (import.meta.env.DEV) {
    console.debug('[Metric]', metric);
  }

  // TODO: Send to monitoring service (DataDog, New Relic, etc.)
  // monitoring.recordMetric(metricName, value, { unit });
}

/**
 * Track an error for monitoring and debugging.
 * @param error - The error to track
 * @param context - Optional context about where/why the error occurred
 */
export function trackError(error: Error, context?: Record<string, unknown>): void {
  const errorData = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    ...context,
  };

  console.error('[Error Tracking]', errorData);

  // TODO: Send to error tracking service (Sentry, Rollbar, etc.)
  // errorTracker.captureException(error, { tags: context });
}

/**
 * Track page navigation and view events.
 * @param pageName - Name of the page being viewed
 * @param path - URL path of the page
 */
export function trackPageView(pageName: string, path: string): void {
  trackEvent('page_view', {
    page: pageName,
    path,
  });
}

/**
 * Performance observer for tracking Core Web Vitals.
 * TRACKING: Monitor LCP, FID, and CLS for mobile and desktop.
 */
export function initializeWebVitalsTracking(): void {
  // TODO: Integrate with web-vitals library
  // import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
  //
  // getCLS((metric) => trackMetric('CLS', metric.value));
  // getFID((metric) => trackMetric('FID', metric.value));
  // getLCP((metric) => trackMetric('LCP', metric.value));
  // getTTFB((metric) => trackMetric('TTFB', metric.value));
}

/**
 * Track user session start.
 * TRACKING: Called when user authenticates successfully.
 */
export function trackSessionStart(userId: string): void {
  trackEvent('session_start', {
    userId,
  });
}

/**
 * Track user session end.
 * TRACKING: Called on logout or session timeout.
 */
export function trackSessionEnd(userId: string): void {
  trackEvent('session_end', {
    userId,
  });
}

/**
 * Track feature usage.
 * TRACKING: Monitor which features are used most frequently.
 * @param featureName - Name of the feature (e.g., 'calendar_picker', 'reorder_todos')
 */
export function trackFeatureUsage(featureName: string): void {
  trackEvent('feature_used', {
    feature: featureName,
  });
}

/**
 * Known tracking points in the application:
 *
 * TRACKING CHECKLIST:
 * - [ ] Calendar picker on DueDateControl (mobile vs desktop behavior)
 * - [ ] List item reordering interactions
 * - [ ] Todo completion rate
 * - [ ] Mobile vs desktop usage patterns
 * - [ ] Page refresh/navigation events
 * - [ ] Error rates on mobile devices
 * - [ ] Performance metrics (especially on iPhone)
 */
