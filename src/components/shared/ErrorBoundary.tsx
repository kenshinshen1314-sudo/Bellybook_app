import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error using the logger
    logger.error('ErrorBoundary caught error:', error);
    logger.error('Component stack:', errorInfo.componentStack);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <Card className="w-full max-w-md border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">Oops! Something went wrong</CardTitle>
              <CardDescription>
                An unexpected error occurred. The error has been logged.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
                  <p className="text-sm font-medium text-destructive">Error:</p>
                  <p className="mt-1 text-xs text-destructive/80">
                    {this.state.error.message || 'Unknown error'}
                  </p>
                </div>
              )}
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="rounded-lg border border-border bg-muted/50 p-3">
                  <summary className="cursor-pointer text-sm font-medium">
                    Component Stack (dev only)
                  </summary>
                  <pre className="mt-2 overflow-x-auto text-xs text-muted-foreground">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={this.handleReset}
                className="flex-1"
              >
                Try Again
              </Button>
              <Button
                variant="default"
                onClick={this.handleReload}
                className="flex-1"
              >
                Reload Page
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook version for functional components (limited functionality)
 *
 * Note: This is a simplified version. For full error boundary functionality,
 * use the class-based ErrorBoundary component above.
 *
 * @example
 * ```tsx
 * const { error, resetError } = useErrorHandler();
 * if (error) {
 *   return <ErrorFallback onReset={resetError} />;
 * }
 * ```
 */
export function useErrorHandler() {
  return {
    error: null,
    resetError: () => {},
  };
}
