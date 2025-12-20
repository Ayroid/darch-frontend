"use client";

import React from "react";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/app/_components/ui/select";
import { Checkbox } from "@/app/_components/ui/checkbox";
import { SubnetConfiguration } from "@/lib/types/aws-resources";
import { useConfigurationContext } from "@/lib/stores";
import { useAutoConfiguration } from "@/lib/hooks/use-auto-configuration";
import AutoConfigurationTooltip from "@/app/_components/utilities/AutoConfigurationTooltip";
import { CollapsibleSection } from "@/app/_components/shared/CollapsibleSection";
import {
	addTag,
	handleTagChange,
	removeTag,
} from "@/app/_components/utilities/ConfigurationSidebarUtils";
import { Button } from "@/app/_components/ui/button";
import { TbSettingsSpark, TbSettings, TbNetwork } from "react-icons/tb";
import { FiGlobe } from "react-icons/fi";

interface SubnetConfigurationFormProps {
	config: SubnetConfiguration;
	onChange: (config: SubnetConfiguration) => void;
}

const SubnetConfigurationForm: React.FC<SubnetConfigurationFormProps> = ({
	config,
	onChange,
}) => {
	const { nodeId } = useConfigurationContext();

	const { isFieldDisabled } = useAutoConfiguration({
		nodeId: nodeId || "",
		resourceType: "aws-subnet",
	});

	const handleFieldChange = (field: string, value: unknown) => {
		const updatedConfig = {
			...config,
			[field]: value,
		};
		onChange(updatedConfig);
	};

	const isPublic = config.subnet_type === "public";
	const isPrivate = config.subnet_type === "private";

	return (
		<div className="space-y-4 py-4">
			{/* Subnet Type Selector */}
			<CollapsibleSection
				title="Subnet Type"
				icon={<TbNetwork className="w-6 h-6 text-gray-600" />}
				defaultOpen={true}
			>
				<div className="space-y-2">
					<Label htmlFor="subnet-type">
						Subnet Type <span className="text-red-600">*</span>
					</Label>
					<Select
						value={config.subnet_type || "public"}
						onValueChange={(value: "public" | "private") =>
							handleFieldChange("subnet_type", value)
						}
					>
						<SelectTrigger id="subnet-type">
							<SelectValue placeholder="Select subnet type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="public">Public Subnet</SelectItem>
							<SelectItem value="private">Private Subnet</SelectItem>
						</SelectContent>
					</Select>
					<p className="text-sm text-gray-500">
						{isPublic
							? "Public subnets have routes to an Internet Gateway for internet access"
							: "Private subnets don't have direct routes to the Internet Gateway"}
					</p>
				</div>
			</CollapsibleSection>

			{/* Auto Configured Fields */}
			{(isFieldDisabled("vpc_id") ||
				isFieldDisabled("region") ||
				isFieldDisabled("availability_zone")) && (
				<CollapsibleSection
					title="Auto Configured Fields"
					icon={<TbSettingsSpark className="w-6 h-6 text-gray-600" />}
					defaultOpen={true}
				>
					<div className="space-y-4">
						{/* VPC ID - auto-configured */}
						{isFieldDisabled("vpc_id") && (
							<div className="space-y-2">
								<Label htmlFor="vpc-id">
									VPC ID <span className="text-red-600">*</span>
								</Label>
								<div className="relative">
									<Input
										id="vpc-id"
										placeholder="e.g., vpc-0abc123def456"
										value={config.vpc_id || ""}
										onChange={(e) =>
											handleFieldChange("vpc_id", e.target.value)
										}
										disabled={isFieldDisabled("vpc_id")}
									/>
									{isFieldDisabled("vpc_id") && (
										<div className="absolute top-1/2 right-2 transform -translate-y-1/2">
											<AutoConfigurationTooltip parentContainer="VPC" />
										</div>
									)}
								</div>
							</div>
						)}

						{/* Region - auto-configured */}
						{isFieldDisabled("region") && (
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
										value={config.region || ""}
										onChange={(e) =>
											handleFieldChange("region", e.target.value)
										}
										disabled={isFieldDisabled("region")}
									/>
									{isFieldDisabled("region") && (
										<div className="absolute top-1/2 right-2 transform -translate-y-1/2">
											<AutoConfigurationTooltip parentContainer="Region" />
										</div>
									)}
								</div>
							</div>
						)}

						{/* Availability Zone - auto-configured */}
						{isFieldDisabled("availability_zone") && (
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Label htmlFor="availability-zone">
										AWS Availability Zone{" "}
										<span className="text-red-600">*</span>
									</Label>
								</div>
								<div className="relative">
									<Input
										id="availability-zone"
										placeholder="Enter AWS availability zone"
										value={config.availability_zone || ""}
										onChange={(e) =>
											handleFieldChange("availability_zone", e.target.value)
										}
										disabled={isFieldDisabled("availability_zone")}
									/>
									{isFieldDisabled("availability_zone") && (
										<div className="absolute top-1/2 right-2 transform -translate-y-1/2">
											<AutoConfigurationTooltip parentContainer="Availability Zone" />
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				</CollapsibleSection>
			)}

			{/* Subnet Configuration */}
			<CollapsibleSection
				title="Subnet Configuration"
				icon={<FiGlobe className="w-6 h-6 text-gray-600" />}
				defaultOpen={true}
			>
				<div className="space-y-4">
					{/* Description */}
					<div className="space-y-2">
						<Label htmlFor="subnet-description">Subnet Description</Label>
						<Input
							id="subnet-description"
							placeholder={`Enter ${config.subnet_type || 'subnet'} description`}
							value={config.description || ""}
							onChange={(e) => handleFieldChange("description", e.target.value)}
						/>
					</div>

					{/* CIDR Block */}
					<div className="space-y-2">
						<Label htmlFor="cidr-block">
							CIDR Block <span className="text-red-600">*</span>
						</Label>
						<Input
							id="cidr-block"
							placeholder="10.0.0.0/24"
							value={config.cidr_block || ""}
							onChange={(e) => handleFieldChange("cidr_block", e.target.value)}
						/>
					</div>

					{/* Map Public IP on Launch - Only for public subnets */}
					{isPublic && (
						<div className="flex items-center space-x-2">
							<Checkbox
								id="map-public-ip"
								checked={config.map_public_ip_on_launch || false}
								onCheckedChange={(checked) =>
									handleFieldChange("map_public_ip_on_launch", checked)
								}
							/>
							<Label
								htmlFor="map-public-ip"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
							>
								Map Public IP on Launch
							</Label>
						</div>
					)}

					{/* IPv6 CIDR Block */}
					<div className="space-y-2">
						<Label htmlFor="ipv6-cidr-block">IPv6 CIDR Block</Label>
						<Input
							id="ipv6-cidr-block"
							placeholder="2001:db8::/64"
							value={config.ipv6_cidr_block || ""}
							onChange={(e) =>
								handleFieldChange("ipv6_cidr_block", e.target.value)
							}
						/>
					</div>

					{/* Assign IPv6 Address on Creation */}
					<div className="flex items-center space-x-2">
						<Checkbox
							id="assign-ipv6"
							checked={config.assign_ipv6_address_on_creation || false}
							onCheckedChange={(checked) =>
								handleFieldChange("assign_ipv6_address_on_creation", checked)
							}
						/>
						<Label
							htmlFor="assign-ipv6"
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
						>
							Assign IPv6 Address on Creation
						</Label>
					</div>

					{/* IPv6 Native */}
					<div className="flex items-center space-x-2">
						<Checkbox
							id="ipv6-native"
							checked={config.ipv6_native || false}
							onCheckedChange={(checked) =>
								handleFieldChange("ipv6_native", checked)
							}
						/>
						<Label
							htmlFor="ipv6-native"
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
						>
							IPv6 Native
						</Label>
					</div>

					{/* Enable DNS64 */}
					<div className="flex items-center space-x-2">
						<Checkbox
							id="enable-dns64"
							checked={config.enable_dns64 || false}
							onCheckedChange={(checked) =>
								handleFieldChange("enable_dns64", checked)
							}
						/>
						<Label
							htmlFor="enable-dns64"
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
						>
							Enable DNS64
						</Label>
					</div>

					{/* Private DNS Hostname Type */}
					<div className="space-y-2">
						<Label htmlFor="dns-hostname-type">
							Private DNS Hostname Type on Launch
						</Label>
						<Select
							value={config.private_dns_hostname_type_on_launch || "ip-name"}
							onValueChange={(value: "ip-name" | "resource-name") =>
								handleFieldChange("private_dns_hostname_type_on_launch", value)
							}
						>
							<SelectTrigger id="dns-hostname-type">
								<SelectValue placeholder="Select DNS hostname type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ip-name">IP Name</SelectItem>
								<SelectItem value="resource-name">Resource Name</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Enable Resource Name DNS A Record */}
					<div className="flex items-center space-x-2">
						<Checkbox
							id="enable-dns-a-record"
							checked={
								config.enable_resource_name_dns_a_record_on_launch || false
							}
							onCheckedChange={(checked) =>
								handleFieldChange(
									"enable_resource_name_dns_a_record_on_launch",
									checked
								)
							}
						/>
						<Label
							htmlFor="enable-dns-a-record"
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
						>
							Enable Resource Name DNS A Record on Launch
						</Label>
					</div>

					{/* Enable Resource Name DNS AAAA Record */}
					<div className="flex items-center space-x-2">
						<Checkbox
							id="enable-dns-aaaa-record"
							checked={
								config.enable_resource_name_dns_aaaa_record_on_launch || false
							}
							onCheckedChange={(checked) =>
								handleFieldChange(
									"enable_resource_name_dns_aaaa_record_on_launch",
									checked
								)
							}
						/>
						<Label
							htmlFor="enable-dns-aaaa-record"
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
						>
							Enable Resource Name DNS AAAA Record on Launch
						</Label>
					</div>

					{/* Customer Owned IPv4 Pool */}
					<div className="space-y-2">
						<Label htmlFor="customer-ipv4-pool">
							Customer Owned IPv4 Pool
						</Label>
						<Input
							id="customer-ipv4-pool"
							placeholder="Enter customer owned IPv4 pool"
							value={config.customer_owned_ipv4_pool || ""}
							onChange={(e) =>
								handleFieldChange("customer_owned_ipv4_pool", e.target.value)
							}
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
							onClick={() =>
								addTag(config, (updatedConfig) =>
									onChange(updatedConfig as SubnetConfiguration)
								)
							}
						>
							+ Add Tag
						</Button>
					</div>

					{Object.entries(config.tags || {}).map(([key, value]) => (
						<div
							key={key}
							className="grid grid-cols-2 gap-3 p-3 border rounded-md"
						>
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
									onChange={(e) =>
										handleTagChange(
											config,
											key,
											e.target.value,
											(updatedConfig) =>
												onChange(updatedConfig as SubnetConfiguration)
										)
									}
									placeholder="Tag value"
								/>
							</div>
							<div className="col-span-2 flex justify-end">
								<Button
									type="button"
									variant="ghost"
									onClick={() =>
										removeTag(
											config,
											(updatedConfig) =>
												onChange(updatedConfig as SubnetConfiguration),
											key
										)
									}
								>
									Remove
								</Button>
							</div>
						</div>
					))}

					{Object.keys(config.tags || {}).length === 0 && (
						<div className="text-center py-4 text-gray-500">
							<p>
								No tags configured. Click &quot;Add Tag&quot; to create your
								first tag.
							</p>
						</div>
					)}
				</div>
			</CollapsibleSection>
		</div>
	);
};

export default SubnetConfigurationForm;
