"use client";

import React from "react";
import { Label } from "@/app/_components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/app/_components/ui/select";
import { Input } from "@/app/_components/ui/input";
import { AWSRegionConfiguration } from "@/lib/types/aws-resources";
import { AWS_REGIONS_WITH_NAMES } from "@/lib/data/aws_regions";
import { CollapsibleSection } from "@/app/_components/shared/CollapsibleSection";
import {
	addTag,
	handleTagChange,
	removeTag,
} from "@/app/_components/utilities/ConfigurationSidebarUtils";
import { Button } from "@/app/_components/ui/button";
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
			>
				<div className="space-y-4">
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
					<Label htmlFor="region-name">Region Name</Label>
					<Input
						id="region-name"
						placeholder="Enter region name"
						value={config.region_name || ""}
						disabled
						onChange={(e) => handleFieldChange("region_name", e.target.value)}
					/>
				</div>
		</div>
	</CollapsibleSection>

	{/* Tags section */}
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
							onClick={() => addTag(config, (updatedConfig) => onChange(updatedConfig as AWSRegionConfiguration))}
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
									onChange={(e) => handleTagChange(config, key, e.target.value, (updatedConfig) => onChange(updatedConfig as AWSRegionConfiguration))}
									placeholder="Tag value"
								/>
							</div>
							<div className="col-span-2 flex justify-end">
								<Button
									type="button"
									variant="ghost"
									onClick={() => removeTag(config, (updatedConfig) => onChange(updatedConfig as AWSRegionConfiguration), key)}
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
	);
};

export default AWSRegionConfigurationForm;
