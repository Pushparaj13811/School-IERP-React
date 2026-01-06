// Common Components - Single Source of Truth for reusable UI components

export { StatusBadge, getStatusColor, getStatusDotColor } from './StatusBadge';
export type { StatusType, BadgeSize, BadgeVariant } from './StatusBadge';

export { StatCard, StatCardBadge } from './StatCard';
export type { StatCardColor } from './StatCard';

export { ProfileCard, ProfileDetailItem, ProfileDetailsGrid } from './ProfileCard';
export type { ProfileCardProps } from './ProfileCard';

export { AddressForm, AddressDisplay } from './AddressForm';

export { LoadingSpinner, PageLoadingState, InlineLoadingState, ButtonLoadingSpinner } from './LoadingSpinner';
export type { SpinnerSize, SpinnerVariant } from './LoadingSpinner';

export { ErrorState, PageErrorState, EmptyState } from './ErrorState';
export type { ErrorVariant } from './ErrorState';
