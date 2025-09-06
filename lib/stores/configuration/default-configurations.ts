import type {
	VPCConfiguration,
	EC2Configuration,
	AWSRegionConfiguration,
	AvailabilityZoneConfiguration,
	PrivateSubnetConfiguration,
	PublicSubnetConfiguration,
	AWSResourceConfiguration,
	SecurityGroupConfiguration,
} from "@/lib/types/aws-resources";

// Default configuration values for different service types
export const defaultConfigurations: Record<string, AWSResourceConfiguration> = {
	"aws-vpc": {
		serviceName: "VPC",
		cidrBlock: "10.0.0.0/16",
		region: "us-east-1",
		enableDnsSupport: true,
		enableDnsHostnames: true,
		tags: "Environment=Development",
	} as VPCConfiguration,
	"aws-ec2": {
		serviceName: "EC2",
		instanceType: "t3.micro",
		amiId: "ami-0c55b159cbfafe1d0",
		keyPairName: "",
		availabilityZone: "us-east-1a",
		subnetId: "",
		securityGroups: [],
		rootVolumeSize: 8,
		rootVolumeType: "gp3",
		deleteOnTermination: true,
		encrypted: false,
		detailedMonitoring: false,
		terminationProtection: false,
		autoRecovery: true,
		associatePublicIpAddress: false,
		tenancy: "default",
		tags: {},
	} as EC2Configuration,
	"aws-region": {
		serviceName: "AWS Region",
		region: "us-east-1",
		regionName: "US East (N. Virginia)",
		description: "",
		isEnabled: true,
		isDefault: true,
		tags: "Type=Region",
	} as AWSRegionConfiguration,
	"aws-availability-zone": {
		serviceName: "Availability Zone",
		region: "us-east-1",
		availabilityZone: "us-east-1a",
		description: "",
		isEnabled: true,
		isPreferred: false,
		tags: "Type=AvailabilityZone",
	} as AvailabilityZoneConfiguration,
	"aws-private-subnet": {
		serviceName: "Private Subnet",
		cidrBlock: "10.0.1.0/24",
		availabilityZone: "us-east-1a",
		vpcId: "",
		region: "us-east-1",
		description: "",
		mapPublicIpOnLaunch: false,
		enableNatGateway: false,
		tags: "Type=Private",
	} as PrivateSubnetConfiguration,
	"aws-public-subnet": {
		serviceName: "Public Subnet",
		cidrBlock: "10.0.0.0/24",
		availabilityZone: "us-east-1a",
		vpcId: "",
		region: "us-east-1",
		description: "",
		mapPublicIpOnLaunch: true,
		tags: "Type=Public",
	} as PublicSubnetConfiguration,
	"aws-security-group": {
		serviceName: "Security Group",
		vpcId: "",
		description: "",
		ingressRules: [],
		egressRules: [
			{
				protocol: "all",
				port: "all",
				destination: "0.0.0.0/0",
				description: "All outbound",
			},
		],
		tags: {},
	} as SecurityGroupConfiguration,
};

// Utility function to get default configuration for a service type
export const getDefaultConfiguration = (
	resourceType: string
): AWSResourceConfiguration => {
		return defaultConfigurations[resourceType] || {
		serviceName: 'Unknown Service',
	} as AWSResourceConfiguration;
};
