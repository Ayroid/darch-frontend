# Utility Functions and Algorithms

This document covers the comprehensive utility functions, algorithms, and helper modules that support core functionality throughout the application, including data manipulation, formatting, calculations, and common operations.

## Overview

The utility system provides reusable functions and algorithms that handle common operations, data transformations, calculations, and business logic. These utilities maintain consistency and reduce code duplication across the application.

**Main Utilities Location**: `lib/`

**Key Areas**:
- Core utilities (`lib/utils.ts`)
- Container logic (`lib/container-logic.ts`)
- Parent-child relationships (`lib/parent-child-logic.ts`)
- Z-index management (`lib/z-index-logic.ts`)
- Auto-configuration algorithms (`lib/auto-configuration.ts`)

## Core Utilities

### Main Utility Functions

**File**: `lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with Tailwind CSS support
 * Merges Tailwind classes intelligently to avoid conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a unique identifier with optional prefix
 */
export function generateId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}-${timestamp}-${randomPart}` : `${timestamp}-${randomPart}`;
}

/**
 * Generates a unique node ID for architecture components
 */
export function generateNodeId(serviceType?: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 5);
  const prefix = serviceType ? serviceType.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() : 'node';
  return `${prefix}-${timestamp}${randomPart}`;
}

/**
 * Formats bytes to human readable format
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Formats a date to a human-readable string
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Formats a date to a relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);
  
  if (diffInYears > 0) return rtf.format(-diffInYears, 'year');
  if (diffInMonths > 0) return rtf.format(-diffInMonths, 'month');
  if (diffInWeeks > 0) return rtf.format(-diffInWeeks, 'week');
  if (diffInDays > 0) return rtf.format(-diffInDays, 'day');
  if (diffInHours > 0) return rtf.format(-diffInHours, 'hour');
  if (diffInMinutes > 0) return rtf.format(-diffInMinutes, 'minute');
  
  return 'Just now';
}

/**
 * Debounces a function call
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout;
  
  const debouncedFunction = ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T & { cancel: () => void };
  
  debouncedFunction.cancel = () => {
    clearTimeout(timeoutId);
  };
  
  return debouncedFunction;
}

/**
 * Throttles a function call
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean;
  
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
}

/**
 * Deep clones an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  
  return obj;
}

/**
 * Checks if two objects are deeply equal
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  
  if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) {
    return a === b;
  }
  
  if (a === null || a === undefined || b === null || b === undefined) {
    return false;
  }
  
  if (a.prototype !== b.prototype) return false;
  
  let keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  
  return keys.every(k => deepEqual(a[k], b[k]));
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a string to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Converts a string to camelCase
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/[\s\-_]+/g, '');
}

/**
 * Clamps a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculates the distance between two points
 */
export function distance(
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Checks if a point is inside a rectangle
 */
export function isPointInRect(
  point: { x: number; y: number },
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * Generates a random color in hex format
 */
export function randomColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * Converts a hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Gets a contrasting color (black or white) for a given background color
 */
export function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#000000';
  
  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Formats a number with thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Truncates text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Removes undefined values from an object
 */
export function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  
  for (const key in obj) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  
  return result;
}

/**
 * Groups an array of objects by a specified key
 */
export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Flattens a nested array
 */
export function flatten<T>(arr: (T | T[])[]): T[] {
  return arr.reduce<T[]>((acc, val) => {
    return acc.concat(Array.isArray(val) ? flatten(val) : val);
  }, []);
}

/**
 * Creates a range of numbers
 */
export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}

/**
 * Picks specific properties from an object
 */
export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Omits specific properties from an object
 */
export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}
```

## Container Logic

### Container Relationship Management

**File**: `lib/container-logic.ts`

```typescript
import { Node, Edge } from "@xyflow/react";
import { ArchitectureNode } from "@/lib/types/architecture";

/**
 * Determines if a node can be dropped into a container
 */
export function canDropInContainer(
  draggingNode: { serviceType: string; isContainer: boolean },
  targetContainer: { serviceType: string; isContainer: boolean }
): boolean {
  // Only containers can accept other nodes
  if (!targetContainer.isContainer) {
    return false;
  }

  // Define container hierarchy and allowed children
  const containerRules: Record<string, string[]> = {
    'aws-region': [
      'aws-vpc',
      'aws-availability-zone',
      'aws-ec2',
      'aws-rds',
      'aws-s3',
      'aws-lambda',
      'aws-api-gateway',
      'aws-cloudfront',
      'aws-route53',
      'aws-iam',
      'aws-cloudwatch',
      'aws-sns',
      'aws-sqs',
    ],
    'aws-vpc': [
      'aws-public-subnet',
      'aws-private-subnet',
      'aws-internet-gateway',
      'aws-nat-gateway',
      'aws-security-group',
      'aws-route-table',
      'aws-network-acl',
    ],
    'aws-availability-zone': [
      'aws-public-subnet',
      'aws-private-subnet',
      'aws-ec2',
      'aws-rds',
    ],
    'aws-public-subnet': [
      'aws-ec2',
      'aws-nat-gateway',
      'aws-load-balancer',
    ],
    'aws-private-subnet': [
      'aws-ec2',
      'aws-rds',
      'aws-lambda',
    ],
  };

  const allowedChildren = containerRules[targetContainer.serviceType] || [];
  return allowedChildren.includes(draggingNode.serviceType);
}

/**
 * Calculates the optimal position for a node within a container
 */
export function calculateContainerPosition(
  container: Node,
  existingChildren: Node[],
  nodeSize: { width: number; height: number } = { width: 80, height: 80 }
): { x: number; y: number } {
  const containerBounds = {
    x: container.position.x,
    y: container.position.y,
    width: container.style?.width as number || 400,
    height: container.style?.height as number || 300,
  };

  // Padding from container edges
  const padding = 20;
  const spacing = 10;

  // Available area inside container
  const availableArea = {
    x: containerBounds.x + padding,
    y: containerBounds.y + padding,
    width: containerBounds.width - (padding * 2),
    height: containerBounds.height - (padding * 2),
  };

  // If no children, place at top-left of available area
  if (existingChildren.length === 0) {
    return {
      x: availableArea.x,
      y: availableArea.y,
    };
  }

  // Try to find an empty spot using a grid layout
  const gridCellWidth = nodeSize.width + spacing;
  const gridCellHeight = nodeSize.height + spacing;
  const cols = Math.floor(availableArea.width / gridCellWidth);
  const rows = Math.floor(availableArea.height / gridCellHeight);

  // Create grid of occupied positions
  const occupiedGrid = new Set<string>();
  
  existingChildren.forEach(child => {
    const relativeX = child.position.x - availableArea.x;
    const relativeY = child.position.y - availableArea.y;
    const gridX = Math.floor(relativeX / gridCellWidth);
    const gridY = Math.floor(relativeY / gridCellHeight);
    occupiedGrid.add(`${gridX},${gridY}`);
  });

  // Find first empty grid cell
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const gridKey = `${col},${row}`;
      if (!occupiedGrid.has(gridKey)) {
        return {
          x: availableArea.x + (col * gridCellWidth),
          y: availableArea.y + (row * gridCellHeight),
        };
      }
    }
  }

  // If grid is full, stack vertically
  const lastChild = existingChildren[existingChildren.length - 1];
  return {
    x: lastChild.position.x,
    y: lastChild.position.y + nodeSize.height + spacing,
  };
}

/**
 * Automatically resizes a container to fit its children
 */
export function autoResizeContainer(
  container: Node,
  children: Node[]
): { width: number; height: number } {
  if (children.length === 0) {
    return { width: 400, height: 300 }; // Default size
  }

  const padding = 40;
  const minWidth = 200;
  const minHeight = 150;

  // Calculate bounds of all children relative to container
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  children.forEach(child => {
    const relativeX = child.position.x - container.position.x;
    const relativeY = child.position.y - container.position.y;
    const nodeWidth = child.style?.width as number || 80;
    const nodeHeight = child.style?.height as number || 80;

    minX = Math.min(minX, relativeX);
    minY = Math.min(minY, relativeY);
    maxX = Math.max(maxX, relativeX + nodeWidth);
    maxY = Math.max(maxY, relativeY + nodeHeight);
  });

  const requiredWidth = Math.max(minWidth, maxX - minX + (padding * 2));
  const requiredHeight = Math.max(minHeight, maxY - minY + (padding * 2));

  return {
    width: requiredWidth,
    height: requiredHeight,
  };
}

/**
 * Gets all child nodes of a container
 */
export function getContainerChildren(
  containerId: string,
  allNodes: Node[]
): Node[] {
  return allNodes.filter(node => node.parentId === containerId);
}

/**
 * Gets all descendant nodes of a container (including nested children)
 */
export function getContainerDescendants(
  containerId: string,
  allNodes: Node[]
): Node[] {
  const descendants: Node[] = [];
  const directChildren = getContainerChildren(containerId, allNodes);
  
  descendants.push(...directChildren);
  
  // Recursively get children of container children
  directChildren.forEach(child => {
    if (child.data?.isContainer) {
      descendants.push(...getContainerDescendants(child.id, allNodes));
    }
  });
  
  return descendants;
}

/**
 * Checks if moving a node would create a circular dependency
 */
export function wouldCreateCircularDependency(
  nodeId: string,
  newParentId: string,
  allNodes: Node[]
): boolean {
  // A node cannot be its own parent
  if (nodeId === newParentId) {
    return true;
  }

  // Check if the new parent is a descendant of the node
  const nodeDescendants = getContainerDescendants(nodeId, allNodes);
  return nodeDescendants.some(descendant => descendant.id === newParentId);
}

/**
 * Validates container constraints for a node placement
 */
export function validateContainerPlacement(
  nodeId: string,
  containerId: string,
  allNodes: Node[]
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const node = allNodes.find(n => n.id === nodeId);
  const container = allNodes.find(n => n.id === containerId);

  if (!node || !container) {
    errors.push("Node or container not found");
    return { isValid: false, errors, warnings };
  }

  // Check if container can accept this type of node
  if (!canDropInContainer(
    { serviceType: node.data?.serviceId || '', isContainer: node.data?.isContainer || false },
    { serviceType: container.data?.serviceId || '', isContainer: container.data?.isContainer || false }
  )) {
    errors.push(`${container.data?.name || 'Container'} cannot contain ${node.data?.name || 'this node'}`);
  }

  // Check for circular dependency
  if (wouldCreateCircularDependency(nodeId, containerId, allNodes)) {
    errors.push("Moving this node would create a circular dependency");
  }

  // Check container capacity (if applicable)
  const existingChildren = getContainerChildren(containerId, allNodes);
  const maxChildren = getMaxChildrenForContainer(container.data?.serviceId || '');
  
  if (maxChildren && existingChildren.length >= maxChildren) {
    errors.push(`Container has reached maximum capacity of ${maxChildren} children`);
  }

  // Resource-specific validations
  if (container.data?.serviceId === 'aws-availability-zone') {
    const sameTypeChildren = existingChildren.filter(
      child => child.data?.serviceId === node.data?.serviceId
    );
    
    if (node.data?.serviceId === 'aws-public-subnet' && sameTypeChildren.length >= 1) {
      warnings.push("Multiple public subnets in the same AZ is unusual");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Gets the maximum number of children allowed for a container type
 */
function getMaxChildrenForContainer(serviceType: string): number | null {
  const limits: Record<string, number> = {
    'aws-availability-zone': 10, // Practical limit for AZ
    'aws-public-subnet': 5,      // Practical limit for subnet
    'aws-private-subnet': 5,     // Practical limit for subnet
  };
  
  return limits[serviceType] || null;
}

/**
 * Auto-arranges nodes within a container using different layout algorithms
 */
export function autoArrangeContainer(
  containerId: string,
  allNodes: Node[],
  layoutType: 'grid' | 'flow' | 'hierarchical' = 'grid'
): Node[] {
  const container = allNodes.find(n => n.id === containerId);
  const children = getContainerChildren(containerId, allNodes);
  
  if (!container || children.length === 0) {
    return allNodes;
  }

  const containerBounds = {
    x: container.position.x,
    y: container.position.y,
    width: container.style?.width as number || 400,
    height: container.style?.height as number || 300,
  };

  const padding = 20;
  const spacing = 10;
  const nodeSize = { width: 80, height: 80 };

  let arrangedChildren: Node[];

  switch (layoutType) {
    case 'grid':
      arrangedChildren = arrangeInGrid(children, containerBounds, padding, spacing, nodeSize);
      break;
    case 'flow':
      arrangedChildren = arrangeInFlow(children, containerBounds, padding, spacing, nodeSize);
      break;
    case 'hierarchical':
      arrangedChildren = arrangeHierarchically(children, containerBounds, padding, spacing, nodeSize);
      break;
    default:
      arrangedChildren = children;
  }

  // Update nodes with new positions
  return allNodes.map(node => {
    const arrangedNode = arrangedChildren.find(child => child.id === node.id);
    return arrangedNode || node;
  });
}

function arrangeInGrid(
  children: Node[],
  containerBounds: any,
  padding: number,
  spacing: number,
  nodeSize: any
): Node[] {
  const availableWidth = containerBounds.width - (padding * 2);
  const cols = Math.floor(availableWidth / (nodeSize.width + spacing));
  
  return children.map((child, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    return {
      ...child,
      position: {
        x: containerBounds.x + padding + (col * (nodeSize.width + spacing)),
        y: containerBounds.y + padding + (row * (nodeSize.height + spacing)),
      },
    };
  });
}

function arrangeInFlow(
  children: Node[],
  containerBounds: any,
  padding: number,
  spacing: number,
  nodeSize: any
): Node[] {
  let currentX = containerBounds.x + padding;
  let currentY = containerBounds.y + padding;
  const availableWidth = containerBounds.width - (padding * 2);
  
  return children.map(child => {
    // Check if node fits in current row
    if (currentX + nodeSize.width > containerBounds.x + availableWidth) {
      currentX = containerBounds.x + padding;
      currentY += nodeSize.height + spacing;
    }
    
    const position = { x: currentX, y: currentY };
    currentX += nodeSize.width + spacing;
    
    return {
      ...child,
      position,
    };
  });
}

function arrangeHierarchically(
  children: Node[],
  containerBounds: any,
  padding: number,
  spacing: number,
  nodeSize: any
): Node[] {
  // Sort children by type (containers first, then services)
  const sortedChildren = [...children].sort((a, b) => {
    const aIsContainer = a.data?.isContainer ? 1 : 0;
    const bIsContainer = b.data?.isContainer ? 1 : 0;
    return bIsContainer - aIsContainer;
  });
  
  let currentY = containerBounds.y + padding;
  
  return sortedChildren.map(child => {
    const position = {
      x: containerBounds.x + padding,
      y: currentY,
    };
    
    currentY += nodeSize.height + spacing;
    
    return {
      ...child,
      position,
    };
  });
}
```

## Parent-Child Logic

### Hierarchical Relationship Management

**File**: `lib/parent-child-logic.ts`

```typescript
import { Node } from "@xyflow/react";
import { AWSResourceConfiguration } from "@/lib/types/aws-resources";

/**
 * Builds a hierarchy tree from flat node array
 */
export function buildHierarchyTree(nodes: Node[]): HierarchyNode[] {
  const nodeMap = new Map<string, HierarchyNode>();
  const rootNodes: HierarchyNode[] = [];

  // Create hierarchy nodes
  nodes.forEach(node => {
    nodeMap.set(node.id, {
      id: node.id,
      data: node.data,
      position: node.position,
      children: [],
      parent: null,
      depth: 0,
    });
  });

  // Build parent-child relationships
  nodes.forEach(node => {
    const hierarchyNode = nodeMap.get(node.id)!;
    
    if (node.parentId) {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        hierarchyNode.parent = parent;
        hierarchyNode.depth = parent.depth + 1;
        parent.children.push(hierarchyNode);
      }
    } else {
      rootNodes.push(hierarchyNode);
    }
  });

  return rootNodes;
}

export interface HierarchyNode {
  id: string;
  data: any;
  position: { x: number; y: number };
  children: HierarchyNode[];
  parent: HierarchyNode | null;
  depth: number;
}

/**
 * Finds the path from a node to the root
 */
export function getPathToRoot(nodeId: string, nodes: Node[]): Node[] {
  const path: Node[] = [];
  let currentNode = nodes.find(n => n.id === nodeId);
  
  while (currentNode) {
    path.unshift(currentNode);
    currentNode = currentNode.parentId 
      ? nodes.find(n => n.id === currentNode!.parentId)
      : undefined;
  }
  
  return path;
}

/**
 * Finds the common ancestor of multiple nodes
 */
export function findCommonAncestor(nodeIds: string[], nodes: Node[]): Node | null {
  if (nodeIds.length === 0) return null;
  if (nodeIds.length === 1) {
    return nodes.find(n => n.id === nodeIds[0]) || null;
  }

  // Get paths to root for all nodes
  const paths = nodeIds.map(id => getPathToRoot(id, nodes));
  
  // Find common prefix
  let commonAncestor: Node | null = null;
  const minLength = Math.min(...paths.map(path => path.length));
  
  for (let i = 0; i < minLength; i++) {
    const currentNodes = paths.map(path => path[i]);
    const firstNode = currentNodes[0];
    
    if (currentNodes.every(node => node.id === firstNode.id)) {
      commonAncestor = firstNode;
    } else {
      break;
    }
  }
  
  return commonAncestor;
}

/**
 * Gets all siblings of a node (nodes with the same parent)
 */
export function getSiblings(nodeId: string, nodes: Node[]): Node[] {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return [];
  
  return nodes.filter(n => 
    n.id !== nodeId && 
    n.parentId === node.parentId
  );
}

/**
 * Calculates configuration inheritance from parent to child
 */
export function calculateInheritedConfiguration(
  childNode: Node,
  allNodes: Node[]
): Partial<AWSResourceConfiguration> {
  const inheritedConfig: Partial<AWSResourceConfiguration> = {};
  const pathToRoot = getPathToRoot(childNode.id, allNodes);
  
  // Start from root and apply configurations down the hierarchy
  pathToRoot.forEach((node, index) => {
    const nodeConfig = node.data?.configuration as AWSResourceConfiguration;
    if (!nodeConfig) return;

    // Apply inheritance rules based on node types
    applyInheritanceRules(
      node.data?.serviceId || '',
      nodeConfig,
      inheritedConfig,
      index < pathToRoot.length - 1 // Not the target node
    );
  });

  return inheritedConfig;
}

/**
 * Applies inheritance rules between parent and child configurations
 */
function applyInheritanceRules(
  nodeType: string,
  nodeConfig: AWSResourceConfiguration,
  inheritedConfig: Partial<AWSResourceConfiguration>,
  isParent: boolean
): void {
  switch (nodeType) {
    case 'aws-region':
      if (nodeConfig.region) {
        inheritedConfig.region = nodeConfig.region;
      }
      break;
      
    case 'aws-vpc':
      if (nodeConfig.region) {
        inheritedConfig.region = nodeConfig.region;
      }
      if (nodeConfig.cidrBlock && isParent) {
        // Child subnets should have CIDR within VPC CIDR
        inheritedConfig.parentCidr = nodeConfig.cidrBlock;
      }
      if (nodeConfig.vpcId || !isParent) {
        inheritedConfig.vpcId = nodeConfig.vpcId || nodeConfig.serviceName;
      }
      break;
      
    case 'aws-availability-zone':
      if (nodeConfig.availabilityZone) {
        inheritedConfig.availabilityZone = nodeConfig.availabilityZone;
      }
      break;
      
    case 'aws-public-subnet':
    case 'aws-private-subnet':
      if (nodeConfig.subnetId || !isParent) {
        inheritedConfig.subnetId = nodeConfig.subnetId || nodeConfig.serviceName;
      }
      if (nodeConfig.availabilityZone) {
        inheritedConfig.availabilityZone = nodeConfig.availabilityZone;
      }
      break;
      
    case 'aws-security-group':
      if (nodeConfig.securityGroupId || !isParent) {
        const currentGroups = inheritedConfig.securityGroupIds || [];
        inheritedConfig.securityGroupIds = [
          ...currentGroups,
          nodeConfig.securityGroupId || nodeConfig.serviceName
        ];
      }
      break;
  }
}

/**
 * Validates hierarchy constraints
 */
export function validateHierarchy(nodes: Node[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for circular references
  nodes.forEach(node => {
    if (hasCircularReference(node.id, nodes)) {
      errors.push(`Circular reference detected for node ${node.data?.name || node.id}`);
    }
  });

  // Check for orphaned containers
  const containerNodes = nodes.filter(n => n.data?.isContainer);
  const nonContainerNodes = nodes.filter(n => !n.data?.isContainer);
  
  nonContainerNodes.forEach(node => {
    if (!node.parentId) {
      warnings.push(`Node ${node.data?.name || node.id} is not inside any container`);
    }
  });

  // Validate AWS-specific hierarchy rules
  nodes.forEach(node => {
    const hierarchyErrors = validateAWSHierarchy(node, nodes);
    errors.push(...hierarchyErrors);
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Checks if a node has circular references
 */
function hasCircularReference(nodeId: string, nodes: Node[]): boolean {
  const visited = new Set<string>();
  let currentId: string | undefined = nodeId;
  
  while (currentId) {
    if (visited.has(currentId)) {
      return true;
    }
    
    visited.add(currentId);
    const currentNode = nodes.find(n => n.id === currentId);
    currentId = currentNode?.parentId;
  }
  
  return false;
}

/**
 * Validates AWS-specific hierarchy rules
 */
function validateAWSHierarchy(node: Node, allNodes: Node[]): string[] {
  const errors: string[] = [];
  const serviceType = node.data?.serviceId || '';
  
  if (!node.parentId) return errors;
  
  const parent = allNodes.find(n => n.id === node.parentId);
  if (!parent) return errors;
  
  const parentServiceType = parent.data?.serviceId || '';
  
  // Define required parent-child relationships
  const requiredParents: Record<string, string[]> = {
    'aws-vpc': ['aws-region'],
    'aws-public-subnet': ['aws-vpc', 'aws-availability-zone'],
    'aws-private-subnet': ['aws-vpc', 'aws-availability-zone'],
    'aws-ec2': ['aws-public-subnet', 'aws-private-subnet', 'aws-availability-zone'],
    'aws-rds': ['aws-private-subnet', 'aws-availability-zone'],
    'aws-security-group': ['aws-vpc'],
    'aws-internet-gateway': ['aws-vpc'],
    'aws-nat-gateway': ['aws-public-subnet'],
  };
  
  const allowedParents = requiredParents[serviceType];
  if (allowedParents && !allowedParents.includes(parentServiceType)) {
    errors.push(
      `${node.data?.name || serviceType} cannot be placed inside ${parent.data?.name || parentServiceType}`
    );
  }
  
  return errors;
}

/**
 * Auto-corrects hierarchy issues where possible
 */
export function autoCorrectHierarchy(nodes: Node[]): {
  correctedNodes: Node[];
  corrections: string[];
} {
  const correctedNodes = [...nodes];
  const corrections: string[] = [];
  
  // Move orphaned nodes to appropriate containers
  const orphanedNodes = correctedNodes.filter(n => 
    !n.data?.isContainer && 
    !n.parentId &&
    n.data?.serviceId !== 'aws-region'
  );
  
  orphanedNodes.forEach(orphan => {
    const suitableParent = findSuitableParent(orphan, correctedNodes);
    if (suitableParent) {
      const nodeIndex = correctedNodes.findIndex(n => n.id === orphan.id);
      correctedNodes[nodeIndex] = {
        ...orphan,
        parentId: suitableParent.id,
      };
      corrections.push(
        `Moved ${orphan.data?.name || orphan.id} into ${suitableParent.data?.name || suitableParent.id}`
      );
    }
  });
  
  return { correctedNodes, corrections };
}

/**
 * Finds a suitable parent container for a node
 */
function findSuitableParent(node: Node, allNodes: Node[]): Node | null {
  const serviceType = node.data?.serviceId || '';
  
  // Define preferred parent types
  const preferredParents: Record<string, string[]> = {
    'aws-vpc': ['aws-region'],
    'aws-public-subnet': ['aws-vpc'],
    'aws-private-subnet': ['aws-vpc'],
    'aws-ec2': ['aws-public-subnet', 'aws-private-subnet'],
    'aws-rds': ['aws-private-subnet'],
    'aws-security-group': ['aws-vpc'],
  };
  
  const preferred = preferredParents[serviceType];
  if (!preferred) return null;
  
  // Find the first available preferred parent
  for (const parentType of preferred) {
    const parent = allNodes.find(n => 
      n.data?.serviceId === parentType && 
      n.data?.isContainer
    );
    if (parent) {
      return parent;
    }
  }
  
  return null;
}

/**
 * Calculates hierarchy depth statistics
 */
export function getHierarchyStats(nodes: Node[]): {
  maxDepth: number;
  avgDepth: number;
  nodesByDepth: Record<number, number>;
} {
  const depths = nodes.map(node => {
    const path = getPathToRoot(node.id, nodes);
    return path.length - 1; // Root is depth 0
  });
  
  const maxDepth = Math.max(...depths);
  const avgDepth = depths.reduce((sum, depth) => sum + depth, 0) / depths.length;
  
  const nodesByDepth: Record<number, number> = {};
  depths.forEach(depth => {
    nodesByDepth[depth] = (nodesByDepth[depth] || 0) + 1;
  });
  
  return { maxDepth, avgDepth, nodesByDepth };
}
```

## Z-Index Management

### Layer Management System

**File**: `lib/z-index-logic.ts`

```typescript
/**
 * Z-index management for overlapping elements in the canvas
 */

export interface ZIndexLayer {
  name: string;
  baseIndex: number;
  range: number;
}

// Define z-index layers for different element types
export const Z_INDEX_LAYERS: Record<string, ZIndexLayer> = {
  BACKGROUND: { name: 'Background', baseIndex: 0, range: 10 },
  CONTAINERS: { name: 'Containers', baseIndex: 100, range: 100 },
  SERVICES: { name: 'Services', baseIndex: 200, range: 100 },
  CONNECTIONS: { name: 'Connections', baseIndex: 300, range: 50 },
  SELECTION: { name: 'Selection', baseIndex: 400, range: 20 },
  UI_OVERLAYS: { name: 'UI Overlays', baseIndex: 500, range: 100 },
  MODALS: { name: 'Modals', baseIndex: 1000, range: 100 },
  TOOLTIPS: { name: 'Tooltips', baseIndex: 2000, range: 100 },
  NOTIFICATIONS: { name: 'Notifications', baseIndex: 3000, range: 100 },
};

/**
 * Gets the base z-index for a specific layer
 */
export function getLayerZIndex(layerName: keyof typeof Z_INDEX_LAYERS): number {
  return Z_INDEX_LAYERS[layerName]?.baseIndex || 0;
}

/**
 * Gets a z-index within a specific layer with optional offset
 */
export function getZIndex(
  layerName: keyof typeof Z_INDEX_LAYERS,
  offset: number = 0
): number {
  const layer = Z_INDEX_LAYERS[layerName];
  if (!layer) return 0;
  
  const index = layer.baseIndex + Math.max(0, Math.min(offset, layer.range - 1));
  return index;
}

/**
 * Calculates z-index for nodes based on hierarchy and selection
 */
export function calculateNodeZIndex(
  nodeId: string,
  nodes: Node[],
  selectedNodeIds: string[] = []
): number {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return getZIndex('SERVICES');
  
  const isContainer = node.data?.isContainer || false;
  const isSelected = selectedNodeIds.includes(nodeId);
  const depth = getNodeDepth(nodeId, nodes);
  
  // Base layer
  const baseLayer = isContainer ? 'CONTAINERS' : 'SERVICES';
  let zIndex = getZIndex(baseLayer);
  
  // Add depth offset (deeper nodes appear on top)
  zIndex += depth * 2;
  
  // Selected nodes get higher z-index
  if (isSelected) {
    zIndex += getZIndex('SELECTION', 0) - getZIndex(baseLayer);
  }
  
  return zIndex;
}

/**
 * Gets the hierarchy depth of a node
 */
function getNodeDepth(nodeId: string, nodes: Node[]): number {
  let depth = 0;
  let currentNode = nodes.find(n => n.id === nodeId);
  
  while (currentNode?.parentId) {
    depth++;
    currentNode = nodes.find(n => n.id === currentNode!.parentId);
  }
  
  return depth;
}

/**
 * Manages z-index for overlapping containers
 */
export function resolveContainerOverlap(
  containerNodes: Node[]
): Record<string, number> {
  const zIndexMap: Record<string, number> = {};
  
  // Sort containers by size (larger containers behind smaller ones)
  const sortedContainers = [...containerNodes].sort((a, b) => {
    const aSize = (a.style?.width as number || 0) * (a.style?.height as number || 0);
    const bSize = (b.style?.width as number || 0) * (b.style?.height as number || 0);
    return bSize - aSize; // Larger first (lower z-index)
  });
  
  sortedContainers.forEach((container, index) => {
    const baseZIndex = getZIndex('CONTAINERS');
    const depth = getNodeDepth(container.id, containerNodes);
    zIndexMap[container.id] = baseZIndex + depth * 5 + index;
  });
  
  return zIndexMap;
}

/**
 * Creates a stacking context for modal dialogs
 */
export function createModalStackingContext(modalId: string, priority: number = 0): number {
  return getZIndex('MODALS', priority);
}

/**
 * Manages tooltip z-index to ensure they appear above everything
 */
export function getTooltipZIndex(targetElementZIndex: number = 0): number {
  // Tooltips should always appear above their target element
  return Math.max(
    getZIndex('TOOLTIPS'),
    targetElementZIndex + 10
  );
}

/**
 * Gets z-index for notification elements
 */
export function getNotificationZIndex(priority: 'low' | 'normal' | 'high' = 'normal'): number {
  const priorityOffset = {
    low: 0,
    normal: 10,
    high: 20,
  };
  
  return getZIndex('NOTIFICATIONS', priorityOffset[priority]);
}

/**
 * Calculates z-index for connection lines based on connected nodes
 */
export function getConnectionZIndex(
  sourceNodeId: string,
  targetNodeId: string,
  nodes: Node[]
): number {
  const sourceNode = nodes.find(n => n.id === sourceNodeId);
  const targetNode = nodes.find(n => n.id === targetNodeId);
  
  if (!sourceNode || !targetNode) {
    return getZIndex('CONNECTIONS');
  }
  
  // Use the minimum z-index of connected nodes minus a small offset
  // This ensures connections appear behind both connected nodes
  const sourceZIndex = calculateNodeZIndex(sourceNodeId, nodes);
  const targetZIndex = calculateNodeZIndex(targetNodeId, nodes);
  const minNodeZIndex = Math.min(sourceZIndex, targetZIndex);
  
  return Math.max(
    getZIndex('CONNECTIONS'),
    minNodeZIndex - 1
  );
}

/**
 * Manages z-index for selection indicators
 */
export function getSelectionIndicatorZIndex(nodeZIndex: number): number {
  // Selection indicators should appear just above the selected node
  return nodeZIndex + 1;
}

/**
 * Creates a z-index manager for dynamic layering
 */
export class ZIndexManager {
  private layerCounters: Record<string, number> = {};
  
  constructor() {
    // Initialize counters for each layer
    Object.keys(Z_INDEX_LAYERS).forEach(layer => {
      this.layerCounters[layer] = 0;
    });
  }
  
  /**
   * Allocates the next available z-index in a layer
   */
  allocate(layerName: keyof typeof Z_INDEX_LAYERS): number {
    const layer = Z_INDEX_LAYERS[layerName];
    if (!layer) return 0;
    
    const currentCount = this.layerCounters[layerName] || 0;
    const zIndex = layer.baseIndex + currentCount;
    
    // Increment counter for next allocation
    this.layerCounters[layerName] = Math.min(currentCount + 1, layer.range - 1);
    
    return zIndex;
  }
  
  /**
   * Resets the counter for a specific layer
   */
  resetLayer(layerName: keyof typeof Z_INDEX_LAYERS): void {
    this.layerCounters[layerName] = 0;
  }
  
  /**
   * Gets the current counter value for a layer
   */
  getLayerCount(layerName: keyof typeof Z_INDEX_LAYERS): number {
    return this.layerCounters[layerName] || 0;
  }
  
  /**
   * Resets all layer counters
   */
  reset(): void {
    Object.keys(Z_INDEX_LAYERS).forEach(layer => {
      this.layerCounters[layer] = 0;
    });
  }
}

/**
 * Global z-index manager instance
 */
export const globalZIndexManager = new ZIndexManager();

/**
 * CSS-in-JS helper for applying z-index styles
 */
export function zIndexStyle(
  layerName: keyof typeof Z_INDEX_LAYERS,
  offset: number = 0
): React.CSSProperties {
  return {
    zIndex: getZIndex(layerName, offset),
  };
}

/**
 * Creates CSS custom properties for z-index values
 */
export function createZIndexCSSVariables(): Record<string, string> {
  const cssVars: Record<string, string> = {};
  
  Object.entries(Z_INDEX_LAYERS).forEach(([layerName, layer]) => {
    const varName = `--z-index-${layerName.toLowerCase().replace(/_/g, '-')}`;
    cssVars[varName] = layer.baseIndex.toString();
  });
  
  return cssVars;
}

/**
 * Validates z-index configuration for potential conflicts
 */
export function validateZIndexConfiguration(): {
  isValid: boolean;
  conflicts: string[];
  suggestions: string[];
} {
  const conflicts: string[] = [];
  const suggestions: string[] = [];
  
  const layers = Object.entries(Z_INDEX_LAYERS);
  
  // Check for overlapping ranges
  for (let i = 0; i < layers.length; i++) {
    for (let j = i + 1; j < layers.length; j++) {
      const [nameA, layerA] = layers[i];
      const [nameB, layerB] = layers[j];
      
      const aEnd = layerA.baseIndex + layerA.range;
      const bStart = layerB.baseIndex;
      
      if (aEnd > bStart && layerA.baseIndex < layerB.baseIndex + layerB.range) {
        conflicts.push(`Layer ${nameA} overlaps with layer ${nameB}`);
      }
    }
  }
  
  // Check for insufficient range
  layers.forEach(([name, layer]) => {
    if (layer.range < 10) {
      suggestions.push(`Layer ${name} has a small range (${layer.range}), consider increasing it`);
    }
  });
  
  return {
    isValid: conflicts.length === 0,
    conflicts,
    suggestions,
  };
}
```

This comprehensive utility system provides essential functions and algorithms that support the entire application, ensuring consistent behavior, efficient operations, and maintainable code throughout the Darch architecture designer.
