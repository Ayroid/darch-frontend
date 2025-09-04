# Application Structure

This document provides a comprehensive overview of the Darch application structure, routing, and main entry points.

## File Structure Overview

```
frontend/
├── app/                           # Next.js App Router
│   ├── layout.tsx                # Root layout component
│   ├── page.tsx                  # Homepage route (/)
│   ├── designer/                 # Designer route (/designer)
│   │   └── page.tsx             # Designer page component
│   ├── globals.css              # Global styles
│   └── favicon.ico              # App favicon
├── components/                   # React components
├── lib/                         # Core business logic
├── hooks/                       # Custom React hooks
├── public/                      # Static assets
└── docs/                       # Documentation
```

## Application Entry Points

### Root Layout (`app/layout.tsx`)
**Location**: `/app/layout.tsx`

The root layout component that wraps all pages:

```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

**Key Responsibilities**:
- Sets up HTML structure
- Applies global fonts (Inter)
- Provides common layout for all pages

### Homepage (`app/page.tsx`)
**Location**: `/app/page.tsx`

The main homepage component that serves as the application landing page:

```typescript
import Homepage from '@/components/homepage/Homepage';

export default function Home() {
  return <Homepage />;
}
```

**Route**: `/` (root)
**Component**: `components/homepage/Homepage.tsx`

### Designer Page (`app/designer/page.tsx`)
**Location**: `/app/designer/page.tsx`

The main architecture designer interface:

```typescript
import ArchitectureDesigner from '@/components/designer/ArchitectureDesigner';

export default function DesignerPage() {
  return <ArchitectureDesigner />;
}
```

**Route**: `/designer`
**Component**: `components/designer/ArchitectureDesigner.tsx`

## Global Configuration Files

### Next.js Configuration (`next.config.ts`)
**Location**: `/next.config.ts`

Configures Next.js with TypeScript:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

### TypeScript Configuration (`tsconfig.json`)
**Location**: `/tsconfig.json`

TypeScript compiler configuration with path mapping:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
    // ... other options
  }
}
```

### Tailwind Configuration (`tailwind.config.js`)
**Location**: Implicit (uses default Tailwind config)

Styles are configured through `postcss.config.mjs` for Tailwind CSS v4.

### ESLint Configuration (`eslint.config.mjs`)
**Location**: `/eslint.config.mjs`

Linting configuration extending Next.js rules.

## Component Organization

### Components Directory Structure
```
components/
├── designer/                    # Architecture designer components
│   ├── ArchitectureDesigner.tsx # Main designer container
│   ├── ArchitectureCanvas.tsx   # Canvas component
│   ├── ServicesSidebar.tsx     # AWS services sidebar
│   ├── ConfigurationSidebar.tsx # Configuration panel
│   ├── TopBar.tsx              # Designer top navigation
│   ├── nodeUtils.tsx           # Node utility components
│   └── configuration_sidebar/   # Configuration forms
├── homepage/                    # Homepage components
│   ├── Homepage.tsx            # Main homepage container
│   ├── DarchSidebar.tsx       # Homepage sidebar
│   ├── TopBar.tsx             # Homepage top bar
│   ├── RecentArchitectures.tsx # Recent user architectures
│   └── ArchitectureTemplates.tsx # Pre-built architecture templates
└── ui/                         # Reusable UI components
    ├── button.tsx              # Button component
    ├── card.tsx               # Card component
    ├── dialog.tsx             # Modal dialog
    ├── form.tsx               # Form components
    ├── input.tsx              # Input field
    ├── sidebar.tsx            # Sidebar component
    └── ... (other UI components)
```

### Component Import Pattern

The application uses path mapping for clean imports:

```typescript
// Instead of: import Component from '../../../components/ui/button'
import { Button } from '@/components/ui/button';
import { useArchitectureStore } from '@/lib/stores';
import { ArchitectureCanvas } from '@/components/designer/ArchitectureCanvas';
```

## Library Organization

### Core Library Structure
```
lib/
├── stores/                      # State management
│   ├── index.ts                # Store exports
│   ├── architecture/           # Architecture state
│   ├── canvas/                # Canvas state
│   ├── configuration/         # Configuration state
│   ├── ui/                   # UI state
│   └── validation/           # Validation state
├── types/                      # TypeScript definitions
│   ├── architecture.ts       # Architecture types
│   └── aws-resources.ts      # AWS resource types
├── utils.ts                   # Utility functions
├── keyboard-shortcuts.ts     # Keyboard shortcut handlers
├── auto-configuration.ts     # Auto-config logic
├── container-logic.ts        # Container relationship logic
├── parent-child-logic.ts     # Parent-child algorithms
└── z-index-logic.ts          # Z-index management
```

## Application Flow

### 1. Application Startup
1. **Entry Point**: `app/layout.tsx` provides root HTML structure
2. **Route Resolution**: Next.js App Router resolves `/` or `/designer`
3. **Component Loading**: Appropriate page component loads
4. **Store Initialization**: Zustand stores initialize with persisted data

### 2. Homepage Flow
1. **Route**: User visits `/`
2. **Component**: `Homepage.tsx` renders
3. **Sidebar**: `DarchSidebar.tsx` provides navigation
4. **Content**: Recent architectures and pre-built templates display in 2x2 grid layout
5. **Navigation**: User can navigate to `/designer` or load templates directly

### 3. Designer Flow
1. **Route**: User visits `/designer`
2. **Component**: `ArchitectureDesigner.tsx` renders
3. **Provider**: `ReactFlowProvider` wraps the canvas
4. **Layout**: Three-panel layout (Services | Canvas | Configuration)
5. **State**: Architecture store manages design state

## Key Architectural Patterns

### 1. Component Composition
Components follow a composition pattern:

```typescript
export default function ArchitectureDesigner() {
  return (
    <div className="w-full h-screen">
      <ReactFlowProvider>
        <TopBar {...topBarProps} />
        <div className="flex h-full pt-16">
          <ServicesSidebar {...sidebarProps} />
          <ArchitectureCanvas {...canvasProps} />
          <ConfigurationSidebar {...configProps} />
        </div>
      </ReactFlowProvider>
    </div>
  );
}
```

### 2. State Management Pattern
Each major feature has its own store slice:

```typescript
// Import specific store slices
import { useUIStore, useCanvasStore, useArchitectureStore } from '@/lib/stores';

// Use in components
const { isSidebarOpen, toggleSidebar } = useUIStore();
const { selectedNode, setSelectedNode } = useCanvasStore();
const { addNode, updateConfiguration } = useArchitectureStore();
```

### 3. Event Handling Pattern
Events flow through callback props:

```typescript
// Parent component
const handleNodeSelect = useCallback((node: Node | null) => {
  setSelectedNode(node);
}, [setSelectedNode]);

// Child component
<ArchitectureCanvas onNodeSelect={handleNodeSelect} />
```

## Environment Configuration

### Development Environment
- **Dev Server**: `npm run dev` starts Next.js dev server on port 3000
- **Hot Reload**: Automatic reload on file changes
- **TypeScript**: Real-time type checking
- **ESLint**: Code quality checks

### Build Process
- **Build**: `npm run build` creates production build
- **Start**: `npm start` runs production server
- **Lint**: `npm run lint` runs ESLint checks

## Static Assets

### Public Directory Structure
```
public/
├── aws_icons/                   # AWS service icons
│   ├── architecture_group_icons/   # Group/container icons
│   ├── architecture_service_icons/ # Service icons
│   │   ├── Arch_Compute/32/        # Compute service icons
│   │   ├── Arch_Database/32/       # Database service icons
│   │   ├── Arch_Networking-Content-Delivery/32/ # Network icons
│   │   └── ... (other categories)
│   ├── Category-Icons_07312025/    # Category icons
│   └── Resource-Icons_07312025/    # Resource icons
├── sample-architecture.json     # Sample architecture file
└── ... (other static files)
```

### Asset Loading Pattern
Assets are loaded using Next.js Image component:

```typescript
import Image from 'next/image';

<Image
  src="/aws_icons/architecture_service_icons/Arch_Compute/32/Arch_Amazon-EC2_32.svg"
  alt="EC2 Service"
  width={32}
  height={32}
/>
```

## Error Handling

### Global Error Boundaries
The application includes error boundaries for graceful error handling:

1. **Route-Level**: Each page can have its own error handling
2. **Component-Level**: Critical components have error boundaries
3. **Store-Level**: Zustand stores handle state errors gracefully

### Development vs Production
- **Development**: Detailed error messages and stack traces
- **Production**: User-friendly error messages with logging

This document provides the foundation for understanding how the Darch application is structured and how data flows through the system. For detailed component implementations, refer to the subsequent documentation files.
