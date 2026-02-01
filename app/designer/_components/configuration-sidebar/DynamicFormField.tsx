"use client";

import React from "react";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Textarea } from "@/app/_components/ui/textarea";
import { Switch } from "@/app/_components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { FieldDefinition, FieldOption } from "@/lib/schemas/resource-schemas";
import AutoConfigurationTooltip from "@/app/_components/utilities/AutoConfigurationTooltip";

interface DynamicFormFieldProps {
  field: FieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  isDisabled?: boolean;
  isAutoConfigured?: boolean;
}

function normalizeOptions(options: FieldOption[] | string[] | undefined): FieldOption[] {
  if (!options) return [];
  return options.map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );
}

export const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  field,
  value,
  onChange,
  isDisabled = false,
  isAutoConfigured = false,
}) => {
  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'cidr':
        return (
          <div className="relative">
            <Input
              id={field.name}
              placeholder={field.placeholder}
              value={(value as string) || ""}
              onChange={(e) => onChange(e.target.value)}
              disabled={isDisabled}
            />
            {isAutoConfigured && (
              <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
                <AutoConfigurationTooltip parentContainer={field.autoConfigParent || "Parent"} />
              </div>
            )}
          </div>
        );

      case 'number':
        return (
          <Input
            id={field.name}
            type="number"
            placeholder={field.placeholder}
            value={value !== undefined ? Number(value) : (field.default as number) || ""}
            onChange={(e) => onChange(Number.parseInt(e.target.value))}
            min={field.min}
            max={field.max}
            disabled={isDisabled}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.name}
              checked={Boolean(value ?? field.default)}
              onCheckedChange={onChange}
              disabled={isDisabled}
            />
            {field.description && (
              <span className="text-xs text-muted-foreground">
                {field.description}
              </span>
            )}
          </div>
        );

      case 'select':
        const options = normalizeOptions(field.options);
        return (
          <Select
            value={(value as string) || (field.default as string) || ""}
            onValueChange={onChange}
            disabled={isDisabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'textarea':
        return (
          <Textarea
            id={field.name}
            placeholder={field.placeholder}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={isDisabled}
            className="min-h-[60px]"
          />
        );

      case 'array':
        const arrayValue = Array.isArray(value) ? value : [];
        return (
          <div className="relative">
            <Textarea
              id={field.name}
              value={arrayValue.join(", ")}
              onChange={(e) =>
                onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))
              }
              placeholder={field.placeholder}
              className="min-h-[60px]"
              disabled={isDisabled}
            />
            {isAutoConfigured && (
              <p className="text-xs text-muted-foreground mt-1">
                This field is automatically configured from {field.autoConfigParent} containers.
              </p>
            )}
          </div>
        );

      default:
        return (
          <Input
            id={field.name}
            placeholder={field.placeholder}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={isDisabled}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="text-red-600 ml-1">*</span>}
      </Label>
      {renderField()}
      {field.description && field.type !== 'boolean' && field.type !== 'array' && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
    </div>
  );
};

export default DynamicFormField;
