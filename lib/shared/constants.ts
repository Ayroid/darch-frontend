/**
 * Shared constants used throughout the application
 */

export const APP_CONFIG = {
  name: "Darch",
  version: "0.1.0",
  description: "Design and deploy cloud architectures with ease"
} as const;

export const UI_CONSTANTS = {
  // Animation durations
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },

  // Common sizes
  SIZES: {
    NODE_SIZE: 60,
    CONTAINER_MIN_WIDTH: 250,
    CONTAINER_MIN_HEIGHT: 200,
    SIDEBAR_WIDTH: 320,
    TOPBAR_HEIGHT: 64,
  },

  // Keyboard shortcuts
  SHORTCUTS: {
    COPY: 'Ctrl+C',
    PASTE: 'Ctrl+V',
    DUPLICATE: 'Ctrl+D',
    SELECT_ALL: 'Ctrl+A',
    UNDO: 'Ctrl+Z',
    REDO: 'Ctrl+Y',
    DELETE: 'Delete',
    ESCAPE: 'Escape',
    HELP: '?',
    TOGGLE_SIDEBAR: 'T',
    FIT_VIEW: 'Ctrl+0',
    ZOOM_IN: 'Ctrl+=',
    ZOOM_OUT: 'Ctrl+-',
    NEW_ARCHITECTURE: 'Ctrl+N',
    SAVE: 'Ctrl+S',
  },

  // Z-index layers
  Z_INDEX: {
    DROPDOWN: 1000,
    MODAL: 1050,
    TOOLTIP: 1100,
    TOPBAR: 50,
  }
} as const;

export const CANVAS_CONFIG = {
  DEFAULT_ZOOM: 1,
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 2,
  ZOOM_STEP: 0.1,
  PAN_SENSITIVITY: 1,
  SNAP_TO_GRID: false,
  GRID_SIZE: 20,
} as const;

// Node types - v2 format (snake_case)
export const NODE_TYPES = {
  SERVICE: 'aws_service',
  CONTAINER: 'aws_container',
} as const;

// Legacy v1 node types (for backward compatibility)
export const NODE_TYPES_V1 = {
  SERVICE: 'aws-service',
  CONTAINER: 'aws-container',
} as const;

// Resource type constants - v2 format (without aws- prefix)
export const RESOURCE_TYPES = {
  VPC: 'vpc',
  EC2: 'ec2',
  SUBNET: 'subnet', // Unified (no separate public/private)
  REGION: 'region',
  AVAILABILITY_ZONE: 'availability-zone',
  SECURITY_GROUP: 'security-group',
  INTERNET_GATEWAY: 'internet-gateway',
  NAT_GATEWAY: 'nat-gateway',
  ROUTE_TABLE: 'route-table',
} as const;

export const RESOURCE_TYPE_V2_TO_SERVICE_ID: Record<string, string> = {
  'vpc': 'aws-vpc',
  'ec2': 'aws-ec2',
  'subnet': 'aws-subnet', // Will be resolved to public/private based on config
  'region': 'aws-region',
  'availability-zone': 'aws-availability-zone',
  'security-group': 'aws-security-group',
  'internet-gateway': 'aws-internet-gateway',
  'nat-gateway': 'aws-nat-gateway',
  'route-table': 'aws-route-table',
} as const;

export const HANDLE_TYPES = {
  SOURCE: 'source',
  TARGET: 'target',
} as const;

export const EDGE_TYPES = {
  DEFAULT: 'smoothstep',
} as const;

export const AWS_CATEGORIES = [
  'Compute',
  'Storage',
  'Database',
  'Networking',
  'Security',
  'Analytics',
  'Management & Governance',
  'Container Services',
  'Serverless',
] as const;

export type AWSCategory = typeof AWS_CATEGORIES[number];

export const VALIDATION_RULES = {
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 128,
  MAX_DESCRIPTION_LENGTH: 512,
  MAX_TAG_KEY_LENGTH: 128,
  MAX_TAG_VALUE_LENGTH: 256,
  CIDR_PATTERN: /^([0-9]{1,3}\.){3}[0-9]{1,3}\/([0-9]|[1-2][0-9]|3[0-2])$/,
  IP_PATTERN: /^([0-9]{1,3}\.){3}[0-9]{1,3}$/,
} as const;

export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_CIDR: 'Invalid CIDR format (e.g., 10.0.0.0/16)',
  INVALID_IP: 'Invalid IP address format',
  NAME_TOO_LONG: `Name cannot exceed ${VALIDATION_RULES.MAX_NAME_LENGTH} characters`,
  DESCRIPTION_TOO_LONG: `Description cannot exceed ${VALIDATION_RULES.MAX_DESCRIPTION_LENGTH} characters`,
  TAG_KEY_TOO_LONG: `Tag key cannot exceed ${VALIDATION_RULES.MAX_TAG_KEY_LENGTH} characters`,
  TAG_VALUE_TOO_LONG: `Tag value cannot exceed ${VALIDATION_RULES.MAX_TAG_VALUE_LENGTH} characters`,
  NETWORK_ERROR: 'Network error occurred. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;
