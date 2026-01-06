/**
 * Safely extracts error message from an Axios error response
 */
export const getErrorMessage = (error: unknown, defaultMessage = 'An error occurred'): string => {
  // Check if it's an Axios error by checking for response property
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    // Extract error message from Axios error response
    return axiosError.response?.data?.message || defaultMessage;
  }

  // For other types of errors, try to get a message if possible
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }

  return defaultMessage;
}; 