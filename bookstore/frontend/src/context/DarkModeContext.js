//Oisin Gibson - L00172671
//Dark Mode Context for site-wide theme management

// Import required dependencies
import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Create Dark Mode Context
 * This context allows dark mode state to be shared across all components
 * without prop drilling (passing props through multiple component levels)
 */
const DarkModeContext = createContext();

/**
 * useDarkMode Hook
 * Custom hook that provides access to dark mode state and toggle function
 * Must be used within a DarkModeProvider component
 * 
 * @returns {Object} { isDarkMode, toggleDarkMode }
 * @throws {Error} If used outside of DarkModeProvider
 */
export function useDarkMode() {
  const context = useContext(DarkModeContext);
  // Throw error if hook is used outside of provider (developer mistake prevention)
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
}

/**
 * DarkModeProvider Component
 * Wraps the application to provide dark mode state to all child components
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components that will have access to dark mode context
 *                                           This is a special React prop that represents all components
 *                                           nested inside this provider (e.g., <DarkModeProvider><App /></DarkModeProvider>)
 *                                           The {children} in the return statement renders those nested components
 */
export function DarkModeProvider({ children }) {
  /**
   * Dark mode state
   * Initializes from localStorage to persist user preference across sessions
   * If no saved preference exists, defaults to light mode (false)
   */
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved preference on initial load
    const saved = localStorage.getItem('darkMode');
    // Parse the saved string value, or default to false (light mode)
    return saved ? JSON.parse(saved) : false;
  });

  /**
   * Effect: Sync dark mode state with DOM and localStorage
   * Runs whenever isDarkMode changes
   */
  useEffect(() => {
    // Save current preference to localStorage for persistence
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    
    // Update document root element class for global CSS styling
    // All CSS rules prefixed with .dark will apply when this class is present
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  /**
   * toggleDarkMode function
   * Toggles between light and dark mode
   * Uses functional setState to ensure correct state update based on previous value
   */
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  /**
   * Context Provider
   * Wraps all {children} components with dark mode context
   * Makes isDarkMode state and toggleDarkMode function available to all nested components
   * 
   * Example usage in App.js:
   * <DarkModeProvider>
   *   <Header />     <- These are the "children"
   *   <BookList />   <- They can all use useDarkMode() hook
   *   <Footer />     <- to access dark mode state
   * </DarkModeProvider>
   */
  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}
