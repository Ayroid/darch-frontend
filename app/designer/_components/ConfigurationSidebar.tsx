"use client";

import { useEffect, createElement, ComponentType } from "react";
import { Node } from "@xyflow/react";
import Image from "next/image";
import { Layers, ChevronLeft, MousePointer, GripVertical } from "lucide-react";

import { ConfigurationSidebarMap, DynamicConfigurationForm } from "./configuration-sidebar";
import { useArchitectureStore } from "@/lib/stores/architecture/architecture-store";
import { ConfigurationProvider } from "@/lib/stores";
import { getResourceSchema } from "@/lib/schemas/resource-schemas";

import {
	AWSResourceConfiguration,
	DefaultConfiguration,
} from "@/lib/types/aws-resources";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/_components/ui/tooltip";
import { cn } from "@/lib/utils";

type ConfigurationFormComponent = ComponentType<{
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
	"aws-subnet":
		ConfigurationSidebarMap.SubnetConfigurationForm as ConfigurationFormComponent,
	"aws-private-subnet":
		ConfigurationSidebarMap.SubnetConfigurationForm as ConfigurationFormComponent,
	"aws-public-subnet":
		ConfigurationSidebarMap.SubnetConfigurationForm as ConfigurationFormComponent,
	"aws-security-group":
		ConfigurationSidebarMap.SecurityGroupConfigurationForm as ConfigurationFormComponent,
	"aws-internet-gateway":
		ConfigurationSidebarMap.InternetGatewayConfigurationForm as ConfigurationFormComponent,
	"aws-nat-gateway":
		ConfigurationSidebarMap.NATGatewayConfigurationForm as ConfigurationFormComponent,
	"aws-route-table":
		ConfigurationSidebarMap.RouteTableConfigurationForm as ConfigurationFormComponent,
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
		getResourceConfiguration,
		updateResourceConfiguration,
		initializeResourceConfiguration,
	} = useArchitectureStore();

	// Initialize configuration when node is selected
	useEffect(() => {
		if (selectedNode) {
			const data = selectedNode.data as Record<string, unknown>;
			const serviceId = (data?.serviceId as string) || "";
			initializeResourceConfiguration(selectedNode.id, serviceId);
		}
	}, [selectedNode, initializeResourceConfiguration]);

	// Get current configuration from store
	const config = selectedNode
		? getResourceConfiguration(selectedNode.id) || {}
		: {};

	const handleConfigChange = (newConfig: AWSResourceConfiguration) => {
		if (!selectedNode) return; // Guard clause for when no node is selected

		const nodeId = selectedNode.id;

		// Update the architecture store (this will update both the configuration and the JSON data)
		updateResourceConfiguration(nodeId, newConfig);

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
			return name;
		}
		if (selectedNode.type === "awsContainer") {
			const name = (selectedNode.data.name as string) || "AWS Container";
			return name;
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
				<div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
					<div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
						<Layers className="h-8 w-8 text-primary" />
					</div>
					<div className="space-y-6 max-w-sm">
						<div>
							<h3 className="text-lg font-semibold text-foreground mb-2">
								No Node Selected
							</h3>
							<p className="text-sm text-muted-foreground">
								Select a node from the canvas to configure its properties and settings.
							</p>
						</div>
						<div className="space-y-3 text-left bg-muted/30 rounded-lg p-4">
							<div className="flex items-start gap-3">
								<div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
									<MousePointer className="h-3.5 w-3.5 text-primary" />
								</div>
								<div className="text-sm text-muted-foreground">
									<span className="font-medium text-foreground">Click</span> any node on the canvas to configure it
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
									<GripVertical className="h-3.5 w-3.5 text-primary" />
								</div>
								<div className="text-sm text-muted-foreground">
									<span className="font-medium text-foreground">Drag</span> services from the left sidebar to add them
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center shrink-0">
									<kbd className="text-[10px] font-mono font-semibold text-muted-foreground">Y</kbd>
								</div>
								<div className="text-sm text-muted-foreground">
									Press <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs font-mono">Y</kbd> to toggle this panel
								</div>
							</div>
						</div>
					</div>
				</div>
			);
		}

		const data = selectedNode.data as Record<string, unknown>;
		const serviceId = (data?.serviceId as string) || "";

		// Priority: 1) Specific form, 2) Schema-based dynamic form, 3) Default form
		let formElement;
		if (awsServiceConfigurationMap[serviceId]) {
			// Use specific form component if available
			formElement = createElement(awsServiceConfigurationMap[serviceId], {
				config,
				onChange: handleConfigChange,
			});
		} else {
			// Check if we have a schema for this resource type
			const schema = getResourceSchema(serviceId);
			if (schema.resourceType !== 'default') {
				// Use dynamic form based on schema
				formElement = createElement(DynamicConfigurationForm, {
					resourceType: serviceId,
					config,
					onChange: handleConfigChange,
				});
			} else {
				// Fallback to default form
				formElement = createElement(ConfigurationSidebarMap.DefaultConfigurationForm, {
					config: config as DefaultConfiguration,
					onChange: handleConfigChange as (config: DefaultConfiguration) => void,
				});
			}
		}

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
				className={cn(
					"fixed top-14 right-0 bg-background border-l border-border shadow-xl transform transition-transform duration-300 ease-in-out z-40 overflow-hidden flex flex-col",
					isOpen ? "translate-x-0" : "translate-x-full"
				)}
				style={{ width: "380px", height: "calc(100vh - 3.5rem)" }}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-4 py-4 border-b border-border bg-muted/30">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
							{selectedNode && getServiceIcon() ? (
								<div className="relative h-8 w-8">
									<Image
										src={getServiceIcon()!}
										alt={getServiceName()}
										fill
										className="object-contain"
										sizes="32px"
									/>
								</div>
							) : (
								<Layers className="h-5 w-5 text-primary" />
							)}
						</div>
						<div>
							<h2 className="text-base font-semibold text-foreground">
								{selectedNode ? getServiceName() : "Configuration"}
							</h2>
							{selectedNode && (
								<Tooltip>
									<TooltipTrigger asChild>
										<Badge variant="outline" className="rounded-full text-[10px] h-5 px-2 font-mono">
											{getServiceId()}
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
				<div className="flex-1 overflow-y-auto hide-scrollbar">
					{renderConfigurationForm()}
				</div>
			</div>

			{/* Toggle Button - Attached to sidebar edge */}
			<Button
				variant="outline"
				size="icon"
				onClick={onToggle}
				className={cn(
					"fixed z-50 h-12 w-6 rounded-l-lg rounded-r-none border-r-0 shadow-md transition-all duration-300 ease-in-out",
					isOpen ? "right-[380px]" : "right-0"
				)}
				style={{
					top: "calc(50vh + 1.75rem)",
					transform: "translateY(-50%)",
				}}
				aria-label="Toggle Configuration Sidebar"
			>
				<ChevronLeft
					className={cn(
						"h-4 w-4 transition-transform duration-300",
						isOpen && "rotate-180"
					)}
				/>
			</Button>
		</div>
	);
}
