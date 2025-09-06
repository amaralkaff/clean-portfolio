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

    // Update favicon based on theme from context
    if (theme) {
      updateFavicon(theme === 'dark');
    }
  }, [theme]);


  return null;
}