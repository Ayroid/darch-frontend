import type { Project } from "./TopBar";
import { useArchitectureData } from "@/hooks/use-architecture-data";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTerraformStore } from "@/lib/stores/terraform/terraform-store";
import {
	FiCode,
	FiCheck,
	FiDownload,
	FiFileText,
	FiTrash2,
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

	const clearOutput = useTerraformStore((state) => state.clearOutput);
	const generateTerraform = useTerraformStore(
		(state) => state.generateTerraform
	);
	const downloadZip = useTerraformStore((state) => state.downloadZip);
	const planTerraform = useTerraformStore((state) => state.planTerraform);

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

	// Handle Plan Terraform (Full plan with terraform init)
	const handlePlanTerraform = async () => {
		if (!currentData) {
			return;
		}

		const projectName = currentProject.name.toLowerCase().replace(/\s+/g, "-");
		await planTerraform(currentData, projectName);
	};

	// Handle Clear Output
	const handleClearOutput = () => {
		clearOutput();
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

					{/* Action Buttons */}
					<div className="grid grid-cols-3 gap-4">
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

						<Button
							onClick={handlePlanTerraform}
							disabled={isDownloading || !latestProject}
							variant="outline"
							className="h-16 flex-col space-y-1 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700"
						>
							<FiCheck className="w-5 h-5" />
							<span className="text-sm">
								{isPlanning ? "Planning..." : "Plan"}
							</span>
						</Button>
					</div>

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
