import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
interface TimeSlotDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (startTime: string, endTime: string, isBreak: boolean, breakType: string | null) => Promise<void>;
  loading: boolean;
}

const COMMON_BREAK_TYPES = [
  { id: 'SHORT BREAK', label: 'Short Break (5-15 min)' },
  { id: 'LUNCH BREAK', label: 'Lunch Break (30-60 min)' },
  { id: 'RECESS', label: 'Recess (15-30 min)' },
  { id: 'ASSEMBLY', label: 'Assembly' },
  { id: 'OTHER', label: 'Other' }
];

const TimeSlotDialog: React.FC<TimeSlotDialogProps> = ({ open, onClose, onAdd, loading }) => {
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [breakType, setBreakType] = useState<string>('');
  const [customBreakType, setCustomBreakType] = useState<string>('');
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
      setCustomBreakType('');
    }
  }, [open]);

  // Suggest end time based on start time
  useEffect(() => {
    if (startTime && !endTime) {
      try {
        // Parse the start time
        const [hours, minutes] = startTime.split(':').map(Number);
        // Default period length is 45 minutes
        let newHours = hours;
        let newMinutes = minutes + 45;
        
        // Handle minute overflow
        if (newMinutes >= 60) {
          newHours += Math.floor(newMinutes / 60);
          newMinutes %= 60;
        }
        
        // Format the new time
        const newTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
        setEndTime(newTime);
      } catch (error) {
        // If parsing fails, don't suggest an end time
        console.error('Error suggesting end time:', error);
      }
    }
  }, [startTime, endTime]);

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

    // Check if custom break type is provided when "OTHER" is selected
    if (isBreak && breakType === 'OTHER' && !customBreakType.trim()) {
      setValidationError('Please specify the custom break type');
      return false;
    }
    
    setValidationError(null);
    return true;
  };
  
  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        // For class periods, breakType should be null
        // For break periods, determine the appropriate break type
        let finalBreakType: string | null = null;
        
        if (isBreak) {
          if (breakType === 'OTHER') {
            if (customBreakType && customBreakType.trim() !== '') {
              finalBreakType = customBreakType.trim();
            } else {
              setValidationError('Please specify a custom break type');
              return;
            }
          } else if (breakType && breakType.trim() !== '') {
            finalBreakType = breakType;
          } else {
            setValidationError('Please select a break type');
            return;
          }
        }
        
        console.log('Submitting time slot data:', {
          startTime,
          endTime,
          isBreak,
          finalBreakType
        });
        
        // Pass null explicitly for non-break slots
        await onAdd(startTime, endTime, isBreak, finalBreakType);
      } catch (error) {
        console.error('Error in TimeSlotDialog submission:', error);
        setValidationError('An error occurred while adding the time slot');
      }
    }
  };

  // Generate common school hours for dropdown (7:00 AM to 5:00 PM in 15-minute intervals)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 7; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const formattedHour = String(hour).padStart(2, '0');
        const formattedMinute = String(minute).padStart(2, '0');
        const timeValue = `${formattedHour}:${formattedMinute}`;
        
        let displayTime = timeValue;
        // Convert to 12-hour format for display
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        displayTime = `${displayHour}:${formattedMinute} ${ampm}`;
        
        options.push(
          <option key={timeValue} value={timeValue}>
            {displayTime} ({timeValue})
          </option>
        );
      }
    }
    return options;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Add Time Slot</h3>
          <Button 
            variant="danger" 
            onClick={onClose} 
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
          <div className="border p-3 rounded-md bg-blue-50 text-blue-700 text-sm mb-4">
            <p className="font-medium">Tip:</p>
            <p>Create time slots in sequence (e.g., 8:00-8:45, 8:45-9:30) to ensure there are no gaps in the schedule.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <select
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  // Reset end time for better UX
                  if (endTime && e.target.value >= endTime) {
                    setEndTime('');
                  }
                  setValidationError(null);
                }}
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationError && !startTime ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Start Time</option>
                {generateTimeOptions()}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time <span className="text-red-500">*</span>
              </label>
              <select
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setValidationError(null);
                }}
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationError && !endTime ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select End Time</option>
                {generateTimeOptions()}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <div className="flex items-center space-x-4 mb-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="period-type"
                  name="slot-type"
                  checked={!isBreak}
                  onChange={() => {
                    setIsBreak(false);
                    setBreakType('');
                    setCustomBreakType('');
                    setValidationError(null);
                  }}
                  className="h-4 w-4 text-blue-600"
                />
                <label htmlFor="period-type" className="ml-2 text-sm text-gray-700">
                  Class Period
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="break-type"
                  name="slot-type"
                  checked={isBreak}
                  onChange={() => {
                    setIsBreak(true);
                    setValidationError(null);
                  }}
                  className="h-4 w-4 text-blue-600"
                />
                <label htmlFor="break-type" className="ml-2 text-sm text-gray-700">
                  Break
                </label>
              </div>
            </div>
          </div>
          
          {isBreak && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Break Type <span className="text-red-500">*</span>
              </label>
              <select
                value={breakType}
                onChange={(e) => {
                  setBreakType(e.target.value);
                  setValidationError(null);
                }}
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationError && isBreak && !breakType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Break Type</option>
                {COMMON_BREAK_TYPES.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
              
              {breakType === 'OTHER' && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Break Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customBreakType}
                    onChange={(e) => {
                      setCustomBreakType(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder="e.g., Prayer Break, Sports Break"
                    className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationError && breakType === 'OTHER' && !customBreakType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-6 space-x-2">
          <Button 
            variant="secondary"
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