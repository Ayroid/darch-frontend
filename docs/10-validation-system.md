# Validation System

This document covers the comprehensive validation system that ensures data integrity, type safety, and user input validation throughout the application using Zod schemas and runtime validation.

## Overview

The validation system provides robust type-safe validation for all data structures, user inputs, and API interactions. It leverages Zod for schema definition and runtime validation, ensuring data consistency across the application.

**Main Components**:
- Validation Store (`lib/stores/validation/`)
- Zod Schemas for all data types
- Form Validation Integration
- Runtime Type Checking

## Validation Store

### Store Structure

**File**: `lib/stores/validation/validation-store.ts`

```typescript
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { z, ZodError } from "zod";

interface ValidationState {
  // Validation Results
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  isValidating: boolean;
  
  // Validation History
  validationHistory: ValidationResult[];
  
  // Actions
  validateField: (field: string, value: unknown, schema: z.ZodSchema) => ValidationResult;
  validateObject: (data: unknown, schema: z.ZodSchema) => ValidationResult;
  clearErrors: (field?: string) => void;
  clearWarnings: (field?: string) => void;
  addError: (field: string, message: string) => void;
  addWarning: (field: string, message: string) => void;
  
  // Bulk Validation
  validateConfiguration: (nodeId: string, config: unknown) => Promise<ValidationResult>;
  validateArchitecture: (data: unknown) => Promise<ValidationResult>;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  data?: unknown;
  timestamp: number;
}

export const useValidationStore = create<ValidationState>()(
  immer((set, get) => ({
    errors: {},
    warnings: {},
    isValidating: false,
    validationHistory: [],

    validateField: (field, value, schema) => {
      set((state) => {
        state.isValidating = true;
      });

      try {
        const validatedValue = schema.parse(value);
        
        // Clear existing errors for this field
        set((state) => {
          if (state.errors[field]) {
            delete state.errors[field];
          }
          state.isValidating = false;
        });

        return {
          isValid: true,
          errors: {},
          warnings: {},
          data: validatedValue,
          timestamp: Date.now(),
        };
      } catch (error) {
        if (error instanceof ZodError) {
          const errorMessages = error.errors.map((err) => err.message);
          
          set((state) => {
            state.errors[field] = errorMessages;
            state.isValidating = false;
          });

          return {
            isValid: false,
            errors: { [field]: errorMessages },
            warnings: {},
            timestamp: Date.now(),
          };
        }

        // Handle unexpected errors
        set((state) => {
          state.errors[field] = ["Validation error occurred"];
          state.isValidating = false;
        });

        return {
          isValid: false,
          errors: { [field]: ["Validation error occurred"] },
          warnings: {},
          timestamp: Date.now(),
        };
      }
    },

    validateObject: (data, schema) => {
      set((state) => {
        state.isValidating = true;
      });

      try {
        const validatedData = schema.parse(data);
        
        // Clear all errors
        set((state) => {
          state.errors = {};
          state.isValidating = false;
        });

        const result: ValidationResult = {
          isValid: true,
          errors: {},
          warnings: {},
          data: validatedData,
          timestamp: Date.now(),
        };

        // Add to history
        set((state) => {
          state.validationHistory.push(result);
          if (state.validationHistory.length > 50) {
            state.validationHistory = state.validationHistory.slice(-50);
          }
        });

        return result;
      } catch (error) {
        if (error instanceof ZodError) {
          const errors: Record<string, string[]> = {};
          
          error.errors.forEach((err) => {
            const path = err.path.join(".");
            if (!errors[path]) {
              errors[path] = [];
            }
            errors[path].push(err.message);
          });

          set((state) => {
            state.errors = { ...state.errors, ...errors };
            state.isValidating = false;
          });

          const result: ValidationResult = {
            isValid: false,
            errors,
            warnings: {},
            timestamp: Date.now(),
          };

          // Add to history
          set((state) => {
            state.validationHistory.push(result);
            if (state.validationHistory.length > 50) {
              state.validationHistory = state.validationHistory.slice(-50);
            }
          });

          return result;
        }

        // Handle unexpected errors
        const result: ValidationResult = {
          isValid: false,
          errors: { root: ["Validation error occurred"] },
          warnings: {},
          timestamp: Date.now(),
        };

        set((state) => {
          state.errors.root = ["Validation error occurred"];
          state.isValidating = false;
          state.validationHistory.push(result);
        });

        return result;
      }
    },

    clearErrors: (field) => {
      set((state) => {
        if (field) {
          delete state.errors[field];
        } else {
          state.errors = {};
        }
      });
    },

    clearWarnings: (field) => {
      set((state) => {
        if (field) {
          delete state.warnings[field];
        } else {
          state.warnings = {};
        }
      });
    },

    addError: (field, message) => {
      set((state) => {
        if (!state.errors[field]) {
          state.errors[field] = [];
        }
        state.errors[field].push(message);
      });
    },

    addWarning: (field, message) => {
      set((state) => {
        if (!state.warnings[field]) {
          state.warnings[field] = [];
        }
        state.warnings[field].push(message);
      });
    },

    validateConfiguration: async (nodeId, config) => {
      const configSchema = getConfigurationSchema(nodeId);
      return get().validateObject(config, configSchema);
    },

    validateArchitecture: async (data) => {
      const { architectureDataSchema } = await import("../types/architecture-schemas");
      return get().validateObject(data, architectureDataSchema);
    },
  }))
);
```

## Zod Schemas

### Architecture Data Schemas

**File**: `lib/types/architecture-schemas.ts`

```typescript
import { z } from "zod";

// Position Schema
export const positionSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
});

// Dimensions Schema
export const dimensionsSchema = z.object({
  width: z.number().positive().min(50).max(2000),
  height: z.number().positive().min(50).max(2000),
});

// Base Configuration Schema
export const baseConfigurationSchema = z.object({
  serviceName: z.string().min(1, "Service name is required").max(100),
  serviceId: z.string().min(1, "Service ID is required"),
  resourceType: z.string().min(1, "Resource type is required"),
  tags: z.record(z.string()).optional(),
  description: z.string().max(500).optional(),
});

// AWS Region Schema
export const awsRegionConfigSchema = baseConfigurationSchema.extend({
  region: z.enum([
    "us-east-1", "us-east-2", "us-west-1", "us-west-2",
    "eu-west-1", "eu-west-2", "eu-west-3", "eu-central-1",
    "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-northeast-2",
  ]),
  regionName: z.string(),
});

// VPC Configuration Schema
export const vpcConfigSchema = baseConfigurationSchema.extend({
  cidrBlock: z.string()
    .regex(/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/, "Invalid CIDR format")
    .refine((cidr) => {
      const [ip, mask] = cidr.split('/');
      const maskNum = parseInt(mask);
      return maskNum >= 16 && maskNum <= 28;
    }, "VPC CIDR mask must be between /16 and /28"),
  
  region: z.string().min(1, "Region is required"),
  enableDnsSupport: z.boolean().default(true),
  enableDnsHostnames: z.boolean().default(true),
  tenancy: z.enum(["default", "dedicated"]).default("default"),
});

// Subnet Configuration Schema
export const subnetConfigSchema = baseConfigurationSchema.extend({
  cidrBlock: z.string()
    .regex(/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/, "Invalid CIDR format"),
  
  availabilityZone: z.string().min(1, "Availability zone is required"),
  vpcId: z.string().min(1, "VPC ID is required"),
  isPublic: z.boolean().default(false),
  mapPublicIpOnLaunch: z.boolean().default(false),
});

// EC2 Instance Configuration Schema
export const ec2ConfigSchema = baseConfigurationSchema.extend({
  instanceType: z.enum([
    "t3.micro", "t3.small", "t3.medium", "t3.large",
    "m5.large", "m5.xlarge", "m5.2xlarge",
    "c5.large", "c5.xlarge", "c5.2xlarge",
    "r5.large", "r5.xlarge", "r5.2xlarge",
  ]),
  
  amiId: z.string().regex(/^ami-[a-zA-Z0-9]{8,17}$/, "Invalid AMI ID format"),
  keyName: z.string().min(1, "Key pair name is required").max(255),
  
  subnetId: z.string().min(1, "Subnet ID is required"),
  securityGroupIds: z.array(z.string()).min(1, "At least one security group required"),
  
  userData: z.string().max(16384).optional(),
  iamInstanceProfile: z.string().optional(),
  
  monitoring: z.boolean().default(false),
  terminationProtection: z.boolean().default(false),
  
  ebsOptimized: z.boolean().default(false),
  rootVolumeSize: z.number().int().min(8).max(1000).default(20),
  rootVolumeType: z.enum(["gp2", "gp3", "io1", "io2"]).default("gp3"),
});

// Security Group Configuration Schema
export const securityGroupConfigSchema = baseConfigurationSchema.extend({
  vpcId: z.string().min(1, "VPC ID is required"),
  
  ingressRules: z.array(z.object({
    protocol: z.enum(["tcp", "udp", "icmp", "all"]),
    port: z.number().int().min(0).max(65535).optional(),
    portRange: z.object({
      from: z.number().int().min(0).max(65535),
      to: z.number().int().min(0).max(65535),
    }).optional(),
    sourceType: z.enum(["cidr", "securityGroup", "prefixList"]),
    source: z.string().min(1),
    description: z.string().max(255).optional(),
  })).default([]),
  
  egressRules: z.array(z.object({
    protocol: z.enum(["tcp", "udp", "icmp", "all"]),
    port: z.number().int().min(0).max(65535).optional(),
    portRange: z.object({
      from: z.number().int().min(0).max(65535),
      to: z.number().int().min(0).max(65535),
    }).optional(),
    destinationType: z.enum(["cidr", "securityGroup", "prefixList"]),
    destination: z.string().min(1),
    description: z.string().max(255).optional(),
  })).default([{
    protocol: "all",
    destinationType: "cidr",
    destination: "0.0.0.0/0",
    description: "Allow all outbound traffic",
  }]),
});

// Architecture Node Schema
export const architectureNodeSchema = z.object({
  id: z.string().min(1, "Node ID is required"),
  nodeType: z.enum(["awsService", "awsContainer"]),
  serviceType: z.string().min(1, "Service type is required"),
  name: z.string().min(1, "Node name is required").max(100),
  icon: z.string().url().optional(),
  position: positionSchema,
  dimensions: dimensionsSchema.optional(),
  configuration: z.record(z.unknown()),
  isContainer: z.boolean(),
  parentId: z.string().optional(),
});

// Node Connection Schema
export const nodeConnectionSchema = z.object({
  id: z.string().min(1, "Connection ID is required"),
  source: z.string().min(1, "Source node ID is required"),
  target: z.string().min(1, "Target node ID is required"),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  type: z.string().default("smoothstep"),
});

// Architecture Metadata Schema
export const architectureMetadataSchema = z.object({
  name: z.string().min(1, "Architecture name is required").max(100),
  description: z.string().max(500).optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Invalid version format"),
  createdAt: z.string().datetime(),
  lastModified: z.string().datetime(),
  provider: z.enum(["aws", "azure", "gcp"]),
  author: z.string().max(100).optional(),
  license: z.string().max(50).optional(),
});

// Complete Architecture Data Schema
export const architectureDataSchema = z.object({
  metadata: architectureMetadataSchema,
  nodes: z.array(architectureNodeSchema),
  connections: z.array(nodeConnectionSchema),
  variables: z.record(z.unknown()).default({}),
  outputs: z.record(z.unknown()).default({}),
});

// Export all schemas
export {
  positionSchema,
  dimensionsSchema,
  baseConfigurationSchema,
  awsRegionConfigSchema,
  vpcConfigSchema,
  subnetConfigSchema,
  ec2ConfigSchema,
  securityGroupConfigSchema,
  architectureNodeSchema,
  nodeConnectionSchema,
  architectureMetadataSchema,
  architectureDataSchema,
};
```

### Dynamic Schema Selection

```typescript
// Get appropriate schema based on service type
export const getConfigurationSchema = (serviceType: string): z.ZodSchema => {
  const schemaMap: Record<string, z.ZodSchema> = {
    "aws-region": awsRegionConfigSchema,
    "aws-vpc": vpcConfigSchema,
    "aws-public-subnet": subnetConfigSchema,
    "aws-private-subnet": subnetConfigSchema,
    "aws-ec2": ec2ConfigSchema,
    "aws-security-group": securityGroupConfigSchema,
    // Add more as needed
  };

  return schemaMap[serviceType] || baseConfigurationSchema;
};

// Validate configuration with appropriate schema
export const validateConfiguration = (serviceType: string, config: unknown) => {
  const schema = getConfigurationSchema(serviceType);
  return schema.safeParse(config);
};
```

## Form Validation Integration

### Validated Form Components

**File**: `components/ui/validated-form.tsx`

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useValidationStore } from "@/lib/stores/validation/validation-store";

interface ValidatedFormProps<T extends z.ZodType> {
  schema: T;
  defaultValues?: Partial<z.infer<T>>;
  onSubmit: (data: z.infer<T>) => void;
  onValidationChange?: (isValid: boolean, errors: Record<string, string[]>) => void;
  children: (props: {
    register: any;
    formState: any;
    watch: any;
    setValue: any;
    trigger: any;
  }) => React.ReactNode;
}

export function ValidatedForm<T extends z.ZodType>({
  schema,
  defaultValues,
  onSubmit,
  onValidationChange,
  children,
}: ValidatedFormProps<T>) {
  const { addError, clearErrors } = useValidationStore();
  
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange",
  });

  const { formState, watch, register, handleSubmit, setValue, trigger } = form;

  // Sync validation state with store
  useEffect(() => {
    const errors: Record<string, string[]> = {};
    
    Object.entries(formState.errors).forEach(([field, error]) => {
      if (error?.message) {
        errors[field] = [error.message];
      }
    });

    onValidationChange?.(formState.isValid, errors);
  }, [formState.isValid, formState.errors, onValidationChange]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {children({ register, formState, watch, setValue, trigger })}
    </form>
  );
}
```

### Field-Level Validation

```typescript
// Custom validated input component
interface ValidatedInputProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  schema: z.ZodSchema;
  register: any;
  errors: any;
  className?: string;
}

export function ValidatedInput({
  name,
  label,
  type = "text",
  placeholder,
  required,
  schema,
  register,
  errors,
  className,
}: ValidatedInputProps) {
  const { validateField } = useValidationStore();
  const [localError, setLocalError] = useState<string>("");

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const value = event.target.value;
      const result = validateField(name, value, schema);
      
      if (!result.isValid) {
        const errorMessage = Object.values(result.errors)[0]?.[0] || "";
        setLocalError(errorMessage);
      } else {
        setLocalError("");
      }
    },
    [name, schema, validateField]
  );

  const errorMessage = errors[name]?.message || localError;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name)}
        onBlur={handleBlur}
        className={errorMessage ? "border-red-500" : ""}
      />
      
      {errorMessage && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </p>
      )}
    </div>
  );
}
```

## Real-Time Validation

### Live Configuration Validation

```typescript
// Real-time validation hook
export const useRealTimeValidation = (
  data: unknown,
  schema: z.ZodSchema,
  debounceMs: number = 300
) => {
  const { validateObject } = useValidationStore();
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  
  const debouncedValidate = useMemo(
    () => debounce((value: unknown) => {
      const result = validateObject(value, schema);
      setValidationResult(result);
    }, debounceMs),
    [validateObject, schema, debounceMs]
  );

  useEffect(() => {
    debouncedValidate(data);
    return () => debouncedValidate.cancel();
  }, [data, debouncedValidate]);

  return validationResult;
};

// Usage in configuration forms
const ConfigurationForm = ({ nodeId, configuration }: ConfigurationFormProps) => {
  const schema = getConfigurationSchema(nodeId);
  const validationResult = useRealTimeValidation(configuration, schema);

  return (
    <div className="configuration-form">
      {validationResult && !validationResult.isValid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Errors</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {Object.entries(validationResult.errors).map(([field, errors]) => (
                <li key={field}>
                  <strong>{field}:</strong> {errors.join(", ")}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Form fields */}
    </div>
  );
};
```

### Cross-Field Validation

```typescript
// Custom validation for dependent fields
export const createCrossFieldValidator = <T>(
  validator: (data: T) => string[] | null
) => {
  return z.any().superRefine((data, ctx) => {
    const errors = validator(data);
    if (errors) {
      errors.forEach((error) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error,
        });
      });
    }
  });
};

// Example: VPC and Subnet CIDR validation
export const vpcSubnetValidator = createCrossFieldValidator<{
  vpcCidr: string;
  subnetCidr: string;
}>((data) => {
  if (!data.vpcCidr || !data.subnetCidr) {
    return null;
  }

  // Check if subnet CIDR is within VPC CIDR
  if (!isSubnetWithinVPC(data.subnetCidr, data.vpcCidr)) {
    return ["Subnet CIDR must be within VPC CIDR range"];
  }

  return null;
});

// Usage in schema
const vpcSubnetSchema = z.object({
  vpcCidr: z.string(),
  subnetCidr: z.string(),
}).pipe(vpcSubnetValidator);
```

## Error Display Components

### Validation Error Display

```typescript
interface ValidationErrorsProps {
  errors: Record<string, string[]>;
  warnings?: Record<string, string[]>;
  className?: string;
}

export function ValidationErrors({ 
  errors, 
  warnings = {}, 
  className 
}: ValidationErrorsProps) {
  const hasErrors = Object.keys(errors).length > 0;
  const hasWarnings = Object.keys(warnings).length > 0;

  if (!hasErrors && !hasWarnings) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Errors</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              {Object.entries(errors).map(([field, fieldErrors]) => (
                <div key={field}>
                  <strong className="text-sm font-medium">{field}:</strong>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    {fieldErrors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {hasWarnings && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warnings</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              {Object.entries(warnings).map(([field, fieldWarnings]) => (
                <div key={field}>
                  <strong className="text-sm font-medium">{field}:</strong>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    {fieldWarnings.map((warning, index) => (
                      <li key={index} className="text-sm">{warning}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

### Inline Field Validation

```typescript
interface FieldValidationIndicatorProps {
  fieldName: string;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  showSuccess?: boolean;
}

export function FieldValidationIndicator({
  fieldName,
  errors,
  warnings,
  showSuccess = true,
}: FieldValidationIndicatorProps) {
  const fieldErrors = errors[fieldName] || [];
  const fieldWarnings = warnings[fieldName] || [];
  const hasErrors = fieldErrors.length > 0;
  const hasWarnings = fieldWarnings.length > 0;
  const isValid = !hasErrors && !hasWarnings;

  return (
    <div className="flex items-center gap-2">
      {hasErrors && (
        <Tooltip>
          <TooltipTrigger>
            <XCircle className="w-4 h-4 text-red-500" />
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              {fieldErrors.map((error, index) => (
                <p key={index} className="text-sm">{error}</p>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      {!hasErrors && hasWarnings && (
        <Tooltip>
          <TooltipTrigger>
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              {fieldWarnings.map((warning, index) => (
                <p key={index} className="text-sm">{warning}</p>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      {isValid && showSuccess && (
        <CheckCircle className="w-4 h-4 text-green-500" />
      )}
    </div>
  );
}
```

## Custom Validators

### AWS-Specific Validators

```typescript
// CIDR validation
export const cidrValidator = z.string().refine(
  (value) => {
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    if (!cidrRegex.test(value)) {
      return false;
    }

    const [ip, mask] = value.split('/');
    const maskNum = parseInt(mask);
    const ipParts = ip.split('.').map(Number);

    // Validate IP parts
    if (ipParts.some(part => part < 0 || part > 255)) {
      return false;
    }

    // Validate mask
    return maskNum >= 0 && maskNum <= 32;
  },
  "Invalid CIDR format"
);

// AWS resource name validator
export const awsResourceNameValidator = z.string()
  .min(1, "Resource name is required")
  .max(255, "Resource name too long")
  .regex(
    /^[a-zA-Z0-9\-_\.]+$/,
    "Resource name can only contain letters, numbers, hyphens, underscores, and periods"
  )
  .refine(
    (value) => !value.startsWith('-') && !value.endsWith('-'),
    "Resource name cannot start or end with hyphens"
  );

// Security group rule validator
export const securityGroupRuleValidator = z.object({
  protocol: z.enum(['tcp', 'udp', 'icmp', 'all']),
  port: z.number().int().min(0).max(65535).optional(),
  portRange: z.object({
    from: z.number().int().min(0).max(65535),
    to: z.number().int().min(0).max(65535),
  }).refine(
    (range) => range.from <= range.to,
    "Port range 'from' must be less than or equal to 'to'"
  ).optional(),
  source: z.string().min(1),
}).refine(
  (rule) => {
    if (rule.protocol !== 'all') {
      return rule.port !== undefined || rule.portRange !== undefined;
    }
    return true;
  },
  "Port or port range is required for specific protocols"
);
```

### Async Validators

```typescript
// Async validation for unique names
export const createUniqueNameValidator = (
  checkUnique: (name: string) => Promise<boolean>
) => {
  return z.string().refine(
    async (name) => {
      if (!name) return true; // Let required validation handle empty values
      return await checkUnique(name);
    },
    "Name must be unique"
  );
};

// Usage in form
const uniqueVpcNameValidator = createUniqueNameValidator(async (name) => {
  const existingNames = getExistingVpcNames();
  return !existingNames.includes(name);
});

const vpcSchema = z.object({
  name: uniqueVpcNameValidator,
  cidrBlock: cidrValidator,
  // ... other fields
});
```

## Performance Optimization

### Validation Debouncing

```typescript
// Debounced validation hook
export const useDebouncedValidation = <T>(
  value: T,
  validator: (value: T) => Promise<z.SafeParseReturnType<T, T>>,
  delay: number = 300
) => {
  const [result, setResult] = useState<z.SafeParseReturnType<T, T> | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const debouncedValidator = useMemo(
    () => debounce(async (val: T) => {
      setIsValidating(true);
      try {
        const validationResult = await validator(val);
        setResult(validationResult);
      } finally {
        setIsValidating(false);
      }
    }, delay),
    [validator, delay]
  );

  useEffect(() => {
    debouncedValidator(value);
    return () => debouncedValidator.cancel();
  }, [value, debouncedValidator]);

  return { result, isValidating };
};
```

### Schema Caching

```typescript
// Cache compiled schemas for performance
const schemaCache = new Map<string, z.ZodSchema>();

export const getCachedSchema = (key: string, schemaFactory: () => z.ZodSchema) => {
  if (!schemaCache.has(key)) {
    schemaCache.set(key, schemaFactory());
  }
  return schemaCache.get(key)!;
};

// Usage
const getVpcSchema = () => getCachedSchema('vpc', () => vpcConfigSchema);
```

This comprehensive validation system ensures data integrity and provides excellent user experience through real-time validation, clear error messaging, and robust type safety throughout the application.
