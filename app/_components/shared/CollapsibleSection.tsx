"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CollapsibleSectionProps {
	title: string;
	icon?: React.ReactNode;
	defaultOpen?: boolean;
	borderbottom?: boolean;
	children: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
	title,
	icon,
	defaultOpen = true,
	borderbottom = true,
	children,
}) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div className={borderbottom ? "border-b border-gray-200 pb-4" : ""}>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full flex items-center justify-between py-2 px-4 hover:bg-gray-50 rounded-md transition-colors"
			>
				<div className="flex items-center gap-3">
					{icon && <span className="flex-shrink-0">{icon}</span>}
					<h3 className="text-sm font-semibold text-gray-900">{title}</h3>
				</div>
				<span className="flex-shrink-0">
					{isOpen ? (
						<ChevronDown className="w-5 h-5 text-gray-500" />
					) : (
						<ChevronRight className="w-5 h-5 text-gray-500" />
					)}
				</span>
			</button>
			{isOpen && <div className="px-4 pt-4">{children}</div>}
		</div>
	);
};
