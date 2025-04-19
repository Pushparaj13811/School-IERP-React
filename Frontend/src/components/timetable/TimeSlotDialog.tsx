import React, { useState } from 'react';

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

  if (!open) return null;
  
  const handleSubmit = async () => {
    await onAdd(startTime, endTime, isBreak, breakType);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Add Time Slot</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
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
                onChange={(e) => setEndTime(e.target.value)}
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
              onChange={(e) => setIsBreak(e.target.value === 'break')}
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
                onChange={(e) => setBreakType(e.target.value)}
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
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!startTime || !endTime || (isBreak && !breakType) || loading}
            className={`px-4 py-2 rounded-md text-white ${
              !startTime || !endTime || (isBreak && !breakType) || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#292648] hover:bg-[#3b3664]'
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                Adding...
              </span>
            ) : (
              'Add Time Slot'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeSlotDialog; 