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
import { Checkbox } from "@/components/ui/checkbox";
import { AvailabilityZoneConfiguration } from "@/lib/types/aws-resources";

const AWS_REGIONS_WITH_AZS = {
	"us-east-1": [
		"us-east-1a",
		"us-east-1b",
		"us-east-1c",
		"us-east-1d",
		"us-east-1e",
		"us-east-1f",
	],
	"us-east-2": ["us-east-2a", "us-east-2b", "us-east-2c"],
	"us-west-1": ["us-west-1a", "us-west-1b", "us-west-1c"],
	"us-west-2": ["us-west-2a", "us-west-2b", "us-west-2c", "us-west-2d"],
	"af-south-1": ["af-south-1a", "af-south-1b", "af-south-1c"],
	"ap-east-1": ["ap-east-1a", "ap-east-1b", "ap-east-1c"],
	"ap-south-1": ["ap-south-1a", "ap-south-1b", "ap-south-1c"],
	"ap-south-2": ["ap-south-2a", "ap-south-2b", "ap-south-2c"],
	"ap-southeast-1": ["ap-southeast-1a", "ap-southeast-1b", "ap-southeast-1c"],
	"ap-southeast-2": ["ap-southeast-2a", "ap-southeast-2b", "ap-southeast-2c"],
	"ap-southeast-3": ["ap-southeast-3a", "ap-southeast-3b", "ap-southeast-3c"],
	"ap-southeast-4": ["ap-southeast-4a", "ap-southeast-4b", "ap-southeast-4c"],
	"ap-northeast-1": ["ap-northeast-1a", "ap-northeast-1c", "ap-northeast-1d"],
	"ap-northeast-2": ["ap-northeast-2a", "ap-northeast-2b", "ap-northeast-2c"],
	"ap-northeast-3": ["ap-northeast-3a", "ap-northeast-3b", "ap-northeast-3c"],
	"ca-central-1": ["ca-central-1a", "ca-central-1b", "ca-central-1d"],
	"ca-west-1": ["ca-west-1a", "ca-west-1b", "ca-west-1c"],
	"eu-central-1": ["eu-central-1a", "eu-central-1b", "eu-central-1c"],
	"eu-central-2": ["eu-central-2a", "eu-central-2b", "eu-central-2c"],
	"eu-north-1": ["eu-north-1a", "eu-north-1b", "eu-north-1c"],
	"eu-south-1": ["eu-south-1a", "eu-south-1b", "eu-south-1c"],
	"eu-south-2": ["eu-south-2a", "eu-south-2b", "eu-south-2c"],
	"eu-west-1": ["eu-west-1a", "eu-west-1b", "eu-west-1c"],
	"eu-west-2": ["eu-west-2a", "eu-west-2b", "eu-west-2c"],
	"eu-west-3": ["eu-west-3a", "eu-west-3b", "eu-west-3c"],
	"il-central-1": ["il-central-1a", "il-central-1b", "il-central-1c"],
	"me-central-1": ["me-central-1a", "me-central-1b", "me-central-1c"],
	"me-south-1": ["me-south-1a", "me-south-1b", "me-south-1c"],
	"sa-east-1": ["sa-east-1a", "sa-east-1b", "sa-east-1c"],
	"us-gov-east-1": ["us-gov-east-1a", "us-gov-east-1b", "us-gov-east-1c"],
	"us-gov-west-1": ["us-gov-west-1a", "us-gov-west-1b", "us-gov-west-1c"],
} as const;
interface AvailabilityZoneConfigurationFormProps {
	config: AvailabilityZoneConfiguration;
	onChange: (config: AvailabilityZoneConfiguration) => void;
}

const AvailabilityZoneConfigurationForm: React.FC<
	AvailabilityZoneConfigurationFormProps
> = ({ config, onChange }) => {
	const updateConfig = (
		key: keyof AvailabilityZoneConfiguration,
		value: AvailabilityZoneConfiguration[keyof AvailabilityZoneConfiguration]
	) => {
		onChange({ ...config, [key]: value });
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
					value={config.name || ""}
					onChange={(e) => updateConfig("name", e.target.value)}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="region">Region</Label>
				<Select
					value={selectedRegion}
					onValueChange={(value) => {
						updateConfig("region", value);
						// Clear AZ selection when region changes
						updateConfig("availabilityZone", "");
					}}
				>
					<SelectTrigger>
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
					onValueChange={(value) => updateConfig("availabilityZone", value)}
					disabled={!selectedRegion}
				>
					<SelectTrigger>
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

			<div className="space-y-2">
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
			</div>
		</div>
	);
};

export default AvailabilityZoneConfigurationForm;

// Export the configuration type
export type { AvailabilityZoneConfiguration };
