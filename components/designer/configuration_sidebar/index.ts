import VPCConfigurationForm from "./VPCConfigurationForm";
import type { VPCConfiguration } from "./VPCConfigurationForm";

import EC2ConfigurationForm from "./EC2ConfigurationForm";
import type { EC2Configuration } from "./EC2ConfigurationForm";

import DefaultConfigurationForm from "./DefaultConfigurationForm";
import type { DefaultConfiguration } from "./DefaultConfigurationForm";

const ConfigurationSidebarMap = {
	VPCConfigurationForm,
	EC2ConfigurationForm,
	DefaultConfigurationForm,
};

// Create a union of the configuration types
type ConfigurationTypes = VPCConfiguration | EC2Configuration | DefaultConfiguration;

export { ConfigurationSidebarMap };
export type { VPCConfiguration, EC2Configuration, DefaultConfiguration, ConfigurationTypes };
