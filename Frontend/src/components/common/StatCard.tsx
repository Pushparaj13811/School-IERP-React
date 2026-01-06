import React from 'react';

/**
 * Gradient color configurations for stat cards
 */
export type StatCardColor = 'blue' | 'emerald' | 'amber' | 'purple' | 'red' | 'indigo' | 'teal' | 'orange' | 'pink';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: StatCardColor;
  onClick?: () => void;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Color configuration for gradients and shadows
 */
const colorConfig: Record<StatCardColor, {
  gradient: string;
  shadow: string;
  hoverBorder: string;
  lightBg: string;
  text: string;
}> = {
  blue: {
    gradient: 'from-blue-500 to-indigo-600',
    shadow: 'shadow-blue-200',
    hoverBorder: 'hover:border-blue-200',
    lightBg: 'bg-blue-100',
    text: 'text-blue-600'
  },
  emerald: {
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-200',
    hoverBorder: 'hover:border-emerald-200',
    lightBg: 'bg-emerald-100',
    text: 'text-emerald-600'
  },
  amber: {
    gradient: 'from-amber-500 to-orange-600',
    shadow: 'shadow-amber-200',
    hoverBorder: 'hover:border-amber-200',
    lightBg: 'bg-amber-100',
    text: 'text-amber-600'
  },
  purple: {
    gradient: 'from-purple-500 to-pink-600',
    shadow: 'shadow-purple-200',
    hoverBorder: 'hover:border-purple-200',
    lightBg: 'bg-purple-100',
    text: 'text-purple-600'
  },
  red: {
    gradient: 'from-red-500 to-rose-600',
    shadow: 'shadow-red-200',
    hoverBorder: 'hover:border-red-200',
    lightBg: 'bg-red-100',
    text: 'text-red-600'
  },
  indigo: {
    gradient: 'from-indigo-500 to-violet-600',
    shadow: 'shadow-indigo-200',
    hoverBorder: 'hover:border-indigo-200',
    lightBg: 'bg-indigo-100',
    text: 'text-indigo-600'
  },
  teal: {
    gradient: 'from-teal-500 to-cyan-600',
    shadow: 'shadow-teal-200',
    hoverBorder: 'hover:border-teal-200',
    lightBg: 'bg-teal-100',
    text: 'text-teal-600'
  },
  orange: {
    gradient: 'from-orange-500 to-red-600',
    shadow: 'shadow-orange-200',
    hoverBorder: 'hover:border-orange-200',
    lightBg: 'bg-orange-100',
    text: 'text-orange-600'
  },
  pink: {
    gradient: 'from-pink-500 to-rose-600',
    shadow: 'shadow-pink-200',
    hoverBorder: 'hover:border-pink-200',
    lightBg: 'bg-pink-100',
    text: 'text-pink-600'
  }
};

/**
 * StatCard - Unified statistics card component
 * Replaces duplicate StatCard implementations in student/Dashboard and teacher/Dashboard
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'blue',
  onClick,
  subtitle,
  trend,
  footer,
  className = ''
}) => {
  const config = colorConfig[color];
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={`
        group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm
        transition-all duration-300
        ${isClickable ? `cursor-pointer hover:shadow-xl ${config.hoverBorder}` : ''}
        ${className}
      `}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`
          w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient}
          flex items-center justify-center shadow-lg ${config.shadow}
          ${isClickable ? 'group-hover:scale-110 transition-transform duration-300' : ''}
        `}>
          {icon || (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )}
        </div>
        {isClickable && (
          <svg
            className={`w-5 h-5 text-gray-400 group-hover:${config.text} group-hover:translate-x-1 transition-all`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>

      <div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-gray-500 mt-1">{title}</p>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <svg
            className={`w-4 h-4 ${trend.isPositive ? 'text-emerald-600' : 'text-red-600 rotate-180'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          <span className="text-sm text-gray-400">vs last month</span>
        </div>
      )}

      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
};

/**
 * StatCardBadge - Small badge to show in footer of StatCard
 */
export const StatCardBadge: React.FC<{
  children: React.ReactNode;
  color?: StatCardColor;
}> = ({ children, color = 'blue' }) => {
  const config = colorConfig[color];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.lightBg} ${config.text}`}>
      {children}
    </span>
  );
};

export default StatCard;
