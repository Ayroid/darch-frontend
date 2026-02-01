"use client";

import { useRouter } from "next/navigation";
import { Server, Layers, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Badge } from "@/app/_components/ui/badge";
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
	{
		id: "single-ec2-instance",
		name: "Single EC2 Instance",
		description: "Minimal setup with just an EC2 instance for learning",
		icon: <Server className="h-6 w-6" />,
		difficulty: "Beginner",
		services: ["VPC", "EC2"],
		filename: "single-ec2-instance.json",
	},
];

const getDifficultyStyles = (difficulty: string) => {
	switch (difficulty) {
		case "Beginner":
			return "bg-green-500/10 text-green-600 border-green-500/20";
		case "Intermediate":
			return "bg-amber-500/10 text-amber-600 border-amber-500/20";
		case "Advanced":
			return "bg-red-500/10 text-red-600 border-red-500/20";
		default:
			return "bg-muted text-muted-foreground";
	}
};

export default function ArchitectureTemplates() {
	const router = useRouter();
	const { loadFromJSON } = useArchitectureData();

	const handleTemplateClick = async (template: Template) => {
		try {
			const response = await fetch(`/templates/${template.filename}`);
			if (!response.ok) {
				throw new Error(`Failed to load template: ${response.statusText}`);
			}

			const templateData = await response.json();
			loadFromJSON(templateData);
			router.push("/designer");
		} catch (error) {
			console.error("Error loading template:", error);
			alert("Failed to load template. Please try again.");
		}
	};

	return (
		<Card className="h-full flex flex-col">
			<CardHeader className="border-b border-border pb-4">
				<CardTitle className="text-lg">Architecture Templates</CardTitle>
				<CardAction>
					<Button variant="outline" onClick={() => router.push("/designer")} className="gap-2">
						<Layers className="h-4 w-4" />
						Start from scratch
					</Button>
				</CardAction>
			</CardHeader>

			<CardContent className="flex-1 pt-6">
				<div className="grid grid-cols-2 gap-4">
					{templates.map((template) => (
						<button
							key={template.id}
							onClick={() => handleTemplateClick(template)}
							className="group text-left"
						>
							<div className="border border-border rounded-lg p-5 hover:border-primary/50 hover:shadow-md transition-all duration-200 bg-card h-full">
								{/* Template Preview */}
								<div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg h-36 mb-4 flex items-center justify-center border border-primary/10 relative overflow-hidden">
									<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),transparent)]" />
									<div className="text-center relative z-10">
										<div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 text-primary group-hover:scale-110 transition-transform duration-200">
											{template.icon}
										</div>
										<span className="text-sm font-medium text-foreground">
											{template.name}
										</span>
									</div>
								</div>

								{/* Card Info */}
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
											{template.name}
										</h3>
										<ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
									</div>

									<p className="text-sm text-muted-foreground line-clamp-2">
										{template.description}
									</p>

									<div className="flex items-center gap-2">
										<Badge className={getDifficultyStyles(template.difficulty)}>
											{template.difficulty}
										</Badge>
									</div>

									<div className="flex flex-wrap gap-1.5 pt-1">
										{template.services.map((service) => (
											<Badge
												key={service}
												variant="outline"
												className="text-xs font-normal"
											>
												{service}
											</Badge>
										))}
									</div>
								</div>
							</div>
						</button>
					))}

					{/* More Templates Coming Soon */}
					<div className="border border-dashed border-border rounded-lg p-5 flex flex-col items-center justify-center min-h-[280px] bg-muted/20">
						<div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
							<Layers className="h-6 w-6 text-muted-foreground" />
						</div>
						<p className="text-sm font-medium text-muted-foreground text-center">
							More templates coming soon
						</p>
						<p className="text-xs text-muted-foreground mt-1 text-center">
							We&apos;re adding new architecture patterns
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
