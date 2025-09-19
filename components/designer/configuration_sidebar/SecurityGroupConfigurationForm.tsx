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
import { Button } from "@/components/ui/button";
import type {
	SecurityGroupConfiguration,
	SecurityGroupRule,
} from "@/lib/types/aws-resources";
import { useConfigurationContext } from "@/lib/stores";
import { useFormValidation } from "@/lib/stores/hooks/use-form-validation";
import { useAutoConfiguration } from "@/hooks/use-auto-configuration";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CollapsibleSection } from "@/components/shared/CollapsibleSection";
import AutoConfigurationTooltip from "@/components/utilities/AutoConfigurationTooltip";
import {
	addTag,
	handleTagChange,
	removeTag,
} from "@/components/utilities/ConfigurationSidebarUtils";
import { TbSettings, TbSettingsSpark } from "react-icons/tb";
import { LuCircleArrowDown, LuCircleArrowUp } from "react-icons/lu";

interface SecurityGroupConfigurationFormProps {
	config: SecurityGroupConfiguration;
	onChange: (config: SecurityGroupConfiguration) => void;
}

const emptyIngressRule: SecurityGroupRule = {
	protocol: "tcp",
	port: 80,
	source: "0.0.0.0/0",
	description: "",
};

const emptyEgressRule: SecurityGroupRule = {
	protocol: "all",
	port: "all",
	destination: "0.0.0.0/0",
	description: "",
};

const SecurityGroupConfigurationForm: React.FC<
	SecurityGroupConfigurationFormProps
> = ({ config, onChange }) => {
	const { nodeId, serviceId } = useConfigurationContext();
	const { validateField } = useFormValidation(nodeId, serviceId || "", config);
	const { isFieldDisabled } = useAutoConfiguration({
		nodeId: nodeId || "",
		resourceType: "aws-security-group",
	});

	const handleFieldChange = (
		field: keyof SecurityGroupConfiguration,
		value: unknown
	) => {
		const updatedConfig: SecurityGroupConfiguration = {
			...config,
			[field]: value as never,
		};
		onChange(updatedConfig);
		validateField(field as string, value);
	};

	const updateRule = (
		type: "ingressRules" | "egressRules",
		index: number,
		field: keyof SecurityGroupRule,
		value: unknown
	) => {
		const rules = [...(config[type] || [])];
		const current = { ...rules[index] } as SecurityGroupRule;

		let newValue: unknown = value;
		if (field === "port") {
			const str = String(value).trim();
			if (str.toLowerCase() === "all") newValue = "all";
			else {
				const num = parseInt(str, 10);
				newValue = Number.isFinite(num) ? num : "all";
			}
		}

		(current as unknown as Record<string, unknown>)[field as string] = newValue;
		rules[index] = current;
		handleFieldChange(type, rules);
	};

	const addRule = (type: "ingressRules" | "egressRules") => {
		const rules = [...(config[type] || [])];
		rules.push(
			type === "ingressRules" ? { ...emptyIngressRule } : { ...emptyEgressRule }
		);
		handleFieldChange(type, rules);
	};

	const removeRule = (type: "ingressRules" | "egressRules", index: number) => {
		const rules = [...(config[type] || [])];
		rules.splice(index, 1);
		handleFieldChange(type, rules);
	};

	// Tag management functions

	return (
		<TooltipProvider>
			<div className="space-y-4 py-4">
				{/* Auto-configured fields section */}
				{isFieldDisabled("awsVpcId") && (
					<CollapsibleSection
						title="Auto Configured Fields"
						defaultOpen={true}
						icon={<TbSettingsSpark className="w-6 h-6 text-gray-600" />}
					>
						<div className="space-y-4">
							{/* VPC ID - auto-configured */}
							<div className="space-y-2">
								<Label htmlFor="vpc-id">
									VPC ID<span className="text-red-600">*</span>
								</Label>
								<div className="relative">
									<Input
										id="vpc-id"
										value={config.awsVpcId || ""}
										onChange={(e) =>
											handleFieldChange("awsVpcId", e.target.value)
										}
										placeholder="e.g., vpc-0abc123def456"
										disabled={isFieldDisabled("awsVpcId")}
									/>
									{isFieldDisabled("awsVpcId") && (
										<div className="absolute top-1/2 right-2 transform -translate-y-1/2">
											<AutoConfigurationTooltip parentContainer="VPC" />
										</div>
									)}
								</div>
							</div>
						</div>
					</CollapsibleSection>
				)}

				{/* Basic Configuration */}
				<CollapsibleSection
					title="Basic Configuration"
					defaultOpen={true}
					icon={<TbSettings className="w-6 h-6 text-gray-600" />}
				>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="sg-name">
								Security Group Name<span className="text-red-600">*</span>
							</Label>
							<Input
								id="sg-name"
								value={config.awsSecurityGroupId || ""}
								onChange={(e) =>
									handleFieldChange("awsSecurityGroupId", e.target.value)
								}
								placeholder="e.g., WebSecurityGroup"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={config.description || ""}
								onChange={(e) =>
									handleFieldChange("description", e.target.value)
								}
								placeholder="Describe the purpose of this security group"
								className="min-h-[60px]"
							/>
						</div>
					</div>
				</CollapsibleSection>

				{/* Ingress Rules */}
				<CollapsibleSection
					title="Ingress Rules"
					defaultOpen={true}
					icon={<LuCircleArrowDown className="w-6 h-6 text-gray-600" />}
				>
					<div className="space-y-4">
						<div className="flex justify-end">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => addRule("ingressRules")}
							>
								+ Add Ingress Rule
							</Button>
						</div>

						{(config.ingressRules || []).map((rule, idx) => (
							<div
								key={`ingress-${idx}`}
								className="grid grid-cols-2 gap-3 p-3 border rounded-md"
							>
								<div className="space-y-2">
									<Label>Protocol</Label>
									<Select
										value={rule.protocol}
										onValueChange={(value) =>
											updateRule(
												"ingressRules",
												idx,
												"protocol",
												value as SecurityGroupRule["protocol"]
											)
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Protocol" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="tcp">TCP</SelectItem>
											<SelectItem value="udp">UDP</SelectItem>
											<SelectItem value="icmp">ICMP</SelectItem>
											<SelectItem value="all">All</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label>Port</Label>
									<Input
										value={String(rule.port)}
										onChange={(e) =>
											updateRule("ingressRules", idx, "port", e.target.value)
										}
										placeholder="e.g., 80 or all"
									/>
								</div>
								<div className="space-y-2">
									<Label>Source</Label>
									<Input
										value={rule.source || ""}
										onChange={(e) =>
											updateRule("ingressRules", idx, "source", e.target.value)
										}
										placeholder="CIDR or SG ID (e.g., 0.0.0.0/0 or sg-1234)"
									/>
								</div>
								<div className="space-y-2">
									<Label>Description</Label>
									<Input
										value={rule.description || ""}
										onChange={(e) =>
											updateRule(
												"ingressRules",
												idx,
												"description",
												e.target.value
											)
										}
										placeholder="Optional"
									/>
								</div>
								<div className="col-span-2 flex justify-end">
									<Button
										type="button"
										variant="ghost"
										onClick={() => removeRule("ingressRules", idx)}
									>
										Remove
									</Button>
								</div>
							</div>
						))}
					</div>
				</CollapsibleSection>

				{/* Egress Rules */}
				<CollapsibleSection
					title="Egress Rules"
					defaultOpen={true}
					icon={<LuCircleArrowUp className="w-6 h-6 text-gray-600" />}
				>
					<div className="space-y-4">
						<div className="flex justify-end">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => addRule("egressRules")}
							>
								+ Add Egress Rule
							</Button>
						</div>

						{(config.egressRules || []).map((rule, idx) => (
							<div
								key={`egress-${idx}`}
								className="grid grid-cols-2 gap-3 p-3 border rounded-md"
							>
								<div className="space-y-2">
									<Label>Protocol</Label>
									<Select
										value={rule.protocol}
										onValueChange={(value) =>
											updateRule(
												"egressRules",
												idx,
												"protocol",
												value as SecurityGroupRule["protocol"]
											)
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Protocol" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="tcp">TCP</SelectItem>
											<SelectItem value="udp">UDP</SelectItem>
											<SelectItem value="icmp">ICMP</SelectItem>
											<SelectItem value="all">All</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label>Port</Label>
									<Input
										value={String(rule.port)}
										onChange={(e) =>
											updateRule("egressRules", idx, "port", e.target.value)
										}
										placeholder="e.g., 443 or all"
									/>
								</div>
								<div className="space-y-2">
									<Label>Destination</Label>
									<Input
										value={rule.destination || ""}
										onChange={(e) =>
											updateRule(
												"egressRules",
												idx,
												"destination",
												e.target.value
											)
										}
										placeholder="CIDR or SG ID (e.g., 0.0.0.0/0 or sg-1234)"
									/>
								</div>
								<div className="space-y-2">
									<Label>Description</Label>
									<Input
										value={rule.description || ""}
										onChange={(e) =>
											updateRule(
												"egressRules",
												idx,
												"description",
												e.target.value
											)
										}
										placeholder="Optional"
									/>
								</div>
								<div className="col-span-2 flex justify-end">
									<Button
										type="button"
										variant="ghost"
										onClick={() => removeRule("egressRules", idx)}
									>
										Remove
									</Button>
								</div>
							</div>
						))}
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
						{Object.entries(config.tags || {}).map(([key, value]) => (
							<div key={key} className="flex gap-2">
								<Input
									placeholder="Key"
									value={key}
									onChange={(e) => {
										const newKey = e.target.value;
										const updatedTags = { ...(config.tags || {}) };
										delete updatedTags[key];
										if (newKey) {
											updatedTags[newKey] = value;
										}
										handleFieldChange("tags", updatedTags);
									}}
								/>
								<Input
									placeholder="Value"
									value={value}
									onChange={(e) =>
										handleTagChange(
											config,
											key,
											e.target.value,
											(updatedConfig) =>
												onChange(updatedConfig as SecurityGroupConfiguration)
										)
									}
								/>
								<Button
									type="button"
									variant="ghost"
									onClick={() =>
										removeTag(
											config,
											(updatedConfig) =>
												onChange(updatedConfig as SecurityGroupConfiguration),
											key
										)
									}
								>
									Remove
								</Button>
							</div>
						))}
						<Button
							type="button"
							variant="outline"
							onClick={() =>
								addTag(config, (updatedConfig) =>
									onChange(updatedConfig as SecurityGroupConfiguration)
								)
							}
						>
							Add Tag
						</Button>
					</div>
				</CollapsibleSection>
			</div>
		</TooltipProvider>
	);
};

export default SecurityGroupConfigurationForm;

export type { SecurityGroupConfiguration };
