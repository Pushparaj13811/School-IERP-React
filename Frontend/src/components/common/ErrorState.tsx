import React from 'react';

export type ErrorVariant = 'error' | 'warning' | 'info' | 'empty';

interface ErrorStateProps {
  title?: string;
  message: string;
  variant?: ErrorVariant;
  onRetry?: () => void;
  retryLabel?: string;
  fullScreen?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const variantConfig: Record<ErrorVariant, {
  bgColor: string;
  iconBg: string;
  iconColor: string;
  defaultIcon: React.ReactNode;
  defaultTitle: string;
}> = {
  error: {
    bgColor: 'bg-red-100',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    defaultTitle: 'Error',
    defaultIcon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  },
  warning: {
    bgColor: 'bg-amber-100',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    defaultTitle: 'Warning',
    defaultIcon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  },
  info: {
    bgColor: 'bg-blue-100',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    defaultTitle: 'Information',
    defaultIcon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  empty: {
    bgColor: 'bg-gray-100',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-400',
    defaultTitle: 'No Data',
    defaultIcon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    )
  }
};

/**
 * ErrorState - Unified error/empty state component
 * Replaces duplicate error handling UI across all pages
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  variant = 'error',
  onRetry,
  retryLabel = 'Try Again',
  fullScreen = false,
  className = '',
  icon
}) => {
  const config = variantConfig[variant];

  const content = (
    <div className={`bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center ${className}`}>
      <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${config.iconBg} flex items-center justify-center ${config.iconColor}`}>
        {icon || config.defaultIcon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {title || config.defaultTitle}
      </h3>
      <p className="text-gray-600 mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        {content}
      </div>
    );
  }

  return content;
};

/**
 * PageErrorState - Full page error state
 */
export const PageErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'Error Loading Page', message, onRetry }) => (
  <ErrorState
    title={title}
    message={message}
    variant="error"
    onRetry={onRetry}
    fullScreen
  />
);

/**
 * EmptyState - Empty data state
 */
export const EmptyState: React.FC<{
  title?: string;
  message: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}> = ({ title = 'No Data', message, icon, action }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
      {icon || (
        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      )}
    </div>
    <p className="text-gray-500 font-medium">{title}</p>
    <p className="text-sm text-gray-400 mt-1">{message}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
      >
        {action.label}
      </button>
    )}
  </div>
);

export default ErrorState;
