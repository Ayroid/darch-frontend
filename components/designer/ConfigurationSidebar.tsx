"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Node } from "@xyflow/react";

import { ConfigurationSidebarMap } from "./configuration_sidebar";

type ConfigurationFormComponent = React.ComponentType<{
	config: Record<string, unknown>;
	onChange: (config: Record<string, unknown>) => void;
}>;

const awsServiceConfigurationMap: Record<string, ConfigurationFormComponent> = {
	"aws-vpc":
		ConfigurationSidebarMap.VPCConfigurationForm as ConfigurationFormComponent,
	"aws-ec2":
		ConfigurationSidebarMap.EC2ConfigurationForm as ConfigurationFormComponent,
	"aws-region":
		ConfigurationSidebarMap.AWSRegionConfigurationForm as ConfigurationFormComponent,
	"aws-availability-zone":
		ConfigurationSidebarMap.AvailabilityZoneConfigurationForm as ConfigurationFormComponent,
	"aws-account":
		ConfigurationSidebarMap.AWSAccountConfigurationForm as ConfigurationFormComponent,
	"aws-private-subnet":
		ConfigurationSidebarMap.PrivateSubnetConfigurationForm as ConfigurationFormComponent,
	"aws-public-subnet":
		ConfigurationSidebarMap.PublicSubnetConfigurationForm as ConfigurationFormComponent,
};

interface ConfigurationSidebarProps {
	selectedNode: Node | null;
	onClose: () => void;
	onNodeUpdate: (nodeId: string, data: Record<string, unknown>) => void;
}

export default function ConfigurationSidebar({
	selectedNode,
	onClose,
	onNodeUpdate,
}: ConfigurationSidebarProps) {
	const [config, setConfig] = React.useState<Record<string, unknown>>({});

	React.useEffect(() => {
		if (selectedNode?.data && typeof selectedNode.data === "object") {
			setConfig(
				((selectedNode.data as Record<string, unknown>).config as Record<
					string,
					unknown
				>) || {}
			);
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
		const serviceId = (data?.serviceId as string) || "";

		return awsServiceConfigurationMap[serviceId]
			? React.createElement(awsServiceConfigurationMap[serviceId], {
					config,
					onChange: handleConfigChange,
			  })
			: React.createElement(ConfigurationSidebarMap.DefaultConfigurationForm, {
					config,
					onChange: handleConfigChange,
			  });
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
