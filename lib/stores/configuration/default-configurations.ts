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
export const defaultConfigurations: Record<
	string,
	Partial<AWSResourceConfiguration>
> = {
	"aws-vpc": {
		serviceName: "default-vpc-name",
		resourceType: "aws-vpc",
		cidrBlock: "10.0.0.0/16",
		region: "us-east-1",
		enableDnsSupport: true,
		enableDnsHostnames: true,
		tags: "",
	} as Partial<VPCConfiguration>,

	"aws-ec2": {
		serviceName: "default-ec2-name",
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
	} as Partial<EC2Configuration>,

	"aws-region": {
		serviceName: "default-region-name",
		resourceType: "aws-region",
		region: "us-east-1",
		regionName: "US East (N. Virginia)",
		description: "",
		isEnabled: true,
		isDefault: true,
		tags: "",
	} as Partial<AWSRegionConfiguration>,

	"aws-availability-zone": {
		serviceName: "default-availability-zone",
		resourceType: "aws-availability-zone",
		region: "us-east-1",
		availabilityZone: "us-east-1a",
		description: "",
		isEnabled: true,
		isPreferred: false,
		tags: "",
	} as Partial<AvailabilityZoneConfiguration>,

	"aws-private-subnet": {
		serviceName: "default-private-subnet",
		resourceType: "aws-private-subnet",
		cidrBlock: "10.0.1.0/24",
		region: "us-east-1",
		availabilityZone: "us-east-1a",
		vpcId: "",
		routeTableId: "",
		tags: "",
	} as Partial<PrivateSubnetConfiguration>,

	"aws-public-subnet": {
		serviceName: "default-public-subnet",
		resourceType: "aws-public-subnet",
		cidrBlock: "10.0.0.0/24",
		region: "us-east-1",
		availabilityZone: "us-east-1a",
		vpcId: "",
		routeTableId: "",
		internetGatewayId: "",
		tags: "",
	} as Partial<PublicSubnetConfiguration>,

	"aws-security-group": {
		serviceName: "default-security-group",
		resourceType: "aws-security-group",
		vpcId: "",
		description: "",
		ingressRules: [],
		egressRules: [
			{ protocol: "all", port: "all", destination: "0.0.0.0/0", description: "All outbound" },
		],
		tags: {},
	} as Partial<SecurityGroupConfiguration>,
};

// Utility function to get default configuration for a service type
export const getDefaultConfiguration = (
	serviceId: string
): AWSResourceConfiguration => {
	const defaultConfig = defaultConfigurations[serviceId] || {};
	return {
		...defaultConfig,
		resourceType: serviceId, // Ensure resourceType is always set
	};
};
