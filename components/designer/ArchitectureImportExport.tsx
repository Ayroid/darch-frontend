/**
 * Architecture Import/Export Controls
 */

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useArchitectureData } from "@/hooks/use-architecture-data";
import { Node, Edge } from "@xyflow/react";
import {
	ArrowDownTrayIcon,
	ArrowUpTrayIcon,
	DocumentIcon,
	DocumentArrowDownIcon,
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
	const terraformInputRef = useRef<HTMLInputElement>(null);
	const { exportToJSON, saveToFile, loadFromFile, loadFromJSON, currentData } =
		useArchitectureData();

	const handleExportJSON = () => {
		const data = exportToJSON();
		if (data) {
			// Pretty print JSON and show in a new window for copying
			const jsonString = JSON.stringify(data, null, 2);
			const newWindow = window.open();
			if (newWindow) {
				newWindow.document.write(`
          <html>
            <head>
              <title>Architecture JSON</title>
              <style>
                body { font-family: monospace; padding: 20px; background: #f5f5f5; }
                pre { background: white; padding: 20px; border-radius: 8px; overflow: auto; }
                button {
                  margin-bottom: 20px;
                  padding: 10px 20px;
                  background: #007bff;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                }
                button:hover { background: #0056b3; }
              </style>
            </head>
            <body>
              <button onclick="navigator.clipboard.writeText(document.querySelector('pre').textContent); alert('Copied to clipboard!')">
                Copy to Clipboard
              </button>
              <pre>${jsonString}</pre>
            </body>
          </html>
        `);
			}
		}
	};

	const handleExportFile = () => {
		saveToFile();
	};

	const handleImportFile = () => {
		fileInputRef.current?.click();
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
		<div className={`flex gap-2 ${className}`}>
			<input
				ref={fileInputRef}
				type="file"
				accept=".json"
				onChange={handleFileChange}
				className="hidden"
			/>

			<Button
				variant="outline"
				size="sm"
				onClick={handleImportFile}
				className="flex items-center gap-2"
			>
				<ArrowUpTrayIcon className="w-4 h-4" />
				Import
			</Button>

			<Button
				variant="outline"
				size="sm"
				onClick={handleExportJSON}
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
				<DocumentArrowDownIcon className="w-4 h-4" />
				Save
			</Button>

			<Button
				variant="outline"
				size="sm"
				onClick={handleExportFile}
				className="flex items-center gap-2"
				disabled={!currentData}
			>
				<ArrowDownTrayIcon className="w-4 h-4" />
				Export
			</Button>
		</div>
	);
}
