'use client';

import React from 'react';
import ThemeSwitcher from '@/components/ThemeSwitcher';

const ThemeTestPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg transition-colors duration-300">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <header className="flex items-center justify-between mb-8 p-4 bg-[#F4F4F7] dark:bg-dark-bg-secondary rounded-lg">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
              CampusFusion - Theme Test
            </h1>
            <ThemeSwitcher />
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-dark-bg-secondary p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-border">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">
                Sample Card
              </h2>
              <p className="text-gray-600 dark:text-dark-text-secondary mb-4">
                This is a sample card showing how the theme switcher affects different components.
              </p>
              <button className="bg-campDarwinCobaltBlue hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                Sample Button
              </button>
            </div>
            
            <div className="bg-white dark:bg-dark-bg-secondary p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-border">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">
                Navigation Menu
              </h2>
              <nav className="space-y-2">
                <a href="#" className="block text-gray-600 dark:text-dark-text-secondary hover:text-campDarwinCobaltBlue dark:hover:text-dark-accent py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors">
                  Home
                </a>
                <a href="#" className="block text-gray-600 dark:text-dark-text-secondary hover:text-campDarwinCobaltBlue dark:hover:text-dark-accent py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors">
                  Students
                </a>
                <a href="#" className="block text-gray-600 dark:text-dark-text-secondary hover:text-campDarwinCobaltBlue dark:hover:text-dark-accent py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors">
                  Teachers
                </a>
              </nav>
            </div>
          </div>
          
          <div className="bg-white dark:bg-dark-bg-secondary p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-border">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">
              Theme Features
            </h2>
            <ul className="space-y-2 text-gray-600 dark:text-dark-text-secondary">
              <li>✅ Light/Dark mode toggle with sun/moon icons</li>
              <li>✅ System preference detection</li>
              <li>✅ localStorage persistence</li>
              <li>✅ Smooth transitions between themes</li>
              <li>✅ Proper hydration handling</li>
              <li>✅ Tailwind CSS dark mode support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeTestPage;