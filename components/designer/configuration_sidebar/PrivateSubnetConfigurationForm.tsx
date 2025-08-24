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

interface PrivateSubnetConfiguration {
	// Basic Subnet Configuration
	name: string;
	subnetId: string;
	cidrBlock: string;
	vpcId: string;
	availabilityZone: string;

	// Subnet Properties
	description: string;
	state: string; // 'pending' | 'available' | 'unavailable'
	mapPublicIpOnLaunch: boolean;
	assignIpv6AddressOnCreation: boolean;

	// IPv6 Configuration
	ipv6CidrBlock: string;
	ipv6Native: boolean;

	// Route Table
	routeTableId: string;
	routeTableAssociation: string;

	// NAT Gateway Configuration
	natGatewayId: string;
	natGatewaySubnet: string;
	enableNatGateway: boolean;

	// Network ACL
	networkAclId: string;
	networkAclAssociation: string;

	// DNS Configuration
	enableDnsSupport: boolean;
	enableDnsHostnames: boolean;
	privateDnsNameOptions: {
		hostnameType: string; // 'ip-name' | 'resource-name'
		enableResourceNameDnsAAAARecord: boolean;
		enableResourceNameDnsARecord: boolean;
	};

	// Security & Access
	flowLogsEnabled: boolean;
	flowLogsDestination: string; // 'cloudwatch-logs' | 's3' | 'kinesis-data-firehose'
	flowLogsRoleArn: string;

	// Monitoring
	enableDetailedMonitoring: boolean;
	cloudWatchLogGroup: string;

	// Resource Sharing
	shareWithOrganization: boolean;
	allowedAccounts: string[];

	// DHCP Options
	dhcpOptionsId: string;
	customDhcpOptions: {
		domainName: string;
		domainNameServers: string[];
		ntpServers: string[];
		netbiosNameServers: string[];
		netbiosNodeType: number;
	};

	// Instance Tenancy
	instanceTenancy: string; // 'default' | 'dedicated' | 'host'

	// Compliance & Governance
	enforceNetworkSegmentation: boolean;
	restrictInternetAccess: boolean;
	requireEncryptionInTransit: boolean;

	// Cost Optimization
	costAllocation: {
		costCenter: string;
		project: string;
		environment: string;
	};

	// Tags
	tags: Record<string, string>;
}

const PrivateSubnetConfigurationForm: React.FC<{
	config: Record<string, unknown>;
	onChange: (config: Record<string, unknown>) => void;
}> = ({ config, onChange }) => {
	const updateConfig = (
		key: keyof PrivateSubnetConfiguration,
		value: PrivateSubnetConfiguration[keyof PrivateSubnetConfiguration]
	) => {
		onChange({ ...config, [key]: value });
	};

	const updateCostAllocation = (
		key: string,
		value: string
	) => {
		const costAllocation = (config.costAllocation as PrivateSubnetConfiguration["costAllocation"]) || {};
		updateConfig("costAllocation", { ...costAllocation, [key]: value });
	};

	const updatePrivateDnsNameOptions = (
		key: string,
		value: string | boolean
	) => {
		const privateDnsNameOptions = (config.privateDnsNameOptions as PrivateSubnetConfiguration["privateDnsNameOptions"]) || {};
		updateConfig("privateDnsNameOptions", { ...privateDnsNameOptions, [key]: value });
	};

	const updateTags = (newTags: Record<string, string>) => {
		updateConfig("tags", newTags);
	};

	const parseTagsFromString = (tagString: string): Record<string, string> => {
		const tags: Record<string, string> = {};
		tagString.split(",").forEach((tag) => {
			const [key, value] = tag.split("=").map((s) => s.trim());
			if (key && value) {
				tags[key] = value;
			}
		});
		return tags;
	};

	const tagsToString = (tags: Record<string, string> = {}): string => {
		return Object.entries(tags)
			.map(([key, value]) => `${key}=${value}`)
			.join(", ");
	};

	return (
		<div className="space-y-6">
			{/* Basic Configuration */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Basic Configuration
				</h3>

				<div className="space-y-2">
					<Label htmlFor="name">
						Subnet Name <span className="text-red-500">*</span>
					</Label>
					<Input
						id="name"
						value={(config.name as string) || ""}
						onChange={(e) => updateConfig("name", e.target.value)}
						placeholder="e.g., Private Subnet A"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="subnetId">Subnet ID</Label>
					<Input
						id="subnetId"
						value={(config.subnetId as string) || ""}
						onChange={(e) => updateConfig("subnetId", e.target.value)}
						placeholder="subnet-xxxxxxxxx"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="cidrBlock">
						CIDR Block <span className="text-red-500">*</span>
					</Label>
					<Input
						id="cidrBlock"
						value={(config.cidrBlock as string) || ""}
						onChange={(e) => updateConfig("cidrBlock", e.target.value)}
						placeholder="10.0.1.0/24"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="vpcId">
						VPC ID <span className="text-red-500">*</span>
					</Label>
					<Input
						id="vpcId"
						value={(config.vpcId as string) || ""}
						onChange={(e) => updateConfig("vpcId", e.target.value)}
						placeholder="vpc-xxxxxxxxx"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="availabilityZone">
						Availability Zone <span className="text-red-500">*</span>
					</Label>
					<Input
						id="availabilityZone"
						value={(config.availabilityZone as string) || ""}
						onChange={(e) => updateConfig("availabilityZone", e.target.value)}
						placeholder="us-east-1a"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="description">Description</Label>
					<Textarea
						id="description"
						value={(config.description as string) || ""}
						onChange={(e) => updateConfig("description", e.target.value)}
						placeholder="Describe the purpose of this private subnet..."
						rows={3}
					/>
				</div>
			</div>

			{/* Subnet Properties */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Subnet Properties
				</h3>

				<div className="space-y-2">
					<Label htmlFor="state">State</Label>
					<Select
						value={(config.state as string) || ""}
						onValueChange={(value) => updateConfig("state", value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select State" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="pending">Pending</SelectItem>
							<SelectItem value="available">Available</SelectItem>
							<SelectItem value="unavailable">Unavailable</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="grid grid-cols-1 gap-3">
					<div className="flex items-center space-x-2">
						<Checkbox
							id="mapPublicIpOnLaunch"
							checked={(config.mapPublicIpOnLaunch as boolean) || false}
							onCheckedChange={(checked) =>
								updateConfig("mapPublicIpOnLaunch", checked)
							}
						/>
						<Label htmlFor="mapPublicIpOnLaunch">
							Map public IP on launch (not recommended for private subnets)
						</Label>
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="assignIpv6AddressOnCreation"
							checked={(config.assignIpv6AddressOnCreation as boolean) || false}
							onCheckedChange={(checked) =>
								updateConfig("assignIpv6AddressOnCreation", checked)
							}
						/>
						<Label htmlFor="assignIpv6AddressOnCreation">
							Assign IPv6 address on creation
						</Label>
					</div>
				</div>
			</div>

			{/* IPv6 Configuration */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					IPv6 Configuration
				</h3>

				<div className="space-y-2">
					<Label htmlFor="ipv6CidrBlock">IPv6 CIDR Block</Label>
					<Input
						id="ipv6CidrBlock"
						value={(config.ipv6CidrBlock as string) || ""}
						onChange={(e) => updateConfig("ipv6CidrBlock", e.target.value)}
						placeholder="2001:db8:1::/64"
					/>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="ipv6Native"
						checked={(config.ipv6Native as boolean) || false}
						onCheckedChange={(checked) =>
							updateConfig("ipv6Native", checked)
						}
					/>
					<Label htmlFor="ipv6Native">IPv6 native subnet</Label>
				</div>
			</div>

			{/* Route Table */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Route Table Configuration
				</h3>

				<div className="space-y-2">
					<Label htmlFor="routeTableId">Route Table ID</Label>
					<Input
						id="routeTableId"
						value={(config.routeTableId as string) || ""}
						onChange={(e) => updateConfig("routeTableId", e.target.value)}
						placeholder="rtb-xxxxxxxxx"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="routeTableAssociation">Route Table Association ID</Label>
					<Input
						id="routeTableAssociation"
						value={(config.routeTableAssociation as string) || ""}
						onChange={(e) => updateConfig("routeTableAssociation", e.target.value)}
						placeholder="rtbassoc-xxxxxxxxx"
					/>
				</div>
			</div>

			{/* NAT Gateway Configuration */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					NAT Gateway Configuration
				</h3>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="enableNatGateway"
						checked={(config.enableNatGateway as boolean) || false}
						onCheckedChange={(checked) =>
							updateConfig("enableNatGateway", checked)
						}
					/>
					<Label htmlFor="enableNatGateway">
						Route traffic through NAT Gateway for internet access
					</Label>
				</div>

				{(config.enableNatGateway as boolean) && (
					<>
						<div className="space-y-2">
							<Label htmlFor="natGatewayId">NAT Gateway ID</Label>
							<Input
								id="natGatewayId"
								value={(config.natGatewayId as string) || ""}
								onChange={(e) => updateConfig("natGatewayId", e.target.value)}
								placeholder="nat-xxxxxxxxx"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="natGatewaySubnet">NAT Gateway Subnet</Label>
							<Input
								id="natGatewaySubnet"
								value={(config.natGatewaySubnet as string) || ""}
								onChange={(e) => updateConfig("natGatewaySubnet", e.target.value)}
								placeholder="subnet-xxxxxxxxx (public subnet)"
							/>
						</div>
					</>
				)}
			</div>

			{/* DNS Configuration */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					DNS Configuration
				</h3>

				<div className="grid grid-cols-1 gap-3">
					<div className="flex items-center space-x-2">
						<Checkbox
							id="enableDnsSupport"
							checked={(config.enableDnsSupport as boolean) !== false}
							onCheckedChange={(checked) =>
								updateConfig("enableDnsSupport", checked)
							}
						/>
						<Label htmlFor="enableDnsSupport">Enable DNS support</Label>
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="enableDnsHostnames"
							checked={(config.enableDnsHostnames as boolean) || false}
							onCheckedChange={(checked) =>
								updateConfig("enableDnsHostnames", checked)
							}
						/>
						<Label htmlFor="enableDnsHostnames">Enable DNS hostnames</Label>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="hostnameType">Hostname Type</Label>
					<Select
						value={((config.privateDnsNameOptions as PrivateSubnetConfiguration["privateDnsNameOptions"]) || {}).hostnameType || ""}
						onValueChange={(value) => updatePrivateDnsNameOptions("hostnameType", value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select hostname type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ip-name">IP Name</SelectItem>
							<SelectItem value="resource-name">Resource Name</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Security & Access */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Security & Access
				</h3>

				<div className="space-y-2">
					<Label htmlFor="networkAclId">Network ACL ID</Label>
					<Input
						id="networkAclId"
						value={(config.networkAclId as string) || ""}
						onChange={(e) => updateConfig("networkAclId", e.target.value)}
						placeholder="acl-xxxxxxxxx"
					/>
				</div>

				<div className="grid grid-cols-1 gap-3">
					<div className="flex items-center space-x-2">
						<Checkbox
							id="flowLogsEnabled"
							checked={(config.flowLogsEnabled as boolean) || false}
							onCheckedChange={(checked) =>
								updateConfig("flowLogsEnabled", checked)
							}
						/>
						<Label htmlFor="flowLogsEnabled">Enable VPC Flow Logs</Label>
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="enforceNetworkSegmentation"
							checked={(config.enforceNetworkSegmentation as boolean) || false}
							onCheckedChange={(checked) =>
								updateConfig("enforceNetworkSegmentation", checked)
							}
						/>
						<Label htmlFor="enforceNetworkSegmentation">
							Enforce network segmentation
						</Label>
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="restrictInternetAccess"
							checked={(config.restrictInternetAccess as boolean) !== false}
							onCheckedChange={(checked) =>
								updateConfig("restrictInternetAccess", checked)
							}
						/>
						<Label htmlFor="restrictInternetAccess">
							Restrict internet access (recommended for private subnets)
						</Label>
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="requireEncryptionInTransit"
							checked={(config.requireEncryptionInTransit as boolean) || false}
							onCheckedChange={(checked) =>
								updateConfig("requireEncryptionInTransit", checked)
							}
						/>
						<Label htmlFor="requireEncryptionInTransit">
							Require encryption in transit
						</Label>
					</div>
				</div>

				{(config.flowLogsEnabled as boolean) && (
					<>
						<div className="space-y-2">
							<Label htmlFor="flowLogsDestination">Flow Logs Destination</Label>
							<Select
								value={(config.flowLogsDestination as string) || ""}
								onValueChange={(value) => updateConfig("flowLogsDestination", value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select destination" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="cloudwatch-logs">CloudWatch Logs</SelectItem>
									<SelectItem value="s3">S3</SelectItem>
									<SelectItem value="kinesis-data-firehose">Kinesis Data Firehose</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="flowLogsRoleArn">Flow Logs Role ARN</Label>
							<Input
								id="flowLogsRoleArn"
								value={(config.flowLogsRoleArn as string) || ""}
								onChange={(e) => updateConfig("flowLogsRoleArn", e.target.value)}
								placeholder="arn:aws:iam::123456789012:role/flowlogsRole"
							/>
						</div>
					</>
				)}
			</div>

			{/* Instance Settings */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Instance Settings
				</h3>

				<div className="space-y-2">
					<Label htmlFor="instanceTenancy">Instance Tenancy</Label>
					<Select
						value={(config.instanceTenancy as string) || ""}
						onValueChange={(value) => updateConfig("instanceTenancy", value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select instance tenancy" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="default">Default</SelectItem>
							<SelectItem value="dedicated">Dedicated</SelectItem>
							<SelectItem value="host">Dedicated Host</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="grid grid-cols-1 gap-3">
					<div className="flex items-center space-x-2">
						<Checkbox
							id="enableDetailedMonitoring"
							checked={(config.enableDetailedMonitoring as boolean) || false}
							onCheckedChange={(checked) =>
								updateConfig("enableDetailedMonitoring", checked)
							}
						/>
						<Label htmlFor="enableDetailedMonitoring">Enable detailed monitoring</Label>
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="shareWithOrganization"
							checked={(config.shareWithOrganization as boolean) || false}
							onCheckedChange={(checked) =>
								updateConfig("shareWithOrganization", checked)
							}
						/>
						<Label htmlFor="shareWithOrganization">Share with organization</Label>
					</div>
				</div>

				{(config.shareWithOrganization as boolean) && (
					<div className="space-y-2">
						<Label htmlFor="allowedAccounts">Allowed Accounts</Label>
						<Textarea
							id="allowedAccounts"
							value={((config.allowedAccounts as string[]) || []).join(", ")}
							onChange={(e) =>
								updateConfig(
									"allowedAccounts",
									e.target.value.split(",").map((acc) => acc.trim()).filter(acc => acc !== "")
								)
							}
							placeholder="123456789012, 987654321098"
						/>
					</div>
				)}
			</div>

			{/* Cost Allocation */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Cost Allocation
				</h3>

				<div className="space-y-2">
					<Label htmlFor="costCenter">Cost Center</Label>
					<Input
						id="costCenter"
						value={((config.costAllocation as PrivateSubnetConfiguration["costAllocation"]) || {}).costCenter || ""}
						onChange={(e) => updateCostAllocation("costCenter", e.target.value)}
						placeholder="Engineering"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="project">Project</Label>
					<Input
						id="project"
						value={((config.costAllocation as PrivateSubnetConfiguration["costAllocation"]) || {}).project || ""}
						onChange={(e) => updateCostAllocation("project", e.target.value)}
						placeholder="Project Alpha"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="environment">Environment</Label>
					<Input
						id="environment"
						value={((config.costAllocation as PrivateSubnetConfiguration["costAllocation"]) || {}).environment || ""}
						onChange={(e) => updateCostAllocation("environment", e.target.value)}
						placeholder="Production"
					/>
				</div>
			</div>

			{/* Tags */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Tags
				</h3>

				<div className="space-y-2">
					<Label htmlFor="subnet-tags">Subnet Tags</Label>
					<Textarea
						id="subnet-tags"
						placeholder="Enter tags as key=value pairs, comma-separated (e.g., Environment=prod, Project=web-app)"
						value={tagsToString((config.tags as Record<string, string>) || {})}
						onChange={(e) => updateTags(parseTagsFromString(e.target.value))}
					/>
				</div>
			</div>
		</div>
	);
};

export default PrivateSubnetConfigurationForm;
export type { PrivateSubnetConfiguration };
