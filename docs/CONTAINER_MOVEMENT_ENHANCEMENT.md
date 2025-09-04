# Container Movement and Snapping System Enhancement

## Overview

This document summarizes the major enhancements made to the container movement system, including the removal of container boundary restrictions and the implementation of a smart snapping system with visual feedback for better user experience.

## Key Issues Addressed

### 1. Container Boundary Restrictions (FIXED)
**Problem**: Services and containers were getting stuck inside other containers and couldn't be moved out due to ReactFlow's `extent: "parent"` constraint.

**Solution**:
- **Removed `extent: "parent"` constraint** completely to allow free movement
- **Enhanced containment logic** to use 75% overlap threshold for intelligent container assignment
- **Implemented smart snapping** with visual feedback when nodes approach valid containers

### 2. Smart Snapping System (NEW)
**Feature**: Intelligent container snapping with visual feedback when nodes approach valid parent containers.

**Implementation**:
- **Proximity Detection**: Detects when nodes are near containers that can be valid parents
- **Visual Feedback**: Highlights containers when they can accept the approaching node
- **Hierarchy-Based**: Only shows snapping for containers that match the AWS hierarchy rules
- **Non-Restrictive**: Snapping is helpful but never forces placement

### 3. Auto-Configuration Integration (ENHANCED)
**Problem**: When services were moved between containers, their auto-configured values (like region, VPC ID, etc.) weren't updating automatically.

**Solution**: Enhanced auto-configuration triggers with parent relationship changes and real-time updates during movement.

## Technical Changes Made

### 1. Boundary Constraint Removal (`lib/parent-child-logic.ts`)

#### Core Change: Removed ReactFlow Extent Constraints
```typescript
// BEFORE: Nodes were constrained to parent boundaries
extent: "parent"

// AFTER: Complete freedom of movement
// extent property removed entirely
```

This was the **root cause** of nodes getting stuck inside containers. ReactFlow's extent system prevented any movement outside parent boundaries.

### 2. Enhanced Parent-Child Logic (`lib/parent-child-logic.ts`)

#### New Smart Containment Functions
- **`isRectangleWellContained()`** - Uses 75% overlap threshold for intelligent assignment
- **Enhanced `shouldUpdateParent()`** - More permissive movement logic allowing easy breakout
- **`detectNearbyValidContainers()`** - NEW: Detects containers suitable for snapping

#### Key Behavioral Improvements
- **Liberal Containment**: Nodes assigned to containers only when 75% or more overlaps
- **Easy Breakout**: Nodes can break free when moved below the overlap threshold
- **Drag Freedom**: During dragging, nodes can move freely without constraint
- **Smart Assignment**: Container assignment only on significant overlap, not accidental touching

```typescript
// Enhanced overlap-based containment (replaces strict boundary checks)
function isRectangleWellContained(
  inner: NodeBounds,
  outer: NodeBounds,
  overlapThreshold: number = 0.75
): boolean {
  const overlapArea = calculateOverlap(inner, outer);
  const innerArea = inner.width * inner.height;
  return overlapArea / innerArea >= overlapThreshold;
}

// More permissive parent update logic
function shouldUpdateParent(
  node: Node,
  potentialParent: Node,
  allNodes: Node[],
  isDragEnd: boolean = false
): boolean {
  // During dragging: allow easy breakout
  if (!isDragEnd && node.parentId === potentialParent.id) {
    return isRectangleWellContained(nodeBounds, parentBounds, 0.6); // Lower threshold for breakout
  }

  // For assignment: require good containment
  return isRectangleWellContained(nodeBounds, parentBounds, 0.75);
}

// NEW: Smart snapping detection
function detectNearbyValidContainers(
  draggedNode: Node,
  allNodes: Node[],
  snapDistance: number = 50
): Node[] {
  // Returns containers that are near the dragged node and can be valid parents
}
```

### 3. Container Logic Enhancements (`lib/container-logic.ts`)

#### New Tracking and Snapping Functions
- **`updateNodeParentRelationshipsWithTracking()`** - Returns updated nodes + change tracking
- **`batchUpdateNodeRelationshipsWithTracking()`** - Batch version with tracking
- **`detectNearbyValidContainers()`** - NEW: Smart snapping detection system

#### Key Features
- **Change Detection**: Tracks which nodes had their parent relationships modified
- **Auto-Configuration Integration**: Enables automatic configuration updates
- **Performance Optimization**: Only processes nodes that actually changed
- **Smart Snapping**: Detects valid containers for snapping based on AWS hierarchy rules

```typescript
// Enhanced return type includes tracking information
return {
  updatedNodes: Node[],
  nodesWithChangedParents: Set<string>
};

// NEW: Snapping detection with hierarchy validation
export function detectNearbyValidContainers(
  draggedNode: Node,
  allNodes: Node[],
  snapDistance: number = 50
): Node[] {
  return allNodes.filter(container => {
    if (!container.data?.isContainer) return false;
    if (container.id === draggedNode.id) return false;

    // Check if hierarchy allows this parent-child relationship
    const isValidHierarchy = canNodeBeParent(container, draggedNode);
    if (!isValidHierarchy) return false;

    // Check proximity for snapping
    const distance = calculateNodeDistance(draggedNode, container);
    return distance <= snapDistance;
  });
}
```

### 4. Component Integration (`components/designer/nodeUtils.tsx`)

#### Enhanced Node Handlers with Free Movement
- **Updated `createNodeHandlers()`** to accept architecture store
- **Modified drag handling** to allow free movement during dragging
- **Enhanced drag end logic** to use tracking functions for parent assignment
- **Added automatic auto-configuration triggers** for parent relationship changes

#### Movement Behavior Changes
```typescript
// DURING DRAGGING: Light updates only (performance optimization)
if (dragMoveChanges.length > 0) {
  // No extent constraints - nodes can move freely
  // Only update z-index for proper layering
  setNodes((currentNodes) => updateNodeParentRelationships(currentNodes));
  return; // Skip heavy parent calculations during active drag
}

// ON DRAG END: Smart parent assignment
if (dragEndChanges.length > 0) {
  const { updatedNodes, nodesWithChangedParents } = updateNodeParentRelationshipsWithTracking(
    currentNodes,
    false,
    true // isDragEnd: true for final assignment
  );

  // Auto-configuration triggered for nodes with changed parents
  if (nodesWithChangedParents.size > 0 && architectureStore) {
    // Automatic configuration updates...
  }
}
```

### 5. Canvas Component Updates (`components/designer/ArchitectureCanvas.tsx`)

#### Store Integration for Real-time Updates
- **Added architecture store parameter** to node handlers for configuration sync
- **Enabled automatic configuration updates** during node movement
- **Enhanced drag feedback** with real-time parent relationship evaluation

## Behavioral Changes

### Free Movement (Major Improvement)
- **Before**: Nodes were constrained by `extent: "parent"` and couldn't move outside containers
- **After**: Complete movement freedom - nodes can be moved anywhere on the canvas

### Smart Container Assignment
- **Before**: Nodes were assigned to containers with strict containment + padding rules
- **After**: Nodes are assigned only when 75% or more overlaps with the container

### Enhanced Container Interaction
- **Before**: Containers couldn't break free from parents during dragging
- **After**: Containers can freely move and break free when not well-contained

### Intelligent Auto-Configuration
- **Before**: Only triggered manually or when configurations changed
- **After**: Automatically triggered when nodes are moved between containers with real-time updates

## User Experience Improvements

### 1. Complete Movement Freedom (Game Changer)
- **No More Stuck Nodes**: Services and containers can now be moved freely without getting stuck inside other containers
- **Natural Interaction**: Movement behavior now matches user expectations from other diagramming tools
- **Escape Containers**: Easy breakout from unwanted container assignments by simply dragging outside

### 2. Smart Snapping System (New Feature)
- **Visual Feedback**: Containers highlight when they can accept an approaching node
- **Hierarchy-Aware**: Only shows snapping for containers that follow AWS architecture rules
- **Non-Intrusive**: Snapping helps but never forces placement - users maintain full control
- **Proximity-Based**: Snapping activates when nodes are brought near (within 50px) of valid containers

### 3. Intelligent Configuration Management
- **Automatic Updates**: Configuration values automatically update when nodes are moved between containers
- **Context-Aware**: Fields become enabled/disabled based on container relationships
- **Real-time Sync**: No manual configuration updates needed after moving nodes
- **Hierarchy-Based**: Configuration inheritance follows AWS service hierarchy rules

### 4. Performance & Responsiveness
- **Smooth Dragging**: Optimized calculations during active dragging for responsive feel
- **Smart Updates**: Heavy computations only run when drag ends, not during movement
- **Cached Logic**: Efficient caching prevents redundant calculations
- **Debounced Processing**: Intelligent debouncing for optimal performance with multiple nodes

## AWS Hierarchy Integration

### Supported Container Hierarchies
The snapping system respects AWS service hierarchies:

```
AWS Account/Region
├── VPC
│   ├── Public Subnet
│   │   └── EC2 Instances, Load Balancers
│   ├── Private Subnet
│   │   └── EC2 Instances, RDS, etc.
│   └── Security Groups (can contain any VPC resource)
├── Auto Scaling Groups
│   └── EC2 Instances
└── Availability Zones
    └── Subnets, EC2 Instances
```

### Smart Snapping Rules
- **VPC** can contain subnets, security groups, EC2 instances
- **Subnets** can contain EC2 instances, databases, load balancers
- **Auto Scaling Groups** can contain EC2 instances
- **Regions** can contain VPCs, availability zones
- **Invalid combinations** (e.g., subnet containing VPC) are rejected

## Implementation Details

### Key Algorithm Changes

#### 1. Extent Constraint Removal
**Location**: `lib/parent-child-logic.ts` - `updateNodeParentRelationship()`
```typescript
// REMOVED: extent: "parent" - This was the main culprit
// Now nodes have complete freedom of movement
```

#### 2. Smart Overlap Detection
**Location**: `lib/parent-child-logic.ts` - `isRectangleWellContained()`
```typescript
// 75% overlap required for container assignment
const overlapThreshold = 0.75;
const overlapRatio = overlapArea / innerArea;
return overlapRatio >= overlapThreshold;
```

#### 3. Permissive Breakout Logic
**Location**: `lib/parent-child-logic.ts` - `shouldUpdateParent()`
```typescript
// Lower threshold (60%) for breaking out during drag
if (!isDragEnd && node.parentId === potentialParent.id) {
  return isRectangleWellContained(nodeBounds, parentBounds, 0.6);
}
```

#### 4. Hierarchy-Aware Snapping
**Location**: `lib/container-logic.ts` - `detectNearbyValidContainers()`
```typescript
// Check AWS hierarchy rules before allowing snapping
const isValidHierarchy = canNodeBeParent(container, draggedNode);
const isNearby = calculateNodeDistance(draggedNode, container) <= snapDistance;
return isValidHierarchy && isNearby;
```

### Performance Optimizations

#### 1. Drag Performance
- **During Drag**: Only update z-index and visual positioning
- **On Drag End**: Full parent relationship calculation and auto-configuration
- **Debounced Processing**: 1000ms timeout for final updates

#### 2. Caching Strategy
- **Container bounds caching** for expensive calculations
- **Cache invalidation** when nodes are moved or resized
- **Selective updates** for only affected nodes

#### 3. Change Detection
- **Track changed parents** to trigger auto-configuration only when needed
- **Batch updates** for multiple node movements
- **Asynchronous configuration** updates to prevent UI blocking

## Backward Compatibility

All changes maintain backward compatibility:
- **Existing APIs**: All previous functions continue to work
- **Previous behavior**: Available through original functions
- **No breaking changes**: Existing components work without modification
- **Gradual enhancement**: New features are additive, not replacements

## Documentation Updates

Updated documentation files:
- **`docs/04-canvas-system.md`** - Enhanced container movement system and free movement capabilities
- **`docs/07-auto-configuration.md`** - Integration with parent relationship changes and real-time updates
- **`docs/12-utilities-algorithms.md`** - Enhanced parent-child logic and container tracking algorithms
- **`docs/CONTAINER_MOVEMENT_ENHANCEMENT.md`** - Complete overview of the new system (this document)

## Testing Recommendations

### Movement Testing
1. **Free Movement**: Test that nodes can be moved anywhere on canvas without getting stuck
2. **Container Escape**: Verify nodes can break free from containers when dragged outside
3. **Multiple Containers**: Test with overlapping containers and complex hierarchies
4. **Edge Cases**: Test with very small containers and large nodes

### Snapping Testing
1. **Visual Feedback**: Verify containers highlight when nodes approach
2. **Hierarchy Rules**: Test that only valid parent-child combinations show snapping
3. **Proximity Sensitivity**: Test snapping activation distance (50px default)
4. **Performance**: Test snapping with many containers on screen

### Auto-Configuration Testing
1. **Real-time Updates**: Verify configuration updates when moving services between containers
2. **Field Inheritance**: Test that child nodes inherit appropriate values from parents
3. **Hierarchy Validation**: Ensure configuration follows AWS service hierarchy rules
4. **Performance**: Test configuration updates with complex node hierarchies

### Performance Testing
1. **Large Diagrams**: Test with 50+ nodes and multiple container levels
2. **Drag Responsiveness**: Verify smooth dragging performance during active movement
3. **Memory Usage**: Check memory consumption with extensive node movements
4. **Update Efficiency**: Measure time for parent relationship calculations

## Migration Guide

### For Existing Diagrams
- **Automatic**: Existing diagrams work immediately with enhanced movement
- **No action required**: All nodes retain their current parent relationships
- **Improved interaction**: Users will immediately notice smoother movement behavior

### For Custom Components
- **Node types**: No changes required for existing custom node types
- **Event handlers**: Existing drag handlers continue to work
- **Integration**: Optional architecture store integration for auto-configuration benefits

### Configuration Notes
- **Default settings**: All enhancements use sensible defaults (75% overlap, 50px snap distance)
- **Customizable**: Thresholds can be adjusted in the respective algorithm functions
- **Feature flags**: Individual features can be disabled if needed for specific use cases
