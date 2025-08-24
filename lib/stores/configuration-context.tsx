import React, { createContext, useContext } from 'react';

interface ConfigurationContextValue {
  nodeId: string | null;
  serviceId: string | null;
}

const ConfigurationContext = createContext<ConfigurationContextValue>({
  nodeId: null,
  serviceId: null,
});

export const useConfigurationContext = () => {
  return useContext(ConfigurationContext);
};

interface ConfigurationProviderProps {
  nodeId: string | null;
  serviceId: string | null;
  children: React.ReactNode;
}

export const ConfigurationProvider: React.FC<ConfigurationProviderProps> = ({
  nodeId,
  serviceId,
  children,
}) => {
  return (
    <ConfigurationContext.Provider value={{ nodeId, serviceId }}>
      {children}
    </ConfigurationContext.Provider>
  );
};
