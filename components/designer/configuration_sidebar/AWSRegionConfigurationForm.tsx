"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AWSRegionConfiguration } from "@/lib/types/aws-resources";
import { AWS_REGIONS_WITH_NAMES } from "@/lib/data/aws_regions";

interface AWSRegionConfigurationFormProps {
	config: AWSRegionConfiguration;
	onChange: (config: AWSRegionConfiguration) => void;
}

const AWSRegionConfigurationForm: React.FC<AWSRegionConfigurationFormProps> = ({
	config,
	onChange,
}) => {
	const handleFieldChange = (field: string, value: unknown) => {
		const updatedConfig = {
			...config,
			[field]: value,
		};
		onChange(updatedConfig);
	};

	const handleRegionChange = (region: string) => {
		const selectedRegion = AWS_REGIONS_WITH_NAMES.find(
			(availableRegion) => availableRegion.region === region
		);
		if (selectedRegion) {
			const updatedConfig = {
				...config,
				region: region,
				regionName: selectedRegion.regionName,
			};
			onChange(updatedConfig);
		}
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="region-name">
					Region Name <span className="text-red-600">*</span>
				</Label>
				<Input
					id="region-name"
					placeholder="Enter Region name"
					value={config.resourceName || ""}
					onChange={(e) => handleFieldChange("resourceName", e.target.value)}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="region">
					AWS Region<span className="text-red-600">*</span>
				</Label>
				<Select value={config.region || ""} onValueChange={handleRegionChange}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select AWS region" />
					</SelectTrigger>
					<SelectContent>
						{AWS_REGIONS_WITH_NAMES.map((availableRegion) => (
							<SelectItem
								key={availableRegion.region}
								value={availableRegion.region}
							>
								{availableRegion.region}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			{/* Region Name */}
			<div className="space-y-2">
				<Label htmlFor="region-name">Name</Label>
				<Input
					id="region-name"
					placeholder="Enter region name"
					value={config.regionName || ""}
					disabled
					onChange={(e) => handleFieldChange("regionName", e.target.value)}
				/>
			</div>
			{/* Region Description */}
			{/* <div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					placeholder="Region description"
					value={config.description || ""}
					onChange={(e) => handleFieldChange("description", e.target.value)}
				/>
			</div> */}
			{/* Enable Region */}
			{/* <div className="flex items-center space-x-2">
				<Checkbox
					id="enabled"
					checked={config.isEnabled ?? true}
					onCheckedChange={(checked) => handleFieldChange("isEnabled", checked)}
				/>
				<Label htmlFor="enabled">Enable Region</Label>
			</div> */}
			{/* Default Region */}
			{/* <div className="flex items-center space-x-2">
				<Checkbox
					id="default-region"
					checked={config.isDefault ?? false}
					onCheckedChange={(checked) => handleFieldChange("isDefault", checked)}
				/>
				<Label htmlFor="default-region">Set as Default Region</Label>
			</div> */}

			{/* Tags */}
			{/* <div className="space-y-2">
				<Label htmlFor="tags">Tags (key=value, separated by commas)</Label>
				<Textarea
					id="tags"
					placeholder="Environment=Production, Owner=TeamA"
					value={config.tags || ""}
					onChange={(e) => handleFieldChange("tags", e.target.value)}
				/>
			</div> */}
		</div>
	);
};

export default AWSRegionConfigurationForm;
