import VPCConfigurationForm from "./VPCConfigurationForm";
import EC2ConfigurationForm from "./EC2ConfigurationForm";
import DefaultConfigurationForm from "./DefaultConfigurationForm";
import AWSRegionConfigurationForm from "./AWSRegionConfigurationForm";
import AvailabilityZoneConfigurationForm from "./AvailabilityZoneConfigurationForm";
import PrivateSubnetConfigurationForm from "./PrivateSubnetConfigurationForm";
import PublicSubnetConfigurationForm from "./PublicSubnetConfigurationForm";

// Import types from centralized location
import type {
	VPCConfiguration,
	EC2Configuration,
	DefaultConfiguration,
	AWSRegionConfiguration,
	AvailabilityZoneConfiguration,
	PrivateSubnetConfiguration,
	PublicSubnetConfiguration,
	AWSResourceConfiguration,
} from "@/lib/types/aws-resources";

const ConfigurationSidebarMap = {
	VPCConfigurationForm,
	EC2ConfigurationForm,
	DefaultConfigurationForm,
	AWSRegionConfigurationForm,
	AvailabilityZoneConfigurationForm,
	PrivateSubnetConfigurationForm,
	PublicSubnetConfigurationForm,
};

// Create a union of the configuration types
type ConfigurationTypes = AWSResourceConfiguration;

export { ConfigurationSidebarMap };
export type {
	VPCConfiguration,
	EC2Configuration,
	DefaultConfiguration,
	AWSRegionConfiguration,
	AvailabilityZoneConfiguration,
	PrivateSubnetConfiguration,
	PublicSubnetConfiguration,
	ConfigurationTypes
};
