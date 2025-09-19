import { AWSResourceConfiguration } from "@/lib/types/aws-resources";

/**
 * Shared utilities for managing tags in AWS resource configurations
 */

export const tagUtils = {
  /**
   * Updates a tag value or removes it if value is empty
   */
  handleTagChange: (
    config: AWSResourceConfiguration,
    key: string,
    value: string,
    onChange: (config: AWSResourceConfiguration) => void
  ) => {
    const currentTags = config.tags || {};
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
  },

  /**
   * Adds a new tag with auto-generated key
   */
  addTag: (
    config: AWSResourceConfiguration,
    onChange: (config: AWSResourceConfiguration) => void
  ) => {
    const currentTags = config.tags || {};
    const key = `Key${Object.keys(currentTags).length + 1}`;
    onChange({
      ...config,
      tags: { ...currentTags, [key]: "" },
    });
  },

  /**
   * Removes a specific tag
   */
  removeTag: (
    config: AWSResourceConfiguration,
    onChange: (config: AWSResourceConfiguration) => void,
    keyToRemove: string
  ) => {
    const currentTags = config.tags || {};
    const newTags = { ...currentTags };
    delete newTags[keyToRemove];
    onChange({ ...config, tags: newTags });
  },

  /**
   * Validates tag key-value pairs
   */
  validateTag: (key: string, value: string): { valid: boolean; error?: string } => {
    if (!key.trim()) {
      return { valid: false, error: "Tag key cannot be empty" };
    }
    if (key.length > 128) {
      return { valid: false, error: "Tag key cannot exceed 128 characters" };
    }
    if (value.length > 256) {
      return { valid: false, error: "Tag value cannot exceed 256 characters" };
    }
    return { valid: true };
  },

  /**
   * Gets all tag entries as key-value pairs
   */
  getTagEntries: (config: AWSResourceConfiguration): Array<[string, string]> => {
    return Object.entries(config.tags || {});
  },

  /**
   * Checks if configuration has any tags
   */
  hasTags: (config: AWSResourceConfiguration): boolean => {
    return Object.keys(config.tags || {}).length > 0;
  }
};
