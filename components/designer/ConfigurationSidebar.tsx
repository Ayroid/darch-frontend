"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Node } from "@xyflow/react";

interface ConfigurationSidebarProps {
  selectedNode: Node | null;
  onClose: () => void;
  onNodeUpdate: (nodeId: string, data: Record<string, unknown>) => void;
}

interface VPCConfiguration {
  // Basic VPC Configuration
  name: string;
  cidrBlock: string;
  region: string;
  availabilityZones: string[];

  // VPC Settings
  enableDnsSupport: boolean;
  enableDnsHostnames: boolean;
  enableClassiclink: boolean;
  enableClassiclinkDnsSupport: boolean;
  assignGeneratedIpv6CidrBlock: boolean;

  // Subnet Configuration
  createPublicSubnets: boolean;
  createPrivateSubnets: boolean;
  createIntraSubnets: boolean;
  publicSubnetCidrs: string[];
  privateSubnetCidrs: string[];
  intraSubnetCidrs: string[];

  // Gateway Configuration
  createInternetGateway: boolean;
  createNatGateway: boolean;
  singleNatGateway: boolean;
  oneNatGatewayPerAz: boolean;
  reuseNatIps: boolean;
  externalNatIpIds: string[];

  // Route Table Configuration
  createPublicRouteTable: boolean;
  createPrivateRouteTable: boolean;
  createIntraRouteTable: boolean;
  publicRouteTableTags: Record<string, string>;
  privateRouteTableTags: Record<string, string>;

  // VPC Flow Logs
  enableVpcFlowLogs: boolean;
  flowLogsDestinationType: string; // 'cloud-watch-logs' | 's3'
  flowLogsLogDestination: string;
  flowLogsLogFormat: string;
  flowLogsTrafficType: string; // 'ALL' | 'ACCEPT' | 'REJECT'

  // DHCP Options
  createDhcpOptions: boolean;
  dhcpOptionsDomainName: string;
  dhcpOptionsDomainNameServers: string[];
  dhcpOptionsNtpServers: string[];
  dhcpOptionsNetbiosNameServers: string[];
  dhcpOptionsNetbiosNodeType: string;

  // VPN Gateway
  createVpnGateway: boolean;
  vpnGatewayId: string;
  vpnGatewayAz: string;

  // Tags
  tags: Record<string, string>;
  vpcTags: Record<string, string>;
  publicSubnetTags: Record<string, string>;
  privateSubnetTags: Record<string, string>;
  intraSubnetTags: Record<string, string>;
  natGatewayTags: Record<string, string>;
  internetGatewayTags: Record<string, string>;
}

interface EC2Configuration {
  // Basic Instance Configuration
  name: string;
  amiId: string;
  instanceType: string;
  keyName: string;
  subnetId: string;
  vpcSecurityGroupIds: string[];

  // Instance Settings
  associatePublicIpAddress: boolean;
  monitoring: boolean;
  ebsOptimized: boolean;
  disableApiTermination: boolean;
  instanceInitiatedShutdownBehavior: string; // 'stop' | 'terminate'
  tenancy: string; // 'default' | 'dedicated' | 'host'
  hostId: string;
  cpuCoreCount: number;
  cpuThreadsPerCore: number;

  // Storage Configuration
  rootBlockDevice?: {
    volumeType?: string; // 'gp2' | 'gp3' | 'io1' | 'io2' | 'st1' | 'sc1'
    volumeSize?: number;
    iops?: number;
    throughput?: number;
    encrypted?: boolean;
    kmsKeyId?: string;
    deleteOnTermination?: boolean;
    tags?: Record<string, string>;
  };
  ebsBlockDevice?: Array<{
    deviceName?: string;
    volumeType?: string;
    volumeSize?: number;
    iops?: number;
    throughput?: number;
    encrypted?: boolean;
    kmsKeyId?: string;
    snapshotId?: string;
    deleteOnTermination?: boolean;
    tags?: Record<string, string>;
  }>;
  ephemeralBlockDevice?: Array<{
    deviceName?: string;
    virtualName?: string;
    noDevice?: boolean;
  }>;

  // Network Interfaces
  networkInterface?: Array<{
    deviceIndex?: number;
    networkInterfaceId?: string;
    deleteOnTermination?: boolean;
  }>;

  // IAM
  iamInstanceProfile?: string;

  // User Data
  userData?: string;
  userDataBase64?: string;
  userDataReplaceOnChange?: boolean;

  // Placement
  availabilityZone?: string;
  placementGroup?: string;
  placementPartitionNumber?: number;

  // Credit Specification (T2/T3/T4g instances)
  creditSpecification?: {
    cpuCredits?: string; // 'standard' | 'unlimited'
  };

  // Hibernation
  hibernation?: boolean;

  // Security Groups
  securityGroups?: string[];

  // Source/Dest Check
  sourceDestCheck?: boolean;

  // Get Password Data
  getPasswordData?: boolean;

  // Launch Template
  launchTemplate?: {
    id?: string;
    name?: string;
    version?: string;
  };

  // Enclave Options
  enclaveOptions?: {
    enabled?: boolean;
  };

  // Metadata Options
  metadataOptions?: {
    httpEndpoint?: string; // 'enabled' | 'disabled'
    httpPutResponseHopLimit?: number;
    httpTokens?: string; // 'optional' | 'required'
    instanceMetadataTags?: string; // 'enabled' | 'disabled'
  };

  // Private DNS Name Options
  privateDnsNameOptions?: {
    enableResourceNameDnsARecord?: boolean;
    enableResourceNameDnsAAAARecord?: boolean;
    hostnameType?: string; // 'ip-name' | 'resource-name'
  };

  // Tags
  tags?: Record<string, string>;
  volumeTags?: Record<string, string>;

  // Lifecycle
  createBeforeDestroy?: boolean;
  ignoreChanges?: string[];

  // Connection and Provisioner Settings (for remote-exec, file, etc.)
  connection?: {
    type?: string; // 'ssh' | 'winrm'
    user?: string;
    password?: string;
    host?: string;
    port?: number;
    timeout?: string;
    privateKey?: string;
    certificate?: string;
    agent?: boolean;
    agentIdentity?: string;
    hostKey?: string;
    bastionHost?: string;
    bastionPort?: number;
    bastionUser?: string;
    bastionPassword?: string;
    bastionPrivateKey?: string;
    bastionHostKey?: string;
  };
}

const VPCConfigurationForm: React.FC<{
  config: Partial<VPCConfiguration>;
  onChange: (config: Partial<VPCConfiguration>) => void;
}> = ({ config, onChange }) => {
  const updateConfig = (key: keyof VPCConfiguration, value: string | boolean | string[] | Record<string, string>) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Basic Configuration */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Basic Configuration</h3>

        <div className="space-y-2">
          <Label htmlFor="vpc-name">VPC Name <span className="text-red-500">*</span></Label>
          <Input
            id="vpc-name"
            placeholder="e.g., my-vpc"
            value={config.name || ""}
            onChange={(e) => updateConfig("name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cidr-block">VPC CIDR Block <span className="text-red-500">*</span></Label>
          <Input
            id="cidr-block"
            placeholder="e.g., 10.0.0.0/16"
            value={config.cidrBlock || ""}
            onChange={(e) => updateConfig("cidrBlock", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="region">Region <span className="text-red-500">*</span></Label>
          <Select
            value={config.region || ""}
            onValueChange={(value) => updateConfig("region", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select AWS region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us-east-1">us-east-1</SelectItem>
              <SelectItem value="us-east-2">us-east-2</SelectItem>
              <SelectItem value="us-west-1">us-west-1</SelectItem>
              <SelectItem value="us-west-2">us-west-2</SelectItem>
              <SelectItem value="eu-west-1">eu-west-1</SelectItem>
              <SelectItem value="eu-west-2">eu-west-2</SelectItem>
              <SelectItem value="eu-central-1">eu-central-1</SelectItem>
              <SelectItem value="ap-southeast-1">ap-southeast-1</SelectItem>
              <SelectItem value="ap-southeast-2">ap-southeast-2</SelectItem>
              <SelectItem value="ap-northeast-1">ap-northeast-1</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="availability-zones">Availability Zones <span className="text-red-500">*</span></Label>
          <Textarea
            id="availability-zones"
            placeholder="Enter availability zones, comma-separated (e.g., us-east-1a, us-east-1b)"
            value={config.availabilityZones?.join(", ") || ""}
            onChange={(e) => updateConfig("availabilityZones", e.target.value.split(",").map(az => az.trim()))}
          />
        </div>
      </div>

      {/* VPC Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">VPC Settings</h3>

        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enable-dns-support"
              checked={config.enableDnsSupport || false}
              onCheckedChange={(checked) => updateConfig("enableDnsSupport", checked)}
            />
            <Label htmlFor="enable-dns-support">Enable DNS support</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="enable-dns-hostnames"
              checked={config.enableDnsHostnames || false}
              onCheckedChange={(checked) => updateConfig("enableDnsHostnames", checked)}
            />
            <Label htmlFor="enable-dns-hostnames">Enable DNS hostnames</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="assign-ipv6-cidr"
              checked={config.assignGeneratedIpv6CidrBlock || false}
              onCheckedChange={(checked) => updateConfig("assignGeneratedIpv6CidrBlock", checked)}
            />
            <Label htmlFor="assign-ipv6-cidr">Assign IPv6 CIDR block</Label>
          </div>
        </div>
      </div>

      {/* Subnet Configuration */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Subnet Configuration</h3>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="create-public-subnets"
            checked={config.createPublicSubnets || false}
            onCheckedChange={(checked) => updateConfig("createPublicSubnets", checked)}
          />
          <Label htmlFor="create-public-subnets">Create public subnets</Label>
        </div>

        {config.createPublicSubnets && (
          <div className="space-y-2">
            <Label htmlFor="public-subnet-cidrs">Public Subnet CIDRs</Label>
            <Textarea
              id="public-subnet-cidrs"
              placeholder="Enter public subnet CIDRs, comma-separated (e.g., 10.0.1.0/24, 10.0.2.0/24)"
              value={config.publicSubnetCidrs?.join(", ") || ""}
              onChange={(e) => updateConfig("publicSubnetCidrs", e.target.value.split(",").map(cidr => cidr.trim()))}
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="create-private-subnets"
            checked={config.createPrivateSubnets || false}
            onCheckedChange={(checked) => updateConfig("createPrivateSubnets", checked)}
          />
          <Label htmlFor="create-private-subnets">Create private subnets</Label>
        </div>

        {config.createPrivateSubnets && (
          <div className="space-y-2">
            <Label htmlFor="private-subnet-cidrs">Private Subnet CIDRs</Label>
            <Textarea
              id="private-subnet-cidrs"
              placeholder="Enter private subnet CIDRs, comma-separated (e.g., 10.0.10.0/24, 10.0.20.0/24)"
              value={config.privateSubnetCidrs?.join(", ") || ""}
              onChange={(e) => updateConfig("privateSubnetCidrs", e.target.value.split(",").map(cidr => cidr.trim()))}
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="create-intra-subnets"
            checked={config.createIntraSubnets || false}
            onCheckedChange={(checked) => updateConfig("createIntraSubnets", checked)}
          />
          <Label htmlFor="create-intra-subnets">Create intra subnets (no internet access)</Label>
        </div>

        {config.createIntraSubnets && (
          <div className="space-y-2">
            <Label htmlFor="intra-subnet-cidrs">Intra Subnet CIDRs</Label>
            <Textarea
              id="intra-subnet-cidrs"
              placeholder="Enter intra subnet CIDRs, comma-separated (e.g., 10.0.30.0/24, 10.0.40.0/24)"
              value={config.intraSubnetCidrs?.join(", ") || ""}
              onChange={(e) => updateConfig("intraSubnetCidrs", e.target.value.split(",").map(cidr => cidr.trim()))}
            />
          </div>
        )}
      </div>

      {/* Gateway Configuration */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Gateway Configuration</h3>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="create-internet-gateway"
            checked={config.createInternetGateway || false}
            onCheckedChange={(checked) => updateConfig("createInternetGateway", checked)}
          />
          <Label htmlFor="create-internet-gateway">Create internet gateway</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="create-nat-gateway"
            checked={config.createNatGateway || false}
            onCheckedChange={(checked) => updateConfig("createNatGateway", checked)}
          />
          <Label htmlFor="create-nat-gateway">Create NAT gateway</Label>
        </div>

        {config.createNatGateway && (
          <>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="single-nat-gateway"
                checked={config.singleNatGateway || false}
                onCheckedChange={(checked) => updateConfig("singleNatGateway", checked)}
              />
              <Label htmlFor="single-nat-gateway">Single NAT gateway (cost-effective)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="one-nat-per-az"
                checked={config.oneNatGatewayPerAz || false}
                onCheckedChange={(checked) => updateConfig("oneNatGatewayPerAz", checked)}
              />
              <Label htmlFor="one-nat-per-az">One NAT gateway per AZ (high availability)</Label>
            </div>
          </>
        )}
      </div>

      {/* VPC Flow Logs */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">VPC Flow Logs</h3>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="enable-vpc-flow-logs"
            checked={config.enableVpcFlowLogs || false}
            onCheckedChange={(checked) => updateConfig("enableVpcFlowLogs", checked)}
          />
          <Label htmlFor="enable-vpc-flow-logs">Enable VPC flow logs</Label>
        </div>

        {config.enableVpcFlowLogs && (
          <>
            <div className="space-y-2">
              <Label htmlFor="flow-logs-destination">Destination Type</Label>
              <Select
                value={config.flowLogsDestinationType || ""}
                onValueChange={(value) => updateConfig("flowLogsDestinationType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cloud-watch-logs">CloudWatch Logs</SelectItem>
                  <SelectItem value="s3">S3 Bucket</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="flow-logs-traffic-type">Traffic Type</Label>
              <Select
                value={config.flowLogsTrafficType || ""}
                onValueChange={(value) => updateConfig("flowLogsTrafficType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select traffic type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All traffic</SelectItem>
                  <SelectItem value="ACCEPT">Accepted traffic only</SelectItem>
                  <SelectItem value="REJECT">Rejected traffic only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const EC2ConfigurationForm: React.FC<{
  config: Partial<EC2Configuration>;
  onChange: (config: Partial<EC2Configuration>) => void;
}> = ({ config, onChange }) => {
  const updateConfig = (key: keyof EC2Configuration, value: EC2Configuration[keyof EC2Configuration]) => {
    onChange({ ...config, [key]: value });
  };

  const updateRootBlockDevice = (key: string, value: string | boolean | number | Record<string, string>) => {
    const rootBlockDevice = { ...config.rootBlockDevice, [key]: value };
    updateConfig("rootBlockDevice", rootBlockDevice);
  };

  const updateMetadataOptions = (key: string, value: string | number) => {
    const metadataOptions = { ...config.metadataOptions, [key]: value };
    updateConfig("metadataOptions", metadataOptions);
  };

  const updateTags = (newTags: Record<string, string>) => {
    updateConfig("tags", newTags);
  };

  const parseTagsFromString = (tagString: string): Record<string, string> => {
    const tags: Record<string, string> = {};
    tagString.split(",").forEach(tag => {
      const [key, value] = tag.split("=").map(s => s.trim());
      if (key && value) {
        tags[key] = value;
      }
    });
    return tags;
  };

  const tagsToString = (tags: Record<string, string> = {}): string => {
    return Object.entries(tags).map(([key, value]) => `${key}=${value}`).join(", ");
  };

  return (
    <div className="space-y-6">
      {/* Basic Instance Configuration */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Basic Configuration</h3>

        <div className="space-y-2">
          <Label htmlFor="instance-name">Instance Name <span className="text-red-500">*</span></Label>
          <Input
            id="instance-name"
            placeholder="e.g., web-server-01"
            value={config.name || ""}
            onChange={(e) => updateConfig("name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ami-id">AMI ID <span className="text-red-500">*</span></Label>
          <Input
            id="ami-id"
            placeholder="e.g., ami-0abcdef1234567890"
            value={config.amiId || ""}
            onChange={(e) => updateConfig("amiId", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instance-type">Instance Type <span className="text-red-500">*</span></Label>
          <Select
            value={config.instanceType || ""}
            onValueChange={(value) => updateConfig("instanceType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select instance type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="t3.nano">t3.nano</SelectItem>
              <SelectItem value="t3.micro">t3.micro</SelectItem>
              <SelectItem value="t3.small">t3.small</SelectItem>
              <SelectItem value="t3.medium">t3.medium</SelectItem>
              <SelectItem value="t3.large">t3.large</SelectItem>
              <SelectItem value="t3.xlarge">t3.xlarge</SelectItem>
              <SelectItem value="m5.large">m5.large</SelectItem>
              <SelectItem value="m5.xlarge">m5.xlarge</SelectItem>
              <SelectItem value="c5.large">c5.large</SelectItem>
              <SelectItem value="c5.xlarge">c5.xlarge</SelectItem>
              <SelectItem value="r5.large">r5.large</SelectItem>
              <SelectItem value="r5.xlarge">r5.xlarge</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="availability-zone">Availability Zone</Label>
          <Input
            id="availability-zone"
            placeholder="e.g., us-east-1a"
            value={config.availabilityZone || ""}
            onChange={(e) => updateConfig("availabilityZone", e.target.value)}
          />
        </div>
      </div>

      {/* Network Configuration */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Network Configuration</h3>

        <div className="space-y-2">
          <Label htmlFor="subnet-id">Subnet ID <span className="text-red-500">*</span></Label>
          <Input
            id="subnet-id"
            placeholder="e.g., subnet-0abcdef1234567890"
            value={config.subnetId || ""}
            onChange={(e) => updateConfig("subnetId", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="security-groups">VPC Security Group IDs</Label>
          <Textarea
            id="security-groups"
            placeholder="Enter security group IDs, comma-separated (e.g., sg-0abcdef123, sg-0fedcba456)"
            value={config.vpcSecurityGroupIds?.join(", ") || ""}
            onChange={(e) => updateConfig("vpcSecurityGroupIds", e.target.value.split(",").map(sg => sg.trim()))}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="associate-public-ip"
            checked={config.associatePublicIpAddress || false}
            onCheckedChange={(checked) => updateConfig("associatePublicIpAddress", checked)}
          />
          <Label htmlFor="associate-public-ip">Associate public IP address</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="source-dest-check"
            checked={config.sourceDestCheck !== false}
            onCheckedChange={(checked) => updateConfig("sourceDestCheck", checked)}
          />
          <Label htmlFor="source-dest-check">Source/destination check</Label>
        </div>
      </div>

      {/* Key Pair & IAM */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Security Configuration</h3>

        <div className="space-y-2">
          <Label htmlFor="key-name">Key Pair Name</Label>
          <Input
            id="key-name"
            placeholder="e.g., my-key-pair"
            value={config.keyName || ""}
            onChange={(e) => updateConfig("keyName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="iam-instance-profile">IAM Instance Profile</Label>
          <Input
            id="iam-instance-profile"
            placeholder="e.g., EC2InstanceProfile"
            value={config.iamInstanceProfile || ""}
            onChange={(e) => updateConfig("iamInstanceProfile", e.target.value)}
          />
        </div>
      </div>

      {/* Storage Configuration */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Storage Configuration</h3>

        <div className="space-y-2">
          <Label htmlFor="root-volume-type">Root Volume Type</Label>
          <Select
            value={config.rootBlockDevice?.volumeType || ""}
            onValueChange={(value) => updateRootBlockDevice("volumeType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select volume type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gp3">gp3 (General Purpose SSD)</SelectItem>
              <SelectItem value="gp2">gp2 (General Purpose SSD)</SelectItem>
              <SelectItem value="io2">io2 (Provisioned IOPS SSD)</SelectItem>
              <SelectItem value="io1">io1 (Provisioned IOPS SSD)</SelectItem>
              <SelectItem value="st1">st1 (Throughput Optimized HDD)</SelectItem>
              <SelectItem value="sc1">sc1 (Cold HDD)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="root-volume-size">Root Volume Size (GB)</Label>
          <Input
            id="root-volume-size"
            type="number"
            placeholder="e.g., 20"
            value={config.rootBlockDevice?.volumeSize?.toString() || ""}
            onChange={(e) => updateRootBlockDevice("volumeSize", parseInt(e.target.value) || 20)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="root-encrypted"
            checked={config.rootBlockDevice?.encrypted || false}
            onCheckedChange={(checked) => updateRootBlockDevice("encrypted", checked)}
          />
          <Label htmlFor="root-encrypted">Encrypt root volume</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="root-delete-on-termination"
            checked={config.rootBlockDevice?.deleteOnTermination !== false}
            onCheckedChange={(checked) => updateRootBlockDevice("deleteOnTermination", checked)}
          />
          <Label htmlFor="root-delete-on-termination">Delete volume on termination</Label>
        </div>
      </div>

      {/* Instance Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Instance Settings</h3>

        <div className="space-y-2">
          <Label htmlFor="tenancy">Tenancy</Label>
          <Select
            value={config.tenancy || ""}
            onValueChange={(value) => updateConfig("tenancy", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tenancy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="dedicated">Dedicated</SelectItem>
              <SelectItem value="host">Dedicated Host</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shutdown-behavior">Instance Initiated Shutdown Behavior</Label>
          <Select
            value={config.instanceInitiatedShutdownBehavior || ""}
            onValueChange={(value) => updateConfig("instanceInitiatedShutdownBehavior", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select shutdown behavior" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stop">Stop</SelectItem>
              <SelectItem value="terminate">Terminate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="monitoring"
              checked={config.monitoring || false}
              onCheckedChange={(checked) => updateConfig("monitoring", checked)}
            />
            <Label htmlFor="monitoring">Enable detailed monitoring</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="ebs-optimized"
              checked={config.ebsOptimized || false}
              onCheckedChange={(checked) => updateConfig("ebsOptimized", checked)}
            />
            <Label htmlFor="ebs-optimized">EBS optimized</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="disable-api-termination"
              checked={config.disableApiTermination || false}
              onCheckedChange={(checked) => updateConfig("disableApiTermination", checked)}
            />
            <Label htmlFor="disable-api-termination">Disable API termination</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hibernation"
              checked={config.hibernation || false}
              onCheckedChange={(checked) => updateConfig("hibernation", checked)}
            />
            <Label htmlFor="hibernation">Enable hibernation</Label>
          </div>
        </div>
      </div>

      {/* Metadata Options */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Metadata Options</h3>

        <div className="space-y-2">
          <Label htmlFor="metadata-endpoint">HTTP Endpoint</Label>
          <Select
            value={config.metadataOptions?.httpEndpoint || ""}
            onValueChange={(value) => updateMetadataOptions("httpEndpoint", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select endpoint option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enabled">Enabled</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="metadata-tokens">HTTP Tokens</Label>
          <Select
            value={config.metadataOptions?.httpTokens || ""}
            onValueChange={(value) => updateMetadataOptions("httpTokens", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select token requirement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="optional">Optional</SelectItem>
              <SelectItem value="required">Required (IMDSv2)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="metadata-hop-limit">HTTP Put Response Hop Limit</Label>
          <Input
            id="metadata-hop-limit"
            type="number"
            placeholder="e.g., 1"
            value={config.metadataOptions?.httpPutResponseHopLimit?.toString() || ""}
            onChange={(e) => updateMetadataOptions("httpPutResponseHopLimit", parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      {/* User Data */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">User Data</h3>

        <div className="space-y-2">
          <Label htmlFor="user-data">User Data Script</Label>
          <Textarea
            id="user-data"
            placeholder="#!/bin/bash&#10;# Your user data script here"
            value={config.userData || ""}
            onChange={(e) => updateConfig("userData", e.target.value)}
            rows={6}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="user-data-replace-on-change"
            checked={config.userDataReplaceOnChange || false}
            onCheckedChange={(checked) => updateConfig("userDataReplaceOnChange", checked)}
          />
          <Label htmlFor="user-data-replace-on-change">Replace instance on user data change</Label>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Tags</h3>

        <div className="space-y-2">
          <Label htmlFor="instance-tags">Instance Tags</Label>
          <Textarea
            id="instance-tags"
            placeholder="Enter tags as key=value pairs, comma-separated (e.g., Environment=prod, Project=web-app)"
            value={tagsToString(config.tags)}
            onChange={(e) => updateTags(parseTagsFromString(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};

export default function ConfigurationSidebar({
  selectedNode,
  onClose,
  onNodeUpdate,
}: ConfigurationSidebarProps) {
  const [config, setConfig] = React.useState<Record<string, unknown>>({});

  React.useEffect(() => {
    // Initialize config based on selected node
    if (selectedNode?.data && typeof selectedNode.data === 'object') {
      setConfig((selectedNode.data as Record<string, unknown>).config as Record<string, unknown> || {});
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  const handleConfigChange = (newConfig: Record<string, unknown>) => {
    setConfig(newConfig);
    onNodeUpdate(selectedNode.id, { ...selectedNode.data, config: newConfig });
  };

  const getServiceName = (): string => {
    if (selectedNode.type === "awsService") {
      const data = selectedNode.data as Record<string, unknown>;
      return (data?.name as string) || "AWS Service";
    }
    if (selectedNode.type === "awsContainer") {
      const data = selectedNode.data as Record<string, unknown>;
      return (data?.name as string) || "AWS Container";
    }
    return "Configuration";
  };

  const renderConfigurationForm = () => {
    const data = selectedNode.data as Record<string, unknown>;
    const serviceName = ((data?.name as string) || "").toLowerCase();

    if (serviceName.includes("vpc") || serviceName.includes("virtual private cloud")) {
      return (
        <VPCConfigurationForm
          config={config as Partial<VPCConfiguration>}
          onChange={handleConfigChange}
        />
      );
    }

    if (serviceName.includes("ec2") || serviceName.includes("instance")) {
      return (
        <EC2ConfigurationForm
          config={config as Partial<EC2Configuration>}
          onChange={handleConfigChange}
        />
      );
    }

    // Default configuration for other services
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="service-name">Service Name</Label>
          <Input
            id="service-name"
            placeholder="Enter service name"
            value={(config.name as string) || ""}
            onChange={(e) => handleConfigChange({ ...config, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter description"
            value={(config.description as string) || ""}
            onChange={(e) => handleConfigChange({ ...config, description: e.target.value })}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-96 bg-white border-l border-gray-200 shadow-lg z-40 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {getServiceName()} Configuration
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderConfigurationForm()}
      </div>
    </div>
  );
}
