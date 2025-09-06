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
		serviceId: "aws-vpc",
		resourceType: "aws-vpc",
		cidrBlock: "10.0.0.0/16",
		region: "us-east-1",
		enableDnsSupport: true,
		enableDnsHostnames: true,
		tags: "Environment=Development",
	} as VPCConfiguration,
	"aws-ec2": {
		serviceName: "EC2",
		serviceId: "aws-ec2",
		resourceType: "aws-ec2",
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
		serviceId: "aws-region",
		resourceType: "aws-region",
		region: "us-east-1",
		regionName: "US East (N. Virginia)",
		description: "",
		isEnabled: true,
		isDefault: true,
		tags: "Type=Region",
	} as AWSRegionConfiguration,
	"aws-availability-zone": {
		serviceName: "Availability Zone",
		serviceId: "aws-availability-zone",
		resourceType: "aws-availability-zone",
		region: "us-east-1",
		availabilityZone: "us-east-1a",
		description: "",
		isEnabled: true,
		isPreferred: false,
		tags: "Type=AvailabilityZone",
	} as AvailabilityZoneConfiguration,
	"aws-private-subnet": {
		serviceName: "Private Subnet",
		serviceId: "aws-private-subnet",
		resourceType: "aws-private-subnet",
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
		serviceId: "aws-public-subnet",
		resourceType: "aws-public-subnet",
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
		serviceId: "aws-security-group",
		resourceType: "aws-security-group",
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
	serviceType: string
): AWSResourceConfiguration => {
		return defaultConfigurations[serviceType] || {
		serviceName: 'Unknown Service',
		serviceType: serviceType,
		resourceType: serviceType
	} as AWSResourceConfiguration;
};
