'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export default function TestAppwritePage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAppwriteConnection = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('Testing Appwrite connection...');
      
      // Test 1: Check if user is authenticated
      if (isAuthenticated && user) {
        addResult(`✅ User authenticated: ${user.name} (${user.role})`);
      } else {
        addResult('❌ User not authenticated');
      }

      // Test 2: Test beneficiaries API
      try {
        const beneficiaries = await api.beneficiaries.getBeneficiaries({ page: 1, limit: 5 });
        const data = (beneficiaries as any).data;
        const total = Array.isArray(data) ? data.length : data?.total || 0;
        addResult(`✅ Beneficiaries API working: ${total} total records`);
      } catch (error: any) {
        addResult(`❌ Beneficiaries API error: ${error.message}`);
      }

      // Test 3: Test donations API
      try {
        const donations = await api.donations.getDonations({ page: 1, limit: 5 });
        addResult(`✅ Donations API working: ${(donations as any).total} total records`);
      } catch (error: any) {
        addResult(`❌ Donations API error: ${error.message}`);
      }

      // Test 4: Test tasks API
      try {
        const tasks = await api.tasks.getTasks({ page: 1, limit: 5 });
        addResult(`✅ Tasks API working: ${(tasks as any).total} total records`);
      } catch (error: any) {
        addResult(`❌ Tasks API error: ${error.message}`);
      }

      addResult('🎉 Appwrite integration test completed!');
      
    } catch (error: any) {
      addResult(`❌ Test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Appwrite Integration Test</h1>
      
      <div className="mb-6">
        <button
          onClick={testAppwriteConnection}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Appwrite Connection'}
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
        <div className="space-y-2">
          {testResults.length === 0 ? (
            <p className="text-gray-500">Click the button above to test Appwrite integration</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="font-mono text-sm">
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Current Status:</h3>
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        {user && (
          <>
            <p><strong>User:</strong> {user.name}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </>
        )}
      </div>
    </div>
  );
}
