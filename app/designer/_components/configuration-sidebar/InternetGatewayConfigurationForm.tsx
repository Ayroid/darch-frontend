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
import { InternetGatewayConfiguration } from "@/lib/types/aws-resources";
import { useConfigurationContext } from "@/lib/stores";
import { useAutoConfiguration } from "@/lib/hooks/use-auto-configuration";
import { CollapsibleSection } from "@/app/_components/shared/CollapsibleSection";
import AutoConfigurationTooltip from "@/app/_components/utilities/AutoConfigurationTooltip";
import {
	addTag,
	handleTagChange,
	removeTag,
} from "@/app/_components/utilities/ConfigurationSidebarUtils";
import { TbSettings, TbSettingsSpark } from "react-icons/tb";
import { FiGlobe } from "react-icons/fi";

interface InternetGatewayConfigurationFormProps {
	config: InternetGatewayConfiguration;
	onChange: (config: InternetGatewayConfiguration) => void;
}

const InternetGatewayConfigurationForm: React.FC<InternetGatewayConfigurationFormProps> = ({
	config,
	onChange,
}) => {
	const { nodeId } = useConfigurationContext();
	const { isFieldDisabled } = useAutoConfiguration({
		nodeId: nodeId || "",
		resourceType: "aws-internet-gateway",
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
										value={config.awsVpcId || ""}
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

				{/* Internet Gateway Configuration */}
				<CollapsibleSection
					title="Internet Gateway Configuration"
					defaultOpen={true}
					icon={<FiGlobe className="w-6 h-6 text-gray-600" />}
				>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="igw-name">
								Internet Gateway Name <span className="text-red-600">*</span>
							</Label>
							<Input
								id="igw-name"
								placeholder="Enter Internet Gateway name"
								value={config.awsInternetGatewayId || ""}
								onChange={(e) => handleFieldChange("awsInternetGatewayId", e.target.value)}
							/>
						</div>
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
								onClick={() => addTag(config, (updatedConfig) => onChange(updatedConfig as InternetGatewayConfiguration))}
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
										onChange={(e) => handleTagChange(config, key, e.target.value, (updatedConfig) => onChange(updatedConfig as InternetGatewayConfiguration))}
										placeholder="Tag value"
									/>
								</div>
								<div className="col-span-2 flex justify-end">
									<Button
										type="button"
										variant="ghost"
										onClick={() => removeTag(config, (updatedConfig) => onChange(updatedConfig as InternetGatewayConfiguration), key)}
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
};

export default InternetGatewayConfigurationForm;

// Export the configuration type
export type { InternetGatewayConfiguration };
