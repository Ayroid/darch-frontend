import { useCallback } from "react";
import { Node, Edge } from "@xyflow/react";
import {
  useUIStore,
  useCanvasStore,
  useArchitectureStore
} from "@/lib/stores";

type Architecture = {
  id: string;
  name: string;
  createdAt: Date;
  nodes: Node[];
};

/**
 * Custom hook for managing all designer event handlers
 */
export function useDesignerHandlers() {
  // Store hooks
  const { addResource } = useArchitectureStore();
  const {
    toggleSidebar,
    toggleConfigurationSidebar,
    setHelpOpen,
    setSettingsOpen,
    toggleHelp,
    isConfigurationSidebarVisible,
  } = useUIStore();
  const { setSelectedNode } = useCanvasStore();

  // Event handlers
  const handleToggleSidebar = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  const handleToggleConfigurationSidebar = useCallback(() => {
    toggleConfigurationSidebar();
  }, [toggleConfigurationSidebar]);

  const handleNodeAdd = useCallback(
    (node: Node, setCurrentArchitecture: React.Dispatch<React.SetStateAction<Architecture>>) => {
      console.log("Node added:", node);

      // Add node to the unified architecture store
      addResource(node);

      setCurrentArchitecture((prev: Architecture) => ({
        ...prev,
        nodes: [...prev.nodes, node],
      }));
    },
    [addResource]
  );

  const handleShare = useCallback((currentArchitecture: Architecture, setActiveTab: (tab: string) => void) => {
    setActiveTab("share");
    console.log("Sharing architecture:", currentArchitecture.name);
    // TODO: Implement actual share functionality
  }, []);

  const handleSettings = useCallback((setActiveTab: (tab: string) => void) => {
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
    (nodeId: string, data: Record<string, unknown>, setCurrentArchitecture: React.Dispatch<React.SetStateAction<Architecture>>) => {
      setCurrentArchitecture((prev: Architecture) => ({
        ...prev,
        nodes: prev.nodes.map((node: Node) =>
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
  }, []);

  const handleNodeDoubleClick = useCallback(
    (node: Node) => {
      setSelectedNode(node);
      if (!isConfigurationSidebarVisible) {
        toggleConfigurationSidebar();
      }
    },
    [isConfigurationSidebarVisible, setSelectedNode, toggleConfigurationSidebar]
  );

  return {
    handleToggleSidebar,
    handleToggleConfigurationSidebar,
    handleNodeAdd,
    handleShare,
    handleSettings,
    handleHelp,
    handleProfile,
    handleToggleFullscreen,
    handleShowHelp,
    handleCloseHelp,
    handleCloseSettings,
    handleNodeSelect,
    handleNodeUpdate,
    handleDataLoaded,
    handleNodeDoubleClick,
  };
}
