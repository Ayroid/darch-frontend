"use client";

import React from "react";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Textarea } from "@/app/_components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/app/_components/ui/select";
import { Button } from "@/app/_components/ui/button";
import { TooltipProvider } from "@/app/_components/ui/tooltip";
import {
	RouteTableConfiguration,
	Route,
	RouteTableAssociation,
} from "@/lib/types/aws-resources";
import { useConfigurationContext } from "@/lib/stores";
import { useAutoConfiguration } from "@/lib/hooks/use-auto-configuration";
import { CollapsibleSection } from "@/app/_components/shared/CollapsibleSection";
import AutoConfigurationTooltip from "@/app/_components/utilities/AutoConfigurationTooltip";
import {
	addTag,
	handleTagChange,
	removeTag,
} from "@/app/_components/utilities/ConfigurationSidebarUtils";
import {
	TbSettings,
	TbSettingsSpark,
	TbRoute2,
	TbPlus,
	TbTrash,
} from "react-icons/tb";

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

	const handleFieldChange = (field: string, value: unknown) => {
		const updatedConfig = {
			...config,
			[field]: value,
		};
		onChange(updatedConfig);
	};

	// Route management functions
	const addRoute = () => {
		const routeId = `route-${Date.now()}`;
		const newRoute: Route = {
			destination_cidr_block: "",
			state: "active",
		};
		const updatedRoutes = { ...(config.routes || {}), [routeId]: newRoute };
		handleFieldChange("routes", updatedRoutes);
	};

	const updateRoute = (routeId: string, updatedRoute: Partial<Route>) => {
		const updatedRoutes = {
			...config.routes,
			[routeId]: { ...config.routes[routeId], ...updatedRoute },
		};
		handleFieldChange("routes", updatedRoutes);
	};

	const removeRoute = (routeId: string) => {
		const updatedRoutes = { ...config.routes };
		delete updatedRoutes[routeId];
		handleFieldChange("routes", updatedRoutes);
	};

	// Association management functions
	const addAssociation = () => {
		const assocId = `assoc-${Date.now()}`;
		const newAssociation: RouteTableAssociation = {
			subnet_id: "",
			main: false,
		};
		const updatedAssociations = { ...(config.associations || {}), [assocId]: newAssociation };
		handleFieldChange("associations", updatedAssociations);
	};

	const updateAssociation = (
		assocId: string,
		updatedAssociation: Partial<RouteTableAssociation>
	) => {
		const updatedAssociations = {
			...config.associations,
			[assocId]: { ...config.associations[assocId], ...updatedAssociation },
		};
		handleFieldChange("associations", updatedAssociations);
	};

	const removeAssociation = (assocId: string) => {
		const updatedAssociations = { ...config.associations };
		delete updatedAssociations[assocId];
		handleFieldChange("associations", updatedAssociations);
	};

	// Tag management functions

	return (
		<TooltipProvider>
			<div className="space-y-4 py-4">
				{/* Auto-configured fields section */}
				{(isFieldDisabled("vpc_id") ||
					isFieldDisabled("awsInternetGatewayId") ||
					isFieldDisabled("awsSubnetId")) && (
					<CollapsibleSection
						title="Auto Configured Fields"
						defaultOpen={true}
						icon={<TbSettingsSpark className="w-6 h-6 text-gray-600" />}
					>
						<div className="space-y-4">
{isFieldDisabled("vpc_id") && (
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
										value={config.vpc_id || ""}
										onChange={(e) =>
											handleFieldChange("vpc_id", e.target.value)
										}
										disabled={isFieldDisabled("vpc_id")}
										/>
										{isFieldDisabled("vpc_id") && (
											<div className="absolute top-1/2 right-2 transform -translate-y-1/2">
												<AutoConfigurationTooltip parentContainer="VPC" />
											</div>
										)}
									</div>
								</div>
							)}

							{isFieldDisabled("internet_gateway_id") && (
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Label htmlFor="igw-id">
											Internet Gateway ID
										</Label>
									</div>
									<div className="relative">
										<Input
											id="igw-id"
											placeholder="igw-12345678"
											value={config.internet_gateway_id || ""}
											onChange={(e) =>
												handleFieldChange("internet_gateway_id", e.target.value)
											}
											disabled={isFieldDisabled("internet_gateway_id")}
										/>
										{isFieldDisabled("internet_gateway_id") && (
											<div className="absolute top-1/2 right-2 transform -translate-y-1/2">
												<AutoConfigurationTooltip parentContainer="Internet Gateway" />
											</div>
										)}
									</div>
								</div>
							)}

							{isFieldDisabled("subnet_id") && (
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Label htmlFor="subnet-id">
											Subnet ID
										</Label>
									</div>
									<div className="relative">
										<Input
											id="subnet-id"
											placeholder="subnet-12345678"
											value={config.subnet_id || ""}
											onChange={(e) =>
												handleFieldChange("subnet_id", e.target.value)
											}
											disabled={isFieldDisabled("subnet_id")}
										/>
										{isFieldDisabled("subnet_id") && (
											<div className="absolute top-1/2 right-2 transform -translate-y-1/2">
												<AutoConfigurationTooltip parentContainer="Subnet" />
											</div>
										)}
									</div>
								</div>
							)}
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
						{!isFieldDisabled("vpc_id") && (
							<div className="space-y-2">
								<Label htmlFor="vpc-id-manual">
									VPC ID <span className="text-red-600">*</span>
								</Label>
								<Input
									id="vpc-id-manual"
									value={config.vpc_id || ""}
									onChange={(e) =>
										handleFieldChange("vpc_id", e.target.value)
									}
									placeholder="vpc-12345678"
								/>
							</div>
						)}

						{!isFieldDisabled("internet_gateway_id") && (
							<div className="space-y-2">
								<Label htmlFor="igw-id-manual">
									Internet Gateway ID
								</Label>
								<Input
									id="igw-id-manual"
									value={config.internet_gateway_id || ""}
									onChange={(e) =>
										handleFieldChange("internet_gateway_id", e.target.value)
										}
										placeholder="igw-12345678"
									/>
							</div>
						)}

						{!isFieldDisabled("subnet_id") && (
							<div className="space-y-2">
								<Label htmlFor="subnet-id-manual">
									Subnet ID
								</Label>
								<Input
									id="subnet-id-manual"
									value={config.subnet_id || ""}
									onChange={(e) =>
										handleFieldChange("subnet_id", e.target.value)
										}
										placeholder="subnet-12345678"
									/>
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={config.description || ""}
								onChange={(e) =>
									handleFieldChange("description", e.target.value)
								}
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

					{Object.entries(config.routes || {}).map(([routeId, route]) => (
						<div key={routeId} className="p-3 border rounded-md space-y-4">
							<div className="flex justify-between items-center">
								<h4 className="font-medium">Route: {routeId}</h4>
								<Button
									type="button"
									variant="ghost"
									onClick={() => removeRoute(routeId)}
									>
										<TbTrash className="w-4 h-4" />
									</Button>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-2">
										<Label>Destination CIDR Block *</Label>
										<Input
										value={route.destination_cidr_block}
										onChange={(e) =>
											updateRoute(routeId, {
												destination_cidr_block: e.target.value,
											})
										}
										placeholder="0.0.0.0/0"
									/>
								</div>

								<div className="space-y-2">
									<Label>State</Label>
									<Select
										value={route.state}
										onValueChange={(value) =>
											updateRoute(routeId, { state: value as Route["state"] })
											}
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
											value={route.gateway_id || ""}
											onChange={(e) =>
												updateRoute(routeId, { gateway_id: e.target.value })
											}
											placeholder="igw-12345678"
										/>
									</div>

									<div className="space-y-2">
										<Label>Instance ID</Label>
										<Input
											value={route.instance_id || ""}
											onChange={(e) =>
												updateRoute(routeId, { instance_id: e.target.value })
											}
											placeholder="i-12345678"
										/>
									</div>

									<div className="col-span-2 space-y-2">
										<Label>Network Interface ID</Label>
										<Input
											value={route.network_interface_id || ""}
											onChange={(e) =>
												updateRoute(routeId, {
													network_interface_id: e.target.value,
												})
											}
											placeholder="eni-12345678"
										/>
									</div>
								</div>
							</div>
						))}

						{Object.keys(config.routes || {}).length === 0 && (
							<div className="text-center py-4 text-gray-500">
								<p>
									No routes configured. Click &quot;Add Route&quot; to create
									your first route.
								</p>
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

						{Object.entries(config.associations || {}).map(([assocId, association]) => (
							<div key={assocId} className="p-3 border rounded-md space-y-4">
								<div className="flex justify-between items-center">
									<h4 className="font-medium">Association: {assocId}</h4>
									<Button
										type="button"
										variant="ghost"
										onClick={() => removeAssociation(assocId)}
									>
										<TbTrash className="w-4 h-4" />
									</Button>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-2">
										<Label>Subnet ID *</Label>
										<Input
											value={association.subnet_id}
											onChange={(e) =>
												updateAssociation(assocId, { subnet_id: e.target.value })
											}
											placeholder="subnet-12345678"
										/>
									</div>

									<div className="flex items-center space-x-2 pt-6">
										<input
											type="checkbox"
											id={`main-${assocId}`}
											checked={association.main}
											onChange={(e) =>
												updateAssociation(assocId, { main: e.target.checked })
											}
											className="w-4 h-4"
										/>
										<Label htmlFor={`main-${assocId}`}>Main Route Table</Label>
									</div>
								</div>
							</div>
						))}

						{Object.keys(config.associations || {}).length === 0 && (
							<div className="text-center py-4 text-gray-500">
								<p>
									No associations configured. Click &quot;Add Association&quot;
									to associate with a subnet.
								</p>
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
								onClick={() =>
									addTag(config, (updatedConfig) =>
										onChange(updatedConfig as RouteTableConfiguration)
									)
								}
							>
								+ Add Tag
							</Button>
						</div>

						{Object.entries(config.tags || {}).map(([key, value]) => (
							<div
								key={key}
								className="grid grid-cols-2 gap-3 p-3 border rounded-md"
							>
								<div className="space-y-2">
									<Label>Key</Label>
									<Input
										value={key}
										onChange={(e) => {
											const oldKey = key;
											const newKey = e.target.value;
											if (newKey !== oldKey) {
												const newTags = { ...config.tags };
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
										onChange={(e) =>
											handleTagChange(
												config,
												key,
												e.target.value,
												(updatedConfig) =>
													onChange(updatedConfig as RouteTableConfiguration)
											)
										}
										placeholder="Tag value"
									/>
								</div>
								<div className="col-span-2 flex justify-end">
									<Button
										type="button"
										variant="ghost"
										onClick={() =>
											removeTag(
												config,
												(updatedConfig) =>
													onChange(updatedConfig as RouteTableConfiguration),
												key
											)
										}
									>
										Remove
									</Button>
								</div>
							</div>
						))}

						{Object.keys(config.tags || {}).length === 0 && (
							<div className="text-center py-4 text-gray-500">
								<p>
									No tags configured. Click &quot;Add Tag&quot; to create your
									first tag.
								</p>
							</div>
						)}
					</div>
				</CollapsibleSection>
			</div>
		</TooltipProvider>
	);
}
