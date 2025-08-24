import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface VPCConfiguration {
	// Basic VPC Configuration
	name: string;
	cidrBlock: string;
	region: string;
	availabilityZones: string[];

	// VPC Settings
	enableDnsSupport: boolean;
	enableDnsHostnames: boolean;
	enableClassiclink: boolean;
	enableClassiclinkDnsSupport: boolean;
	assignGeneratedIpv6CidrBlock: boolean;

	// Subnet Configuration
	createPublicSubnets: boolean;
	createPrivateSubnets: boolean;
	createIntraSubnets: boolean;
	publicSubnetCidrs: string[];
	privateSubnetCidrs: string[];
	intraSubnetCidrs: string[];

	// Gateway Configuration
	createInternetGateway: boolean;
	createNatGateway: boolean;
	singleNatGateway: boolean;
	oneNatGatewayPerAz: boolean;
	reuseNatIps: boolean;
	externalNatIpIds: string[];

	// Route Table Configuration
	createPublicRouteTable: boolean;
	createPrivateRouteTable: boolean;
	createIntraRouteTable: boolean;
	publicRouteTableTags: Record<string, string>;
	privateRouteTableTags: Record<string, string>;

	// VPC Flow Logs
	enableVpcFlowLogs: boolean;
	flowLogsDestinationType: string; // 'cloud-watch-logs' | 's3'
	flowLogsLogDestination: string;
	flowLogsLogFormat: string;
	flowLogsTrafficType: string; // 'ALL' | 'ACCEPT' | 'REJECT'

	// DHCP Options
	createDhcpOptions: boolean;
	dhcpOptionsDomainName: string;
	dhcpOptionsDomainNameServers: string[];
	dhcpOptionsNtpServers: string[];
	dhcpOptionsNetbiosNameServers: string[];
	dhcpOptionsNetbiosNodeType: string;

	// VPN Gateway
	createVpnGateway: boolean;
	vpnGatewayId: string;
	vpnGatewayAz: string;

	// Tags
	tags: Record<string, string>;
	vpcTags: Record<string, string>;
	publicSubnetTags: Record<string, string>;
	privateSubnetTags: Record<string, string>;
	intraSubnetTags: Record<string, string>;
	natGatewayTags: Record<string, string>;
	internetGatewayTags: Record<string, string>;
}

const VPCConfigurationForm: React.FC<{
	config: Record<string, unknown>;
	onChange: (config: Record<string, unknown>) => void;
}> = ({ config, onChange }) => {
	const updateConfig = (
		key: keyof VPCConfiguration,
		value: VPCConfiguration[keyof VPCConfiguration]
	) => {
		onChange({ ...config, [key]: value });
	};

	return (
		<div className="space-y-6">
			{/* Basic Configuration */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Basic Configuration
				</h3>

				<div className="space-y-2">
					<Label htmlFor="vpc-name">
						VPC Name <span className="text-red-500">*</span>
					</Label>
					<Input
						id="vpc-name"
						placeholder="e.g., my-vpc"
						value={(config.name as string) || ""}
						onChange={(e) => updateConfig("name", e.target.value)}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="cidr-block">
						VPC CIDR Block <span className="text-red-500">*</span>
					</Label>
					<Input
						id="cidr-block"
						placeholder="e.g., 10.0.0.0/16"
						value={(config.cidrBlock as string) || ""}
						onChange={(e) => updateConfig("cidrBlock", e.target.value)}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="region">
						Region <span className="text-red-500">*</span>
					</Label>				<Select
					value={(config.region as string) || ""}
					onValueChange={(value) => updateConfig("region", value)}
				>
						<SelectTrigger>
							<SelectValue placeholder="Select AWS region" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="us-east-1">us-east-1</SelectItem>
							<SelectItem value="us-east-2">us-east-2</SelectItem>
							<SelectItem value="us-west-1">us-west-1</SelectItem>
							<SelectItem value="us-west-2">us-west-2</SelectItem>
							<SelectItem value="eu-west-1">eu-west-1</SelectItem>
							<SelectItem value="eu-west-2">eu-west-2</SelectItem>
							<SelectItem value="eu-central-1">eu-central-1</SelectItem>
							<SelectItem value="ap-southeast-1">ap-southeast-1</SelectItem>
							<SelectItem value="ap-southeast-2">ap-southeast-2</SelectItem>
							<SelectItem value="ap-northeast-1">ap-northeast-1</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="availability-zones">
						Availability Zones <span className="text-red-500">*</span>
					</Label>
					<Textarea
						id="availability-zones"
						placeholder="Enter availability zones, comma-separated (e.g., us-east-1a, us-east-1b)"
						value={(config.availabilityZones as string[])?.join(", ") || ""}
						onChange={(e) =>
							updateConfig(
								"availabilityZones",
								e.target.value.split(",").map((az) => az.trim())
							)
						}
					/>
				</div>
			</div>

			{/* VPC Settings */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					VPC Settings
				</h3>

				<div className="grid grid-cols-1 gap-3">
					<div className="flex items-center space-x-2">
						<Checkbox
							id="enable-dns-support"
							checked={(config.enableDnsSupport as boolean) || false}
							onCheckedChange={(checked) =>
								updateConfig("enableDnsSupport", checked)
							}
						/>
						<Label htmlFor="enable-dns-support">Enable DNS support</Label>
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="enable-dns-hostnames"
							checked={(config.enableDnsHostnames as boolean) || false}
							onCheckedChange={(checked) =>
								updateConfig("enableDnsHostnames", checked)
							}
						/>
						<Label htmlFor="enable-dns-hostnames">Enable DNS hostnames</Label>
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="assign-ipv6-cidr"
							checked={(config.assignGeneratedIpv6CidrBlock as boolean) || false}
							onCheckedChange={(checked) =>
								updateConfig("assignGeneratedIpv6CidrBlock", checked)
							}
						/>
						<Label htmlFor="assign-ipv6-cidr">Assign IPv6 CIDR block</Label>
					</div>
				</div>
			</div>

			{/* Subnet Configuration */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Subnet Configuration
				</h3>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="create-public-subnets"
						checked={(config.createPublicSubnets as boolean) || false}
						onCheckedChange={(checked) =>
							updateConfig("createPublicSubnets", checked)
						}
					/>
					<Label htmlFor="create-public-subnets">Create public subnets</Label>
				</div>

				{(config.createPublicSubnets as boolean) && (
					<div className="space-y-2">
						<Label htmlFor="public-subnet-cidrs">Public Subnet CIDRs</Label>
						<Textarea
							id="public-subnet-cidrs"
							placeholder="Enter public subnet CIDRs, comma-separated (e.g., 10.0.1.0/24, 10.0.2.0/24)"
							value={(config.publicSubnetCidrs as string[])?.join(", ") || ""}
							onChange={(e) =>
								updateConfig(
									"publicSubnetCidrs",
									e.target.value.split(",").map((cidr) => cidr.trim())
								)
							}
						/>
					</div>
				)}

				<div className="flex items-center space-x-2">
					<Checkbox
						id="create-private-subnets"
						checked={(config.createPrivateSubnets as boolean) || false}
						onCheckedChange={(checked) =>
							updateConfig("createPrivateSubnets", checked)
						}
					/>
					<Label htmlFor="create-private-subnets">Create private subnets</Label>
				</div>

				{(config.createPrivateSubnets as boolean) && (
					<div className="space-y-2">
						<Label htmlFor="private-subnet-cidrs">Private Subnet CIDRs</Label>
						<Textarea
							id="private-subnet-cidrs"
							placeholder="Enter private subnet CIDRs, comma-separated (e.g., 10.0.10.0/24, 10.0.20.0/24)"
							value={(config.privateSubnetCidrs as string[])?.join(", ") || ""}
							onChange={(e) =>
								updateConfig(
									"privateSubnetCidrs",
									e.target.value.split(",").map((cidr) => cidr.trim())
								)
							}
						/>
					</div>
				)}

				<div className="flex items-center space-x-2">
					<Checkbox
						id="create-intra-subnets"
						checked={(config.createIntraSubnets as boolean) || false}
						onCheckedChange={(checked) =>
							updateConfig("createIntraSubnets", checked)
						}
					/>
					<Label htmlFor="create-intra-subnets">
						Create intra subnets (no internet access)
					</Label>
				</div>

				{(config.createIntraSubnets as boolean) && (
					<div className="space-y-2">
						<Label htmlFor="intra-subnet-cidrs">Intra Subnet CIDRs</Label>
						<Textarea
							id="intra-subnet-cidrs"
							placeholder="Enter intra subnet CIDRs, comma-separated (e.g., 10.0.30.0/24, 10.0.40.0/24)"
							value={(config.intraSubnetCidrs as string[])?.join(", ") || ""}
							onChange={(e) =>
								updateConfig(
									"intraSubnetCidrs",
									e.target.value.split(",").map((cidr) => cidr.trim())
								)
							}
						/>
					</div>
				)}
			</div>

			{/* Gateway Configuration */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Gateway Configuration
				</h3>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="create-internet-gateway"
						checked={(config.createInternetGateway as boolean) || false}
						onCheckedChange={(checked) =>
							updateConfig("createInternetGateway", checked)
						}
					/>
					<Label htmlFor="create-internet-gateway">
						Create internet gateway
					</Label>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="create-nat-gateway"
						checked={(config.createNatGateway as boolean) || false}
						onCheckedChange={(checked) =>
							updateConfig("createNatGateway", checked)
						}
					/>
					<Label htmlFor="create-nat-gateway">Create NAT gateway</Label>
				</div>

				{(config.createNatGateway as boolean) && (
					<>
						<div className="flex items-center space-x-2">
							<Checkbox
								id="single-nat-gateway"
								checked={(config.singleNatGateway as boolean) || false}
								onCheckedChange={(checked) =>
									updateConfig("singleNatGateway", checked)
								}
							/>
							<Label htmlFor="single-nat-gateway">
								Single NAT gateway (cost-effective)
							</Label>
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox
								id="one-nat-per-az"
								checked={(config.oneNatGatewayPerAz as boolean) || false}
								onCheckedChange={(checked) =>
									updateConfig("oneNatGatewayPerAz", checked)
								}
							/>
							<Label htmlFor="one-nat-per-az">
								One NAT gateway per AZ (high availability)
							</Label>
						</div>
					</>
				)}
			</div>

			{/* VPC Flow Logs */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					VPC Flow Logs
				</h3>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="enable-vpc-flow-logs"
						checked={(config.enableVpcFlowLogs as boolean) || false}
						onCheckedChange={(checked) =>
							updateConfig("enableVpcFlowLogs", checked)
						}
					/>
					<Label htmlFor="enable-vpc-flow-logs">Enable VPC flow logs</Label>
				</div>

				{(config.enableVpcFlowLogs as boolean) && (
					<>
						<div className="space-y-2">
							<Label htmlFor="flow-logs-destination">Destination Type</Label>
							<Select
								value={(config.flowLogsDestinationType as string) || ""}
								onValueChange={(value) =>
									updateConfig("flowLogsDestinationType", value)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select destination type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="cloud-watch-logs">
										CloudWatch Logs
									</SelectItem>
									<SelectItem value="s3">S3 Bucket</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="flow-logs-traffic-type">Traffic Type</Label>
							<Select
								value={(config.flowLogsTrafficType as string) || ""}
								onValueChange={(value) =>
									updateConfig("flowLogsTrafficType", value)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select traffic type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ALL">All traffic</SelectItem>
									<SelectItem value="ACCEPT">Accepted traffic only</SelectItem>
									<SelectItem value="REJECT">Rejected traffic only</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default VPCConfigurationForm;
export type { VPCConfiguration };