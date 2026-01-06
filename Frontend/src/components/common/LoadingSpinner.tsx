import React from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'secondary' | 'white';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, { spinner: string; text: string }> = {
  sm: { spinner: 'w-6 h-6 border-2', text: 'text-sm' },
  md: { spinner: 'w-10 h-10 border-3', text: 'text-base' },
  lg: { spinner: 'w-16 h-16 border-4', text: 'text-lg' },
  xl: { spinner: 'w-20 h-20 border-4', text: 'text-xl' }
};

const variantClasses: Record<SpinnerVariant, string> = {
  primary: 'border-indigo-200 border-t-indigo-600',
  secondary: 'border-gray-200 border-t-gray-600',
  white: 'border-white/30 border-t-white'
};

/**
 * LoadingSpinner - Unified loading spinner component
 * Replaces duplicate Spinner definitions across Profile pages
 * Located at: student/Profile.tsx:15-19, teacher/Profile.tsx:26-30, parent/Profile.tsx:10-14
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'lg',
  variant = 'primary',
  message,
  fullScreen = false,
  className = ''
}) => {
  const sizeConfig = sizeClasses[size];
  const variantConfig = variantClasses[variant];

  const spinnerContent = (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div
        className={`${sizeConfig.spinner} ${variantConfig} rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className={`${sizeConfig.text} text-gray-500 font-medium`}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

/**
 * PageLoadingState - Full page loading state with consistent styling
 */
export const PageLoadingState: React.FC<{
  message?: string;
}> = ({ message = 'Loading...' }) => (
  <LoadingSpinner
    size="lg"
    variant="primary"
    message={message}
    fullScreen
  />
);

/**
 * InlineLoadingState - Inline loading state for sections
 */
export const InlineLoadingState: React.FC<{
  message?: string;
  height?: string;
}> = ({ message, height = 'h-64' }) => (
  <div className={`${height} flex items-center justify-center`}>
    <LoadingSpinner size="md" variant="primary" message={message} />
  </div>
);

/**
 * ButtonLoadingSpinner - Small spinner for buttons
 */
export const ButtonLoadingSpinner: React.FC<{
  className?: string;
}> = ({ className = '' }) => (
  <div
    className={`w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin ${className}`}
    role="status"
    aria-label="Loading"
  />
);

export default LoadingSpinner;
