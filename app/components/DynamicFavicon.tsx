'use client';

import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function DynamicFavicon() {
  const { theme } = useTheme();

  useEffect(() => {
    // Function to update favicon
    const updateFavicon = (isDark: boolean) => {
      const faviconPath = isDark ? '/favicon-dark.svg' : '/favicon-light.svg';
      
      // Find existing favicon link or create new one
      let iconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.rel = 'icon';
        iconLink.type = 'image/svg+xml';
        document.head.appendChild(iconLink);
      }
      
      // Update the href with cache busting
      iconLink.href = `${faviconPath}?v=${Date.now()}`;
      
      // Also update apple touch icon
      let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
      
      if (!appleLink) {
        appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        document.head.appendChild(appleLink);
      }
      
      appleLink.href = `${faviconPath}?v=${Date.now()}`;
      
      // Force browser to reload favicon
      const shortcutIcon = document.querySelector("link[rel='shortcut icon']") as HTMLLinkElement;
      if (shortcutIcon) {
        shortcutIcon.href = `${faviconPath}?v=${Date.now()}`;
      }
    };

    // Function to detect current theme (including system preference)
    const detectCurrentTheme = () => {
      if (theme) {
        // Use theme from context if available
        return theme === 'dark';
      }
      
      // Fallback to system preference if theme context not ready
      if (typeof window !== 'undefined') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const hasAutoMode = document.documentElement.classList.contains('auto');
        
        if (hasAutoMode) {
          // Check time-based auto mode (6 PM - 6 AM = dark)
          const hour = new Date().getHours();
          return hour >= 18 || hour < 6;
        }
        
        return prefersDark;
      }
      
      return false; // Default to light
    };

    // Update favicon immediately and on theme changes
    updateFavicon(detectCurrentTheme());
  }, [theme]);

  // Also listen for system theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemThemeChange = () => {
        // Only update if theme context is not set (using system preference)
        if (!theme) {
          updateFavicon(mediaQuery.matches);
        }
      };
      
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }
  }, [theme]);

  return null;
}