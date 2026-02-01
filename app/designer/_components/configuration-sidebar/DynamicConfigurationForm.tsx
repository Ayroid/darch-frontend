"use client";

import React from "react";
import { TooltipProvider } from "@/app/_components/ui/tooltip";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { CollapsibleSection } from "@/app/_components/shared/CollapsibleSection";
import { DynamicFormField } from "./DynamicFormField";
import {
  getResourceSchema,
  getFieldsForSection,
} from "@/lib/schemas/resource-schemas";
import { useConfigurationContext } from "@/lib/stores";
import { useAutoConfiguration } from "@/lib/hooks/use-auto-configuration";
import { AWSResourceConfiguration } from "@/lib/types/aws-resources";
import {
  addTag,
  handleTagChange,
  removeTag,
} from "@/app/_components/utilities/ConfigurationSidebarUtils";
import { TbSettingsSpark, TbSettings } from "react-icons/tb";
import { FiGlobe, FiCpu, FiDatabase, FiShield } from "react-icons/fi";
import { VscGitMerge } from "react-icons/vsc";

// Icon mapping
const ICON_MAP: Record<string, React.ReactNode> = {
  TbSettingsSpark: <TbSettingsSpark className="w-6 h-6 text-gray-600" />,
  TbSettings: <TbSettings className="w-6 h-6 text-gray-600" />,
  FiGlobe: <FiGlobe className="w-6 h-6 text-gray-600" />,
  FiCpu: <FiCpu className="w-6 h-6 text-gray-600" />,
  FiDatabase: <FiDatabase className="w-6 h-6 text-gray-600" />,
  FiShield: <FiShield className="w-6 h-6 text-gray-600" />,
  FiGitBranch: <VscGitMerge className="w-6 h-6 text-gray-600" />,
};

interface DynamicConfigurationFormProps {
  resourceType: string;
  config: AWSResourceConfiguration;
  onChange: (config: AWSResourceConfiguration) => void;
}

const DynamicConfigurationForm: React.FC<DynamicConfigurationFormProps> = ({
  resourceType,
  config,
  onChange,
}) => {
  const { nodeId } = useConfigurationContext();
  const { isFieldDisabled } = useAutoConfiguration({
    nodeId: nodeId || "",
    resourceType,
  });

  const schema = getResourceSchema(resourceType);

  const handleFieldChange = (fieldName: string, value: unknown) => {
    const updatedConfig = {
      ...config,
      [fieldName]: value,
    } as AWSResourceConfiguration;
    onChange(updatedConfig);
  };

  const renderSection = (sectionId: string, title: string, icon?: string, defaultOpen = true, isLast = false) => {
    const fields = getFieldsForSection(schema, sectionId);

    if (fields.length === 0) return null;

    // For auto-config section, only show if there are auto-configured fields that are actually disabled
    if (sectionId === 'auto-config') {
      const hasDisabledFields = fields.some(field =>
        field.autoConfigurable && isFieldDisabled(field.name)
      );
      if (!hasDisabledFields) return null;
    }

    return (
      <CollapsibleSection
        key={sectionId}
        title={title}
        icon={icon ? ICON_MAP[icon] : <TbSettings className="w-6 h-6 text-gray-600" />}
        defaultOpen={defaultOpen}
        borderbottom={!isLast}
      >
        <div className="space-y-4">
          {fields.map((field) => {
            const fieldValue = config[field.name as keyof typeof config];
            const isAutoConfigured = field.autoConfigurable && isFieldDisabled(field.name);

            // For auto-config section, only show fields that are actually auto-configured
            if (sectionId === 'auto-config' && !isAutoConfigured) {
              return null;
            }

            return (
              <DynamicFormField
                key={field.name}
                field={field}
                value={fieldValue}
                onChange={(value) => handleFieldChange(field.name, value)}
                isDisabled={isAutoConfigured}
                isAutoConfigured={isAutoConfigured}
              />
            );
          })}
        </div>
      </CollapsibleSection>
    );
  };

  const renderTagsSection = (isLast = false) => {
    return (
      <CollapsibleSection
        key="tags"
        title="Tags"
        defaultOpen={false}
        icon={<TbSettings className="w-6 h-6 text-gray-600" />}
        borderbottom={!isLast}
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                addTag(config, (updatedConfig) =>
                  onChange(updatedConfig as AWSResourceConfiguration)
                )
              }
            >
              + Add Tag
            </Button>
          </div>

          {Object.entries((config as { tags?: Record<string, string> }).tags || {}).map(
            ([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-2 gap-3 p-3 border rounded-md"
              >
                <div className="space-y-2">
                  <Label>Key</Label>
                  <Input
                    value={key}
                    onChange={(e) => {
                      const oldKey = key;
                      const newKey = e.target.value;
                      if (newKey !== oldKey) {
                        const tags = { ...(config as { tags?: Record<string, string> }).tags };
                        delete tags[oldKey];
                        if (newKey.trim() !== "") {
                          tags[newKey] = value;
                        }
                        onChange({ ...config, tags } as AWSResourceConfiguration);
                      }
                    }}
                    placeholder="Tag key"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    value={value}
                    onChange={(e) =>
                      handleTagChange(
                        config,
                        key,
                        e.target.value,
                        (updatedConfig) =>
                          onChange(updatedConfig as AWSResourceConfiguration)
                      )
                    }
                    placeholder="Tag value"
                  />
                </div>
                <div className="col-span-2 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      removeTag(
                        config,
                        (updatedConfig) =>
                          onChange(updatedConfig as AWSResourceConfiguration),
                        key
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )
          )}

          {Object.keys((config as { tags?: Record<string, string> }).tags || {}).length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <p>No tags configured. Click &quot;Add Tag&quot; to create your first tag.</p>
            </div>
          )}
        </div>
      </CollapsibleSection>
    );
  };

  // Get sections from schema, excluding tags (handled separately)
  const nonTagSections = schema.sections.filter(s => s.id !== 'tags');
  const hasTagsSection = schema.sections.some(s => s.id === 'tags');

  return (
    <TooltipProvider>
      <div className="space-y-4 py-4">
        {nonTagSections.map((section, index) => {
          const isLast = !hasTagsSection && index === nonTagSections.length - 1;
          return renderSection(
            section.id,
            section.title,
            section.icon,
            section.defaultOpen,
            isLast
          );
        })}
        {hasTagsSection && renderTagsSection(true)}
      </div>
    </TooltipProvider>
  );
};

export default DynamicConfigurationForm;
export type { DynamicConfigurationFormProps };
