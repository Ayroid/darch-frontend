# Architecture Designer

This document covers the main architecture designer interface, which serves as the central hub for creating and editing cloud architecture diagrams.

## Overview

The Architecture Designer is the core component of the Darch application, providing a comprehensive interface for designing cloud architectures. It orchestrates multiple sub-components and manages the overall user experience.

**Main Component**: `components/designer/ArchitectureDesigner.tsx`
**Route**: `/designer`

## Component Architecture

### Main Container Structure

```typescript
export default function ArchitectureDesigner() {
  return (
    <div className="w-full h-screen relative overflow-hidden bg-gray-100">
      <ReactFlowProvider>
        <TopBar {...topBarProps} />
        <div className="flex h-full pt-16">
          <ServicesSidebar {...sidebarProps} />
          <div className="flex-1 relative">
            <ArchitectureCanvas {...canvasProps} />
          </div>
          <ConfigurationSidebar {...configProps} />
        </div>
        <KeyboardShortcutsHelp {...helpProps} />
        <SettingsModal {...settingsProps} />
      </ReactFlowProvider>
    </div>
  );
}
```

### Three-Panel Layout

1. **Left Panel**: Services Sidebar (280px width)
2. **Center Panel**: Architecture Canvas (flexible width)
3. **Right Panel**: Configuration Sidebar (conditional)

## State Management

### Store Integration

The ArchitectureDesigner integrates multiple Zustand stores:

```typescript
// Store hooks used in ArchitectureDesigner
const { addNode } = useArchitectureStore();
const {
  isSidebarOpen,
  isConfigurationSidebarVisible,
  isHelpOpen,
  isSettingsOpen,
  toggleSidebar,
  toggleConfigurationSidebar,
  setHelpOpen,
  setSettingsOpen,
  toggleHelp,
} = useUIStore();
const { selectedNode, setSelectedNode } = useCanvasStore();
```

### Local State

```typescript
// Local state for component-specific data
const [activeTab, setActiveTab] = useState<TabType>("design");
const [currentProject] = useState<Project>({
  id: "1",
  name: "Project 1",
  environment: "Dev",
});
const [architectures, setArchitectures] = useState<Architecture[]>([
  {
    id: "1",
    name: "Main Architecture",
    createdAt: new Date(),
    nodes: [],
  },
]);
const [currentArchitecture, setCurrentArchitecture] = useState<Architecture>(
  architectures[0]
);
```

## Key Features

### 1. Tab Management

**File**: `components/designer/ArchitectureDesigner.tsx` (lines 106-115)

The designer supports multiple tabs for different views:

```typescript
type TabType = "design" | "share" | "settings";

const handleTabChange = useCallback((tab: TabType) => {
  setActiveTab(tab);
  console.log("Switched to tab:", tab);
}, []);
```

**Tab Functions**:
- **Design**: Main architecture editing view (default)
- **Share**: Architecture sharing functionality
- **Settings**: Application settings and preferences

### 2. Sidebar Management

**Left Sidebar (Services)**:
```typescript
const handleToggleSidebar = useCallback(() => {
  toggleSidebar();
  console.log("Toggled services sidebar");
}, [toggleSidebar]);
```

**Right Sidebar (Configuration)**:
```typescript
const handleToggleConfigurationSidebar = useCallback(() => {
  toggleConfigurationSidebar();
  console.log("Toggled configuration sidebar");
}, [toggleConfigurationSidebar]);
```

### 3. Node Management

**Node Addition**:
```typescript
const handleNodeAdd = useCallback(
  (node: Node) => {
    addNode(node);
    console.log("Node added to architecture:", node.id);
  },
  [addNode]
);
```

**Node Selection**:
```typescript
const handleNodeSelect = useCallback(
  (node: Node | null) => {
    setSelectedNode(node);
    console.log("Node selected:", node?.id);
  },
  [setSelectedNode]
);
```

**Node Double-Click (Open Configuration)**:
```typescript
const handleNodeDoubleClick = useCallback(
  (node: Node) => {
    setSelectedNode(node);
    if (!isConfigurationSidebarVisible) {
      toggleConfigurationSidebar();
    }
  },
  [isConfigurationSidebarVisible, setSelectedNode, toggleConfigurationSidebar]
);
```

**Node Configuration Update**:
```typescript
const handleNodeUpdate = useCallback(
  (nodeId: string, data: Record<string, unknown>) => {
    setCurrentArchitecture((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) =>
        node.id === nodeId ? { ...node, data } : node
      ),
    }));
    console.log("Node updated:", nodeId, data);
  },
  []
);
```

## Event Handlers

### Application Events

**New Architecture**:
```typescript
const handleNewArchitecture = useCallback(() => {
  console.log("Creating new architecture");
  // TODO: Implement new architecture creation
}, []);
```

**Share Architecture**:
```typescript
const handleShare = useCallback(() => {
  setActiveTab("share");
  console.log("Sharing architecture:", currentArchitecture.name);
  // TODO: Implement actual share functionality
}, [currentArchitecture]);
```

**Settings Management**:
```typescript
const handleSettings = useCallback(() => {
  setActiveTab("settings");
  setSettingsOpen(true);
  console.log("Opening settings");
}, [setSettingsOpen]);
```

**Help System**:
```typescript
const handleShowHelp = useCallback(() => {
  toggleHelp();
  console.log("Toggling keyboard shortcuts help");
}, [toggleHelp]);

const handleCloseHelp = useCallback(() => {
  setHelpOpen(false);
}, [setHelpOpen]);
```

**Fullscreen Toggle**:
```typescript
const handleToggleFullscreen = useCallback(() => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
  console.log("Toggled fullscreen");
}, []);
```

### Data Management Events

**Data Loading**:
```typescript
const handleDataLoaded = useCallback((nodes: Node[], edges: Edge[]) => {
  console.log("Loading architecture data:", { nodes, edges });
  // The ArchitectureCanvas automatically loads data through the architecture data manager
}, []);
```

## Keyboard Shortcuts Integration

The designer integrates application-level keyboard shortcuts:

```typescript
useApplicationShortcuts({
  onNewArchitecture: handleNewArchitecture,
  onSave: () => console.log("Save shortcut pressed"),
  onToggleSidebar: handleToggleSidebar,
  onToggleConfigurationSidebar: handleToggleConfigurationSidebar,
  onToggleFullscreen: handleToggleFullscreen,
  onShowHelp: handleShowHelp,
});
```

**Available Shortcuts**:
- `Ctrl/Cmd + N`: New architecture
- `Ctrl/Cmd + S`: Save architecture
- `T`: Toggle services sidebar
- `Y`: Toggle configuration sidebar
- `F`: Toggle fullscreen
- `?`: Show keyboard shortcuts help

## Sub-Components

### 1. TopBar Component

**File**: `components/designer/TopBar.tsx`

Provides navigation and project management:

```typescript
<TopBar
  currentProject={currentProject}
  activeTab={activeTab}
  onTabChange={handleTabChange}
  onNewArchitecture={handleNewArchitecture}
  onShare={handleShare}
  onSettings={handleSettings}
  onHelp={handleHelp}
  onProfile={handleProfile}
  onDataLoaded={handleDataLoaded}
/>
```

**Features**:
- Project information display
- Tab navigation
- Action buttons (New, Share, Settings, Help, Profile)
- Import/Export functionality

### 2. ServicesSidebar Component

**File**: `components/designer/ServicesSidebar.tsx`

AWS services library for drag-and-drop:

```typescript
<ServicesSidebar
  isOpen={isSidebarOpen}
  onToggle={handleToggleSidebar}
/>
```

**Features**:
- Categorized AWS services
- Drag-and-drop functionality
- Service status indicators
- Collapsible categories

### 3. ArchitectureCanvas Component

**File**: `components/designer/ArchitectureCanvas.tsx`

Main drawing surface:

```typescript
<ArchitectureCanvas
  onNodeAdd={handleNodeAdd}
  onShowHelp={handleShowHelp}
  onNodeSelect={handleNodeSelect}
  onNodeDoubleClick={handleNodeDoubleClick}
/>
```

**Features**:
- ReactFlow integration
- Node and edge management
- Zoom/pan controls
- Keyboard shortcuts
- Undo/redo system

### 4. ConfigurationSidebar Component

**File**: `components/designer/ConfigurationSidebar.tsx`

Resource configuration panel:

```typescript
<ConfigurationSidebar
  selectedNode={selectedNode}
  isOpen={isConfigurationSidebarVisible}
  onToggle={handleToggleConfigurationSidebar}
  onNodeUpdate={handleNodeUpdate}
/>
```

**Features**:
- Dynamic configuration forms
- Field validation
- Auto-configuration
- Real-time updates

## Modal Components

### 1. Keyboard Shortcuts Help

```typescript
<KeyboardShortcutsHelp
  isOpen={isHelpOpen}
  onClose={handleCloseHelp}
/>
```

**Features**:
- Complete shortcuts reference
- Categorized shortcuts
- Interactive help system

### 2. Settings Modal

```typescript
<SettingsModal
  isOpen={isSettingsOpen}
  onClose={handleCloseSettings}
/>
```

**Features**:
- Application preferences
- Theme settings
- Configuration options

## Component Lifecycle

### 1. Initialization
1. Component mounts with default state
2. Store subscriptions establish
3. Keyboard shortcuts register
4. ReactFlow provider initializes

### 2. User Interactions
1. User selects services from sidebar
2. Drags services to canvas
3. Configures nodes via configuration sidebar
4. Uses keyboard shortcuts for efficiency

### 3. State Updates
1. Actions trigger store updates
2. Components re-render based on state changes
3. ReactFlow updates canvas display
4. Auto-save triggers periodically

## Error Handling

### Component Error Boundaries
```typescript
// Error handling for store operations
try {
  addNode(node);
} catch (error) {
  console.error("Failed to add node:", error);
  // Show user notification
}
```

### Store Error Handling
```typescript
// Store actions include error handling
const addNode = (node: Node) => {
  try {
    // Node addition logic
  } catch (error) {
    console.error("Store error:", error);
    throw error; // Re-throw for component handling
  }
};
```

## Performance Optimizations

### 1. Callback Memoization
All event handlers use `useCallback` to prevent unnecessary re-renders:

```typescript
const handleNodeSelect = useCallback(
  (node: Node | null) => {
    setSelectedNode(node);
  },
  [setSelectedNode]
);
```

### 2. Selective Store Subscriptions
Components subscribe only to needed store slices:

```typescript
const { selectedNode } = useCanvasStore();
// Instead of: const canvasStore = useCanvasStore();
```

### 3. Component Lazy Loading
Large components can be lazy-loaded:

```typescript
const SettingsModal = lazy(() => import('./SettingsModal'));
```

## Development Workflow

### 1. Adding New Features
1. Define state requirements
2. Add store actions if needed
3. Create/modify components
4. Wire up event handlers
5. Add keyboard shortcuts if applicable

### 2. Debugging
1. Use Redux DevTools for store inspection
2. Console logging for event flow
3. React DevTools for component hierarchy
4. Store debugger component for development

This comprehensive designer interface provides users with a powerful yet intuitive tool for creating cloud architecture diagrams, with full keyboard support, real-time validation, and persistent state management.
