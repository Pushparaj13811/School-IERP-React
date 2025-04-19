import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// Define API_URL directly since the config file can't be found
const API_URL = 'http://localhost:3000'; // Updated to correct port

interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  breakType: string | null;
}

interface Period {
  id: number;
  dayOfWeek: number;
  timeSlotId: number;
  subjectId: number;
  teacherId: number;
  classId: number;
  sectionId: number;
  timetableId: number;
  timeSlot: TimeSlot;
  subject: {
    id: number;
    name: string;
    code: string;
  };
  teacher: {
    id: number;
    name: string;
    user: {
      name: string;
      profilePicture?: {
        url: string;
      } | null;
    };
  };
}

interface Timetable {
  id: number;
  classId: number;
  sectionId: number;
  academicYear: string;
  term: string;
  class?: {
    name: string;
  };
  section?: {
    name: string;
  };
  periods: Period[];
}

// Custom type for the grid row
interface TimetableRow {
  timeSlot: TimeSlot;
  [key: string]: Period | TimeSlot | null;
}

// Define API response type
interface ApiResponse {
  status: string;
  data: Timetable;
  message?: string;
}

const TimeTable: React.FC = () => {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setLoading(true);
        // Get token from localStorage instead of context
        const token = localStorage.getItem('token');
        
        const response = await axios.get(`${API_URL}/api/v1/timetables/student`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Check if response has the expected structure
        if (response.data && typeof response.data === 'object') {
          const apiResponse = response.data as ApiResponse;
          if (apiResponse.status === 'success' && apiResponse.data) {
            setTimetable(apiResponse.data);
          } else {
            setError('Invalid response format from server');
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching timetable:', err);
        setError('Could not load timetable. Please try again later.');
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [user]);

  // Helper function to organize periods by day and time
  const organizePeriodsForDisplay = () => {
    if (!timetable || !timetable.periods || timetable.periods.length === 0) {
      return null;
    }

    // Get unique time slots
    const timeSlots = Array.from(
      new Set(timetable.periods.map((period) => period.timeSlot.id))
    ).map((id) => {
      return timetable.periods.find((period) => period.timeSlot.id === id)?.timeSlot;
    }).filter(Boolean) as TimeSlot[];

    // Sort time slots by start time
    timeSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    const daysOfWeek = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];

    // Create a grid with time slots as rows and days as columns
    const grid = timeSlots.map((timeSlot) => {
      const row: TimetableRow = {
        timeSlot: timeSlot,
      };

      // Initialize each day with null
      daysOfWeek.forEach((day) => {
        row[day] = null;
      });

      // Fill in periods where they exist
      timetable.periods.forEach((period) => {
        if (period.timeSlotId === timeSlot.id) {
          const day = daysOfWeek[period.dayOfWeek === 0 ? 6 : period.dayOfWeek - 1]; // Adjust for Sunday being 0
          row[day] = period;
        }
      });

      return row;
    });

    return grid;
  };

  const periodGrid = organizePeriodsForDisplay();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="p-4 bg-red-100 rounded-lg text-red-800">
          {error}
        </div>
      </div>
    );
  }

  if (!timetable || !timetable.periods || timetable.periods.length === 0) {
    return (
      <div className="p-4">
        <div className="p-4 bg-blue-100 rounded-lg text-blue-800">
          Your timetable is not available yet. Please check back later or contact your class teacher.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-[#EEF5FF]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">My Timetable</h1>
        
        <h2 className="text-lg font-medium mt-2 text-gray-700">
          Class: {timetable.class?.name} - {timetable.section?.name}
        </h2>
        
        <p className="text-sm text-gray-500 mt-1">
          {timetable.academicYear} • {timetable.term}
        </p>
      </div>

      {periodGrid && periodGrid.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm mt-4 overflow-auto">
          <div className="min-w-[700px]">
            <table className="w-full border-collapse">
              <thead className="bg-[#292648] text-white">
                <tr>
                  <th className="p-3 text-left">Time</th>
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
                    <td className="p-3 border whitespace-nowrap">
                      <div className="font-medium text-sm">
                        {row.timeSlot.startTime} - {row.timeSlot.endTime}
                      </div>
                      {row.timeSlot.isBreak && (
                        <div className="text-xs text-gray-500">
                          {row.timeSlot.breakType || 'Break'}
                        </div>
                      )}
                    </td>

                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <td key={day} className="p-3 border text-center">
                        {row[day] && 'subject' in row[day] ? (
                          <div>
                            <div className="font-bold text-sm">
                              {(row[day] as Period).subject.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              {(row[day] as Period).teacher.user?.name || (row[day] as Period).teacher.name}
                            </div>
                          </div>
                        ) : row.timeSlot.isBreak ? (
                          <span className="px-2 py-1 text-xs rounded-full border border-purple-300 text-purple-700 bg-purple-50">
                            {row.timeSlot.breakType || 'Break'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-blue-100 rounded-lg text-blue-800 mt-4">
          No periods have been added to your timetable yet.
        </div>
      )}

      {/* Weekly view with cards for each day */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Weekly Schedule</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, dayIndex) => {
            // Find all periods for this day, sorted by time
            const dayPeriods = timetable.periods
              .filter(period => {
                // Convert day index (0 = Sunday, 1 = Monday, etc.) to our format
                const periodDay = period.dayOfWeek === 0 ? 6 : period.dayOfWeek - 1;
                return periodDay === dayIndex;
              })
              .sort((a, b) => a.timeSlot.startTime.localeCompare(b.timeSlot.startTime));
              
            return (
              <div key={day} className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-3">{day}</h3>
                
                {dayPeriods.length > 0 ? (
                  <div className="space-y-2">
                    {dayPeriods.map((period, index) => (
                      <div 
                        key={index} 
                        className="p-2 mb-2 border-l-4 border-[#292648] bg-gray-50 rounded"
                      >
                        <div className="text-xs text-gray-500">
                          {period.timeSlot.startTime} - {period.timeSlot.endTime}
                        </div>
                        <div className="font-bold text-sm">
                          {period.subject.name}
                        </div>
                        <div className="text-xs">
                          {period.teacher.user?.name || period.teacher.name}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    No classes scheduled
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimeTable; 