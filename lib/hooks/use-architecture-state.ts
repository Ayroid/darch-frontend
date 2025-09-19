import { useState, useCallback } from "react";
import { Node } from "@xyflow/react";

// Types
export interface Project {
  id: string;
  name: string;
  environment: string;
}

export interface Architecture {
  id: string;
  name: string;
  createdAt: Date;
  nodes: Node[];
}

export type TabType = "design" | "share" | "settings";

/**
 * Custom hook for managing project and architecture state
 */
export function useArchitectureState() {
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

  return {
    // State
    activeTab,
    currentProject,
    architectures,
    currentArchitecture,

    // Actions
    handleNewArchitecture,
    handleTabChange,
    setCurrentArchitecture,
  };
}
