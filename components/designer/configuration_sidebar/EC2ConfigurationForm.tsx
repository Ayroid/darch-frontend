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

interface EC2Configuration {
	// Basic Instance Configuration
	name: string;
	amiId: string;
	instanceType: string;
	keyName: string;
	subnetId: string;
	vpcSecurityGroupIds: string[];

	// Instance Settings
	associatePublicIpAddress: boolean;
	monitoring: boolean;
	ebsOptimized: boolean;
	disableApiTermination: boolean;
	instanceInitiatedShutdownBehavior: string; // 'stop' | 'terminate'
	tenancy: string; // 'default' | 'dedicated' | 'host'
	hostId: string;
	cpuCoreCount: number;
	cpuThreadsPerCore: number;

	// Storage Configuration
	rootBlockDevice?: {
		volumeType?: string; // 'gp2' | 'gp3' | 'io1' | 'io2' | 'st1' | 'sc1'
		volumeSize?: number;
		iops?: number;
		throughput?: number;
		encrypted?: boolean;
		kmsKeyId?: string;
		deleteOnTermination?: boolean;
		tags?: Record<string, string>;
	};
	ebsBlockDevice?: Array<{
		deviceName?: string;
		volumeType?: string;
		volumeSize?: number;
		iops?: number;
		throughput?: number;
		encrypted?: boolean;
		kmsKeyId?: string;
		snapshotId?: string;
		deleteOnTermination?: boolean;
		tags?: Record<string, string>;
	}>;
	ephemeralBlockDevice?: Array<{
		deviceName?: string;
		virtualName?: string;
		noDevice?: boolean;
	}>;

	// Network Interfaces
	networkInterface?: Array<{
		deviceIndex?: number;
		networkInterfaceId?: string;
		deleteOnTermination?: boolean;
	}>;

	// IAM
	iamInstanceProfile?: string;

	// User Data
	userData?: string;
	userDataBase64?: string;
	userDataReplaceOnChange?: boolean;

	// Placement
	availabilityZone?: string;
	placementGroup?: string;
	placementPartitionNumber?: number;

	// Credit Specification (T2/T3/T4g instances)
	creditSpecification?: {
		cpuCredits?: string; // 'standard' | 'unlimited'
	};

	// Hibernation
	hibernation?: boolean;

	// Security Groups
	securityGroups?: string[];

	// Source/Dest Check
	sourceDestCheck?: boolean;

	// Get Password Data
	getPasswordData?: boolean;

	// Launch Template
	launchTemplate?: {
		id?: string;
		name?: string;
		version?: string;
	};

	// Enclave Options
	enclaveOptions?: {
		enabled?: boolean;
	};

	// Metadata Options
	metadataOptions?: {
		httpEndpoint?: string; // 'enabled' | 'disabled'
		httpPutResponseHopLimit?: number;
		httpTokens?: string; // 'optional' | 'required'
		instanceMetadataTags?: string; // 'enabled' | 'disabled'
	};

	// Private DNS Name Options
	privateDnsNameOptions?: {
		enableResourceNameDnsARecord?: boolean;
		enableResourceNameDnsAAAARecord?: boolean;
		hostnameType?: string; // 'ip-name' | 'resource-name'
	};

	// Tags
	tags?: Record<string, string>;
	volumeTags?: Record<string, string>;

	// Lifecycle
	createBeforeDestroy?: boolean;
	ignoreChanges?: string[];

	// Connection and Provisioner Settings (for remote-exec, file, etc.)
	connection?: {
		type?: string; // 'ssh' | 'winrm'
		user?: string;
		password?: string;
		host?: string;
		port?: number;
		timeout?: string;
		privateKey?: string;
		certificate?: string;
		agent?: boolean;
		agentIdentity?: string;
		hostKey?: string;
		bastionHost?: string;
		bastionPort?: number;
		bastionUser?: string;
		bastionPassword?: string;
		bastionPrivateKey?: string;
		bastionHostKey?: string;
	};
}

const EC2ConfigurationForm: React.FC<{
	config: Partial<EC2Configuration>;
	onChange: (config: Partial<EC2Configuration>) => void;
}> = ({ config, onChange }) => {
	const updateConfig = (
		key: keyof EC2Configuration,
		value: EC2Configuration[keyof EC2Configuration]
	) => {
		onChange({ ...config, [key]: value });
	};

	const updateRootBlockDevice = (
		key: string,
		value: string | boolean | number | Record<string, string>
	) => {
		const rootBlockDevice = { ...config.rootBlockDevice, [key]: value };
		updateConfig("rootBlockDevice", rootBlockDevice);
	};

	const updateMetadataOptions = (key: string, value: string | number) => {
		const metadataOptions = { ...config.metadataOptions, [key]: value };
		updateConfig("metadataOptions", metadataOptions);
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
			{/* Basic Instance Configuration */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Basic Configuration
				</h3>

				<div className="space-y-2">
					<Label htmlFor="instance-name">
						Instance Name <span className="text-red-500">*</span>
					</Label>
					<Input
						id="instance-name"
						placeholder="e.g., web-server-01"
						value={config.name || ""}
						onChange={(e) => updateConfig("name", e.target.value)}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="ami-id">
						AMI ID <span className="text-red-500">*</span>
					</Label>
					<Input
						id="ami-id"
						placeholder="e.g., ami-0abcdef1234567890"
						value={config.amiId || ""}
						onChange={(e) => updateConfig("amiId", e.target.value)}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="instance-type">
						Instance Type <span className="text-red-500">*</span>
					</Label>
					<Select
						value={config.instanceType || ""}
						onValueChange={(value) => updateConfig("instanceType", value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select instance type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="t3.nano">t3.nano</SelectItem>
							<SelectItem value="t3.micro">t3.micro</SelectItem>
							<SelectItem value="t3.small">t3.small</SelectItem>
							<SelectItem value="t3.medium">t3.medium</SelectItem>
							<SelectItem value="t3.large">t3.large</SelectItem>
							<SelectItem value="t3.xlarge">t3.xlarge</SelectItem>
							<SelectItem value="m5.large">m5.large</SelectItem>
							<SelectItem value="m5.xlarge">m5.xlarge</SelectItem>
							<SelectItem value="c5.large">c5.large</SelectItem>
							<SelectItem value="c5.xlarge">c5.xlarge</SelectItem>
							<SelectItem value="r5.large">r5.large</SelectItem>
							<SelectItem value="r5.xlarge">r5.xlarge</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="availability-zone">Availability Zone</Label>
					<Input
						id="availability-zone"
						placeholder="e.g., us-east-1a"
						value={config.availabilityZone || ""}
						onChange={(e) => updateConfig("availabilityZone", e.target.value)}
					/>
				</div>
			</div>

			{/* Network Configuration */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Network Configuration
				</h3>

				<div className="space-y-2">
					<Label htmlFor="subnet-id">
						Subnet ID <span className="text-red-500">*</span>
					</Label>
					<Input
						id="subnet-id"
						placeholder="e.g., subnet-0abcdef1234567890"
						value={config.subnetId || ""}
						onChange={(e) => updateConfig("subnetId", e.target.value)}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="security-groups">VPC Security Group IDs</Label>
					<Textarea
						id="security-groups"
						placeholder="Enter security group IDs, comma-separated (e.g., sg-0abcdef123, sg-0fedcba456)"
						value={config.vpcSecurityGroupIds?.join(", ") || ""}
						onChange={(e) =>
							updateConfig(
								"vpcSecurityGroupIds",
								e.target.value.split(",").map((sg) => sg.trim())
							)
						}
					/>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="associate-public-ip"
						checked={config.associatePublicIpAddress || false}
						onCheckedChange={(checked) =>
							updateConfig("associatePublicIpAddress", checked)
						}
					/>
					<Label htmlFor="associate-public-ip">
						Associate public IP address
					</Label>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="source-dest-check"
						checked={config.sourceDestCheck !== false}
						onCheckedChange={(checked) =>
							updateConfig("sourceDestCheck", checked)
						}
					/>
					<Label htmlFor="source-dest-check">Source/destination check</Label>
				</div>
			</div>

			{/* Key Pair & IAM */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Security Configuration
				</h3>

				<div className="space-y-2">
					<Label htmlFor="key-name">Key Pair Name</Label>
					<Input
						id="key-name"
						placeholder="e.g., my-key-pair"
						value={config.keyName || ""}
						onChange={(e) => updateConfig("keyName", e.target.value)}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="iam-instance-profile">IAM Instance Profile</Label>
					<Input
						id="iam-instance-profile"
						placeholder="e.g., EC2InstanceProfile"
						value={config.iamInstanceProfile || ""}
						onChange={(e) => updateConfig("iamInstanceProfile", e.target.value)}
					/>
				</div>
			</div>

			{/* Storage Configuration */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Storage Configuration
				</h3>

				<div className="space-y-2">
					<Label htmlFor="root-volume-type">Root Volume Type</Label>
					<Select
						value={config.rootBlockDevice?.volumeType || ""}
						onValueChange={(value) =>
							updateRootBlockDevice("volumeType", value)
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select volume type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="gp3">gp3 (General Purpose SSD)</SelectItem>
							<SelectItem value="gp2">gp2 (General Purpose SSD)</SelectItem>
							<SelectItem value="io2">io2 (Provisioned IOPS SSD)</SelectItem>
							<SelectItem value="io1">io1 (Provisioned IOPS SSD)</SelectItem>
							<SelectItem value="st1">
								st1 (Throughput Optimized HDD)
							</SelectItem>
							<SelectItem value="sc1">sc1 (Cold HDD)</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="root-volume-size">Root Volume Size (GB)</Label>
					<Input
						id="root-volume-size"
						type="number"
						placeholder="e.g., 20"
						value={config.rootBlockDevice?.volumeSize?.toString() || ""}
						onChange={(e) =>
							updateRootBlockDevice(
								"volumeSize",
								parseInt(e.target.value) || 20
							)
						}
					/>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="root-encrypted"
						checked={config.rootBlockDevice?.encrypted || false}
						onCheckedChange={(checked) =>
							updateRootBlockDevice("encrypted", checked)
						}
					/>
					<Label htmlFor="root-encrypted">Encrypt root volume</Label>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="root-delete-on-termination"
						checked={config.rootBlockDevice?.deleteOnTermination !== false}
						onCheckedChange={(checked) =>
							updateRootBlockDevice("deleteOnTermination", checked)
						}
					/>
					<Label htmlFor="root-delete-on-termination">
						Delete volume on termination
					</Label>
				</div>
			</div>

			{/* Instance Settings */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Instance Settings
				</h3>

				<div className="space-y-2">
					<Label htmlFor="tenancy">Tenancy</Label>
					<Select
						value={config.tenancy || ""}
						onValueChange={(value) => updateConfig("tenancy", value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select tenancy" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="default">Default</SelectItem>
							<SelectItem value="dedicated">Dedicated</SelectItem>
							<SelectItem value="host">Dedicated Host</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="shutdown-behavior">
						Instance Initiated Shutdown Behavior
					</Label>
					<Select
						value={config.instanceInitiatedShutdownBehavior || ""}
						onValueChange={(value) =>
							updateConfig("instanceInitiatedShutdownBehavior", value)
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select shutdown behavior" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="stop">Stop</SelectItem>
							<SelectItem value="terminate">Terminate</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="grid grid-cols-1 gap-3">
					<div className="flex items-center space-x-2">
						<Checkbox
							id="monitoring"
							checked={config.monitoring || false}
							onCheckedChange={(checked) => updateConfig("monitoring", checked)}
						/>
						<Label htmlFor="monitoring">Enable detailed monitoring</Label>
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="ebs-optimized"
							checked={config.ebsOptimized || false}
							onCheckedChange={(checked) =>
								updateConfig("ebsOptimized", checked)
							}
						/>
						<Label htmlFor="ebs-optimized">EBS optimized</Label>
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="disable-api-termination"
							checked={config.disableApiTermination || false}
							onCheckedChange={(checked) =>
								updateConfig("disableApiTermination", checked)
							}
						/>
						<Label htmlFor="disable-api-termination">
							Disable API termination
						</Label>
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="hibernation"
							checked={config.hibernation || false}
							onCheckedChange={(checked) =>
								updateConfig("hibernation", checked)
							}
						/>
						<Label htmlFor="hibernation">Enable hibernation</Label>
					</div>
				</div>
			</div>

			{/* Metadata Options */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Metadata Options
				</h3>

				<div className="space-y-2">
					<Label htmlFor="metadata-endpoint">HTTP Endpoint</Label>
					<Select
						value={config.metadataOptions?.httpEndpoint || ""}
						onValueChange={(value) =>
							updateMetadataOptions("httpEndpoint", value)
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select endpoint option" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="enabled">Enabled</SelectItem>
							<SelectItem value="disabled">Disabled</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="metadata-tokens">HTTP Tokens</Label>
					<Select
						value={config.metadataOptions?.httpTokens || ""}
						onValueChange={(value) =>
							updateMetadataOptions("httpTokens", value)
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select token requirement" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="optional">Optional</SelectItem>
							<SelectItem value="required">Required (IMDSv2)</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="metadata-hop-limit">
						HTTP Put Response Hop Limit
					</Label>
					<Input
						id="metadata-hop-limit"
						type="number"
						placeholder="e.g., 1"
						value={
							config.metadataOptions?.httpPutResponseHopLimit?.toString() || ""
						}
						onChange={(e) =>
							updateMetadataOptions(
								"httpPutResponseHopLimit",
								parseInt(e.target.value) || 1
							)
						}
					/>
				</div>
			</div>

			{/* User Data */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					User Data
				</h3>

				<div className="space-y-2">
					<Label htmlFor="user-data">User Data Script</Label>
					<Textarea
						id="user-data"
						placeholder="#!/bin/bash&#10;# Your user data script here"
						value={config.userData || ""}
						onChange={(e) => updateConfig("userData", e.target.value)}
						rows={6}
					/>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="user-data-replace-on-change"
						checked={config.userDataReplaceOnChange || false}
						onCheckedChange={(checked) =>
							updateConfig("userDataReplaceOnChange", checked)
						}
					/>
					<Label htmlFor="user-data-replace-on-change">
						Replace instance on user data change
					</Label>
				</div>
			</div>

			{/* Tags */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Tags
				</h3>

				<div className="space-y-2">
					<Label htmlFor="instance-tags">Instance Tags</Label>
					<Textarea
						id="instance-tags"
						placeholder="Enter tags as key=value pairs, comma-separated (e.g., Environment=prod, Project=web-app)"
						value={tagsToString(config.tags)}
						onChange={(e) => updateTags(parseTagsFromString(e.target.value))}
					/>
				</div>
			</div>
		</div>
	);
};

export default EC2ConfigurationForm;
export type { EC2Configuration };
