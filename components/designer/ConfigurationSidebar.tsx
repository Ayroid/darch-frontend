"use client";

import React from "react";
import { Node } from "@xyflow/react";

import { ConfigurationSidebarMap } from "./configuration_sidebar";
import { useArchitectureStore } from "@/lib/stores/architecture/architecture-store";
import { ConfigurationProvider } from "@/lib/stores";
import { TbCube } from "react-icons/tb";

import { AWSResourceConfiguration } from "@/lib/types/aws-resources";

type ConfigurationFormComponent = React.ComponentType<{
	config: AWSResourceConfiguration;
	onChange: (config: AWSResourceConfiguration) => void;
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
	isOpen: boolean;
	onToggle: () => void;
	onNodeUpdate: (nodeId: string, data: Record<string, unknown>) => void;
}

export default function ConfigurationSidebar({
	selectedNode,
	isOpen,
	onToggle,
	onNodeUpdate,
}: ConfigurationSidebarProps) {
	// Unified architecture store
	const {
		getNodeConfiguration,
		updateNodeConfiguration,
		initializeNodeConfiguration
	} = useArchitectureStore();

	// Initialize configuration when node is selected
	React.useEffect(() => {
		if (selectedNode) {
			const data = selectedNode.data as Record<string, unknown>;
			const serviceId = (data?.serviceId as string) || "";
			initializeNodeConfiguration(selectedNode.id, serviceId);
		}
	}, [selectedNode, initializeNodeConfiguration]);

	// Get current configuration from store
	const config = selectedNode
		? getNodeConfiguration(selectedNode.id) || {}
		: {};

	const handleConfigChange = (newConfig: AWSResourceConfiguration) => {
		if (!selectedNode) return; // Guard clause for when no node is selected

		const nodeId = selectedNode.id;

		// Update the architecture store (this will update both the configuration and the JSON data)
		updateNodeConfiguration(nodeId, newConfig);

		// Update the node data for the canvas
		onNodeUpdate(selectedNode.id, {
			...selectedNode.data,
			configuration: newConfig,
		});
	};

	const getServiceName = (): string => {
		if (!selectedNode) return "Configuration";

		if (selectedNode.type === "awsService") {
			const name = (selectedNode.data.name as string) || "AWS Service";
			return name;
		}
		if (selectedNode.type === "awsContainer") {
			const name = (selectedNode.data.name as string) || "AWS Container";
			return name;
		}
		return "Configuration";
	};

	const renderConfigurationForm = () => {
		if (!selectedNode) {
			return (
				<div className="flex flex-col items-center justify-center h-full text-center px-6 gap-16">
					<div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
						<TbCube className="w-16 h-16 text-gray-800" />
					</div>
					<div className="space-y-3 text-left">
						<div className="flex items-start space-x-3">
							<div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
							<div className="text-sm text-gray-600">
								<span className="font-medium">Click</span> any node on the
								canvas to configure it
							</div>
						</div>
						<div className="flex items-start space-x-3">
							<div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
							<div className="text-sm text-gray-600">
								<span className="font-medium">Drag</span> services from the left
								sidebar to add them
							</div>
						</div>
						<div className="flex items-start space-x-3">
							<div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
							<div className="text-sm text-gray-600">
								Press{" "}
								<kbd className="px-2 py-1 bg-gray-100 border rounded text-xs font-mono">
									Y
								</kbd>{" "}
								to toggle this panel
							</div>
						</div>
					</div>
				</div>
			);
		}

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

	return (
		<div className="relative">
			{/* Sidebar */}
			<div
				className={`fixed top-16 right-0 bg-white border-l border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out z-40 overflow-hidden flex flex-col ${
					isOpen ? "translate-x-0" : "translate-x-full"
				}`}
				style={{ width: "384px", height: "calc(100vh - 4rem)" }}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-gray-200">
					<div className="flex items-center gap-2">
						<h2 className="text-lg font-semibold text-gray-900">
							{selectedNode ? getServiceName() : "Configuration Sidebar"}
						</h2>
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-4">
					{renderConfigurationForm()}
				</div>
			</div>

			{/* Toggle Button - Attached to sidebar edge */}
			<button
				onClick={onToggle}
				className={`fixed z-50 bg-white border border-gray-200 shadow-lg hover:bg-gray-50 transition-all duration-300 ease-in-out ${
					isOpen
						? "right-[384px] rounded-l-lg border-r-0"
						: "right-0 rounded-l-lg"
				}`}
				style={{
					top: "calc(50vh + 2rem)",
					transform: "translateY(-50%)",
					padding: "12px 4px",
					borderTopRightRadius: isOpen ? "0" : "0.5rem",
					borderBottomRightRadius: isOpen ? "0" : "0.5rem",
				}}
				aria-label="Toggle Configuration Sidebar"
			>
				<svg
					className={`w-5 h-5 transition-transform duration-300 ${
						isOpen ? "rotate-180" : ""
					}`}
					fill="none"
					stroke="gray"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M15 19l-7-7 7-7"
					/>
				</svg>
			</button>
		</div>
	);
}
