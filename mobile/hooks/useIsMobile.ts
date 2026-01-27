import React from 'react';
import { Dimensions, Platform } from 'react-native';

// Treat widths < 1024px as mobile to show desktop layout on typical laptops
const MOBILE_BREAKPOINT = 1024;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    const checkIsMobile = () => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      } else {
        const { width } = Dimensions.get('window');
        setIsMobile(width < MOBILE_BREAKPOINT);
      }
    };

    // Set initial value
    checkIsMobile();

    // Listen for changes
    let subscription: any;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handler = () => checkIsMobile();
      window.addEventListener('resize', handler);
      subscription = { remove: () => window.removeEventListener('resize', handler) };
    } else {
      subscription = Dimensions.addEventListener('change', checkIsMobile);
    }

    return () => subscription?.remove?.();
  }, []);

  return isMobile;
}
