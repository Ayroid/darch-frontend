"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TooltipProvider } from "@/components/ui/tooltip";
import { VPCConfiguration } from "@/lib/types/aws-resources";
import { useFormValidation } from "@/lib/stores/hooks/use-form-validation";
import { useConfigurationContext } from "@/lib/stores";
import { useAutoConfiguration } from "@/hooks/use-auto-configuration";
import AutoConfigurationTooltip from "@/components/utilities/AutoConfigurationTooltip";
import { CollapsibleSection } from "@/components/shared/CollapsibleSection";
import { TbSettingsSpark } from "react-icons/tb";
import { FiGlobe } from "react-icons/fi";

interface VPCConfigurationFormProps {
	config: VPCConfiguration;
	onChange: (config: VPCConfiguration) => void;
}

const VPCConfigurationForm: React.FC<VPCConfigurationFormProps> = ({
	config,
	onChange,
}) => {
	// Get context and validation
	const { nodeId, serviceId } = useConfigurationContext();
	const { validateField } = useFormValidation(nodeId, serviceId || "", config);
	const { isFieldDisabled } = useAutoConfiguration({
		nodeId: nodeId || "",
		resourceType: "aws-vpc",
	});

	const handleFieldChange = (field: string, value: unknown) => {
		const updatedConfig = {
			...config,
			[field]: value,
		};
		onChange(updatedConfig);

		// Validate the field on change
		validateField(field, value);
	};

	return (
		<TooltipProvider>
			<div className="space-y-4 py-4">
				{/* Auto-configured fields section */}
				{isFieldDisabled("awsRegionId") && (
					<CollapsibleSection
						title="Auto Configured Fields"
						defaultOpen={true}
						icon={<TbSettingsSpark className="w-6 h-6 text-gray-600" />}
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

				{/* VPC Configuration */}
				<CollapsibleSection
					title="VPC Configuration"
					defaultOpen={true}
					icon={<FiGlobe className="w-6 h-6 text-gray-600" />}
					borderbottom={false}
				>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="vpc-name">
								VPC Name <span className="text-red-600">*</span>
							</Label>
							<Input
								id="vpc-name"
								placeholder="Enter VPC name"
								value={config.awsVpcId || ""}
								onChange={(e) => handleFieldChange("awsVpcId", e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="cidr-block">
								CIDR Block <span className="text-red-600">*</span>
							</Label>
							<Input
								id="cidr-block"
								placeholder="10.0.0.0/16"
								value={config.cidrBlock || ""}
								onChange={(e) => handleFieldChange("cidrBlock", e.target.value)}
							/>
						</div>
					</div>
				</CollapsibleSection>
			</div>
		</TooltipProvider>
	);
};

export default VPCConfigurationForm;

// Export the configuration type
export type { VPCConfiguration };
