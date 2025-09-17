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
import { CollapsibleSection } from "@/components/shared/CollapsibleSection";
import { FiGlobe } from "react-icons/fi";
import { TbSettings } from "react-icons/tb";

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
		<div className="space-y-4 py-4">
			{/* Region Configuration */}
			<CollapsibleSection
				title="Region Configuration"
				icon={<FiGlobe className="h-5 w-5 text-gray-600" />}
				defaultOpen={true}
				borderbottom={false}
			>
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="region-name">
							Region Name <span className="text-red-600">*</span>
						</Label>
						<Input
							id="region-name"
							placeholder="Enter Region name"
							value={config.awsRegionId || ""}
							onChange={(e) => handleFieldChange("awsRegionId", e.target.value)}
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
					<div className="relative space-y-2">
						<Label htmlFor="region-name">Name</Label>
						<Input
							id="region-name"
							placeholder="Enter region name"
							value={config.regionName || ""}
							disabled
							onChange={(e) => handleFieldChange("regionName", e.target.value)}
						/>
					</div>
				</div>
			</CollapsibleSection>

			{/* Tags section */}
			<CollapsibleSection
				title="Tags"
				defaultOpen={false}
				icon={<TbSettings className="w-6 h-6 text-gray-600" />}
			>
				<div className="space-y-2">
					<Label htmlFor="tags">Tags</Label>
					<Input
						id="tags"
						placeholder="key1=value1,key2=value2"
						value={config.tags || ""}
						onChange={(e) => handleFieldChange("tags", e.target.value)}
					/>
					<p className="text-sm text-gray-500">
						Enter comma-separated key=value pairs
					</p>
				</div>
			</CollapsibleSection>
		</div>
	);
};

export default AWSRegionConfigurationForm;
