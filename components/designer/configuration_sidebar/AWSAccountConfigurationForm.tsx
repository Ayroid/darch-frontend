import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export interface AWSAccountConfiguration {
	// Basic Account Information
	name: string;
	accountId: string;
	accountAlias: string;
	accountType: string; // 'root' | 'organizational' | 'standalone'
	rootEmail: string;

	// Organization Settings
	organizationId: string;
	organizationRole: string; // 'master' | 'member'
	organizationalUnitId: string;
	organizationalUnitName: string;

	// Account Status
	status: string; // 'active' | 'suspended' | 'closed'
	joinedMethod: string; // 'invited' | 'created'
	joinedTimestamp: string;

	// Security & Compliance
	mfaEnabled: boolean;
	passwordPolicy: {
		minimumPasswordLength: number;
		requireSymbols: boolean;
		requireNumbers: boolean;
		requireUppercase: boolean;
		requireLowercase: boolean;
		allowUsersToChangePassword: boolean;
		expirePasswords: boolean;
		maxPasswordAge: number;
		passwordReusePrevention: number;
	};

	// Access Management
	crossAccountRoles: Array<{
		roleName: string;
		trustedAccount: string;
		permissions: string[];
		externalId?: string;
	}>;

	// Billing & Cost Management
	billingMode: string; // 'individual' | 'consolidated'
	costCenter: string;
	budgetAlerts: Array<{
		name: string;
		amount: number;
		threshold: number;
		currency: string;
	}>;

	// Service Limits
	serviceLimits: Array<{
		service: string;
		limitName: string;
		currentValue: number;
		defaultValue: number;
		requestedValue?: number;
	}>;

	// Regions
	enabledRegions: string[];
	defaultRegion: string;
	restrictedRegions: string[];

	// Networking
	defaultVpcs: Array<{
		region: string;
		vpcId: string;
		isDefault: boolean;
	}>;

	// Logging & Monitoring
	cloudTrailEnabled: boolean;
	configEnabled: boolean;
	guardDutyEnabled: boolean;
	securityHubEnabled: boolean;

	// Governance
	scpPolicies: string[];
	complianceStandards: string[];

	// Contact Information
	alternateContacts: {
		billing?: {
			name: string;
			title: string;
			email: string;
			phone: string;
		};
		operations?: {
			name: string;
			title: string;
			email: string;
			phone: string;
		};
		security?: {
			name: string;
			title: string;
			email: string;
			phone: string;
		};
	};

	// Tags
	tags: Record<string, string>;
}

const accountTypes = ["root", "organizational", "standalone"];
const organizationRoles = ["master", "member"];
const accountStatuses = ["active", "suspended", "closed"];
const joinedMethods = ["invited", "created"];

const awsRegions = [
	"us-east-1", "us-east-2", "us-west-1", "us-west-2",
	"af-south-1", "ap-east-1", "ap-south-1", "ap-south-2",
	"ap-southeast-1", "ap-southeast-2", "ap-southeast-3", "ap-southeast-4",
	"ap-northeast-1", "ap-northeast-2", "ap-northeast-3",
	"ca-central-1", "ca-west-1", "eu-central-1", "eu-central-2",
	"eu-west-1", "eu-west-2", "eu-west-3", "eu-south-1", "eu-south-2",
	"eu-north-1", "il-central-1", "me-central-1", "me-south-1", "sa-east-1"
];

const complianceStandards = [
	"SOC 1", "SOC 2", "SOC 3", "PCI DSS", "HIPAA", "FedRAMP",
	"ISO 27001", "GDPR", "CCPA", "NIST", "DoD CC SRG"
];

const AWSAccountConfigurationForm: React.FC<{
	config: Record<string, unknown>;
	onChange: (config: Record<string, unknown>) => void;
}> = ({ config, onChange }) => {
	const updateConfig = (
		key: keyof AWSAccountConfiguration,
		value: AWSAccountConfiguration[keyof AWSAccountConfiguration]
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
			{/* Basic Account Information */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Basic Account Information
				</h3>

				<div className="space-y-2">
					<Label htmlFor="account-name">Name</Label>
					<Input
						id="account-name"
						value={(config.name as string) || ""}
						onChange={(e) => updateConfig("name", e.target.value)}
						placeholder="e.g., Production Account"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="accountId">Account ID</Label>
					<Input
						id="accountId"
						value={(config.accountId as string) || ""}
						onChange={(e) => updateConfig("accountId", e.target.value)}
						placeholder="e.g., 123456789012"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="accountAlias">Account Alias</Label>
					<Input
						id="accountAlias"
						value={(config.accountAlias as string) || ""}
						onChange={(e) => updateConfig("accountAlias", e.target.value)}
						placeholder="e.g., my-company-prod"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="accountType">Account Type</Label>
					<Select
						value={(config.accountType as string) || ""}
						onValueChange={(value) => updateConfig("accountType", value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select account type" />
						</SelectTrigger>
						<SelectContent>
							{accountTypes.map((type) => (
								<SelectItem key={type} value={type}>
									{type.charAt(0).toUpperCase() + type.slice(1)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="rootEmail">Root Email</Label>
					<Input
						id="rootEmail"
						type="email"
						value={(config.rootEmail as string) || ""}
						onChange={(e) => updateConfig("rootEmail", e.target.value)}
						placeholder="root@company.com"
					/>
				</div>
			</div>

			{/* Organization Settings */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Organization Settings
				</h3>

				<div className="space-y-2">
					<Label htmlFor="organizationId">Organization ID</Label>
					<Input
						id="organizationId"
						value={(config.organizationId as string) || ""}
						onChange={(e) => updateConfig("organizationId", e.target.value)}
						placeholder="o-1234567890"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="organizationRole">Organization Role</Label>
					<Select
						value={(config.organizationRole as string) || ""}
						onValueChange={(value) => updateConfig("organizationRole", value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select role" />
						</SelectTrigger>
						<SelectContent>
							{organizationRoles.map((role) => (
								<SelectItem key={role} value={role}>
									{role.charAt(0).toUpperCase() + role.slice(1)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="organizationalUnitId">Organizational Unit ID</Label>
					<Input
						id="organizationalUnitId"
						value={(config.organizationalUnitId as string) || ""}
						onChange={(e) => updateConfig("organizationalUnitId", e.target.value)}
						placeholder="ou-1234567890"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="organizationalUnitName">Organizational Unit Name</Label>
					<Input
						id="organizationalUnitName"
						value={(config.organizationalUnitName as string) || ""}
						onChange={(e) => updateConfig("organizationalUnitName", e.target.value)}
						placeholder="Production OU"
					/>
				</div>
			</div>

			{/* Account Status */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Account Status
				</h3>

				<div className="space-y-2">
					<Label htmlFor="status">Status</Label>
					<Select
						value={(config.status as string) || ""}
						onValueChange={(value) => updateConfig("status", value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select status" />
						</SelectTrigger>
						<SelectContent>
							{accountStatuses.map((status) => (
								<SelectItem key={status} value={status}>
									{status.charAt(0).toUpperCase() + status.slice(1)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="joinedMethod">Joined Method</Label>
					<Select
						value={(config.joinedMethod as string) || ""}
						onValueChange={(value) => updateConfig("joinedMethod", value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select method" />
						</SelectTrigger>
						<SelectContent>
							{joinedMethods.map((method) => (
								<SelectItem key={method} value={method}>
									{method.charAt(0).toUpperCase() + method.slice(1)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="joinedTimestamp">Joined Timestamp</Label>
					<Input
						id="joinedTimestamp"
						type="datetime-local"
						value={(config.joinedTimestamp as string) || ""}
						onChange={(e) => updateConfig("joinedTimestamp", e.target.value)}
					/>
				</div>
			</div>

			{/* Security & Compliance */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Security & Compliance
				</h3>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="mfaEnabled"
						checked={(config.mfaEnabled as boolean) || false}
						onCheckedChange={(checked) => updateConfig("mfaEnabled", !!checked)}
					/>
					<Label htmlFor="mfaEnabled">MFA Enabled</Label>
				</div>
			</div>

			{/* Regions */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Regions
				</h3>

				<div className="space-y-2">
					<Label htmlFor="defaultRegion">Default Region</Label>
					<Select
						value={(config.defaultRegion as string) || ""}
						onValueChange={(value) => updateConfig("defaultRegion", value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select default region" />
						</SelectTrigger>
						<SelectContent>
							{awsRegions.map((region) => (
								<SelectItem key={region} value={region}>
									{region}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>Enabled Regions</Label>
					<div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
						{awsRegions.map((region) => (
							<div key={region} className="flex items-center space-x-2">
								<Checkbox
									id={`enabled-${region}`}
									checked={((config.enabledRegions as string[]) || []).includes(region)}
									onCheckedChange={(checked) => {
										const current = (config.enabledRegions as string[]) || [];
										if (checked) {
											updateConfig("enabledRegions", [...current, region]);
										} else {
											updateConfig("enabledRegions", current.filter(r => r !== region));
										}
									}}
								/>
								<Label htmlFor={`enabled-${region}`} className="text-sm">
									{region}
								</Label>
							</div>
						))}
					</div>
				</div>

				<div className="space-y-2">
					<Label>Restricted Regions</Label>
					<div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
						{awsRegions.map((region) => (
							<div key={region} className="flex items-center space-x-2">
								<Checkbox
									id={`restricted-${region}`}
									checked={((config.restrictedRegions as string[]) || []).includes(region)}
									onCheckedChange={(checked) => {
										const current = (config.restrictedRegions as string[]) || [];
										if (checked) {
											updateConfig("restrictedRegions", [...current, region]);
										} else {
											updateConfig("restrictedRegions", current.filter(r => r !== region));
										}
									}}
								/>
								<Label htmlFor={`restricted-${region}`} className="text-sm">
									{region}
								</Label>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Logging & Monitoring */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Logging & Monitoring
				</h3>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="cloudTrailEnabled"
						checked={(config.cloudTrailEnabled as boolean) || false}
						onCheckedChange={(checked) => updateConfig("cloudTrailEnabled", !!checked)}
					/>
					<Label htmlFor="cloudTrailEnabled">CloudTrail Enabled</Label>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="configEnabled"
						checked={(config.configEnabled as boolean) || false}
						onCheckedChange={(checked) => updateConfig("configEnabled", !!checked)}
					/>
					<Label htmlFor="configEnabled">Config Enabled</Label>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="guardDutyEnabled"
						checked={(config.guardDutyEnabled as boolean) || false}
						onCheckedChange={(checked) => updateConfig("guardDutyEnabled", !!checked)}
					/>
					<Label htmlFor="guardDutyEnabled">GuardDuty Enabled</Label>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="securityHubEnabled"
						checked={(config.securityHubEnabled as boolean) || false}
						onCheckedChange={(checked) => updateConfig("securityHubEnabled", !!checked)}
					/>
					<Label htmlFor="securityHubEnabled">Security Hub Enabled</Label>
				</div>
			</div>

			{/* Compliance Standards */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Compliance Standards
				</h3>

				<div className="space-y-2">
					<Label>Compliance Standards</Label>
					<div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
						{complianceStandards.map((standard) => (
							<div key={standard} className="flex items-center space-x-2">
								<Checkbox
									id={`compliance-${standard}`}
									checked={((config.complianceStandards as string[]) || []).includes(standard)}
									onCheckedChange={(checked) => {
										const current = (config.complianceStandards as string[]) || [];
										if (checked) {
											updateConfig("complianceStandards", [...current, standard]);
										} else {
											updateConfig("complianceStandards", current.filter(s => s !== standard));
										}
									}}
								/>
								<Label htmlFor={`compliance-${standard}`} className="text-sm">
									{standard}
								</Label>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Billing & Cost Management */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Billing & Cost Management
				</h3>

				<div className="space-y-2">
					<Label htmlFor="billingMode">Billing Mode</Label>
					<Select
						value={(config.billingMode as string) || ""}
						onValueChange={(value) => updateConfig("billingMode", value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select billing mode" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="individual">Individual</SelectItem>
							<SelectItem value="consolidated">Consolidated</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="costCenter">Cost Center</Label>
					<Input
						id="costCenter"
						value={(config.costCenter as string) || ""}
						onChange={(e) => updateConfig("costCenter", e.target.value)}
						placeholder="e.g., IT-Operations"
					/>
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

export default AWSAccountConfigurationForm;
