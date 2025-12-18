//Oisin Gibson - L00172671
//Currency Selector component

/**
 * REFERENCES:
 * - Select Element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select
 * - React Context Hook: https://react.dev/reference/react/useContext
 * - Controlled Components: https://react.dev/reference/react-dom/components/select
 */

import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import './CurrencySelector.css';

/**
 * CurrencySelector Component
 * Renders a dropdown to select the display currency
 * Shows currency symbol and code (e.g., "€ EUR")
 * 
 * Features:
 * - Displays all available currencies from CurrencyContext
 * - Updates currency selection globally across the app
 * - Persists user preference in localStorage (handled by context)
 * - Accessible with proper ARIA labels
 */
export default function CurrencySelector() {
  // Get currency state and functions from CurrencyContext
  // - currency: currently selected currency code (e.g., 'EUR', 'USD')
  // - setCurrency: function to update the selected currency
  // - currencies: array of all available currency codes
  // - getCurrencyInfo: function to get currency details (symbol, name, rate)
  const { currency, setCurrency, currencies, getCurrencyInfo } = useCurrency();

  return (
    // Wrapper div for styling the selector component
    <div className="currency-selector">
      {/* Dropdown select element for currency selection */}
      <select 
        // Controlled component: value bound to current currency state
        value={currency} 
        // Update currency when user selects a new option
        // Event handler extracts the selected value and updates context
        onChange={(e) => setCurrency(e.target.value)}
        className="currency-select"
        // Accessibility: Screen readers will announce this as "Select currency"
        aria-label="Select currency"
      >
        {/* Map through all available currencies to create option elements */}
        {currencies.map(code => {
          // Get detailed info for this currency (symbol, name, exchange rate)
          const info = getCurrencyInfo(code);
          return (
            // Each option shows the symbol followed by the currency code
            // Example: "€ EUR", "$ USD", "£ GBP", "¥ JPY"
            <option key={code} value={code}>
              {info.symbol} {code}
            </option>
          );
        })}
      </select>
    </div>
  );
}
