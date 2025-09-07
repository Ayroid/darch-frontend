"use client";

import React from "react";
import { Node } from "@xyflow/react";
import Image from "next/image";

import { ConfigurationSidebarMap } from "./configuration_sidebar";
import { useArchitectureStore } from "@/lib/stores/architecture/architecture-store";
import { ConfigurationProvider } from "@/lib/stores";
import { TbCube } from "react-icons/tb";

import {
	AWSResourceConfiguration,
	DefaultConfiguration,
} from "@/lib/types/aws-resources";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

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
	"aws-security-group":
		ConfigurationSidebarMap.SecurityGroupConfigurationForm as ConfigurationFormComponent,
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
		initializeNodeConfiguration,
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

	const getServiceIcon = (): string | null => {
		if (!selectedNode) return null;
		const data = selectedNode.data as Record<string, unknown>;
		return (data?.icon as string) || null;
	};

	const getServiceName = (): string => {
		if (!selectedNode) return "Configuration";

		if (selectedNode.type === "awsService") {
			const name = (selectedNode.data.name as string) || "AWS Service";
			return "AWS " + name;
		}
		if (selectedNode.type === "awsContainer") {
			const name = (selectedNode.data.name as string) || "AWS Container";
			return "AWS " + name;
		}
		return "Configuration";
	};

	const getServiceId = (): string => {
		if (!selectedNode) return "";
		const data = selectedNode.id;
		return (data as string) || "";
	};

	const renderConfigurationForm = () => {
		if (!selectedNode) {
			return (
				<div className="flex flex-col items-center justify-center h-full text-center">
					<div className="w-20 h-20 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
						<TbCube className="w-12 h-12 text-blue-600" />
					</div>
					<div className="space-y-6 max-w-sm">
						<div>
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								No Node Selected
							</h3>
							<p className="text-sm text-gray-600">
								Select a node from the canvas to configure its properties and
								settings.
							</p>
						</div>
						<div className="space-y-4 text-left">
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
									<span className="font-medium">Drag</span> services from the
									left sidebar to add them
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
					config: config as DefaultConfiguration,
					onChange: handleConfigChange as (
						config: DefaultConfiguration
					) => void,
					onChange: handleConfigChange as (
						config: DefaultConfiguration
					) => void,
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
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
							{selectedNode && getServiceIcon() ? (
								<div className="relative w-8 h-8">
									<Image
										src={getServiceIcon()!}
										alt={getServiceName()}
										fill
										className="object-contain"
										sizes="20px"
									/>
								</div>
							) : (
								<TbCube className="w-10 h-10 text-blue-600" />
							)}
						</div>
						<div className="border-l border-gray-300 pl-3">
							<h2 className="text-lg font-semibold text-gray-900">
								AWS {getServiceName()}
							</h2>
							{selectedNode && (
								<Tooltip>
									<TooltipTrigger>
										<Badge className="rounded-full" variant="outline">
											{getServiceId() && `${getServiceId()}`}
										</Badge>
									</TooltipTrigger>
									<TooltipContent side="bottom">
										<p>Resource ID: {getServiceId()}</p>
									</TooltipContent>
								</Tooltip>
							)}
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto bg-white hide-scrollbar">
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
					className={`w-5 h-5 transition-transform duration-300 text-gray-600 ${
						isOpen ? "rotate-180" : ""
					}`}
					fill="none"
					stroke="currentColor"
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
