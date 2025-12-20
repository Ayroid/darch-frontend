import type {
	VPCConfiguration,
	EC2Configuration,
	AWSRegionConfiguration,
	AvailabilityZoneConfiguration,
	SubnetConfiguration,
	AWSResourceConfiguration,
	SecurityGroupConfiguration,
	InternetGatewayConfiguration,
	RouteTableConfiguration,
	NATGatewayConfiguration,
} from "../../types/aws-resources";

// Default configuration values for different service types
export const defaultConfigurations: Record<string, AWSResourceConfiguration> = {
	"aws-vpc": {
		cidr_block: "10.0.0.0/16", // Required: Standard private network CIDR
		region: "us-east-1",
		description: "",
		enable_dns_support: true, // AWS default: true
		enable_dns_hostnames: false, // AWS default: false
		instance_tenancy: "default", // AWS default: "default"
		assign_generated_ipv6_cidr_block: false, // AWS default: false
		tags: { Name: "MyVPC" },
	} as VPCConfiguration,
	"aws-ec2": {
		instance_type: "t3.micro", // Required: Free tier eligible, modern instance type
		ami_id: "latest", // Required: Amazon Linux 2 AMI (update per region)
		key_pair_name: "",

		// Instance Details
		region: "us-east-1",
		availability_zone: "us-east-1a",
		subnet_id: "",
		security_groups: [],
		iam_instance_profile: "",

		// Storage
		root_volume_size: 8, // AWS default: 8 GB for Linux
		root_volume_type: "gp3", // Modern default: gp3 (better price/performance than gp2)
		delete_on_termination: true, // AWS default: true
		encrypted: false, // AWS default: false
		ebs_optimized: false, // AWS default: false (some instances default to true)

		// Monitoring & Management
		detailed_monitoring: false, // AWS default: false
		termination_protection: false, // AWS default: false
		auto_recovery: true, // AWS default: true (via maintenance_options)
		shutdown_behavior: "stop", // AWS default: "stop" for EBS-backed instances

		// User Data
		user_data: "",
		user_data_replace_on_change: false, // Terraform default: false

		// Network Settings
		associate_public_ip_address: false, // AWS default: false (subnet setting takes precedence)
		enhanced_networking: false, // AWS default: false
		private_ip: "",

		// Placement
		tenancy: "default", // AWS default: "default"
		host_id: "",
		placement_group: "",

		// Instance Metadata Service (IMDSv2 recommended)
		metadata_options: {
			http_endpoint: "enabled", // AWS default: "enabled"
			http_tokens: "optional", // AWS default: "optional", recommended: "required"
			http_put_response_hop_limit: 1, // AWS default: 1
			instance_metadata_tags: "disabled", // AWS default: "disabled"
		},

		// CPU Options (for T-series instances)
		cpu_credits: "standard", // AWS default for T2/T3: "standard"

		// Capacity Reservation
		capacity_reservation_specification: {
			capacity_reservation_preference: "open", // AWS default: "open"
		},

		// Tags
		tags: { Name: "MyEC2Instance" },
		volume_tags: {},
	} as EC2Configuration,
	"aws-region": {
		region: "us-east-1",
		region_name: "US East (N. Virginia)",
		description: "",
		is_enabled: true,
		is_default: true,
		tags: { Name: "MyRegion" },
	} as AWSRegionConfiguration,
	"aws-availability-zone": {
		region: "us-east-1",
		availability_zone: "us-east-1a",
		description: "",
		is_enabled: true,
		is_preferred: false,
		tags: { Name: "MyAvailabilityZone", Type: "AvailabilityZone" },
	} as AvailabilityZoneConfiguration,
	"aws-subnet": {
		subnet_type: "public" as const,
		cidr_block: "10.0.0.0/24", // Required: First /24 in VPC CIDR
		vpc_id: "", // Required: Will be set by parent VPC
		region: "us-east-1",
		availability_zone: "us-east-1a", // Required
		availability_zone_id: "",
		description: "",
		map_public_ip_on_launch: false, // AWS default: false (can be changed based on subnet_type)
		assign_ipv6_address_on_creation: false, // AWS default: false
		enable_dns64: false, // AWS default: false
		enable_resource_name_dns_a_record_on_launch: false, // AWS default: false
		enable_resource_name_dns_aaaa_record_on_launch: false, // AWS default: false
		ipv6_native: false, // AWS default: false
		private_dns_hostname_type_on_launch: "ip-name", // AWS default: "ip-name"
		tags: { Name: "MySubnet" },
	} as SubnetConfiguration,
	"aws-security-group": {
		name: "", // Will be auto-generated if not provided
		vpc_id: "", // Required: VPC ID
		description: "Managed by Terraform", // AWS/Terraform default
		ingress_rules: [], // No ingress rules by default (deny all inbound)
		egress_rules: [
			// Note: AWS creates "allow all" egress by default, but Terraform removes it
			// This is the typical pattern for allowing all outbound traffic
			{
				protocol: "all",
				from_port: 0,
				to_port: 0,
				port: "all", // Backward compatibility
				cidr_blocks: ["0.0.0.0/0"],
				ipv6_cidr_blocks: ["::/0"],
				destination: "0.0.0.0/0", // Backward compatibility
				description: "Allow all outbound traffic",
			},
		],
		revoke_rules_on_delete: false, // AWS default: false
		tags: { Name: "MySecurityGroup" },
	} as SecurityGroupConfiguration,
	"aws-internet-gateway": {
		vpc_id: "", // Optional: VPC ID (can be attached later)
		description: "",
		tags: { Name: "MyInternetGateway" },
	} as InternetGatewayConfiguration,
	"aws-route-table": {
		vpc_id: "", // Required: VPC ID
		internet_gateway_id: "", // Convenience field (not AWS parameter)
		subnet_id: "", // Convenience field (not AWS parameter)
		routes: {}, // Routes (local route to VPC CIDR is implicit)
		associations: {}, // Subnet associations
		propagating_vgws: [], // Virtual gateway IDs for route propagation
		description: "",
		tags: { Name: "MyRouteTable" },
	} as RouteTableConfiguration,
	"aws-nat-gateway": {
		subnet_id: "", // Required: Public subnet ID for NAT Gateway
		allocation_id: "", // Required for public NAT Gateway: Elastic IP allocation ID
		connectivity_type: "public", // AWS default: "public"
		private_ip: "", // For private NAT Gateway
		description: "",
		tags: { Name: "MyNATGateway" },
	} as NATGatewayConfiguration,
};

// Utility function to get default configuration for a service type
export const getDefaultConfiguration = (
	resourceType: string
): AWSResourceConfiguration => {
	return (
		defaultConfigurations[resourceType] ||
		({
			awsResourceId: "Unknown Service",
		} as AWSResourceConfiguration)
	);
};
