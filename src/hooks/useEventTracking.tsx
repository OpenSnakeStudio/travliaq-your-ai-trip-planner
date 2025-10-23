import { useCallback } from 'react';

declare global {
  interface Window {
    gtag?: (command: string, ...args: any[]) => void;
    dataLayer?: any[];
  }
}

interface EventParams {
  [key: string]: any;
}

export const useEventTracking = () => {
  const trackEvent = useCallback((eventName: string, params?: EventParams) => {
    // Envoyer à GA4 via gtag
    if (window.gtag) {
      window.gtag('event', eventName, params);
    }

    // Envoyer au dataLayer pour GTM
    if (window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...params
      });
    }

    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Event tracked:', eventName, params);
    }
  }, []);

  // Événements prédéfinis GA4
  const trackFormSubmit = useCallback((formName: string, params?: EventParams) => {
    trackEvent('form_submit', {
      form_name: formName,
      ...params
    });
  }, [trackEvent]);

  const trackButtonClick = useCallback((buttonName: string, params?: EventParams) => {
    trackEvent('button_click', {
      button_name: buttonName,
      ...params
    });
  }, [trackEvent]);

  const trackBookingStart = useCallback((params?: EventParams) => {
    trackEvent('begin_checkout', params);
  }, [trackEvent]);

  const trackOutboundLink = useCallback((url: string, linkName?: string) => {
    trackEvent('click', {
      event_category: 'outbound',
      event_label: linkName || url,
      link_url: url
    });
  }, [trackEvent]);

  const trackSearch = useCallback((searchTerm: string, params?: EventParams) => {
    trackEvent('search', {
      search_term: searchTerm,
      ...params
    });
  }, [trackEvent]);

  const trackGenerateLead = useCallback((params?: EventParams) => {
    trackEvent('generate_lead', params);
  }, [trackEvent]);

  return {
    trackEvent,
    trackFormSubmit,
    trackButtonClick,
    trackBookingStart,
    trackOutboundLink,
    trackSearch,
    trackGenerateLead
  };
};
