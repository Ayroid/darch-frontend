import React from 'react';
import { useConfigurationStore } from './configuration-store';

/**
 * Development utility component to inspect store state
 * Only include in development builds
 */
export const ConfigurationStoreDebugger: React.FC = () => {
  const {
    selectedNodeId,
    nodeConfigurations,
    validationErrors,
    isSidebarOpen,
  } = useConfigurationStore();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 p-4 bg-black bg-opacity-80 text-white text-xs rounded-lg max-w-sm max-h-60 overflow-auto z-50">
      <div className="font-bold mb-2">Configuration Store Debug</div>
      
      <div className="space-y-1">
        <div>Selected Node: {selectedNodeId || 'None'}</div>
        <div>Sidebar Open: {isSidebarOpen ? 'Yes' : 'No'}</div>
        <div>Configurations: {Object.keys(nodeConfigurations).length}</div>
        <div>Errors: {Object.keys(validationErrors).length}</div>
      </div>

      {selectedNodeId && (
        <div className="mt-2 pt-2 border-t border-gray-500">
          <div className="font-semibold">Current Config:</div>
          <pre className="text-xs">
            {JSON.stringify(nodeConfigurations[selectedNodeId], null, 2)}
          </pre>
        </div>
      )}

      {Object.keys(validationErrors).length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-500">
          <div className="font-semibold">Validation Errors:</div>
          <pre className="text-xs">
            {JSON.stringify(validationErrors, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
