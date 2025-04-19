import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
interface TimeSlotDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (startTime: string, endTime: string, isBreak: boolean, breakType: string) => Promise<void>;
  loading: boolean;
}

const TimeSlotDialog: React.FC<TimeSlotDialogProps> = ({ open, onClose, onAdd, loading }) => {
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [breakType, setBreakType] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reset form when dialog opens or closes
  useEffect(() => {
    if (open) {
      setValidationError(null);
    } else {
      // Reset form on close
      setStartTime('');
      setEndTime('');
      setIsBreak(false);
      setBreakType('');
    }
  }, [open]);

  if (!open) return null;
  
  const validateForm = (): boolean => {
    // Check if start time and end time are provided
    if (!startTime) {
      setValidationError('Please select a start time');
      return false;
    }
    
    if (!endTime) {
      setValidationError('Please select an end time');
      return false;
    }
    
    // Compare the times to ensure end time is after start time
    if (startTime >= endTime) {
      setValidationError('End time must be after start time');
      return false;
    }
    
    // Ensure break type is selected if isBreak is true
    if (isBreak && !breakType) {
      setValidationError('Please select a break type');
      return false;
    }
    
    setValidationError(null);
    return true;
  };
  
  const handleSubmit = async () => {
    if (validateForm()) {
      await onAdd(startTime, endTime, isBreak, breakType);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Add Time Slot</h3>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="py-1 px-2 text-gray-400 hover:text-gray-600"
          >
            ×
          </Button>
        </div>
        
        {validationError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {validationError}
          </div>
        )}
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <select
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setValidationError(null);
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Start Time</option>
                {Array.from({ length: 24 }).map((_, hour) =>
                  ['00', '30'].map((minute) => {
                    const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                    return (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    );
                  })
                )}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <select
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setValidationError(null);
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select End Time</option>
                {Array.from({ length: 24 }).map((_, hour) =>
                  ['00', '30'].map((minute) => {
                    const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                    return (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    );
                  })
                )}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={isBreak ? 'break' : 'period'}
              onChange={(e) => {
                setIsBreak(e.target.value === 'break');
                setValidationError(null);
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="period">Period</option>
              <option value="break">Break</option>
            </select>
          </div>
          
          {isBreak && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Break Type</label>
              <select
                value={breakType}
                onChange={(e) => {
                  setBreakType(e.target.value);
                  setValidationError(null);
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Break Type</option>
                <option value="SHORT BREAK">SHORT BREAK</option>
                <option value="LUNCH BREAK">LUNCH BREAK</option>
                <option value="RECESS">RECESS</option>
              </select>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-6 space-x-2">
          <Button 
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                Adding...
              </span>
            ) : (
              'Add Time Slot'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TimeSlotDialog; 