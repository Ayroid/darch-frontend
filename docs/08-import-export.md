# Import/Export System

This document covers the comprehensive import/export system that handles architecture file management, including JSON serialization, file operations, and data persistence.

## Overview

The import/export system enables users to save, load, and share their cloud architecture designs. It provides robust file handling with proper error management, data validation, and seamless integration with the architecture store.

**Main Components**:
- Architecture Store (`lib/stores/architecture/architecture-store.ts`)
- Import/Export Modal (`components/designer/ImportExportModal.tsx`)
- TopBar Integration (`components/designer/TopBar.tsx`)

## Architecture Data Format

### ArchitectureData Structure

**File**: `lib/types/architecture.ts`

```typescript
export interface ArchitectureData {
  metadata: ArchitectureMetadata;
  nodes: ArchitectureNode[];
  connections: NodeConnection[];
  variables: Record<string, unknown>;
  outputs: Record<string, unknown>;
}

export interface ArchitectureMetadata {
  name: string;
  description: string;
  version: string;
  createdAt: string;
  lastModified: string;
  provider: "aws" | "azure" | "gcp";
}

export interface ArchitectureNode {
  id: string;
  nodeType: "awsService" | "awsContainer";
  serviceType: string;
  name: string;
  icon: string;
  position: { x: number; y: number };
  dimensions?: { width: number; height: number };
  configuration: AWSResourceConfiguration;
  isContainer: boolean;
  parentId?: string;
}

export interface NodeConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type: string;
}
```

### Sample Architecture File

```json
{
  "metadata": {
    "name": "Web Application Architecture",
    "description": "Three-tier web application with load balancer",
    "version": "1.0.0",
    "createdAt": "2025-01-01T10:00:00.000Z",
    "lastModified": "2025-01-01T15:30:00.000Z",
    "provider": "aws"
  },
  "nodes": [
    {
      "id": "region-us-east-1",
      "nodeType": "awsContainer",
      "serviceType": "aws-region",
      "name": "AWS Region",
      "icon": "/aws_icons/architecture_group_icons/AWS-Cloud_32.svg",
      "position": { "x": 100, "y": 100 },
      "dimensions": { "width": 800, "height": 600 },
      "configuration": {
        "serviceName": "AWS Region",
        "serviceId": "aws-region",
        "resourceType": "aws-region",
        "region": "us-east-1",
        "regionName": "US East (N. Virginia)"
      },
      "isContainer": true
    },
    {
      "id": "vpc-main",
      "nodeType": "awsContainer",
      "serviceType": "aws-vpc",
      "name": "VPC",
      "icon": "/aws_icons/architecture_service_icons/Arch_Networking-Content-Delivery/32/Arch_Amazon-Virtual-Private-Cloud_32.svg",
      "position": { "x": 150, "y": 200 },
      "dimensions": { "width": 700, "height": 400 },
      "configuration": {
        "serviceName": "Main VPC",
        "serviceId": "aws-vpc",
        "resourceType": "aws-vpc",
        "cidrBlock": "10.0.0.0/16",
        "region": "us-east-1",
        "enableDnsSupport": true,
        "enableDnsHostnames": true
      },
      "isContainer": true,
      "parentId": "region-us-east-1"
    }
  ],
  "connections": [
    {
      "id": "edge-1",
      "source": "load-balancer-1",
      "target": "ec2-web-1",
      "type": "smoothstep"
    }
  ],
  "variables": {},
  "outputs": {}
}
```

## Export Functionality

### Export to JSON

**File**: `lib/stores/architecture/architecture-store.ts`

```typescript
exportToJSON: () => {
  const state = get();
  return state.currentData ? { ...state.currentData } : null;
},

exportToFile: (filename) => {
  const state = get();
  if (!state.currentData) return;

  const dataStr = JSON.stringify(state.currentData, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `${state.currentData.metadata.name.replace(/\s+/g, "_")}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);

  set((state) => {
    state.hasUnsavedChanges = false;
  });
},
```

### Export Process

1. **Data Serialization**: Current architecture data is serialized to JSON
2. **Filename Generation**: Auto-generates filename from architecture name
3. **Blob Creation**: Creates downloadable blob with JSON data
4. **Download Trigger**: Programmatically triggers browser download
5. **Cleanup**: Removes temporary DOM elements and object URLs
6. **State Update**: Marks architecture as saved

### Export Triggers

#### TopBar Export Button
```typescript
// In TopBar component
const handleExport = useCallback(() => {
  const { exportToFile } = useArchitectureStore.getState();
  exportToFile();
}, []);
```

#### Keyboard Shortcut
```typescript
// Save shortcut (Ctrl+S) triggers export
useApplicationShortcuts({
  onSave: () => {
    const { exportToFile } = useArchitectureStore.getState();
    exportToFile();
  },
});
```

## Import Functionality

### Import from File

```typescript
importFromFile: async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        const result = get().loadFromJSON(jsonData);

        set((state) => {
          state.currentFileName = file.name;
        });

        resolve(result);
      } catch (error: unknown) {
        reject(
          new Error(
            "Invalid JSON file: " +
              (error instanceof Error ? error.message : "Unknown error")
          )
        );
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
},

loadFromJSON: (jsonData) => {
  set((state) => {
    state.currentData = {
      ...jsonData,
      metadata: {
        ...jsonData.metadata,
        lastModified: new Date().toISOString(),
      },
    };

    // Import configurations from nodes
    const configs: Record<string, AWSResourceConfiguration> = {};
    jsonData.nodes.forEach((node) => {
      if (node.configuration && typeof node.configuration === 'object') {
        configs[node.id] = node.configuration as AWSResourceConfiguration;
      }
    });
    state.nodeConfigurations = configs;
    state.hasUnsavedChanges = false;
  });

  const currentData = get().currentData!;
  const nodes = currentData.nodes.map((node) => convertArchNodeToReactFlowNode(node));
  const edges = currentData.connections.map((conn) => convertConnectionToReactFlowEdge(conn));

  get().forceSave();
  return { nodes, edges };
},
```

### Import Process

1. **File Reading**: Uses FileReader to read file content
2. **JSON Parsing**: Parses JSON string to JavaScript object
3. **Data Validation**: Validates structure and required fields
4. **Configuration Import**: Extracts node configurations
5. **State Update**: Updates architecture store with imported data
6. **ReactFlow Conversion**: Converts to ReactFlow format for canvas display
7. **Auto-Save**: Triggers save to persistence layer

### Import Error Handling

```typescript
try {
  const jsonData = JSON.parse(e.target?.result as string);
  const result = get().loadFromJSON(jsonData);
  resolve(result);
} catch (error: unknown) {
  reject(
    new Error(
      "Invalid JSON file: " +
        (error instanceof Error ? error.message : "Unknown error")
    )
  );
}
```

**Error Types**:
- **File Read Errors**: File system access issues
- **JSON Parse Errors**: Invalid JSON syntax
- **Structure Validation Errors**: Missing required fields
- **Configuration Errors**: Invalid AWS resource configurations

## Import/Export Modal

### Modal Component Structure

**File**: `components/designer/ImportExportModal.tsx`

```typescript
export default function ImportExportModal({
  isOpen,
  onClose,
  onDataLoaded,
}: ImportExportModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import/Export Architecture</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Import Section */}
          <div className="space-y-2">
            <h3 className="font-semibold">Import Architecture</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".json"
                className="hidden"
              />
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Drag and drop a JSON file here, or{" "}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-500"
                  >
                    browse
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="space-y-2">
            <h3 className="font-semibold">Export Architecture</h3>
            <Button onClick={handleExport} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export as JSON
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### File Selection Handling

```typescript
const handleFileSelect = useCallback(
  async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const { nodes, edges } = await importFromFile(file);
      onDataLoaded?.(nodes, edges);
      onClose();
      
      // Show success notification
      toast.success(`Architecture "${file.name}" imported successfully`);
    } catch (error) {
      console.error("Import failed:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Failed to import architecture"
      );
    } finally {
      setIsLoading(false);
      // Reset file input
      if (event.target) {
        event.target.value = "";
      }
    }
  },
  [importFromFile, onDataLoaded, onClose]
);
```

### Drag and Drop Support

```typescript
const handleDrop = useCallback((event: React.DragEvent) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  
  if (file && file.type === "application/json") {
    handleFileSelect({ target: { files: [file] } } as any);
  }
}, [handleFileSelect]);

const handleDragOver = useCallback((event: React.DragEvent) => {
  event.preventDefault();
}, []);
```

## Data Conversion

### ReactFlow to Architecture Format

```typescript
// Convert ReactFlow nodes to ArchitectureNode format
const convertReactFlowNodeToArchNode = (node: Node, nodeConfig?: AWSResourceConfiguration): ArchitectureNode => {
  const data = node.data as Record<string, unknown>;
  return {
    id: node.id,
    nodeType: node.type as "awsService" | "awsContainer",
    serviceType: (typeof data?.serviceId === 'string' ? data.serviceId :
                 typeof data?.name === 'string' ? data.name.toLowerCase() : "unknown"),
    name: (typeof data?.name === 'string' ? data.name : "Unnamed Service"),
    icon: (typeof data?.icon === 'string' ? data.icon : ""),
    position: node.position,
    dimensions: node.style ? {
      width: typeof node.style.width === "number" ? node.style.width : 80,
      height: typeof node.style.height === "number" ? node.style.height : 80,
    } : undefined,
    configuration: nodeConfig || {},
    isContainer: Boolean(data?.isContainer),
    parentId: node.parentId,
  };
};

// Convert ReactFlow edges to NodeConnection format
const convertReactFlowEdgeToConnection = (edge: Edge): NodeConnection => {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle || undefined,
    targetHandle: edge.targetHandle || undefined,
    type: edge.type || "smoothstep",
  };
};
```

### Architecture to ReactFlow Format

```typescript
// Convert ArchitectureNode to ReactFlow node format
const convertArchNodeToReactFlowNode = (archNode: ArchitectureNode): Node => {
  return {
    id: archNode.id,
    type: archNode.nodeType,
    position: archNode.position,
    data: {
      icon: archNode.icon,
      name: archNode.name,
      serviceId: archNode.serviceType,
      isContainer: archNode.isContainer,
      configuration: archNode.configuration,
    },
    style: archNode.dimensions ? {
      width: archNode.dimensions.width,
      height: archNode.dimensions.height,
    } : undefined,
    parentId: archNode.parentId,
  };
};

// Convert NodeConnection to ReactFlow edge format
const convertConnectionToReactFlowEdge = (connection: NodeConnection): Edge => {
  return {
    id: connection.id,
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    type: connection.type || "smoothstep",
  };
};
```

## File Management

### Auto-Save System

```typescript
// Auto-save with debouncing
const AUTO_SAVE_DELAY = 1000; // 1 second

updateFromReactFlow: (nodes, edges) => {
  set((state) => {
    // Update data...
    state.hasUnsavedChanges = true;
  });

  // Debounced auto-save
  const currentTimeout = get().autoSaveTimeout;
  if (currentTimeout) {
    clearTimeout(currentTimeout);
  }

  const timeout = setTimeout(() => {
    get().forceSave();
  }, AUTO_SAVE_DELAY);

  set((state) => {
    state.autoSaveTimeout = timeout;
  });
},
```

### File Naming

```typescript
const generateFileName = (architectureName: string): string => {
  return `${architectureName.replace(/\s+/g, "_")}.json`;
};

// Usage in export
link.download = filename || generateFileName(state.currentData.metadata.name);
```

### Sample Architecture Loading

```typescript
// Load sample architecture on first visit
const loadSampleArchitecture = async () => {
  try {
    const response = await fetch('/sample-architecture.json');
    const sampleData = await response.json();
    loadFromJSON(sampleData);
  } catch (error) {
    console.error('Failed to load sample architecture:', error);
  }
};
```

## Integration Points

### TopBar Integration

```typescript
// In TopBar component
const [showImportExport, setShowImportExport] = useState(false);

const handleImportExport = useCallback(() => {
  setShowImportExport(true);
}, []);

return (
  <div className="top-bar">
    <Button onClick={handleImportExport}>
      Import/Export
    </Button>
    
    <ImportExportModal
      isOpen={showImportExport}
      onClose={() => setShowImportExport(false)}
      onDataLoaded={onDataLoaded}
    />
  </div>
);
```

### Canvas Integration

```typescript
// Canvas automatically reflects imported data
const handleDataLoaded = useCallback((nodes: Node[], edges: Edge[]) => {
  console.log("Loading architecture data:", { nodes, edges });
  // The ArchitectureCanvas automatically loads data through the architecture data manager
}, []);
```

## Persistence Strategy

### Local Storage Persistence

```typescript
// Zustand persistence configuration
persist(
  immer((set, get) => ({
    // store implementation
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

### Browser Session Backup

```typescript
// Additional backup to session storage
const backupToSession = (data: ArchitectureData) => {
  try {
    sessionStorage.setItem('architecture-backup', JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to backup to session storage:', error);
  }
};
```

## Data Validation

### JSON Schema Validation

```typescript
import { z } from 'zod';

const architectureDataSchema = z.object({
  metadata: z.object({
    name: z.string().min(1),
    description: z.string(),
    version: z.string(),
    createdAt: z.string(),
    lastModified: z.string(),
    provider: z.enum(['aws', 'azure', 'gcp']),
  }),
  nodes: z.array(z.object({
    id: z.string(),
    nodeType: z.enum(['awsService', 'awsContainer']),
    serviceType: z.string(),
    name: z.string(),
    icon: z.string(),
    position: z.object({
      x: z.number(),
      y: z.number(),
    }),
    configuration: z.record(z.unknown()),
    isContainer: z.boolean(),
    parentId: z.string().optional(),
  })),
  connections: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    type: z.string(),
  })),
  variables: z.record(z.unknown()),
  outputs: z.record(z.unknown()),
});

const validateArchitectureData = (data: unknown): ArchitectureData => {
  return architectureDataSchema.parse(data);
};
```

## Error Handling and Recovery

### Import Error Recovery

```typescript
const handleImportError = (error: Error, file: File) => {
  console.error('Import failed:', error);
  
  // Log detailed error information
  console.error('File details:', {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified),
  });

  // Show user-friendly error message
  let userMessage = 'Failed to import architecture file.';
  
  if (error.message.includes('JSON')) {
    userMessage = 'Invalid JSON format. Please check your file.';
  } else if (error.message.includes('schema')) {
    userMessage = 'Invalid architecture format. Missing required fields.';
  }

  toast.error(userMessage);
};
```

### Backup and Recovery

```typescript
const createRecoveryBackup = () => {
  const currentData = getCurrentData();
  if (currentData) {
    localStorage.setItem('architecture-recovery', JSON.stringify({
      data: currentData,
      timestamp: Date.now(),
    }));
  }
};

const recoverFromBackup = () => {
  try {
    const backup = localStorage.getItem('architecture-recovery');
    if (backup) {
      const { data, timestamp } = JSON.parse(backup);
      
      // Only recover if backup is less than 24 hours old
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        return data;
      }
    }
  } catch (error) {
    console.error('Failed to recover from backup:', error);
  }
  return null;
};
```

This comprehensive import/export system provides users with reliable file management capabilities, ensuring their architecture designs can be saved, shared, and recovered with full data integrity and error handling.
