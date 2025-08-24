"use client";

import React, { useState, useEffect, useRef } from "react";
import {
	PlusIcon,
	QuestionMarkCircleIcon,
	UserCircleIcon,
	ChevronDownIcon,
	PaintBrushIcon,
	ShareIcon,
	CogIcon,
} from "@heroicons/react/24/outline";
import ArchitectureImportExport from "./ArchitectureImportExport";
import { Node, Edge } from "@xyflow/react";

// Types
interface Project {
	id: string;
	name: string;
	environment: string;
}

type TabType = "design" | "share" | "settings";

interface TopBarProps {
	currentProject: Project;
	activeTab: TabType;
	onTabChange: (tab: TabType) => void;
	onNewArchitecture: () => void;
	onShare: () => void;
	onSettings: () => void;
	onHelp: () => void;
	onProfile: () => void;
	onDataLoaded?: (nodes: Node[], edges: Edge[]) => void;
}

export default function TopBar({
	currentProject,
	activeTab,
	onTabChange,
	onNewArchitecture,
	onShare,
	onSettings,
	onHelp,
	onProfile,
	onDataLoaded,
}: TopBarProps) {
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [showProjectDropdown, setShowProjectDropdown] = useState(false);

	// Click outside to close dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as HTMLElement)
			) {
				setShowProjectDropdown(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="absolute top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-50 flex items-center justify-between px-6">
			<div className="flex flex-1 items-center">
				{/* Left Section */}
				<div className="flex items-center space-x-6 w-full justify-start">
					{/* Logo */}
					<div className="flex items-center space-x-3">
						<div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-black rounded-lg flex items-center justify-center">
							<span className="text-white text-sm font-bold">D</span>
						</div>
						<span className="text-xl font-semibold text-gray-900">Darch</span>
					</div>

					{/* Project Selector */}
					<div className="flex items-center">
						<div className="relative" ref={dropdownRef}>
							<button
								onClick={() => setShowProjectDropdown(!showProjectDropdown)}
								className="flex items-center space-x-2 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
							>
								<span className="text-sm text-gray-700 font-medium">
									{currentProject.name} • {currentProject.environment}
								</span>
								<ChevronDownIcon className="w-4 h-4 text-gray-400" />
							</button>
							{showProjectDropdown && (
								<div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[180px]">
									<div className="py-1">
										<div className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
											{currentProject.name} • {currentProject.environment}
										</div>
										<div className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer">
											Project 2 • Prod
										</div>
										<div className="border-t border-gray-100 mx-1 my-1"></div>
										<div className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 cursor-pointer font-medium">
											+ New Project
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="flex flex-1 items-center justify-center">
				{/* Center Section */}
				<div className="flex items-center space-x-1">
					<button
						onClick={() => onTabChange("design")}
						className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
							activeTab === "design"
								? "text-blue-600 bg-blue-50"
								: "text-gray-600 hover:bg-gray-50"
						}`}
					>
						<PaintBrushIcon className="w-4 h-4" />
						<span>Design</span>
					</button>
					<button
						onClick={onShare}
						className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
							activeTab === "share"
								? "text-blue-600 bg-blue-50"
								: "text-gray-600 hover:bg-gray-50"
						}`}
					>
						<ShareIcon className="w-4 h-4" />
						<span>Share</span>
					</button>
					<button
						onClick={onSettings}
						className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
							activeTab === "settings"
								? "text-blue-600 bg-blue-50"
								: "text-gray-600 hover:bg-gray-50"
						}`}
					>
						<CogIcon className="w-4 h-4" />
						<span>Settings</span>
					</button>
				</div>
			</div>

			<div className="flex flex-1 items-center justify-end">
				{/* Right Section */}
				<div className="flex items-center space-x-3 w-full justify-end">
					{/* Import/Export Controls */}
					<ArchitectureImportExport
						onDataLoaded={onDataLoaded}
						className="border-r border-gray-200 pr-3"
					/>

					<button
						onClick={onHelp}
						className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
					>
						<QuestionMarkCircleIcon className="w-5 h-5" />
						<span className="text-sm font-medium">Help</span>
					</button>
					<button
						onClick={onProfile}
						className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
					>
						<UserCircleIcon className="w-6 h-6" />
					</button>
				</div>
			</div>
		</div>
	);
}
