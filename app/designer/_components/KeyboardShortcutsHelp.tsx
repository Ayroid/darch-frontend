"use client";

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutSection {
  title: string;
  shortcuts: { key: string; description: string }[];
}

const shortcutSections: ShortcutSection[] = [
  {
    title: "Canvas Operations",
    shortcuts: [
      { key: "Ctrl/Cmd + C", description: "Copy selected nodes" },
      { key: "Ctrl/Cmd + V", description: "Paste copied nodes" },
      { key: "Ctrl/Cmd + D", description: "Duplicate selected nodes" },
      { key: "Ctrl/Cmd + A", description: "Select all nodes" },
      { key: "Delete / Backspace", description: "Delete selected nodes" },
      { key: "Escape", description: "Deselect all nodes" },
    ],
  },
  {
    title: "View Controls",
    shortcuts: [
      { key: "Ctrl/Cmd + 0", description: "Fit view to show all nodes" },
      { key: "Ctrl/Cmd + =", description: "Zoom in" },
      { key: "Ctrl/Cmd + -", description: "Zoom out" },
      { key: "Ctrl/Cmd + 1", description: "Reset zoom to 100%" },
      { key: "Space + Drag", description: "Pan the canvas" },
    ],
  },
  {
    title: "Node Manipulation",
    shortcuts: [
      { key: "Arrow Keys", description: "Move selected nodes (5px steps)" },
      { key: "Shift + Arrow Keys", description: "Move selected nodes (20px steps)" },
    ],
  },
  {
    title: "Application",
    shortcuts: [
      { key: "Ctrl/Cmd + N", description: "Create new architecture" },
      { key: "Ctrl/Cmd + S", description: "Save architecture" },
      { key: "T", description: "Toggle sidebar" },
      { key: "Y", description: "Toggle configuration sidebar (for selected node)" },
      { key: "F", description: "Toggle fullscreen mode" },
      { key: "?", description: "Show/hide this help" },
    ],
  },
];

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close modal when clicking on the backdrop (not the modal content)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-transparent flex items-center justify-center z-50 transition-opacity duration-200"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto transform transition-all duration-200 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {shortcutSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.shortcuts.map((shortcut, shortcutIndex) => (
                  <div
                    key={shortcutIndex}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center space-x-1">
                      {shortcut.key.split(' + ').map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          {keyIndex > 0 && (
                            <span className="text-gray-400 text-xs">+</span>
                          )}
                          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono text-gray-800 shadow-sm">
                            {key}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t rounded-b-lg">
          <p className="text-sm text-gray-600">
            <strong>Tip:</strong> Most shortcuts work when the canvas is focused.
            Some shortcuts are disabled when typing in input fields.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Access this help anytime by pressing <kbd className="bg-gray-200 px-1 py-0.5 rounded text-xs">?</kbd> or clicking the shortcuts button <span className="inline-flex items-center"><kbd className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs">?</kbd></span> in the bottom right corner.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
