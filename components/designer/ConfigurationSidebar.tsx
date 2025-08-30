"use client";

import React from "react";
import { Node } from "@xyflow/react";

import { ConfigurationSidebarMap } from "./configuration_sidebar";
import {
	useConfigurationStore,
	useValidationStore,
	getDefaultConfiguration,
} from "@/lib/stores";
import { ConfigurationProvider } from "@/lib/stores";
import { architectureDataManager } from "@/lib/architecture-data-manager";
import { TbCube } from "react-icons/tb";
import { FiCheck, FiAlertTriangle } from "react-icons/fi";
import { Tooltip, TooltipTrigger } from "@radix-ui/react-tooltip";
import { TooltipContent } from "../ui/tooltip";

import { Available_AWS_Resource_Configuration } from "@/lib/types/aws-resources";

type ConfigurationFormComponent = React.ComponentType<{
	config: Available_AWS_Resource_Configuration;
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
	// Zustand store hooks
	const {
		setNodeConfiguration,
		getNodeConfiguration,
		updateNodeConfiguration,
	} = useConfigurationStore();

	const {
		validationErrors,
		setValidationErrors,
		clearValidationErrors,
		validateConfiguration,
	} = useValidationStore();

	// Local state for the current form
	const [config, setConfig] =
		React.useState<Available_AWS_Resource_Configuration>({});
	const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
	const [isSaving, setIsSaving] = React.useState(false);

	// Load configuration when node changes
	React.useEffect(() => {
		if (selectedNode) {
			const nodeId = selectedNode.id;

			// First try to get configuration from the architecture data manager
			let existingConfig = architectureDataManager.getNodeConfiguration(nodeId);

			if (!existingConfig) {
				// If not found, try from the store (for backward compatibility)
				const storeConfig = getNodeConfiguration(nodeId);

				if (!storeConfig) {
					// Create default configuration based on service type
					const data = selectedNode.data as Record<string, unknown>;
					const serviceId = (data?.serviceId as string) || "";
					const defaultConfig = getDefaultConfiguration(serviceId);
					const nodeConfig = (selectedNode.data as Record<string, unknown>)
						.configuration as Record<string, unknown>;

					existingConfig = {
						...defaultConfig,
						...(nodeConfig || {}),
					} as Record<
						string,
						| string
						| number
						| boolean
						| string[]
						| number[]
						| boolean[]
						| Record<string, unknown>
					>;
				} else {
					existingConfig = storeConfig as Record<
						string,
						| string
						| number
						| boolean
						| string[]
						| number[]
						| boolean[]
						| Record<string, unknown>
					>;
				}

				// Store in architecture data manager
				architectureDataManager.updateNodeConfiguration(nodeId, existingConfig);
				// Also update the store for consistency
				setNodeConfiguration(nodeId, existingConfig as Record<string, unknown>);
			} else {
				// Sync with the configuration store
				setNodeConfiguration(nodeId, existingConfig as Record<string, unknown>);
			}

			setConfig(existingConfig as Record<string, unknown>);
			setHasUnsavedChanges(false);
		} else {
			// Clear config when no node is selected
			setConfig({});
			setHasUnsavedChanges(false);
		}
	}, [selectedNode, getNodeConfiguration, setNodeConfiguration]);

	const handleConfigChange = (
		newConfig: Available_AWS_Resource_Configuration
	) => {
		if (!selectedNode) return; // Guard clause for when no node is selected

		setConfig(newConfig);
		setHasUnsavedChanges(true);
		const nodeId = selectedNode.id;

		// Update the store for immediate UI feedback
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

		// Update the node data for the canvas
		onNodeUpdate(selectedNode.id, {
			...selectedNode.data,
			configuration: newConfig,
		});
	};

	const handleSave = async () => {
		if (!selectedNode || !hasUnsavedChanges) return;

		setIsSaving(true);
		const nodeId = selectedNode.id;

		try {
			// Update the architecture data manager with the current config
			const configToSave = config as Record<
				string,
				| string
				| number
				| boolean
				| string[]
				| number[]
				| boolean[]
				| Record<string, unknown>
			>;
			architectureDataManager.updateNodeConfiguration(nodeId, configToSave);

			// Force save to ensure persistence
			architectureDataManager.forceSave();

			setHasUnsavedChanges(false);

			// Show success feedback (optional - you can add a toast notification here)
			console.log("Configuration saved successfully for node:", nodeId);
		} catch (error) {
			console.error("Failed to save configuration:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const getServiceName = (): string => {
		if (!selectedNode) return "Configuration";

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

	// Get validation errors for current node
	const currentErrors = selectedNode
		? validationErrors[selectedNode.id] || []
		: [];

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
					{selectedNode && (
						<div className="flex items-center gap-2">
							{hasUnsavedChanges && (
								<Tooltip>
									<TooltipTrigger asChild>
										<FiAlertTriangle className="w-6 h-6 cursor-pointer text-amber-600" />
									</TooltipTrigger>
									<TooltipContent side="bottom" align="center">
										Unsaved changes
									</TooltipContent>
								</Tooltip>
							)}
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										onClick={handleSave}
										disabled={!hasUnsavedChanges || isSaving}
										className="p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
										aria-label="Save"
										type="button"
									>
										{isSaving ? (
											<div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
										) : (
											<FiCheck className="w-5 h-5 text-green-600" />
										)}
									</button>
								</TooltipTrigger>
								<TooltipContent side="bottom" align="center">
									Save
								</TooltipContent>
							</Tooltip>
						</div>
					)}
				</div>

				{/* Validation Errors */}
				{selectedNode && currentErrors.length > 0 && (
					<div className="p-4 bg-red-50 border-b border-red-200">
						<h3 className="text-sm font-medium text-red-800 mb-2">
							Configuration Errors:
						</h3>
						<ul className="text-sm text-red-700 space-y-1">
							{currentErrors.map((error: string, index: number) => (
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
