/**
 * useCurrency Hook - Mobile (React Native)
 * 
 * Detects user's location and provides currency conversion utilities.
 * Falls back to USD if geolocation fails or is not available.
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';
import {
  CurrencyCode,
  CurrencyInfo,
  CURRENCIES,
  getCurrencyForCountry,
  localizePrice,
  getSupportedCurrencies,
  isSupportedCurrency,
} from '@shared/utils/currency';

const CURRENCY_STORAGE_KEY = 'hobi_user_currency';
const COUNTRY_STORAGE_KEY = 'hobi_user_country';

interface UseCurrencyResult {
  /** Current currency code */
  currency: CurrencyCode;
  /** Currency info (symbol, name, locale) */
  currencyInfo: CurrencyInfo;
  /** Whether the currency is being detected */
  isLoading: boolean;
  /** Detected country code (ISO 3166-1 alpha-2) */
  countryCode: string | null;
  /** Convert a USD price string to localized currency */
  formatPrice: (usdPriceString: string) => string;
  /** Manually set the currency */
  setCurrency: (currency: CurrencyCode) => void;
  /** List of all supported currencies */
  supportedCurrencies: CurrencyCode[];
}

interface GeoLocationResponse {
  country_code?: string;
  country?: string;
  countryCode?: string;
}

/**
 * Get device locale/region as fallback
 */
function getDeviceCountry(): string | null {
  try {
    // Try to get device locale
    let locale: string | undefined;

    if (Platform.OS === 'ios') {
      locale =
        NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0];
    } else if (Platform.OS === 'android') {
      locale = NativeModules.I18nManager?.localeIdentifier;
    }

    if (locale) {
      // Locale format: "en_US" or "en-US"
      const parts = locale.split(/[-_]/);
      if (parts.length > 1 && parts[1].length === 2) {
        return parts[1].toUpperCase();
      }
    }
  } catch {
    // Ignore
  }

  return null;
}

/**
 * Detect user's country using a free geolocation API
 */
async function detectCountry(): Promise<string | null> {
  // First try device locale (faster and works offline)
  const deviceCountry = getDeviceCountry();
  if (deviceCountry) {
    return deviceCountry;
  }

  // Then try geolocation APIs
  const apis = [
    {
      url: 'https://ipapi.co/json/',
      getCountry: (data: GeoLocationResponse) => data.country_code,
    },
    {
      url: 'https://api.country.is/',
      getCountry: (data: GeoLocationResponse) => data.country,
    },
  ];

  for (const api of apis) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(api.url, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const data = await response.json();
      const country = api.getCountry(data);
      if (country && typeof country === 'string' && country.length === 2) {
        return country.toUpperCase();
      }
    } catch {
      // Try next API
      continue;
    }
  }

  return null;
}

export function useCurrency(): UseCurrencyResult {
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved currency on mount
  useEffect(() => {
    const initializeCurrency = async () => {
      setIsLoading(true);

      try {
        // Check for saved currency preference
        const savedCurrency = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);
        const savedCountry = await AsyncStorage.getItem(COUNTRY_STORAGE_KEY);

        if (savedCurrency && isSupportedCurrency(savedCurrency)) {
          setCurrencyState(savedCurrency);
          setCountryCode(savedCountry);
          setIsLoading(false);
          return;
        }

        // Detect country and set currency
        const detected = await detectCountry();
        if (detected) {
          const detectedCurrency = getCurrencyForCountry(detected);
          setCurrencyState(detectedCurrency);
          setCountryCode(detected);

          // Save for future app opens
          await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, detectedCurrency);
          await AsyncStorage.setItem(COUNTRY_STORAGE_KEY, detected);
        }
      } catch {
        // Keep default USD
      }

      setIsLoading(false);
    };

    initializeCurrency();
  }, []);

  // Manually set currency
  const setCurrency = useCallback(async (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    try {
      await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
    } catch {
      // Storage failed, but state is updated
    }
  }, []);

  // Convert and format price
  const formatPrice = useCallback(
    (usdPriceString: string): string => {
      return localizePrice(usdPriceString, currency);
    },
    [currency]
  );

  return {
    currency,
    currencyInfo: CURRENCIES[currency],
    isLoading,
    countryCode,
    formatPrice,
    setCurrency,
    supportedCurrencies: getSupportedCurrencies(),
  };
}

export type { CurrencyCode, CurrencyInfo };

