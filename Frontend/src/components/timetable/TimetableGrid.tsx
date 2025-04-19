import React from 'react';
import { TimetableRow, Period } from '../../services/timetableService';

interface TimetableGridProps {
  periodGrid: TimetableRow[] | null;
  onDeletePeriod: (periodId: number) => Promise<void>;
}

const TimetableGrid: React.FC<TimetableGridProps> = ({ periodGrid, onDeletePeriod }) => {
  if (!periodGrid || periodGrid.length === 0) {
    return (
      <div className="p-4 bg-blue-50 text-blue-800 rounded-md">
        No periods added yet. Click 'Add Period' to add periods to the timetable.
      </div>
    );
  }

  const handleDelete = async (period: Period) => {
    if (window.confirm('Are you sure you want to delete this period?')) {
      await onDeletePeriod(period.id);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[700px]">
        <thead className="bg-[#292648] text-white">
          <tr>
            <th className="p-3 text-left">Time Slot</th>
            <th className="p-3 text-center">Monday</th>
            <th className="p-3 text-center">Tuesday</th>
            <th className="p-3 text-center">Wednesday</th>
            <th className="p-3 text-center">Thursday</th>
            <th className="p-3 text-center">Friday</th>
            <th className="p-3 text-center">Saturday</th>
            <th className="p-3 text-center">Sunday</th>
          </tr>
        </thead>
        <tbody>
          {periodGrid.map((row, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="p-3 border">
                <div className="font-medium">
                  {row.timeSlot.startTime} - {row.timeSlot.endTime}
                </div>
                {row.timeSlot.isBreak && (
                  <div className="text-xs text-gray-500">
                    {row.timeSlot.breakType || 'Break'}
                  </div>
                )}
              </td>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <td key={day} className="p-3 border text-center relative">
                  {row[day] && 'subject' in row[day] ? (
                    <div>
                      <div className="font-bold text-sm">
                        {(row[day] as Period).subject.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {(row[day] as Period).teacher.user?.name || (row[day] as Period).teacher.name}
                      </div>
                      <button
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(row[day] as Period)}
                      >
                        <span className="text-xs">×</span>
                      </button>
                    </div>
                  ) : row.timeSlot.isBreak ? (
                    <span className="text-xs text-gray-500">Break</span>
                  ) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimetableGrid; 