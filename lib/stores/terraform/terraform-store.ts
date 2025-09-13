import { create } from 'zustand';

// Get backend URL from environment variable with fallback
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

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

// Detailed plan result (from quick plan endpoint)
interface TerraformPlanResult {
	resourceSummary: { totalResources: number; resourceTypes: Record<string, number> };
	costEstimate: { monthlyEstimate: number; breakdown: Record<string, number> };
	modules: Array<{ name: string; source: string }>;
	warnings: string[];
	terraformInitialized?: boolean;
}

// Simple job result (from async plan endpoint)
interface SimpleJobResult {
	success: boolean;
	message: string;
	outputLines: number;
}

interface TerraformJobStatus {
	jobId: string;
	status: 'pending' | 'running' | 'completed' | 'failed';
	progress?: number;
	message?: string;
	logs?: string[];
	rawOutput?: string;
	result?: TerraformPlanResult | SimpleJobResult; // Support both result types
	error?: string;
	duration?: number;
	createdAt?: string;
	updatedAt?: string;
}

interface TerraformState {
	// UI State
	isDialogOpen: boolean;
	isGenerating: boolean;
	isDownloading: boolean;
	isPlanning: boolean;
	isPlanPolling: boolean;

	// Output and Results
	output: string;
	generationHistory: TerraformGenerationResult[];
	latestProject: BackendProject | null;
	planResult: TerraformPlanResult | null;
	currentJobId: string | null;

	// Actions
	setDialogOpen: (open: boolean) => void;
	setGenerating: (generating: boolean) => void;
	setDownloading: (downloading: boolean) => void;
	setPlanning: (planning: boolean) => void;
	setPlanPolling: (polling: boolean) => void;
	appendOutput: (text: string) => void;
	setOutput: (text: string) => void;
	clearOutput: () => void;
	addGenerationResult: (result: TerraformGenerationResult) => void;
	setLatestProject: (project: BackendProject | null) => void;
	setPlanResult: (result: TerraformPlanResult | null) => void;
	setCurrentJobId: (jobId: string | null) => void;

	// Complex operations
	openDialog: () => void;
	closeDialog: () => void;
	reset: () => void;

	// API operations
	generateTerraform: (data: unknown, projectName: string) => Promise<void>;
	planTerraform: (data: unknown, projectName: string) => Promise<void>;
	quickPlan: (data: unknown, projectName: string) => Promise<void>;
	downloadZip: () => Promise<void>;
	fetchLatestProject: () => Promise<void>;
}

const initialState = {
	isDialogOpen: false,
	isGenerating: false,
	isDownloading: false,
	isPlanning: false,
	isPlanPolling: false,
	output: "",
	generationHistory: [],
	latestProject: null,
	planResult: null,
	currentJobId: null,
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
	setPlanning: (planning: boolean) => set({ isPlanning: planning }),
	setPlanPolling: (polling: boolean) => set({ isPlanPolling: polling }),

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
	setPlanResult: (result: TerraformPlanResult | null) => set({ planResult: result }),
	setCurrentJobId: (jobId: string | null) => set({ currentJobId: jobId }),

	// Complex operations
	openDialog: () => {
		set({ isDialogOpen: true });
	},

	closeDialog: () => {
		// Cancel any ongoing polling operations
		set({
			isDialogOpen: false,
			isPlanPolling: false,
			isPlanning: false,
			currentJobId: null
		});
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
			const response = await fetch(`${BACKEND_URL}/api/terraform/generate`, {
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

				// Add to history and update state in one call
				const newResult = {
					success: true,
					message: 'Terraform generation completed successfully',
					data: result,
					timestamp: new Date().toISOString(),
				};

				set(state => ({
					output: successOutput,
					generationHistory: [newResult, ...state.generationHistory].slice(0, 10)
				}));

				// Fetch the latest project to enable download (async without recursive call)
				(async () => {
					try {
						const response = await fetch(`${BACKEND_URL}/api/projects`);
						const result = await response.json();

						if (result.success && result.data.projects.length > 0) {
							const projects = result.data.projects.sort((a: BackendProject, b: BackendProject) =>
								new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
							);
							const latestProject = projects[0];
							const projectInfo = `\n\n📁 Latest Project: ${latestProject.name}\n💾 Files: ${latestProject.fileCount}\n📏 Size: ${formatBytes(latestProject.size)}`;

							set(state => ({
								latestProject,
								output: state.output + projectInfo
							}));
						}
					} catch (error) {
						console.error("Failed to fetch projects:", error);
						const errorInfo = "\n\n⚠️ Could not fetch project information for download.";
						set(state => ({ output: state.output + errorInfo }));
					}
				})();
			} else {
				const errorOutput = `❌ Generation Failed: ${result.error || result.message || "Unknown error"}`;

				// Add to history and update state in one call
				const newResult = {
					success: false,
					message: result.error || result.message || "Unknown error",
					timestamp: new Date().toISOString(),
				};

				set(state => ({
					output: errorOutput,
					generationHistory: [newResult, ...state.generationHistory].slice(0, 10)
				}));
			}
		} catch (error) {
			let errorOutput = '';
			if (error instanceof Error) {
				if (error.message.includes('Failed to fetch')) {
					errorOutput = `❌ Cannot connect to backend server\n\nPlease ensure:\n• Backend server is running on ${BACKEND_URL}\n• No CORS issues\n• Server is accessible`;
				} else {
					errorOutput = `❌ Error: ${error.message}`;
				}
			} else {
				errorOutput = '❌ Unknown error occurred while generating Terraform';
			}
			// Add to history and update state in one call
			const errorResult = {
				success: false,
				message: errorOutput,
				timestamp: new Date().toISOString(),
			};

			set(state => ({
				output: errorOutput,
				generationHistory: [errorResult, ...state.generationHistory].slice(0, 10)
			}));
		} finally {
			set({ isGenerating: false });
		}
	},

	// Fetch latest project
	fetchLatestProject: async () => {
		try {
			const response = await fetch(`${BACKEND_URL}/api/projects`);
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
			const response = await fetch(`${BACKEND_URL}/api/projects/${encodeURIComponent(latestProject.name)}/download`);

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

	// Plan Terraform with async polling
	planTerraform: async (data: unknown, projectName: string) => {
		if (!data) {
			set({ output: '❌ No architecture data available. Please create some resources first.' });
			return;
		}

		const archData = data as { nodes?: Array<unknown>; [key: string]: unknown };
		if (!archData.nodes || archData.nodes.length === 0) {
			set({ output: '❌ No resources found in your architecture. Please add some AWS resources first.' });
			return;
		}

		set({ isPlanning: true, output: "🔄 Starting Terraform plan generation...\n" });

		try {
			// Start async plan job
			const response = await fetch(`${BACKEND_URL}/api/terraform/plan-execute`, {
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

			if (result.success && result.data.jobId) {
				const jobId = result.data.jobId;
				set({
					currentJobId: jobId,
					isPlanPolling: true,
					output: `🔄 Plan job started (ID: ${jobId})\n⏱️ Estimated duration: ${result.data.estimatedDuration || 30} seconds\n\n`
				});

				// Start polling inline to avoid recursive store calls
				let finalResult: TerraformJobStatus | null = null;
				const maxAttempts = 30;
				let attempts = 0;
				let lastProgress = -1;
				let lastLogCount = 0; // Track streaming logs
				let shouldContinuePolling = true;

				while (attempts < maxAttempts && shouldContinuePolling) {
					try {
						const response = await fetch(`${BACKEND_URL}/api/terraform/plan-status/${jobId}`);

						if (!response.ok) {
							throw new Error(`HTTP ${response.status}: ${response.statusText}`);
						}

						const result = await response.json();

						if (result.success && result.data) {
							const jobStatus: TerraformJobStatus & { logs?: string[]; message?: string; rawOutput?: string } = result.data;

							// Display new streaming logs
							if (jobStatus.logs && Array.isArray(jobStatus.logs) && jobStatus.logs.length > lastLogCount) {
								const newLogs = jobStatus.logs.slice(lastLogCount);
								set(state => {
									if (state.isPlanPolling) {
										const logOutput = newLogs.join('\n') + '\n';
										return { output: state.output + logOutput };
									}
									return state;
								});
								lastLogCount = jobStatus.logs.length;
							}

							// Update progress and message if changed
							if (jobStatus.progress !== undefined && jobStatus.progress !== lastProgress) {
								lastProgress = jobStatus.progress;
								set(state => {
									if (state.isPlanPolling) {
										const progressMessage = jobStatus.message 
											? `⏳ ${jobStatus.message} (${jobStatus.progress}%)\n`
											: `⏳ Progress: ${jobStatus.progress}%\n`;
										return { output: state.output + progressMessage };
									}
									return state;
								});
							}

							// Check if job is completed
							if (jobStatus.status === 'completed' || jobStatus.status === 'failed') {
								finalResult = jobStatus;
								shouldContinuePolling = false;
								break;
							}

							// Check if polling was cancelled
							const currentState = get();
							if (!currentState.isPlanPolling) {
								shouldContinuePolling = false;
								break;
							}

							// Continue polling with 2-second intervals for better streaming
							attempts++;
							await new Promise(resolve => setTimeout(resolve, 2000));
						} else {
							throw new Error('Invalid response from job status endpoint');
						}
					} catch (error) {
						console.error('Error polling job status:', error);
						set(state => {
							// Only update if still polling
							if (state.isPlanPolling) {
								return {
									output: state.output + `❌ Polling error: ${error instanceof Error ? error.message : 'Unknown error'}\n`
								};
							}
							return state;
						});
						shouldContinuePolling = false;
						break;
					}
				}

				if (finalResult?.status === 'completed') {
					let planOutput = `\n✅ Terraform Plan Completed!\n\n`;

					// ✅ SAFE ACCESS: Check result type and properties
					if (finalResult?.result) {
						const result = finalResult.result;
						
						// Type guard to check if it's a detailed TerraformPlanResult
						if ('resourceSummary' in result) {
							const detailedResult = result as TerraformPlanResult;
							const resourceSummary = detailedResult.resourceSummary;
							const costEstimate = detailedResult.costEstimate;
							const modules = detailedResult.modules || [];
							const warnings = detailedResult.warnings || [];

							planOutput += `📊 Resource Summary:\n`;
							planOutput += `   Total Resources: ${resourceSummary?.totalResources || 0}\n`;

							// Safe access to resourceTypes with fallback
							if (resourceSummary?.resourceTypes) {
								Object.entries(resourceSummary.resourceTypes).forEach(([type, count]) => {
									planOutput += `   ${type}: ${count}\n`;
								});
							}

							// Safe access to cost estimate
							if (costEstimate) {
								planOutput += `\n💰 Cost Estimate:\n`;
								planOutput += `   Monthly Total: $${(costEstimate.monthlyEstimate || 0).toFixed(2)}\n`;

								if (costEstimate.breakdown) {
									Object.entries(costEstimate.breakdown).forEach(([resource, cost]) => {
										planOutput += `   ${resource}: $${((cost as number) || 0).toFixed(2)}\n`;
									});
								}
							}

							// Safe access to modules
							if (modules && modules.length > 0) {
								planOutput += `\n📦 Modules:\n`;
								modules.forEach((module: { name: string; source: string }) => {
									planOutput += `   ${module.name}: ${module.source}\n`;
								});
							}

							// Safe access to warnings
							if (warnings && warnings.length > 0) {
								planOutput += `\n⚠️ Warnings:\n`;
								warnings.forEach((warning: string) => {
									planOutput += `   • ${warning}\n`;
								});
							}
						} else if ('success' in result) {
							// Simple job result from async plan
							const simpleResult = result as SimpleJobResult;
							planOutput += `📄 Plan Status: ${simpleResult.success ? 'SUCCESS' : 'FAILED'}\n`;
							planOutput += `💬 Message: ${simpleResult.message}\n`;
							planOutput += `📊 Output Lines: ${simpleResult.outputLines}\n`;
						}
					} else {
						// If no result, just show simple completion message
						planOutput += `📄 Plan completed successfully.\n`;
						planOutput += `✅ No detailed summary available, but plan execution was successful.\n`;
					}

					// Show raw terraform output if available
					if (finalResult?.rawOutput) {
						planOutput += `\n📄 Full Terraform Output:\n`;
						planOutput += `${finalResult.rawOutput}\n`;
					}

					set({
						output: get().output + planOutput,
						planResult: (finalResult?.result && 'resourceSummary' in finalResult.result) ? finalResult.result as TerraformPlanResult : null
					});
				} else if (finalResult?.status === 'failed') {
					set({ output: `❌ Plan Failed: ${finalResult.error || "Unknown error"}` });
				} else if (!finalResult) {
					set({ output: `⏰ Plan timeout: Job took longer than expected or was cancelled` });
				}
			} else {
				throw new Error(result.error || 'Failed to start plan job');
			}
		} catch (error) {
			let errorOutput = '';
			if (error instanceof Error) {
				if (error.message.includes('Failed to fetch')) {
					errorOutput = `❌ Cannot connect to backend server\n\nPlease ensure:\n• Backend server is running on ${BACKEND_URL}\n• No CORS issues\n• Server is accessible`;
				} else {
					errorOutput = `❌ Plan Error: ${error.message}`;
				}
			} else {
				errorOutput = '❌ Unknown error occurred while planning Terraform';
			}
			set({ output: errorOutput });
		} finally {
			set({
				isPlanning: false,
				isPlanPolling: false,
				currentJobId: null
			});
		}
	},

	// Quick plan (sync, no terraform init)
	quickPlan: async (data: unknown, projectName: string) => {
		if (!data) {
			set({ output: '❌ No architecture data available. Please create some resources first.' });
			return;
		}

		const archData = data as { nodes?: Array<unknown>; [key: string]: unknown };
		if (!archData.nodes || archData.nodes.length === 0) {
			set({ output: '❌ No resources found in your architecture. Please add some AWS resources first.' });
			return;
		}

		set({ isPlanning: true, output: "🔄 Generating quick plan preview...\n" });

		try {
			const response = await fetch(`${BACKEND_URL}/api/terraform/plan`, {
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

			if (result.success && result.data) {
				const { resourceSummary, costEstimate, modules, warnings } = result.data;

				let planOutput = `✅ Quick Plan Preview\n\n`;
				planOutput += `📊 Resource Summary:\n`;
				planOutput += `   Total Resources: ${resourceSummary.totalResources}\n`;

				Object.entries(resourceSummary.resourceTypes).forEach(([type, count]) => {
					planOutput += `   ${type}: ${count}\n`;
				});

				planOutput += `\n💰 Cost Estimate:\n`;
				planOutput += `   Monthly Total: $${costEstimate.monthlyEstimate.toFixed(2)}\n`;

				Object.entries(costEstimate.breakdown).forEach(([resource, cost]) => {
					planOutput += `   ${resource}: $${(cost as number).toFixed(2)}\n`;
				});

				if (modules.length > 0) {
					planOutput += `\n📦 Modules:\n`;
					modules.forEach((module: { name: string; source: string }) => {
						planOutput += `   ${module.name}: ${module.source}\n`;
					});
				}

				if (warnings.length > 0) {
					planOutput += `\n⚠️ Warnings:\n`;
					warnings.forEach((warning: string) => {
						planOutput += `   • ${warning}\n`;
					});
				}

				planOutput += `\n💡 Note: This is a quick preview. Use "Full Plan" for complete terraform init validation.`;

				set({
					output: planOutput,
					planResult: result.data
				});
			} else {
				throw new Error(result.error || 'Failed to generate plan');
			}
		} catch (error) {
			let errorOutput = '';
			if (error instanceof Error) {
				if (error.message.includes('Failed to fetch')) {
					errorOutput = `❌ Cannot connect to backend server\n\nPlease ensure:\n• Backend server is running on ${BACKEND_URL}\n• No CORS issues\n• Server is accessible`;
				} else {
					errorOutput = `❌ Quick Plan Error: ${error.message}`;
				}
			} else {
				errorOutput = '❌ Unknown error occurred during quick plan';
			}
			set({ output: errorOutput });
		} finally {
			set({ isPlanning: false });
		}
	},

	// Simplified polling - removed standalone method to avoid recursive calls
}));

// Create stable selectors with shallow equality comparison
const dialogSelector = (state: TerraformState) => ({
	isOpen: state.isDialogOpen,
	openDialog: state.openDialog,
	closeDialog: state.closeDialog,
});

const outputSelector = (state: TerraformState) => ({
	output: state.output,
	appendOutput: state.appendOutput,
	setOutput: state.setOutput,
	clearOutput: state.clearOutput,
});

const generationSelector = (state: TerraformState) => ({
	isGenerating: state.isGenerating,
	generateTerraform: state.generateTerraform,
	history: state.generationHistory,
});

const downloadSelector = (state: TerraformState) => ({
	isDownloading: state.isDownloading,
	latestProject: state.latestProject,
	downloadZip: state.downloadZip,
});

const planSelector = (state: TerraformState) => ({
	isPlanning: state.isPlanning,
	isPlanPolling: state.isPlanPolling,
	planResult: state.planResult,
	currentJobId: state.currentJobId,
	planTerraform: state.planTerraform,
	quickPlan: state.quickPlan,
});

// Export hooks with stable selectors
export const useTerraformDialog = () => useTerraformStore(dialogSelector);
export const useTerraformOutput = () => useTerraformStore(outputSelector);
export const useTerraformGeneration = () => useTerraformStore(generationSelector);
export const useTerraformDownload = () => useTerraformStore(downloadSelector);
export const useTerraformPlan = () => useTerraformStore(planSelector);
