import React from 'react';

/**
 * Status types used across the application
 */
export type StatusType =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'REMAINING';

export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeVariant = 'default' | 'dot' | 'outline';

interface StatusBadgeProps {
  status: StatusType | string;
  size?: BadgeSize;
  variant?: BadgeVariant;
  className?: string;
}

/**
 * Status color configuration - Single Source of Truth for status colors
 */
const statusConfig: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  ACTIVE: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
    dot: 'bg-emerald-500'
  },
  INACTIVE: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
    dot: 'bg-gray-500'
  },
  PENDING: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-300',
    dot: 'bg-amber-500'
  },
  APPROVED: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
    dot: 'bg-emerald-500'
  },
  REJECTED: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-300',
    dot: 'bg-red-500'
  },
  CANCELLED: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
    dot: 'bg-gray-500'
  },
  PRESENT: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
    dot: 'bg-emerald-500'
  },
  ABSENT: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-300',
    dot: 'bg-red-500'
  },
  LATE: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-300',
    dot: 'bg-amber-500'
  },
  REMAINING: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
    dot: 'bg-blue-500'
  }
};

const defaultConfig = {
  bg: 'bg-gray-100',
  text: 'text-gray-700',
  border: 'border-gray-300',
  dot: 'bg-gray-500'
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm'
};

const dotSizes: Record<BadgeSize, string> = {
  sm: 'w-1 h-1',
  md: 'w-1.5 h-1.5',
  lg: 'w-2 h-2'
};

/**
 * StatusBadge - Unified status badge component
 * Replaces duplicate status badge implementations across Leave, Profile, and Dashboard pages
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  variant = 'default',
  className = ''
}) => {
  const config = statusConfig[status.toUpperCase()] || defaultConfig;

  const baseClasses = 'inline-flex items-center rounded-full font-medium';

  const variantClasses = {
    default: `${config.bg} ${config.text}`,
    dot: `${config.bg} ${config.text}`,
    outline: `bg-transparent border ${config.border} ${config.text}`
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {variant === 'dot' && (
        <span className={`${dotSizes[size]} rounded-full mr-1.5 ${config.dot}`}></span>
      )}
      {status}
    </span>
  );
};

/**
 * Helper function to get status color for use in other components
 */
export const getStatusColor = (status: string): { bg: string; text: string } => {
  const config = statusConfig[status.toUpperCase()] || defaultConfig;
  return { bg: config.bg, text: config.text };
};

/**
 * Helper function to get status dot color
 */
export const getStatusDotColor = (status: string): string => {
  const config = statusConfig[status.toUpperCase()] || defaultConfig;
  return config.dot;
};

export default StatusBadge;
