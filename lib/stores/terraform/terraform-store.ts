import { create } from 'zustand';

// Types
export interface BackendProject {
	name: string;
	path: string;
	fileCount: number;
	createdAt: string;
	modifiedAt: string;
	size: number;
	downloadUrl: string;
	filesUrl: string;
}

interface TerraformGenerationResult {
	success: boolean;
	message: string;
	data?: Record<string, unknown>;
	timestamp: string;
}

interface TerraformState {
	// UI State
	isDialogOpen: boolean;
	isGenerating: boolean;
	isDownloading: boolean;
	
	// Output and Results
	output: string;
	generationHistory: TerraformGenerationResult[];
	latestProject: BackendProject | null;
	
	// Actions
	setDialogOpen: (open: boolean) => void;
	setGenerating: (generating: boolean) => void;
	setDownloading: (downloading: boolean) => void;
	appendOutput: (text: string) => void;
	setOutput: (text: string) => void;
	clearOutput: () => void;
	addGenerationResult: (result: TerraformGenerationResult) => void;
	setLatestProject: (project: BackendProject | null) => void;
	
	// Complex operations
	openDialog: () => void;
	closeDialog: () => void;
	reset: () => void;
	
	// API operations
	generateTerraform: (data: unknown, projectName: string) => Promise<void>;
	downloadZip: () => Promise<void>;
	fetchLatestProject: () => Promise<void>;
}

const initialState = {
	isDialogOpen: false,
	isGenerating: false,
	isDownloading: false,
	output: "",
	generationHistory: [],
	latestProject: null,
};

// Utility function
export const formatBytes = (bytes: number): string => {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const useTerraformStore = create<TerraformState>((set, get) => ({
	...initialState,
	
	// Basic setters
	setDialogOpen: (open: boolean) => set({ isDialogOpen: open }),
	setGenerating: (generating: boolean) => set({ isGenerating: generating }),
	setDownloading: (downloading: boolean) => set({ isDownloading: downloading }),
	
	// Output management
	appendOutput: (text: string) => set((state) => ({ output: state.output + text })),
	setOutput: (text: string) => set({ output: text }),
	clearOutput: () => set({ output: "", latestProject: null }),
	
	// Generation results
	addGenerationResult: (result: TerraformGenerationResult) => set((state) => ({
		generationHistory: [result, ...state.generationHistory].slice(0, 10), // Keep last 10 results
	})),
	
	// Project management
	setLatestProject: (project: BackendProject | null) => set({ latestProject: project }),
	
	// Complex operations
	openDialog: () => {
		set({ isDialogOpen: true });
	},
	
	closeDialog: () => {
		set({ isDialogOpen: false });
	},
	
	reset: () => set({
		...initialState,
		isDialogOpen: get().isDialogOpen, // Keep dialog state
	}),
	
	// API operations
	generateTerraform: async (data: unknown, projectName: string) => {
		if (!data) {
			set({ output: '❌ No architecture data available. Please create some resources first.' });
			return;
		}

		const archData = data as { nodes?: Array<unknown>; [key: string]: unknown };
		if (!archData.nodes || archData.nodes.length === 0) {
			set({ output: '❌ No resources found in your architecture. Please add some AWS resources first.' });
			return;
		}

		set({ isGenerating: true, output: "🔄 Generating Terraform configuration...\n" });

		try {
			const response = await fetch('http://localhost:5000/api/generate-terraform', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					architectureData: data,
					projectName: projectName.toLowerCase().replace(/\s+/g, '-')
				})
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const result = await response.json();

			if (result.success) {
				const successOutput = `✅ Terraform Generated Successfully!\n\n${JSON.stringify(result, null, 2)}`;
				set({ output: successOutput });
				
				// Add to history
				get().addGenerationResult({
					success: true,
					message: 'Terraform generation completed successfully',
					data: result,
					timestamp: new Date().toISOString(),
				});
				
				// Fetch the latest project to enable download
				get().fetchLatestProject();
			} else {
				const errorOutput = `❌ Generation Failed: ${result.error || result.message || "Unknown error"}`;
				set({ output: errorOutput });
				
				// Add to history
				get().addGenerationResult({
					success: false,
					message: result.error || result.message || "Unknown error",
					timestamp: new Date().toISOString(),
				});
			}
		} catch (error) {
			let errorOutput = '';
			if (error instanceof Error) {
				if (error.message.includes('Failed to fetch')) {
					errorOutput = '❌ Cannot connect to backend server\n\nPlease ensure:\n• Backend server is running on http://localhost:5000\n• No CORS issues\n• Server is accessible';
				} else {
					errorOutput = `❌ Error: ${error.message}`;
				}
			} else {
				errorOutput = '❌ Unknown error occurred while generating Terraform';
			}
			set({ output: errorOutput });
			
			// Add to history
			get().addGenerationResult({
				success: false,
				message: errorOutput,
				timestamp: new Date().toISOString(),
			});
		} finally {
			set({ isGenerating: false });
		}
	},
	
	// Fetch latest project
	fetchLatestProject: async () => {
		try {
			const response = await fetch("http://localhost:5000/api/projects");
			const result = await response.json();
			
			if (result.success && result.data.projects.length > 0) {
				// Get the most recently created project
				const projects = result.data.projects.sort((a: BackendProject, b: BackendProject) => 
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);
				const latestProject = projects[0];
				const projectInfo = `\n\n📁 Latest Project: ${latestProject.name}\n💾 Files: ${latestProject.fileCount}\n📏 Size: ${formatBytes(latestProject.size)}`;
				
				set((state) => ({ 
					latestProject,
					output: state.output + projectInfo
				}));
			}
		} catch (error) {
			console.error("Failed to fetch projects:", error);
			const errorInfo = "\n\n⚠️ Could not fetch project information for download.";
			set((state) => ({ output: state.output + errorInfo }));
		}
	},
	
	// Download ZIP
	downloadZip: async () => {
		const { latestProject } = get();
		
		if (!latestProject) {
			const errorMsg = "\n\n❌ No project available for download. Generate Terraform first.";
			set((state) => ({ output: state.output + errorMsg }));
			return;
		}

		set({ isDownloading: true });
		const downloadMsg = "\n\n🔄 Starting download...";
		set((state) => ({ output: state.output + downloadMsg }));
		
		try {
			const response = await fetch(`http://localhost:5000/api/projects/${encodeURIComponent(latestProject.name)}/download`);
			
			if (!response.ok) {
				throw new Error(`Download failed: ${response.statusText}`);
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${latestProject.name}-terraform.zip`;
			
			document.body.appendChild(a);
			a.click();
			
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
			
			const successMsg = "\n\n📦 ZIP file download started successfully!";
			set((state) => ({ output: state.output + successMsg }));
		} catch (error) {
			const errorMsg = `\n\n❌ Download Error: ${error instanceof Error ? error.message : "Unknown error"}`;
			set((state) => ({ output: state.output + errorMsg }));
		} finally {
			set({ isDownloading: false });
		}
	},
}));

// Selectors for better performance and easier usage
export const useTerraformDialog = () => useTerraformStore((state) => ({
	isOpen: state.isDialogOpen,
	openDialog: state.openDialog,
	closeDialog: state.closeDialog,
}));

export const useTerraformOutput = () => useTerraformStore((state) => ({
	output: state.output,
	appendOutput: state.appendOutput,
	setOutput: state.setOutput,
	clearOutput: state.clearOutput,
}));

export const useTerraformGeneration = () => useTerraformStore((state) => ({
	isGenerating: state.isGenerating,
	generateTerraform: state.generateTerraform,
	history: state.generationHistory,
}));

export const useTerraformDownload = () => useTerraformStore((state) => ({
	isDownloading: state.isDownloading,
	latestProject: state.latestProject,
	downloadZip: state.downloadZip,
}));
