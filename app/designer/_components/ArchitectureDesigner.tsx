"use client";

import React from "react";
import { ReactFlowProvider, Node as FlowNode } from "@xyflow/react";
import ArchitectureCanvas from "./ArchitectureCanvas";
import ServicesSidebar from "./ServicesSidebar";
import ConfigurationSidebar from "./ConfigurationSidebar";
import TopBar from "./TopBar";
import KeyboardShortcutsHelp from "./KeyboardShortcutsHelp";
import SettingsModal from "./SettingsModal";
import { useApplicationShortcuts } from "@/lib/keyboard-shortcuts";
import { useUIStore, useCanvasStore } from "@/lib/stores";
import { useArchitectureState } from "@/lib/hooks/use-architecture-state";
import { useDesignerHandlers } from "@/lib/hooks/use-designer-handlers";

export default function ArchitectureDesigner() {
	// Store hooks
	const {
		isSidebarOpen,
		isConfigurationSidebarVisible,
		isHelpOpen,
		isSettingsOpen,
	} = useUIStore();
	const { selectedNode } = useCanvasStore();

	// Custom hooks for state and handlers
	const {
		activeTab,
		currentProject,
		currentArchitecture,
		handleNewArchitecture,
		handleTabChange,
		setCurrentArchitecture,
	} = useArchitectureState();

	const handlers = useDesignerHandlers();

	// Wrapper functions that match component signatures
	const wrappedHandlers = {
		handleNodeAdd: (node: FlowNode) => handlers.handleNodeAdd(node, setCurrentArchitecture),
		handleShare: () => handlers.handleShare(currentArchitecture, (tab) => handleTabChange(tab as "design" | "share" | "settings")),
		handleSettings: () => handlers.handleSettings((tab) => handleTabChange(tab as "design" | "share" | "settings")),
		handleNodeUpdate: (nodeId: string, data: Record<string, unknown>) =>
			handlers.handleNodeUpdate(nodeId, data, setCurrentArchitecture),
	};

	// Use application shortcuts
	useApplicationShortcuts({
		onNewArchitecture: handleNewArchitecture,
		onSave: () => console.log("Save shortcut pressed"),
		onToggleSidebar: handlers.handleToggleSidebar,
		onToggleConfigurationSidebar: handlers.handleToggleConfigurationSidebar,
		onToggleFullscreen: handlers.handleToggleFullscreen,
		onShowHelp: handlers.handleShowHelp,
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
					onShare={wrappedHandlers.handleShare}
					onSettings={wrappedHandlers.handleSettings}
					onHelp={handlers.handleHelp}
					onProfile={handlers.handleProfile}
					onDataLoaded={handlers.handleDataLoaded}
				/>

				{/* Main Content Area */}
				<div className="flex h-full pt-16">
					<ServicesSidebar
						isOpen={isSidebarOpen}
						onToggle={handlers.handleToggleSidebar}
					/>

					<div className="flex-1 relative">
						<ArchitectureCanvas
							onNodeAdd={wrappedHandlers.handleNodeAdd}
							onShowHelp={handlers.handleShowHelp}
							onNodeSelect={handlers.handleNodeSelect}
							onNodeDoubleClick={handlers.handleNodeDoubleClick}
						/>
					</div>

					{/* Configuration Sidebar */}
					<ConfigurationSidebar
						selectedNode={selectedNode}
						isOpen={isConfigurationSidebarVisible}
						onToggle={handlers.handleToggleConfigurationSidebar}
						onNodeUpdate={wrappedHandlers.handleNodeUpdate}
					/>
				</div>

				{/* Keyboard Shortcuts Help Modal */}
				<KeyboardShortcutsHelp isOpen={isHelpOpen} onClose={handlers.handleCloseHelp} />

				{/* Settings Modal */}
				<SettingsModal isOpen={isSettingsOpen} onClose={handlers.handleCloseSettings} />
			</ReactFlowProvider>
		</div>
	);
}
