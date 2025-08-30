import type {
	VPCConfiguration,
	EC2Configuration,
	AWSRegionConfiguration,
	AvailabilityZoneConfiguration,
	PrivateSubnetConfiguration,
	PublicSubnetConfiguration,
	Available_AWS_Resource_Configuration,
} from "@/lib/types/aws-resources";

// Default configuration values for different service types
export const defaultConfigurations: Record<
	string,
	Partial<Available_AWS_Resource_Configuration>
> = {
	"aws-vpc": {
		name: "vpc-main",
		cidrBlock: "10.0.0.0/16",
		region: "us-east-1",
		enableDnsSupport: true,
		enableDnsHostnames: true,
		tags: "",
	} as Partial<VPCConfiguration>,

	"aws-ec2": {
		name: "ec2-instance",
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
		name: "us-east-1",
		displayName: "US East (N. Virginia)",
		description: "",
	} as Partial<AWSRegionConfiguration>,

	"aws-availability-zone": {
		name: "us-east-1a",
		region: "us-east-1",
		state: "available",
	} as Partial<AvailabilityZoneConfiguration>,

	"aws-private-subnet": {
		name: "private-subnet",
		cidrBlock: "10.0.1.0/24",
		availabilityZone: "us-east-1a",
		vpcId: "",
		routeTableId: "",
		tags: "",
	} as Partial<PrivateSubnetConfiguration>,

	"aws-public-subnet": {
		name: "public-subnet",
		cidrBlock: "10.0.0.0/24",
		availabilityZone: "us-east-1a",
		vpcId: "",
		routeTableId: "",
		internetGatewayId: "",
		tags: "",
	} as Partial<PublicSubnetConfiguration>,
};

// Utility function to get default configuration for a service type
export const getDefaultConfiguration = (
	serviceId: string
): Available_AWS_Resource_Configuration => {
	return defaultConfigurations[serviceId] || {};
};
