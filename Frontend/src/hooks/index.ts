// Shared hooks - Single Source of Truth for common state management patterns

export { useFetchState } from './useFetchState';
export type { FetchState, UseFetchStateReturn } from './useFetchState';

export { useAddressForm } from './useAddressForm';
export type { AddressData, UseAddressFormReturn } from './useAddressForm';

export { useProfileData } from './useProfileData';
export type { BaseProfile, UserRole, UseProfileDataOptions, UseProfileDataReturn } from './useProfileData';
