'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/stores/authStore';

export default function TestErrorBoundaryPage() {
  if (process.env.NODE_ENV !== 'development') {
    return <div>Not available in production</div>;
  }

  const [errorType, setErrorType] = useState('render');
  const [customMessage, setCustomMessage] = useState('');
  const [includeStack, setIncludeStack] = useState(false);
  const [simulateHydration, setSimulateHydration] = useState(false);
  const [triggerRenderError, setTriggerRenderError] = useState(false);
  const [triggerAsyncError, setTriggerAsyncError] = useState(false);
  const [lastError, setLastError] = useState<any>(null);

  useEffect(() => {
    const checkLastError = () => {
      setLastError((window as any).__LAST_ERROR__ || (window as any).__GLOBAL_ERROR__);
    };
    checkLastError();
    const interval = setInterval(checkLastError, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (triggerAsyncError) {
      throw new Error(customMessage || 'Async error');
    }
  }, [triggerAsyncError, customMessage]);

  const throwRenderError = () => {
    setTriggerRenderError(true);
  };

  const throwAsyncError = () => {
    setTriggerAsyncError(true);
  };

  const throwEventHandlerError = () => {
    throw new Error(customMessage || 'Event handler error');
  };

  const simulateHydrationError = () => {
    localStorage.setItem('hydration-test', Date.now().toString());
    window.location.reload();
  };

  const throwNetworkError = async () => {
    try {
      await fetch('/api/nonexistent');
    } catch (e) {
      throw new Error(customMessage || 'Network error');
    }
  };

  const throwZustandError = async () => {
    try {
      await useAuthStore.getState().login('invalid@email.com', 'wrongpass');
    } catch (e) {
      throw e;
    }
  };

  const throwErrorWithDigest = () => {
    const error = new Error(customMessage || 'Error with digest');
    (error as any).digest = 'test-digest-123';
    throw error;
  };

  const RenderErrorComponent = () => {
    if (triggerRenderError) {
      throw new Error(customMessage || 'Render error');
    }
    return null;
  };

  return (
    <div className="container mx-auto p-8">
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm">
              <strong>Warning:</strong> This page intentionally triggers errors for testing error boundaries. Use with caution.
            </p>
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-8">Error Boundary Test Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Error Type Selector</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Error Type</label>
              <select
                value={errorType}
                onChange={(e) => setErrorType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="render">Render Error</option>
                <option value="async">Async Error</option>
                <option value="event">Event Handler Error</option>
                <option value="hydration">Hydration Error</option>
                <option value="network">Network Error</option>
                <option value="zustand">Zustand Error</option>
                <option value="digest">Error with Digest</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Custom Error Message</label>
              <Input
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter custom error message"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeStack"
                checked={includeStack}
                onCheckedChange={(checked) => setIncludeStack(checked === true)}
              />
              <label htmlFor="includeStack" className="text-sm">Include stack trace</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="simulateHydration"
                checked={simulateHydration}
                onCheckedChange={(checked) => setSimulateHydration(checked === true)}
              />
              <label htmlFor="simulateHydration" className="text-sm">Simulate hydration error</label>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Trigger Errors</h2>
          <div className="space-y-4">
            <Button onClick={throwRenderError} variant="destructive">
              Throw Render Error
            </Button>
            <Button onClick={throwAsyncError} variant="destructive">
              Throw Async Error
            </Button>
            <Button onClick={throwEventHandlerError} variant="destructive">
              Throw Event Handler Error
            </Button>
            <Button onClick={simulateHydrationError} variant="destructive">
              Simulate Hydration Error
            </Button>
            <Button onClick={throwNetworkError} variant="destructive">
              Throw Network Error
            </Button>
            <Button onClick={throwZustandError} variant="destructive">
              Throw Zustand Error
            </Button>
            <Button onClick={throwErrorWithDigest} variant="destructive">
              Throw Error with Digest
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Visual Indicators</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          <p><strong>Current Error Boundary Level:</strong> Route (error.tsx)</p>
          <p><strong>Error Caught Status:</strong> {lastError ? 'Yes' : 'No'}</p>
          {lastError && (
            <div className="mt-2">
              <p><strong>Last Error:</strong> {lastError.error?.message}</p>
              <p><strong>Digest:</strong> {lastError.digest}</p>
              <p><strong>Timestamp:</strong> {lastError.timestamp?.toLocaleString()}</p>
            </div>
          )}
          <p><strong>Sentry Capture Confirmation:</strong> {(window as any).Sentry ? 'Sentry available' : 'Sentry not available'}</p>
        </div>
      </div>

      <RenderErrorComponent />
    </div>
  );
}