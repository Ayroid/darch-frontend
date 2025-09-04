"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { FiUser, FiSettings } from "react-icons/fi";
import { LuFileText } from "react-icons/lu";
import ArchitectureImportExport from "./ArchitectureImportExport";
import { Node, Edge } from "@xyflow/react";
import { useUIStore } from "@/lib/stores";

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
	onSettings,
	onProfile,
	onDataLoaded,
}: TopBarProps) {
	const dropdownRef = useRef<HTMLDivElement>(null);
	const {
		showProjectDropdown,
		setProjectDropdownVisible,
		toggleProjectDropdown,
	} = useUIStore();

	// Click outside to close dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as HTMLElement)
			) {
				setProjectDropdownVisible(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [setProjectDropdownVisible]);

	return (
		<div className="absolute top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-50 flex items-center justify-between px-6">
			<div className="flex flex-1 items-center">
				{/* Left Section */}
				<div className="flex items-center space-x-6 w-full justify-start">
					<Link className="flex items-center space-x-3" href="/">
						<div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-black rounded-lg flex items-center justify-center">
							<span className="text-white text-sm font-bold">D</span>
						</div>
						<span className="text-xl font-semibold text-gray-900">Darch</span>
					</Link>

					{/* Project Selector */}
					<div className="flex items-center">
						<div className="relative" ref={dropdownRef}>
							<button
								onClick={() => toggleProjectDropdown()}
								className="flex items-center space-x-2 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
							>
								<span className="text-sm text-gray-700 font-medium">
									{currentProject.name} • {currentProject.environment}
								</span>
								<LuFileText className="w-4 h-4 text-gray-400" />
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

			<div className="flex flex-1 items-center justify-end">
				{/* Right Section */}
				<div className="flex items-center space-x-3 w-full justify-end">
					{/* Import/Export Controls */}
					<ArchitectureImportExport onDataLoaded={onDataLoaded} />

					<button
						onClick={onSettings}
						className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
					>
						<FiSettings className="w-5 h-5" />
					</button>

					<button
						onClick={onProfile}
						className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
					>
						<FiUser className="w-5 h-5" />
					</button>
				</div>
			</div>
		</div>
	);
}
