"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
	title: string;
	children: React.ReactNode;
	defaultOpen?: boolean;
	className?: string;
}

export function CollapsibleSection({
	title,
	children,
	defaultOpen = false,
	className,
}: CollapsibleSectionProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div className={cn("space-y-2", className)}>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center justify-between w-full text-left py-2 border-b"
			>
				<div className="flex items-center gap-2">
					<h3 className="text-sm font-semibold text-gray-700">{title}</h3>
				</div>
				{isOpen ? (
					<ChevronDown className="w-4 h-4 text-gray-500" />
				) : (
					<ChevronRight className="w-4 h-4 text-gray-500" />
				)}
			</button>
			{isOpen && (
				<div className="">
					<div className="space-y-4">{children}</div>
				</div>
			)}
		</div>
	);
}
