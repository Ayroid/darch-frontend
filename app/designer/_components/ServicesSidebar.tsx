"use client";

import React from "react";
import Image from "next/image";
import {
	FiChevronDown,
	FiCpu,
	FiGlobe,
	FiDatabase,
	FiServer,
	FiShield,
	FiBox,
	FiSettings,
	FiBarChart,
} from "react-icons/fi";
import { BsBuilding } from "react-icons/bs";
import { useUIStore } from "@/lib/stores";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/_components/ui/tooltip";

interface AWSService {
	id: string;
	name: string;
	icon: string;
	category: string;
	isContainer?: boolean;
	status: "ready" | "in-development";
}

// Define AWS services with their icons
const awsServices: AWSService[] = [
	// Infrastructure Components
	{
		id: "aws-region",
		name: "Region",
		icon: "/aws_icons/architecture_group_icons/AWS-Cloud_32.svg",
		category: "Infrastructure",
		isContainer: true,
		status: "ready",
	},
	{
		id: "aws-availability-zone",
		name: "AvailabilityZone",
		icon: "/aws_icons/architecture_group_icons/Region_32.svg",
		category: "Infrastructure",
		isContainer: true,
		status: "ready",
	},

	// Compute Services
	{
		id: "aws-ec2",
		name: "EC2",
		icon: "/aws_icons/architecture_service_icons/Arch_Compute/32/Arch_Amazon-EC2_32.svg",
		category: "Compute",
		isContainer: false,
		status: "ready",
	},
	{
		id: "aws-security-group",
		name: "SecurityGroup",
		icon: "/aws_icons/architecture_group_icons/EC2-instance-contents_32.svg",
		category: "Compute",
		isContainer: true,
		status: "ready",
	},
	{
		id: "aws-lambda",
		name: "Lambda",
		icon: "/aws_icons/architecture_service_icons/Arch_Compute/32/Arch_AWS-Lambda_32.svg",
		category: "Compute",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-auto-scaling",
		name: "AutoScaling",
		icon: "/aws_icons/architecture_service_icons/Arch_Compute/32/Arch_Amazon-EC2-Auto-Scaling_32.svg",
		category: "Compute",
		isContainer: true,
		status: "in-development",
	},
	{
		id: "aws-elastic-beanstalk",
		name: "ElasticBeanstalk",
		icon: "/aws_icons/architecture_service_icons/Arch_Compute/32/Arch_AWS-Elastic-Beanstalk_32.svg",
		category: "Compute",
		isContainer: true,
		status: "in-development",
	},
	{
		id: "aws-lightsail",
		name: "Lightsail",
		icon: "/aws_icons/architecture_service_icons/Arch_Compute/32/Arch_Amazon-Lightsail_32.svg",
		category: "Compute",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-batch",
		name: "Batch",
		icon: "/aws_icons/architecture_service_icons/Arch_Compute/32/Arch_AWS-Batch_32.svg",
		category: "Compute",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-app-runner",
		name: "AppRunner",
		icon: "/aws_icons/architecture_service_icons/Arch_Compute/32/Arch_AWS-App-Runner_32.svg",
		category: "Compute",
		isContainer: false,
		status: "in-development",
	},

	// Networking Services
	{
		id: "aws-vpc",
		name: "VPC",
		icon: "/aws_icons/architecture_service_icons/Arch_Networking-Content-Delivery/32/Arch_Amazon-Virtual-Private-Cloud_32.svg",
		category: "Network",
		isContainer: true,
		status: "ready",
	},
	{
		id: "aws-private-subnet",
		name: "PrivateSubnet",
		icon: "/aws_icons/architecture_group_icons/Private-subnet_32.svg",
		category: "Network",
		isContainer: true,
		status: "ready",
	},
	{
		id: "aws-public-subnet",
		name: "PublicSubnet",
		icon: "/aws_icons/architecture_group_icons/Public-subnet_32.svg",
		category: "Network",
		isContainer: true,
		status: "ready",
	},
	{
		id: "aws-internet-gateway",
		name: "InternetGateway",
		icon: "/aws_icons/Resource-Icons_07312025/Res_Networking-Content-Delivery/Res_Amazon-VPC_Internet-Gateway_48.svg",
		category: "Network",
		isContainer: false,
		status: "ready",
	},
	{
		id: "aws-nat-gateway",
		name: "NATGateway",
		icon: "/aws_icons/Resource-Icons_07312025/Res_Networking-Content-Delivery/Res_Amazon-VPC_NAT-Gateway_48.svg",
		category: "Network",
		isContainer: false,
		status: "ready",
	},
	{
		id: "aws-route-table",
		name: "RouteTable",
		icon: "/aws_icons/Resource-Icons_07312025/Res_Networking-Content-Delivery/Res_Amazon-Route-53_Route-Table_48.svg",
		category: "Network",
		isContainer: false,
		status: "ready",
	},
	{
		id: "aws-cloudfront",
		name: "CloudFront",
		icon: "/aws_icons/architecture_service_icons/Arch_Networking-Content-Delivery/32/Arch_Amazon-CloudFront_32.svg",
		category: "Network",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-route53",
		name: "Route53",
		icon: "/aws_icons/architecture_service_icons/Arch_Networking-Content-Delivery/32/Arch_Amazon-Route-53_32.svg",
		category: "Network",
		isContainer: true,
		status: "in-development",
	},
	{
		id: "aws-api-gateway",
		name: "APIGateway",
		icon: "/aws_icons/architecture_service_icons/Arch_Networking-Content-Delivery/32/Arch_Amazon-API-Gateway_32.svg",
		category: "Network",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-elb",
		name: "LoadBalancer",
		icon: "/aws_icons/architecture_service_icons/Arch_Networking-Content-Delivery/32/Arch_Elastic-Load-Balancing_32.svg",
		category: "Network",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-direct-connect",
		name: "DirectConnect",
		icon: "/aws_icons/architecture_service_icons/Arch_Networking-Content-Delivery/32/Arch_AWS-Direct-Connect_32.svg",
		category: "Network",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-global-accelerator",
		name: "GlobalAccelerator",
		icon: "/aws_icons/architecture_service_icons/Arch_Networking-Content-Delivery/32/Arch_AWS-Global-Accelerator_32.svg",
		category: "Network",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-transit-gateway",
		name: "TransitGateway",
		icon: "/aws_icons/architecture_service_icons/Arch_Networking-Content-Delivery/32/Arch_AWS-Transit-Gateway_32.svg",
		category: "Network",
		isContainer: false,
		status: "in-development",
	},

	// Database Services
	{
		id: "aws-rds",
		name: "RDS",
		icon: "/aws_icons/architecture_service_icons/Arch_Database/32/Arch_Amazon-RDS_32.svg",
		category: "Database",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-dynamodb",
		name: "DynamoDB",
		icon: "/aws_icons/architecture_service_icons/Arch_Database/32/Arch_Amazon-DynamoDB_32.svg",
		category: "Database",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-aurora",
		name: "Aurora",
		icon: "/aws_icons/architecture_service_icons/Arch_Database/32/Arch_Amazon-Aurora_32.svg",
		category: "Database",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-elasticache",
		name: "ElastiCache",
		icon: "/aws_icons/architecture_service_icons/Arch_Database/32/Arch_Amazon-ElastiCache_32.svg",
		category: "Database",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-documentdb",
		name: "DocumentDB",
		icon: "/aws_icons/architecture_service_icons/Arch_Database/32/Arch_Amazon-DocumentDB_32.svg",
		category: "Database",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-neptune",
		name: "Neptune",
		icon: "/aws_icons/architecture_service_icons/Arch_Database/32/Arch_Amazon-Neptune_32.svg",
		category: "Database",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-memorydb",
		name: "MemoryDB",
		icon: "/aws_icons/architecture_service_icons/Arch_Database/32/Arch_Amazon-MemoryDB_32.svg",
		category: "Database",
		isContainer: false,
		status: "in-development",
	},

	// Storage Services
	{
		id: "aws-s3",
		name: "S3",
		icon: "/aws_icons/architecture_service_icons/Arch_Storage/32/Arch_Amazon-Simple-Storage-Service_32.svg",
		category: "Storage",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-ebs",
		name: "EBS",
		icon: "/aws_icons/architecture_service_icons/Arch_Storage/32/Arch_Amazon-Elastic-Block-Store_32.svg",
		category: "Storage",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-efs",
		name: "EFS",
		icon: "/aws_icons/architecture_service_icons/Arch_Storage/32/Arch_Amazon-EFS_32.svg",
		category: "Storage",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-s3-glacier",
		name: "S3Glacier",
		icon: "/aws_icons/architecture_service_icons/Arch_Storage/32/Arch_Amazon-Simple-Storage-Service-Glacier_32.svg",
		category: "Storage",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-fsx",
		name: "FSx",
		icon: "/aws_icons/architecture_service_icons/Arch_Storage/32/Arch_Amazon-FSx_32.svg",
		category: "Storage",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-storage-gateway",
		name: "StorageGateway",
		icon: "/aws_icons/architecture_service_icons/Arch_Storage/32/Arch_AWS-Storage-Gateway_32.svg",
		category: "Storage",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-backup",
		name: "Backup",
		icon: "/aws_icons/architecture_service_icons/Arch_Storage/32/Arch_AWS-Backup_32.svg",
		category: "Storage",
		isContainer: false,
		status: "in-development",
	},

	// Security Services
	{
		id: "aws-iam",
		name: "IAM",
		icon: "/aws_icons/architecture_service_icons/Arch_Security-Identity-Compliance/32/Arch_AWS-Identity-and-Access-Management_32.svg",
		category: "Security",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-cognito",
		name: "Cognito",
		icon: "/aws_icons/architecture_service_icons/Arch_Security-Identity-Compliance/32/Arch_Amazon-Cognito_32.svg",
		category: "Security",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-kms",
		name: "KMS",
		icon: "/aws_icons/architecture_service_icons/Arch_Security-Identity-Compliance/32/Arch_AWS-Key-Management-Service_32.svg",
		category: "Security",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-secrets-manager",
		name: "SecretsManager",
		icon: "/aws_icons/architecture_service_icons/Arch_Security-Identity-Compliance/32/Arch_AWS-Secrets-Manager_32.svg",
		category: "Security",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-waf",
		name: "WAF",
		icon: "/aws_icons/architecture_service_icons/Arch_Security-Identity-Compliance/32/Arch_AWS-WAF_32.svg",
		category: "Security",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-shield",
		name: "Shield",
		icon: "/aws_icons/architecture_service_icons/Arch_Security-Identity-Compliance/32/Arch_AWS-Shield_32.svg",
		category: "Security",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-guardduty",
		name: "GuardDuty",
		icon: "/aws_icons/architecture_service_icons/Arch_Security-Identity-Compliance/32/Arch_Amazon-GuardDuty_32.svg",
		category: "Security",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-security-hub",
		name: "SecurityHub",
		icon: "/aws_icons/architecture_service_icons/Arch_Security-Identity-Compliance/32/Arch_AWS-Security-Hub_32.svg",
		category: "Security",
		isContainer: false,
		status: "in-development",
	},

	// Management & Governance
	{
		id: "aws-cloudwatch",
		name: "CloudWatch",
		icon: "/aws_icons/architecture_service_icons/Arch_Management-Governance/32/Arch_Amazon-CloudWatch_32.svg",
		category: "Management",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-cloudformation",
		name: "CloudFormation",
		icon: "/aws_icons/architecture_service_icons/Arch_Management-Governance/32/Arch_AWS-CloudFormation_32.svg",
		category: "Management",
		isContainer: true,
		status: "in-development",
	},
	{
		id: "aws-cloudtrail",
		name: "CloudTrail",
		icon: "/aws_icons/architecture_service_icons/Arch_Management-Governance/32/Arch_AWS-CloudTrail_32.svg",
		category: "Management",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-config",
		name: "Config",
		icon: "/aws_icons/architecture_service_icons/Arch_Management-Governance/32/Arch_AWS-Config_32.svg",
		category: "Management",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-systems-manager",
		name: "SystemsManager",
		icon: "/aws_icons/architecture_service_icons/Arch_Management-Governance/32/Arch_AWS-Systems-Manager_32.svg",
		category: "Management",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-trusted-advisor",
		name: "TrustedAdvisor",
		icon: "/aws_icons/architecture_service_icons/Arch_Management-Governance/32/Arch_AWS-Trusted-Advisor_32.svg",
		category: "Management",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-organizations",
		name: "Organizations",
		icon: "/aws_icons/architecture_service_icons/Arch_Management-Governance/32/Arch_AWS-Organizations_32.svg",
		category: "Management",
		isContainer: true,
		status: "in-development",
	},
	{
		id: "aws-control-tower",
		name: "ControlTower",
		icon: "/aws_icons/architecture_service_icons/Arch_Management-Governance/32/Arch_AWS-Control-Tower_32.svg",
		category: "Management",
		isContainer: true,
		status: "in-development",
	},

	// Container Services
	{
		id: "aws-ecs",
		name: "ECS",
		icon: "/aws_icons/architecture_service_icons/Arch_Containers/32/Arch_Amazon-Elastic-Container-Service_32.svg",
		category: "Containers",
		isContainer: true,
		status: "in-development",
	},
	{
		id: "aws-eks",
		name: "EKS",
		icon: "/aws_icons/architecture_service_icons/Arch_Containers/32/Arch_Amazon-Elastic-Kubernetes-Service_32.svg",
		category: "Containers",
		isContainer: true,
		status: "in-development",
	},
	{
		id: "aws-fargate",
		name: "Fargate",
		icon: "/aws_icons/architecture_service_icons/Arch_Containers/32/Arch_AWS-Fargate_32.svg",
		category: "Containers",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-ecr",
		name: "ECR",
		icon: "/aws_icons/architecture_service_icons/Arch_Containers/32/Arch_Amazon-Elastic-Container-Registry_32.svg",
		category: "Containers",
		isContainer: false,
		status: "in-development",
	},

	// Analytics Services
	{
		id: "aws-athena",
		name: "Athena",
		icon: "/aws_icons/architecture_service_icons/Arch_Analytics/32/Arch_Amazon-Athena_32.svg",
		category: "Analytics",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-redshift",
		name: "Redshift",
		icon: "/aws_icons/architecture_service_icons/Arch_Analytics/32/Arch_Amazon-Redshift_32.svg",
		category: "Analytics",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-emr",
		name: "EMR",
		icon: "/aws_icons/architecture_service_icons/Arch_Analytics/32/Arch_Amazon-EMR_32.svg",
		category: "Analytics",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-kinesis",
		name: "Kinesis",
		icon: "/aws_icons/architecture_service_icons/Arch_Analytics/32/Arch_Amazon-Kinesis_32.svg",
		category: "Analytics",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-glue",
		name: "Glue",
		icon: "/aws_icons/architecture_service_icons/Arch_Analytics/32/Arch_AWS-Glue_32.svg",
		category: "Analytics",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-quicksight",
		name: "QuickSight",
		icon: "/aws_icons/architecture_service_icons/Arch_Analytics/32/Arch_Amazon-QuickSight_32.svg",
		category: "Analytics",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-opensearch",
		name: "OpenSearch",
		icon: "/aws_icons/architecture_service_icons/Arch_Analytics/32/Arch_Amazon-OpenSearch-Service_32.svg",
		category: "Analytics",
		isContainer: false,
		status: "in-development",
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
	const { expandedCategories, toggleCategory } = useUIStore();

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
				return <BsBuilding {...iconProps} />;
			case "Compute":
				return <FiCpu {...iconProps} />;
			case "Network":
				return <FiGlobe {...iconProps} />;
			case "Storage":
				return <FiDatabase {...iconProps} />;
			case "Database":
				return <FiServer {...iconProps} />;
			case "Security & Identity":
				return <FiShield {...iconProps} />;
			case "Containers":
				return <FiBox {...iconProps} />;
			case "Management":
				return <FiSettings {...iconProps} />;
			case "Analytics":
				return <FiBarChart {...iconProps} />;
			default:
				return <FiCpu {...iconProps} />;
		}
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
				className={`fixed top-16 left-0 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
				style={{ width: "340px", height: "calc(100vh - 4rem)" }}
			>
				<div className="flex flex-col h-full">
					{/* Header */}
					<div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
						<div className="flex items-center gap-3">
							<Image
								src="/aws_icons/architecture_group_icons/AWS-Cloud-logo_32_Dark.svg"
								alt="AWS Logo"
								width={50}
								height={50}
							/>
							<div className="border-l border-gray-300 pl-3">
								<h2 className="text-lg font-semibold text-gray-900">
									AWS Services
								</h2>
								<p className="text-xs text-gray-600">Drag to add to canvas</p>
							</div>
						</div>
					</div>

					{/* Services List */}
					<div className="flex-1 overflow-y-auto bg-white hide-scrollbar">
						{categories.map((category) => {
							const services = getServicesForCategory(category);
							const isExpanded = expandedCategories.has(category);

							return (
								<div
									key={category}
									className="border-b border-gray-100 last:border-b-0"
								>
									{/* Category Header */}
									<button
										onClick={() => toggleCategory(category)}
										className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
									>
										<div className="flex items-center space-x-3">
											<div className="w-6 h-6 flex items-center justify-center">
												{getCategoryIcon(category)}
											</div>
											<span className="font-medium text-gray-900">
												{category}
											</span>
										</div>
										<FiChevronDown
											className={`h-4 w-4 text-gray-500 transition-transform ${
												isExpanded ? "transform rotate-180" : ""
											}`}
										/>
									</button>

									{/* Category Services */}
									{isExpanded && (
										<div className="px-6 pb-4">
											{category === "Infrastructure" ? (
												// Full-width layout for Infrastructure components
												<div className="space-y-2">
													{services.map((service) => (
														<div
															key={service.id}
															draggable
															onDragStart={(event) =>
																onDragStart(event, service)
															}
															className={`flex items-center p-3 border rounded-lg cursor-move transition-colors group bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:shadow-sm ${
																service.status === "in-development"
																	? "opacity-50"
																	: ""
															}`}
														>
															<div className="relative w-10 h-10 mr-3 shrink-0">
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
															onDragStart={(event) =>
																onDragStart(event, service)
															}
															className={`flex flex-col items-center p-3 border rounded-lg cursor-move transition-colors group bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm ${
																service.status === "in-development"
																	? "opacity-50"
																	: ""
															}`}
														>
															<div className="relative w-10 h-10 mb-2">
																<Image
																	src={service.icon}
																	alt={service.name}
																	fill
																	className="object-contain"
																	sizes="32px"
																/>
															</div>
															<Tooltip>
																<TooltipTrigger>
																	<span className="text-xs text-center text-gray-800 group-hover:text-blue-700 leading-tight">
																		{service.name.length > 7
																			? `${service.name.slice(0, 7)}...`
																			: service.name}
																	</span>
																</TooltipTrigger>
																<TooltipContent side="bottom">
																	{service.name}
																</TooltipContent>
															</Tooltip>
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
				className={`fixed z-50 bg-white border border-gray-200 shadow-lg hover:bg-gray-50 transition-all duration-300 ease-in-out ${
					isOpen
						? "left-[340px] rounded-r-lg border-l-0"
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
					className={`w-5 h-5 transition-transform duration-300 text-gray-600 ${
						isOpen ? "rotate-180" : ""
					}`}
					fill="none"
					stroke="currentColor"
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
