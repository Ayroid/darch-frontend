"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { FiUser, FiSettings, FiCode, FiChevronDown } from "react-icons/fi";
import ArchitectureImportExport from "./ArchitectureImportExport";
import { Node, Edge } from "@xyflow/react";
import { useUIStore } from "@/lib/stores";

import { useTerraformStore } from "@/lib/stores/terraform/terraform-store";
import TerraformDialog from "./TerraformModal";

// Types
export interface Project {
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

	// Zustand store hooks - use individual state pieces to prevent infinite loops
	const isDialogOpen = useTerraformStore((state) => state.isDialogOpen);
	const output = useTerraformStore((state) => state.output);
	const isGenerating = useTerraformStore((state) => state.isGenerating);
	const isDownloading = useTerraformStore((state) => state.isDownloading);
	const latestProject = useTerraformStore((state) => state.latestProject);
	const isPlanning = useTerraformStore((state) => state.isPlanning);

	// Actions
	const openDialog = useTerraformStore((state) => state.openDialog);
	const closeDialog = useTerraformStore((state) => state.closeDialog);

	// Utility function to format bytes
	const formatBytesLocal = (bytes: number): string => {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

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
		<div className="absolute top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
			<div className="flex items-center justify-between px-6 h-full">
				{/* Left Section */}
				<div className="flex items-center space-x-6">
					<Link className="flex items-center space-x-3" href="/">
						<div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
							<span className="text-white text-sm font-bold">D</span>
						</div>
						<span className="text-xl font-semibold text-gray-900">Darch</span>
					</Link>

					{/* Project Selector */}
					<div className="relative" ref={dropdownRef}>
						<button
							onClick={() => toggleProjectDropdown()}
							className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
						>
							<span className="font-medium">{currentProject.name}</span>
							<span className="text-gray-500">•</span>
							<span className="text-gray-500">
								{currentProject.environment}
							</span>
							<FiChevronDown className="w-4 h-4 text-gray-400" />
						</button>
						{showProjectDropdown && (
							<div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[220px] py-1">
								<div className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
									{currentProject.name} • {currentProject.environment}
								</div>
								<div className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
									Project 2 • Prod
								</div>
								<div className="border-t border-gray-100 my-1"></div>
								<div className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
									+ New Project
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Right Section */}
				<div className="flex items-center space-x-2">
					<ArchitectureImportExport onDataLoaded={onDataLoaded} />

					<button
						onClick={openDialog}
						className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
						title="Generate Terraform"
					>
						<FiCode className="w-5 h-5" />
					</button>

					<button
						onClick={onSettings}
						className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
					>
						<FiSettings className="w-5 h-5" />
					</button>

					<button
						onClick={onProfile}
						className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
					>
						<FiUser className="w-5 h-5" />
					</button>
				</div>

				<TerraformDialog
					currentProject={currentProject}
					isOpen={isDialogOpen}
					onClose={closeDialog}
					isGenerating={isGenerating}
					isDownloading={isDownloading}
					isPlanning={isPlanning}
					output={output}
					latestProject={latestProject}
					formatBytes={formatBytesLocal}
				/>
			</div>
		</div>
	);
}
