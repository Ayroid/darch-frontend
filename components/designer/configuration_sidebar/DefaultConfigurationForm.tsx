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
	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="service-name">Service Name</Label>
				<Input
					id="service-name"
					placeholder="Enter service name"
					value={(config.name as string) || ""}
					onChange={(e) => onChange({ ...config, name: e.target.value })}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					placeholder="Enter description"
					value={(config.description as string) || ""}
					onChange={(e) => onChange({ ...config, description: e.target.value })}
				/>
			</div>
		</div>
	);
}

// Re-export the type for backward compatibility
export type { DefaultConfiguration } from "@/lib/types/aws-resources";
