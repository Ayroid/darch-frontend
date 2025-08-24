"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Node } from "@xyflow/react";

import { ConfigurationSidebarMap } from "./configuration_sidebar";
import { 
  useConfigurationStore, 
  getDefaultConfiguration,
  validateConfiguration 
} from "@/lib/stores/configuration-store";
import { ConfigurationProvider } from "@/lib/stores/configuration-context";

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
	// Zustand store hooks
	const {
		validationErrors,
		setNodeConfiguration,
		getNodeConfiguration,
		updateNodeConfiguration,
		setValidationErrors,
		clearValidationErrors,
	} = useConfigurationStore();

	// Local state for the current form
	const [config, setConfig] = React.useState<Record<string, unknown>>({});

	// Load configuration when node changes
	React.useEffect(() => {
		if (selectedNode) {
			const nodeId = selectedNode.id;
			let existingConfig = getNodeConfiguration(nodeId);
			
			if (!existingConfig) {
				// Create default configuration based on service type
				const data = selectedNode.data as Record<string, unknown>;
				const serviceId = (data?.serviceId as string) || "";
				existingConfig = {
					...getDefaultConfiguration(serviceId),
					...(((selectedNode.data as Record<string, unknown>).config as Record<string, unknown>) || {})
				};
				setNodeConfiguration(nodeId, existingConfig);
			}
			
			setConfig(existingConfig as Record<string, unknown>);
		}
	}, [selectedNode, getNodeConfiguration, setNodeConfiguration]);

	if (!selectedNode) return null;

	const handleConfigChange = (newConfig: Record<string, unknown>) => {
		setConfig(newConfig);
		const nodeId = selectedNode.id;
		
		// Update the store
		updateNodeConfiguration(nodeId, newConfig);
		
		// Validate the configuration
		const data = selectedNode.data as Record<string, unknown>;
		const serviceId = (data?.serviceId as string) || "";
		const errors = validateConfiguration(serviceId, newConfig);
		
		if (errors.length > 0) {
			setValidationErrors(nodeId, errors);
		} else {
			clearValidationErrors(nodeId);
		}
		
		// Update the node data
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

		const formElement = awsServiceConfigurationMap[serviceId]
			? React.createElement(awsServiceConfigurationMap[serviceId], {
					config,
					onChange: handleConfigChange,
			  })
			: React.createElement(ConfigurationSidebarMap.DefaultConfigurationForm, {
					config,
					onChange: handleConfigChange,
			  });

		return (
			<ConfigurationProvider nodeId={selectedNode.id} serviceId={serviceId}>
				{formElement}
			</ConfigurationProvider>
		);
	};

	// Get validation errors for current node
	const currentErrors = selectedNode ? validationErrors[selectedNode.id] || [] : [];

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

			{/* Validation Errors */}
			{currentErrors.length > 0 && (
				<div className="p-4 bg-red-50 border-b border-red-200">
					<h3 className="text-sm font-medium text-red-800 mb-2">
						Configuration Errors:
					</h3>
					<ul className="text-sm text-red-700 space-y-1">
						{currentErrors.map((error, index) => (
							<li key={index} className="flex items-start">
								<span className="text-red-500 mr-1">•</span>
								{error}
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Content */}
			<div className="flex-1 overflow-y-auto p-4">
				{renderConfigurationForm()}
			</div>
		</div>
	);
}
