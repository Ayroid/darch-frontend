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
import { PrivateSubnetConfiguration } from "@/lib/types/aws-resources";

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
	"eu-west-1": ["eu-west-1a", "eu-west-1b", "eu-west-1c"],
	"eu-west-2": ["eu-west-2a", "eu-west-2b", "eu-west-2c"],
	"eu-west-3": ["eu-west-3a", "eu-west-3b", "eu-west-3c"],
	"eu-central-1": ["eu-central-1a", "eu-central-1b", "eu-central-1c"],
	"ap-southeast-1": ["ap-southeast-1a", "ap-southeast-1b", "ap-southeast-1c"],
	"ap-southeast-2": ["ap-southeast-2a", "ap-southeast-2b", "ap-southeast-2c"],
	"ap-northeast-1": ["ap-northeast-1a", "ap-northeast-1c", "ap-northeast-1d"],
	"ap-northeast-2": ["ap-northeast-2a", "ap-northeast-2b", "ap-northeast-2c"],
	"ap-south-1": ["ap-south-1a", "ap-south-1b", "ap-south-1c"],
	"ca-central-1": ["ca-central-1a", "ca-central-1b", "ca-central-1d"],
	"sa-east-1": ["sa-east-1a", "sa-east-1b", "sa-east-1c"],
};

const COMMON_PRIVATE_CIDRS = [
	"10.0.1.0/24",
	"10.0.2.0/24",
	"10.0.10.0/24",
	"10.0.20.0/24",
	"172.16.1.0/24",
	"172.16.2.0/24",
	"192.168.1.0/24",
	"192.168.2.0/24",
];

interface PrivateSubnetConfigurationFormProps {
	config: PrivateSubnetConfiguration;
	onChange: (config: PrivateSubnetConfiguration) => void;
}

const PrivateSubnetConfigurationForm: React.FC<
	PrivateSubnetConfigurationFormProps
> = ({ config, onChange }) => {
	const updateConfig = (key: string, value: unknown) => {
		onChange({ ...config, [key]: value });
	};

	const vpcId = (config.vpcId as string) || "";
	const region = "us-east-1"; // Default region - could be extracted from context in real scenarios
	const availableAZs =
		AWS_REGIONS_WITH_AZS[region as keyof typeof AWS_REGIONS_WITH_AZS] || [];

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold">Private Subnet Configuration</h3>

			{/* Subnet Name */}
			<div className="space-y-2">
				<Label htmlFor="subnet-name">Subnet Name</Label>
				<Input
					id="subnet-name"
					placeholder="Enter private subnet name"
					value={(config.name as string) || ""}
					onChange={(e) => updateConfig("name", e.target.value)}
				/>
			</div>

			{/* VPC ID */}
			<div className="space-y-2">
				<Label htmlFor="vpc-id">VPC ID</Label>
				<Input
					id="vpc-id"
					placeholder="vpc-xxxxxxxxx"
					value={vpcId}
					onChange={(e) => updateConfig("vpcId", e.target.value)}
				/>
			</div>

			{/* CIDR Block */}
			<div className="space-y-2">
				<Label htmlFor="cidr-block">CIDR Block</Label>
				<Select
					value={(config.cidrBlock as string) || ""}
					onValueChange={(value) => updateConfig("cidrBlock", value)}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select CIDR block" />
					</SelectTrigger>
					<SelectContent>
						{COMMON_PRIVATE_CIDRS.map((cidr) => (
							<SelectItem key={cidr} value={cidr}>
								{cidr}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Input
					placeholder="Or enter custom CIDR (e.g., 10.0.1.0/24)"
					value={(config.cidrBlock as string) || ""}
					onChange={(e) => updateConfig("cidrBlock", e.target.value)}
					className="mt-2"
				/>
			</div>

			{/* Availability Zone */}
			<div className="space-y-2">
				<Label htmlFor="availability-zone">Availability Zone</Label>
				<Select
					value={(config.availabilityZone as string) || ""}
					onValueChange={(value) => updateConfig("availabilityZone", value)}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select availability zone" />
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

			{/* Description */}
			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					placeholder="Private subnet description"
					value={(config.description as string) || ""}
					onChange={(e) => updateConfig("description", e.target.value)}
					rows={3}
				/>
			</div>

			{/* NAT Gateway */}
			<div className="flex items-center space-x-2">
				<Checkbox
					id="nat-gateway"
					checked={(config.enableNatGateway as boolean) ?? false}
					onCheckedChange={(checked) =>
						updateConfig("enableNatGateway", checked)
					}
				/>
				<Label htmlFor="nat-gateway">
					Enable NAT Gateway for internet access
				</Label>
			</div>

			{/* Tags */}
			<div className="space-y-2">
				<Label htmlFor="tags">Tags (key=value, separated by commas)</Label>
				<Textarea
					id="tags"
					placeholder="Environment=Production, Type=Private"
					value={(config.tags as string) || ""}
					onChange={(e) => updateConfig("tags", e.target.value)}
					rows={2}
				/>
			</div>
		</div>
	);
};

export default PrivateSubnetConfigurationForm;

// Re-export the type for backward compatibility
export type { PrivateSubnetConfiguration } from "@/lib/types/aws-resources";
