/**
 * Helper functions for mock API to reduce code duplication
 */

import type { ApiResponse } from './route-helpers';

// Standard delay for all mock operations (moved from mock-api.ts)
export const delay = (ms: number = 300): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Generate unique IDs (moved from mock-api.ts)
export const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).substr(2);

// Type for entity with standard audit fields
export interface AuditableEntity {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Type for mock store operations
export interface MockStore<T> {
  data: T[];
  findIndex: (predicate: (item: T) => boolean) => number;
  push: (item: T) => number;
  filter: (predicate: (item: T) => boolean) => T[];
}

// Standard delay for all mock operations (wrapped with delay helper)
export async function withDelay<T>(operation: () => T, delayMs: number = 500): Promise<T> {
  await delay(delayMs);
  return operation();
}

// Generic create operation helper
export async function createEntity<T extends AuditableEntity>(
  entityData: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>,
  store: MockStore<T>,
  options: {
    successMessage: string;
    errorMessage: string;
  }
): Promise<ApiResponse<T>> {
  try {
    const now = new Date().toISOString();
    const currentUser = 'current-user';

    const newEntity: T = {
      ...entityData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      createdBy: currentUser,
      updatedBy: currentUser,
    } as T;

    store.data.push(newEntity);

    return {
      success: true,
      data: newEntity,
      message: options.successMessage,
    };
  } catch (error) {
    return {
      success: false,
      error: options.errorMessage,
    };
  }
}

// Generic update operation helper
export async function updateEntity<T>(
  id: string,
  updateData: Partial<T>,
  store: MockStore<T>,
  options: {
    notFoundMessage: string;
    successMessage: string;
    errorMessage: string;
  }
): Promise<ApiResponse<T>> {
  try {
    const index = store.data.findIndex((item) => (item as any).id === id);

    if (index === -1) {
      return {
        success: false,
        error: options.notFoundMessage,
      };
    }

    const updated = {
      ...store.data[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user',
    };

    store.data[index] = updated;

    return {
      success: true,
      data: updated,
      message: options.successMessage,
    };
  } catch (error) {
    return {
      success: false,
      error: options.errorMessage,
    };
  }
}

// Generic get by ID operation helper
export async function getEntityById<T>(
  id: string,
  store: MockStore<T>,
  notFoundMessage: string
): Promise<ApiResponse<T>> {
  try {
    const entity = store.data.find((item) => (item as any).id === id);

    if (!entity) {
      return {
        success: false,
        error: notFoundMessage,
      };
    }

    return {
      success: true,
      data: entity,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error retrieving entity',
    };
  }
}

// Generic delete operation helper
export async function deleteEntity(
  id: string,
  store: MockStore<any>,
  notFoundMessage: string,
  successMessage: string
): Promise<ApiResponse<void>> {
  try {
    const index = store.data.findIndex((item) => item.id === id);

    if (index === -1) {
      return {
        success: false,
        error: notFoundMessage,
      };
    }

    store.data.splice(index, 1);

    return {
      success: true,
      message: successMessage,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error deleting entity',
    };
  }
}

// Helper for paginated search
export interface SearchParams {
  search?: string;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export function applySearchAndPagination<T>(
  data: T[],
  searchParams: SearchParams,
  searchFields: (keyof T)[]
): { data: T[]; total: number; page: number; limit: number } {
  const search = searchParams.search?.toLowerCase() || '';
  const page = searchParams.page || 1;
  const limit = searchParams.limit || 20;

  // Apply search filter
  let filtered = data;
  if (search) {
    filtered = data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(search);
        }
        return false;
      })
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = filtered.slice(start, end);

  return {
    data: paginatedData,
    total,
    page,
    limit,
  };
}
