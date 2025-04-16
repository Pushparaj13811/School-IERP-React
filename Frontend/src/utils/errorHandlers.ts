import axios, { AxiosError } from 'axios';

/**
 * Type guard function to check if an error is an Axios error
 */
export const isAxiosError = (error: unknown): error is AxiosError => {
  // Use the try-catch approach since AxiosError is a class
  return error instanceof Error && 'isAxiosError' in error;
};

/**
 * Safely extracts error message from an Axios error response
 */
export const getErrorMessage = (error: unknown, defaultMessage = 'An error occurred'): string => {
  if (isAxiosError(error)) {
    // Extract error message from Axios error response
    return error.response?.data?.message || defaultMessage;
  }
  
  // For other types of errors, try to get a message if possible
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }
  
  return defaultMessage;
}; 