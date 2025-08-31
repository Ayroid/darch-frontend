"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { DefaultConfiguration } from "@/lib/types/aws-resources";

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
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="service-name">Service Name</Label>
				<Input
					id="service-name"
					placeholder="Enter service name"
					value={(config.serviceName as string) || ""}
					onChange={(e) => handleFieldChange("serviceName", e.target.value)}
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
	);
}

// Re-export the type for backward compatibility
export type { DefaultConfiguration } from "@/lib/types/aws-resources";
