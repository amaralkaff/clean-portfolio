"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ 
  theme: "light",
  toggleTheme: () => {} 
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [isAutoMode, setIsAutoMode] = useState<boolean>(true);

  useEffect(() => {
    // Function to check if it's nighttime (between 6 PM and 6 AM)
    const isNightTime = () => {
      const hours = new Date().getHours();
      return hours < 6 || hours >= 18;
    };

    // Set theme based on time
    const updateThemeByTime = () => {
      if (isAutoMode) {
        setTheme(isNightTime() ? "dark" : "light");
      }
    };

    // Initial theme setting
    updateThemeByTime();

    // Update theme every hour
    const interval = setInterval(updateThemeByTime, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAutoMode]);

  const toggleTheme = () => {
    setIsAutoMode(false);
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
} 