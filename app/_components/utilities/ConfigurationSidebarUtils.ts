// Re-export from shared utilities for backwards compatibility
// TODO: Update imports to use @/lib/shared/tag-utils directly
import { tagUtils } from "@/lib/shared/tag-utils";

export { tagUtils };

// Legacy exports for backwards compatibility
export const {
  handleTagChange,
  addTag,
  removeTag
} = tagUtils;
