"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { FiUser, FiSettings, FiCode, FiCheck, FiDownload, FiFileText, FiTrash2 } from "react-icons/fi";
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
	const isDialogOpen = useTerraformStore(state => state.isDialogOpen);
	const output = useTerraformStore(state => state.output);
	const isGenerating = useTerraformStore(state => state.isGenerating);
	const isDownloading = useTerraformStore(state => state.isDownloading);
	const latestProject = useTerraformStore(state => state.latestProject);
	const isPlanning = useTerraformStore(state => state.isPlanning);
	const isPlanPolling = useTerraformStore(state => state.isPlanPolling);

	// Actions
	const openDialog = useTerraformStore(state => state.openDialog);
	const closeDialog = useTerraformStore(state => state.closeDialog);
	const clearOutput = useTerraformStore(state => state.clearOutput);
	const generateTerraform = useTerraformStore(state => state.generateTerraform);
	const downloadZip = useTerraformStore(state => state.downloadZip);
	const planTerraform = useTerraformStore(state => state.planTerraform);
	const quickPlan = useTerraformStore(state => state.quickPlan);

	// Utility function to format bytes
	const formatBytesLocal = (bytes: number): string => {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	// Handle Generate Terraform
	const handleGenerateTerraform = async () => {
		if (!currentData) {
			return;
		}

		const projectName = currentProject.name.toLowerCase().replace(/\s+/g, '-');
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

		const projectName = currentProject.name.toLowerCase().replace(/\s+/g, '-');
		await planTerraform(currentData, projectName);
	};

	// Handle Quick Plan (Preview without terraform init)
	const handleQuickPlan = async () => {
		if (!currentData) {
			return;
		}

		const projectName = currentProject.name.toLowerCase().replace(/\s+/g, '-');
		await quickPlan(currentData, projectName);
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

					{/* Generate Terraform Button */}
					<button
						onClick={openDialog}
						className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
						title="Generate and download Terraform code"
					>
						<FiCode className="w-5 h-5" />
					</button>

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

			{/* Terraform Management Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={closeDialog}>
				<DialogContent className="max-w-6xl w-[90vw] max-h-[95vh] overflow-y-auto">
					<DialogHeader className="pb-6">
						<DialogTitle className="flex items-center space-x-3 text-xl">
							<div className="p-2 bg-blue-100 rounded-lg">
								<FiCode className="w-6 h-6 text-blue-600" />
							</div>
							<div>
								<span className="text-gray-900">Terraform Management</span>
								<p className="text-sm font-normal text-gray-500 mt-1">
									Generate and download infrastructure code from your architecture
								</p>
							</div>
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-8">
						{/* Status Banner */}
						{latestProject && (
							<div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
								<div className="flex items-start justify-between">
									<div className="flex items-center space-x-3">
										<div className="p-2 bg-green-100 rounded-lg">
											<FiCheck className="w-5 h-5 text-green-600" />
										</div>
										<div>
											<h3 className="font-semibold text-green-900">Project Ready for Download</h3>
											<p className="text-sm text-green-700 mt-1">Your latest Terraform project has been generated successfully</p>
										</div>
									</div>
									<div className="text-right">
										<div className="text-sm text-green-600 font-medium">{latestProject.fileCount} files</div>
										<div className="text-xs text-green-500">{formatBytesLocal(latestProject.size)}</div>
									</div>
								</div>
								<div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
									<div className="bg-white bg-opacity-50 rounded-lg p-3">
										<div className="text-green-600 font-medium">Project Name</div>
										<div className="text-green-800 truncate font-mono text-xs mt-1">{latestProject.name}</div>
									</div>
									<div className="bg-white bg-opacity-50 rounded-lg p-3">
										<div className="text-green-600 font-medium">Files Count</div>
										<div className="text-green-800 font-semibold mt-1">{latestProject.fileCount} files</div>
									</div>
									<div className="bg-white bg-opacity-50 rounded-lg p-3">
										<div className="text-green-600 font-medium">Total Size</div>
										<div className="text-green-800 font-semibold mt-1">{formatBytesLocal(latestProject.size)}</div>
									</div>
									<div className="bg-white bg-opacity-50 rounded-lg p-3">
										<div className="text-green-600 font-medium">Created</div>
										<div className="text-green-800 text-xs mt-1">{new Date(latestProject.createdAt).toLocaleDateString()}</div>
									</div>
								</div>
							</div>
						)}

						{/* Action Buttons Section */}
						<div className="bg-gray-50 rounded-xl p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
								<FiCode className="w-5 h-5 mr-2 text-blue-600" />
								Actions
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
								{/* Generate Button */}
								<Button
									onClick={handleGenerateTerraform}
									disabled={isGenerating}
									className="h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
								>
									<div className="flex items-center space-x-3">
										<FiCode className="w-6 h-6" />
										<div className="text-left">
											<div className="font-semibold">
												{isGenerating ? "Generating..." : "Generate Terraform"}
											</div>
											<div className="text-xs opacity-90">
												{isGenerating ? "Creating infrastructure code..." : "Convert your architecture to code"}
											</div>
										</div>
									</div>
								</Button>

								{/* Download Button */}
								<Button
									onClick={handleDownloadZip}
									disabled={isDownloading || !latestProject}
									variant="outline"
									className="h-16 border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200"
								>
									<div className="flex items-center space-x-3">
										<FiDownload className="w-6 h-6 text-emerald-600" />
										<div className="text-left">
											<div className="font-semibold text-emerald-700">
												{isDownloading ? "Downloading..." : "Download ZIP"}
											</div>
											<div className="text-xs text-emerald-600">
												{isDownloading ? "Preparing download..." : latestProject ? "Ready to download" : "Generate first"}
											</div>
										</div>
									</div>
								</Button>

								{/* Plan Button (Full Plan with terraform init) */}
								<Button
									onClick={handlePlanTerraform}
									disabled={isPlanning || isGenerating || !latestProject}
									variant="outline"
									className="h-16 border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
								>
									<div className="flex items-center space-x-3">
										<FiCheck className="w-6 h-6 text-purple-600" />
										<div className="text-left">
											<div className="font-semibold text-purple-700">
												{isPlanning ? (isPlanPolling ? "Planning..." : "Starting...") : "Full Plan"}
											</div>
											<div className="text-xs text-purple-600">
												{isPlanning ? "Analyzing infrastructure..." : latestProject ? "Plan with terraform init" : "Generate first"}
											</div>
										</div>
									</div>
								</Button>

								{/* Quick Plan Button */}
								<Button
									onClick={handleQuickPlan}
									disabled={isPlanning || isGenerating}
									variant="outline"
									className="h-16 border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
								>
									<div className="flex items-center space-x-3">
										<FiFileText className="w-6 h-6 text-orange-600" />
										<div className="text-left">
											<div className="font-semibold text-orange-700">
												{isPlanning ? "Planning..." : "Quick Plan"}
											</div>
											<div className="text-xs text-orange-600">
												{isPlanning ? "Generating preview..." : "Fast preview (no init)"}
											</div>
										</div>
									</div>
								</Button>
							</div>
						</div>

						{/* Output Section */}
						{output ? (
							<div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
								<div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
									<div className="flex items-center justify-between">
										<h3 className="text-lg font-semibold text-gray-900 flex items-center">
											<LuFileText className="w-5 h-5 mr-2 text-gray-600" />
											Console Output
										</h3>
										<Button
											onClick={clearOutput}
											variant="outline"
											className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 text-sm px-3 py-1"
										>
											<FiTrash2 className="w-4 h-4 mr-2" />
											Clear
										</Button>
									</div>
								</div>
								<div className="p-6">
									<pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border max-h-80 overflow-y-auto font-mono leading-relaxed">
										{output}
									</pre>
								</div>
							</div>
						) : (
							/* Welcome/Instructions Section */
							<div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8">
								<div className="text-center max-w-2xl mx-auto">
									<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
										<FiCode className="w-8 h-8 text-blue-600" />
									</div>
									<h3 className="text-xl font-semibold text-blue-900 mb-3">
										Ready to Generate Infrastructure Code
									</h3>
									<p className="text-blue-700 mb-6">
										Transform your visual architecture into production-ready Terraform configurations
									</p>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
										<div className="bg-white bg-opacity-70 rounded-lg p-4">
											<div className="text-blue-600 font-semibold mb-2 flex items-center">
												<span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold mr-2">1</span>
												Generate
											</div>
											<p className="text-sm text-blue-800">
												Click &quot;Generate Terraform&quot; to create infrastructure code from your architecture
											</p>
										</div>
										<div className="bg-white bg-opacity-70 rounded-lg p-4">
											<div className="text-blue-600 font-semibold mb-2 flex items-center">
												<span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold mr-2">2</span>
												Review
											</div>
											<p className="text-sm text-blue-800">
												Check the output for generation status and project information
											</p>
										</div>
										<div className="bg-white bg-opacity-70 rounded-lg p-4">
											<div className="text-blue-600 font-semibold mb-2 flex items-center">
												<span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold mr-2">3</span>
												Download
											</div>
											<p className="text-sm text-blue-800">
												Download the complete project as a ZIP file for deployment
											</p>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Footer Actions */}
						<div className="flex items-center justify-between pt-6 border-t border-gray-200">
							<div className="flex items-center space-x-3">
								{output && (
									<Button
										onClick={() => navigator.clipboard.writeText(output)}
										variant="outline"
										className="text-gray-600 text-sm px-3 py-1"
									>
										<FiFileText className="w-4 h-4 mr-2" />
										Copy Output
									</Button>
								)}
							</div>
							<div className="flex items-center space-x-3">
								<Button
									variant="outline"
									onClick={closeDialog}
									className="px-6"
								>
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
