"use client";

import React, { useState, useCallback } from "react";
import { ReactFlowProvider, Node, Edge } from "@xyflow/react";
import ArchitectureCanvas from "./ArchitectureCanvas";
import ServicesSidebar from "./ServicesSidebar";
import ConfigurationSidebar from "./ConfigurationSidebar";
import TopBar from "./TopBar";
import KeyboardShortcutsHelp from "./KeyboardShortcutsHelp";
import SettingsModal from "./SettingsModal";
import { useApplicationShortcuts } from "@/lib/keyboard-shortcuts";
import {
	useConfigurationStore,
	useUIStore,
	useCanvasStore,
} from "@/lib/stores";
import { AWSResourceConfiguration } from "@/lib/types/aws-resources";

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
	// Store hooks
	const { initializeNodeConfiguration } = useConfigurationStore();
	const {
		isSidebarOpen,
		isConfigurationSidebarVisible,
		isHelpOpen,
		isSettingsOpen,
		toggleSidebar,
		toggleConfigurationSidebar,
		setHelpOpen,
		setSettingsOpen,
		toggleHelp,
	} = useUIStore();
	const { selectedNode, setSelectedNode } = useCanvasStore();

	// State management (keeping only non-UI related state)
	const [activeTab, setActiveTab] = useState<TabType>("design");
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
		toggleSidebar();
	}, [toggleSidebar]);

	const handleToggleConfigurationSidebar = useCallback(() => {
		toggleConfigurationSidebar();
	}, [toggleConfigurationSidebar]);

	const handleNodeAdd = useCallback(
		(node: Node) => {
			console.log("Node added:", node);

			// Initialize configuration for the new node
			const data = node.data as AWSResourceConfiguration;
			const serviceId = (data?.serviceId as string) || "";
			if (serviceId) {
				initializeNodeConfiguration(node.id, serviceId);
			}

			setCurrentArchitecture((prev) => ({
				...prev,
				nodes: [...prev.nodes, node],
			}));
		},
		[initializeNodeConfiguration]
	);

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
		setSettingsOpen(true);
		console.log("Opening settings");
	}, [setSettingsOpen]);

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
		toggleHelp();
		console.log("Toggling keyboard shortcuts help");
	}, [toggleHelp]);

	const handleCloseHelp = useCallback(() => {
		setHelpOpen(false);
	}, [setHelpOpen]);

	const handleCloseSettings = useCallback(() => {
		setSettingsOpen(false);
	}, [setSettingsOpen]);

	const handleNodeSelect = useCallback(
		(node: Node | null) => {
			setSelectedNode(node);
			console.log("Node selected:", node?.id);
		},
		[setSelectedNode]
	);

	const handleNodeUpdate = useCallback(
		(nodeId: string, data: Record<string, unknown>) => {
			setCurrentArchitecture((prev) => ({
				...prev,
				nodes: prev.nodes.map((node) =>
					node.id === nodeId ? { ...node, data } : node
				),
			}));
			console.log("Node updated:", nodeId, data);
		},
		[]
	);

	const handleDataLoaded = useCallback((nodes: Node[], edges: Edge[]) => {
		console.log("Loading architecture data:", { nodes, edges });
		// The ArchitectureCanvas will automatically load the data through the architecture data manager
		// We don't need to do anything here as the data is managed by the hook
	}, []);

	// Use application shortcuts
	useApplicationShortcuts({
		onNewArchitecture: handleNewArchitecture,
		onSave: () => console.log("Save shortcut pressed"),
		onToggleSidebar: handleToggleSidebar,
		onToggleConfigurationSidebar: handleToggleConfigurationSidebar,
		onToggleFullscreen: handleToggleFullscreen,
		onShowHelp: handleShowHelp,
	});

	// Double click handler for nodes
	const handleNodeDoubleClick = useCallback(
		(node: Node) => {
			setSelectedNode(node);
			if (!isConfigurationSidebarVisible) {
				toggleConfigurationSidebar();
			}
		},
		[isConfigurationSidebarVisible, setSelectedNode, toggleConfigurationSidebar]
	);

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
					onDataLoaded={handleDataLoaded}
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
							onNodeSelect={handleNodeSelect}
							onNodeDoubleClick={handleNodeDoubleClick}
						/>
					</div>

					{/* Configuration Sidebar */}
					<ConfigurationSidebar
						selectedNode={selectedNode}
						isOpen={isConfigurationSidebarVisible}
						onToggle={handleToggleConfigurationSidebar}
						onNodeUpdate={handleNodeUpdate}
					/>
				</div>

				{/* Keyboard Shortcuts Help Modal */}
				<KeyboardShortcutsHelp isOpen={isHelpOpen} onClose={handleCloseHelp} />

				{/* Settings Modal */}
				<SettingsModal isOpen={isSettingsOpen} onClose={handleCloseSettings} />
			</ReactFlowProvider>
		</div>
	);
}
