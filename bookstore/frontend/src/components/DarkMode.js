//Oisin Gibson - L00172671
//Advanced Dark Mode Toggle with System Support for the BookStore application

import React, { useState, useEffect } from 'react';

function DarkModeToggle() {
  const [theme, setTheme] = useState('system'); // 'light', 'dark', 'system'
  const [isDark, setIsDark] = useState(false);

  // Apply theme and update dark mode state
  const applyTheme = (newTheme) => {
    let shouldBeDark = false;

    if (newTheme === 'dark') {
      shouldBeDark = true;
      localStorage.theme = 'dark';
    } else if (newTheme === 'light') {
      shouldBeDark = false;
      localStorage.theme = 'light';
    } else {
      // system theme
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      localStorage.removeItem('theme');
    }

    document.documentElement.classList.toggle('dark', shouldBeDark);
    setIsDark(shouldBeDark);
    setTheme(newTheme);
  };

  // Initialize theme on component mount
  useEffect(() => {
    let currentTheme = 'system';
    
    if (localStorage.theme === 'dark') {
      currentTheme = 'dark';
    } else if (localStorage.theme === 'light') {
      currentTheme = 'light';
    }

    applyTheme(currentTheme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (!localStorage.theme) {
        applyTheme('system');
      }
    };

    mediaQuery.addListener(handleSystemThemeChange);
    return () => mediaQuery.removeListener(handleSystemThemeChange);
  }, []);

  // Cycle through themes: light -> dark -> system
  const cycleTheme = () => {
    if (theme === 'light') {
      applyTheme('dark');
    } else if (theme === 'dark') {
      applyTheme('system');
    } else {
      applyTheme('light');
    }
  };

  // Get icon based on current theme
  const getIcon = () => {
    if (theme === 'light') {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      );
    } else if (theme === 'dark') {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      );
    } else {
      // system theme
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 17H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  const getTooltip = () => {
    switch (theme) {
      case 'light': return 'Switch to dark mode';
      case 'dark': return 'Switch to system theme';
      case 'system': return 'Switch to light mode';
      default: return 'Toggle theme';
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={getTooltip()}
      title={getTooltip()}
    >
      {getIcon()}
      {/* Small indicator for current theme */}
      <span className="sr-only">
        Current theme: {theme}
        {theme === 'system' && ` (${isDark ? 'dark' : 'light'})`}
      </span>
    </button>
  );
}

export default DarkModeToggle;
