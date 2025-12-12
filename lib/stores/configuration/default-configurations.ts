import type {
	VPCConfiguration,
	EC2Configuration,
	AWSRegionConfiguration,
	AvailabilityZoneConfiguration,
	PrivateSubnetConfiguration,
	PublicSubnetConfiguration,
	AWSResourceConfiguration,
	SecurityGroupConfiguration,
	InternetGatewayConfiguration,
	RouteTableConfiguration,
	NATGatewayConfiguration,
} from "@/lib/types/aws-resources";

// Default configuration values for different service types
export const defaultConfigurations: Record<string, AWSResourceConfiguration> = {
	"aws-vpc": {
		awsVpcId: "AWS VPC",
		cidrBlock: "10.0.0.0/16", // Required: Standard private network CIDR
		awsRegionId: "us-east-1",
		description: "",
		enableDnsSupport: true, // AWS default: true
		enableDnsHostnames: false, // AWS default: false
		instanceTenancy: "default", // AWS default: "default"
		assignGeneratedIpv6CidrBlock: false, // AWS default: false
		tags: { Name: "MyVPC" },
	} as VPCConfiguration,
	"aws-ec2": {
		awsEc2Id: "AWS EC2",
		instanceType: "t3.micro", // Required: Free tier eligible, modern instance type
		amiId: "ami-0c55b159cbfafe1d0", // Required: Amazon Linux 2 AMI (update per region)
		keyPairName: "",

		// Instance Details
		awsRegionId: "us-east-1",
		awsAvailabilityZone: "us-east-1a",
		subnetId: "",
		securityGroups: [],
		iamInstanceProfile: "",

		// Storage
		rootVolumeSize: 8, // AWS default: 8 GB for Linux
		rootVolumeType: "gp3", // Modern default: gp3 (better price/performance than gp2)
		deleteOnTermination: true, // AWS default: true
		encrypted: false, // AWS default: false
		ebsOptimized: false, // AWS default: false (some instances default to true)

		// Monitoring & Management
		detailedMonitoring: false, // AWS default: false
		terminationProtection: false, // AWS default: false
		autoRecovery: true, // AWS default: true (via maintenance_options)
		shutdownBehavior: "stop", // AWS default: "stop" for EBS-backed instances

		// User Data
		userData: "",
		userDataReplaceOnChange: false, // Terraform default: false

		// Network Settings
		associatePublicIpAddress: false, // AWS default: false (subnet setting takes precedence)
		enhancedNetworking: false, // AWS default: false
		privateIp: "",

		// Placement
		tenancy: "default", // AWS default: "default"
		hostId: "",
		placementGroup: "",
		availabilityZone: "us-east-1a",

		// Instance Metadata Service (IMDSv2 recommended)
		metadataOptions: {
			httpEndpoint: "enabled", // AWS default: "enabled"
			httpTokens: "optional", // AWS default: "optional", recommended: "required"
			httpPutResponseHopLimit: 1, // AWS default: 1
			instanceMetadataTags: "disabled", // AWS default: "disabled"
		},

		// CPU Options (for T-series instances)
		cpuCredits: "standard", // AWS default for T2/T3: "standard"

		// Capacity Reservation
		capacityReservationSpecification: {
			capacityReservationPreference: "open", // AWS default: "open"
		},

		// Tags
		tags: { Name: "MyEC2Instance" },
		volumeTags: {},
	} as EC2Configuration,
	"aws-region": {
		awsRegionId: "AWS Region",
		region: "us-east-1",
		regionName: "US East (N. Virginia)",
		description: "",
		isEnabled: true,
		isDefault: true,
		tags: { Name: "MyRegion" },
	} as AWSRegionConfiguration,
	"aws-availability-zone": {
		awsAvailabilityZoneId: "AWS Availability Zone",
		awsRegionId: "us-east-1",
		availabilityZone: "us-east-1a",
		description: "",
		isEnabled: true,
		isPreferred: false,
		tags: { Name: "MyAvailabilityZone", Type: "AvailabilityZone" },
	} as AvailabilityZoneConfiguration,
	"aws-private-subnet": {
		awsPrivateSubnetId: "AWS Private Subnet",
		cidrBlock: "10.0.1.0/24", // Required: Second /24 in VPC CIDR
		awsVpcId: "", // Required: Will be set by parent VPC
		awsRegionId: "us-east-1",
		awsAvailabilityZone: "us-east-1a", // Required
		availabilityZoneId: "",
		description: "",
		mapPublicIpOnLaunch: false, // AWS default: false (correct for private subnets)
		enableNatGateway: false, // Darch custom field: whether to create NAT Gateway
		assignIpv6AddressOnCreation: false, // AWS default: false
		enableDns64: false, // AWS default: false
		enableResourceNameDnsARecordOnLaunch: false, // AWS default: false
		enableResourceNameDnsAAAARecordOnLaunch: false, // AWS default: false
		ipv6Native: false, // AWS default: false
		privateDnsHostnameTypeOnLaunch: "ip-name", // AWS default: "ip-name"
		tags: { Name: "MyPrivateSubnet", Type: "Private" },
	} as PrivateSubnetConfiguration,
	"aws-public-subnet": {
		awsPublicSubnetId: "AWS Public Subnet",
		cidrBlock: "10.0.0.0/24", // Required: First /24 in VPC CIDR
		awsVpcId: "", // Required: Will be set by parent VPC
		awsRegionId: "us-east-1",
		awsAvailabilityZone: "us-east-1a", // Required
		availabilityZoneId: "",
		description: "",
		mapPublicIpOnLaunch: true, // true for public subnets (AWS default: false)
		assignIpv6AddressOnCreation: false, // AWS default: false
		enableDns64: false, // AWS default: false
		enableResourceNameDnsARecordOnLaunch: false, // AWS default: false
		enableResourceNameDnsAAAARecordOnLaunch: false, // AWS default: false
		ipv6Native: false, // AWS default: false
		privateDnsHostnameTypeOnLaunch: "ip-name", // AWS default: "ip-name"
		tags: { Name: "MyPublicSubnet", Type: "Public" },
	} as PublicSubnetConfiguration,
	"aws-security-group": {
		awsSecurityGroupId: "AWS Security Group",
		name: "", // Will be auto-generated if not provided
		awsVpcId: "", // Required: VPC ID
		description: "Managed by Terraform", // AWS/Terraform default
		ingressRules: [], // No ingress rules by default (deny all inbound)
		egressRules: [
			// Note: AWS creates "allow all" egress by default, but Terraform removes it
			// This is the typical pattern for allowing all outbound traffic
			{
				protocol: "all",
				fromPort: 0,
				toPort: 0,
				port: "all", // Backward compatibility
				cidrBlocks: ["0.0.0.0/0"],
				ipv6CidrBlocks: ["::/0"],
				destination: "0.0.0.0/0", // Backward compatibility
				description: "Allow all outbound traffic",
			},
		],
		revokeRulesOnDelete: false, // AWS default: false
		tags: { Name: "MySecurityGroup" },
	} as SecurityGroupConfiguration,
	"aws-internet-gateway": {
		awsInternetGatewayId: "AWS Internet Gateway",
		awsVpcId: "", // Optional: VPC ID (can be attached later)
		description: "",
		tags: { Name: "MyInternetGateway" },
	} as InternetGatewayConfiguration,
	"aws-route-table": {
		awsRouteTableId: "AWS Route Table",
		awsVpcId: "", // Required: VPC ID
		awsInternetGatewayId: "", // Convenience field (not AWS parameter)
		awsSubnetId: "", // Convenience field (not AWS parameter)
		routes: [], // Routes (local route to VPC CIDR is implicit)
		associations: [], // Subnet associations
		propagatingVgws: [], // Virtual gateway IDs for route propagation
		description: "",
		tags: { Name: "MyRouteTable" },
	} as RouteTableConfiguration,
	"aws-nat-gateway": {
		awsNatGatewayId: "AWS NAT Gateway",
		awsSubnetId: "", // Required: Public subnet ID for NAT Gateway
		allocationId: "", // Required for public NAT Gateway: Elastic IP allocation ID
		connectivityType: "public", // AWS default: "public"
		privateIp: "", // For private NAT Gateway
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
