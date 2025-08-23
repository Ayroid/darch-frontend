"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
	ChevronDownIcon,
	CpuChipIcon,
	GlobeAltIcon,
	CircleStackIcon,
	ServerStackIcon,
	ShieldCheckIcon,
	CubeIcon,
	CogIcon,
	ChartBarIcon,
	BuildingOfficeIcon
} from "@heroicons/react/24/outline";

interface AWSService {
	id: string;
	name: string;
	icon: string;
	category: string;
	isContainer?: boolean;
}

// Define AWS services with their icons
const awsServices: AWSService[] = [
	// Infrastructure Components
	{
		id: "aws-region",
		name: "AWS Region",
		icon: "/aws_icons/Architecture-Group-Icons_07312025/AWS-Cloud_32.svg",
		category: "Infrastructure",
		isContainer: true,
	},
		{
		id: "aws-availability-zone",
		name: "Availability Zone",
		icon: "/aws_icons/Architecture-Group-Icons_07312025/Region_32.svg",
		category: "Infrastructure",
		isContainer: true,
	},
	{
		id: "aws-account",
		name: "AWS Account",
		icon: "/aws_icons/Architecture-Group-Icons_07312025/AWS-Account_32.svg",
		category: "Infrastructure",
		isContainer: true,
	},

	// Compute Services
	{
		id: "aws-ec2",
		name: "EC2",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Compute/32/Arch_Amazon-EC2_32.svg",
		category: "Compute",
	},
	{
		id: "aws-lambda",
		name: "Lambda",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Compute/32/Arch_AWS-Lambda_32.svg",
		category: "Compute",
	},
	{
		id: "aws-auto-scaling",
		name: "Auto Scaling",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Compute/32/Arch_Amazon-EC2-Auto-Scaling_32.svg",
		category: "Compute",
		isContainer: true,
	},
	{
		id: "aws-elastic-beanstalk",
		name: "Elastic Beanstalk",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Compute/32/Arch_AWS-Elastic-Beanstalk_32.svg",
		category: "Compute",
		isContainer: true,
	},
	{
		id: "aws-lightsail",
		name: "Lightsail",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Compute/32/Arch_Amazon-Lightsail_32.svg",
		category: "Compute",
	},
	{
		id: "aws-batch",
		name: "Batch",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Compute/32/Arch_AWS-Batch_32.svg",
		category: "Compute",
	},
	{
		id: "aws-app-runner",
		name: "App Runner",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Compute/32/Arch_AWS-App-Runner_32.svg",
		category: "Compute",
	},

	// Networking Services
	{
		id: "aws-vpc",
		name: "VPC",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/32/Arch_Amazon-Virtual-Private-Cloud_32.svg",
		category: "Network",
		isContainer: true,
	},
	{
		id: "aws-cloudfront",
		name: "CloudFront",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/32/Arch_Amazon-CloudFront_32.svg",
		category: "Network",
	},
	{
		id: "aws-route53",
		name: "Route 53",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/32/Arch_Amazon-Route-53_32.svg",
		category: "Network",
		isContainer: true,
	},
	{
		id: "aws-api-gateway",
		name: "API Gateway",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/32/Arch_Amazon-API-Gateway_32.svg",
		category: "Network",
	},
	{
		id: "aws-elb",
		name: "Load Balancer",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/32/Arch_Elastic-Load-Balancing_32.svg",
		category: "Network",
	},
	{
		id: "aws-direct-connect",
		name: "Direct Connect",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/32/Arch_AWS-Direct-Connect_32.svg",
		category: "Network",
	},
	{
		id: "aws-global-accelerator",
		name: "Global Accelerator",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/32/Arch_AWS-Global-Accelerator_32.svg",
		category: "Network",
	},
	{
		id: "aws-transit-gateway",
		name: "Transit Gateway",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/32/Arch_AWS-Transit-Gateway_32.svg",
		category: "Network",
	},
	{
		id: "aws-private-subnet",
		name: "Private Subnet",
		icon: "/aws_icons/Architecture-Group-Icons_07312025/Private-subnet_32.svg",
		category: "Network",
		isContainer: true,
	},
	{
		id: "aws-public-subnet",
		name: "Public Subnet",
		icon: "/aws_icons/Architecture-Group-Icons_07312025/Public-subnet_32.svg",
		category: "Network",
		isContainer: true,
	},

	// Database Services
	{
		id: "aws-rds",
		name: "RDS",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Database/32/Arch_Amazon-RDS_32.svg",
		category: "Database",
	},
	{
		id: "aws-dynamodb",
		name: "DynamoDB",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Database/32/Arch_Amazon-DynamoDB_32.svg",
		category: "Database",
	},
	{
		id: "aws-aurora",
		name: "Aurora",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Database/32/Arch_Amazon-Aurora_32.svg",
		category: "Database",
	},
	{
		id: "aws-elasticache",
		name: "ElastiCache",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Database/32/Arch_Amazon-ElastiCache_32.svg",
		category: "Database",
	},
	{
		id: "aws-documentdb",
		name: "DocumentDB",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Database/32/Arch_Amazon-DocumentDB_32.svg",
		category: "Database",
	},
	{
		id: "aws-neptune",
		name: "Neptune",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Database/32/Arch_Amazon-Neptune_32.svg",
		category: "Database",
	},
	{
		id: "aws-memorydb",
		name: "MemoryDB",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Database/32/Arch_Amazon-MemoryDB_32.svg",
		category: "Database",
	},

	// Storage Services
	{
		id: "aws-s3",
		name: "S3",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Storage/32/Arch_Amazon-Simple-Storage-Service_32.svg",
		category: "Storage",
	},
	{
		id: "aws-ebs",
		name: "EBS",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Storage/32/Arch_Amazon-Elastic-Block-Store_32.svg",
		category: "Storage",
	},
	{
		id: "aws-efs",
		name: "EFS",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Storage/32/Arch_Amazon-EFS_32.svg",
		category: "Storage",
	},
	{
		id: "aws-s3-glacier",
		name: "S3 Glacier",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Storage/32/Arch_Amazon-Simple-Storage-Service-Glacier_32.svg",
		category: "Storage",
	},
	{
		id: "aws-fsx",
		name: "FSx",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Storage/32/Arch_Amazon-FSx_32.svg",
		category: "Storage",
	},
	{
		id: "aws-storage-gateway",
		name: "Storage Gateway",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Storage/32/Arch_AWS-Storage-Gateway_32.svg",
		category: "Storage",
	},
	{
		id: "aws-backup",
		name: "Backup",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Storage/32/Arch_AWS-Backup_32.svg",
		category: "Storage",
	},

	// Security Services
	{
		id: "aws-iam",
		name: "IAM",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/32/Arch_AWS-Identity-and-Access-Management_32.svg",
		category: "Security",
	},
	{
		id: "aws-cognito",
		name: "Cognito",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/32/Arch_Amazon-Cognito_32.svg",
		category: "Security",
	},
	{
		id: "aws-kms",
		name: "KMS",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/32/Arch_AWS-Key-Management-Service_32.svg",
		category: "Security",
	},
	{
		id: "aws-secrets-manager",
		name: "Secrets Manager",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/32/Arch_AWS-Secrets-Manager_32.svg",
		category: "Security",
	},
	{
		id: "aws-waf",
		name: "WAF",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/32/Arch_AWS-WAF_32.svg",
		category: "Security",
	},
	{
		id: "aws-shield",
		name: "Shield",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/32/Arch_AWS-Shield_32.svg",
		category: "Security",
	},
	{
		id: "aws-guardduty",
		name: "GuardDuty",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/32/Arch_Amazon-GuardDuty_32.svg",
		category: "Security",
	},
	{
		id: "aws-security-hub",
		name: "Security Hub",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/32/Arch_AWS-Security-Hub_32.svg",
		category: "Security",
	},

	// Management & Governance
	{
		id: "aws-cloudwatch",
		name: "CloudWatch",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Management-Governance/32/Arch_Amazon-CloudWatch_32.svg",
		category: "Management",
	},
	{
		id: "aws-cloudformation",
		name: "CloudFormation",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Management-Governance/32/Arch_AWS-CloudFormation_32.svg",
		category: "Management",
		isContainer: true,
	},
	{
		id: "aws-cloudtrail",
		name: "CloudTrail",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Management-Governance/32/Arch_AWS-CloudTrail_32.svg",
		category: "Management",
	},
	{
		id: "aws-config",
		name: "Config",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Management-Governance/32/Arch_AWS-Config_32.svg",
		category: "Management",
	},
	{
		id: "aws-systems-manager",
		name: "Systems Manager",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Management-Governance/32/Arch_AWS-Systems-Manager_32.svg",
		category: "Management",
	},
	{
		id: "aws-trusted-advisor",
		name: "Trusted Advisor",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Management-Governance/32/Arch_AWS-Trusted-Advisor_32.svg",
		category: "Management",
	},
	{
		id: "aws-organizations",
		name: "Organizations",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Management-Governance/32/Arch_AWS-Organizations_32.svg",
		category: "Management",
		isContainer: true,
	},
	{
		id: "aws-control-tower",
		name: "Control Tower",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Management-Governance/32/Arch_AWS-Control-Tower_32.svg",
		category: "Management",
		isContainer: true,
	},

	// Container Services
	{
		id: "aws-ecs",
		name: "ECS",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Containers/32/Arch_Amazon-Elastic-Container-Service_32.svg",
		category: "Containers",
		isContainer: true,
	},
	{
		id: "aws-eks",
		name: "EKS",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Containers/32/Arch_Amazon-Elastic-Kubernetes-Service_32.svg",
		category: "Containers",
		isContainer: true,
	},
	{
		id: "aws-fargate",
		name: "Fargate",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Containers/32/Arch_AWS-Fargate_32.svg",
		category: "Containers",
	},
	{
		id: "aws-ecr",
		name: "ECR",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Containers/32/Arch_Amazon-Elastic-Container-Registry_32.svg",
		category: "Containers",
	},

	// Analytics Services
	{
		id: "aws-athena",
		name: "Athena",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Analytics/32/Arch_Amazon-Athena_32.svg",
		category: "Analytics",
	},
	{
		id: "aws-redshift",
		name: "Redshift",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Analytics/32/Arch_Amazon-Redshift_32.svg",
		category: "Analytics",
	},
	{
		id: "aws-emr",
		name: "EMR",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Analytics/32/Arch_Amazon-EMR_32.svg",
		category: "Analytics",
	},
	{
		id: "aws-kinesis",
		name: "Kinesis",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Analytics/32/Arch_Amazon-Kinesis_32.svg",
		category: "Analytics",
	},
	{
		id: "aws-glue",
		name: "Glue",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Analytics/32/Arch_AWS-Glue_32.svg",
		category: "Analytics",
	},
	{
		id: "aws-quicksight",
		name: "QuickSight",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Analytics/32/Arch_Amazon-QuickSight_32.svg",
		category: "Analytics",
	},
	{
		id: "aws-opensearch",
		name: "OpenSearch",
		icon: "/aws_icons/Architecture-Service-Icons_07312025/Arch_Analytics/32/Arch_Amazon-OpenSearch-Service_32.svg",
		category: "Analytics",
	},
];

interface ServicesSidebarProps {
	isOpen: boolean;
	onToggle: () => void;
}

export default function ServicesSidebar({
	isOpen,
	onToggle,
}: ServicesSidebarProps) {
	const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
		new Set(["Infrastructure", "Compute", "Network", "Storage", "Database"])
	);

	const categories = [
		"Infrastructure",
		"Compute",
		"Network",
		"Storage",
		"Database",
		"Security & Identity",
		"Containers",
		"Management",
		"Analytics",
	];

	const categoryMapping: { [key: string]: string } = {
		"Security & Identity": "Security",
	};

	const getCategoryIcon = (category: string) => {
		const iconProps = { className: "w-6 h-6 text-gray-600" };

		switch (category) {
			case "Infrastructure":
				return <BuildingOfficeIcon {...iconProps} />;
			case "Compute":
				return <CpuChipIcon {...iconProps} />;
			case "Network":
				return <GlobeAltIcon {...iconProps} />;
			case "Storage":
				return <CircleStackIcon {...iconProps} />;
			case "Database":
				return <ServerStackIcon {...iconProps} />;
			case "Security & Identity":
				return <ShieldCheckIcon {...iconProps} />;
			case "Containers":
				return <CubeIcon {...iconProps} />;
			case "Management":
				return <CogIcon {...iconProps} />;
			case "Analytics":
				return <ChartBarIcon {...iconProps} />;
			default:
				return <CpuChipIcon {...iconProps} />;
		}
	};

	const toggleCategory = (category: string) => {
		const newExpanded = new Set(expandedCategories);
		if (newExpanded.has(category)) {
			newExpanded.delete(category);
		} else {
			newExpanded.add(category);
		}
		setExpandedCategories(newExpanded);
	};

	const getServicesForCategory = (category: string) => {
		const mappedCategory = categoryMapping[category] || category;
		return awsServices.filter((service) => service.category === mappedCategory);
	};

	const onDragStart = (event: React.DragEvent, service: AWSService) => {
		event.dataTransfer.setData("application/reactflow", service.id);
		event.dataTransfer.setData("application/name", service.name);
		event.dataTransfer.setData("application/icon", service.icon);
		event.dataTransfer.setData(
			"application/isContainer",
			service.isContainer ? "true" : "false"
		);
		event.dataTransfer.effectAllowed = "move";
	};
	return (
		<div className="relative">
			{/* Sidebar */}
			<div
				className={`fixed top-16 left-0 bg-white border-r border-gray-300 shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
				style={{ width: "280px", height: "calc(100vh - 4rem)" }}
			>
				<div className="flex flex-col h-full">
					{/* Header */}
					<div className="p-0 border-b border-gray-200">
						<div className="flex items-center justify-center">
							<Image
								src="/aws_icons/Architecture-Group-Icons_07312025/AWS-Cloud-logo_32_Dark.svg"
								alt="AWS Logo"
								width={64}
								height={64}
							/>
						</div>
					</div>

					{/* Services List */}
					<div className="flex-1 overflow-y-auto">
						{categories.map((category) => {
							const services = getServicesForCategory(category);
							const isExpanded = expandedCategories.has(category);

							return (
								<div key={category} className="">
									{/* Category Header */}
									<button
										onClick={() => toggleCategory(category)}
										className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-200 mb-4"
									>
										<div className="flex justify-center items-center space-x-3 ">
											<div className="w-8 h-6 rounded flex items-center justify-center">
												{getCategoryIcon(category)}
											</div>
											<span className="font-medium text-gray-900">
												{category}
											</span>
										</div>
										<ChevronDownIcon
											className={`h-4 w-4 text-gray-500 transition-transform ${
												isExpanded ? "transform rotate-180" : ""
											}`}
										/>
									</button>

									{/* Category Services */}
									{isExpanded && (
										<div className="px-4 pb-4">
											{category === "Infrastructure" ? (
												// Full-width layout for Infrastructure components
												<div className="space-y-2">
													{services.map((service) => (
														<div
															key={service.id}
															draggable
															onDragStart={(event) => onDragStart(event, service)}
															className={`flex items-center p-3 border rounded-lg cursor-move transition-colors group bg-white border-gray-200 ${
																service.isContainer
																	? "hover:border-purple-500 hover:bg-purple-50"
																	: "hover:border-blue-400 hover:bg-blue-50"
															}`}
														>
															<div className="relative w-8 h-8 mr-3 flex-shrink-0">
																<Image
																	src={service.icon}
																	alt={service.name}
																	fill
																	className="object-contain"
																	sizes="32px"
																/>
															</div>
															<span className="text-sm text-gray-700 group-hover:text-purple-700 font-medium">
																{service.name}
															</span>
														</div>
													))}
												</div>
											) : (
												// Grid layout for other categories
												<div className="grid grid-cols-3 gap-2">
													{services.map((service) => (
														<div
															key={service.id}
															draggable
															onDragStart={(event) => onDragStart(event, service)}
															className={`flex flex-col items-center p-2 border rounded-lg cursor-move transition-colors group bg-white border-gray-200 ${
																service.isContainer
																	? "hover:border-blue-500 hover:bg-blue-50"
																	: "hover:border-blue-400 hover:bg-blue-50"
															}`}
														>
															<div className="relative w-8 h-8 mb-1">
																<Image
																	src={service.icon}
																	alt={service.name}
																	fill
																	className="object-contain"
																	sizes="32px"
																/>
															</div>
															<span className="text-xs text-center text-gray-700 group-hover:text-blue-700 font-medium leading-tight">
																{service.name}
															</span>
														</div>
													))}
												</div>
											)}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* Toggle Button - Attached to sidebar edge */}
			<button
				onClick={onToggle}
				className={`fixed z-50 bg-white border border-gray-300 shadow-lg hover:bg-gray-50 transition-all duration-300 ease-in-out ${
					isOpen
						? "left-[280px] rounded-r-lg border-l-0"
						: "left-0 rounded-r-lg"
				}`}
				style={{
					top: "calc(50vh + 2rem)",
					transform: "translateY(-50%)",
					padding: "12px 4px",
					borderTopLeftRadius: isOpen ? "0" : "0.5rem",
					borderBottomLeftRadius: isOpen ? "0" : "0.5rem",
				}}
				aria-label="Toggle Services Sidebar"
			>
				<svg
					className={`w-5 h-5 transition-transform duration-300 ${
						isOpen ? "rotate-180" : ""
					}`}
					fill="none"
					stroke="gray"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 5l7 7-7 7"
					/>
				</svg>
			</button>
		</div>
	);
}
