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
import { useConfigurationContext } from "@/lib/stores/configuration-context";
import { useStoreAwareConfig } from "@/lib/stores/use-store-integration";

export interface AWSRegionConfiguration {
	name: string;
	regionCode: string;
	displayName: string;
	description?: string;
	isEnabled: boolean;
	isDefault: boolean;
	tags: string; // comma-separated key=value pairs
}

const awsRegions = [
	{ code: "us-east-1", name: "US East (N. Virginia)" },
	{ code: "us-east-2", name: "US East (Ohio)" },
	{ code: "us-west-1", name: "US West (N. California)" },
	{ code: "us-west-2", name: "US West (Oregon)" },
	{ code: "af-south-1", name: "Africa (Cape Town)" },
	{ code: "ap-east-1", name: "Asia Pacific (Hong Kong)" },
	{ code: "ap-south-1", name: "Asia Pacific (Mumbai)" },
	{ code: "ap-south-2", name: "Asia Pacific (Hyderabad)" },
	{ code: "ap-southeast-1", name: "Asia Pacific (Singapore)" },
	{ code: "ap-southeast-2", name: "Asia Pacific (Sydney)" },
	{ code: "ap-southeast-3", name: "Asia Pacific (Jakarta)" },
	{ code: "ap-southeast-4", name: "Asia Pacific (Melbourne)" },
	{ code: "ap-northeast-1", name: "Asia Pacific (Tokyo)" },
	{ code: "ap-northeast-2", name: "Asia Pacific (Seoul)" },
	{ code: "ap-northeast-3", name: "Asia Pacific (Osaka)" },
	{ code: "ca-central-1", name: "Canada (Central)" },
	{ code: "eu-central-1", name: "Europe (Frankfurt)" },
	{ code: "eu-central-2", name: "Europe (Zurich)" },
	{ code: "eu-north-1", name: "Europe (Stockholm)" },
	{ code: "eu-south-1", name: "Europe (Milan)" },
	{ code: "eu-south-2", name: "Europe (Spain)" },
	{ code: "eu-west-1", name: "Europe (Ireland)" },
	{ code: "eu-west-2", name: "Europe (London)" },
	{ code: "eu-west-3", name: "Europe (Paris)" },
	{ code: "il-central-1", name: "Israel (Tel Aviv)" },
	{ code: "me-central-1", name: "Middle East (UAE)" },
	{ code: "me-south-1", name: "Middle East (Bahrain)" },
	{ code: "sa-east-1", name: "South America (São Paulo)" },
	{ code: "us-gov-east-1", name: "AWS GovCloud (US-East)" },
	{ code: "us-gov-west-1", name: "AWS GovCloud (US-West)" },
	{ code: "cn-north-1", name: "China (Beijing)" },
	{ code: "cn-northwest-1", name: "China (Ningxia)" },
];

interface AWSRegionConfigurationFormProps {
	config: Record<string, unknown>;
	onChange: (config: Record<string, unknown>) => void;
}

const AWSRegionConfigurationForm: React.FC<AWSRegionConfigurationFormProps> = ({
	config,
	onChange,
}) => {
	const { nodeId, serviceId } = useConfigurationContext();
	const updateConfig = useStoreAwareConfig(nodeId, serviceId || 'aws-region', config, onChange);

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="region">AWS Region</Label>
				<Select
					value={(config.regionCode as string) || ""}
					onValueChange={(value) => {
						const selectedRegion = awsRegions.find(r => r.code === value);
						updateConfig("regionCode", value);
						if (selectedRegion) {
							updateConfig("displayName", selectedRegion.name);
							// Auto-generate a name if not set
							if (!config.name) {
								updateConfig("name", selectedRegion.code);
							}
						}
					}}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select AWS region" />
					</SelectTrigger>
					<SelectContent>
						{awsRegions.map((region) => (
							<SelectItem key={region.code} value={region.code}>
								{region.name} ({region.code})
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label htmlFor="region-name">Region Name</Label>
				<Input
					id="region-name"
					placeholder="Enter region name"
					value={(config.name as string) || ""}
					onChange={(e) => updateConfig("name", e.target.value)}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="display-name">Display Name</Label>
				<Input
					id="display-name"
					placeholder="Auto-filled from region selection"
					value={(config.displayName as string) || ""}
					onChange={(e) => updateConfig("displayName", e.target.value)}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					placeholder="Region description"
					value={(config.description as string) || ""}
					onChange={(e) => updateConfig("description", e.target.value)}
				/>
			</div>

			<div className="flex items-center space-x-2">
				<Checkbox
					id="enabled"
					checked={(config.isEnabled as boolean) || true}
					onCheckedChange={(checked) => updateConfig("isEnabled", checked)}
				/>
				<Label htmlFor="enabled">Enable Region</Label>
			</div>

			<div className="flex items-center space-x-2">
				<Checkbox
					id="default-region"
					checked={(config.isDefault as boolean) || false}
					onCheckedChange={(checked) => updateConfig("isDefault", checked)}
				/>
				<Label htmlFor="default-region">Set as Default Region</Label>
			</div>

			<div className="space-y-2">
				<Label htmlFor="tags">Tags (key=value, separated by commas)</Label>
				<Textarea
					id="tags"
					placeholder="Environment=Production, Owner=TeamA"
					value={(config.tags as string) || ""}
					onChange={(e) => updateConfig("tags", e.target.value)}
				/>
			</div>
		</div>
	);
};

export default AWSRegionConfigurationForm;
