import type { Project } from "./TopBar";
import { useArchitectureData } from "@/hooks/use-architecture-data";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTerraformStore, useTerraformOperations } from "@/lib/stores/terraform/terraform-store";
import {
	FiCode,
	FiCheck,
	FiDownload,
	FiFileText,
	FiTrash2,
	FiPlay,
	FiAlertTriangle,
} from "react-icons/fi";
import { LuFileText } from "react-icons/lu";

interface TerraformDialogProps {
	currentProject: Project;
	isOpen: boolean;
	onClose: () => void;
	isGenerating: boolean;
	isDownloading: boolean;
	isPlanning: boolean;
	output: string;
	latestProject: {
		name: string;
		fileCount: number;
		size: number;
		createdAt: string;
	} | null;
	formatBytes: (bytes: number) => string;
}

const TerraformDialog: React.FC<TerraformDialogProps> = ({
	currentProject,
	isOpen,
	onClose,
	isGenerating,
	isDownloading,
	isPlanning,
	output,
	latestProject,
	formatBytes,
}) => {
	const { currentData } = useArchitectureData();

	// Store selectors - following the API guide patterns
	const clearOutput = useTerraformStore((state) => state.clearOutput);
	const generateTerraform = useTerraformStore((state) => state.generateTerraform);
	const downloadZip = useTerraformStore((state) => state.downloadZip);

	// Terraform operations following the API guide
	const {
		planTerraform,
		applyTerraform,
		destroyTerraform,
		isApplying,
		isDestroying,
		isApplyPolling,
		isDestroyPolling,
		currentJob,
		lastError,
		networkError,
		cancelOperation,
		clearErrors
	} = useTerraformOperations();

	// Handle Generate Terraform
	const handleGenerateTerraform = async () => {
		if (!currentData) {
			return;
		}

		const projectName = currentProject.name.toLowerCase().replace(/\s+/g, "-");
		await generateTerraform(currentData, projectName);
	};

	// Handle Download ZIP
	const handleDownloadZip = async () => {
		await downloadZip();
	};

	// Handle Plan Terraform - following API guide patterns
	const handlePlanTerraform = async () => {
		if (!currentData) {
			return;
		}

		clearErrors();
		const projectName = currentProject.name.toLowerCase().replace(/\s+/g, "-");
		await planTerraform(currentData, projectName);
	};

	// Handle Apply Terraform - following API guide patterns
	const handleApplyTerraform = async () => {
		if (!currentData) {
			return;
		}

		clearErrors();
		const projectName = currentProject.name.toLowerCase().replace(/\s+/g, "-");
		await applyTerraform(currentData, projectName);
	};

	// Handle Destroy Terraform - following API guide patterns
	const handleDestroyTerraform = async () => {
		if (!currentData) {
			return;
		}

		clearErrors();
		const projectName = currentProject.name.toLowerCase().replace(/\s+/g, "-");
		await destroyTerraform(projectName);
	};

	// Handle Cancel Operation
	const handleCancelOperation = () => {
		cancelOperation();
	};

	// Handle Clear Output
	const handleClearOutput = () => {
		clearOutput();
		clearErrors();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center space-x-3">
						<FiCode className="w-5 h-5" />
						<span>Terraform Management</span>
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Status Section */}
					{latestProject && (
						<div className="border border-gray-200 rounded-lg p-4">
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center space-x-2">
									<FiCheck className="w-4 h-4 text-gray-600" />
									<span className="font-medium text-gray-900">
										Project Ready
									</span>
								</div>
								<div className="text-sm text-gray-500">
									{latestProject.fileCount} files •{" "}
									{formatBytes(latestProject.size)} •{" "}
									{new Date(latestProject.createdAt).toLocaleDateString()}
								</div>
							</div>
							<div className="flex justify-between text-sm text-gray-500">
								<div>
									<div className="text-gray-500 text-sm">Name</div>
									<div className="font-mono text-xs truncate">
										{latestProject.name}
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Action Buttons - Following API Guide Layout */}
					<div className="grid grid-cols-2 gap-4 mb-4">
						<Button
							onClick={handleGenerateTerraform}
							disabled={isGenerating}
							variant="outline"
							className="h-16 flex-col space-y-1 border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-700"
						>
							<FiCode className="w-5 h-5" />
							<span className="text-sm">
								{isGenerating ? "Generating..." : "Generate"}
							</span>
						</Button>

						<Button
							onClick={handleDownloadZip}
							disabled={isDownloading || !latestProject}
							variant="outline"
							className="h-16 flex-col space-y-1 border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 hover:text-green-700"
						>
							<FiDownload className="w-5 h-5" />
							<span className="text-sm">
								{isDownloading ? "Downloading..." : "Download"}
							</span>
						</Button>
					</div>

					{/* Terraform Operations - Following API Guide Specifications */}
					<div className="grid grid-cols-3 gap-4">
						<Button
							onClick={handlePlanTerraform}
							disabled={isPlanning || !latestProject || isApplying || isDestroying}
							variant="outline"
							className="h-16 flex-col space-y-1 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700"
						>
							<FiCheck className="w-5 h-5" />
							<span className="text-sm">
								{isPlanning ? "Planning..." : "Plan"}
							</span>
						</Button>

						<Button
							onClick={handleApplyTerraform}
							disabled={isApplying || !latestProject || isPlanning || isDestroying}
							variant="outline"
							className="h-16 flex-col space-y-1 border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 hover:text-green-700"
						>
							<FiPlay className="w-5 h-5" />
							<span className="text-sm">
								{isApplying ? "Applying..." : "Apply"}
							</span>
						</Button>

						<Button
							onClick={handleDestroyTerraform}
							disabled={isDestroying || !latestProject || isPlanning || isApplying}
							variant="outline"
							className="h-16 flex-col space-y-1 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700"
						>
							<FiAlertTriangle className="w-5 h-5" />
							<span className="text-sm">
								{isDestroying ? "Destroying..." : "Destroy"}
							</span>
						</Button>
					</div>

					{/* Job Status Section - Following API Guide */}
					{currentJob && (
						<div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center space-x-2">
									<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
										currentJob.status === 'running' ? 'bg-blue-100 text-blue-800' :
										currentJob.status === 'completed' ? 'bg-green-100 text-green-800' :
										currentJob.status === 'failed' ? 'bg-red-100 text-red-800' :
										'bg-gray-100 text-gray-800'
									}`}>
										{currentJob.status.charAt(0).toUpperCase() + currentJob.status.slice(1)}
									</span>
									<span className="text-sm text-gray-600">Job ID: {currentJob.id}</span>
								</div>
								{(isApplyPolling || isDestroyPolling || (isPlanning && currentJob.status === 'running')) && (
									<Button
										onClick={handleCancelOperation}
										variant="outline"
										size="sm"
										className="text-red-600 border-red-300 hover:bg-red-50"
									>
										Cancel
									</Button>
								)}
							</div>
							<div className="mb-2">
								<div className="flex items-center justify-between text-sm">
									<span>{currentJob.message}</span>
									<span>{currentJob.progress}%</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2 mt-1">
									<div
										className={`h-2 rounded-full transition-width ${
											currentJob.status === 'completed' ? 'bg-green-500' :
											currentJob.status === 'failed' ? 'bg-red-500' :
											'bg-blue-500'
										}`}
										style={{ width: `${currentJob.progress}%` }}
									></div>
								</div>
							</div>
						</div>
					)}

					{/* Error Display - Following API Guide */}
					{(lastError || networkError) && (
						<div className="border border-red-200 rounded-lg p-4 bg-red-50">
							<div className="flex items-center justify-between mb-2">
								<h4 className="font-medium text-red-900 flex items-center">
									<FiAlertTriangle className="w-4 h-4 mr-2" />
									Error
								</h4>
								<Button
									onClick={() => clearErrors()}
									variant="outline"
									size="sm"
									className="text-red-600 border-red-300 hover:bg-red-100"
								>
									Dismiss
								</Button>
							</div>
							{lastError && (
								<p className="text-sm text-red-700 mb-2">{lastError}</p>
							)}
							{networkError && (
								<p className="text-sm text-red-600">
									Network connectivity issue. Please check your connection and try again.
								</p>
							)}
						</div>
					)}

					{/* Output Section */}
					{output ? (
						<div className="border border-gray-200 rounded-lg overflow-hidden">
							<div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<LuFileText className="w-4 h-4 text-gray-600" />
									<span className="font-medium text-gray-900">Output</span>
								</div>
								<Button
									onClick={() => {
										handleClearOutput();
									}}
									variant="outline"
									size="sm"
								>
									<FiTrash2 className="w-4 h-4 mr-1" />
									Clear
								</Button>
							</div>
							<div className="p-4">
								<pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
									{output}
								</pre>
							</div>
						</div>
					) : (
						<div className="border border-gray-200 rounded-lg p-8 text-center">
							<FiCode className="w-8 h-8 text-gray-400 mx-auto mb-4" />
							<h3 className="font-medium text-gray-900 mb-2">
								Generate Infrastructure Code
							</h3>
							<p className="text-sm text-gray-500 mb-4">
								Convert your architecture into Terraform configurations
							</p>
							<div className="flex justify-center space-x-6 text-xs text-gray-500">
								<span>1. Generate</span>
								<span>2. Review</span>
								<span>3. Download</span>
							</div>
						</div>
					)}

					{/* Footer */}
					<div className="flex justify-between pt-4 border-t border-gray-200">
						{output && (
							<Button
								onClick={() => navigator.clipboard.writeText(output)}
								variant="outline"
								size="sm"
							>
								<FiFileText className="w-4 h-4 mr-2" />
								Copy
							</Button>
						)}
						<div className="ml-auto">
							<Button variant="outline" onClick={onClose}>
								Close
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default TerraformDialog;
