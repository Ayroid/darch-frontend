# Darch - Cloud Architecture Designer

**Darch** is a modern, web-based cloud architecture visualization and design tool built with Next.js and React Flow. It enables users to create, design, and manage AWS cloud architectures through an intuitive drag-and-drop interface.

## 🏗️ Project Overview

Darch provides a comprehensive platform for designing cloud architectures with the following core capabilities:

- **Visual Architecture Design**: Drag-and-drop interface for creating cloud architecture diagrams
- **AWS Service Integration**: Comprehensive library of AWS services with official icons
- **Interactive Node System**: Two types of nodes - Service nodes and Container nodes
- **Real-time Collaboration**: Multi-user architecture editing (planned)
- **Export & Deployment**: Export architectures and deploy to cloud providers (planned)

## 🚀 Core Features

### 1. Architecture Canvas
- **React Flow Integration**: Powered by @xyflow/react for advanced flow diagram capabilities
- **Zoom & Pan**: Smooth zooming and panning with mouse/trackpad support
- **Node Connections**: Visual connections between services with smooth step edges
- **Undo/Redo**: Full state management with undo/redo functionality
- **Selection Management**: Multi-select, copy, paste, and duplicate operations

### 2. AWS Service Library
- **Comprehensive Service Catalog**: 50+ AWS services organized by category
- **Official AWS Icons**: Authentic AWS service icons from the official icon set
- **Service Categories**:
  - Compute (EC2, Lambda, Auto Scaling, etc.)
  - Networking (VPC, CloudFront, Route 53, etc.)
  - Database (RDS, DynamoDB, ElastiCache, etc.)
  - Storage (S3, EBS, EFS, etc.)
  - Security (IAM, AWS KMS, Secrets Manager, etc.)
  - Analytics (Athena, QuickSight, Kinesis, etc.)
  - Management & Governance (CloudWatch, CloudTrail, etc.)
  - Container Services (ECS, EKS, Fargate, etc.)
  - Serverless (Lambda, API Gateway, Step Functions, etc.)

### 3. Node Types

#### Service Nodes
- **Fixed Size**: Square nodes (60x60px) for individual AWS services
- **Handle Positioning**: Connection points positioned exactly on edges
- **Hover Effects**: Handles appear on hover with smooth transitions
- **Visual States**: Selected, connected, and hover states with visual feedback

#### Container Nodes
- **Resizable**: Dynamic sizing with drag handles for containers like VPC, Auto Scaling Groups
- **Nested Architecture**: Support for logical grouping of services
- **Dynamic Handles**: Connection handles that reposition based on container size
- **Visual Hierarchy**: Purple borders and headers for clear organization

### 4. Keyboard Shortcuts System
Comprehensive keyboard shortcuts for productivity:

#### Canvas Operations
- `Ctrl/Cmd + C` - Copy selected nodes
- `Ctrl/Cmd + V` - Paste copied nodes
- `Ctrl/Cmd + D` - Duplicate selected nodes
- `Ctrl/Cmd + A` - Select all nodes
- `Ctrl/Cmd + Z` - Undo last action
- `Ctrl/Cmd + Y` - Redo last action
- `Delete/Backspace` - Delete selected nodes
- `Escape` - Deselect all nodes

#### View Controls
- `Ctrl/Cmd + 0` - Fit view to show all nodes
- `Ctrl/Cmd + =` - Zoom in
- `Ctrl/Cmd + -` - Zoom out
- `Ctrl/Cmd + 1` - Reset zoom to 100%
- `Space + Drag` - Pan the canvas

#### Node Manipulation
- `Arrow Keys` - Move selected nodes (5px steps)
- `Shift + Arrow Keys` - Move selected nodes (20px steps)

#### Application Shortcuts
- `Ctrl/Cmd + N` - Create new architecture
- `Ctrl/Cmd + S` - Save architecture
- `T` - Toggle sidebar
- `F` - Toggle fullscreen mode
- `?` - Show/hide keyboard shortcuts help

### 5. Configuration System
- **Node-Specific Configuration**: Each AWS service has contextual configuration options
- **Real-time Updates**: Configuration changes reflect immediately in the architecture
- **Validation**: Input validation for configuration parameters
- **Service Templates**: Pre-configured templates for common service setups

## 🏛️ Architecture & Technical Stack

### Frontend Stack
- **Framework**: Next.js 15.4.6 with App Router
- **React**: React 19.1.0 with TypeScript
- **Styling**: Tailwind CSS 4.0 with custom theme
- **UI Components**: Custom component library built on Radix UI primitives
- **Diagram Engine**: @xyflow/react 12.8.2 for flow diagrams
- **Icons**: react-icons for UI icons, AWS official icons for services
- **State Management**: React hooks with local state management
- **Forms**: React Hook Form with Zod validation

### Project Structure
```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with fonts and metadata
│   ├── page.tsx                 # Homepage route
│   ├── globals.css              # Global styles and CSS variables
│   └── designer/
│       └── page.tsx             # Architecture designer route
├── components/
│   ├── homepage/                # Homepage components
│   │   ├── Homepage.tsx         # Main homepage layout
│   │   ├── DarchSidebar.tsx     # Homepage sidebar
│   │   ├── TopBar.tsx           # Homepage top navigation
│   │   ├── RecentArchitectures.tsx # Recent architectures widget
│   │   └── RecentDeployments.tsx   # Recent deployments widget
│   ├── designer/                # Architecture designer components
│   │   ├── ArchitectureDesigner.tsx  # Main designer layout
│   │   ├── ArchitectureCanvas.tsx    # React Flow canvas
│   │   ├── ServicesSidebar.tsx       # AWS services palette
│   │   ├── ConfigurationSidebar.tsx  # Node configuration panel
│   │   ├── TopBar.tsx               # Designer top bar
│   │   ├── nodeUtils.tsx            # Node components and utilities
│   │   ├── KeyboardShortcutsHelp.tsx # Shortcuts modal
│   │   ├── UndoRedoControls.tsx     # Undo/redo UI controls
│   │   ├── ShortcutsButton.tsx      # Shortcuts help button
│   │   └── SHORTCUTS_README.md      # Shortcuts documentation
│   └── ui/                      # Reusable UI components
│       ├── button.tsx           # Button component
│       ├── input.tsx            # Input component
│       ├── sidebar.tsx          # Sidebar component
│       └── ...                  # Other UI primitives
├── hooks/
│   └── use-mobile.ts            # Mobile detection hook
├── lib/
│   ├── keyboard-shortcuts.ts    # Keyboard shortcuts system
│   └── utils.ts                 # Utility functions
└── public/
    └── aws_icons/               # AWS service icons (official)
        ├── architecture_service_icons/
        ├── architecture_group_icons/
        ├── Category-Icons_07312025/
        └── Resource-Icons_07312025/
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue tones for primary actions and selections
- **Secondary**: Gray tones for backgrounds and secondary elements
- **Service Nodes**: Transparent background with hover/selection states
- **Container Nodes**: Purple borders (#8b5cf6) with transparency
- **Handles**: White with black borders, animate on hover

### Typography
- **Primary Font**: Geist Sans (optimized for web)
- **Monospace Font**: Geist Mono for code elements
- **Size Scale**: Tailwind's default scale (xs, sm, base, lg, xl, etc.)

### Spacing & Layout
- **Grid System**: CSS Grid and Flexbox for responsive layouts
- **Container Constraints**:
  - Service nodes: 60x60px fixed
  - Container nodes: Minimum 250x200px, resizable
- **Handle Positioning**: Mathematically calculated center positions

## 🔧 Component Architecture

### Core Components

#### ArchitectureDesigner (Main Container)
- **Purpose**: Root component managing global state and layout
- **State Management**:
  - Project selection and management
  - Architecture versioning
  - Node selection and configuration
  - Sidebar visibility
  - Help modal state
- **Key Features**:
  - Tab management (Design, Share, Settings)
  - Keyboard shortcuts integration
  - Full-screen mode support

#### ArchitectureCanvas (Drawing Surface)
- **Purpose**: React Flow integration and canvas management
- **Key Features**:
  - Drag and drop from services sidebar
  - Node creation and positioning
  - Edge connections between nodes
  - Zoom/pan controls
  - Custom styling for AWS nodes
  - Undo/redo state management
- **Event Handling**:
  - Node selection changes
  - Canvas interactions (wheel, drag, drop)
  - Connection creation between nodes

#### ServicesSidebar (Service Palette)
- **Purpose**: AWS services catalog and search
- **Organization**: Services grouped by category with expand/collapse
- **Drag Operations**: Implements HTML5 drag API for node creation
- **Search & Filter**: Real-time filtering of services by name or category

#### ConfigurationSidebar (Node Settings)
- **Purpose**: Context-sensitive configuration for selected nodes
- **Service-Specific Configs**: Each AWS service has tailored configuration options
- **Form Management**: React Hook Form with validation
- **Real-time Updates**: Changes immediately reflect in the architecture

#### NodeUtils (Node Components)
- **AWSServiceNode**: Fixed-size square nodes for individual services
- **AWSContainerNode**: Resizable container nodes with drag handles
- **Handle Management**: Dynamic positioning based on node dimensions
- **Resize Functionality**: Mouse-based resize with minimum constraints

### State Management Pattern
```typescript
// Global state structure
interface ArchitectureState {
  projects: Project[];
  currentProject: Project;
  architectures: Architecture[];
  currentArchitecture: Architecture;
  selectedNode: Node | null;
  nodes: Node[];
  edges: Edge[];
  sidebarOpen: boolean;
  activeTab: 'design' | 'share' | 'settings';
}
```

## 🎯 Key Algorithms & Logic

### Handle Positioning Algorithm
```typescript
// Dynamic handle positioning for resizable containers
const calculateHandlePositions = (width: number, height: number) => ({
  top: { top: -3, left: width / 2 - 3 },
  right: { top: height / 2 - 3, right: -3 },
  bottom: { bottom: -3, left: width / 2 - 3 },
  left: { top: height / 2 - 3, left: -3 }
});
```

### Node Connection Logic
- **Handle Types**: Source and target handles for directional connections
- **Connection Rules**: Prevents invalid connections and self-loops
- **Visual Feedback**: Connected handles have different styling

### Resize Handling
```typescript
// Mouse-based resizing with constraints
const handleResize = (corner: ResizeCorner, deltaX: number, deltaY: number) => {
  const newWidth = Math.max(MIN_WIDTH, currentWidth + deltaX);
  const newHeight = Math.max(MIN_HEIGHT, currentHeight + deltaY);
  updateNodeSize(nodeId, newWidth, newHeight);
};
```

## 🛠️ Development Workflow

### Getting Started
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

### Docker Deployment
The application is fully containerized for easy deployment:

```bash
# Build the Docker image
docker build -t darch-frontend .

# Run the container
docker run -p 3000:3000 darch-frontend

# Access the application at http://localhost:3000
```

**Docker Configuration:**
- **Multi-stage build** for optimized production image
- **Standalone output** enabled in Next.js for minimal container size
- **Non-root user** for security
- **Node.js 18 Alpine** for small image footprint
- **Port 3000** exposed for the application

### Development Server
- **URL**: http://localhost:3000
- **Hot Reload**: Automatic page refresh on file changes
- **Error Overlay**: Development error display

### Key Development Files
- `components/designer/nodeUtils.tsx` - Node components and logic
- `components/designer/ArchitectureCanvas.tsx` - Main canvas implementation
- `lib/keyboard-shortcuts.ts` - Shortcuts system
- `app/globals.css` - Global styles and React Flow customizations

## 🎮 User Interactions

### Drag and Drop Workflow
1. **Service Selection**: User drags AWS service from sidebar
2. **Canvas Drop**: Service dropped on canvas creates new node
3. **Position Calculation**: React Flow calculates screen-to-flow coordinates
4. **Node Creation**: New node added to state with unique ID
5. **Handle Visibility**: Connection handles appear on hover

### Connection Creation
1. **Handle Hover**: User hovers over source handle
2. **Drag Initiation**: Click and drag from handle
3. **Target Selection**: Drag to target handle on another node
4. **Connection Validation**: System validates connection rules
5. **Edge Creation**: New edge added between nodes

### Node Configuration
1. **Node Selection**: Click on node to select
2. **Sidebar Open**: Configuration sidebar opens automatically
3. **Form Display**: Context-specific configuration form loads
4. **Real-time Updates**: Changes immediately update node data
5. **Validation**: Form validation prevents invalid configurations

## 🔮 Future Enhancements

### Planned Features
- **Export Capabilities**: Export to Terraform, CloudFormation, Pulumi
- **Cloud Integration**: Direct deployment to AWS
- **Team Collaboration**: Real-time multi-user editing
- **Version Control**: Architecture versioning and branching
- **Template Library**: Pre-built architecture templates
- **Cost Estimation**: Real-time cost calculation for resources
- **Compliance Checking**: Security and best practice validation

### Technical Roadmap
- **Backend Integration**: API for persistence and collaboration
- **WebSocket Support**: Real-time updates for team features
- **Cloud Provider APIs**: Integration with AWS, Azure, GCP
- **Export Engine**: Architecture-to-code generation
- **Mobile Support**: Responsive design for tablet/mobile use

## 🐛 Troubleshooting

### Common Issues

#### Handle Positioning Problems
- **Issue**: Handles not positioned correctly on resized containers
- **Solution**: Check `handleStyle` calculations in `nodeUtils.tsx`
- **Debug**: Verify node dimensions are updated in React Flow state

#### Drag and Drop Issues
- **Issue**: Services not creating nodes when dropped
- **Solution**: Verify drag event handlers in `ArchitectureCanvas.tsx`
- **Debug**: Check `dataTransfer` data in drop event

#### Keyboard Shortcuts Not Working
- **Issue**: Shortcuts not triggering actions
- **Solution**: Ensure hooks are properly imported and used
- **Debug**: Check event listener attachment in `keyboard-shortcuts.ts`

#### CSS Styling Problems
- **Issue**: Node styles not applying correctly
- **Solution**: Check CSS specificity in `ArchitectureCanvas.tsx`
- **Debug**: Verify Tailwind classes and custom CSS injection

## 📚 API Reference

### Key Hooks

#### `useCanvasShortcuts(actions)`
Provides canvas-level keyboard shortcuts.
```typescript
interface CanvasShortcutActions {
  onCopyNodes: () => void;
  onPasteNodes: () => void;
  onDuplicateNodes: () => void;
  onSelectAllNodes: () => void;
  onDeselectAllNodes: () => void;
  onDeleteNodes: () => void;
  onMoveSelectedNodes: (direction: Direction, distance: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  reactFlowInstance: ReactFlowInstance | null;
}
```

#### `useApplicationShortcuts(actions)`
Provides application-level keyboard shortcuts.
```typescript
interface AppShortcutActions {
  onNewArchitecture?: () => void;
  onSave?: () => void;
  onToggleSidebar?: () => void;
  onToggleFullscreen?: () => void;
  onShowHelp?: () => void;
}
```

#### `useUndoRedo()` (Enhanced)
Provides advanced undo/redo functionality with action tracking and intelligent state management.
```typescript
interface UndoRedoHook {
  saveState: (nodes: Node[], edges: Edge[], action?: string) => void;
  undo: () => StateSnapshot | null;
  redo: () => StateSnapshot | null;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;
  getHistoryInfo: () => HistoryInfo;
  setMaxHistorySize: (size: number) => void;
}

interface StateSnapshot {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
  action?: string;
}
```

#### `useCanvasUndoRedo()`
Specialized hook for canvas operations with operation-specific state saving.
```typescript
interface CanvasUndoRedoHook {
  undo: () => StateSnapshot | null;
  redo: () => StateSnapshot | null;
  canUndo: boolean;
  canRedo: boolean;
  saveCanvasState: (nodes: Node[], edges: Edge[], action: UndoRedoActionType, description?: string) => void;
  saveAfterNodeOperation: (nodes: Node[], edges: Edge[], operation: 'add' | 'delete' | 'move' | 'resize' | 'configure') => void;
  saveAfterEdgeOperation: (nodes: Node[], edges: Edge[], operation: 'add' | 'delete') => void;
  saveAfterBulkOperation: (nodes: Node[], edges: Edge[], operation: 'paste' | 'duplicate' | 'import' | 'bulk') => void;
  debouncedSave: (nodes: Node[], edges: Edge[], delay?: number) => NodeJS.Timeout;
  clearHistory: () => void;
}
```

### Node Data Interfaces

#### AWS Service Node
```typescript
interface AWSServiceNodeData {
  icon: string;
  name: string;
}
```

#### AWS Container Node
```typescript
interface AWSContainerNodeData {
  icon: string;
  name: string;
  isContainer: boolean;
}
```

## 🤝 Contributing

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended configuration
- **Prettier**: Automatic code formatting
- **File Naming**: kebab-case for files, PascalCase for components

### Component Guidelines
- **Props Interface**: Always define TypeScript interfaces for props
- **Default Props**: Use default parameters instead of defaultProps
- **Event Handlers**: Use `useCallback` for performance optimization
- **State Management**: Prefer local state, lift state up when needed

### Testing Strategy
- **Unit Tests**: Component logic and utility functions
- **Integration Tests**: User interaction flows
- **E2E Tests**: Complete user journeys (planned)

## 📄 License

This project is proprietary software. All rights reserved.

---

**Darch** - Making cloud architecture design accessible, visual, and collaborative.
