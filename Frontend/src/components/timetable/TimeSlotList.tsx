import React, { useState } from 'react';
import { TimeSlot } from '../../services/timetableService';
import { formatTime } from '../../utils/timeUtils';
import Button from '../ui/Button';

interface TimeSlotListProps {
  timeSlots: TimeSlot[];
  onDelete?: (timeSlotId: number, timeSlotName?: string) => Promise<void>;
  isAdmin?: boolean;
}

const TimeSlotList: React.FC<TimeSlotListProps> = ({ timeSlots, onDelete, isAdmin = false }) => {
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const handleDelete = async (timeSlotId: number, timeSlotName?: string) => {
    if (!onDelete) return;
    
    try {
      setIsDeleting(timeSlotId);
      await onDelete(timeSlotId, timeSlotName);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Start Time
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              End Time
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            {onDelete && isAdmin && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {timeSlots.map((slot) => (
            <tr key={slot.id} className={slot.isBreak ? 'bg-blue-50' : ''}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatTime(slot.startTime)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatTime(slot.endTime)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {slot.isBreak ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {slot.breakType || 'Break'}
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Class Period
                  </span>
                )}
              </td>
              {onDelete && isAdmin && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Button
                    onClick={() => handleDelete(
                      slot.id, 
                      slot.isBreak 
                        ? `${slot.breakType || 'Break'} (${formatTime(slot.startTime)} - ${formatTime(slot.endTime)})` 
                        : `Class Period (${formatTime(slot.startTime)} - ${formatTime(slot.endTime)})`
                    )}
                    disabled={isDeleting === slot.id}
                    variant="danger"
                  >
                    {isDeleting === slot.id ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        </svg>
                        Deleting... 
                      </span>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimeSlotList; 