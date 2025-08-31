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
// import { Textarea } from "@/components/ui/textarea";
// import { Checkbox } from "@/components/ui/checkbox";
import { AvailabilityZoneConfiguration } from "@/lib/types/aws-resources";
import { AWS_REGIONS_WITH_AZS } from "@/lib/data/aws_data";

interface AvailabilityZoneConfigurationFormProps {
	config: AvailabilityZoneConfiguration;
	onChange: (config: AvailabilityZoneConfiguration) => void;
}

const AvailabilityZoneConfigurationForm: React.FC<
	AvailabilityZoneConfigurationFormProps
> = ({ config, onChange }) => {
	const handleFieldChange = (field: string, value: unknown) => {
		const updatedConfig = {
			...config,
			[field]: value,
		};
		onChange(updatedConfig);
	};

	const handleRegionChange = (region: string) => {
		const updatedConfig = {
			...config,
			region,
			availabilityZone: "",
		};
		onChange(updatedConfig);
	};

	const selectedRegion = config.region || "";
	const availableAZs =
		AWS_REGIONS_WITH_AZS[selectedRegion as keyof typeof AWS_REGIONS_WITH_AZS] ||
		[];

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="az-name">Availability Zone Name</Label>
				<Input
					id="az-name"
					placeholder="Enter AZ name"
					value={config.serviceName || ""}
					onChange={(e) => handleFieldChange("serviceName", e.target.value)}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="region">Region</Label>
				<Select value={config.region} onValueChange={handleRegionChange}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select region" />
					</SelectTrigger>
					<SelectContent>
						{Object.keys(AWS_REGIONS_WITH_AZS).map((region) => (
							<SelectItem key={region} value={region}>
								{region}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label htmlFor="availability-zone">Availability Zone</Label>
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
