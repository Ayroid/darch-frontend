# Zustand Store Documentation

## Store Overview

The Zustand store system has been **fully migrated** to a modular architecture with separate stores for different concerns. Each store is focused on a specific domain and can be used independently or in combination with others.

## ✅ Migration Status: **COMPLETE**

All components have been updated to use the new store structure. The old monolithic store has been removed and replaced with focused, domain-specific stores.

## Store Architecture

### Directory Structure

```
lib/stores/
├── canvas/
│   ├── canvas-store.ts           # Canvas state (zoom, pan, selection)
│   └── undo-redo-store.ts        # Undo/redo state management
├── configuration/
│   ├── configuration-store.ts   # Node configurations management
│   └── default-configurations.ts # Default configs for AWS resources
├── ui/
│   └── ui-store.ts              # UI state (sidebars, panels, grid)
├── validation/
│   └── validation-store.ts      # Form validation and error handling
├── hooks/
│   ├── use-configuration-form.ts    # Configuration form integration
│   └── use-store-integration.ts     # Legacy form integration
├── debug/
│   └── store-debugger.tsx       # Development debugging component
└── configuration-context.tsx    # React context for configuration
```

---

## Individual Stores

### 1. Configuration Store (`configuration/configuration-store.ts`)

Manages AWS resource configurations for individual nodes.

#### State:
- `selectedNodeId`: Currently selected node ID
- `nodeConfigurations`: Configuration data per node
- `draftConfiguration`: Temporary configuration during editing

#### Key Actions:
- `setSelectedNode(nodeId)`: Select a node for configuration
- `updateNodeConfiguration(nodeId, updates)`: Update node config
- `setDraftConfiguration(config)`: Set temporary draft
- `exportConfigurations()`: Export all configurations

### 2. UI Store (`ui/ui-store.ts`)

Manages UI state including sidebars, panels, and canvas settings.

#### State:
- `isSidebarOpen`: Main sidebar visibility
- `isConfigurationSidebarVisible`: Configuration panel visibility
- `showGrid`: Grid visibility on canvas
- `snapToGrid`: Snap-to-grid functionality
- `showServicesSidebar`: Services panel visibility

#### Key Actions:
- `toggleConfigurationSidebar()`: Toggle config panel
- `setCanvasLocked(locked)`: Lock/unlock canvas
- `setGridSize(size)`: Set grid size
- `resetUIState()`: Reset all UI settings

### 3. Canvas Store (`canvas/canvas-store.ts`)

Manages canvas-specific state including viewport and selections.

#### State:
- `zoom`: Current zoom level (0.1 - 3.0)
- `panX`, `panY`: Canvas pan position
- `selectedNodes`: Array of selected node IDs
- `selectedEdges`: Array of selected edge IDs
- `isDragging`: Current drag state
- `selectionBox`: Multi-selection box coordinates

#### Key Actions:
- `setZoom(zoom)`: Set zoom level
- `zoomIn()`, `zoomOut()`: Zoom controls
- `selectNode(nodeId)`: Select a node
- `clearAllSelections()`: Clear all selections
- `setSelectionBox(box)`: Set selection rectangle

### 4. Undo/Redo Store (`canvas/undo-redo-store.ts`)

**NEW**: Enhanced undo/redo state management with action tracking and intelligent state saving.

#### State:
- `history`: Array of state snapshots with timestamps and actions
- `currentIndex`: Current position in history
- `maxHistorySize`: Maximum number of states to keep (default: 50)
- `isUndoing`: Flag to prevent saves during undo operations
- `isRedoing`: Flag to prevent saves during redo operations

#### Key Actions:
- `saveState(nodes, edges, action)`: Save current state with action description
- `undo()`: Move to previous state and return snapshot
- `redo()`: Move to next state and return snapshot
- `canUndo()`: Check if undo is possible
- `canRedo()`: Check if redo is possible
- `clearHistory()`: Clear all history
- `setMaxHistorySize(size)`: Configure history limit

#### State Snapshot:
```typescript
interface StateSnapshot {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
  action?: string; // e.g., 'node_add', 'edge_delete', 'paste'
}
```

#### Smart Features:
- **Deep State Comparison**: Prevents duplicate saves
- **Action Tracking**: Each state includes what action caused it
- **Conflict Prevention**: Won't save during undo/redo operations
- **Performance Optimized**: Efficient cloning and memory management

### 5. Validation Store (`validation/validation-store.ts`)

Handles form validation and error management.

#### State:
- `validationErrors`: Node-level validation errors
- `fieldErrors`: Field-level validation errors
- `validationRules`: Custom validation rules per service

#### Key Actions:
- `validateConfiguration(serviceId, config)`: Validate entire config
- `validateField(serviceId, field, value)`: Validate single field
- `setValidationErrors(nodeId, errors)`: Set validation errors
- `addValidationRule(serviceId, rule)`: Add custom validation

---

## Hooks

### `useUndoRedo()`

**NEW**: Enhanced undo/redo hook with action tracking.

```typescript
const {
  saveState,        // (nodes, edges, action?) => void
  undo,             // () => StateSnapshot | null
  redo,             // () => StateSnapshot | null
  canUndo,          // boolean
  canRedo,          // boolean
  clearHistory,     // () => void
  getHistoryInfo,   // () => HistoryInfo
  setMaxHistorySize // (size: number) => void
} = useUndoRedo();
```

### `useCanvasUndoRedo()`

**NEW**: Canvas-specific undo/redo hook with operation-based saving.

```typescript
const {
  undo,                      // Core undo/redo
  redo,
  canUndo,
  canRedo,
  saveCanvasState,           // General state saving
  saveAfterNodeOperation,    // Node-specific: add, delete, move, resize, configure
  saveAfterEdgeOperation,    // Edge-specific: add, delete
  saveAfterBulkOperation,    // Bulk: paste, duplicate, import
  debouncedSave,            // Debounced saving with configurable delay
  clearHistory
} = useCanvasUndoRedo();
```

### `useConfigurationForm(nodeId)`

Primary hook for configuration forms with integrated validation.

```typescript
const {
  config,           // Current configuration
  errors,           // Validation errors
  fieldErrors,      // Field-specific errors
  updateField,      // Update single field
  updateFields,     // Update multiple fields
  validateConfig,   // Validate entire config
  setDraft,         // Set draft configuration
} = useConfigurationForm(nodeId);
```

### `useStoreIntegration(nodeId, serviceId, config, onChange)`

Legacy integration hook for existing forms.

```typescript
const { handleConfigChange } = useStoreIntegration(
  nodeId,
  serviceId,
  config,
  onChange
);
```

### `useStoreAwareConfig(nodeId, serviceId, config, onChange)`

Simplified hook that returns an `updateConfig` function.

```typescript
const updateConfig = useStoreAwareConfig(nodeId, serviceId, config, onChange);
// Usage: updateConfig('fieldName', value)
```

---

## Default Configurations

Default configurations are provided for all AWS resource types:

- **`aws-vpc`**: VPC with basic networking settings
- **`aws-ec2`**: EC2 instance with t3.micro defaults
- **`aws-region`**: AWS region configuration
- **`aws-availability-zone`**: Availability zone settings
- **`aws-private-subnet`**: Private subnet configuration
- **`aws-public-subnet`**: Public subnet configuration

Access via: `getDefaultConfiguration(serviceId)`

---

## Validation System

### Built-in Validation Rules

Each AWS service type has built-in validation:

- **VPC**: Requires name, CIDR block, and region
- **EC2**: Requires name, instance type, and AMI ID
- **Subnets**: Require name, CIDR block, and availability zone

### Custom Validation Rules

```typescript
interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => string | null;
}
```

Example:
```typescript
useValidationStore().addValidationRule('aws-vpc', {
  field: 'cidrBlock',
  required: true,
  pattern: /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/,
  custom: (value) => {
    if (typeof value === 'string' && !isValidCIDR(value)) {
      return 'Invalid CIDR format';
    }
    return null;
  }
});
```

---

## Development Utilities

### Store Debugger

The `StoreDebugger` component provides real-time inspection of all store states.

#### Features:
- **Keyboard Shortcut**: `Ctrl + D` to toggle
- **Tabbed Interface**: Separate tabs for each store
- **Real-time Updates**: Live state inspection
- **Development Only**: Automatically hidden in production

#### Usage:
```typescript
import { StoreDebugger } from '@/lib/stores';

// Add to your app root (development only)
function App() {
  return (
    <div>
      {/* Your app */}
      <StoreDebugger />
    </div>
  );
}
```

---

## Migration Guide

### From Old Structure

1. **Update Imports**:
   ```typescript
   // Old
   import { useConfigurationStore } from '@/lib/stores/configuration-store';

   // New
   import { useConfigurationStore } from '@/lib/stores';
   ```

2. **Separate UI State**:
   ```typescript
   // Old
   const { isSidebarOpen } = useConfigurationStore();

   // New
   const { isSidebarOpen } = useUIStore();
   ```

3. **Use New Validation**:
   ```typescript
   // Old
   import { validateConfiguration } from '@/lib/stores/configuration-store';

   // New
   const { validateConfiguration } = useValidationStore();
   ```

### Backward Compatibility

The old exports are still available for gradual migration:
- `useConfigurationStoreDeprecated`
- `ConfigurationStoreDebugger`

---

## Best Practices

1. **Use Appropriate Store**: Choose the right store for your use case
2. **Validation Early**: Validate fields as users type, not just on submit
3. **Draft Management**: Use draft configurations for complex forms
4. **Error Handling**: Display both field-level and form-level errors
5. **Development Tools**: Use the debugger during development

---

This modular architecture provides better separation of concerns, improved maintainability, and enhanced debugging capabilities while maintaining backward compatibility.
