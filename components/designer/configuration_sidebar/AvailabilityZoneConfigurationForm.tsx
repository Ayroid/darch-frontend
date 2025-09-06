"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { AvailabilityZoneConfiguration } from "@/lib/types/aws-resources";
import { AWS_REGIONS_WITH_AZS } from "@/lib/data/aws_regions";
import { useConfigurationContext } from "@/lib/stores";
import { useAutoConfiguration } from "@/hooks/use-auto-configuration";
import AutoConfigurationTooltip from "@/components/utilities/AutoConfigurationTooltip";

interface AvailabilityZoneConfigurationFormProps {
	config: AvailabilityZoneConfiguration;
	onChange: (config: AvailabilityZoneConfiguration) => void;
}

const AvailabilityZoneConfigurationForm: React.FC<
	AvailabilityZoneConfigurationFormProps
> = ({ config, onChange }) => {
	const { nodeId } = useConfigurationContext();
	const { isFieldDisabled } = useAutoConfiguration({
		nodeId: nodeId || "",
		resourceType: "aws-availability-zone",
	});

	const handleFieldChange = (field: string, value: unknown) => {
		const updatedConfig = {
			...config,
			[field]: value,
		};
		onChange(updatedConfig);
	};

	const selectedRegion = config.region;
	const availableAZs =
		AWS_REGIONS_WITH_AZS[selectedRegion as keyof typeof AWS_REGIONS_WITH_AZS] ||
		[];

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="az-name">
					AZ Name
					<span className="text-red-600">*</span>
				</Label>
				<Input
					id="az-name"
					placeholder="Enter AZ name"
					value={config.resourceName || ""}
					onChange={(e) => handleFieldChange("resourceName", e.target.value)}
				/>
			</div>
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<Label htmlFor="region">
						AWS Region <span className="text-red-600">*</span>
					</Label>
				</div>
				<div className="relative">
					<Input
						id="region"
						placeholder="Enter AWS region"
						value={config.region || ""}
						onChange={(e) => handleFieldChange("region", e.target.value)}
						disabled={isFieldDisabled("region")}
					/>
					{isFieldDisabled("region") && (
						<div className="absolute top-1/2 right-2 transform -translate-y-1/2">
							<AutoConfigurationTooltip parentContainer="Region" />
						</div>
					)}
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="availability-zone">
					Availability Zone <span className="text-red-600">*</span>
				</Label>
				<Select
					value={config.availabilityZone || ""}
					onValueChange={(value) =>
						handleFieldChange("availabilityZone", value)
					}
					disabled={!selectedRegion}
				>
					<SelectTrigger className="w-full">
						<SelectValue
							placeholder={
								selectedRegion
									? "Select availability zone"
									: "Select region first"
							}
						/>
					</SelectTrigger>
					<SelectContent>
						{availableAZs.map((az) => (
							<SelectItem key={az} value={az}>
								{az}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* <div className="space-y-2">
					<Label htmlFor="description">Description</Label>
					<Textarea
						id="description"
						placeholder="Availability zone description"
						value={config.description || ""}
						onChange={(e) => updateConfig("description", e.target.value)}
					/>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="enabled"
						checked={config.isEnabled ?? true}
						onCheckedChange={(checked) => updateConfig("isEnabled", !!checked)}
					/>
					<Label htmlFor="enabled">Enable Availability Zone</Label>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="preferred"
						checked={config.isPreferred ?? false}
						onCheckedChange={(checked) => updateConfig("isPreferred", !!checked)}
					/>
					<Label htmlFor="preferred">Set as Preferred Zone</Label>
				</div>

				<div className="space-y-2">
					<Label htmlFor="tags">Tags (key=value, separated by commas)</Label>
					<Textarea
						id="tags"
						placeholder="Environment=Production, Zone=Primary"
						value={config.tags || ""}
						onChange={(e) => updateConfig("tags", e.target.value)}
					/>
				</div> */}
		</div>
	);
};

export default AvailabilityZoneConfigurationForm;

// Export the configuration type
export type { AvailabilityZoneConfiguration };
