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

export interface PublicSubnetConfiguration {
	name: string;
	cidrBlock: string;
	vpcId: string;
	availabilityZone: string;
	description?: string;
	mapPublicIpOnLaunch: boolean;
	tags: string; // comma-separated key=value pairs
}

const availabilityZones = [
	"us-east-1a", "us-east-1b", "us-east-1c", "us-east-1d", "us-east-1e", "us-east-1f",
	"us-west-1a", "us-west-1b", "us-west-1c",
	"us-west-2a", "us-west-2b", "us-west-2c", "us-west-2d",
	"eu-west-1a", "eu-west-1b", "eu-west-1c",
	"ap-southeast-1a", "ap-southeast-1b", "ap-southeast-1c",
];

interface PublicSubnetConfigurationFormProps {
	config: Record<string, unknown>;
	onChange: (config: Record<string, unknown>) => void;
}

export default function PublicSubnetConfigurationForm({
	config,
	onChange,
}: PublicSubnetConfigurationFormProps) {
	const updateConfig = (key: string, value: unknown) => {
		onChange({ ...config, [key]: value });
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="subnet-name">Subnet Name</Label>
				<Input
					id="subnet-name"
					placeholder="Enter subnet name"
					value={(config.name as string) || ""}
					onChange={(e) => updateConfig("name", e.target.value)}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="cidr-block">CIDR Block</Label>
				<Input
					id="cidr-block"
					placeholder="10.0.0.0/24"
					value={(config.cidrBlock as string) || ""}
					onChange={(e) => updateConfig("cidrBlock", e.target.value)}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="vpc-id">VPC ID</Label>
				<Input
					id="vpc-id"
					placeholder="vpc-xxxxxxxxx"
					value={(config.vpcId as string) || ""}
					onChange={(e) => updateConfig("vpcId", e.target.value)}
				/>
			</div>

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
						{availabilityZones.map((zone) => (
							<SelectItem key={zone} value={zone}>
								{zone}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					placeholder="Subnet description"
					value={(config.description as string) || ""}
					onChange={(e) => updateConfig("description", e.target.value)}
				/>
			</div>

			<div className="flex items-center space-x-2">
				<Checkbox
					id="map-public-ip"
					checked={(config.mapPublicIpOnLaunch as boolean) || true}
					onCheckedChange={(checked) => updateConfig("mapPublicIpOnLaunch", checked)}
				/>
				<Label htmlFor="map-public-ip">Map Public IP on Launch</Label>
			</div>

			<div className="space-y-2">
				<Label htmlFor="tags">Tags (key=value, separated by commas)</Label>
				<Textarea
					id="tags"
					placeholder="Environment=Production, Type=Public"
					value={(config.tags as string) || ""}
					onChange={(e) => updateConfig("tags", e.target.value)}
				/>
			</div>
		</div>
	);
}
