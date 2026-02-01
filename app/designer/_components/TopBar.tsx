"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, Settings, Code, ChevronDown, Check, Plus } from "lucide-react";
import { Node, Edge } from "@xyflow/react";
import { useUIStore } from "@/lib/stores";
import { formatBytes } from "@/lib/utils";
import { useTerraformStore } from "@/lib/stores/terraform/terraform-store";
import TerraformDialog from "./TerraformModal";
import { Button } from "@/app/_components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/_components/ui/tooltip";
import { Separator } from "@/app/_components/ui/separator";

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
		<div className="absolute top-0 left-0 right-0 h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-50">
			<div className="flex items-center justify-between px-4 h-full">
				{/* Left Section */}
				<div className="flex items-center gap-4">
					<Link className="flex items-center gap-2.5 hover:opacity-80 transition-opacity" href="/">
						<div className="h-8 w-8 rounded-lg overflow-hidden ring-1 ring-border">
							<Image
								src="/darch_logo.jpeg"
								alt="Darch Logo"
								width={32}
								height={32}
								className="object-cover"
							/>
						</div>
						<span className="text-lg font-semibold text-foreground">Darch</span>
					</Link>

					<Separator orientation="vertical" className="h-6" />

					{/* Project Selector */}
					<div className="relative" ref={dropdownRef}>
						<Button
							variant="ghost"
							onClick={() => toggleProjectDropdown()}
							className="h-8 px-3 gap-2 font-normal"
						>
							<div className="flex items-center gap-2">
								<span className="font-medium text-foreground">{currentProject.name}</span>
								<span className="text-muted-foreground">•</span>
								<span className="text-muted-foreground text-sm">
									{currentProject.environment}
								</span>
							</div>
							<ChevronDown className="h-4 w-4 text-muted-foreground" />
						</Button>

						{showProjectDropdown && (
							<div className="absolute top-full mt-1.5 left-0 bg-popover border border-border rounded-lg shadow-lg z-10 min-w-[240px] py-1 animate-in fade-in-0 zoom-in-95">
								<div className="px-2 py-1.5">
									<p className="text-xs font-medium text-muted-foreground px-2 mb-1">Projects</p>
									<button className="w-full flex items-center justify-between px-2 py-2 text-sm rounded-md hover:bg-accent transition-colors">
										<div className="flex items-center gap-2">
											<div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
												<span className="text-[10px] font-semibold text-primary">P1</span>
											</div>
											<span>{currentProject.name}</span>
											<span className="text-muted-foreground">• {currentProject.environment}</span>
										</div>
										<Check className="h-4 w-4 text-primary" />
									</button>
									<button className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-accent transition-colors">
										<div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
											<span className="text-[10px] font-semibold text-muted-foreground">P2</span>
										</div>
										<span>Project 2</span>
										<span className="text-muted-foreground">• Prod</span>
									</button>
								</div>
								<Separator className="my-1" />
								<div className="px-2 py-1">
									<button className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
										<Plus className="h-4 w-4" />
										<span>New Project</span>
									</button>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Right Section */}
				<div className="flex items-center gap-1">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								onClick={openDialog}
								className="h-8 w-8 text-muted-foreground hover:text-foreground"
							>
								<Code className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Generate Terraform</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								onClick={onSettings}
								className="h-8 w-8 text-muted-foreground hover:text-foreground"
							>
								<Settings className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Settings</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								onClick={onProfile}
								className="h-8 w-8 text-muted-foreground hover:text-foreground"
							>
								<User className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Profile</TooltipContent>
					</Tooltip>
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
					formatBytes={formatBytes}
					onDataLoaded={onDataLoaded}
				/>
			</div>
		</div>
	);
}
