"use client";

import React from 'react';
import { Keyboard } from 'lucide-react';

interface ShortcutsButtonProps {
  onClick: () => void;
}

export default function ShortcutsButton({ onClick }: ShortcutsButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-20 bg-white hover:bg-gray-50 border border-gray-300 rounded-full shadow-lg p-3 transition-all duration-300 hover:shadow-xl hover:scale-105 group"
      title="Keyboard Shortcuts (?)"
    >
      <div className="flex items-center justify-center">
        <Keyboard className="w-5 h-5 text-gray-600 group-hover:text-black transition-colors duration-200" />
      </div>
      
      {/* Small badge with "?" indicator */}
      <div className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-mono font-bold shadow-lg">
        ?
      </div>
      
      {/* Enhanced tooltip with sample shortcuts */}
      <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
        <div className="bg-gray-900 text-white text-xs rounded-lg px-4 py-3 whitespace-nowrap shadow-xl border border-gray-700">
          <div className="space-y-2">
            <div className="text-center mb-2">
              <span className="text-gray-300 font-medium">Quick Shortcuts</span>
            </div>
            <div className="flex justify-between items-center space-x-4">
              <span>Copy</span>
              <kbd className="bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl+C</kbd>
            </div>
            <div className="flex justify-between items-center space-x-4">
              <span>Paste</span>
              <kbd className="bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl+V</kbd>
            </div>
            <div className="flex justify-between items-center space-x-4">
              <span>Delete</span>
              <kbd className="bg-gray-700 px-2 py-1 rounded text-xs font-mono">Del</kbd>
            </div>
            <div className="flex justify-between items-center space-x-4">
              <span>Select All</span>
              <kbd className="bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl+A</kbd>
            </div>
            <div className="text-center pt-2 border-t border-gray-700">
              <span className="text-gray-400">Click or press <kbd className="bg-gray-700 px-1 py-0.5 rounded text-xs">?</kbd> for all shortcuts</span>
            </div>
          </div>
          
          {/* Arrow pointing down */}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-gray-900"></div>
        </div>
      </div>
      
      {/* Subtle pulse animation */}
      <div className="absolute inset-0 rounded-full bg-gray-100 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
    </button>
  );
}
