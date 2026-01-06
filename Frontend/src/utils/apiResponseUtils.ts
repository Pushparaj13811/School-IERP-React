/**
 * API Response Utilities - Single Source of Truth for API response handling
 * Eliminates duplicate API response parsing logic across Leave, Profile, and Dashboard pages
 */

/**
 * Standard API response structure
 */
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

/**
 * Extract data from various API response formats
 * Handles inconsistent backend response structures
 */
export function extractData<T>(response: unknown): T | null {
  if (!response) return null;

  const res = response as Record<string, unknown>;

  // Direct data
  if (res.data !== undefined) {
    const data = res.data as Record<string, unknown>;

    // Nested data.data structure
    if (data.data !== undefined) {
      return data.data as T;
    }

    return data as unknown as T;
  }

  return res as unknown as T;
}

/**
 * Extract array data from API response
 * Handles multiple possible array locations in response
 *
 * Used in Leave pages to handle:
 * - response.data.data (array)
 * - response.data.data.leaveApplications (array)
 * - response.data.data (single object -> wrapped in array)
 */
export function extractArrayData<T>(response: unknown, arrayKey?: string): T[] {
  if (!response) return [];

  const res = response as Record<string, unknown>;

  // Check direct array
  if (Array.isArray(res)) {
    return res as T[];
  }

  // Check data property
  if (res.data !== undefined) {
    const data = res.data as Record<string, unknown>;

    // Direct array in data
    if (Array.isArray(data)) {
      return data as T[];
    }

    // Check data.data
    if (data.data !== undefined) {
      const nestedData = data.data as Record<string, unknown>;

      // Direct array in data.data
      if (Array.isArray(nestedData)) {
        return nestedData as T[];
      }

      // Check for specific array key (e.g., 'leaveApplications')
      if (arrayKey && Array.isArray(nestedData[arrayKey])) {
        return nestedData[arrayKey] as T[];
      }

      // Single object - wrap in array
      if (typeof nestedData === 'object' && nestedData !== null) {
        return [nestedData as unknown as T];
      }
    }

    // Check for specific array key at data level
    if (arrayKey && Array.isArray(data[arrayKey])) {
      return data[arrayKey] as T[];
    }
  }

  return [];
}

/**
 * Extract leave data specifically
 * Replaces duplicate logic in student/Leave, teacher/Leave, admin/Leave
 */
export function extractLeaveData<T>(response: unknown): T[] {
  return extractArrayData<T>(response, 'leaveApplications');
}

/**
 * Check if API response is successful
 */
export function isSuccessResponse(response: unknown): boolean {
  if (!response) return false;

  const res = response as Record<string, unknown>;

  // Check status field
  if (res.status === 'success') return true;

  // Check for data presence
  if (res.data !== undefined) {
    const data = res.data as Record<string, unknown>;
    if (data.status === 'success') return true;
    // Assume success if data exists without error
    return !data.error;
  }

  return false;
}

/**
 * Extract error message from API response
 */
export function extractErrorMessage(response: unknown, defaultMessage = 'An error occurred'): string {
  if (!response) return defaultMessage;

  const res = response as Record<string, unknown>;

  // Check common error message locations
  if (typeof res.message === 'string') return res.message;
  if (typeof res.error === 'string') return res.error;

  if (res.data !== undefined) {
    const data = res.data as Record<string, unknown>;
    if (typeof data.message === 'string') return data.message;
    if (typeof data.error === 'string') return data.error;
  }

  return defaultMessage;
}

/**
 * Standard API response handler
 * Returns typed data or null with error message
 */
export function handleApiResponse<T>(
  response: unknown
): { data: T | null; error: string | null } {
  if (isSuccessResponse(response)) {
    return {
      data: extractData<T>(response),
      error: null
    };
  }

  return {
    data: null,
    error: extractErrorMessage(response)
  };
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Extract paginated data from API response
 */
export function extractPaginatedData<T>(response: unknown): PaginatedResponse<T> {
  const defaultResponse: PaginatedResponse<T> = {
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0
  };

  if (!response) return defaultResponse;

  const data = extractData<Record<string, unknown>>(response);
  if (!data) return defaultResponse;

  return {
    items: Array.isArray(data.items) ? data.items as T[] :
           Array.isArray(data.data) ? data.data as T[] :
           Array.isArray(data) ? data as unknown as T[] : [],
    total: typeof data.total === 'number' ? data.total : 0,
    page: typeof data.page === 'number' ? data.page : 1,
    pageSize: typeof data.pageSize === 'number' ? data.pageSize :
              typeof data.limit === 'number' ? data.limit : 10,
    totalPages: typeof data.totalPages === 'number' ? data.totalPages : 0
  };
}

export default {
  extractData,
  extractArrayData,
  extractLeaveData,
  isSuccessResponse,
  extractErrorMessage,
  handleApiResponse,
  extractPaginatedData
};
