"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
	FiUser,
	FiSettings,
	FiCode,
	FiCheck,
	FiDownload,
	FiFileText,
	FiTrash2,
	FiChevronDown,
} from "react-icons/fi";
import { LuFileText } from "react-icons/lu";
import ArchitectureImportExport from "./ArchitectureImportExport";
import { Node, Edge } from "@xyflow/react";
import { useUIStore } from "@/lib/stores";
import { useArchitectureData } from "@/hooks/use-architecture-data";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTerraformStore } from "@/lib/stores/terraform/terraform-store";

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
	const { currentData } = useArchitectureData();
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
	const clearOutput = useTerraformStore((state) => state.clearOutput);
	const generateTerraform = useTerraformStore(
		(state) => state.generateTerraform
	);
	const downloadZip = useTerraformStore((state) => state.downloadZip);
	const planTerraform = useTerraformStore((state) => state.planTerraform);

	// Utility function to format bytes
	const formatBytesLocal = (bytes: number): string => {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	// Handle Generate Terraform
	const handleGenerateTerraform = async () => {
		if (!currentData) {
			return;
		}

		const projectName = currentProject.name.toLowerCase().replace(/\s+/g, "-");
		await generateTerraform(currentData, projectName);
	};

	// Handle Download ZIP
	const handleDownloadZip = async () => {
		await downloadZip();
	};

	// Handle Plan Terraform (Full plan with terraform init)
	const handlePlanTerraform = async () => {
		if (!currentData) {
			return;
		}

		const projectName = currentProject.name.toLowerCase().replace(/\s+/g, "-");
		await planTerraform(currentData, projectName);
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
			</div>

			{/* Terraform Management Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={closeDialog}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center space-x-3">
							<FiCode className="w-5 h-5" />
							<span>Terraform Management</span>
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-6">
						{/* Status Section */}
						{latestProject && (
							<div className="border border-gray-200 rounded-lg p-4">
								<div className="flex items-center justify-between mb-3">
									<div className="flex items-center space-x-2">
										<FiCheck className="w-4 h-4 text-gray-600" />
										<span className="font-medium text-gray-900">
											Project Ready
										</span>
									</div>
									<div className="text-sm text-gray-500">
										{latestProject.fileCount} files •{" "}
										{formatBytesLocal(latestProject.size)} •{" "}
										{new Date(latestProject.createdAt).toLocaleDateString()}
									</div>
								</div>
								<div className="flex justify-between text-sm text-gray-500">
									<div>
										<div className="text-gray-500 text-sm">Name</div>
										<div className="font-mono text-xs truncate">
											{latestProject.name}
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Action Buttons */}
						<div className="grid grid-cols-3 gap-4">
							<Button
								onClick={handleGenerateTerraform}
								disabled={isGenerating}
								variant="outline"
								className="h-16 flex-col space-y-1 border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-700"
							>
								<FiCode className="w-5 h-5" />
								<span className="text-sm">
									{isGenerating ? "Generating..." : "Generate"}
								</span>
							</Button>

							<Button
								onClick={handleDownloadZip}
								disabled={isDownloading || !latestProject}
								variant="outline"
								className="h-16 flex-col space-y-1 border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 hover:text-green-700"
							>
								<FiDownload className="w-5 h-5" />
								<span className="text-sm">
									{isDownloading ? "Downloading..." : "Download"}
								</span>
							</Button>

							<Button
								onClick={handlePlanTerraform}
								disabled={isPlanning || isGenerating || !latestProject}
								variant="outline"
								className="h-16 flex-col space-y-1 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700"
							>
								<FiCheck className="w-5 h-5" />
								<span className="text-sm">
									{isPlanning ? "Planning..." : "Plan"}
								</span>
							</Button>
						</div>

						{/* Output Section */}
						{output ? (
							<div className="border border-gray-200 rounded-lg overflow-hidden">
								<div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<LuFileText className="w-4 h-4 text-gray-600" />
										<span className="font-medium text-gray-900">Output</span>
									</div>
									<Button onClick={clearOutput} variant="outline" size="sm">
										<FiTrash2 className="w-4 h-4 mr-1" />
										Clear
									</Button>
								</div>
								<div className="p-4">
									<pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
										{output}
									</pre>
								</div>
							</div>
						) : (
							<div className="border border-gray-200 rounded-lg p-8 text-center">
								<FiCode className="w-8 h-8 text-gray-400 mx-auto mb-4" />
								<h3 className="font-medium text-gray-900 mb-2">
									Generate Infrastructure Code
								</h3>
								<p className="text-sm text-gray-500 mb-4">
									Convert your architecture into Terraform configurations
								</p>
								<div className="flex justify-center space-x-6 text-xs text-gray-500">
									<span>1. Generate</span>
									<span>2. Review</span>
									<span>3. Download</span>
								</div>
							</div>
						)}

						{/* Footer */}
						<div className="flex justify-between pt-4 border-t border-gray-200">
							{output && (
								<Button
									onClick={() => navigator.clipboard.writeText(output)}
									variant="outline"
									size="sm"
								>
									<FiFileText className="w-4 h-4 mr-2" />
									Copy
								</Button>
							)}
							<div className="ml-auto">
								<Button variant="outline" onClick={closeDialog}>
									Close
								</Button>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
