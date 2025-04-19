import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';

interface HolidayType {
  id: number;
  name: string;
  description: string | null;
}

interface Holiday {
  id: number;
  name: string;
  description: string | null;
  fromDate: string;
  toDate: string;
  holidayTypeId: number;
  isRecurring: boolean;
  recurrencePattern: string | null;
  holidayType?: {
    id: number;
    name: string;
  };
}

interface HolidayFormProps {
  isOpen: boolean;
  onClose: () => void;
  holiday: Holiday | null;
  holidayTypes: HolidayType[];
  onSave: (holiday: Omit<Holiday, 'id' | 'holidayType'>) => Promise<void>;
  isSubmitting: boolean;
}

const HolidayForm: React.FC<HolidayFormProps> = ({
  isOpen, 
  onClose, 
  holiday, 
  holidayTypes, 
  onSave, 
  isSubmitting
}) => {
  const [formData, setFormData] = useState<Omit<Holiday, 'id' | 'holidayType'>>({
    name: '',
    description: '',
    fromDate: '',
    toDate: '',
    holidayTypeId: 0,
    isRecurring: false,
    recurrencePattern: ''
  });
  
  const [errors, setErrors] = useState({
    name: '',
    fromDate: '',
    toDate: '',
    holidayTypeId: ''
  });

  useEffect(() => {
    if (holiday) {
      setFormData({
        name: holiday.name,
        description: holiday.description || '',
        fromDate: holiday.fromDate.split('T')[0], // Format date for input
        toDate: holiday.toDate.split('T')[0], // Format date for input
        holidayTypeId: holiday.holidayTypeId,
        isRecurring: holiday.isRecurring,
        recurrencePattern: holiday.recurrencePattern || ''
      });
      // Clear any previous errors
      setErrors({
        name: '',
        fromDate: '',
        toDate: '',
        holidayTypeId: ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        fromDate: '',
        toDate: '',
        holidayTypeId: 0,
        isRecurring: false,
        recurrencePattern: ''
      });
    }
  }, [holiday]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user makes a change
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const validateForm = (): boolean => {
    const newErrors = {
      name: '',
      fromDate: '',
      toDate: '',
      holidayTypeId: ''
    };
    
    let isValid = true;
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Holiday name is required';
      isValid = false;
    }
    
    // Validate from date
    if (!formData.fromDate) {
      newErrors.fromDate = 'From date is required';
      isValid = false;
    }
    
    // Validate to date
    if (!formData.toDate) {
      newErrors.toDate = 'To date is required';
      isValid = false;
    }
    
    // Validate to date is after from date
    if (formData.fromDate && formData.toDate && new Date(formData.fromDate) > new Date(formData.toDate)) {
      newErrors.toDate = 'To date must be after from date';
      isValid = false;
    }
    
    // Validate holiday type
    if (!formData.holidayTypeId) {
      newErrors.holidayTypeId = 'Holiday type is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSaveHoliday = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving holiday:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{holiday ? 'Edit Holiday' : 'Add New Holiday'}</h2>
          <Button
            onClick={onClose}
            variant="danger"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        
        <div className="p-4">
          <form onSubmit={handleSaveHoliday}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Holiday Name <span className="text-red-500">*</span>
              </label>
              <input 
                id="name"
                name="name"
                type="text"
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.name ? 'border-red-500' : ''
                }`}
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter holiday name"
                required
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description
              </label>
              <textarea 
                id="description"
                name="description"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.description || ''}
                onChange={handleChange}
                placeholder="Enter description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fromDate">
                  From Date <span className="text-red-500">*</span>
                </label>
                <input 
                  id="fromDate"
                  name="fromDate"
                  type="date"
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    errors.fromDate ? 'border-red-500' : ''
                  }`}
                  value={formData.fromDate}
                  onChange={handleChange}
                  required
                />
                {errors.fromDate && <p className="text-red-500 text-xs mt-1">{errors.fromDate}</p>}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="toDate">
                  To Date <span className="text-red-500">*</span>
                </label>
                <input 
                  id="toDate"
                  name="toDate"
                  type="date"
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    errors.toDate ? 'border-red-500' : ''
                  }`}
                  value={formData.toDate}
                  onChange={handleChange}
                  required
                />
                {errors.toDate && <p className="text-red-500 text-xs mt-1">{errors.toDate}</p>}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="holidayTypeId">
                Holiday Type <span className="text-red-500">*</span>
              </label>
              <select 
                id="holidayTypeId"
                name="holidayTypeId"
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.holidayTypeId ? 'border-red-500' : ''
                }`}
                value={formData.holidayTypeId}
                onChange={handleChange}
                required
              >
                <option value="">Select holiday type</option>
                {holidayTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.holidayTypeId && <p className="text-red-500 text-xs mt-1">{errors.holidayTypeId}</p>}
            </div>

            <div className="mb-4 flex items-center">
              <input 
                id="isRecurring"
                name="isRecurring"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={formData.isRecurring}
                onChange={handleCheckboxChange}
              />
              <label className="ml-2 block text-gray-700 text-sm font-bold" htmlFor="isRecurring">
                Is Recurring
              </label>
            </div>

            {formData.isRecurring && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="recurrencePattern">
                  Recurrence Pattern
                </label>
                <input 
                  id="recurrencePattern"
                  name="recurrencePattern"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={formData.recurrencePattern || ''}
                  onChange={handleChange}
                  placeholder="e.g., 3rd Saturday, Every Sunday"
                />
              </div>
            )}
          </form>
        </div>
        
        <div className="bg-gray-50 px-4 py-3 flex justify-end border-t gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSaveHoliday}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (holiday ? 'Update' : 'Create')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HolidayForm; 