"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { SecurityGroupConfiguration, SecurityGroupRule } from "@/lib/types/aws-resources";
import { useConfigurationContext } from "@/lib/stores";
import { useFormValidation } from "@/lib/stores/hooks/use-form-validation";
import { useAutoConfiguration } from "@/hooks/use-auto-configuration";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SecurityGroupConfigurationFormProps {
  config: SecurityGroupConfiguration;
  onChange: (config: SecurityGroupConfiguration) => void;
}

const emptyIngressRule: SecurityGroupRule = {
  protocol: "tcp",
  port: 80,
  source: "0.0.0.0/0",
  description: "",
};

const emptyEgressRule: SecurityGroupRule = {
  protocol: "all",
  port: "all",
  destination: "0.0.0.0/0",
  description: "",
};

const SecurityGroupConfigurationForm: React.FC<SecurityGroupConfigurationFormProps> = ({
  config,
  onChange,
}) => {
  const { nodeId, serviceId } = useConfigurationContext();
  const { validateField } = useFormValidation(nodeId, serviceId || "", config);
  const { isFieldDisabled } = useAutoConfiguration({
    nodeId: nodeId || '',
    resourceType: 'aws-security-group'
  });

  const handleFieldChange = (field: keyof SecurityGroupConfiguration, value: unknown) => {
    const updatedConfig: SecurityGroupConfiguration = {
      ...config,
      [field]: value as never,
    };
    onChange(updatedConfig);
    validateField(field as string, value);
  };

  const updateRule = (
    type: "ingressRules" | "egressRules",
    index: number,
    field: keyof SecurityGroupRule,
    value: unknown
  ) => {
    const rules = [...(config[type] || [])];
    const current = { ...rules[index] } as SecurityGroupRule;

    let newValue: unknown = value;
    if (field === "port") {
      const str = String(value).trim();
      if (str.toLowerCase() === "all") newValue = "all";
      else {
        const num = parseInt(str, 10);
        newValue = Number.isFinite(num) ? num : "all";
      }
    }

  (current as unknown as Record<string, unknown>)[field as string] = newValue;
    rules[index] = current;
    handleFieldChange(type, rules);
  };

  const addRule = (type: "ingressRules" | "egressRules") => {
    const rules = [...(config[type] || [])];
    rules.push(type === "ingressRules" ? { ...emptyIngressRule } : { ...emptyEgressRule });
    handleFieldChange(type, rules);
  };

  const removeRule = (type: "ingressRules" | "egressRules", index: number) => {
    const rules = [...(config[type] || [])];
    rules.splice(index, 1);
    handleFieldChange(type, rules);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Basic */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Basic</h3>

          <div className="space-y-2">
            <Label htmlFor="sg-name">Security Group Name<span className="text-red-600">*</span></Label>
            <Input
              id="sg-name"
              value={config.resourceName || ""}
              onChange={(e) => handleFieldChange("resourceName", e.target.value)}
              placeholder="e.g., WebSecurityGroup"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vpcId">VPC ID<span className="text-red-600">*</span></Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Input
                    id="vpcId"
                    value={config.vpcId || ""}
                    onChange={(e) => handleFieldChange("vpcId", e.target.value)}
                    placeholder="e.g., vpc-0abc123def456"
                    disabled={isFieldDisabled('vpcId')}
                  />
                </div>
              </TooltipTrigger>
              {isFieldDisabled('vpcId') && (
                <TooltipContent>
                  <p>This field is auto-configured from the parent VPC container</p>
                </TooltipContent>
              )}
            </Tooltip>
          </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={config.description || ""}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            placeholder="Describe the purpose of this security group"
            className="min-h-[60px]"
          />
        </div>
      </div>

      {/* Ingress Rules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Ingress Rules</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => addRule("ingressRules")}>+ Add</Button>
        </div>

        {(config.ingressRules || []).map((rule, idx) => (
          <div key={`ingress-${idx}`} className="grid grid-cols-2 gap-3 p-3 border rounded-md">
            <div className="space-y-2">
              <Label>Protocol</Label>
              <Select
                value={rule.protocol}
                onValueChange={(value) => updateRule("ingressRules", idx, "protocol", value as SecurityGroupRule["protocol"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Protocol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tcp">TCP</SelectItem>
                  <SelectItem value="udp">UDP</SelectItem>
                  <SelectItem value="icmp">ICMP</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Port</Label>
              <Input
                value={String(rule.port)}
                onChange={(e) => updateRule("ingressRules", idx, "port", e.target.value)}
                placeholder="e.g., 80 or all"
              />
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Input
                value={rule.source || ""}
                onChange={(e) => updateRule("ingressRules", idx, "source", e.target.value)}
                placeholder="CIDR or SG ID (e.g., 0.0.0.0/0 or sg-1234)"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={rule.description || ""}
                onChange={(e) => updateRule("ingressRules", idx, "description", e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="col-span-2 flex justify-end">
              <Button type="button" variant="ghost" onClick={() => removeRule("ingressRules", idx)}>Remove</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Egress Rules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Egress Rules</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => addRule("egressRules")}>+ Add</Button>
        </div>

        {(config.egressRules || []).map((rule, idx) => (
          <div key={`egress-${idx}`} className="grid grid-cols-2 gap-3 p-3 border rounded-md">
            <div className="space-y-2">
              <Label>Protocol</Label>
              <Select
                value={rule.protocol}
                onValueChange={(value) => updateRule("egressRules", idx, "protocol", value as SecurityGroupRule["protocol"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Protocol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tcp">TCP</SelectItem>
                  <SelectItem value="udp">UDP</SelectItem>
                  <SelectItem value="icmp">ICMP</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Port</Label>
              <Input
                value={String(rule.port)}
                onChange={(e) => updateRule("egressRules", idx, "port", e.target.value)}
                placeholder="e.g., 443 or all"
              />
            </div>
            <div className="space-y-2">
              <Label>Destination</Label>
              <Input
                value={rule.destination || ""}
                onChange={(e) => updateRule("egressRules", idx, "destination", e.target.value)}
                placeholder="CIDR or SG ID (e.g., 0.0.0.0/0 or sg-1234)"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={rule.description || ""}
                onChange={(e) => updateRule("egressRules", idx, "description", e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="col-span-2 flex justify-end">
              <Button type="button" variant="ghost" onClick={() => removeRule("egressRules", idx)}>Remove</Button>
            </div>
          </div>
        ))}
      </div>
      </div>
    </TooltipProvider>
  );
};

export default SecurityGroupConfigurationForm;

export type { SecurityGroupConfiguration };
