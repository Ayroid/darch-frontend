/**
 * Architecture Import/Export Controls
 */

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/app/_components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/app/_components/ui/dialog";
import { useArchitectureData } from "@/lib/hooks/use-architecture-data";
import { Node, Edge } from "@xyflow/react";
import {
	FiDownload,
	FiFileText,
	FiClipboard,
} from "react-icons/fi";
import JsonTreeViewer from "./JsonTreeViewer";

interface ArchitectureImportExportProps {
	onDataLoaded?: (nodes: Node[], edges: Edge[]) => void;
	className?: string;
}

export default function ArchitectureImportExport({
	onDataLoaded,
	className = "",
}: ArchitectureImportExportProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
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
			alert("JSON copied to clipboard!");
		} catch (error) {
			console.error("Failed to copy to clipboard:", error);
			alert("Failed to copy to clipboard");
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

				<Dialog open={isJsonDialogOpen} onOpenChange={setIsJsonDialogOpen}>
					<DialogTrigger asChild>
						{/* <Button
							variant="outline"
							size="sm"
							onClick={handleToggleJsonDialog}
							className="flex items-center gap-2"
							disabled={!currentData}
						>
							<FiFileText className="w-4 h-4" />
							View JSON
						</Button> */}
						<button
							onClick={handleToggleJsonDialog}
							className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
							disabled={!currentData}
						>
							<FiFileText className="w-5 h-5" />
						</button>
					</DialogTrigger>
					<DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
						<DialogHeader>
							<DialogTitle>Architecture JSON</DialogTitle>
							<DialogDescription>
								Copy the JSON data below to use it elsewhere.
							</DialogDescription>
						</DialogHeader>

						{/* Content */}
						<div className="flex-1 flex flex-col gap-4">
							<div className="flex gap-4">
								<Button
									onClick={handleCopyToClipboard}
									className="flex items-center gap-2"
									variant="outline"
								>
									<FiClipboard className="w-4 h-4" />
									Copy to Clipboard
								</Button>

								<Button
									variant="outline"
									onClick={() => saveToFile()}
									className="flex items-center gap-2"
									disabled={!currentData}
								>
									<FiDownload className="w-4 h-4" />
									Export JSON
								</Button>

								<Button
									variant="outline"
									onClick={() => fileInputRef.current?.click()}
									className="flex items-center gap-2"
								>
									<FiDownload className="w-4 h-4" />
									Load JSON
								</Button>
							</div>

						<div className="flex-1 overflow-hidden">
							<JsonTreeViewer
								data={JSON.parse(jsonData)}
								rootLabel="architecture"
							/>
						</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</>
	);
}
