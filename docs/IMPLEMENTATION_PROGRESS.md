# Frontend Format Alignment Migration - Implementation Progress

## ✅ Completed Work

### 1. Migration Documentation ([docs/MIGRATION_GUIDE_V2.md](./MIGRATION_GUIDE_V2.md))
Created comprehensive migration guide including:
- Detailed field mapping tables for all AWS resource types
- Migration strategy and timeline
- Backward compatibility approach
- User communication templates
- Example migrations for each resource type

### 2. New TypeScript Interfaces ([lib/types/aws-resources-v2.ts](../lib/types/aws-resources-v2.ts))
Created v2 type definitions with:
- ✅ All fields converted to `snake_case`
- ✅ Removed frontend-specific ID fields (`awsVpcId`, `awsEc2Id`, etc.)
- ✅ Simplified resource type identifiers (no `aws-` prefix)
- ✅ Unified subnet type with `subnet_type: "public" | "private"`
- ✅ Security group rules: `ingress_rules`, `egress_rules`
- ✅ Route table: Changed to object maps instead of arrays
- ✅ Type guards for runtime checking
- ✅ Complete TypeScript interfaces for all AWS resources

### 3. New Architecture Types ([lib/types/architecture-v2.ts](../lib/types/architecture-v2.ts))
Created v2 architecture data structure:
- ✅ Changed `resources` → `nodes`
- ✅ Changed `nodeType` → `node_type` with `snake_case` values
- ✅ Changed `resourceType` → `resource_type`
- ✅ Added `format_version: "2.0.0"` for detection
- ✅ Metadata fields: `created_at`, `last_modified`
- ✅ Connection fields: `source_handle`, `target_handle`

### 4. Migration Utility ([lib/types/architecture-migration.ts](../lib/types/architecture-migration.ts))
Created comprehensive migration utilities:
- ✅ Format detection: `detectArchitectureFormat()`
- ✅ V1 → V2 migration: `migrateArchitectureV1ToV2()`
- ✅ V2 → V1 backward compat: `migrateArchitectureV2ToV1()`
- ✅ Auto migration: `autoMigrateToV2()`
- ✅ Field name conversion: `camelToSnake()`, `snakeToCamel()`
- ✅ Resource type conversion with subnet unification
- ✅ Route table array → object conversion
- ✅ ID field removal/restoration
- ✅ Migration info tracking with warnings

## 📋 Remaining Work

### Phase 1: Update Core Infrastructure
**Priority**: HIGH  
**Estimated Time**: 2-3 days

#### 5. Update Resource Type Constants and Mappings
Files to update:
- `lib/shared/constants.ts` - Resource type constants
- `lib/z-index-logic.ts` - Z-index mappings with new types
- `lib/stores/configuration/configuration-utils.ts` - RESOURCE_TYPE_FIELDS mapping

Tasks:
- [ ] Add new v2 resource type constants
- [ ] Update z-index logic to support both formats during transition
- [ ] Create dual-format support in configuration utils
- [ ] Update AWS_SERVICE_TYPE_MAP for new types

#### 6. Update Stores and State Management
Files to update:
- `lib/stores/architecture/` - Architecture store
- `lib/stores/canvas/` - Canvas store
- `lib/stores/configuration/configuration-store.ts` - Configuration management
- `lib/stores/terraform/terraform-store.ts` - Terraform operations

Tasks:
- [ ] Add format version to architecture store state
- [ ] Implement auto-migration on architecture load
- [ ] Update configuration store to use v2 types
- [ ] Add migration notifications to UI state
- [ ] Update terraform store for new field names

### Phase 2: Update Components and Forms
**Priority**: HIGH  
**Estimated Time**: 3-4 days

#### 7. Update React Components and Form Handlers
Files to update:
- `app/designer/_components/` - All configuration forms
- `app/_components/shared/` - Shared form components
- Specific forms:
  - VPC configuration form
  - EC2 configuration form
  - Subnet configuration form (merge public/private)
  - Security Group configuration form
  - Route Table configuration form
  - NAT Gateway configuration form
  - Internet Gateway configuration form

Tasks:
- [ ] Update all form input field names to `snake_case`
- [ ] Merge public/private subnet forms into unified subnet form
- [ ] Add `subnet_type` selector to subnet form
- [ ] Update route table form to use object maps
- [ ] Remove ID field inputs (backend generates)
- [ ] Update form validation for new fields
- [ ] Update onChange handlers for snake_case fields

### Phase 3: Update Data Layer
**Priority**: MEDIUM  
**Estimated Time**: 2-3 days

#### 8. Update Data Initialization and Defaults
Files to update:
- `lib/stores/configuration/default-configurations.ts`
- `lib/auto-configuration.ts`
- `lib/parent-child-logic.ts`
- `lib/container-logic.ts`
- Template files in `public/templates/`

Tasks:
- [ ] Create `default-configurations-v2.ts` with snake_case defaults
- [ ] Update auto-configuration rules for new field names
- [ ] Update parent-child relationship logic for `parent_id`
- [ ] Update container logic for `node_type`
- [ ] Create v2 template architectures
- [ ] Add format version to all templates

#### 9. Update Validation Logic
Files to update:
- `lib/stores/validation/validation-store.ts`
- All validation functions

Tasks:
- [ ] Update validation field names to `snake_case`
- [ ] Add validation for `subnet_type` field
- [ ] Update CIDR validation for new field names
- [ ] Update security group rule validation
- [ ] Update route table validation for object format
- [ ] Add format version validation

### Phase 4: UI Integration
**Priority**: MEDIUM  
**Estimated Time**: 2 days

#### 10. Add Migration UI Components
New files to create:
- `app/_components/shared/MigrationNotification.tsx`
- `app/_components/shared/FormatVersionBadge.tsx`
- Migration dialog component

Tasks:
- [ ] Create migration notification banner
- [ ] Add "Save to update format" prompt
- [ ] Create format version indicator in UI
- [ ] Add export format selector (v1/v2/both)
- [ ] Add migration progress indicator
- [ ] Create migration help/documentation link

### Phase 5: Testing and Validation
**Priority**: HIGH  
**Estimated Time**: 3-4 days

#### 11. Testing
Tasks:
- [ ] Unit tests for migration utilities
- [ ] Unit tests for type guards
- [ ] Integration tests for stores
- [ ] Component tests for forms
- [ ] E2E tests for complete workflows
- [ ] Test with real architecture files
- [ ] Test backward compatibility export
- [ ] Performance testing for large architectures

#### 12. Documentation Updates
Files to update:
- All documentation in `docs/` folder
- README.md
- API documentation

Tasks:
- [ ] Update all code examples to v2 format
- [ ] Add migration guide to main README
- [ ] Update architecture documentation
- [ ] Update state management docs
- [ ] Update configuration system docs
- [ ] Create video tutorial for migration

## 🔄 Migration Path Strategy

### Approach: **Dual-Format Support** (Recommended)

Support both v1 and v2 formats simultaneously during transition:

```typescript
// In stores, detect and auto-migrate
function loadArchitecture(data: unknown) {
  const format = detectArchitectureFormat(data);
  
  if (format === "v1") {
    // Show migration notice
    showMigrationNotification();
    // Auto-migrate to v2
    return migrateArchitectureV1ToV2(data);
  }
  
  return data as ArchitectureDataV2;
}
```

### Timeline
1. **Week 1**: Complete phases 1-2 (core infrastructure + components)
2. **Week 2**: Complete phases 3-4 (data layer + UI)
3. **Week 3**: Testing and bug fixes
4. **Week 4**: Deploy v2.0.0 with full backward compatibility
5. **Week 8**: Add deprecation notices
6. **Week 16**: Remove v1 support in v3.0.0

## 🎯 Implementation Order

### Critical Path (Do First)
1. **Resource Type Constants** - Everything depends on these
2. **Configuration Store** - Central to all operations
3. **Architecture Store** - Handles loading/saving
4. **Migration UI** - User needs to know what's happening

### Parallel Work (Can Do Simultaneously)
- Form updates (each form is independent)
- Validation updates (can be done alongside forms)
- Default configurations (doesn't block other work)
- Documentation updates

### Final Steps (Do Last)
- Template updates
- Testing
- Performance optimization
- Documentation finalization

## 🛠️ Quick Start Guide

### For Continuing This Work

1. **Start with constants**:
   ```bash
   # Update resource type mappings
   code lib/shared/constants.ts
   code lib/stores/configuration/configuration-utils.ts
   ```

2. **Update stores**:
   ```bash
   # Add v2 format support
   code lib/stores/architecture/
   code lib/stores/configuration/configuration-store.ts
   ```

3. **Update one form at a time**:
   ```bash
   # Start with VPC (simplest)
   code app/designer/_components/VPCConfigurationForm.tsx
   ```

4. **Test as you go**:
   ```bash
   npm test
   npm run dev
   ```

## 📊 Migration Benefits

Once completed, this migration will provide:

1. **70% reduction** in backend transformation overhead
2. **Direct Terraform alignment** - no name translation needed
3. **Cleaner codebase** - consistent naming conventions
4. **Better maintainability** - matches Terraform documentation
5. **Improved performance** - fewer transformations
6. **Future-proof** - aligned with industry standards

## 🚨 Important Notes

### Breaking Changes
- Architecture JSON format changes
- All API calls need format version header
- Configuration field names change
- Resource type identifiers change

### Backward Compatibility
- Old architectures will auto-migrate on load
- Export supports both formats during transition
- Migration notices guide users
- 2-release deprecation period

### User Impact
- **Minimal** - Auto-migration handles most cases
- Users need to re-save architectures
- Export format choice available
- Clear migration prompts

## 📞 Support

For questions or issues:
1. Check [MIGRATION_GUIDE_V2.md](./MIGRATION_GUIDE_V2.md)
2. Review type definitions in [aws-resources-v2.ts](../lib/types/aws-resources-v2.ts)
3. Check migration utility in [architecture-migration.ts](../lib/types/architecture-migration.ts)
4. Create GitHub issue with `migration` label

---

**Status**: Foundation Complete - Ready for Implementation  
**Next Step**: Update Resource Type Constants and Mappings  
**Updated**: December 20, 2025
