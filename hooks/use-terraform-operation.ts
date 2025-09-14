/**
 * React Hook for Terraform Operations
 *
 * Following the Darch Terraform API Integration Guide specifications.
 * Provides a complete implementation of the async job pattern with polling,
 * error handling, and real-time progress updates.
 *
 * Usage:
 * ```tsx
 * const { job, isPolling, startPlan, startApply, startDestroy } = useTerraformOperation();
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Get backend URL from environment variable with fallback
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Types matching the API guide specifications exactly
interface TerraformJobStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100 percentage
  message: string;
  createdAt: string;
  updatedAt: string;
  logs: string[];
  result?: Record<string, unknown> | null;
  error?: string | null;
  rawOutput?: string;
}



interface UseTerraformOperationReturn {
  job: TerraformJobStatus | null;
  isPolling: boolean;
  error: string | null;
  networkError: boolean;

  // Operation starters - matching API guide
  startOperation: (operation: 'plan' | 'apply' | 'destroy', data?: unknown, projectName?: string) => Promise<string>;
  startPlan: (data: unknown, projectName: string) => Promise<string>;
  startApply: (data: unknown, projectName: string) => Promise<string>;
  startDestroy: (projectName: string) => Promise<string>;

  // Control methods
  cancelOperation: () => void;
  clearError: () => void;

  // Progress tracking
  getProgressMessage: () => string;
  getStatusIcon: () => string;
}

/**
 * Custom hook for managing Terraform operations following the API guide
 */
export function useTerraformOperation(): UseTerraformOperationReturn {
  const [job, setJob] = useState<TerraformJobStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastLogCountRef = useRef(0);

  /**
   * Start a Terraform operation following the API guide pattern
   */
  const startOperation = useCallback(async (
    operation: 'plan' | 'apply' | 'destroy',
    data?: unknown,
    projectName?: string
  ): Promise<string> => {
    try {
      setError(null);
      setNetworkError(false);

      // Prepare request body based on operation
      const requestBody: Record<string, unknown> = {
        projectName: projectName?.toLowerCase().replace(/\s+/g, '-') || 'default-project'
      };

      if (operation !== 'destroy' && data) {
        if (operation === 'plan') {
          requestBody.architectureData = data;
        } else if (operation === 'apply') {
          requestBody.architecture = data;
        }
      }

      // Start the operation
      const response = await fetch(`${BACKEND_URL}/api/terraform/${operation}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || `Failed to start ${operation}`);
      }

      const jobId = result.jobId || result.data?.jobId;
      if (!jobId) {
        throw new Error('No job ID returned from server');
      }

      // Initialize job state
      setJob({
        id: jobId,
        status: 'pending',
        progress: 0,
        message: `Starting ${operation}...`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        logs: [],
      });

      setIsPolling(true);
      lastLogCountRef.current = 0;

      return jobId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);

      if (errorMessage.includes('Failed to fetch')) {
        setNetworkError(true);
      }

      throw err;
    }
  }, []);

  /**
   * Convenience methods for specific operations
   */
  const startPlan = useCallback((data: unknown, projectName: string) => {
    return startOperation('plan', data, projectName);
  }, [startOperation]);

  const startApply = useCallback((data: unknown, projectName: string) => {
    return startOperation('apply', data, projectName);
  }, [startOperation]);

  const startDestroy = useCallback((projectName: string) => {
    return startOperation('destroy', undefined, projectName);
  }, [startOperation]);

  /**
   * Cancel the current operation
   */
  const cancelOperation = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPolling(false);
    setJob(null);
    lastLogCountRef.current = 0;
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
    setNetworkError(false);
  }, []);

  /**
   * Get human-readable progress message
   */
  const getProgressMessage = useCallback(() => {
    if (!job) return '';

    const operation = job.id.includes('plan_') ? 'Plan' :
                     job.id.includes('apply_') ? 'Apply' :
                     job.id.includes('destroy_') ? 'Destroy' : 'Operation';

    switch (job.status) {
      case 'pending':
        return `${operation} queued...`;
      case 'running':
        return `${operation} in progress (${job.progress}%)`;
      case 'completed':
        return `${operation} completed successfully`;
      case 'failed':
        return `${operation} failed`;
      default:
        return '';
    }
  }, [job]);

  /**
   * Get status icon
   */
  const getStatusIcon = useCallback(() => {
    if (!job) return '⚪';

    switch (job.status) {
      case 'pending':
        return '⏳';
      case 'running':
        return '🔄';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '⚪';
    }
  }, [job]);

  /**
   * Polling effect - follows API guide specifications
   */
  useEffect(() => {
    if (!isPolling || !job?.id) return;

    const operation = job.id.includes('plan_') ? 'plan' :
                     job.id.includes('apply_') ? 'apply' :
                     job.id.includes('destroy_') ? 'destroy' : null;

    if (!operation) {
      console.warn('Could not determine operation type from job ID:', job.id);
      return;
    }

    const pollStatus = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/terraform/${operation}-status/${job.id}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          const jobStatus: TerraformJobStatus = result.data;

          setJob(prevJob => {
            if (!prevJob) return jobStatus;

            // Merge with previous state to maintain consistency
            return {
              ...prevJob,
              ...jobStatus,
              logs: jobStatus.logs || prevJob.logs,
            };
          });

          // Check if job is completed
          if (jobStatus.status === 'completed' || jobStatus.status === 'failed') {
            setIsPolling(false);
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Polling failed';
        setError(errorMessage);

        if (errorMessage.includes('Failed to fetch')) {
          setNetworkError(true);
        }

        // Don't stop polling on network errors - retry
        // Only stop on persistent failures
      }
    };

    // Start polling with 1-second intervals (as recommended in guide)
    pollIntervalRef.current = setInterval(pollStatus, 1000);

    // Initial poll
    pollStatus();

    // Cleanup
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [isPolling, job?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  return {
    job,
    isPolling,
    error,
    networkError,
    startOperation,
    startPlan,
    startApply,
    startDestroy,
    cancelOperation,
    clearError,
    getProgressMessage,
    getStatusIcon,
  };
}

/**
 * Example usage component following the API guide
 *
 * ```tsx
 * import { useTerraformOperation } from '@/hooks/use-terraform-operation';
 *
 * function TerraformExample() {
 *   const {
 *     job,
 *     isPolling,
 *     startPlan,
 *     startApply,
 *     startDestroy,
 *     getProgressMessage,
 *     getStatusIcon
 *   } = useTerraformOperation();
 *
 *   const handlePlan = async () => {
 *     try {
 *       await startPlan(architectureData, 'my-project');
 *     } catch (error) {
 *       console.error('Failed to start plan:', error);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handlePlan} disabled={isPolling}>
 *         Start Plan
 *       </button>
 *
 *       {job && (
 *         <div>
 *           <span>{getStatusIcon()}</span>
 *           <span>{getProgressMessage()}</span>
 *           <progress value={job.progress} max={100} />
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
