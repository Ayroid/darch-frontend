import VPCConfigurationForm from "./VPCConfigurationForm";
import EC2ConfigurationForm from "./EC2ConfigurationForm";
import DefaultConfigurationForm from "./DefaultConfigurationForm";
import AWSRegionConfigurationForm from "./AWSRegionConfigurationForm";
import AvailabilityZoneConfigurationForm from "./AvailabilityZoneConfigurationForm";
import SubnetConfigurationForm from "./SubnetConfigurationForm";
import SecurityGroupConfigurationForm from "./SecurityGroupConfigurationForm";
import InternetGatewayConfigurationForm from "./InternetGatewayConfigurationForm";
import NATGatewayConfigurationForm from "./NATGatewayConfigurationForm";
import RouteTableConfigurationForm from "./RouteTableConfigurationForm";
import DynamicConfigurationForm from "./DynamicConfigurationForm";

// Legacy form map - use DynamicConfigurationForm for new resources
const ConfigurationSidebarMap = {
	VPCConfigurationForm,
	EC2ConfigurationForm,
	DefaultConfigurationForm,
	AWSRegionConfigurationForm,
	AvailabilityZoneConfigurationForm,
	SubnetConfigurationForm,
	SecurityGroupConfigurationForm,
	InternetGatewayConfigurationForm,
	NATGatewayConfigurationForm,
	RouteTableConfigurationForm,
};

export { ConfigurationSidebarMap, DynamicConfigurationForm };
