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

export interface VPCConfiguration {
	name: string;
	cidrBlock: string;
	region: string;
	description?: string;
	enableDnsSupport: boolean;
	enableDnsHostnames: boolean;
	tags: string; // comma-separated key=value pairs
}

const awsRegions = [
	"us-east-1", "us-east-2", "us-west-1", "us-west-2",
	"eu-west-1", "eu-west-2", "eu-west-3", "eu-central-1", "eu-north-1",
	"ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-northeast-2", "ap-south-1",
	"ca-central-1", "sa-east-1", "af-south-1", "me-south-1",
];

interface VPCConfigurationFormProps {
	config: Record<string, unknown>;
	onChange: (config: Record<string, unknown>) => void;
}

const VPCConfigurationForm: React.FC<VPCConfigurationFormProps> = ({
	config,
	onChange,
}) => {
	const updateConfig = (key: string, value: unknown) => {
		onChange({ ...config, [key]: value });
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="vpc-name">VPC Name</Label>
				<Input
					id="vpc-name"
					placeholder="Enter VPC name"
					value={(config.name as string) || ""}
					onChange={(e) => updateConfig("name", e.target.value)}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="cidr-block">CIDR Block</Label>
				<Input
					id="cidr-block"
					placeholder="10.0.0.0/16"
					value={(config.cidrBlock as string) || ""}
					onChange={(e) => updateConfig("cidrBlock", e.target.value)}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="region">Region</Label>
				<Select
					value={(config.region as string) || ""}
					onValueChange={(value) => updateConfig("region", value)}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select region" />
					</SelectTrigger>
					<SelectContent>
						{awsRegions.map((region) => (
							<SelectItem key={region} value={region}>
								{region}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					placeholder="VPC description"
					value={(config.description as string) || ""}
					onChange={(e) => updateConfig("description", e.target.value)}
				/>
			</div>

			<div className="flex items-center space-x-2">
				<Checkbox
					id="dns-support"
					checked={(config.enableDnsSupport as boolean) || true}
					onCheckedChange={(checked) => updateConfig("enableDnsSupport", checked)}
				/>
				<Label htmlFor="dns-support">Enable DNS Support</Label>
			</div>

			<div className="flex items-center space-x-2">
				<Checkbox
					id="dns-hostnames"
					checked={(config.enableDnsHostnames as boolean) || true}
					onCheckedChange={(checked) => updateConfig("enableDnsHostnames", checked)}
				/>
				<Label htmlFor="dns-hostnames">Enable DNS Hostnames</Label>
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
}

export default VPCConfigurationForm;
