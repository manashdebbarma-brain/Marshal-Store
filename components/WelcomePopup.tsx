'use client';

import { useState, useEffect } from 'react';

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already hidden the popup today
    const hiddenDate = localStorage.getItem('hide_welcome_popup_date');
    const today = new Date().toISOString().split('T')[0]; // e.g. "2026-09-29"

    // If they haven't hidden it today, show the popup
    if (hiddenDate !== today) {
      // Small delay so the page loads smoothly first
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleHideForToday = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('hide_welcome_popup_date', today);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      {/* Card: White in day mode, dark in night mode */}
      <div className="relative w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-colors
                      bg-white dark:bg-slate-900 
                      border-slate-200 dark:border-slate-700 
                      text-slate-900 dark:text-slate-100">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-xl font-bold transition-colors
                     text-slate-400 hover:text-black dark:hover:text-white"
          aria-label="Close popup"
        >
          ✕
        </button>

        <div className="space-y-4 text-center">
          
          {/* Badge */}
          <div className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider
                          bg-indigo-100 text-indigo-700 border border-indigo-200
                          dark:bg-indigo-600/20 dark:text-indigo-400 dark:border-indigo-500/30">
            Marshal Store Exclusive
          </div>

          {/* Title & Description */}
          <h2 className="text-2xl font-black text-black dark:text-white">
            JOIN OUR WHATSAPP CHANNEL
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Stay connected, stay ahead. Get instant updates on flash sales, limited-time offers, and free giveaways!
          </p>

          {/* Call to Action Button */}
          <a 
            href="https://whatsapp.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full rounded-xl bg-emerald-500 py-3 text-center font-bold text-white shadow-lg transition
                       hover:bg-emerald-600 shadow-emerald-500/30"
          >
            Click on WhatsApp Icon to Join
          </a>

          {/* Hide for Today Checkbox */}
          <div className="flex items-center justify-center space-x-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
            <input 
              type="checkbox" 
              id="hideToday" 
              onChange={handleHideForToday} 
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
            />
            <label htmlFor="hideToday" className="cursor-pointer select-none">
              Hide for today
            </label>
          </div>

        </div>
      </div>
    </div>
  );
}