"use client";

import React from 'react';
import { Undo, Redo } from 'lucide-react';

interface UndoRedoControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export default function UndoRedoControls({ canUndo, canRedo, onUndo, onRedo }: UndoRedoControlsProps) {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center space-x-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`p-2 rounded-md transition-colors ${
          canUndo 
            ? 'hover:bg-gray-100 text-gray-700' 
            : 'text-gray-300 cursor-not-allowed'
        }`}
        title="Undo (Ctrl+Z)"
      >
        <Undo className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-300" />
      
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`p-2 rounded-md transition-colors ${
          canRedo 
            ? 'hover:bg-gray-100 text-gray-700' 
            : 'text-gray-300 cursor-not-allowed'
        }`}
        title="Redo (Ctrl+Y)"
      >
        <Redo className="w-4 h-4" />
      </button>
    </div>
  );
}
