"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface DefaultConfiguration {
	name?: string;
	description?: string;
}

interface DefaultConfigurationFormProps {
	config: Record<string, unknown>;
	onChange: (config: Record<string, unknown>) => void;
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
					onChange={(e) =>
						onChange({ ...config, name: e.target.value })
					}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					placeholder="Enter description"
					value={(config.description as string) || ""}
					onChange={(e) =>
						onChange({ ...config, description: e.target.value })
					}
				/>
			</div>
		</div>
	);
}
