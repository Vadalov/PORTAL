/**
 * API Client Index
 *
 * Re-exports the Convex API client for backward compatibility.
 * Components can import from '@/lib/api' instead of '@/lib/api/convex-api-client'
 */

import { convexApiClient } from './convex-api-client';

// Export as default for backward compatibility
const api = convexApiClient;

export default api;
export { convexApiClient as api };
export type { ConvexResponse, QueryParams, CreateDocumentData, UpdateDocumentData } from '@/types/database';

// Export empty objects for removed APIs to prevent import errors
// TODO: Implement these or remove usage from components
export const parametersApi = {
  getAllParameters: async (_params?: any) => ({ success: true, data: [], total: 0, error: null }),
  updateParameter: async (_id?: string, _data?: any) => ({ success: true, error: null }),
  deleteParameter: async (_id?: string) => ({ success: true, error: null }),
  createParameter: async (_data?: any) => ({ success: true, error: null }),
  getParametersByCategory: async (_category?: string) => ({ success: true, data: [], error: null }),
};

export const aidApplicationsApi = {
  getAidApplication: async (_id?: string) => ({ success: true, data: null, error: null }),
  updateStage: async (_id?: string, _stage?: string) => ({ success: true, data: null, error: null }),
  getAidApplications: async (_params?: any) => ({ success: true, data: [], total: 0, error: null }),
  createAidApplication: async (_data?: any) => ({ success: true, data: null, error: null }),
};
