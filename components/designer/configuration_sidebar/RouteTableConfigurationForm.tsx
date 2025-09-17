"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RouteTableConfiguration, Route, RouteTableAssociation } from "@/lib/types/aws-resources";
import { useConfigurationContext } from "@/lib/stores";
import { useAutoConfiguration } from "@/hooks/use-auto-configuration";
import { CollapsibleSection } from "@/components/shared/CollapsibleSection";
import AutoConfigurationTooltip from "@/components/utilities/AutoConfigurationTooltip";
import { TbSettings, TbSettingsSpark, TbRoute2, TbPlus, TbTrash } from "react-icons/tb";

interface RouteTableConfigurationFormProps {
	config: RouteTableConfiguration;
	onChange: (config: RouteTableConfiguration) => void;
}

export default function RouteTableConfigurationForm({
	config,
	onChange,
}: RouteTableConfigurationFormProps) {
	const { nodeId } = useConfigurationContext();
	const { isFieldDisabled } = useAutoConfiguration({
		nodeId: nodeId || "",
		resourceType: "aws-route-table",
	});

	// Initialize default configuration
	const defaultId = `rtb-${nodeId?.slice(-8) || "12345678"}`;
	const defaultConfig: RouteTableConfiguration = {
		awsRouteTableId: defaultId,
		awsVpcId: "",
		routes: [],
		associations: [],
		description: "",
		tags: {},
	};

	const currentConfig = { ...defaultConfig, ...config };

	const handleFieldChange = (field: string, value: unknown) => {
		const updatedConfig = {
			...currentConfig,
			[field]: value,
		};
		onChange(updatedConfig);
	};

	// Route management functions
	const addRoute = () => {
		const newRoute: Route = {
			destinationCidrBlock: "",
			state: "active",
		};
		const updatedRoutes = [...currentConfig.routes, newRoute];
		handleFieldChange("routes", updatedRoutes);
	};

	const updateRoute = (index: number, updatedRoute: Partial<Route>) => {
		const updatedRoutes = currentConfig.routes.map((route, i) =>
			i === index ? { ...route, ...updatedRoute } : route
		);
		handleFieldChange("routes", updatedRoutes);
	};

	const removeRoute = (index: number) => {
		const updatedRoutes = currentConfig.routes.filter((_, i) => i !== index);
		handleFieldChange("routes", updatedRoutes);
	};

	// Association management functions
	const addAssociation = () => {
		const newAssociation: RouteTableAssociation = {
			subnetId: "",
			main: false,
		};
		const updatedAssociations = [...currentConfig.associations, newAssociation];
		handleFieldChange("associations", updatedAssociations);
	};

	const updateAssociation = (index: number, updatedAssociation: Partial<RouteTableAssociation>) => {
		const updatedAssociations = currentConfig.associations.map((assoc, i) =>
			i === index ? { ...assoc, ...updatedAssociation } : assoc
		);
		handleFieldChange("associations", updatedAssociations);
	};

	const removeAssociation = (index: number) => {
		const updatedAssociations = currentConfig.associations.filter((_, i) => i !== index);
		handleFieldChange("associations", updatedAssociations);
	};

	// Tag management functions
	const handleTagChange = (key: string, value: string) => {
		const currentTags = currentConfig.tags || {};
		if (value === "") {
			const newTags = { ...currentTags };
			delete newTags[key];
			handleFieldChange("tags", newTags);
		} else {
			handleFieldChange("tags", { ...currentTags, [key]: value });
		}
	};

	const addTag = () => {
		const currentTags = currentConfig.tags || {};
		const key = `Key${Object.keys(currentTags).length + 1}`;
		handleFieldChange("tags", { ...currentTags, [key]: "" });
	};

	const removeTag = (keyToRemove: string) => {
		const currentTags = currentConfig.tags || {};
		const newTags = { ...currentTags };
		delete newTags[keyToRemove];
		handleFieldChange("tags", newTags);
	};

	return (
		<TooltipProvider>
			<div className="space-y-4 py-4">
				{/* Auto-configured fields section */}
				{isFieldDisabled("awsVpcId") && (
					<CollapsibleSection
						title="Auto Configured Fields"
						defaultOpen={true}
						icon={<TbSettingsSpark className="w-6 h-6 text-gray-600" />}
					>
						<div className="space-y-4">
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Label htmlFor="vpc-id">
										VPC ID <span className="text-red-600">*</span>
									</Label>
								</div>
								<div className="relative">
									<Input
										id="vpc-id"
										placeholder="vpc-12345678"
										value={currentConfig.awsVpcId || ""}
										onChange={(e) =>
											handleFieldChange("awsVpcId", e.target.value)
										}
										disabled={isFieldDisabled("awsVpcId")}
									/>
									{isFieldDisabled("awsVpcId") && (
										<div className="absolute top-1/2 right-2 transform -translate-y-1/2">
											<AutoConfigurationTooltip parentContainer="VPC" />
										</div>
									)}
								</div>
							</div>
						</div>
					</CollapsibleSection>
				)}

				{/* Route Table Configuration */}
				<CollapsibleSection
					title="Route Table Configuration"
					defaultOpen={true}
					icon={<TbRoute2 className="w-6 h-6 text-gray-600" />}
				>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="rtb-name">
								Route Table Name <span className="text-red-600">*</span>
							</Label>
							<Input
								id="rtb-name"
								placeholder="Enter route table name"
								value={currentConfig.awsRouteTableId || ""}
								onChange={(e) => handleFieldChange("awsRouteTableId", e.target.value)}
							/>
						</div>

						{!isFieldDisabled("awsVpcId") && (
							<div className="space-y-2">
								<Label htmlFor="vpc-id-manual">
									VPC ID <span className="text-red-600">*</span>
								</Label>
								<Input
									id="vpc-id-manual"
									value={currentConfig.awsVpcId || ""}
									onChange={(e) => handleFieldChange("awsVpcId", e.target.value)}
									placeholder="vpc-12345678"
								/>
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={currentConfig.description || ""}
								onChange={(e) => handleFieldChange("description", e.target.value)}
								placeholder="Route table description"
								className="min-h-[60px]"
							/>
						</div>
					</div>
				</CollapsibleSection>

				{/* Routes */}
				<CollapsibleSection
					title="Routes"
					defaultOpen={false}
					icon={<TbRoute2 className="w-6 h-6 text-gray-600" />}
				>
					<div className="space-y-4">
						<div className="flex justify-end">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={addRoute}
							>
								<TbPlus className="w-4 h-4 mr-2" />
								Add Route
							</Button>
						</div>

						{currentConfig.routes.map((route, index) => (
							<div key={index} className="p-3 border rounded-md space-y-4">
								<div className="flex justify-between items-center">
									<h4 className="font-medium">Route {index + 1}</h4>
									<Button
										type="button"
										variant="ghost"
										onClick={() => removeRoute(index)}
									>
										<TbTrash className="w-4 h-4" />
									</Button>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-2">
										<Label>Destination CIDR Block *</Label>
										<Input
											value={route.destinationCidrBlock}
											onChange={(e) => updateRoute(index, { destinationCidrBlock: e.target.value })}
											placeholder="0.0.0.0/0"
										/>
									</div>

									<div className="space-y-2">
										<Label>State</Label>
										<Select
											value={route.state}
											onValueChange={(value) => updateRoute(index, { state: value as Route['state'] })}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select state" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="active">Active</SelectItem>
												<SelectItem value="blackhole">Blackhole</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label>Gateway ID</Label>
										<Input
											value={route.gatewayId || ""}
											onChange={(e) => updateRoute(index, { gatewayId: e.target.value })}
											placeholder="igw-12345678"
										/>
									</div>

									<div className="space-y-2">
										<Label>Instance ID</Label>
										<Input
											value={route.instanceId || ""}
											onChange={(e) => updateRoute(index, { instanceId: e.target.value })}
											placeholder="i-12345678"
										/>
									</div>

									<div className="col-span-2 space-y-2">
										<Label>Network Interface ID</Label>
										<Input
											value={route.networkInterfaceId || ""}
											onChange={(e) => updateRoute(index, { networkInterfaceId: e.target.value })}
											placeholder="eni-12345678"
										/>
									</div>
								</div>
							</div>
						))}

						{currentConfig.routes.length === 0 && (
							<div className="text-center py-4 text-gray-500">
								<p>No routes configured. Click &quot;Add Route&quot; to create your first route.</p>
							</div>
						)}
					</div>
				</CollapsibleSection>

				{/* Subnet Associations */}
				<CollapsibleSection
					title="Subnet Associations"
					defaultOpen={false}
					icon={<TbSettings className="w-6 h-6 text-gray-600" />}
				>
					<div className="space-y-4">
						<div className="flex justify-end">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={addAssociation}
							>
								<TbPlus className="w-4 h-4 mr-2" />
								Add Association
							</Button>
						</div>

						{currentConfig.associations.map((association, index) => (
							<div key={index} className="p-3 border rounded-md space-y-4">
								<div className="flex justify-between items-center">
									<h4 className="font-medium">Association {index + 1}</h4>
									<Button
										type="button"
										variant="ghost"
										onClick={() => removeAssociation(index)}
									>
										<TbTrash className="w-4 h-4" />
									</Button>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-2">
										<Label>Subnet ID *</Label>
										<Input
											value={association.subnetId}
											onChange={(e) => updateAssociation(index, { subnetId: e.target.value })}
											placeholder="subnet-12345678"
										/>
									</div>

									<div className="flex items-center space-x-2 pt-6">
										<input
											type="checkbox"
											id={`main-${index}`}
											checked={association.main}
											onChange={(e) => updateAssociation(index, { main: e.target.checked })}
											className="w-4 h-4"
										/>
										<Label htmlFor={`main-${index}`}>Main Route Table</Label>
									</div>
								</div>
							</div>
						))}

						{currentConfig.associations.length === 0 && (
							<div className="text-center py-4 text-gray-500">
								<p>No associations configured. Click &quot;Add Association&quot; to associate with a subnet.</p>
							</div>
						)}
					</div>
				</CollapsibleSection>

				{/* Tags */}
				<CollapsibleSection
					title="Tags"
					defaultOpen={false}
					icon={<TbSettings className="w-6 h-6 text-gray-600" />}
					borderbottom={false}
				>
					<div className="space-y-4">
						<div className="flex justify-end">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={addTag}
							>
								+ Add Tag
							</Button>
						</div>

						{Object.entries(currentConfig.tags || {}).map(([key, value]) => (
							<div key={key} className="grid grid-cols-2 gap-3 p-3 border rounded-md">
								<div className="space-y-2">
									<Label>Key</Label>
									<Input
										value={key}
										onChange={(e) => {
											const oldKey = key;
											const newKey = e.target.value;
											if (newKey !== oldKey) {
												const newTags = { ...currentConfig.tags };
												delete newTags[oldKey];
												if (newKey.trim() !== "") {
													newTags[newKey] = value;
												}
												handleFieldChange("tags", newTags);
											}
										}}
										placeholder="Tag key"
									/>
								</div>
								<div className="space-y-2">
									<Label>Value</Label>
									<Input
										value={value}
										onChange={(e) => handleTagChange(key, e.target.value)}
										placeholder="Tag value"
									/>
								</div>
								<div className="col-span-2 flex justify-end">
									<Button
										type="button"
										variant="ghost"
										onClick={() => removeTag(key)}
									>
										Remove
									</Button>
								</div>
							</div>
						))}

						{Object.keys(currentConfig.tags || {}).length === 0 && (
							<div className="text-center py-4 text-gray-500">
								<p>No tags configured. Click &quot;Add Tag&quot; to create your first tag.</p>
							</div>
						)}
					</div>
				</CollapsibleSection>
			</div>
		</TooltipProvider>
	);
}
