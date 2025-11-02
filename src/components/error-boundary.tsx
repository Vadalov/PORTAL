'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (
    error: Error,
    errorInfo: ErrorInfo,
    boundaryName?: string,
    retryCount?: number
  ) => void;
  name?: string;
  maxRetries?: number;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  private static errors: Error[] = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `[ErrorBoundary:${this.props.name || 'unnamed'}] caught error`,
        error,
        errorInfo
      );
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo, this.props.name, this.state.retryCount);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Track error
    ErrorBoundary.errors.push(error);

    // Send error to Sentry if available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: { react: errorInfo },
        tags: { boundaryName: this.props.name || 'unnamed' },
        extra: { retryCount: this.state.retryCount },
      });
    }
  }

  static getErrors() {
    return [...ErrorBoundary.errors];
  }

  static clearErrors() {
    ErrorBoundary.errors = [];
  }

  static simulateError(error: Error) {
    throw error;
  }

  handleReset = () => {
    const newRetryCount = this.state.retryCount + 1;
    const maxRetries = this.props.maxRetries ?? 3;

    if (newRetryCount > maxRetries) {
      // Max retries reached, don't reset
      return;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: newRetryCount,
    });
  };

  handleGoHome = () => {
    window.location.href = '/genel';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const maxRetries = this.props.maxRetries ?? 3;
      const canRetry = this.state.retryCount < maxRetries;

      // Default error UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg">
            <div className="flex items-center justify-center">
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold text-gray-900">Bir Hata Oluştu</h1>
              <p className="text-gray-600">
                Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya ana sayfaya
                dönün.
              </p>
              {this.state.retryCount > 0 && (
                <p className="text-sm text-gray-500">
                  Yeniden deneme sayısı: {this.state.retryCount}
                </p>
              )}
              {!canRetry && (
                <p className="text-sm text-red-600">Maksimum yeniden deneme sayısına ulaşıldı.</p>
              )}
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 rounded-md bg-gray-100 p-4 text-sm">
                <summary className="cursor-pointer font-semibold text-gray-700">
                  Hata Detayları (Sadece Development)
                </summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <strong>Error:</strong>
                    <pre className="mt-1 overflow-auto text-xs text-red-600">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 overflow-auto text-xs text-gray-600">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-col gap-3">
              {canRetry && (
                <Button onClick={this.handleReset} className="w-full" variant="default">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tekrar Dene ({this.state.retryCount + 1}/{maxRetries})
                </Button>
              )}
              <Button onClick={this.handleReload} className="w-full" variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Sayfayı Yenile
              </Button>
              <Button onClick={this.handleGoHome} className="w-full" variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Ana Sayfaya Dön
              </Button>
            </div>

            <p className="text-center text-xs text-gray-500">
              Sorun devam ederse lütfen sistem yöneticisi ile iletişime geçin.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Expose to window in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__ERROR_BOUNDARIES__ = ErrorBoundary;
}

/**
 * Hook for throwing errors to nearest error boundary
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  if (error) {
    throw error;
  }

  return setError;
}
