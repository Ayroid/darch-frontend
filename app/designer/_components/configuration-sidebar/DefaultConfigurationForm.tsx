"use client";

import React from "react";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Textarea } from "@/app/_components/ui/textarea";
import { DefaultConfiguration } from "@/lib/types/aws-resources";
import { CollapsibleSection } from "@/app/_components/shared/CollapsibleSection";
import { TbSettings } from "react-icons/tb";
import {
	addTag,
	handleTagChange,
	removeTag,
} from "@/app/_components/utilities/ConfigurationSidebarUtils";
import { Button } from "@/app/_components/ui/button";

interface DefaultConfigurationFormProps {
	config: DefaultConfiguration;
	onChange: (config: DefaultConfiguration) => void;
}

export default function DefaultConfigurationForm({
	config,
	onChange,
}: DefaultConfigurationFormProps) {
	const handleFieldChange = (field: string, value: unknown) => {
		const updatedConfig = {
			...config,
			[field]: value,
		};
		onChange(updatedConfig);
	};

	return (
		<div className="space-y-4 py-4">
			{/* Basic Configuration */}
			<CollapsibleSection
				title="Basic Configuration"
				icon={<TbSettings className="h-4 w-4" />}
				defaultOpen={true}
				borderbottom={false}
			>
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="service-name">Service Name</Label>
						<Input
							id="service-name"
							placeholder="Enter service name"
							value={(config.awsResourceId as string) || ""}
							onChange={(e) =>
								handleFieldChange("awsResourceId", e.target.value)
							}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							placeholder="Enter description"
							value={(config.description as string) || ""}
							onChange={(e) => handleFieldChange("description", e.target.value)}
						/>
					</div>
				</div>
			</CollapsibleSection>
			{/* Tags section */}
			<CollapsibleSection
				title="Tags"
				defaultOpen={false}
				icon={<TbSettings className="w-6 h-6 text-gray-600" />}
			>
				<div className="space-y-4">
					<div className="flex justify-end">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() =>
								addTag(config, (updatedConfig) =>
									onChange(updatedConfig as DefaultConfiguration)
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
												onChange(updatedConfig as DefaultConfiguration)
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
												onChange(updatedConfig as DefaultConfiguration),
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
}

// Re-export the type for backward compatibility
export type { DefaultConfiguration } from "@/lib/types/aws-resources";
