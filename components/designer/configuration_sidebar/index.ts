import VPCConfigurationForm from "./VPCConfigurationForm";
import EC2ConfigurationForm from "./EC2ConfigurationForm";
import DefaultConfigurationForm from "./DefaultConfigurationForm";
import AWSRegionConfigurationForm from "./AWSRegionConfigurationForm";
import AvailabilityZoneConfigurationForm from "./AvailabilityZoneConfigurationForm";
import PrivateSubnetConfigurationForm from "./PrivateSubnetConfigurationForm";
import PublicSubnetConfigurationForm from "./PublicSubnetConfigurationForm";

const ConfigurationSidebarMap = {
	VPCConfigurationForm,
	EC2ConfigurationForm,
	DefaultConfigurationForm,
	AWSRegionConfigurationForm,
	AvailabilityZoneConfigurationForm,
	PrivateSubnetConfigurationForm,
	PublicSubnetConfigurationForm,
};

export { ConfigurationSidebarMap };
