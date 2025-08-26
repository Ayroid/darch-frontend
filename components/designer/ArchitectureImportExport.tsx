/**
 * Architecture Import/Export Controls
 */

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useArchitectureData } from "@/hooks/use-architecture-data";
import { Node, Edge } from "@xyflow/react";
import {
	ArrowDownTrayIcon,
	DocumentIcon,
	ClipboardDocumentIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";

interface ArchitectureImportExportProps {
	onDataLoaded?: (nodes: Node[], edges: Edge[]) => void;
	className?: string;
}

export default function ArchitectureImportExport({
	onDataLoaded,
	className = "",
}: ArchitectureImportExportProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const jsonButtonRef = useRef<HTMLButtonElement>(null);
	const [isJsonDialogOpen, setIsJsonDialogOpen] = useState(false);
	const [jsonData, setJsonData] = useState<string>("");
	const { exportToJSON, saveToFile, loadFromFile, currentData } =
		useArchitectureData();

	const handleToggleJsonDialog = () => {
		if (!isJsonDialogOpen) {
			const data = exportToJSON();
			if (data) {
				// Pretty print JSON and show in dialog
				const jsonString = JSON.stringify(data, null, 2);
				setJsonData(jsonString);
			}
		}
		setIsJsonDialogOpen(!isJsonDialogOpen);
	};

	// Update JSON data in real time when dialog is open
	useEffect(() => {
		if (isJsonDialogOpen && currentData) {
			const data = exportToJSON();
			if (data) {
				const jsonString = JSON.stringify(data, null, 2);
				setJsonData(jsonString);
			}
		}
	}, [currentData, isJsonDialogOpen, exportToJSON]);

	const handleCopyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(jsonData);
			// You could add a toast notification here if you have one
			alert('JSON copied to clipboard!');
		} catch (error) {
			console.error('Failed to copy to clipboard:', error);
			alert('Failed to copy to clipboard');
		}
	};

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (file) {
			try {
				const { nodes, edges } = await loadFromFile(file);
				onDataLoaded?.(nodes, edges);
			} catch (error) {
				alert(
					"Failed to import file: " +
						(error instanceof Error ? error.message : "Unknown error")
				);
			}
		}
		// Reset input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<>
			<div className={`flex gap-2 ${className}`}>
				<input
					ref={fileInputRef}
					type="file"
					accept=".json"
					onChange={handleFileChange}
					className="hidden"
				/>

				<Button
					ref={jsonButtonRef}
					variant="outline"
					size="sm"
					onClick={handleToggleJsonDialog}
					className="flex items-center gap-2"
					disabled={!currentData}
				>
					<DocumentIcon className="w-4 h-4" />
					View JSON
				</Button>

				<Button
					variant="outline"
					size="sm"
					onClick={() => saveToFile()}
					className="flex items-center gap-2"
					disabled={!currentData}
				>
					<ArrowDownTrayIcon className="w-4 h-4" />
					Export
				</Button>

				<Button
					variant="outline"
					size="sm"
					onClick={() => fileInputRef.current?.click()}
					className="flex items-center gap-2"
				>
					<ArrowDownTrayIcon className="w-4 h-4" />
					Load JSON
				</Button>
			</div>

			{/* Floating JSON Dialog */}
			{isJsonDialogOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
					{/* Dialog */}
					<div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border max-w-2xl w-full max-h-[80vh] flex flex-col pointer-events-auto">
						{/* Header */}
						<div className="flex items-center justify-between p-4 border-b">
							<div>
								<h2 className="text-lg font-semibold">Architecture JSON</h2>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Copy the JSON data below to use it elsewhere.
								</p>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={handleToggleJsonDialog}
								className="p-2"
							>
								<XMarkIcon className="w-4 h-4" />
							</Button>
						</div>

						{/* Content */}
						<div className="flex-1 flex flex-col gap-4 p-4">
							<Button
								onClick={handleCopyToClipboard}
								className="flex items-center gap-2 self-start"
								variant="default"
							>
								<ClipboardDocumentIcon className="w-4 h-4" />
								Copy to Clipboard
							</Button>

							<div className="flex-1 overflow-hidden">
								<pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-auto h-full max-h-[50vh] text-sm font-mono whitespace-pre-wrap border">
									{jsonData}
								</pre>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
