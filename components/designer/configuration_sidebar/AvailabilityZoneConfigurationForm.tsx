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

export interface AvailabilityZoneConfiguration {
	// Basic AZ Configuration
	name: string;
	azId: string;
	zoneId: string;
	region: string;

	// AZ Properties
	description: string;
	state: string; // 'available' | 'information' | 'impaired' | 'unavailable'
	isOptInRequired: boolean;
	groupName: string;
	networkBorderGroup: string;

	// Capacity & Resources
	availableInstanceTypes: string[];
	restrictedInstanceTypes: string[];
	dedicatedHostsSupported: boolean;
	spotInstancesSupported: boolean;

	// Storage Options
	ebsVolumeTypes: string[];
	ebsEncryptionByDefault: boolean;

	// High Availability
	isPreferred: boolean;
	failoverPriority: number;
	disasterRecoveryZone: string;

	// Connectivity
	directConnectSupported: boolean;
	localZonesSupported: boolean;
	wavelengthSupported: boolean;

	// Cost Optimization
	spotPricingTier: string; // 'low' | 'medium' | 'high'
	reservedInstanceAvailability: boolean;

	// Compliance
	isolatedTenancy: boolean;
	complianceLevel: string; // 'standard' | 'isolated' | 'dedicated'

	// Tags
	tags: Record<string, string>;
}

const instanceTypes = [
	// General Purpose
	"t2.nano", "t2.micro", "t2.small", "t2.medium", "t2.large", "t2.xlarge", "t2.2xlarge",
	"t3.nano", "t3.micro", "t3.small", "t3.medium", "t3.large", "t3.xlarge", "t3.2xlarge",
	"t3a.nano", "t3a.micro", "t3a.small", "t3a.medium", "t3a.large", "t3a.xlarge", "t3a.2xlarge",
	"t4g.nano", "t4g.micro", "t4g.small", "t4g.medium", "t4g.large", "t4g.xlarge", "t4g.2xlarge",
	"m5.large", "m5.xlarge", "m5.2xlarge", "m5.4xlarge", "m5.8xlarge", "m5.12xlarge", "m5.16xlarge", "m5.24xlarge",
	"m5a.large", "m5a.xlarge", "m5a.2xlarge", "m5a.4xlarge", "m5a.8xlarge", "m5a.12xlarge", "m5a.16xlarge", "m5a.24xlarge",
	"m6i.large", "m6i.xlarge", "m6i.2xlarge", "m6i.4xlarge", "m6i.8xlarge", "m6i.12xlarge", "m6i.16xlarge", "m6i.24xlarge", "m6i.32xlarge",

	// Compute Optimized
	"c5.large", "c5.xlarge", "c5.2xlarge", "c5.4xlarge", "c5.9xlarge", "c5.12xlarge", "c5.18xlarge", "c5.24xlarge",
	"c5n.large", "c5n.xlarge", "c5n.2xlarge", "c5n.4xlarge", "c5n.9xlarge", "c5n.18xlarge",
	"c6i.large", "c6i.xlarge", "c6i.2xlarge", "c6i.4xlarge", "c6i.8xlarge", "c6i.12xlarge", "c6i.16xlarge", "c6i.24xlarge", "c6i.32xlarge",

	// Memory Optimized
	"r5.large", "r5.xlarge", "r5.2xlarge", "r5.4xlarge", "r5.8xlarge", "r5.12xlarge", "r5.16xlarge", "r5.24xlarge",
	"r6i.large", "r6i.xlarge", "r6i.2xlarge", "r6i.4xlarge", "r6i.8xlarge", "r6i.12xlarge", "r6i.16xlarge", "r6i.24xlarge", "r6i.32xlarge",
	"x1.16xlarge", "x1.32xlarge", "x1e.xlarge", "x1e.2xlarge", "x1e.4xlarge", "x1e.8xlarge", "x1e.16xlarge", "x1e.32xlarge",

	// Storage Optimized
	"i3.large", "i3.xlarge", "i3.2xlarge", "i3.4xlarge", "i3.8xlarge", "i3.16xlarge",
	"d2.xlarge", "d2.2xlarge", "d2.4xlarge", "d2.8xlarge",

	// Accelerated Computing
	"p3.2xlarge", "p3.8xlarge", "p3.16xlarge", "p3dn.24xlarge",
	"p4d.24xlarge", "p4de.24xlarge",
	"g4dn.xlarge", "g4dn.2xlarge", "g4dn.4xlarge", "g4dn.8xlarge", "g4dn.12xlarge", "g4dn.16xlarge",
];

const ebsVolumeTypes = [
	"gp2", "gp3", "io1", "io2", "st1", "sc1", "standard"
];

const regions = [
	"us-east-1", "us-east-2", "us-west-1", "us-west-2",
	"eu-west-1", "eu-west-2", "eu-west-3", "eu-central-1", "eu-north-1",
	"ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-northeast-2", "ap-south-1",
	"ca-central-1", "sa-east-1"
];

const AvailabilityZoneConfigurationForm: React.FC<{
	config: Record<string, unknown>;
	onChange: (config: Record<string, unknown>) => void;
}> = ({ config, onChange }) => {
	const updateConfig = (
		key: keyof AvailabilityZoneConfiguration,
		value: AvailabilityZoneConfiguration[keyof AvailabilityZoneConfiguration]
	) => {
		onChange({ ...config, [key]: value });
	};

	const handleTagChange = (key: string, value: string) => {
		const currentTags = (config.tags as Record<string, string>) || {};
		if (value === "") {
			const newTags = { ...currentTags };
			delete newTags[key];
			onChange({ ...config, tags: newTags });
		} else {
			onChange({
				...config,
				tags: { ...currentTags, [key]: value },
			});
		}
	};

	const addTag = () => {
		const currentTags = (config.tags as Record<string, string>) || {};
		const key = `Tag${Object.keys(currentTags).length + 1}`;
		onChange({
			...config,
			tags: { ...currentTags, [key]: "" },
		});
	};

	return (
		<div className="space-y-6">
			{/* Basic Configuration */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Basic Configuration
				</h3>

				<div className="space-y-2">
					<Label htmlFor="az-name">Name</Label>
					<Input
						id="az-name"
						value={(config.name as string) || ""}
						onChange={(e) => updateConfig("name", e.target.value)}
						placeholder="e.g., Primary AZ East"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="azId">Availability Zone ID</Label>
					<Input
						id="azId"
						value={(config.azId as string) || ""}
						onChange={(e) => updateConfig("azId", e.target.value)}
						placeholder="e.g., use1-az1"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="zoneId">Zone ID</Label>
					<Input
						id="zoneId"
						value={(config.zoneId as string) || ""}
						onChange={(e) => updateConfig("zoneId", e.target.value)}
						placeholder="e.g., use1-az1"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="region">Region</Label>
					<Select
						value={(config.region as string) || ""}
						onValueChange={(value) => updateConfig("region", value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select region" />
						</SelectTrigger>
						<SelectContent>
							{regions.map((region) => (
								<SelectItem key={region} value={region}>
									{region}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* AZ Properties */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					AZ Properties
				</h3>

				<div className="space-y-2">
					<Label htmlFor="description">Description</Label>
					<Textarea
						id="description"
						value={(config.description as string) || ""}
						onChange={(e) => updateConfig("description", e.target.value)}
						placeholder="Describe this availability zone"
						className="min-h-[80px]"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="state">State</Label>
					<Select
						value={(config.state as string) || ""}
						onValueChange={(value) => updateConfig("state", value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select state" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="available">Available</SelectItem>
							<SelectItem value="information">Information</SelectItem>
							<SelectItem value="impaired">Impaired</SelectItem>
							<SelectItem value="unavailable">Unavailable</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="isOptInRequired"
						checked={(config.isOptInRequired as boolean) || false}
						onCheckedChange={(checked) => updateConfig("isOptInRequired", !!checked)}
					/>
					<Label htmlFor="isOptInRequired">Opt-in Required</Label>
				</div>

				<div className="space-y-2">
					<Label htmlFor="groupName">Group Name</Label>
					<Input
						id="groupName"
						value={(config.groupName as string) || ""}
						onChange={(e) => updateConfig("groupName", e.target.value)}
						placeholder="e.g., us-east-1"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="networkBorderGroup">Network Border Group</Label>
					<Input
						id="networkBorderGroup"
						value={(config.networkBorderGroup as string) || ""}
						onChange={(e) => updateConfig("networkBorderGroup", e.target.value)}
						placeholder="e.g., us-east-1"
					/>
				</div>
			</div>

			{/* Capacity & Resources */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Capacity & Resources
				</h3>

				<div className="space-y-2">
					<Label>Available Instance Types</Label>
					<div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
						{instanceTypes.map((type) => (
							<div key={type} className="flex items-center space-x-2">
								<Checkbox
									id={`available-${type}`}
									checked={((config.availableInstanceTypes as string[]) || []).includes(type)}
									onCheckedChange={(checked) => {
										const current = (config.availableInstanceTypes as string[]) || [];
										if (checked) {
											updateConfig("availableInstanceTypes", [...current, type]);
										} else {
											updateConfig("availableInstanceTypes", current.filter(t => t !== type));
										}
									}}
								/>
								<Label htmlFor={`available-${type}`} className="text-sm">
									{type}
								</Label>
							</div>
						))}
					</div>
				</div>

				<div className="space-y-2">
					<Label>Restricted Instance Types</Label>
					<div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
						{instanceTypes.map((type) => (
							<div key={type} className="flex items-center space-x-2">
								<Checkbox
									id={`restricted-${type}`}
									checked={((config.restrictedInstanceTypes as string[]) || []).includes(type)}
									onCheckedChange={(checked) => {
										const current = (config.restrictedInstanceTypes as string[]) || [];
										if (checked) {
											updateConfig("restrictedInstanceTypes", [...current, type]);
										} else {
											updateConfig("restrictedInstanceTypes", current.filter(t => t !== type));
										}
									}}
								/>
								<Label htmlFor={`restricted-${type}`} className="text-sm">
									{type}
								</Label>
							</div>
						))}
					</div>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="dedicatedHostsSupported"
						checked={(config.dedicatedHostsSupported as boolean) || false}
						onCheckedChange={(checked) => updateConfig("dedicatedHostsSupported", !!checked)}
					/>
					<Label htmlFor="dedicatedHostsSupported">Dedicated Hosts Supported</Label>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="spotInstancesSupported"
						checked={(config.spotInstancesSupported as boolean) || false}
						onCheckedChange={(checked) => updateConfig("spotInstancesSupported", !!checked)}
					/>
					<Label htmlFor="spotInstancesSupported">Spot Instances Supported</Label>
				</div>
			</div>

			{/* Storage Options */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Storage Options
				</h3>

				<div className="space-y-2">
					<Label>EBS Volume Types</Label>
					<div className="grid grid-cols-2 gap-2">
						{ebsVolumeTypes.map((type) => (
							<div key={type} className="flex items-center space-x-2">
								<Checkbox
									id={`ebs-${type}`}
									checked={((config.ebsVolumeTypes as string[]) || []).includes(type)}
									onCheckedChange={(checked) => {
										const current = (config.ebsVolumeTypes as string[]) || [];
										if (checked) {
											updateConfig("ebsVolumeTypes", [...current, type]);
										} else {
											updateConfig("ebsVolumeTypes", current.filter(t => t !== type));
										}
									}}
								/>
								<Label htmlFor={`ebs-${type}`} className="text-sm">
									{type}
								</Label>
							</div>
						))}
					</div>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="ebsEncryptionByDefault"
						checked={(config.ebsEncryptionByDefault as boolean) || false}
						onCheckedChange={(checked) => updateConfig("ebsEncryptionByDefault", !!checked)}
					/>
					<Label htmlFor="ebsEncryptionByDefault">EBS Encryption by Default</Label>
				</div>
			</div>

			{/* High Availability */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					High Availability
				</h3>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="isPreferred"
						checked={(config.isPreferred as boolean) || false}
						onCheckedChange={(checked) => updateConfig("isPreferred", !!checked)}
					/>
					<Label htmlFor="isPreferred">Preferred AZ</Label>
				</div>

				<div className="space-y-2">
					<Label htmlFor="failoverPriority">Failover Priority</Label>
					<Input
						id="failoverPriority"
						type="number"
						value={(config.failoverPriority as number) || 0}
						onChange={(e) => updateConfig("failoverPriority", parseInt(e.target.value) || 0)}
						placeholder="1"
						min="1"
						max="10"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="disasterRecoveryZone">Disaster Recovery Zone</Label>
					<Select
						value={(config.disasterRecoveryZone as string) || ""}
						onValueChange={(value) => updateConfig("disasterRecoveryZone", value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select DR zone" />
						</SelectTrigger>
						<SelectContent>
							{regions.map((region) => (
								<SelectItem key={region} value={region}>
									{region}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Connectivity */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Connectivity
				</h3>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="directConnectSupported"
						checked={(config.directConnectSupported as boolean) || false}
						onCheckedChange={(checked) => updateConfig("directConnectSupported", !!checked)}
					/>
					<Label htmlFor="directConnectSupported">Direct Connect Supported</Label>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="localZonesSupported"
						checked={(config.localZonesSupported as boolean) || false}
						onCheckedChange={(checked) => updateConfig("localZonesSupported", !!checked)}
					/>
					<Label htmlFor="localZonesSupported">Local Zones Supported</Label>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="wavelengthSupported"
						checked={(config.wavelengthSupported as boolean) || false}
						onCheckedChange={(checked) => updateConfig("wavelengthSupported", !!checked)}
					/>
					<Label htmlFor="wavelengthSupported">Wavelength Supported</Label>
				</div>
			</div>

			{/* Cost Optimization */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Cost Optimization
				</h3>

				<div className="space-y-2">
					<Label htmlFor="spotPricingTier">Spot Pricing Tier</Label>
					<Select
						value={(config.spotPricingTier as string) || ""}
						onValueChange={(value) => updateConfig("spotPricingTier", value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select pricing tier" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="low">Low</SelectItem>
							<SelectItem value="medium">Medium</SelectItem>
							<SelectItem value="high">High</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="reservedInstanceAvailability"
						checked={(config.reservedInstanceAvailability as boolean) || false}
						onCheckedChange={(checked) => updateConfig("reservedInstanceAvailability", !!checked)}
					/>
					<Label htmlFor="reservedInstanceAvailability">Reserved Instance Availability</Label>
				</div>
			</div>

			{/* Compliance */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Compliance
				</h3>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="isolatedTenancy"
						checked={(config.isolatedTenancy as boolean) || false}
						onCheckedChange={(checked) => updateConfig("isolatedTenancy", !!checked)}
					/>
					<Label htmlFor="isolatedTenancy">Isolated Tenancy</Label>
				</div>

				<div className="space-y-2">
					<Label htmlFor="complianceLevel">Compliance Level</Label>
					<Select
						value={(config.complianceLevel as string) || ""}
						onValueChange={(value) => updateConfig("complianceLevel", value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select compliance level" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="standard">Standard</SelectItem>
							<SelectItem value="isolated">Isolated</SelectItem>
							<SelectItem value="dedicated">Dedicated</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Tags */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Tags
				</h3>

				<div className="space-y-2">
					{Object.entries((config.tags as Record<string, string>) || {}).map(([key, value]) => (
						<div key={key} className="flex space-x-2">
							<Input
								value={key}
								onChange={(e) => {
									const currentTags = (config.tags as Record<string, string>) || {};
									const newKey = e.target.value;
									const newTags = { ...currentTags };
									delete newTags[key];
									if (newKey) {
										newTags[newKey] = value;
									}
									onChange({ ...config, tags: newTags });
								}}
								placeholder="Key"
								className="flex-1"
							/>
							<Input
								value={value}
								onChange={(e) => handleTagChange(key, e.target.value)}
								placeholder="Value"
								className="flex-1"
							/>
						</div>
					))}
					<button
						type="button"
						onClick={addTag}
						className="text-sm text-blue-600 hover:text-blue-800"
					>
						+ Add Tag
					</button>
				</div>
			</div>
		</div>
	);
};

export default AvailabilityZoneConfigurationForm;
