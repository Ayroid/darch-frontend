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

export interface AWSRegionConfiguration {
	// Basic Region Configuration
	name: string;
	regionCode: string;
	displayName: string;

	// Region Properties
	description: string;
	isEnabled: boolean;
	isDefault: boolean;
	accountId: string;

	// Availability Zones
	availabilityZones: string[];
	preferredAzs: string[];

	// Service Availability
	supportedServices: string[];
	restrictedServices: string[];

	// Compliance & Governance
	complianceFrameworks: string[];
	dataResidencyRequirements: string;

	// Cost & Billing
	preferredPricingModel: string; // 'on-demand' | 'reserved' | 'spot' | 'savings-plans'
	budgetAlerts: boolean;
	costCenter: string;

	// Networking
	defaultVpcId: string;
	internetGatewayId: string;

	// Tags
	tags: Record<string, string>;
}

const awsRegions = [
	{ code: "us-east-1", name: "US East (N. Virginia)" },
	{ code: "us-east-2", name: "US East (Ohio)" },
	{ code: "us-west-1", name: "US West (N. California)" },
	{ code: "us-west-2", name: "US West (Oregon)" },
	{ code: "ap-south-1", name: "Asia Pacific (Mumbai)" },
	{ code: "ap-southeast-1", name: "Asia Pacific (Singapore)" },
	{ code: "ap-southeast-2", name: "Asia Pacific (Sydney)" },
	{ code: "ap-northeast-1", name: "Asia Pacific (Tokyo)" },
	{ code: "eu-central-1", name: "Europe (Frankfurt)" },
	{ code: "eu-west-1", name: "Europe (Ireland)" },
	{ code: "eu-west-2", name: "Europe (London)" },
];

const AWSRegionConfigurationForm: React.FC<{
	config: Record<string, unknown>;
	onChange: (config: Record<string, unknown>) => void;
}> = ({ config, onChange }) => {
	const updateConfig = (
		key: keyof AWSRegionConfiguration,
		value: AWSRegionConfiguration[keyof AWSRegionConfiguration]
	) => {
		onChange({ ...config, [key]: value });
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
					<Label htmlFor="region-name">
						Region Name <span className="text-red-500">*</span>
					</Label>
					<Input
						id="region-name"
						placeholder="e.g., US East Region"
						value={(config.name as string) || ""}
						onChange={(e) => updateConfig("name", e.target.value)}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="region-code">
						Region Code <span className="text-red-500">*</span>
					</Label>
					<Select
						value={(config.regionCode as string) || ""}
						onValueChange={(value) => {
							const selectedRegion = awsRegions.find(r => r.code === value);
							updateConfig("regionCode", value);
							if (selectedRegion) {
								updateConfig("displayName", selectedRegion.name);
							}
						}}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select AWS Region" />
						</SelectTrigger>
						<SelectContent>
							{awsRegions.map((region) => (
								<SelectItem key={region.code} value={region.code}>
									{region.code} - {region.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="display-name">Display Name</Label>
					<Input
						id="display-name"
						placeholder="e.g., US East (N. Virginia)"
						value={(config.displayName as string) || ""}
						onChange={(e) => updateConfig("displayName", e.target.value)}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="description">Description</Label>
					<Textarea
						id="description"
						placeholder="Describe the purpose of this region..."
						value={(config.description as string) || ""}
						onChange={(e) => updateConfig("description", e.target.value)}
						rows={3}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="account-id">AWS Account ID</Label>
					<Input
						id="account-id"
						placeholder="e.g., 123456789012"
						value={(config.accountId as string) || ""}
						onChange={(e) => updateConfig("accountId", e.target.value)}
					/>
				</div>
			</div>

			{/* Region Properties */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Region Properties
				</h3>

				<div className="grid grid-cols-1 gap-3">
					<div className="flex items-center space-x-2">
						<Checkbox
							id="is-enabled"
							checked={(config.isEnabled as boolean) !== false}
							onCheckedChange={(checked) =>
								updateConfig("isEnabled", checked)
							}
						/>
						<Label htmlFor="is-enabled">Enable this region</Label>
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="is-default"
							checked={(config.isDefault as boolean) || false}
							onCheckedChange={(checked) =>
								updateConfig("isDefault", checked)
							}
						/>
						<Label htmlFor="is-default">Set as default region</Label>
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="budget-alerts"
							checked={(config.budgetAlerts as boolean) || false}
							onCheckedChange={(checked) =>
								updateConfig("budgetAlerts", checked)
							}
						/>
						<Label htmlFor="budget-alerts">Enable budget alerts</Label>
					</div>
				</div>
			</div>

			{/* Availability Zones */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Availability Zones
				</h3>

				<div className="space-y-2">
					<Label htmlFor="availability-zones">Available Zones</Label>
					<Textarea
						id="availability-zones"
						placeholder="Enter availability zones, comma-separated (e.g., us-east-1a, us-east-1b, us-east-1c)"
						value={((config.availabilityZones as string[]) || []).join(", ")}
						onChange={(e) =>
							updateConfig(
								"availabilityZones",
								e.target.value.split(",").map((az) => az.trim()).filter(az => az !== "")
							)
						}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="preferred-azs">Preferred Zones</Label>
					<Textarea
						id="preferred-azs"
						placeholder="Enter preferred availability zones, comma-separated"
						value={((config.preferredAzs as string[]) || []).join(", ")}
						onChange={(e) =>
							updateConfig(
								"preferredAzs",
								e.target.value.split(",").map((az) => az.trim()).filter(az => az !== "")
							)
						}
					/>
				</div>
			</div>

			{/* Cost & Billing */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Cost & Billing
				</h3>

				<div className="space-y-2">
					<Label htmlFor="pricing-model">Preferred Pricing Model</Label>
					<Select
						value={(config.preferredPricingModel as string) || ""}
						onValueChange={(value) => updateConfig("preferredPricingModel", value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select pricing model" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="on-demand">On-Demand</SelectItem>
							<SelectItem value="reserved">Reserved Instances</SelectItem>
							<SelectItem value="spot">Spot Instances</SelectItem>
							<SelectItem value="savings-plans">Savings Plans</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="cost-center">Cost Center</Label>
					<Input
						id="cost-center"
						placeholder="e.g., Engineering"
						value={(config.costCenter as string) || ""}
						onChange={(e) => updateConfig("costCenter", e.target.value)}
					/>
				</div>
			</div>

			{/* Networking */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Networking
				</h3>

				<div className="space-y-2">
					<Label htmlFor="default-vpc">Default VPC ID</Label>
					<Input
						id="default-vpc"
						placeholder="e.g., vpc-0abcdef1234567890"
						value={(config.defaultVpcId as string) || ""}
						onChange={(e) => updateConfig("defaultVpcId", e.target.value)}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="internet-gateway">Internet Gateway ID</Label>
					<Input
						id="internet-gateway"
						placeholder="e.g., igw-0abcdef1234567890"
						value={(config.internetGatewayId as string) || ""}
						onChange={(e) => updateConfig("internetGatewayId", e.target.value)}
					/>
				</div>
			</div>

			{/* Services */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Services
				</h3>

				<div className="space-y-2">
					<Label htmlFor="supported-services">Supported Services</Label>
					<Textarea
						id="supported-services"
						placeholder="Enter supported AWS services, comma-separated (e.g., EC2, S3, RDS)"
						value={((config.supportedServices as string[]) || []).join(", ")}
						onChange={(e) =>
							updateConfig(
								"supportedServices",
								e.target.value.split(",").map((service) => service.trim()).filter(service => service !== "")
							)
						}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="restricted-services">Restricted Services</Label>
					<Textarea
						id="restricted-services"
						placeholder="Enter restricted AWS services, comma-separated"
						value={((config.restrictedServices as string[]) || []).join(", ")}
						onChange={(e) =>
							updateConfig(
								"restrictedServices",
								e.target.value.split(",").map((service) => service.trim()).filter(service => service !== "")
							)
						}
					/>
				</div>
			</div>

			{/* Compliance */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Compliance & Governance
				</h3>

				<div className="space-y-2">
					<Label htmlFor="compliance-frameworks">Compliance Frameworks</Label>
					<Textarea
						id="compliance-frameworks"
						placeholder="Enter compliance frameworks, comma-separated (e.g., SOC2, PCI-DSS, GDPR)"
						value={((config.complianceFrameworks as string[]) || []).join(", ")}
						onChange={(e) =>
							updateConfig(
								"complianceFrameworks",
								e.target.value.split(",").map((framework) => framework.trim()).filter(framework => framework !== "")
							)
						}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="data-residency">Data Residency Requirements</Label>
					<Textarea
						id="data-residency"
						placeholder="Describe data residency requirements..."
						value={(config.dataResidencyRequirements as string) || ""}
						onChange={(e) => updateConfig("dataResidencyRequirements", e.target.value)}
						rows={3}
					/>
				</div>
			</div>

			{/* Tags */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Tags
				</h3>

				<div className="space-y-2">
					<Label htmlFor="region-tags">Region Tags</Label>
					<Textarea
						id="region-tags"
						placeholder="Enter tags as key=value pairs, comma-separated (e.g., Environment=prod, Project=web-app)"
						value={tagsToString((config.tags as Record<string, string>) || {})}
						onChange={(e) => updateTags(parseTagsFromString(e.target.value))}
					/>
				</div>
			</div>
		</div>
	);
};

export default AWSRegionConfigurationForm;
