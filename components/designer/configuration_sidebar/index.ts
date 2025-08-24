import VPCConfigurationForm from "./VPCConfigurationForm";
import type { VPCConfiguration } from "./VPCConfigurationForm";

import EC2ConfigurationForm from "./EC2ConfigurationForm";
import type { EC2Configuration } from "./EC2ConfigurationForm";

import DefaultConfigurationForm from "./DefaultConfigurationForm";
import type { DefaultConfiguration } from "./DefaultConfigurationForm";

import AWSRegionConfigurationForm from "./AWSRegionConfigurationForm";
import type { AWSRegionConfiguration } from "./AWSRegionConfigurationForm";

import AvailabilityZoneConfigurationForm from "./AvailabilityZoneConfigurationForm";
import type { AvailabilityZoneConfiguration } from "./AvailabilityZoneConfigurationForm";

import PrivateSubnetConfigurationForm from "./PrivateSubnetConfigurationForm";
import type { PrivateSubnetConfiguration } from "./PrivateSubnetConfigurationForm";

import PublicSubnetConfigurationForm from "./PublicSubnetConfigurationForm";
import type { PublicSubnetConfiguration } from "./PublicSubnetConfigurationForm";

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
type ConfigurationTypes =
	| VPCConfiguration
	| EC2Configuration
	| DefaultConfiguration
	| AWSRegionConfiguration
	| AvailabilityZoneConfiguration
	| PrivateSubnetConfiguration
	| PublicSubnetConfiguration;

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
