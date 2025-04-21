import React from 'react';
import Button from '../ui/Button';
import { Period, TimeSlot } from '../../services/timetableService';

interface TimetableRow {
  timeSlot: TimeSlot;
  [key: string]: Period | TimeSlot | null;
}

interface TimetableGridProps {
  periodGrid: TimetableRow[] | null;
  onDeletePeriod: (periodId: number, periodName?: string) => void;
}

const TimetableGrid: React.FC<TimetableGridProps> = ({ periodGrid, onDeletePeriod }) => {
  if (!periodGrid || periodGrid.length === 0) {
    return (
      <div className="p-4 bg-blue-50 text-blue-800 rounded-md">
        No periods added yet. Click 'Add Period' to add periods to the timetable.
      </div>
    );
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[700px]">
        <thead className="bg-[#292648] text-white">
          <tr>
            <th className="p-3 text-left">Time Slot</th>
            {daysOfWeek.map(day => (
              <th key={day} className="p-3 text-center">{day}</th>
            ))}
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
              {daysOfWeek.map((day) => (
                <td key={day} className="p-3 border text-center relative">
                  {row[day] && 'subject' in row[day] ? (
                    <div>
                      <div className="font-bold text-sm">
                        {(row[day] as Period).subject.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {(row[day] as Period).teacher.user?.name || (row[day] as Period).teacher.name}
                      </div>
                      <Button
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        onClick={() => onDeletePeriod((row[day] as Period).id, (row[day] as Period).subject.name)}
                      >
                        <span className="text-xs">×</span>
                      </Button>
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