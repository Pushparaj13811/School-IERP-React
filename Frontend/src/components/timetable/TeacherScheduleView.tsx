import React from 'react';
import { TimeSlot } from '../../services/timetableService';

interface TeacherScheduleProps {
  teacherTimetable: {
    teacher: {
      id: number;
      name: string;
    };
    schedule: {
      [key: string]: {
        periodId: number;
        timeSlot: TimeSlot;
        subject: {
          id: number;
          name: string;
          code: string;
        };
        class: {
          id: number;
          name: string;
        };
        section: {
          id: number;
          name: string;
        };
        academicYear: string;
        term: string;
      }[];
    };
  } | null;
}

const TeacherScheduleView: React.FC<TeacherScheduleProps> = ({ teacherTimetable }) => {
  if (!teacherTimetable) {
    return (
      <div className="p-4 bg-blue-50 text-blue-800 rounded-md">
        No schedule found. Please contact the administrator.
      </div>
    );
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
  // Sort periods by start time
  const sortedSchedule = daysOfWeek.map(day => {
    if (!teacherTimetable.schedule[day]) return { day, periods: [] };
    
    const periods = [...teacherTimetable.schedule[day]].sort((a, b) => {
      return a.timeSlot.startTime.localeCompare(b.timeSlot.startTime);
    });
    
    return { day, periods };
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedSchedule.map(({ day, periods }) => (
        <div key={day} className="bg-white rounded-lg shadow-sm p-4 h-full">
          <h3 className="text-lg font-medium mb-3">{day}</h3>
          
          {periods.length > 0 ? (
            <div className="space-y-3">
              {periods.map((period, index) => (
                <div key={index} className="border border-gray-200 rounded p-3">
                  <div className="text-xs text-gray-500">
                    {period.timeSlot.startTime} - {period.timeSlot.endTime}
                  </div>
                  <div className="font-bold text-sm">
                    {period.subject.name} ({period.subject.code})
                  </div>
                  <div className="mt-1">
                    <span className="inline-block px-2 py-1 text-xs rounded text-blue-800 bg-blue-100">
                      {period.class.name} - {period.section.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-blue-50 text-blue-800 rounded-md">
              No classes scheduled for {day}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TeacherScheduleView; 