import React from 'react';
import { StatusBadge } from './StatusBadge';

// Default avatar imports - these should be actual image imports in production
const DEFAULT_MALE_AVATAR = 'https://via.placeholder.com/150?text=User';
const DEFAULT_FEMALE_AVATAR = 'https://via.placeholder.com/150?text=User';

export interface ProfileCardProps {
  name: string;
  role?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
  gender?: 'MALE' | 'FEMALE';
  status?: 'ACTIVE' | 'INACTIVE';
  onEdit?: () => void;
  onViewFull?: () => void;
  children?: React.ReactNode;
  headerGradient?: string;
  compact?: boolean;
}

/**
 * ProfileCard - Unified profile card component
 * Replaces duplicate profile card implementations across admin, student, teacher, parent Profile pages
 */
export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  role,
  subtitle,
  email,
  phone,
  profilePicture,
  gender,
  status,
  onEdit,
  onViewFull,
  children,
  headerGradient = 'from-indigo-600 to-blue-600',
  compact = false
}) => {
  const getAvatarUrl = (): string => {
    if (profilePicture) {
      return profilePicture;
    }
    return gender === 'FEMALE' ? DEFAULT_FEMALE_AVATAR : DEFAULT_MALE_AVATAR;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = DEFAULT_MALE_AVATAR;
  };

  if (compact) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 flex-shrink-0">
              <img
                src={getAvatarUrl()}
                alt={`${name}'s profile`}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{name}</h3>
                {status && <StatusBadge status={status} size="sm" variant="dot" />}
              </div>
              {role && <p className="text-sm text-gray-500">{role}</p>}
              {subtitle && <p className="text-sm text-gray-400 truncate">{subtitle}</p>}
            </div>
            {(onEdit || onViewFull) && (
              <button
                onClick={onViewFull || onEdit}
                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                {onViewFull ? 'View' : 'Edit'}
              </button>
            )}
          </div>
          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header with gradient background */}
      <div className={`relative h-32 bg-gradient-to-r ${headerGradient}`}>
        <div className="absolute -bottom-12 left-6">
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
            <img
              src={getAvatarUrl()}
              alt={`${name}'s profile`}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </div>
        </div>
        {status && (
          <div className="absolute top-4 right-4">
            <StatusBadge status={status} variant="dot" />
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="pt-16 px-6 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{name}</h2>
            {role && <p className="text-gray-500">{role}</p>}
            {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Contact Info */}
        {(email || phone) && (
          <div className="mt-4 space-y-2">
            {email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="truncate">{email}</span>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{phone}</span>
              </div>
            )}
          </div>
        )}

        {/* Additional Content */}
        {children && <div className="mt-4">{children}</div>}

        {/* Action Buttons */}
        {(onEdit || onViewFull) && (
          <div className="mt-6 flex gap-3">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-blue-700 transition-all shadow-md shadow-indigo-200"
              >
                Edit Profile
              </button>
            )}
            {onViewFull && (
              <button
                onClick={onViewFull}
                className={`${onEdit ? 'flex-1' : 'w-full'} px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all`}
              >
                View Full Profile
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ProfileDetailItem - Display a single profile detail row
 */
export const ProfileDetailItem: React.FC<{
  label: string;
  value: string | React.ReactNode;
  icon?: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
    <div className="flex items-center gap-2">
      {icon && <span className="text-gray-400">{icon}</span>}
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
);

/**
 * ProfileDetailsGrid - Grid layout for profile details
 */
export const ProfileDetailsGrid: React.FC<{
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
}> = ({ children, columns = 2 }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-3`}>
      {children}
    </div>
  );
};

export default ProfileCard;
