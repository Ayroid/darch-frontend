"use client";

import { Badge } from "@/app/_components/ui/badge";
import { FiServer } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useArchitectureData } from "@/lib/hooks/use-architecture-data";

interface Template {
	id: string;
	name: string;
	description: string;
	icon: React.ReactNode;
	difficulty: "Beginner" | "Intermediate" | "Advanced";
	services: string[];
	filename: string;
}

const templates: Template[] = [
	// {
	//   id: "simple-web-app",
	//   name: "Basic Web Setup",
	//   description: "Simple VPC with EC2 instance and security groups",
	//   icon: <FiGlobe className="w-6 h-6" />,
	//   difficulty: "Beginner",
	//   services: ["VPC", "EC2", "Security Group"],
	//   filename: "simple-web-app.json"
	// },
	// {
	//   id: "multi-tier-vpc",
	//   name: "Multi-Tier VPC",
	//   description: "VPC with public and private subnets across multiple AZs",
	//   icon: <FiServer className="w-6 h-6" />,
	//   difficulty: "Beginner",
	//   services: ["VPC", "Public Subnet", "Private Subnet", "Security Group"],
	//   filename: "multi-tier-vpc.json"
	// },
	// {
	//   id: "multi-az-setup",
	//   name: "Multi-AZ Infrastructure",
	//   description: "High availability setup across multiple availability zones",
	//   icon: <FiCloud className="w-6 h-6" />,
	//   difficulty: "Intermediate",
	//   services: ["Region", "AZ", "VPC", "EC2"],
	//   filename: "multi-az-setup.json"
	// },
	{
		id: "single-ec2-instance",
		name: "Single EC2 Instance",
		description: "Minimal setup with just an EC2 instance for learning",
		icon: <FiServer className="w-6 h-6" />,
		difficulty: "Beginner",
		services: ["VPC", "EC2"],
		filename: "single-ec2-instance.json",
	},
];

const getDifficultyColor = (difficulty: string) => {
	switch (difficulty) {
		case "Beginner":
			return "bg-green-100 text-green-800 hover:bg-green-200";
		case "Intermediate":
			return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
		case "Advanced":
			return "bg-red-100 text-red-800 hover:bg-red-200";
		default:
			return "bg-gray-100 text-gray-800 hover:bg-gray-200";
	}
};

export default function ArchitectureTemplates() {
	const router = useRouter();
	const { loadFromJSON } = useArchitectureData();

	const handleTemplateClick = async (template: Template) => {
		try {
			// Load the template JSON file
			const response = await fetch(`/templates/${template.filename}`);
			if (!response.ok) {
				throw new Error(`Failed to load template: ${response.statusText}`);
			}

			const templateData = await response.json();

			// Load the data into the store
			loadFromJSON(templateData);

			// Navigate to the designer with the loaded template
			router.push("/designer");
		} catch (error) {
			console.error("Error loading template:", error);
			alert("Failed to load template. Please try again.");
		}
	};

	return (
		<div className="rounded-lg shadow-sm border border-gray-200">
			<div className="p-6 border-b border-gray-200">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<h2 className="text-lg font-medium text-gray-900">
							Architecture Templates
						</h2>
					</div>
					<div className="flex items-center space-x-2">
						<button
							onClick={() => router.push("/designer")}
							className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2"
						>
							<span>➕</span>
							<span>Start from scratch</span>
						</button>
					</div>
				</div>
			</div>

			<div className="p-6">
				<div className="grid grid-cols-2 gap-6">
					{templates.map((template) => (
						<div
							key={template.id}
							onClick={() => handleTemplateClick(template)}
							className="group cursor-pointer"
						>
							<div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
								{/* Template Preview */}
								<div className="bg-gray-50 rounded-md h-40 mb-4 flex items-center justify-center">
									<div className="text-center">
										<div className="flex items-center justify-center mb-3">
											<div className="text-blue-600">{template.icon}</div>
										</div>
										<div className="text-sm text-gray-600 font-medium">
											{template.name}
										</div>
									</div>
								</div>

								{/* Card Info */}
								<div className="flex items-start space-x-3 mb-3">
									<span className="text-black text-lg">📐</span>
									<div className="flex-1 min-w-0">
										<h3 className="text-base font-medium text-gray-900 group-hover:text-black transition-colors">
											{template.name}
										</h3>
										<div className="flex items-center space-x-2 mt-2">
											<Badge
												className={getDifficultyColor(template.difficulty)}
											>
												{template.difficulty}
											</Badge>
										</div>
										<p className="text-sm text-gray-500 mt-2">
											{template.description}
										</p>
										<div className="flex flex-wrap gap-1 mt-3">
											{template.services.slice(0, 3).map((service) => (
												<Badge
													key={service}
													variant="outline"
													className="text-sm"
												>
													{service}
												</Badge>
											))}
											{template.services.length > 3 && (
												<Badge variant="outline" className="text-sm">
													+{template.services.length - 3}
												</Badge>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
