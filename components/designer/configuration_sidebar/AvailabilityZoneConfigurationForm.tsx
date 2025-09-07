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
import { CollapsibleSection } from "@/components/shared/CollapsibleSection";
import { TbSettingsSpark } from "react-icons/tb";
import { FiMapPin } from "react-icons/fi";

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

	const selectedRegion = config.awsRegionId;
	const availableAZs =
		AWS_REGIONS_WITH_AZS[selectedRegion as keyof typeof AWS_REGIONS_WITH_AZS] ||
		[];

	return (
		<div className="space-y-4 py-4">
			{/* Auto Configured Fields */}
			{isFieldDisabled("awsRegionId") && (
				<CollapsibleSection
					title="Auto Configured Fields"
					icon={<TbSettingsSpark className="w-6 h-6 text-gray-600" />}
					defaultOpen={true}
				>
					<div className="space-y-4">
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
									value={config.awsRegionId || ""}
									onChange={(e) =>
										handleFieldChange("awsRegionId", e.target.value)
									}
									disabled={isFieldDisabled("awsRegionId")}
								/>
								{isFieldDisabled("awsRegionId") && (
									<div className="absolute top-1/2 right-2 transform -translate-y-1/2">
										<AutoConfigurationTooltip parentContainer="Region" />
									</div>
								)}
							</div>
						</div>
					</div>
				</CollapsibleSection>
			)}

			{/* Availability Zone Configuration */}
			<CollapsibleSection
				title="Availability Zone Configuration"
				icon={<FiMapPin className="w-6 h-6 text-gray-600" />}
				defaultOpen={true}
				borderbottom={false}
			>
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="az-name">
							AZ Name
							<span className="text-red-600">*</span>
						</Label>
						<Input
							id="az-name"
							placeholder="Enter AZ name"
							value={config.awsAvailabilityZoneId || ""}
							onChange={(e) =>
								handleFieldChange("awsAvailabilityZoneId", e.target.value)
							}
						/>
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
				</div>
			</CollapsibleSection>
		</div>
	);
};

export default AvailabilityZoneConfigurationForm;

// Export the configuration type
export type { AvailabilityZoneConfiguration };
