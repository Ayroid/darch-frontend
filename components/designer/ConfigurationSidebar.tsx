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
  cidrBlock: string;
  availabilityZones: string[];
  enableDnsSupport: boolean;
  enableDnsHostnames: boolean;
  createNatGw: boolean;
  createPrivateSubnets: boolean;
  createPublicSubnets: boolean;
  createInternetGw: boolean;
  createSubnets: boolean;
  createRouteTable: boolean;
  natGatewayStrategy: string;
  enableVpcFlowLog: boolean;
  publicSubnetCidrs: string;
  privateSubnetCidrs: string;
}

interface EC2Configuration {
  amiId: string;
  subnetId: string;
  keyName: string;
  instanceType: string;
  environment: string;
  systemName: string;
  resourceOwner: string;
  createKeyPair: boolean;
  associatePublicIp: boolean;
  name: string;
  rootVolumeSize: string;
  createLogGroup: boolean;
  region: string;
}

const VPCConfigurationForm: React.FC<{
  config: Partial<VPCConfiguration>;
  onChange: (config: Partial<VPCConfiguration>) => void;
}> = ({ config, onChange }) => {
  const updateConfig = (key: keyof VPCConfiguration, value: string | boolean | string[]) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
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
        <Label htmlFor="availability-zones">Availability Zones <span className="text-red-500">*</span></Label>
        <Select
          value={config.availabilityZones?.[0] || ""}
          onValueChange={(value) => updateConfig("availabilityZones", [value])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select availability zone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="us-east-1a">us-east-1a</SelectItem>
            <SelectItem value="us-east-1b">us-east-1b</SelectItem>
            <SelectItem value="us-east-1c">us-east-1c</SelectItem>
            <SelectItem value="us-west-2a">us-west-2a</SelectItem>
            <SelectItem value="us-west-2b">us-west-2b</SelectItem>
            <SelectItem value="us-west-2c">us-west-2c</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="public-subnet-cidrs">Public Subnet CIDRs <span className="text-red-500">*</span></Label>
        <Textarea
          id="public-subnet-cidrs"
          placeholder="Enter public subnet CIDRs (e.g., 10.0.1.0/24, 10.0.2.0/24)"
          value={config.publicSubnetCidrs || ""}
          onChange={(e) => updateConfig("publicSubnetCidrs", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="private-subnet-cidrs">Private Subnet CIDRs <span className="text-red-500">*</span></Label>
        <Textarea
          id="private-subnet-cidrs"
          placeholder="Enter private subnet CIDRs (e.g., 10.0.10.0/24, 10.0.20.0/24)"
          value={config.privateSubnetCidrs || ""}
          onChange={(e) => updateConfig("privateSubnetCidrs", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nat-gateway-strategy">NAT Gateway Strategy</Label>
        <Select
          value={config.natGatewayStrategy || ""}
          onValueChange={(value) => updateConfig("natGatewayStrategy", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select NAT strategy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public_az">Public AZ</SelectItem>
            <SelectItem value="single_az">Single AZ</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
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
            id="create-nat-gw"
            checked={config.createNatGw || false}
            onCheckedChange={(checked) => updateConfig("createNatGw", checked)}
          />
          <Label htmlFor="create-nat-gw">Create NAT gateway</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="create-internet-gw"
            checked={config.createInternetGw || false}
            onCheckedChange={(checked) => updateConfig("createInternetGw", checked)}
          />
          <Label htmlFor="create-internet-gw">Create internet gateway</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="create-public-subnets"
            checked={config.createPublicSubnets || false}
            onCheckedChange={(checked) => updateConfig("createPublicSubnets", checked)}
          />
          <Label htmlFor="create-public-subnets">Create public subnets</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="create-private-subnets"
            checked={config.createPrivateSubnets || false}
            onCheckedChange={(checked) => updateConfig("createPrivateSubnets", checked)}
          />
          <Label htmlFor="create-private-subnets">Create private subnets</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="create-route-tables"
            checked={config.createRouteTable || false}
            onCheckedChange={(checked) => updateConfig("createRouteTable", checked)}
          />
          <Label htmlFor="create-route-tables">Create route tables</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="enable-vpc-flow-log"
            checked={config.enableVpcFlowLog || false}
            onCheckedChange={(checked) => updateConfig("enableVpcFlowLog", checked)}
          />
          <Label htmlFor="enable-vpc-flow-log">Enable VPC flow logs</Label>
        </div>
      </div>
    </div>
  );
};

const EC2ConfigurationForm: React.FC<{
  config: Partial<EC2Configuration>;
  onChange: (config: Partial<EC2Configuration>) => void;
}> = ({ config, onChange }) => {
  const updateConfig = (key: keyof EC2Configuration, value: string | boolean) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ami-id">AMI ID <span className="text-red-500">*</span></Label>
        <Input
          id="ami-id"
          placeholder="AMI ID used to launch the EC2 instance"
          value={config.amiId || ""}
          onChange={(e) => updateConfig("amiId", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subnet-id">Subnet ID <span className="text-red-500">*</span></Label>
        <Input
          id="subnet-id"
          placeholder="Subnet ID in which to launch the EC2 instance"
          value={config.subnetId || ""}
          onChange={(e) => updateConfig("subnetId", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="key-name">Key Name</Label>
        <Input
          id="key-name"
          placeholder="Key Pair Name"
          value={config.keyName || ""}
          onChange={(e) => updateConfig("keyName", e.target.value)}
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
            <SelectItem value="t2.micro">t2.micro</SelectItem>
            <SelectItem value="t2.small">t2.small</SelectItem>
            <SelectItem value="t2.medium">t2.medium</SelectItem>
            <SelectItem value="t3.micro">t3.micro</SelectItem>
            <SelectItem value="t3.small">t3.small</SelectItem>
            <SelectItem value="t3.medium">t3.medium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="environment">Environment <span className="text-red-500">*</span></Label>
        <Input
          id="environment"
          placeholder="Environment tag (e.g., dev, staging, prod)"
          value={config.environment || ""}
          onChange={(e) => updateConfig("environment", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="system-name">System Name <span className="text-red-500">*</span></Label>
        <Input
          id="system-name"
          placeholder="Name tag for the EC2 instance"
          value={config.systemName || ""}
          onChange={(e) => updateConfig("systemName", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="resource-owner">Resource Owner <span className="text-red-500">*</span></Label>
        <Input
          id="resource-owner"
          placeholder="EC2 instance owner component"
          value={config.resourceOwner || ""}
          onChange={(e) => updateConfig("resourceOwner", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="root-volume-size">Root Volume Size</Label>
        <Input
          id="root-volume-size"
          placeholder="Root volume size for the EC2 instance"
          value={config.rootVolumeSize || ""}
          onChange={(e) => updateConfig("rootVolumeSize", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="region">Region <span className="text-red-500">*</span></Label>
        <Select
          value={config.region || ""}
          onValueChange={(value) => updateConfig("region", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="AWS Region for the EC2 instance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="us-east-1">us-east-1</SelectItem>
            <SelectItem value="us-west-2">us-west-2</SelectItem>
            <SelectItem value="eu-west-1">eu-west-1</SelectItem>
            <SelectItem value="ap-southeast-1">ap-southeast-1</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="create-key-pair"
            checked={config.createKeyPair || false}
            onCheckedChange={(checked) => updateConfig("createKeyPair", checked)}
          />
          <Label htmlFor="create-key-pair">create key pair</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="associate-public-ip"
            checked={config.associatePublicIp || false}
            onCheckedChange={(checked) => updateConfig("associatePublicIp", checked)}
          />
          <Label htmlFor="associate-public-ip">associate public ip</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="create-log-group"
            checked={config.createLogGroup || false}
            onCheckedChange={(checked) => updateConfig("createLogGroup", checked)}
          />
          <Label htmlFor="create-log-group">create log group</Label>
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
