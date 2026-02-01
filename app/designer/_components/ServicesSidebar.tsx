"use client";

import Image from "next/image";
import {
	ChevronDown,
	Cpu,
	Globe,
	Database,
	Server,
	Shield,
	Box,
	Settings,
	BarChart,
	Building,
	ChevronRight,
} from "lucide-react";
import { useUIStore } from "@/lib/stores";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/_components/ui/tooltip";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import { cn } from "@/lib/utils";

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
		icon: "/aws_icons/uncategorized/32/aws_cloud_32.svg",
		category: "Infrastructure",
		isContainer: true,
		status: "ready",
	},
	{
		id: "aws-availability-zone",
		name: "AvailabilityZone",
		icon: "/aws_icons/uncategorized/32/region_32.svg",
		category: "Infrastructure",
		isContainer: true,
		status: "ready",
	},

	// Compute Services
	{
		id: "aws-ec2",
		name: "EC2",
		icon: "/aws_icons/compute/32/arch_amazon_ec2_32.svg",
		category: "Compute",
		isContainer: false,
		status: "ready",
	},
	{
		id: "aws-security-group",
		name: "SecurityGroup",
		icon: "/aws_icons/uncategorized/32/ec2_instance_contents_32.svg",
		category: "Compute",
		isContainer: true,
		status: "ready",
	},
	{
		id: "aws-lambda",
		name: "Lambda",
		icon: "/aws_icons/compute/32/arch_aws_lambda_32.svg",
		category: "Compute",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-auto-scaling",
		name: "AutoScaling",
		icon: "/aws_icons/compute/32/arch_amazon_ec2_auto_scaling_32.svg",
		category: "Compute",
		isContainer: true,
		status: "in-development",
	},
	{
		id: "aws-elastic-beanstalk",
		name: "ElasticBeanstalk",
		icon: "/aws_icons/compute/32/arch_aws_elastic_beanstalk_32.svg",
		category: "Compute",
		isContainer: true,
		status: "in-development",
	},
	{
		id: "aws-lightsail",
		name: "Lightsail",
		icon: "/aws_icons/compute/32/arch_amazon_lightsail_32.svg",
		category: "Compute",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-batch",
		name: "Batch",
		icon: "/aws_icons/compute/32/arch_aws_batch_32.svg",
		category: "Compute",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-app-runner",
		name: "AppRunner",
		icon: "/aws_icons/compute/32/arch_aws_app_runner_32.svg",
		category: "Compute",
		isContainer: false,
		status: "in-development",
	},

	// Networking Services
	{
		id: "aws-vpc",
		name: "VPC",
		icon: "/aws_icons/networking_content_delivery/32/arch_amazon_virtual_private_cloud_32.svg",
		category: "Network",
		isContainer: true,
		status: "ready",
	},
	{
		id: "aws-subnet",
		name: "Subnet",
		icon: "/aws_icons/uncategorized/32/private_subnet_32.svg",
		category: "Network",
		isContainer: true,
		status: "ready",
	},
	{
		id: "aws-internet-gateway",
		name: "InternetGateway",
		icon: "/aws_icons/networking_content_delivery/48/res_amazon_vpc_internet_gateway_48.svg",
		category: "Network",
		isContainer: false,
		status: "ready",
	},
	{
		id: "aws-nat-gateway",
		name: "NATGateway",
		icon: "/aws_icons/networking_content_delivery/48/res_amazon_vpc_nat_gateway_48.svg",
		category: "Network",
		isContainer: false,
		status: "ready",
	},
	{
		id: "aws-route-table",
		name: "RouteTable",
		icon: "/aws_icons/networking_content_delivery/48/res_amazon_route_53_route_table_48.svg",
		category: "Network",
		isContainer: false,
		status: "ready",
	},
	{
		id: "aws-cloudfront",
		name: "CloudFront",
		icon: "/aws_icons/networking_content_delivery/32/arch_amazon_cloud_front_32.svg",
		category: "Network",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-route53",
		name: "Route53",
		icon: "/aws_icons/networking_content_delivery/32/arch_amazon_route_53_32.svg",
		category: "Network",
		isContainer: true,
		status: "in-development",
	},
	{
		id: "aws-api-gateway",
		name: "APIGateway",
		icon: "/aws_icons/networking_content_delivery/32/arch_amazon_api_gateway_32.svg",
		category: "Network",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-elb",
		name: "LoadBalancer",
		icon: "/aws_icons/networking_content_delivery/32/arch_elastic_load_balancing_32.svg",
		category: "Network",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-direct-connect",
		name: "DirectConnect",
		icon: "/aws_icons/networking_content_delivery/32/arch_aws_direct_connect_32.svg",
		category: "Network",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-global-accelerator",
		name: "GlobalAccelerator",
		icon: "/aws_icons/networking_content_delivery/32/arch_aws_global_accelerator_32.svg",
		category: "Network",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-transit-gateway",
		name: "TransitGateway",
		icon: "/aws_icons/networking_content_delivery/32/arch_aws_transit_gateway_32.svg",
		category: "Network",
		isContainer: false,
		status: "in-development",
	},

	// Database Services
	{
		id: "aws-rds",
		name: "RDS",
		icon: "/aws_icons/database/32/arch_amazon_rds_32.svg",
		category: "Database",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-dynamodb",
		name: "DynamoDB",
		icon: "/aws_icons/database/32/arch_amazon_dynamo_db_32.svg",
		category: "Database",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-aurora",
		name: "Aurora",
		icon: "/aws_icons/database/32/arch_amazon_aurora_32.svg",
		category: "Database",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-elasticache",
		name: "ElastiCache",
		icon: "/aws_icons/database/32/arch_amazon_elasti_cache_32.svg",
		category: "Database",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-documentdb",
		name: "DocumentDB",
		icon: "/aws_icons/database/32/arch_amazon_document_db_32.svg",
		category: "Database",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-neptune",
		name: "Neptune",
		icon: "/aws_icons/database/32/arch_amazon_neptune_32.svg",
		category: "Database",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-memorydb",
		name: "MemoryDB",
		icon: "/aws_icons/database/32/arch_amazon_memory_db_32.svg",
		category: "Database",
		isContainer: false,
		status: "in-development",
	},

	// Storage Services
	{
		id: "aws-s3",
		name: "S3",
		icon: "/aws_icons/storage/32/arch_amazon_simple_storage_service_32.svg",
		category: "Storage",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-ebs",
		name: "EBS",
		icon: "/aws_icons/storage/32/arch_amazon_elastic_block_store_32.svg",
		category: "Storage",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-efs",
		name: "EFS",
		icon: "/aws_icons/storage/32/arch_amazon_efs_32.svg",
		category: "Storage",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-s3-glacier",
		name: "S3Glacier",
		icon: "/aws_icons/storage/32/arch_amazon_simple_storage_service_glacier_32.svg",
		category: "Storage",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-fsx",
		name: "FSx",
		icon: "/aws_icons/storage/32/arch_amazon_fsx_32.svg",
		category: "Storage",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-storage-gateway",
		name: "StorageGateway",
		icon: "/aws_icons/storage/32/arch_aws_storage_gateway_32.svg",
		category: "Storage",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-backup",
		name: "Backup",
		icon: "/aws_icons/storage/32/arch_aws_backup_32.svg",
		category: "Storage",
		isContainer: false,
		status: "in-development",
	},

	// Security Services
	{
		id: "aws-iam",
		name: "IAM",
		icon: "/aws_icons/security_identity_compliance/32/arch_aws_identity_and_access_management_32.svg",
		category: "Security",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-cognito",
		name: "Cognito",
		icon: "/aws_icons/security_identity_compliance/32/arch_amazon_cognito_32.svg",
		category: "Security",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-kms",
		name: "KMS",
		icon: "/aws_icons/security_identity_compliance/32/arch_aws_key_management_service_32.svg",
		category: "Security",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-secrets-manager",
		name: "SecretsManager",
		icon: "/aws_icons/security_identity_compliance/32/arch_aws_secrets_manager_32.svg",
		category: "Security",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-waf",
		name: "WAF",
		icon: "/aws_icons/security_identity_compliance/32/arch_aws_waf_32.svg",
		category: "Security",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-shield",
		name: "Shield",
		icon: "/aws_icons/security_identity_compliance/32/arch_aws_shield_32.svg",
		category: "Security",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-guardduty",
		name: "GuardDuty",
		icon: "/aws_icons/security_identity_compliance/32/arch_amazon_guard_duty_32.svg",
		category: "Security",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-security-hub",
		name: "SecurityHub",
		icon: "/aws_icons/security_identity_compliance/32/arch_aws_security_hub_32.svg",
		category: "Security",
		isContainer: false,
		status: "in-development",
	},

	// Management & Governance
	{
		id: "aws-cloudwatch",
		name: "CloudWatch",
		icon: "/aws_icons/management_governance/32/arch_amazon_cloud_watch_32.svg",
		category: "Management",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-cloudformation",
		name: "CloudFormation",
		icon: "/aws_icons/management_governance/32/arch_aws_cloud_formation_32.svg",
		category: "Management",
		isContainer: true,
		status: "in-development",
	},
	{
		id: "aws-cloudtrail",
		name: "CloudTrail",
		icon: "/aws_icons/management_governance/32/arch_aws_cloud_trail_32.svg",
		category: "Management",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-config",
		name: "Config",
		icon: "/aws_icons/management_governance/32/arch_aws_config_32.svg",
		category: "Management",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-systems-manager",
		name: "SystemsManager",
		icon: "/aws_icons/management_governance/32/arch_aws_systems_manager_32.svg",
		category: "Management",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-trusted-advisor",
		name: "TrustedAdvisor",
		icon: "/aws_icons/management_governance/32/arch_aws_trusted_advisor_32.svg",
		category: "Management",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-organizations",
		name: "Organizations",
		icon: "/aws_icons/management_governance/32/arch_aws_organizations_32.svg",
		category: "Management",
		isContainer: true,
		status: "in-development",
	},
	{
		id: "aws-control-tower",
		name: "ControlTower",
		icon: "/aws_icons/management_governance/32/arch_aws_control_tower_32.svg",
		category: "Management",
		isContainer: true,
		status: "in-development",
	},

	// Container Services
	{
		id: "aws-ecs",
		name: "ECS",
		icon: "/aws_icons/containers/32/arch_amazon_elastic_container_service_32.svg",
		category: "Containers",
		isContainer: true,
		status: "in-development",
	},
	{
		id: "aws-eks",
		name: "EKS",
		icon: "/aws_icons/containers/32/arch_amazon_elastic_kubernetes_service_32.svg",
		category: "Containers",
		isContainer: true,
		status: "in-development",
	},
	{
		id: "aws-fargate",
		name: "Fargate",
		icon: "/aws_icons/containers/32/arch_aws_fargate_32.svg",
		category: "Containers",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-ecr",
		name: "ECR",
		icon: "/aws_icons/containers/32/arch_amazon_elastic_container_registry_32.svg",
		category: "Containers",
		isContainer: false,
		status: "in-development",
	},

	// Analytics Services
	{
		id: "aws-athena",
		name: "Athena",
		icon: "/aws_icons/analytics/32/arch_amazon_athena_32.svg",
		category: "Analytics",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-redshift",
		name: "Redshift",
		icon: "/aws_icons/analytics/32/arch_amazon_redshift_32.svg",
		category: "Analytics",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-emr",
		name: "EMR",
		icon: "/aws_icons/analytics/32/arch_amazon_emr_32.svg",
		category: "Analytics",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-kinesis",
		name: "Kinesis",
		icon: "/aws_icons/analytics/32/arch_amazon_kinesis_32.svg",
		category: "Analytics",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-glue",
		name: "Glue",
		icon: "/aws_icons/analytics/32/arch_aws_glue_32.svg",
		category: "Analytics",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-quicksight",
		name: "QuickSight",
		icon: "/aws_icons/analytics/32/arch_amazon_quick_sight_32.svg",
		category: "Analytics",
		isContainer: false,
		status: "in-development",
	},
	{
		id: "aws-opensearch",
		name: "OpenSearch",
		icon: "/aws_icons/analytics/32/arch_amazon_open_search_service_32.svg",
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
		const iconClass = "h-5 w-5";

		switch (category) {
			case "Infrastructure":
				return <Building className={iconClass} />;
			case "Compute":
				return <Cpu className={iconClass} />;
			case "Network":
				return <Globe className={iconClass} />;
			case "Storage":
				return <Database className={iconClass} />;
			case "Database":
				return <Server className={iconClass} />;
			case "Security & Identity":
				return <Shield className={iconClass} />;
			case "Containers":
				return <Box className={iconClass} />;
			case "Management":
				return <Settings className={iconClass} />;
			case "Analytics":
				return <BarChart className={iconClass} />;
			default:
				return <Cpu className={iconClass} />;
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
				className={cn(
					"fixed top-14 left-0 bg-background border-r border-border shadow-xl transform transition-transform duration-300 ease-in-out z-40",
					isOpen ? "translate-x-0" : "-translate-x-full"
				)}
				style={{ width: "320px", height: "calc(100vh - 3.5rem)" }}
			>
				<div className="flex flex-col h-full">
					{/* Header */}
					<div className="px-4 py-4 border-b border-border bg-muted/30">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-lg bg-[#232F3E] flex items-center justify-center">
								<Image
									src="/aws_icons/uncategorized/32/aws_cloud_logo_32_dark.svg"
									alt="AWS Logo"
									width={28}
									height={28}
								/>
							</div>
							<div>
								<h2 className="text-base font-semibold text-foreground">
									AWS Services
								</h2>
								<p className="text-xs text-muted-foreground">Drag to canvas</p>
							</div>
						</div>
					</div>

					{/* Services List */}
					<div className="flex-1 overflow-y-auto hide-scrollbar">
						{categories.map((category) => {
							const services = getServicesForCategory(category);
							const isExpanded = expandedCategories.has(category);
							const readyCount = services.filter(s => s.status === "ready").length;

							return (
								<div
									key={category}
									className="border-b border-border last:border-b-0"
								>
									{/* Category Header */}
									<button
										onClick={() => toggleCategory(category)}
										className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
									>
										<div className="flex items-center gap-3">
											<div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
												{getCategoryIcon(category)}
											</div>
											<div>
												<span className="font-medium text-foreground text-sm">
													{category}
												</span>
												{readyCount > 0 && (
													<Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
														{readyCount} ready
													</Badge>
												)}
											</div>
										</div>
										<ChevronDown
											className={cn(
												"h-4 w-4 text-muted-foreground transition-transform duration-200",
												isExpanded && "rotate-180"
											)}
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
															draggable={service.status === "ready"}
															onDragStart={(event) =>
																onDragStart(event, service)
															}
															className={cn(
																"flex items-center p-3 border rounded-lg transition-all duration-200 group",
																service.status === "ready"
																	? "cursor-grab active:cursor-grabbing bg-card border-border hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm"
																	: "cursor-not-allowed bg-muted/30 border-border/50 opacity-50"
															)}
														>
															<div className="relative h-9 w-9 mr-3 shrink-0 rounded-md bg-muted/50 p-1.5">
																<Image
																	src={service.icon}
																	alt={service.name}
																	fill
																	className="object-contain"
																	sizes="32px"
																/>
															</div>
															<span className={cn(
																"text-sm font-medium transition-colors",
																service.status === "ready"
																	? "text-foreground group-hover:text-primary"
																	: "text-muted-foreground"
															)}>
																{service.name}
															</span>
															{service.status === "in-development" && (
																<Badge variant="outline" className="ml-auto text-[10px] h-5">
																	Soon
																</Badge>
															)}
														</div>
													))}
												</div>
											) : (
												// Grid layout for other categories
												<div className="grid grid-cols-3 gap-2">
													{services.map((service) => (
														<div
															key={service.id}
															draggable={service.status === "ready"}
															onDragStart={(event) =>
																onDragStart(event, service)
															}
															className={cn(
																"flex flex-col items-center p-3 border rounded-lg transition-all duration-200 group",
																service.status === "ready"
																	? "cursor-grab active:cursor-grabbing bg-card border-border hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm"
																	: "cursor-not-allowed bg-muted/30 border-border/50 opacity-50"
															)}
														>
															<div className="relative h-9 w-9 mb-2 rounded-md bg-muted/50 p-1">
																<Image
																	src={service.icon}
																	alt={service.name}
																	fill
																	className="object-contain"
																	sizes="32px"
																/>
															</div>
															<Tooltip>
																<TooltipTrigger asChild>
																	<span className={cn(
																		"text-xs text-center leading-tight line-clamp-1 transition-colors",
																		service.status === "ready"
																			? "text-foreground group-hover:text-primary"
																			: "text-muted-foreground"
																	)}>
																		{service.name.length > 8
																			? `${service.name.slice(0, 8)}...`
																			: service.name}
																	</span>
																</TooltipTrigger>
																<TooltipContent side="bottom" className="text-xs">
																	{service.name}
																	{service.status === "in-development" && " (Coming soon)"}
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
			<Button
				variant="outline"
				size="icon"
				onClick={onToggle}
				className={cn(
					"fixed z-50 h-12 w-6 rounded-r-lg rounded-l-none border-l-0 shadow-md transition-all duration-300 ease-in-out",
					isOpen ? "left-[320px]" : "left-0"
				)}
				style={{
					top: "calc(50vh + 1.75rem)",
					transform: "translateY(-50%)",
				}}
				aria-label="Toggle Services Sidebar"
			>
				<ChevronRight
					className={cn(
						"h-4 w-4 transition-transform duration-300",
						isOpen && "rotate-180"
					)}
				/>
			</Button>
		</div>
	);
}
