/**
 * Complete Terraform Progress Component
 *
 * This component demonstrates all the patterns from the Darch Terraform API Integration Guide.
 * It shows real-time progress, streaming logs, error handling, and all three operations
 * (plan, apply, destroy) in a production-ready implementation.
 *
 * Usage:
 * ```tsx
 * <TerraformProgressDemo
 *   architectureData={myArchData}
 *   projectName="my-infrastructure"
 * />
 * ```
 */

import React, { useState } from 'react';
import { useTerraformOperation } from '@/lib/hooks/use-terraform-operation';
import { Button } from '@/app/_components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/_components/ui/card';
import { Badge } from '@/app/_components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/app/_components/ui/alert';
import {
  FiPlay,
  FiCheck,
  FiTrash2,
  FiAlertTriangle,
  FiX,
  FiCopy,
  FiRefreshCw,
  FiClock,
  FiActivity
} from 'react-icons/fi';

interface TerraformProgressDemoProps {
  architectureData: unknown;
  projectName: string;
  className?: string;
}

/**
 * Production-ready Terraform operations component following the API guide
 */
export function TerraformProgressDemo({
  architectureData,
  projectName,
  className
}: TerraformProgressDemoProps) {
  const {
    job,
    isPolling,
    error,
    networkError,
    startPlan,
    startApply,
    startDestroy,
    cancelOperation,
    clearError,
    getProgressMessage,
    getStatusIcon
  } = useTerraformOperation();

  const [showLogs, setShowLogs] = useState(false);
  const [copiedLogs, setCopiedLogs] = useState(false);

  // Handle operations with error handling
  const handlePlan = async () => {
    try {
      await startPlan(architectureData, projectName);
    } catch (err) {
      console.error('Failed to start plan:', err);
    }
  };

  const handleApply = async () => {
    try {
      await startApply(architectureData, projectName);
    } catch (err) {
      console.error('Failed to start apply:', err);
    }
  };

  const handleDestroy = async () => {
    if (window.confirm('⚠️ This will destroy all infrastructure. Are you sure?')) {
      try {
        await startDestroy(projectName);
      } catch (err) {
        console.error('Failed to start destroy:', err);
      }
    }
  };

  // Copy logs to clipboard
  const handleCopyLogs = async () => {
    if (job?.logs && job.logs.length > 0) {
      try {
        await navigator.clipboard.writeText(job.logs.join('\n'));
        setCopiedLogs(true);
        setTimeout(() => setCopiedLogs(false), 2000);
      } catch (err) {
        console.error('Failed to copy logs:', err);
      }
    }
  };

  // Get status color for UI
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get progress bar color
  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const isOperationRunning = isPolling && job?.status === 'running';
  const canStartOperations = !isPolling;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FiActivity className="w-5 h-5" />
            <span>Terraform Operations</span>
          </CardTitle>
          <CardDescription>
            Complete infrastructure lifecycle management for <code>{projectName}</code>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error Display */}
          {(error || networkError) && (
            <Alert variant="destructive">
              <FiAlertTriangle className="h-4 w-4" />
              <AlertTitle>Operation Error</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>
                  {error || 'Network connectivity issue. Please check your connection and try again.'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearError}
                  className="ml-2"
                >
                  <FiX className="w-3 h-3" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Operation Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={handlePlan}
              disabled={!canStartOperations}
              variant="outline"
              className="h-20 flex-col space-y-2"
            >
              <FiCheck className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Plan</div>
                <div className="text-xs opacity-75">Preview changes</div>
              </div>
            </Button>

            <Button
              onClick={handleApply}
              disabled={!canStartOperations}
              variant="outline"
              className="h-20 flex-col space-y-2 border-green-200 hover:bg-green-50"
            >
              <FiPlay className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Apply</div>
                <div className="text-xs opacity-75">Create resources</div>
              </div>
            </Button>

            <Button
              onClick={handleDestroy}
              disabled={!canStartOperations}
              variant="outline"
              className="h-20 flex-col space-y-2 border-red-200 hover:bg-red-50"
            >
              <FiTrash2 className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Destroy</div>
                <div className="text-xs opacity-75">Remove all</div>
              </div>
            </Button>
          </div>

          {/* Job Status */}
          {job && (
            <Card className="border-dashed">
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {/* Status Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getStatusIcon()}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(job.status)}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            ID: {job.id}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {getProgressMessage()}
                        </p>
                      </div>
                    </div>

                    {isOperationRunning && (
                      <Button
                        onClick={cancelOperation}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <FiX className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{job.message}</span>
                      <span className="text-gray-500">{job.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(job.status)}`}
                        style={{ width: `${Math.max(job.progress, job.status === 'running' ? 5 : 0)}%` }}
                      />
                    </div>
                  </div>

                  {/* Timing Information */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <FiClock className="w-3 h-3" />
                      <span>Started: {new Date(job.createdAt).toLocaleTimeString()}</span>
                    </div>
                    {job.updatedAt !== job.createdAt && (
                      <div className="flex items-center space-x-1">
                        <FiRefreshCw className="w-3 h-3" />
                        <span>Updated: {new Date(job.updatedAt).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Logs Section */}
                  {job.logs && job.logs.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Live Logs ({job.logs.length} lines)</h4>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={handleCopyLogs}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <FiCopy className="w-3 h-3 mr-1" />
                            {copiedLogs ? 'Copied!' : 'Copy'}
                          </Button>
                          <Button
                            onClick={() => setShowLogs(!showLogs)}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            {showLogs ? 'Hide' : 'Show'} Logs
                          </Button>
                        </div>
                      </div>

                      {showLogs && (
                        <div className="bg-gray-900 text-green-400 p-3 rounded-md font-mono text-xs max-h-64 overflow-y-auto">
                          {job.logs.map((log: string, index: number) => (
                            <div key={index} className="whitespace-pre-wrap">
                              {log}
                            </div>
                          ))}
                          {isOperationRunning && (
                            <div className="animate-pulse text-blue-400">
                              ▋ Running...
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Results Section */}
                  {job.status === 'completed' && job.result && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <h4 className="font-medium text-green-900 mb-2 flex items-center">
                        <FiCheck className="w-4 h-4 mr-2" />
                        Operation Completed Successfully
                      </h4>
                      <details className="text-sm">
                        <summary className="cursor-pointer text-green-700 hover:text-green-900">
                          View Results
                        </summary>
                        <pre className="mt-2 bg-white p-2 rounded border text-xs overflow-x-auto">
                          {JSON.stringify(job.result, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}

                  {/* Raw Output Section */}
                  {job.rawOutput && (
                    <details className="text-sm">
                      <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                        Raw Terraform Output
                      </summary>
                      <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                        {job.rawOutput}
                      </pre>
                    </details>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Operation State */}
          {!job && (
            <div className="text-center py-8 text-gray-500">
              <FiActivity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">Ready for Terraform Operations</h3>
              <p className="text-sm">
                Choose an operation above to get started with your infrastructure management.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Reference */}
      <Card className="bg-gray-50">
        <CardContent className="pt-4">
          <h4 className="font-medium mb-2 text-sm">Quick Reference</h4>
          <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
            <div>
              <strong>Plan:</strong> Preview infrastructure changes without applying them
            </div>
            <div>
              <strong>Apply:</strong> Create or update infrastructure based on your architecture
            </div>
            <div>
              <strong>Destroy:</strong> Remove all infrastructure resources permanently
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TerraformProgressDemo;
