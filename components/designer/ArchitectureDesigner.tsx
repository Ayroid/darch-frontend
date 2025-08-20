"use client";

import React, { useState, useCallback } from "react";
import { ReactFlowProvider, Node } from "@xyflow/react";
import ArchitectureCanvas from "./ArchitectureCanvas";
import ServicesSidebar from "./ServicesSidebar";
import TopBar from "./TopBar";
import KeyboardShortcutsHelp from "./KeyboardShortcutsHelp";
import { useApplicationShortcuts } from "@/lib/keyboard-shortcuts";

// Types
interface Project {
	id: string;
	name: string;
	environment: string;
}

interface Architecture {
	id: string;
	name: string;
	createdAt: Date;
	nodes: Node[];
}

type TabType = "design" | "share" | "settings";

export default function ArchitectureDesigner() {
	// State management
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [activeTab, setActiveTab] = useState<TabType>("design");
	const [isHelpOpen, setIsHelpOpen] = useState(false);
	const [currentProject] = useState<Project>({
		id: "1",
		name: "Project 1",
		environment: "Dev",
	});
	const [architectures, setArchitectures] = useState<Architecture[]>([
		{
			id: "1",
			name: "Main Architecture",
			createdAt: new Date(),
			nodes: [],
		},
	]);
	const [currentArchitecture, setCurrentArchitecture] = useState<Architecture>(
		architectures[0]
	);

	// Event handlers
	const handleToggleSidebar = useCallback(() => {
		setIsSidebarOpen(!isSidebarOpen);
	}, [isSidebarOpen]);

	const handleNodeAdd = useCallback((node: Node) => {
		console.log("Node added:", node);
		setCurrentArchitecture((prev) => ({
			...prev,
			nodes: [...prev.nodes, node],
		}));
	}, []);

	const handleNewArchitecture = useCallback(() => {
		const newArch: Architecture = {
			id: Date.now().toString(),
			name: `Architecture ${architectures.length + 1}`,
			createdAt: new Date(),
			nodes: [],
		};
		setArchitectures((prev) => [...prev, newArch]);
		setCurrentArchitecture(newArch);
		console.log("Created new architecture:", newArch.name);
	}, [architectures.length]);

	const handleTabChange = useCallback((tab: TabType) => {
		setActiveTab(tab);
		console.log("Switched to tab:", tab);
	}, []);

	const handleShare = useCallback(() => {
		setActiveTab("share");
		console.log("Sharing architecture:", currentArchitecture.name);
		// TODO: Implement actual share functionality
	}, [currentArchitecture]);

	const handleSettings = useCallback(() => {
		setActiveTab("settings");
		console.log("Opening settings");
		// TODO: Implement actual settings functionality
	}, []);

	const handleHelp = useCallback(() => {
		console.log("Opening help");
		// TODO: Implement help modal or redirect
	}, []);

	const handleProfile = useCallback(() => {
		console.log("Opening profile");
		// TODO: Implement profile menu or modal
	}, []);

	const handleToggleFullscreen = useCallback(() => {
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			document.documentElement.requestFullscreen();
		}
		console.log("Toggled fullscreen");
	}, []);

	const handleShowHelp = useCallback(() => {
		setIsHelpOpen(prev => !prev);
		console.log("Toggling keyboard shortcuts help");
	}, []);

	const handleCloseHelp = useCallback(() => {
		setIsHelpOpen(false);
	}, []);

	// Use application shortcuts
	useApplicationShortcuts({
		onNewArchitecture: handleNewArchitecture,
		onSave: () => console.log("Save shortcut pressed"),
		onToggleSidebar: handleToggleSidebar,
		onToggleFullscreen: handleToggleFullscreen,
		onShowHelp: handleShowHelp,
	});

	return (
		<div className="w-full h-screen relative overflow-hidden bg-gray-100">
			<ReactFlowProvider>
				{/* Top Bar */}
				<TopBar
					currentProject={currentProject}
					activeTab={activeTab}
					onTabChange={handleTabChange}
					onNewArchitecture={handleNewArchitecture}
					onShare={handleShare}
					onSettings={handleSettings}
					onHelp={handleHelp}
					onProfile={handleProfile}
				/>

				{/* Main Content Area */}
				<div className="flex h-full pt-16">
					<ServicesSidebar
						isOpen={isSidebarOpen}
						onToggle={handleToggleSidebar}
					/>

					<div className="flex-1 relative">
						<ArchitectureCanvas 
							onNodeAdd={handleNodeAdd} 
							onShowHelp={handleShowHelp}
						/>
					</div>
				</div>

				{/* Keyboard Shortcuts Help Modal */}
				<KeyboardShortcutsHelp 
					isOpen={isHelpOpen} 
					onClose={handleCloseHelp} 
				/>
			</ReactFlowProvider>
		</div>
	);
}
