/**
 * JSON Tree Viewer - Displays JSON in a hierarchical, collapsible format
 */

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface JsonTreeViewerProps {
	data: any;
	rootLabel?: string;
}

interface TreeNodeProps {
	value: any;
	keyName?: string;
	level?: number;
	isLast?: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({
	value,
	keyName,
	level = 0,
	isLast = true,
}) => {
	const [isExpanded, setIsExpanded] = useState(true); // Keep everything expanded by default

	const indent = level * 20;
	const isObject = value !== null && typeof value === "object";
	const isArray = Array.isArray(value);
	const isEmpty =
		isObject && (isArray ? value.length === 0 : Object.keys(value).length === 0);

	const getValueType = (val: any): string => {
		if (val === null) return "null";
		if (Array.isArray(val)) return "array";
		return typeof val;
	};

	const getValuePreview = (val: any): string => {
		if (val === null) return "null";
		if (val === undefined) return "undefined";
		if (typeof val === "string") return `"${val}"`;
		if (typeof val === "boolean") return val.toString();
		if (typeof val === "number") return val.toString();
		if (Array.isArray(val))
			return isEmpty ? "[]" : `Array(${val.length})`;
		if (typeof val === "object")
			return isEmpty ? "{}" : `Object(${Object.keys(val).length})`;
		return String(val);
	};

	const getTypeColor = (val: any): string => {
		const type = getValueType(val);
		switch (type) {
			case "string":
				return "text-green-600 dark:text-green-400";
			case "number":
				return "text-blue-600 dark:text-blue-400";
			case "boolean":
				return "text-purple-600 dark:text-purple-400";
			case "null":
				return "text-gray-500 dark:text-gray-400";
			case "array":
				return "text-orange-600 dark:text-orange-400";
			case "object":
				return "text-pink-600 dark:text-pink-400";
			default:
				return "text-gray-700 dark:text-gray-300";
		}
	};

	const renderValue = () => {
		if (!isObject || isEmpty) {
			return (
				<span className={`${getTypeColor(value)} font-mono text-sm`}>
					{getValuePreview(value)}
				</span>
			);
		}

		return null;
	};

	const toggleExpand = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isObject && !isEmpty) {
			setIsExpanded(!isExpanded);
		}
	};

	const renderChildren = () => {
		if (!isObject || isEmpty || !isExpanded) return null;

		if (isArray) {
			return (
				<div>
					{value.map((item: any, index: number) => (
						<TreeNode
							key={index}
							value={item}
							keyName={`[${index}]`}
							level={level + 1}
							isLast={index === value.length - 1}
						/>
					))}
				</div>
			);
		}

		const entries = Object.entries(value);
		return (
			<div>
				{entries.map(([key, val], index) => (
					<TreeNode
						key={key}
						value={val}
						keyName={key}
						level={level + 1}
						isLast={index === entries.length - 1}
					/>
				))}
			</div>
		);
	};

	return (
		<div className="font-mono text-sm">
			<div
				className={`flex items-start py-0.5 hover:bg-muted/50 rounded transition-colors ${
					isObject && !isEmpty ? "cursor-pointer" : ""
				}`}
				onClick={toggleExpand}
				style={{ paddingLeft: `${indent}px` }}
			>
				{/* Expand/Collapse Icon */}
				<div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
					{isObject && !isEmpty ? (
						isExpanded ? (
							<ChevronDown className="w-4 h-4 text-gray-400" />
						) : (
							<ChevronRight className="w-4 h-4 text-gray-400" />
						)
					) : (
						<span className="w-4 h-4 flex items-center justify-center text-gray-300">
							•
						</span>
					)}
				</div>

				{/* Key Name */}
				{keyName && (
					<>
						<span className="text-gray-700 dark:text-gray-300 font-semibold mr-2">
							{keyName}
						</span>
						<span className="text-gray-400 mr-2">:</span>
					</>
				)}

				{/* Value/Type Preview */}
				<div className="flex items-center gap-2 flex-1">
					{renderValue()}
					{isObject && !isEmpty && (
						<>
							<span className="text-gray-500 dark:text-gray-400">
								{isArray ? "[" : "{"}
							</span>
							{!isExpanded && (
								<span className="text-gray-400 text-xs">
									{isArray ? `${value.length} items` : `${Object.keys(value).length} properties`}
								</span>
							)}
							{!isExpanded && (
								<span className="text-gray-500 dark:text-gray-400">
									{isArray ? "]" : "}"}
								</span>
							)}
						</>
					)}
				</div>
			</div>

			{/* Children */}
			{renderChildren()}

			{/* Closing Bracket */}
			{isObject && !isEmpty && isExpanded && (
				<div
					className="text-gray-500 dark:text-gray-400 py-0.5"
					style={{ paddingLeft: `${indent + 20}px` }}
				>
					{isArray ? "]" : "}"}
				</div>
			)}
		</div>
	);
};

const JsonTreeViewer: React.FC<JsonTreeViewerProps> = ({
	data,
	rootLabel = "root",
}) => {
	return (
		<div className="bg-background border rounded-lg p-4 overflow-auto max-h-[60vh]">
			<TreeNode value={data} keyName={rootLabel} level={0} />
		</div>
	);
};

export default JsonTreeViewer;
