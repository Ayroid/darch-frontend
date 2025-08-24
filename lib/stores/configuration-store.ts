import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Import all configuration types
import type {
  VPCConfiguration,
  EC2Configuration,
  DefaultConfiguration,
  AWSRegionConfiguration,
  AvailabilityZoneConfiguration,
  PrivateSubnetConfiguration,
  PublicSubnetConfiguration,
} from '@/components/designer/configuration_sidebar';

// Union type for all possible configurations
export type ServiceConfiguration =
  | VPCConfiguration
  | EC2Configuration
  | DefaultConfiguration
  | AWSRegionConfiguration
  | AvailabilityZoneConfiguration
  | PrivateSubnetConfiguration
  | PublicSubnetConfiguration
  | Record<string, unknown>;

// State shape
interface ConfigurationState {
  // Current node being configured
  selectedNodeId: string | null;
  
  // Configuration data for each node (nodeId -> config)
  nodeConfigurations: Record<string, ServiceConfiguration>;
  
  // UI state
  isSidebarOpen: boolean;
  
  // Form validation state
  validationErrors: Record<string, string[]>;
  
  // Temporary/draft state for forms
  draftConfiguration: ServiceConfiguration | null;
}

// Actions
interface ConfigurationActions {
  // Node selection
  setSelectedNode: (nodeId: string | null) => void;
  
  // Configuration management
  setNodeConfiguration: (nodeId: string, config: ServiceConfiguration) => void;
  getNodeConfiguration: (nodeId: string) => ServiceConfiguration | undefined;
  updateNodeConfiguration: (nodeId: string, updates: Partial<ServiceConfiguration>) => void;
  deleteNodeConfiguration: (nodeId: string) => void;
  
  // Sidebar state
  openSidebar: () => void;
  closeSidebar: () => void;
  
  // Draft state for form editing
  setDraftConfiguration: (config: ServiceConfiguration) => void;
  clearDraftConfiguration: () => void;
  commitDraftConfiguration: (nodeId: string) => void;
  
  // Validation
  setValidationErrors: (nodeId: string, errors: string[]) => void;
  clearValidationErrors: (nodeId: string) => void;
  
  // Bulk operations
  clearAllConfigurations: () => void;
  importConfigurations: (configurations: Record<string, ServiceConfiguration>) => void;
  exportConfigurations: () => Record<string, ServiceConfiguration>;
}

// Default configuration values for different service types
export const defaultConfigurations: Record<string, Partial<ServiceConfiguration>> = {
  'aws-vpc': {
    name: 'vpc-main',
    cidrBlock: '10.0.0.0/16',
    region: 'us-east-1',
    enableDnsSupport: true,
    enableDnsHostnames: true,
    tags: '',
  } as Partial<VPCConfiguration>,
  
  'aws-ec2': {
    name: 'ec2-instance',
    instanceType: 't3.micro',
    amiId: 'ami-0c55b159cbfafe1d0',
    keyPairName: '',
    availabilityZone: 'us-east-1a',
    subnetId: '',
    securityGroups: [],
    rootVolumeSize: 8,
    rootVolumeType: 'gp3',
    deleteOnTermination: true,
    encrypted: false,
    detailedMonitoring: false,
    terminationProtection: false,
    autoRecovery: true,
    associatePublicIpAddress: false,
    tenancy: 'default',
    tags: {},
  } as Partial<EC2Configuration>,
  
  'aws-region': {
    name: 'us-east-1',
    displayName: 'US East (N. Virginia)',
    description: '',
  } as Partial<AWSRegionConfiguration>,
  
  'aws-availability-zone': {
    name: 'us-east-1a',
    region: 'us-east-1',
    state: 'available',
  } as Partial<AvailabilityZoneConfiguration>,
  
  'aws-private-subnet': {
    name: 'private-subnet',
    cidrBlock: '10.0.1.0/24',
    availabilityZone: 'us-east-1a',
    vpcId: '',
    routeTableId: '',
    tags: '',
  } as Partial<PrivateSubnetConfiguration>,
  
  'aws-public-subnet': {
    name: 'public-subnet',
    cidrBlock: '10.0.0.0/24',
    availabilityZone: 'us-east-1a',
    vpcId: '',
    routeTableId: '',
    internetGatewayId: '',
    tags: '',
  } as Partial<PublicSubnetConfiguration>,
};

// Create the store
export const useConfigurationStore = create<ConfigurationState & ConfigurationActions>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      selectedNodeId: null,
      nodeConfigurations: {},
      isSidebarOpen: false,
      validationErrors: {},
      draftConfiguration: null,

      // Actions
      setSelectedNode: (nodeId) =>
        set((state) => {
          state.selectedNodeId = nodeId;
          if (nodeId) {
            state.isSidebarOpen = true;
            // Load existing configuration or create default
            if (!state.nodeConfigurations[nodeId]) {
              // We'll set a default configuration based on service type
              // This will be handled by the component that knows the service type
            }
          } else {
            state.isSidebarOpen = false;
          }
        }),

      setNodeConfiguration: (nodeId, config) =>
        set((state) => {
          state.nodeConfigurations[nodeId] = config;
        }),

      getNodeConfiguration: (nodeId) => {
        return get().nodeConfigurations[nodeId];
      },

      updateNodeConfiguration: (nodeId, updates) =>
        set((state) => {
          if (state.nodeConfigurations[nodeId]) {
            state.nodeConfigurations[nodeId] = {
              ...state.nodeConfigurations[nodeId],
              ...updates,
            };
          } else {
            state.nodeConfigurations[nodeId] = updates as ServiceConfiguration;
          }
        }),

      deleteNodeConfiguration: (nodeId) =>
        set((state) => {
          delete state.nodeConfigurations[nodeId];
          delete state.validationErrors[nodeId];
        }),

      openSidebar: () =>
        set((state) => {
          state.isSidebarOpen = true;
        }),

      closeSidebar: () =>
        set((state) => {
          state.isSidebarOpen = false;
          state.selectedNodeId = null;
          state.draftConfiguration = null;
        }),

      setDraftConfiguration: (config) =>
        set((state) => {
          state.draftConfiguration = config;
        }),

      clearDraftConfiguration: () =>
        set((state) => {
          state.draftConfiguration = null;
        }),

      commitDraftConfiguration: (nodeId) =>
        set((state) => {
          if (state.draftConfiguration) {
            state.nodeConfigurations[nodeId] = state.draftConfiguration;
            state.draftConfiguration = null;
          }
        }),

      setValidationErrors: (nodeId, errors) =>
        set((state) => {
          state.validationErrors[nodeId] = errors;
        }),

      clearValidationErrors: (nodeId) =>
        set((state) => {
          delete state.validationErrors[nodeId];
        }),

      clearAllConfigurations: () =>
        set((state) => {
          state.nodeConfigurations = {};
          state.validationErrors = {};
          state.selectedNodeId = null;
          state.draftConfiguration = null;
          state.isSidebarOpen = false;
        }),

      importConfigurations: (configurations) =>
        set((state) => {
          state.nodeConfigurations = { ...state.nodeConfigurations, ...configurations };
        }),

      exportConfigurations: () => {
        return get().nodeConfigurations;
      },
    })),
    {
      name: 'configuration-store', // for devtools
    }
  )
);

// Utility function to get default configuration for a service type
export const getDefaultConfiguration = (serviceId: string): ServiceConfiguration => {
  return defaultConfigurations[serviceId] || {};
};

// Validation helpers
export const validateConfiguration = (
  serviceId: string,
  config: ServiceConfiguration
): string[] => {
  const errors: string[] = [];

  switch (serviceId) {
    case 'aws-vpc':
      const vpcConfig = config as VPCConfiguration;
      if (!vpcConfig.name?.trim()) errors.push('VPC name is required');
      if (!vpcConfig.cidrBlock?.trim()) errors.push('CIDR block is required');
      if (!vpcConfig.region?.trim()) errors.push('Region is required');
      break;

    case 'aws-ec2':
      const ec2Config = config as EC2Configuration;
      if (!ec2Config.name?.trim()) errors.push('Instance name is required');
      if (!ec2Config.instanceType?.trim()) errors.push('Instance type is required');
      if (!ec2Config.amiId?.trim()) errors.push('AMI ID is required');
      break;

    // Add more validation rules for other service types as needed
  }

  return errors;
};
