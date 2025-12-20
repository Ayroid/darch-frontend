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
import { NATGatewayConfiguration } from "@/lib/types/aws-resources";
import { useConfigurationContext } from "@/lib/stores";
import { useAutoConfiguration } from "@/lib/hooks/use-auto-configuration";
import { CollapsibleSection } from "@/app/_components/shared/CollapsibleSection";
import AutoConfigurationTooltip from "@/app/_components/utilities/AutoConfigurationTooltip";
import {
	addTag,
	handleTagChange,
	removeTag,
} from "@/app/_components/utilities/ConfigurationSidebarUtils";
import { TbSettings, TbSettingsSpark, TbRoute } from "react-icons/tb";
interface NATGatewayConfigurationFormProps {
	config: NATGatewayConfiguration;
	onChange: (config: NATGatewayConfiguration) => void;
}

export default function NATGatewayConfigurationForm({
	config,
	onChange,
}: NATGatewayConfigurationFormProps) {
	const { nodeId } = useConfigurationContext();
	const { isFieldDisabled } = useAutoConfiguration({
		nodeId: nodeId || "",
		resourceType: "aws-nat-gateway",
	});

	const handleFieldChange = (field: string, value: unknown) => {
		const updatedConfig = {
			...config,
			[field]: value,
		};
		onChange(updatedConfig);
	};



	return (
		<TooltipProvider>
			<div className="space-y-4 py-4">
				{/* Auto-configured fields section */}
			{isFieldDisabled("subnet_id") && (
					<CollapsibleSection
						title="Auto Configured Fields"
						defaultOpen={true}
						icon={<TbSettingsSpark className="w-6 h-6 text-gray-600" />}
					>
						<div className="space-y-4">
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Label htmlFor="subnet-id">
										Subnet ID <span className="text-red-600">*</span>
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
						</div>
					</CollapsibleSection>
				)}

				{/* NAT Gateway Configuration */}
				<CollapsibleSection
					title="NAT Gateway Configuration"
					defaultOpen={true}
					icon={<TbRoute className="w-6 h-6 text-gray-600" />}
				>
					<div className="space-y-4">
						<div className="space-y-2">
						<Label htmlFor="connectivity-type">Connectivity Type</Label>
						<Select
							value={config.connectivity_type || "public"}
						onValueChange={(value) => handleFieldChange("connectivity_type", value)}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select connectivity type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="public">Public</SelectItem>
								<SelectItem value="private">Private</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{config.connectivity_type === "public" && (
							<div className="space-y-2">
								<Label htmlFor="allocation-id">Elastic IP Allocation ID</Label>
								<Input
									id="allocation-id"
									value={config.allocation_id || ""}
									onChange={(e) => handleFieldChange("allocation_id", e.target.value)}
									placeholder="eipalloc-12345678"
								/>
							</div>
						)}

					{config.connectivity_type === "private" && (
							<div className="space-y-2">
								<Label htmlFor="private-ip">Private IP Address</Label>
								<Input
									id="private-ip"
									value={config.private_ip || ""}
									onChange={(e) => handleFieldChange("private_ip", e.target.value)}
									placeholder="10.0.1.5"
								/>
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
								onClick={() => addTag(config, (updatedConfig) => onChange(updatedConfig as NATGatewayConfiguration))}
							>
								+ Add Tag
							</Button>
						</div>

						{Object.entries(config.tags || {}).map(([key, value]) => (
							<div key={key} className="grid grid-cols-2 gap-3 p-3 border rounded-md">
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
												onChange({ ...config, tags: newTags });
											}
										}}
										placeholder="Tag key"
									/>
								</div>
								<div className="space-y-2">
									<Label>Value</Label>
									<Input
										value={value}
										onChange={(e) => handleTagChange(config, key, e.target.value, (updatedConfig) => onChange(updatedConfig as NATGatewayConfiguration))}
										placeholder="Tag value"
									/>
								</div>
								<div className="col-span-2 flex justify-end">
									<Button
										type="button"
										variant="ghost"
										onClick={() => removeTag(config, (updatedConfig) => onChange(updatedConfig as NATGatewayConfiguration), key)}
									>
										Remove
									</Button>
								</div>
							</div>
						))}

						{Object.keys(config.tags || {}).length === 0 && (
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
