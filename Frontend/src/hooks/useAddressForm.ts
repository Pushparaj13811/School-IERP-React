import { useState, useCallback } from 'react';

/**
 * Address data structure used across all Add User forms
 * Single source of truth for address fields
 */
export interface AddressData {
  addressLine1: string;
  addressLine2: string;
  street: string;
  city: string;
  ward: string;
  municipality: string;
  district: string;
  province: string;
  country: string;
  postalCode: string;
}

const initialAddressState: AddressData = {
  addressLine1: '',
  addressLine2: '',
  street: '',
  city: '',
  ward: '',
  municipality: '',
  district: '',
  province: '',
  country: 'Nepal',
  postalCode: ''
};

export interface UseAddressFormReturn {
  address: AddressData;
  updateField: (field: keyof AddressData, value: string) => void;
  resetAddress: () => void;
  setFullAddress: (data: Partial<AddressData>) => void;
  getAddressForSubmit: () => AddressData;
  isAddressValid: () => boolean;
}

/**
 * Hook for managing address form state
 * Replaces 10 individual useState calls in AddStudents, AddTeacher, AddParents
 */
export function useAddressForm(initialData?: Partial<AddressData>): UseAddressFormReturn {
  const [address, setAddress] = useState<AddressData>({
    ...initialAddressState,
    ...initialData
  });

  const updateField = useCallback((field: keyof AddressData, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetAddress = useCallback(() => {
    setAddress(initialAddressState);
  }, []);

  const setFullAddress = useCallback((data: Partial<AddressData>) => {
    setAddress(prev => ({ ...prev, ...data }));
  }, []);

  const getAddressForSubmit = useCallback((): AddressData => {
    return { ...address };
  }, [address]);

  const isAddressValid = useCallback((): boolean => {
    // Basic validation - at least city and country should be filled
    return address.city.trim() !== '' && address.country.trim() !== '';
  }, [address]);

  return {
    address,
    updateField,
    resetAddress,
    setFullAddress,
    getAddressForSubmit,
    isAddressValid
  };
}

export default useAddressForm;
