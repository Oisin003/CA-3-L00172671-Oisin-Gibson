//Oisin Gibson - L00172671
//Currency Context for site-wide currency conversion

/**
 * REFERENCES:
 * - React Context API: https://react.dev/reference/react/createContext
 * - useContext Hook: https://react.dev/reference/react/useContext
 * - Number.toFixed(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed
 * - localStorage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
 * - Exchange Rates: https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Exchange rates (approximate, based on typical rates)
 * Base currency: EUR (Euro)
 * In a real application, these would be fetched from an API like:
 * - https://api.exchangerate-api.com/
 * - https://openexchangerates.org/
 */
const EXCHANGE_RATES = {
  EUR: { rate: 1, symbol: '€', name: 'Euro' },
  USD: { rate: 1.09, symbol: '$', name: 'US Dollar' },
  GBP: { rate: 0.86, symbol: '£', name: 'British Pound' },
  JPY: { rate: 163.5, symbol: '¥', name: 'Japanese Yen' }
};

/**
 * Create Currency Context
 * This context allows currency state to be shared across all components
 */
const CurrencyContext = createContext();

/**
 * useCurrency Hook
 * Custom hook that provides access to currency state and conversion functions
 * Must be used within a CurrencyProvider component
 * 
 * @returns {Object} { currency, setCurrency, convertPrice, formatPrice, currencies }
 * @throws {Error} If used outside of CurrencyProvider
 */
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

/**
 * CurrencyProvider Component
 * Wraps the application to provide currency conversion to all child components
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components that will have access to currency context
 */
export function CurrencyProvider({ children }) {
  /**
   * Currency state
   * Initializes from localStorage to persist user preference across sessions
   * Defaults to EUR if no saved preference exists
   */
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('currency');
    return saved && EXCHANGE_RATES[saved] ? saved : 'EUR';
  });

  /**
   * Effect: Save currency preference to localStorage
   * Runs whenever currency changes
   */
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  /**
   * Convert price from EUR to selected currency
   * @param {Number} priceInEUR - Price in Euros (base currency)
   * @returns {Number} Converted price in selected currency
   */
  const convertPrice = (priceInEUR) => {
    if (!priceInEUR || isNaN(priceInEUR)) return 0;
    const rate = EXCHANGE_RATES[currency].rate;
    return priceInEUR * rate;
  };

  /**
   * Format price with currency symbol
   * @param {Number} priceInEUR - Price in Euros (base currency)
   * @param {Number} decimals - Number of decimal places (default: 2)
   * @returns {String} Formatted price string with symbol (e.g., "$12.50")
   */
  const formatPrice = (priceInEUR, decimals = 2) => {
    const converted = convertPrice(priceInEUR);
    const symbol = EXCHANGE_RATES[currency].symbol;
    
    // For JPY, use 0 decimals as it doesn't use cents
    const decimalPlaces = currency === 'JPY' ? 0 : decimals;
    
    return `${symbol}${converted.toFixed(decimalPlaces)}`;
  };

  /**
   * Get list of available currencies
   * @returns {Array} Array of currency codes
   */
  const currencies = Object.keys(EXCHANGE_RATES);

  /**
   * Get currency info
   * @param {String} code - Currency code (e.g., 'USD')
   * @returns {Object} Currency information { rate, symbol, name }
   */
  const getCurrencyInfo = (code) => {
    return EXCHANGE_RATES[code] || EXCHANGE_RATES.EUR;
  };

  // Context value provided to all children
  const value = {
    currency,
    setCurrency,
    convertPrice,
    formatPrice,
    currencies,
    getCurrencyInfo
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}
