"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TbSettingsSpark } from "react-icons/tb";

interface CollapsibleSectionProps {
	title: string;
	children: React.ReactNode;
	className?: string;
	icon?: React.ReactNode;
}

export function CollapsibleSection({
	title,
	children,
	className,
	icon,
}: CollapsibleSectionProps) {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<div className={cn("space-y-2 pb-4 border-b px-4", className)}>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center justify-between w-full text-left py-2"
			>
				<div className="flex items-center space-x-2 pb-2">
					{icon || <TbSettingsSpark className="w-6 h-6 text-gray-600" />}
					<h3 className="font-medium text-gray-900">{title}</h3>
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
