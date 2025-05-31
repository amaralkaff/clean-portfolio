'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <motion.button
      onClick={toggleTheme}
      className={`fixed top-4 right-4 z-50 p-2 rounded-full backdrop-blur-sm transition-all duration-200
        ${theme === 'dark' 
          ? 'bg-transparent hover:bg-gray-700/30' 
          : 'bg-transparent hover:bg-gray-200/30'
        }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-white" />
      ) : (
        <Moon size={20} className="text-gray-800" />
      )}
    </motion.button>
  );
};

export default ThemeToggle; 