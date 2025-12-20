import { create } from 'zustand';

// Get backend URL from environment variable with fallback
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Types - Updated to match API guide specifications
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

// Detailed plan result (from completed jobs)
interface TerraformPlanResult {
	resourceSummary: { totalResources: number; resourceTypes: Record<string, number> };
	costEstimate: { monthlyEstimate: number; breakdown: Record<string, number> };
	modules: Array<{ name: string; source: string }>;
	warnings: string[];
	terraformInitialized?: boolean;
}

// Simple job result (from async endpoints)
interface SimpleJobResult {
	success: boolean;
	message: string;
	outputLines: number;
}

// Job status response format - matches API guide exactly
interface TerraformJobStatus {
	id: string; // Using 'id' to match API guide format
	status: 'pending' | 'running' | 'completed' | 'failed';
	progress: number; // Always present as percentage 0-100
	message: string; // Always present
	createdAt: string;
	updatedAt: string;
	logs: string[]; // Always present, may be empty array
	result?: TerraformPlanResult | SimpleJobResult | null;
	error?: string | null;
	rawOutput?: string;
}

interface TerraformState {
	// UI State
	isDialogOpen: boolean;
	isGenerating: boolean;
	isDownloading: boolean;
	isPlanning: boolean;
	isApplying: boolean;
	isDestroying: boolean;

	// Polling State
	isPlanPolling: boolean;
	isApplyPolling: boolean;
	isDestroyPolling: boolean;

	// Job Management
	currentJob: TerraformJobStatus | null;
	pollInterval: NodeJS.Timeout | null;

	// Output and Results
	output: string;
	generationHistory: TerraformGenerationResult[];
	latestProject: BackendProject | null;
	planResult: TerraformPlanResult | null;

	// Error Handling
	lastError: string | null;
	networkError: boolean;

	// Actions - Basic setters
	setDialogOpen: (open: boolean) => void;
	setGenerating: (generating: boolean) => void;
	setDownloading: (downloading: boolean) => void;
	setPlanning: (planning: boolean) => void;
	setApplying: (applying: boolean) => void;
	setDestroying: (destroying: boolean) => void;
	setPollInterval: (interval: NodeJS.Timeout | null) => void;

	// Output management
	appendOutput: (text: string) => void;
	setOutput: (text: string) => void;
	clearOutput: () => void;

	// Error management
	setError: (error: string | null) => void;
	setNetworkError: (hasError: boolean) => void;
	clearErrors: () => void;

	// Job and result management
	setCurrentJob: (job: TerraformJobStatus | null) => void;
	addGenerationResult: (result: TerraformGenerationResult) => void;
	setLatestProject: (project: BackendProject | null) => void;
	setPlanResult: (result: TerraformPlanResult | null) => void;

	// Complex operations
	openDialog: () => void;
	closeDialog: () => void;
	reset: () => void;
	cancelOperation: () => void;

	// API operations - matching guide specifications
	generateTerraform: (data: unknown, projectName: string) => Promise<void>;
	planTerraform: (data: unknown, projectName: string) => Promise<void>;
	applyTerraform: (data: unknown, projectName: string) => Promise<void>;
	destroyTerraform: (projectName: string) => Promise<void>;
	downloadZip: () => Promise<void>;
	fetchLatestProject: () => Promise<void>;

	// Polling operations
	startPolling: (jobId: string, operation: 'plan' | 'apply' | 'destroy') => Promise<void>;
	stopPolling: () => void;
}

const initialState = {
	isDialogOpen: false,
	isGenerating: false,
	isDownloading: false,
	isPlanning: false,
	isApplying: false,
	isDestroying: false,
	isPlanPolling: false,
	isApplyPolling: false,
	isDestroyPolling: false,
	currentJob: null,
	pollInterval: null,
	output: "",
	generationHistory: [],
	latestProject: null,
	planResult: null,
	lastError: null,
	networkError: false,
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
	setApplying: (applying: boolean) => set({ isApplying: applying }),
	setDestroying: (destroying: boolean) => set({ isDestroying: destroying }),
	setPollInterval: (interval: NodeJS.Timeout | null) => set({ pollInterval: interval }),

	// Output management
	appendOutput: (text: string) => set((state) => ({ output: state.output + text })),
	setOutput: (text: string) => set({ output: text }),
	clearOutput: () => set({ output: "", latestProject: null }),

	// Error management
	setError: (error: string | null) => set({ lastError: error }),
	setNetworkError: (hasError: boolean) => set({ networkError: hasError }),
	clearErrors: () => set({ lastError: null, networkError: false }),

	// Job and result management
	setCurrentJob: (job: TerraformJobStatus | null) => set({ currentJob: job }),
	addGenerationResult: (result: TerraformGenerationResult) => set((state) => ({
		generationHistory: [result, ...state.generationHistory].slice(0, 10),
	})),
	setLatestProject: (project: BackendProject | null) => set({ latestProject: project }),
	setPlanResult: (result: TerraformPlanResult | null) => set({ planResult: result }),

	// Complex operations
	openDialog: () => {
		set({ isDialogOpen: true });
	},

	closeDialog: () => {
		const { pollInterval } = get();
		if (pollInterval) {
			clearInterval(pollInterval);
		}
		set({
			isDialogOpen: false,
			isPlanPolling: false,
			isApplyPolling: false,
			isDestroyPolling: false,
			isPlanning: false,
			isApplying: false,
			isDestroying: false,
			currentJob: null,
			pollInterval: null
		});
	},

	cancelOperation: () => {
		const { pollInterval } = get();
		if (pollInterval) {
			clearInterval(pollInterval);
		}
		set({
			isPlanPolling: false,
			isApplyPolling: false,
			isDestroyPolling: false,
			isPlanning: false,
			isApplying: false,
			isDestroying: false,
			currentJob: null,
			pollInterval: null
		});
	},

	stopPolling: () => {
		const { pollInterval } = get();
		if (pollInterval) {
			clearInterval(pollInterval);
		}
		set({
			isPlanPolling: false,
			isApplyPolling: false,
			isDestroyPolling: false,
			pollInterval: null
		});
	},

	reset: () => {
		const { pollInterval } = get();
		if (pollInterval) {
			clearInterval(pollInterval);
		}
		set({
			...initialState,
			isDialogOpen: get().isDialogOpen, // Keep dialog state
		});
	},

	// Polling operations - following API guide specifications
	startPolling: async (jobId: string, operation: 'plan' | 'apply' | 'destroy') => {
		const statusEndpoint = `${BACKEND_URL}/api/terraform/${operation}-status/${jobId}`;
		let attempts = 0;
		const maxAttempts = 180; // 6 minutes with 2-second intervals
		let lastLogCount = 0;

		// Set polling state
		const pollingField = `is${operation.charAt(0).toUpperCase() + operation.slice(1)}Polling` as 'isPlanPolling' | 'isApplyPolling' | 'isDestroyPolling';
		set({ [pollingField]: true });

		let consecutiveErrors = 0;

		const pollInterval = setInterval(async () => {
			attempts++;

			try {
				const response = await fetch(statusEndpoint);

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}

				const result = await response.json();

				if (result.success && result.data) {
					const jobStatus: TerraformJobStatus = result.data;

					// Reset error counter on successful response
					consecutiveErrors = 0;

					// Update current job
					set({ currentJob: jobStatus });

					// Stream new logs (avoid duplicates)
					if (jobStatus.logs && jobStatus.logs.length > lastLogCount) {
						const newLogs = jobStatus.logs.slice(lastLogCount);
						set(state => ({
							output: state.output + newLogs.join('\n') + '\n'
						}));
						lastLogCount = jobStatus.logs.length;
					}

					// Update progress message (avoid duplicates)
					if (jobStatus.message && jobStatus.progress !== undefined) {
						set(state => {
							// Only add progress message if it's different from the last one
							const lastLine = state.output.split('\n').pop() || '';
							const newProgressMessage = `⏳ ${jobStatus.message} (${jobStatus.progress}%)`;

							if (!lastLine.includes(newProgressMessage)) {
								return { output: state.output + newProgressMessage + '\n' };
							}
							return state;
						});
					}

					// Check completion
					if (jobStatus.status === 'completed' || jobStatus.status === 'failed') {
						get().stopPolling();

						if (jobStatus.status === 'completed') {
							set(state => ({
								output: state.output + `\n✅ ${operation.charAt(0).toUpperCase() + operation.slice(1)} completed successfully!\n`,
								planResult: operation === 'plan' && jobStatus.result && 'resourceSummary' in jobStatus.result ? jobStatus.result as TerraformPlanResult : state.planResult
							}));
						} else {
							set(state => ({
								output: state.output + `\n❌ ${operation.charAt(0).toUpperCase() + operation.slice(1)} failed: ${jobStatus.error || 'Unknown error'}\n`,
								lastError: jobStatus.error || 'Unknown error'
							}));
						}

						// Update operation state
						const operationField = `is${operation.charAt(0).toUpperCase() + operation.slice(1)}ing` as 'isPlanning' | 'isApplying' | 'isDestroying';
						set({ [operationField]: false });
						return;
					}
				}

				// Check if polling was cancelled
				const currentState = get();
				const isPolling = currentState[pollingField];
				if (!isPolling) {
					clearInterval(pollInterval);
					return;
				}

			} catch (error) {
				console.error('Polling error:', error);
				consecutiveErrors++;

				// Only stop polling after multiple consecutive errors
				if (consecutiveErrors >= 5) {
					set(state => ({
						output: state.output + `\n❌ Polling failed after multiple retries: ${error instanceof Error ? error.message : 'Unknown error'}\n`,
						lastError: error instanceof Error ? error.message : 'Unknown error',
						networkError: true
					}));

					get().stopPolling();
					const operationField = `is${operation.charAt(0).toUpperCase() + operation.slice(1)}ing` as 'isPlanning' | 'isApplying' | 'isDestroying';
					set({ [operationField]: false });
					return;
				}

				// For temporary errors, just log and continue
				console.warn(`Polling attempt ${attempts} failed, retrying... (${consecutiveErrors}/5 consecutive errors)`);
			}

			// Check for timeout
			if (attempts >= maxAttempts) {
				get().stopPolling();
				const currentState = get();
				const isPolling = currentState[pollingField];

				if (!isPolling) {
					set(state => ({
						output: state.output + `\n🚫 ${operation.charAt(0).toUpperCase() + operation.slice(1)} operation was cancelled by user\n`
					}));
				} else {
					set(state => ({
						output: state.output + `\n⏰ ${operation.charAt(0).toUpperCase() + operation.slice(1)} operation timed out after ${Math.round(maxAttempts * 2 / 60)} minutes. The job may still be running on the server.\n`
					}));
				}

				const operationField = `is${operation.charAt(0).toUpperCase() + operation.slice(1)}ing` as 'isPlanning' | 'isApplying' | 'isDestroying';
				set({ [operationField]: false });
			}
		}, 2000);

		set({ pollInterval });
	},

	// API operations - matching guide specifications exactly
	generateTerraform: async (data: unknown, projectName: string) => {
		if (!data) {
			set({ output: '❌ No architecture data available. Please create some resources first.' });
			return;
		}

		// Architecture data with resources array
		const archData = data as { resources?: Array<unknown>; [key: string]: unknown };
		const resourceList = archData.resources as Array<unknown> | undefined;
		if (!resourceList || resourceList.length === 0) {
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

		// Architecture data with resources array
		const archData = data as { resources?: Array<unknown>; [key: string]: unknown };
		const resourceList = archData.resources as Array<unknown> | undefined;
		if (!resourceList || resourceList.length === 0) {
			set({ output: '❌ No resources found in your architecture. Please add some AWS resources first.' });
			return;
		}

		set({ isPlanning: true, output: "🔄 Starting Terraform plan generation...\n" });

		try {
			// Start async plan job
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

			if (result.success && result.data.jobId) {
				const jobId = result.data.jobId;
				set({
					currentJob: { id: jobId, status: 'pending', progress: 0, message: 'Starting...', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), logs: [] },
					output: `🔄 Plan job started (ID: ${jobId})\n⏱️ Estimated duration: ${result.data.estimatedDuration || 30} seconds\n\n`
				});

				// Simple polling - just send requests every 2 seconds
				let finalResult: TerraformJobStatus | null = null;
				const maxAttempts = 180; // 6 minutes
				let attempts = 0;

				while (attempts < maxAttempts) {
					try {
						const response = await fetch(`${BACKEND_URL}/api/terraform/plan-status/${jobId}`);

						if (response.ok) {
							const result = await response.json();

							if (result.success && result.data) {
								const jobStatus: TerraformJobStatus & { logs?: string[]; message?: string; rawOutput?: string } = result.data;

								// Display new logs
								if (jobStatus.logs && Array.isArray(jobStatus.logs)) {
									const logOutput = jobStatus.logs.join('\n') + '\n';
									set({ output: logOutput });
								}

								// Check if job is completed
								if (jobStatus.status === 'completed' || jobStatus.status === 'failed') {
									finalResult = jobStatus;
									break;
								}
							}
						}
					} catch (error) {
						console.error('Polling error:', error);
					}

					attempts++;
					await new Promise(resolve => setTimeout(resolve, 2000));
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
				} else {
					set({ output: `⏰ Plan timed out after 6 minutes` });
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
				currentJob: null
			});
		}
	},

	// Apply Terraform - following API guide specifications
	applyTerraform: async (data: unknown, projectName: string) => {
		if (!data) {
			set({ output: '❌ No architecture data available. Please create some resources first.' });
			return;
		}

		// Architecture data with resources array
		const archData = data as { resources?: Array<unknown>; [key: string]: unknown };
		const resourceList = archData.resources as Array<unknown> | undefined;
		if (!resourceList || resourceList.length === 0) {
			set({ output: '❌ No resources found in your architecture. Please add some AWS resources first.' });
			return;
		}

		set({ isApplying: true, output: "🔄 Starting Terraform apply...\n" });

		try {
			const response = await fetch(`${BACKEND_URL}/api/terraform/apply`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					projectName: projectName.toLowerCase().replace(/\s+/g, '-'),
					architectureData: data
				})
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const result = await response.json();

			if (result.success && result.data.jobId) {
				const jobId = result.data.jobId;
				set({
					currentJob: { id: jobId, status: 'pending', progress: 0, message: 'Starting apply...', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), logs: [] },
					output: `🔄 Apply job started (ID: ${jobId})\n⏱️ Estimated duration: ${result.data.estimatedDuration || 180} seconds\n\n`
				});

				// Start polling
				get().startPolling(jobId, 'apply');
			} else {
				throw new Error(result.error || 'Failed to start apply job');
			}
		} catch (error) {
			let errorOutput = '';
			if (error instanceof Error) {
				if (error.message.includes('Failed to fetch')) {
					errorOutput = `❌ Cannot connect to backend server\n\nPlease ensure:\n• Backend server is running on ${BACKEND_URL}\n• No CORS issues\n• Server is accessible`;
				} else {
					errorOutput = `❌ Apply Error: ${error.message}`;
				}
			} else {
				errorOutput = '❌ Unknown error occurred while applying Terraform';
			}
			set({ output: errorOutput, lastError: errorOutput, networkError: true });
		} finally {
			set({ isApplying: false });
		}
	},

	// Destroy Terraform - following API guide specifications
	destroyTerraform: async (projectName: string) => {
		set({ isDestroying: true, output: "🔄 Starting Terraform destroy...\n" });

		try {
			const response = await fetch(`${BACKEND_URL}/api/terraform/destroy`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
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
					currentJob: { id: jobId, status: 'pending', progress: 0, message: 'Starting destroy...', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), logs: [] },
					output: `🔄 Destroy job started (ID: ${jobId})\n⏱️ Estimated duration: ${result.data.estimatedDuration || 120} seconds\n\n`
				});

				// Start polling
				get().startPolling(jobId, 'destroy');
			} else {
				throw new Error(result.error || 'Failed to start destroy job');
			}
		} catch (error) {
			let errorOutput = '';
			if (error instanceof Error) {
				if (error.message.includes('Failed to fetch')) {
					errorOutput = `❌ Cannot connect to backend server\n\nPlease ensure:\n• Backend server is running on ${BACKEND_URL}\n• No CORS issues\n• Server is accessible`;
				} else {
					errorOutput = `❌ Destroy Error: ${error.message}`;
				}
			} else {
				errorOutput = '❌ Unknown error occurred while destroying Terraform';
			}
			set({ output: errorOutput, lastError: errorOutput, networkError: true });
		} finally {
			set({ isDestroying: false });
		}
	},
}));

// Create stable selectors with shallow equality comparison to prevent infinite loops
// These selectors are defined outside of any component to ensure stable references
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



// Export hooks with stable selectors following API guide recommendations
export const useTerraformDialog = () => useTerraformStore(dialogSelector);
export const useTerraformOutput = () => useTerraformStore(outputSelector);
export const useTerraformGeneration = () => useTerraformStore(generationSelector);
export const useTerraformDownload = () => useTerraformStore(downloadSelector);

// Fixed operations selector to prevent SSR hydration issues
export const useTerraformOperations = () => {
	const isPlanning = useTerraformStore(state => state.isPlanning);
	const isPlanPolling = useTerraformStore(state => state.isPlanPolling);
	const planResult = useTerraformStore(state => state.planResult);
	const planTerraform = useTerraformStore(state => state.planTerraform);

	const isApplying = useTerraformStore(state => state.isApplying);
	const isApplyPolling = useTerraformStore(state => state.isApplyPolling);
	const applyTerraform = useTerraformStore(state => state.applyTerraform);

	const isDestroying = useTerraformStore(state => state.isDestroying);
	const isDestroyPolling = useTerraformStore(state => state.isDestroyPolling);
	const destroyTerraform = useTerraformStore(state => state.destroyTerraform);

	const currentJob = useTerraformStore(state => state.currentJob);
	const cancelOperation = useTerraformStore(state => state.cancelOperation);

	const lastError = useTerraformStore(state => state.lastError);
	const networkError = useTerraformStore(state => state.networkError);
	const clearErrors = useTerraformStore(state => state.clearErrors);

	return {
		// Plan operations
		isPlanning,
		isPlanPolling,
		planResult,
		planTerraform,

		// Apply operations
		isApplying,
		isApplyPolling,
		applyTerraform,

		// Destroy operations
		isDestroying,
		isDestroyPolling,
		destroyTerraform,

		// Job management
		currentJob,
		cancelOperation,

		// Error handling
		lastError,
		networkError,
		clearErrors,
	};
};