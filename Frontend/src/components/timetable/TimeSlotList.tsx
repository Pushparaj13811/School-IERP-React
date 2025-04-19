import React from 'react';
import { TimeSlot } from '../../services/timetableService';

interface TimeSlotListProps {
  timeSlots: TimeSlot[];
}

const TimeSlotList: React.FC<TimeSlotListProps> = ({ timeSlots }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-[#292648] text-white">
          <tr>
            <th className="p-3 text-left">Start Time</th>
            <th className="p-3 text-left">End Time</th>
            <th className="p-3 text-left">Type</th>
          </tr>
        </thead>
        <tbody>
          {timeSlots.length > 0 ? (
            timeSlots.map((slot) => (
              <tr key={slot.id} className="border-b border-gray-200">
                <td className="p-3">{slot.startTime}</td>
                <td className="p-3">{slot.endTime}</td>
                <td className="p-3">
                  {slot.isBreak ? (
                    <span className="text-gray-600">{slot.breakType || 'Break'}</span>
                  ) : (
                    'Period'
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="p-4 text-center text-gray-500">
                No time slots available. Click 'Add Time Slot' to create one.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TimeSlotList; 