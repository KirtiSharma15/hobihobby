/**
 * useCurrency Hook - Web
 * 
 * Detects user's location and provides currency conversion utilities.
 * Falls back to USD if geolocation fails or is not available.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  CurrencyCode,
  CurrencyInfo,
  CURRENCIES,
  getCurrencyForCountry,
  localizePrice,
  getSupportedCurrencies,
  isSupportedCurrency,
  fetchLiveExchangeRates,
  getExchangeRateSource,
  refreshExchangeRates,
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
  /** Source of exchange rates ('live', 'cached', or 'fallback') */
  rateSource: 'live' | 'cached' | 'fallback';
  /** Force refresh exchange rates */
  refreshRates: () => Promise<void>;
}

interface GeoLocationResponse {
  country_code?: string;
  country?: string;
  countryCode?: string;
}

/**
 * Detect user's country using a free geolocation API
 */
async function detectCountry(): Promise<string | null> {
  // Try multiple free geolocation APIs as fallbacks
  const apis = [
    {
      url: 'https://ipapi.co/json/',
      getCountry: (data: GeoLocationResponse) => data.country_code,
    },
    {
      url: 'https://api.country.is/',
      getCountry: (data: GeoLocationResponse) => data.country,
    },
    {
      url: 'https://ip2c.org/self',
      getCountry: (data: string) => {
        // Response format: "1;US;USA;United States"
        const parts = (data as string).split(';');
        return parts[1] || null;
      },
      parseResponse: async (response: Response) => response.text(),
    },
  ];

  for (const api of apis) {
    try {
      const response = await fetch(api.url, {
        signal: AbortSignal.timeout(3000), // 3 second timeout
      });
      
      if (!response.ok) continue;
      
      const data = api.parseResponse 
        ? await api.parseResponse(response)
        : await response.json();
      
      const country = api.getCountry(data);
      if (country && typeof country === 'string' && country.length === 2) {
        return country.toUpperCase();
      }
    } catch {
      // Try next API
      continue;
    }
  }

  // Fallback: Try to detect from browser locale
  try {
    const locale = navigator.language || (navigator as { userLanguage?: string }).userLanguage;
    if (locale) {
      const parts = locale.split('-');
      if (parts.length > 1) {
        return parts[1].toUpperCase();
      }
    }
  } catch {
    // Ignore
  }

  return null;
}

export function useCurrency(): UseCurrencyResult {
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rateSource, setRateSource] = useState<'live' | 'cached' | 'fallback'>('fallback');

  // Load saved currency and fetch live rates on mount
  useEffect(() => {
    const initializeCurrency = async () => {
      setIsLoading(true);

      // Fetch live exchange rates (runs in parallel with country detection)
      const ratesPromise = fetchLiveExchangeRates().then(() => {
        setRateSource(getExchangeRateSource());
      });

      // Check for saved currency preference
      const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
      const savedCountry = localStorage.getItem(COUNTRY_STORAGE_KEY);

      if (savedCurrency && isSupportedCurrency(savedCurrency)) {
        setCurrencyState(savedCurrency);
        setCountryCode(savedCountry);
        await ratesPromise; // Wait for rates before showing prices
        setIsLoading(false);
        return;
      }

      // Detect country and set currency
      try {
        const detected = await detectCountry();
        if (detected) {
          const detectedCurrency = getCurrencyForCountry(detected);
          setCurrencyState(detectedCurrency);
          setCountryCode(detected);
          
          // Save for future visits
          localStorage.setItem(CURRENCY_STORAGE_KEY, detectedCurrency);
          localStorage.setItem(COUNTRY_STORAGE_KEY, detected);
        }
      } catch {
        // Keep default USD
      }

      await ratesPromise; // Wait for rates before showing prices
      setIsLoading(false);
    };

    initializeCurrency();
  }, []);

  // Manually set currency
  const setCurrency = useCallback((newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
  }, []);

  // Convert and format price
  const formatPrice = useCallback(
    (usdPriceString: string): string => {
      return localizePrice(usdPriceString, currency);
    },
    [currency]
  );

  // Force refresh exchange rates
  const refreshRates = useCallback(async () => {
    await refreshExchangeRates();
    setRateSource(getExchangeRateSource());
  }, []);

  return {
    currency,
    currencyInfo: CURRENCIES[currency],
    isLoading,
    countryCode,
    formatPrice,
    setCurrency,
    supportedCurrencies: getSupportedCurrencies(),
    rateSource,
    refreshRates,
  };
}

export type { CurrencyCode, CurrencyInfo };

