import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';

interface HolidayType {
  id: number;
  name: string;
  description?: string | null;
  color?: string;
}

interface HolidayTypeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => Promise<void>;
  isSubmitting: boolean;
  holidayType: HolidayType | null;
}

const HolidayTypeForm: React.FC<HolidayTypeFormProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  isSubmitting,
  holidayType
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6'); // Default color - blue

  useEffect(() => {
    if (holidayType) {
      setName(holidayType.name);
      if (holidayType.color) {
        setColor(holidayType.color);
      }
    } else {
      setName('');
      setColor('#3B82F6');
    }
  }, [holidayType, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(name, color);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{holidayType ? 'Edit Holiday Type' : 'Add Holiday Type'}</h2>
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
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="typeName">
                Type Name <span className="text-red-500">*</span>
              </label>
              <input 
                id="typeName"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter holiday type name"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="typeColor">
                Color <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <input 
                  id="typeColor"
                  type="color"
                  className="h-10 w-10 border-0 cursor-pointer mr-2"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
                <input 
                  type="text"
                  className="shadow appearance-none border rounded flex-1 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  pattern="#[0-9A-Fa-f]{6}"
                  placeholder="#RRGGBB"
                  required
                />
              </div>
              <div 
                className="mt-2 w-full h-8 rounded" 
                style={{ backgroundColor: color }}
              ></div>
            </div>
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
            onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            disabled={isSubmitting || !name}    
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (holidayType ? 'Update' : 'Create')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HolidayTypeForm; 