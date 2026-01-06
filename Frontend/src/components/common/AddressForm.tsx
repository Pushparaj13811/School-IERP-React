import React from 'react';
import { AddressData } from '../../hooks/useAddressForm';

interface AddressFormProps {
  address: AddressData;
  onFieldChange: (field: keyof AddressData, value: string) => void;
  disabled?: boolean;
  showAllFields?: boolean;
  columns?: 1 | 2 | 3;
  className?: string;
}

interface FormFieldProps {
  label: string;
  name: keyof AddressData;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type="text"
      id={name}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      disabled={disabled}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
    />
  </div>
);

/**
 * AddressForm - Unified address form component
 * Replaces duplicate address form fields in AddStudents, AddTeacher, AddParents
 * Reduces ~10 useState calls per form to a single useAddressForm hook
 */
export const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onFieldChange,
  disabled = false,
  showAllFields = true,
  columns = 2,
  className = ''
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  };

  const basicFields: Array<{ name: keyof AddressData; label: string; required?: boolean }> = [
    { name: 'addressLine1', label: 'Address Line 1', required: true },
    { name: 'addressLine2', label: 'Address Line 2' },
    { name: 'city', label: 'City', required: true },
    { name: 'district', label: 'District', required: true },
    { name: 'province', label: 'Province/State', required: true },
    { name: 'country', label: 'Country', required: true }
  ];

  const additionalFields: Array<{ name: keyof AddressData; label: string }> = [
    { name: 'street', label: 'Street' },
    { name: 'ward', label: 'Ward No.' },
    { name: 'municipality', label: 'Municipality/VDC' },
    { name: 'postalCode', label: 'Postal Code' }
  ];

  const fieldsToRender = showAllFields ? [...basicFields, ...additionalFields] : basicFields;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
      </div>

      <div className={`grid ${gridCols[columns]} gap-4`}>
        {fieldsToRender.map((field) => (
          <FormField
            key={field.name}
            label={field.label}
            name={field.name}
            value={address[field.name]}
            onChange={(value) => onFieldChange(field.name, value)}
            required={'required' in field ? field.required : false}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * AddressDisplay - Read-only display of address
 */
export const AddressDisplay: React.FC<{
  address: Partial<AddressData>;
  className?: string;
}> = ({ address, className = '' }) => {
  const formatAddress = (): string => {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.street,
      address.ward ? `Ward ${address.ward}` : null,
      address.municipality,
      address.city,
      address.district,
      address.province,
      address.country,
      address.postalCode
    ].filter(Boolean);

    return parts.join(', ');
  };

  const formattedAddress = formatAddress();

  if (!formattedAddress) {
    return (
      <p className={`text-gray-400 italic ${className}`}>No address provided</p>
    );
  }

  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <p className="text-gray-700">{formattedAddress}</p>
    </div>
  );
};

export default AddressForm;
