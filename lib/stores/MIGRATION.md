# Store Structure Migration

This document outlines the migration from the monolithic store structure to a modular, domain-separated store architecture.

## What Changed

### Before (Monolithic)
```
lib/stores/
├── configuration-store.ts     # Everything in one file
├── configuration-debugger.tsx
├── use-configuration-form.ts
└── use-store-integration.ts
```

### After (Modular)
```
lib/stores/
├── canvas/
│   └── canvas-store.ts           # Canvas-specific state
├── configuration/
│   ├── configuration-store.ts   # Pure configuration management
│   └── default-configurations.ts # Default values
├── ui/
│   └── ui-store.ts              # UI state management
├── validation/
│   └── validation-store.ts      # Validation logic
├── hooks/
│   ├── use-configuration-form.ts    # Enhanced form hook
│   └── use-store-integration.ts     # Updated integration
├── debug/
│   └── store-debugger.tsx       # Enhanced debugger
└── index-new.ts                 # New exports
```

## Benefits

1. **Separation of Concerns**: Each store handles a specific domain
2. **Better Performance**: Smaller, focused stores reduce unnecessary re-renders
3. **Enhanced Debugging**: New debugger shows all stores with tabbed interface
4. **Improved Validation**: Dedicated validation store with custom rules
5. **Canvas Management**: Proper zoom, pan, and selection state management
6. **Type Safety**: Better TypeScript support with focused interfaces

## Quick Migration

### Update Imports
```typescript
// Old
import { useConfigurationStore } from '@/lib/stores/configuration-store';

// New
import {
  useConfigurationStore,
  useUIStore,
  useCanvasStore,
  useValidationStore
} from '@/lib/stores';
```

### UI State Migration
```typescript
// Old
const { isSidebarOpen, toggleConfigurationSidebar } = useConfigurationStore();

// New
const { isSidebarOpen, toggleConfigurationSidebar } = useUIStore();
```

### Validation Migration
```typescript
// Old
const { validationErrors, setValidationErrors } = useConfigurationStore();

// New
const { validationErrors, setValidationErrors } = useValidationStore();
```

### Canvas State (New)
```typescript
const {
  zoom,
  selectedNodes,
  zoomIn,
  zoomOut,
  selectNode
} = useCanvasStore();
```

## Debugging

Replace the old debugger:
```typescript
// Old
import { ConfigurationStoreDebugger } from '@/lib/stores';

// New
import { StoreDebugger } from '@/lib/stores';
```

The new debugger includes:
- Tabbed interface for each store
- Real-time state inspection
- Enhanced keyboard shortcut (Ctrl+D)
- Canvas selection visualization

## Backward Compatibility

All old exports are still available with deprecation warnings:
- `useConfigurationStoreDeprecated`
- `ConfigurationStoreDebugger`

## Next Steps

1. Update your imports gradually
2. Test the new debugger with Ctrl+D
3. Use the enhanced validation system
4. Implement canvas state management where needed
5. Remove deprecated imports once migration is complete
