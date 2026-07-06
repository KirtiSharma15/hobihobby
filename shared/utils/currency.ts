/**
 * Currency Utility - Localized Pricing Support
 * 
 * Provides currency conversion and formatting based on user location.
 * Base prices are stored in USD and converted to the viewer's local currency.
 * 
 * Features:
 * - Live exchange rates fetched from free API
 * - Caching to minimize API calls (rates cached for 1 hour)
 * - Fallback to static rates if API fails
 */

// Fallback static exchange rates (used when API is unavailable)
const FALLBACK_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CAD: 1.36,
  AUD: 1.53,
  INR: 83.12,
  CNY: 7.24,
  BRL: 4.97,
  MXN: 17.15,
  KRW: 1330.50,
  CHF: 0.88,
  SEK: 10.42,
  NZD: 1.64,
  SGD: 1.34,
  HKD: 7.82,
  NOK: 10.58,
  DKK: 6.87,
  PLN: 3.98,
  ZAR: 18.65,
  AED: 3.67,
  THB: 35.50,
  PHP: 56.20,
  MYR: 4.72,
  IDR: 15650,
  VND: 24500,
  RUB: 92.50,
  TRY: 32.15,
  ILS: 3.70,
  CZK: 22.85,
};

// Cache for live exchange rates
interface ExchangeRateCache {
  rates: Record<string, number>;
  timestamp: number;
  source: 'live' | 'fallback';
}

const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour cache
let exchangeRateCache: ExchangeRateCache | null = null;

// Current rates (updated by fetchLiveRates or fallback)
export let EXCHANGE_RATES: Record<CurrencyCode, number> = { ...FALLBACK_EXCHANGE_RATES };

export type CurrencyCode = 
  | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'INR' | 'CNY' 
  | 'BRL' | 'MXN' | 'KRW' | 'CHF' | 'SEK' | 'NZD' | 'SGD' | 'HKD'
  | 'NOK' | 'DKK' | 'PLN' | 'ZAR' | 'AED' | 'THB' | 'PHP' | 'MYR'
  | 'IDR' | 'VND' | 'RUB' | 'TRY' | 'ILS' | 'CZK';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

// Currency metadata for display
export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
  MXN: { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', locale: 'es-MX' },
  KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won', locale: 'ko-KR' },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', locale: 'sv-SE' },
  NZD: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', locale: 'zh-HK' },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', locale: 'nb-NO' },
  DKK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone', locale: 'da-DK' },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Złoty', locale: 'pl-PL' },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', locale: 'en-AE' },
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', locale: 'th-TH' },
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', locale: 'en-PH' },
  MYR: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', locale: 'ms-MY' },
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', locale: 'id-ID' },
  VND: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', locale: 'vi-VN' },
  RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', locale: 'ru-RU' },
  TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', locale: 'tr-TR' },
  ILS: { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', locale: 'he-IL' },
  CZK: { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', locale: 'cs-CZ' },
};

// Country code to currency mapping (most common currencies by country)
export const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  US: 'USD', GB: 'GBP', DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR',
  BE: 'EUR', AT: 'EUR', PT: 'EUR', IE: 'EUR', FI: 'EUR', GR: 'EUR', LU: 'EUR',
  JP: 'JPY', CA: 'CAD', AU: 'AUD', IN: 'INR', CN: 'CNY', BR: 'BRL', MX: 'MXN',
  KR: 'KRW', CH: 'CHF', SE: 'SEK', NZ: 'NZD', SG: 'SGD', HK: 'HKD', NO: 'NOK',
  DK: 'DKK', PL: 'PLN', ZA: 'ZAR', AE: 'AED', TH: 'THB', PH: 'PHP', MY: 'MYR',
  ID: 'IDR', VN: 'VND', RU: 'RUB', TR: 'TRY', IL: 'ILS', CZ: 'CZK',
  // Add more as needed
};

export interface ParsedPrice {
  min: number;
  max: number;
  isRange: boolean;
}

/**
 * Parse a price string (e.g., "$48-88", "$15", "$5-10") into numeric values
 * Assumes prices are in USD
 */
export function parsePriceString(priceString: string): ParsedPrice {
  // Remove currency symbols and whitespace
  const cleaned = priceString.replace(/[$€£¥₹,\s]/g, '');
  
  // Check if it's a range (contains hyphen or dash)
  const rangeMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*[-–—]\s*(\d+(?:\.\d+)?)$/);
  
  if (rangeMatch) {
    return {
      min: parseFloat(rangeMatch[1]),
      max: parseFloat(rangeMatch[2]),
      isRange: true,
    };
  }
  
  // Single value
  const singleMatch = cleaned.match(/^(\d+(?:\.\d+)?)$/);
  if (singleMatch) {
    const value = parseFloat(singleMatch[1]);
    return {
      min: value,
      max: value,
      isRange: false,
    };
  }
  
  // Fallback: try to extract any number
  const anyNumber = cleaned.match(/\d+(?:\.\d+)?/g);
  if (anyNumber && anyNumber.length > 0) {
    const values = anyNumber.map(parseFloat);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      isRange: values.length > 1,
    };
  }
  
  // Default fallback
  return { min: 0, max: 0, isRange: false };
}

/**
 * Convert an amount from USD to the target currency
 */
export function convertCurrency(
  amountUSD: number,
  targetCurrency: CurrencyCode
): number {
  const rate = EXCHANGE_RATES[targetCurrency] ?? 1;
  return amountUSD * rate;
}

/**
 * Format a number as currency using the browser's Intl API
 */
export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const currency = CURRENCIES[currencyCode];
  const locale = currency?.locale ?? 'en-US';
  
  // Determine fraction digits based on currency
  // Currencies like JPY, KRW, VND, IDR don't use decimal places
  const noDecimalCurrencies: CurrencyCode[] = ['JPY', 'KRW', 'VND', 'IDR'];
  const useDecimals = !noDecimalCurrencies.includes(currencyCode);
  
  const defaultMinFraction = useDecimals ? 0 : 0;
  const defaultMaxFraction = useDecimals ? 2 : 0;
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: options?.minimumFractionDigits ?? defaultMinFraction,
      maximumFractionDigits: options?.maximumFractionDigits ?? defaultMaxFraction,
    }).format(amount);
  } catch {
    // Fallback if Intl is not available or currency is not supported
    const symbol = currency?.symbol ?? '$';
    return `${symbol}${amount.toFixed(useDecimals ? 2 : 0)}`;
  }
}

/**
 * Convert and format a price range from USD to the target currency
 */
export function formatPriceRange(
  parsedPrice: ParsedPrice,
  targetCurrency: CurrencyCode
): string {
  const { min, max, isRange } = parsedPrice;
  
  const convertedMin = convertCurrency(min, targetCurrency);
  const convertedMax = convertCurrency(max, targetCurrency);
  
  // Round to appropriate values based on currency
  const noDecimalCurrencies: CurrencyCode[] = ['JPY', 'KRW', 'VND', 'IDR'];
  const useDecimals = !noDecimalCurrencies.includes(targetCurrency);
  
  const roundedMin = useDecimals 
    ? Math.round(convertedMin) 
    : Math.round(convertedMin / 100) * 100; // Round to nearest 100 for large-unit currencies
  const roundedMax = useDecimals 
    ? Math.round(convertedMax)
    : Math.round(convertedMax / 100) * 100;
  
  if (!isRange || roundedMin === roundedMax) {
    return formatCurrency(roundedMin, targetCurrency);
  }
  
  // For ranges, show min-max without repeating currency symbol
  const currency = CURRENCIES[targetCurrency];
  const locale = currency?.locale ?? 'en-US';
  
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    const minFormatted = formatter.format(roundedMin);
    const maxFormatted = formatter.format(roundedMax);
    
    // Extract just the number from the max for cleaner range display
    // e.g., "$48 - $88" or "$48-88"
    return `${minFormatted} – ${maxFormatted}`;
  } catch {
    const symbol = currency?.symbol ?? '$';
    return `${symbol}${roundedMin} – ${symbol}${roundedMax}`;
  }
}

/**
 * Convert a USD price string to a localized price string
 * This is the main function to use in components
 */
export function localizePrice(
  usdPriceString: string,
  targetCurrency: CurrencyCode
): string {
  const parsed = parsePriceString(usdPriceString);
  return formatPriceRange(parsed, targetCurrency);
}

/**
 * Get the currency code for a given country code (ISO 3166-1 alpha-2)
 */
export function getCurrencyForCountry(countryCode: string): CurrencyCode {
  const upperCode = countryCode.toUpperCase();
  return COUNTRY_TO_CURRENCY[upperCode] ?? 'USD';
}

/**
 * Get all supported currency codes
 */
export function getSupportedCurrencies(): CurrencyCode[] {
  return Object.keys(CURRENCIES) as CurrencyCode[];
}

/**
 * Check if a currency code is supported
 */
export function isSupportedCurrency(code: string): code is CurrencyCode {
  return code in CURRENCIES;
}

// ============================================
// Live Exchange Rate Functions
// ============================================

/**
 * Check if the cached rates are still valid
 */
function isCacheValid(): boolean {
  if (!exchangeRateCache) return false;
  return Date.now() - exchangeRateCache.timestamp < CACHE_DURATION_MS;
}

/**
 * Get the current exchange rate source
 */
export function getExchangeRateSource(): 'live' | 'fallback' | 'cached' {
  if (!exchangeRateCache) return 'fallback';
  if (isCacheValid()) {
    return exchangeRateCache.source === 'live' ? 'cached' : 'fallback';
  }
  return 'fallback';
}

/**
 * Get the timestamp of the last rate update
 */
export function getLastRateUpdate(): Date | null {
  if (!exchangeRateCache) return null;
  return new Date(exchangeRateCache.timestamp);
}

/**
 * Fetch live exchange rates from free APIs
 * Tries multiple free APIs as fallbacks
 */
export async function fetchLiveExchangeRates(): Promise<{
  success: boolean;
  source: string;
  rates?: Record<string, number>;
  error?: string;
}> {
  // Return cached rates if still valid
  if (isCacheValid() && exchangeRateCache) {
    return {
      success: true,
      source: 'cache',
      rates: exchangeRateCache.rates,
    };
  }

  // List of free exchange rate APIs to try (no API key required)
  const apis = [
    {
      name: 'exchangerate-api (open)',
      url: 'https://open.er-api.com/v6/latest/USD',
      parseRates: (data: { rates?: Record<string, number> }) => data.rates,
    },
    {
      name: 'frankfurter.app',
      url: 'https://api.frankfurter.app/latest?from=USD',
      parseRates: (data: { rates?: Record<string, number> }) => {
        // Frankfurter returns rates relative to USD, need to add USD: 1
        return data.rates ? { USD: 1, ...data.rates } : undefined;
      },
    },
    {
      name: 'fawazahmed0/exchange-api',
      url: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
      parseRates: (data: { usd?: Record<string, number> }) => {
        // This API returns lowercase currency codes, need to uppercase them
        if (!data.usd) return undefined;
        const rates: Record<string, number> = {};
        for (const [code, rate] of Object.entries(data.usd)) {
          rates[code.toUpperCase()] = rate;
        }
        return rates;
      },
    },
  ];

  for (const api of apis) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(api.url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const data = await response.json();
      const rates = api.parseRates(data);

      if (rates && Object.keys(rates).length > 0) {
        // Update the global exchange rates with live data
        const updatedRates = { ...FALLBACK_EXCHANGE_RATES };
        const ratesRecord = rates as Record<string, number>;
        
        for (const code of Object.keys(FALLBACK_EXCHANGE_RATES) as CurrencyCode[]) {
          if (ratesRecord[code] !== undefined) {
            updatedRates[code] = ratesRecord[code];
          }
        }

        // Update cache
        exchangeRateCache = {
          rates: updatedRates,
          timestamp: Date.now(),
          source: 'live',
        };

        // Update global rates
        EXCHANGE_RATES = updatedRates;

        return {
          success: true,
          source: api.name,
          rates: updatedRates,
        };
      }
    } catch {
      // Try next API
      continue;
    }
  }

  // All APIs failed, use fallback
  exchangeRateCache = {
    rates: FALLBACK_EXCHANGE_RATES,
    timestamp: Date.now(),
    source: 'fallback',
  };

  return {
    success: false,
    source: 'fallback',
    rates: FALLBACK_EXCHANGE_RATES,
    error: 'All exchange rate APIs failed, using fallback rates',
  };
}

/**
 * Initialize exchange rates (call on app startup)
 * This fetches live rates and updates the cache
 */
export async function initializeExchangeRates(): Promise<void> {
  await fetchLiveExchangeRates();
}

/**
 * Force refresh exchange rates (bypasses cache)
 */
export async function refreshExchangeRates(): Promise<{
  success: boolean;
  source: string;
  error?: string;
}> {
  // Clear cache to force refresh
  exchangeRateCache = null;
  const result = await fetchLiveExchangeRates();
  return {
    success: result.success,
    source: result.source,
    error: result.error,
  };
}

