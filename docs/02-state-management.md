# State Management

This document covers the comprehensive state management system in Darch, built with Zustand and organized into modular stores.

## Overview

Darch uses Zustand for state management with the following key features:
- **Modular Store Design**: Separate stores for different concerns
- **Immer Integration**: Immutable state updates
- **Persistence**: Local storage persistence for key data
- **DevTools**: Redux DevTools integration for debugging
- **TypeScript**: Full type safety throughout

## Store Architecture

### Store Structure
```
lib/stores/
├── index.ts                     # Central exports
├── architecture/               # Architecture data management
│   └── architecture-store.ts  # Main architecture store
├── canvas/                    # Canvas-specific state
│   └── canvas-store.ts       # Canvas interactions
├── configuration/            # Configuration management
│   ├── configuration-store.ts      # Node configurations
│   ├── configuration-utils.ts      # Configuration helpers
│   └── default-configurations.ts   # Default values
├── ui/                       # UI state
│   └── ui-store.ts          # Sidebar, modals, etc.
├── validation/              # Validation state
│   └── validation-store.ts # Form validation
├── hooks/                   # Store-aware hooks
├── debug/                   # Development tools
└── configuration-context.tsx # React context
```

## Core Stores

### 1. Architecture Store (`architecture/architecture-store.ts`)

**Purpose**: Manages the main architecture data, nodes, connections, and file operations.

**Key State**:
```typescript
interface ArchitectureState {
  currentData: ArchitectureData | null;
  nodeConfigurations: Record<string, AWSResourceConfiguration>;
  selectedNodeId: string | null;
  isLoading: boolean;
  currentFileName: string;
  hasUnsavedChanges: boolean;
  autoSaveTimeout: NodeJS.Timeout | null;
}
```

**Key Actions**:
```typescript
interface ArchitectureActions {
  // Core data management
  createNew: (metadata?: Partial<ArchitectureMetadata>) => ArchitectureData;
  clear: () => void;
  getCurrentData: () => ArchitectureData | null;

  // Node management
  addNode: (node: Node) => string;
  removeNode: (nodeId: string) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  updateFromReactFlow: (nodes: Node[], edges: Edge[]) => void;

  // Configuration management
  updateNodeConfiguration: (nodeId: string, config: Partial<AWSResourceConfiguration>) => void;
  getNodeConfiguration: (nodeId: string) => AWSResourceConfiguration | null;

  // File operations
  loadFromJSON: (jsonData: ArchitectureData) => { nodes: Node[]; edges: Edge[] };
  exportToJSON: () => ArchitectureData | null;
  importFromFile: (file: File) => Promise<{ nodes: Node[]; edges: Edge[] }>;
  exportToFile: (filename?: string) => void;
}
```

**Usage Example**:
```typescript
import { useArchitectureStore } from '@/lib/stores';

function MyComponent() {
  const { 
    currentData, 
    addNode, 
    updateNodeConfiguration,
    exportToFile 
  } = useArchitectureStore();

  const handleAddNode = (node: Node) => {
    const nodeId = addNode(node);
    console.log('Added node:', nodeId);
  };

  const handleExport = () => {
    exportToFile('my-architecture.json');
  };
}
```

**Key Features**:
- **Auto-Save**: Debounced auto-save with 1-second delay
- **Unique ID Generation**: Ensures all nodes have unique IDs
- **Configuration Integration**: Links ReactFlow nodes with AWS configurations
- **Persistence**: Persists current data and configurations to localStorage

### 2. Canvas Store (`canvas/canvas-store.ts`)

**Purpose**: Manages canvas-specific state like zoom, pan, selection, and viewport.

**Key State**:
```typescript
interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  selectedNodes: string[];
  selectedEdges: string[];
  selectedNode: Node | null;
  isDragging: boolean;
  isSelecting: boolean;
  selectionBox: { x: number; y: number; width: number; height: number } | null;
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
}
```

**Key Actions**:
```typescript
interface CanvasActions {
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setSelectedNodes: (nodeIds: string[]) => void;
  setSelectedNode: (node: Node | null) => void;
  addSelectedNode: (nodeId: string) => void;
  removeSelectedNode: (nodeId: string) => void;
  clearSelection: () => void;
  setDragging: (isDragging: boolean) => void;
  setSelecting: (isSelecting: boolean) => void;
  setSelectionBox: (box: SelectionBox | null) => void;
  setCanvasSize: (width: number, height: number) => void;
  setBackgroundColor: (color: string) => void;
}
```

**Usage Example**:
```typescript
import { useCanvasStore } from '@/lib/stores';

function CanvasComponent() {
  const { 
    zoom, 
    selectedNode, 
    setZoom, 
    setSelectedNode 
  } = useCanvasStore();

  const handleZoomIn = () => setZoom(Math.min(zoom * 1.2, 3));
  const handleNodeSelect = (node: Node) => setSelectedNode(node);
}
```

### 3. UI Store (`ui/ui-store.ts`)

**Purpose**: Manages UI state like sidebar visibility, modal states, and user preferences.

**Key State**:
```typescript
interface UIState {
  isSidebarOpen: boolean;
  isConfigurationSidebarVisible: boolean;
  isHelpOpen: boolean;
  isSettingsOpen: boolean;
  expandedCategories: Set<string>;
  theme: 'light' | 'dark';
  notifications: Notification[];
}
```

**Key Actions**:
```typescript
interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleConfigurationSidebar: () => void;
  setConfigurationSidebarVisible: (isVisible: boolean) => void;
  setHelpOpen: (isOpen: boolean) => void;
  toggleHelp: () => void;
  setSettingsOpen: (isOpen: boolean) => void;
  toggleCategory: (category: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}
```

**Usage Example**:
```typescript
import { useUIStore } from '@/lib/stores';

function HeaderComponent() {
  const { 
    isSidebarOpen, 
    toggleSidebar, 
    isHelpOpen, 
    setHelpOpen 
  } = useUIStore();

  return (
    <div>
      <button onClick={toggleSidebar}>
        {isSidebarOpen ? 'Close' : 'Open'} Sidebar
      </button>
      <button onClick={() => setHelpOpen(true)}>
        Help
      </button>
    </div>
  );
}
```

### 4. Configuration Store (`configuration/configuration-store.ts`)

**Purpose**: Manages AWS resource configurations and form state.

**Key State**:
```typescript
interface ConfigurationState {
  configurations: Record<string, AWSResourceConfiguration>;
  activeFormId: string | null;
  formData: Record<string, unknown>;
  validationErrors: Record<string, string[]>;
  isFormDirty: boolean;
  defaultValues: Record<string, AWSResourceConfiguration>;
}
```

**Key Actions**:
```typescript
interface ConfigurationActions {
  setConfiguration: (nodeId: string, config: AWSResourceConfiguration) => void;
  updateConfiguration: (nodeId: string, updates: Partial<AWSResourceConfiguration>) => void;
  getConfiguration: (nodeId: string) => AWSResourceConfiguration | null;
  deleteConfiguration: (nodeId: string) => void;
  setActiveForm: (nodeId: string | null) => void;
  updateFormData: (data: Record<string, unknown>) => void;
  setValidationErrors: (errors: Record<string, string[]>) => void;
  resetForm: () => void;
  saveForm: () => void;
}
```

### 5. Validation Store (`validation/validation-store.ts`)

**Purpose**: Manages form validation rules and error states.

**Key State**:
```typescript
interface ValidationState {
  rules: Record<string, ValidationRule[]>;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  isValid: boolean;
  validatedFields: Set<string>;
}
```

**Key Actions**:
```typescript
interface ValidationActions {
  addRule: (fieldName: string, rule: ValidationRule) => void;
  removeRule: (fieldName: string, ruleId: string) => void;
  validateField: (fieldName: string, value: unknown) => string[];
  validateForm: (formData: Record<string, unknown>) => boolean;
  clearErrors: (fieldName?: string) => void;
  setErrors: (fieldName: string, errors: string[]) => void;
  setWarnings: (fieldName: string, warnings: string[]) => void;
}
```

## Store Integration Patterns

### 1. Cross-Store Communication

Stores communicate through actions and shared state:

```typescript
// In ArchitectureDesigner component
const { selectedNode } = useCanvasStore();
const { updateNodeConfiguration } = useArchitectureStore();
const { setConfigurationSidebarVisible } = useUIStore();

const handleNodeDoubleClick = useCallback((node: Node) => {
  setSelectedNode(node); // Canvas store
  setConfigurationSidebarVisible(true); // UI store
  // Configuration automatically loads via selectedNode
}, []);
```

### 2. Store Composition

Complex operations combine multiple stores:

```typescript
const handleSaveArchitecture = useCallback(() => {
  const { currentData } = useArchitectureStore.getState();
  const { addNotification } = useUIStore.getState();
  
  try {
    exportToFile(currentData);
    addNotification({
      type: 'success',
      message: 'Architecture saved successfully'
    });
  } catch (error) {
    addNotification({
      type: 'error',
      message: 'Failed to save architecture'
    });
  }
}, []);
```

### 3. Selective Subscriptions

Components subscribe only to needed state slices:

```typescript
// Only subscribe to sidebar state
const isSidebarOpen = useUIStore(state => state.isSidebarOpen);

// Subscribe to multiple specific fields
const { zoom, selectedNode } = useCanvasStore(state => ({
  zoom: state.zoom,
  selectedNode: state.selectedNode
}));
```

## Persistence Strategy

### 1. Architecture Store Persistence
```typescript
persist(
  immer((set, get) => ({
    // ... store implementation
  })),
  {
    name: 'architecture-data',
    partialize: (state) => ({
      currentData: state.currentData,
      nodeConfigurations: state.nodeConfigurations,
      currentFileName: state.currentFileName,
    }),
  }
)
```

**Persisted Data**:
- Current architecture data
- Node configurations
- Current filename
- User preferences

**Excluded from Persistence**:
- Loading states
- Temporary UI states
- Auto-save timeouts

### 2. UI Store Persistence
```typescript
persist(
  (set, get) => ({
    // ... store implementation
  }),
  {
    name: 'ui-preferences',
    partialize: (state) => ({
      isSidebarOpen: state.isSidebarOpen,
      expandedCategories: Array.from(state.expandedCategories),
      theme: state.theme,
    }),
  }
)
```

## Development Tools

### 1. Store Debugger Component
**Location**: `lib/stores/debug/store-debugger.tsx`

A development component for debugging store state:

```typescript
export function StoreDebugger() {
  const architectureState = useArchitectureStore();
  const canvasState = useCanvasStore();
  const uiState = useUIStore();

  return (
    <div className="debug-panel">
      <h3>Architecture Store</h3>
      <pre>{JSON.stringify(architectureState, null, 2)}</pre>
      {/* ... other stores */}
    </div>
  );
}
```

**Usage**:
```typescript
// In development environment only
{process.env.NODE_ENV === 'development' && <StoreDebugger />}
```

### 2. Redux DevTools Integration

All stores include DevTools support:

```typescript
export const useArchitectureStore = create<State & Actions>()(
  devtools(
    persist(
      immer((set, get) => ({
        // store implementation
      })),
      { name: 'architecture-data' }
    ),
    { name: 'architecture-store' }
  )
);
```

## Store Utilities

### 1. Store-Aware Hooks
**Location**: `lib/stores/hooks/`

Custom hooks that combine multiple stores:

```typescript
export function useStoreIntegration() {
  const architecture = useArchitectureStore();
  const canvas = useCanvasStore();
  const ui = useUIStore();

  return {
    // Combined operations
    selectAndConfigureNode: (node: Node) => {
      canvas.setSelectedNode(node);
      ui.setConfigurationSidebarVisible(true);
    },
    
    // Computed values
    hasUnsavedChanges: architecture.hasUnsavedChanges,
    canSave: !!architecture.currentData,
  };
}
```

### 2. Type-Safe Store Access

All stores are fully typed with TypeScript:

```typescript
type ArchitectureStore = {
  currentData: ArchitectureData | null;
  addNode: (node: Node) => string;
  // ... other types
};

export const useArchitectureStore = create<ArchitectureStore>()(
  // store implementation
);
```

## Performance Considerations

### 1. Subscription Optimization
- Use selective subscriptions to avoid unnecessary re-renders
- Combine related state in single subscriptions
- Use useShallow for complex object selections

### 2. State Normalization
- Store complex data in normalized form
- Use lookup maps for O(1) access
- Separate UI state from business logic state

### 3. Action Optimization
- Batch related updates with Immer
- Use debouncing for frequent updates (auto-save)
- Minimize state mutations in actions

This comprehensive state management system provides a robust foundation for the Darch application, ensuring data consistency, performance, and maintainability across all features.
