"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VPCConfiguration } from "@/lib/types/aws-resources";
import { useFormValidation } from "@/lib/stores/hooks/use-form-validation";
import { useConfigurationContext } from "@/lib/stores";
import { useAutoConfiguration } from "@/hooks/use-auto-configuration";
import AutoConfigurationTooltip from "@/components/utilities/AutoConfigurationTooltip";
import { CollapsibleSection } from "@/components/shared/CollapsibleSection";

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
		<div className="space-y-6">
			{/* Auto-configured fields section */}
			{isFieldDisabled("awsRegionId") && (
				<CollapsibleSection title="Auto-configured Fields" defaultOpen={false}>
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
				</CollapsibleSection>
			)}

			{/* Manual configuration fields */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					VPC Configuration
				</h3>

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

				{/* AWS Region - only show if not auto-configured */}
				{!isFieldDisabled("awsRegionId") && (
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
				)}

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
		</div>
	);
};

export default VPCConfigurationForm;

// Export the configuration type
export type { VPCConfiguration };
