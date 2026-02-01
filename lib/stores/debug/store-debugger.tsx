import React, { useState, useEffect } from 'react';
import { useArchitectureStore } from '../architecture/architecture-store';
import { useValidationStore } from '../validation/validation-store';
import { useUIStore } from '../ui/ui-store';
import { useCanvasStore } from '../canvas/canvas-store';

/**
 * Development utility component to inspect all store states
 * Only include in development builds
 * Toggle with Ctrl + D
 */
export const StoreDebugger: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'validation' | 'ui' | 'canvas'>('config');

  // Configuration from unified Architecture store
  const {
    selectedResourceId,
    resourceConfigurations,
  } = useArchitectureStore();

  // Validation store
  const { validationErrors, fieldErrors } = useValidationStore();

  // UI store
  const {
    isSidebarOpen,
    isConfigurationSidebarVisible,
    showGrid,
    snapToGrid,
  } = useUIStore();

  // Canvas store
  const {
    zoom,
    panX,
    panY,
    selectedNodes,
    selectedEdges,
    isDragging,
  } = useCanvasStore();

  // Add keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  const tabs = [
    { id: 'config', label: 'Config', count: Object.keys(resourceConfigurations).length },
    { id: 'validation', label: 'Validation', count: Object.keys(validationErrors).length },
    { id: 'ui', label: 'UI', count: 0 },
    { id: 'canvas', label: 'Canvas', count: selectedNodes.length },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'config':
        return (
          <div className="space-y-2">
            <div>Selected Resource: {selectedResourceId || 'None'}</div>
            <div>Configurations: {Object.keys(resourceConfigurations).length}</div>

            {selectedResourceId && resourceConfigurations[selectedResourceId] && (
              <div className="mt-2 pt-2 border-t border-gray-500">
                <div className="font-semibold">Current Config:</div>
                <pre className="text-xs overflow-auto max-h-32">
                  {JSON.stringify(resourceConfigurations[selectedResourceId], null, 2)}
                </pre>
              </div>
            )}
          </div>
        );

      case 'validation':
        return (
          <div className="space-y-2">
            <div>Node Errors: {Object.keys(validationErrors).length}</div>
            <div>Field Errors: {Object.keys(fieldErrors).length}</div>

            {Object.keys(validationErrors).length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-500">
                <div className="font-semibold">Validation Errors:</div>
                <pre className="text-xs overflow-auto max-h-32">
                  {JSON.stringify(validationErrors, null, 2)}
                </pre>
              </div>
            )}
          </div>
        );

      case 'ui':
        return (
          <div className="space-y-1">
            <div>Sidebar Open: {isSidebarOpen ? 'Yes' : 'No'}</div>
            <div>Config Sidebar: {isConfigurationSidebarVisible ? 'Yes' : 'No'}</div>
            <div>Show Grid: {showGrid ? 'Yes' : 'No'}</div>
            <div>Snap to Grid: {snapToGrid ? 'Yes' : 'No'}</div>
          </div>
        );

      case 'canvas':
        return (
          <div className="space-y-1">
            <div>Zoom: {(zoom * 100).toFixed(0)}%</div>
            <div>Pan: ({panX.toFixed(0)}, {panY.toFixed(0)})</div>
            <div>Selected Nodes: {selectedNodes.length}</div>
            <div>Selected Edges: {selectedEdges.length}</div>
            <div>Dragging: {isDragging ? 'Yes' : 'No'}</div>

            {selectedNodes.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-500">
                <div className="font-semibold">Selected:</div>
                <div className="text-xs">{selectedNodes.join(', ')}</div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-4 left-4 p-4 bg-black bg-opacity-90 text-white text-xs rounded-lg max-w-md max-h-80 overflow-hidden z-50">
      <div className="flex justify-between items-center mb-3">
        <div className="font-bold">Store Debugger</div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">(Ctrl+D)</span>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex space-x-1 mb-3 border-b border-gray-600 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1 px-1 bg-gray-600 rounded">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="overflow-auto max-h-52">
        {renderTabContent()}
      </div>
    </div>
  );
};
