import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag?: (command: string, ...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const usePageTracking = () => {
  const location = useLocation();
  const previousPath = useRef<string>('');

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    
    // Ne pas tracker si c'est la même page
    if (previousPath.current === currentPath) {
      return;
    }

    const pageLocation = window.location.origin + currentPath;
    const pageReferrer = previousPath.current 
      ? window.location.origin + previousPath.current 
      : document.referrer;

    // Envoyer l'événement page_view à GA4
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_location: pageLocation,
        page_path: currentPath,
        page_referrer: pageReferrer,
        page_title: document.title
      });
    }

    // Mettre à jour le dataLayer pour GTM
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'page_view',
        page_location: pageLocation,
        page_path: currentPath,
        page_referrer: pageReferrer,
        page_title: document.title
      });
    }

    // Mettre à jour la référence du chemin précédent
    previousPath.current = currentPath;
  }, [location]);
};
