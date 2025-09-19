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
		cidrBlock: "10.0.0.0/16",
		awsRegionId: "us-east-1",
		enableDnsSupport: true,
		enableDnsHostnames: true,
		tags: { Name: "MyVPC" },
	} as VPCConfiguration,
	"aws-ec2": {
		awsEc2Id: "AWS EC2",
		instanceType: "t3.micro",
		amiId: "ami-0c55b159cbfafe1d0",
		keyPairName: "",
		awsRegionId: "us-east-1",
		awsAvailabilityZone: "us-east-1a",
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
		tags: { Name: "MyEC2Instance" },
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
		cidrBlock: "10.0.1.0/24",
		awsAvailabilityZone: "us-east-1a",
		awsVpcId: "",
		awsRegionId: "us-east-1",
		description: "",
		mapPublicIpOnLaunch: false,
		enableNatGateway: false,
		tags: { Name: "MyPrivateSubnet", Type: "Private" },
	} as PrivateSubnetConfiguration,
	"aws-public-subnet": {
		awsPublicSubnetId: "AWS Public Subnet",
		cidrBlock: "10.0.0.0/24",
		awsAvailabilityZone: "us-east-1a",
		awsVpcId: "",
		awsRegionId: "us-east-1",
		description: "",
		mapPublicIpOnLaunch: true,
		tags: { Name: "MyPublicSubnet", Type: "Public" },
	} as PublicSubnetConfiguration,
	"aws-security-group": {
		awsSecurityGroupId: "AWS Security Group",
		awsVpcId: "",
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
		tags: { Name: "MySecurityGroup" },
	} as SecurityGroupConfiguration,
	"aws-internet-gateway": {
		awsInternetGatewayId: "AWS Internet Gateway",
		awsVpcId: "",
		tags: { Name: "MyInternetGateway" },
	} as InternetGatewayConfiguration,
	"aws-route-table": {
		awsRouteTableId: "AWS Route Table",
		awsVpcId: "",
		routes: [],
		associations: [],
		subnetIds: [],
		tags: { Name: "MyRouteTable" },
	} as RouteTableConfiguration,
	"aws-nat-gateway": {
		awsNatGatewayId: "AWS NAT Gateway",
		awsSubnetId: "",
		allocationId: "",
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
