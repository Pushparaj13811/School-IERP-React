import React, { useState, useEffect } from 'react';
import Table from '../../components/ui/Table';
import { attendanceAPI, userAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';
import { UserRole } from '../../utils/roles';
import Button from '../../components/ui/Button';

interface DailyAttendance {
  id: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'EXCUSED' | 'REMAINING';
  remarks?: string;
}

interface MonthlyAttendance {
  month: string;
  year: number;
  presentCount: number;
  absentCount: number;
  percentage: number;
}

interface CalendarDay {
  date: Date;
  status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'EXCUSED' | 'REMAINING';
  isCurrentMonth: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
}

// API response interfaces with more flexible types to handle different formats
interface AttendanceRecord {
  studentId?: number;
  student?: { id: number; name?: string };
  present?: number;
  absent?: number;
  late?: number;
  halfDay?: number;
  excused?: number;
  percentage?: number;
  presentCount?: number;
  absentCount?: number;
  year?: number;
  date?: string;
  status?: string;
  remarks?: string;
  id?: number;
  [key: string]: unknown;
}

// Type for API responses to avoid unsafe type assertions
interface ApiResponseType {
  data: {
    status: string;
    data: {
      attendance?: AttendanceRecord[];
      [key: string]: unknown;
    };
  }
}

// Update the MonthlyAttendanceSummary interface to match the API response
interface MonthlyAttendanceSummary {
  studentId?: number;
  student?: { id: number; name?: string };
  studentName?: string;
  rollNumber?: string;
  present?: number;
  absent?: number;
  late?: number;
  excused?: number;
  halfDay?: number;
  total?: number;
  percentage?: number;
  year?: number;
  [key: string]: unknown; // Add index signature for flexible property access
}

const Attendance: React.FC = () => {
  const [recentAttendance, setRecentAttendance] = useState<DailyAttendance[]>([]);
  const [monthlyAttendance, setMonthlyAttendance] = useState<MonthlyAttendance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState<{ name: string, class: string, section: string } | null>(null);
  
  // For calendar
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  
  const { user } = useAuth();
  const { studentId } = useParams<{ studentId?: string }>();
  
  useEffect(() => {
    fetchAttendanceData();
  }, [studentId]);
  
  useEffect(() => {
    generateCalendarDays(currentMonth);
  }, [currentMonth, recentAttendance]);
   
  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use 2025 as the academic year - what the backend expects
      const today = new Date();
      const currentYear = 2025; // Fixed academic year that backend accepts
      today.setFullYear(currentYear);
      
      // Determine which student ID to use
      const targetStudentId = studentId ? parseInt(studentId) : user?.student?.id;
      
      if (!targetStudentId) {
        throw new Error('No student ID available');
      }
      
      // If viewing as parent with studentId param, fetch student details
      if (studentId && user?.role === UserRole.PARENT) {
        try {
          const studentResponse = await userAPI.getStudentById(parseInt(studentId));
          if (studentResponse.data?.status === 'success' && studentResponse.data?.data?.student) {
            const student = studentResponse.data.data.student;
            setStudentInfo({
              name: student.name,
              class: student.class?.name || '',
              section: student.section?.name || ''
            });
          }
        } catch (err) {
          console.error('Error fetching student info:', err);
        }
      }
      
      // Fetch current month's attendance
      try {
        console.log(`Fetching monthly attendance for studentId ${targetStudentId}, month ${today.getMonth() + 1}, year ${currentYear}`);
        
        const monthlyResponse = await attendanceAPI.getMonthlyAttendance({
          month: today.getMonth() + 1,
          year: currentYear,
          studentId: targetStudentId
        });
        
        if (monthlyResponse?.data?.status === 'success') {
          // Check which format the API returned
          if (Array.isArray(monthlyResponse.data?.data)) {
            // New API format: direct array of student attendance summaries
            console.log('Processing array response format');
            // Fix the type mismatch by properly casting the array first
            const attendanceData = monthlyResponse.data.data as unknown as MonthlyAttendanceSummary[];
            const studentSummary = attendanceData.find((item) => {
              // Look for matching student in attendance records
              return (
                Number(item.studentId) === targetStudentId || 
                (item.student && typeof item.student === 'object' && 
                'id' in item.student && Number((item.student as {id: number}).id) === targetStudentId)
              );
            });
            
            if (studentSummary) {
              console.log('Found student summary in array:', studentSummary);
              
              // Use the process function to correctly extract attendance data
              const processedData = processMonthlyAttendance(studentSummary);
              
              // Create standardized monthly attendance object
              setMonthlyAttendance([
                {
                  month: format(today, 'MMMM yyyy'),
                  year: currentYear,
                  presentCount: processedData.presentCount,
                  absentCount: processedData.absentCount,
                  percentage: processedData.percentage
                }
              ]);
            } else {
              console.log('No matching student found in array data');
              // Set default values if student not found
              setDefaultMonthlyAttendance(today, currentYear);
            }
          } else if (monthlyResponse.data?.data && typeof monthlyResponse.data.data === 'object') {
            const responseData = monthlyResponse.data.data as Record<string, unknown>;
            
            if (responseData.attendance) {
              // Old API format: nested attendance object
              console.log('Processing nested object response format');
              const attendanceData = responseData.attendance as Record<string, unknown>;
              
              // Create standardized monthly attendance object
              setMonthlyAttendance([
                {
                  month: format(today, 'MMMM yyyy'),
                  year: currentYear,
                  presentCount: typeof attendanceData.presentCount === 'number' ? attendanceData.presentCount : 0,
                  absentCount: typeof attendanceData.absentCount === 'number' ? attendanceData.absentCount : 0,
                  percentage: typeof attendanceData.percentage === 'number' ? 
                    attendanceData.percentage : calculatePercentage(attendanceData)
                }
              ]);
            } else {
              // Direct object format
              console.log('Processing direct object response format');
              
              // Create standardized monthly attendance object
              setMonthlyAttendance([
                {
                  month: format(today, 'MMMM yyyy'),
                  year: currentYear,
                  presentCount: 
                    typeof responseData.presentCount === 'number' ? responseData.presentCount : 
                    typeof responseData.present === 'number' ? responseData.present : 0,
                  absentCount: 
                    typeof responseData.absentCount === 'number' ? responseData.absentCount : 
                    typeof responseData.absent === 'number' ? responseData.absent : 0,
                  percentage: typeof responseData.percentage === 'number' ? 
                    responseData.percentage : calculatePercentage(responseData)
                }
              ]);
            }
          } else {
            console.log('Unrecognized API response format:', monthlyResponse.data);
            setDefaultMonthlyAttendance(today, currentYear);
          }
        } else {
          console.log('API returned non-success status for monthly attendance');
          setDefaultMonthlyAttendance(today, currentYear);
        }
      } catch (monthlyErr) {
        console.error('Error fetching monthly attendance:', monthlyErr);
        setDefaultMonthlyAttendance(today, currentYear);
      }
      
      // Fetch last 30 days of attendance
      try {
        // Calculate a date 30 days ago, ensuring we don't use future years
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setFullYear(currentYear);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        console.log(`Fetching daily attendance for studentId ${targetStudentId} from ${format(thirtyDaysAgo, 'yyyy-MM-dd')} to ${format(today, 'yyyy-MM-dd')}`);
        
        // First, attempt to get student class and section
        const student = await userAPI.getStudentById(targetStudentId);
        if (student?.data?.status === 'success' && student?.data?.data?.student) {
          const studentData = student.data.data.student;
          const classId = studentData.classId || studentData.class?.id;
          const sectionId = studentData.sectionId || studentData.section?.id;
          
          console.log(`Student belongs to classId=${classId}, sectionId=${sectionId}`);
          
          if (classId && sectionId) {
            // Try to get attendance for the last 30 days
            const attendancePromises = [];
            
            // Get the current date and the date 30 days ago
            const endDate = new Date(today);
            const startDate = new Date(thirtyDaysAgo);
            
            // Use a loop to fetch attendance for each day in the last 30 days
            for (let i = 0; i < 30; i++) {
              const currentDate = new Date(endDate);
              currentDate.setDate(endDate.getDate() - i);
              
              // Skip if the date is before start date
              if (currentDate < startDate) continue;
              
              const formattedDate = format(currentDate, 'yyyy-MM-dd');
              
              attendancePromises.push(
                attendanceAPI.getDailyAttendance({
                  date: formattedDate,
                  classId,
                  sectionId,
                  studentId: targetStudentId
                }).catch(err => {
                  console.log(`Error fetching attendance for ${formattedDate}:`, err);
                  return null; // Return null for failed requests
                })
              );
            }
            
            // Wait for all requests to complete
            const attendanceResponses = await Promise.all(attendancePromises);
            console.log(`Received ${attendanceResponses.length} daily attendance responses`);
            
            // Process all responses to gather attendance records
            const allAttendanceRecords: DailyAttendance[] = [];
            
            attendanceResponses.forEach((response: unknown) => {
              // Fix the type errors with proper type checking
              if (response && 
                  typeof response === 'object' && 
                  'data' in response && 
                  response.data && 
                  typeof response.data === 'object' && 
                  'status' in response.data && 
                  (response.data as { status: unknown }).status === 'success' &&
                  'data' in response.data) {
                
                const responseWithData = response as ApiResponseType;
                const attendanceData = responseWithData.data.data;
                
                if (attendanceData && 
                    typeof attendanceData === 'object' && 
                    'attendance' in attendanceData && 
                    Array.isArray(attendanceData.attendance)) {
                  
                  // Filter for this student's records
                  const attendance = attendanceData.attendance;
                  const studentRecords = attendance
                    .filter((record: AttendanceRecord) => {
                      return Number(record.studentId) === targetStudentId || 
                             (record.student && typeof record.student === 'object' && 
                              'id' in record.student && Number((record.student as {id: number}).id) === targetStudentId);
                    })
                    .map((record: AttendanceRecord) => {
                      // Convert to proper DailyAttendance type
                      return { 
                        id: typeof record.id === 'number' ? record.id : 0,
                        date: typeof record.date === 'string' ? record.date : new Date().toISOString(),
                        status: (record.status as DailyAttendance['status']) || 'REMAINING',
                        remarks: typeof record.remarks === 'string' ? record.remarks : undefined
                      } as DailyAttendance;
                    });
                  
                  allAttendanceRecords.push(...studentRecords);
                }
              }
            });
            
            console.log(`Found ${allAttendanceRecords.length} attendance records for student in the last 30 days`);
            
            // Remove duplicates (in case same day appears multiple times)
            const uniqueAttendance = allAttendanceRecords.reduce((acc, current) => {
              const existing = acc.find(item => item.date === current.date);
              if (!existing) {
                acc.push(current);
              }
              return acc;
            }, [] as DailyAttendance[]);
            
            setRecentAttendance(uniqueAttendance);
          } else {
            console.error('Missing classId or sectionId required for attendance fetch');
            setRecentAttendance([]);
          }
        } else {
          console.error('Could not fetch student class/section data');
          setRecentAttendance([]);
        }
      } catch (dailyErr) {
        console.error('Error fetching daily attendance:', dailyErr);
        setRecentAttendance([]);
      }
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError('Failed to load attendance data. Please try again later.');
      toast.error('Failed to load attendance data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to set default monthly attendance
  const setDefaultMonthlyAttendance = (today: Date, year: number) => {
    setMonthlyAttendance([
      {
        month: format(today, 'MMMM yyyy'),
        year: year,
        presentCount: 0,
        absentCount: 0,
        percentage: 0
      }
    ]);
  };
  
  const generateCalendarDays = (month: Date) => {
    // Use 2025 academic year instead of system current year
    const currentYear = 2025;
    const correctedMonth = new Date(month);
    correctedMonth.setFullYear(currentYear);
    
    const year = correctedMonth.getFullYear();
    const monthIndex = correctedMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, monthIndex, 1);
    
    // Last day of the month
    const lastDay = new Date(year, monthIndex + 1, 0);
    
    // Day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate how many days from the previous month to show
    const daysFromPrevMonth = firstDayOfWeek;
    
    // Calculate first day to show on calendar (may be from previous month)
    const calendarStart = new Date(firstDay);
    calendarStart.setDate(calendarStart.getDate() - daysFromPrevMonth);
    
    // Calculate how many days to show from the next month to complete the grid
    const totalDaysInCurrentMonth = lastDay.getDate();
    const totalCalendarDays = 42; // 6 rows of 7 days
    const daysFromNextMonth = totalCalendarDays - (daysFromPrevMonth + totalDaysInCurrentMonth);
    
    // Generate calendar days
    const days: CalendarDay[] = [];
    
    // Today's date for comparison
    const today = new Date();
    today.setFullYear(currentYear);
    today.setHours(0, 0, 0, 0);
    
    // Add days from previous month
    for (let i = 0; i < daysFromPrevMonth; i++) {
      const date = new Date(calendarStart);
      date.setDate(date.getDate() + i);
      
      const isWeekend = date.getDay() === 6;
      
      days.push({
        date,
        isCurrentMonth: false,
        isWeekend,
        isHoliday: false // Would need to check against holiday API
      });
    }
    
    // Add days from current month
    for (let i = 0; i < totalDaysInCurrentMonth; i++) {
      const date = new Date(year, monthIndex, i + 1);
      date.setHours(0, 0, 0, 0);
      
      const isWeekend = date.getDay() === 6;
      const isPast = date < today;
      
      // Check if attendance exists for this day
      let attendanceStatus: CalendarDay['status'] = undefined;
      
      // Only set status for non-weekend days
      if (!isWeekend) {
        // Look for attendance record for this date
        const attendance = recentAttendance.find(a => {
          const attendanceDate = new Date(a.date);
          return (
            attendanceDate.getDate() === date.getDate() &&
            attendanceDate.getMonth() === date.getMonth() &&
            attendanceDate.getFullYear() === date.getFullYear()
          );
        });
        
        if (attendance) {
          // Use recorded attendance status
          attendanceStatus = attendance.status;
        } else if (isPast) {
          // For past dates with no record, mark as REMAINING
          attendanceStatus = 'REMAINING';
        }
      }
      
      days.push({
        date,
        status: attendanceStatus,
        isCurrentMonth: true,
        isWeekend,
        isHoliday: false // Would need to check against holiday API
      });
    }
    
    // Add days from next month
    const nextMonthStart = new Date(year, monthIndex + 1, 1);
    for (let i = 0; i < daysFromNextMonth; i++) {
      const date = new Date(nextMonthStart);
      date.setDate(date.getDate() + i);
      
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      days.push({
        date,
        isCurrentMonth: false,
        isWeekend,
        isHoliday: false // Would need to check against holiday API
      });
    }
    
    setCalendarDays(days);
  };
  
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100';
    
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800';
      case 'ABSENT': return 'bg-red-100 text-red-800';
      case 'LATE': return 'bg-yellow-100 text-yellow-800';
      case 'HALF_DAY': return 'bg-orange-100 text-orange-800';
      case 'EXCUSED': return 'bg-blue-100 text-blue-800';
      case 'REMAINING': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100';
    }
  };
  
  const recent15Days = recentAttendance
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 15)
    .map((record, index) => ({
      id: index + 1,
      date: format(new Date(record.date), 'dd MMM yyyy'),
      status: record.status,
      remarks: record.remarks || '-'
    }));
  
  const recentColumns = [
    { header: "Date", accessor: "date" },
    { 
      header: "Status", 
      accessor: "status",
      cell: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value}
        </span>
      )
    },
    { header: "Remarks", accessor: "remarks" }
  ];
  
  const monthlyColumns = [
    { header: "Period", accessor: "month" },
    { header: "Present Days", accessor: "presentCount" },
    { header: "Absent Days", accessor: "absentCount" },
    { 
      header: "Attendance %", 
      accessor: "percentage",
      cell: (value: number) => {
        const colorClass = value >= 90 
          ? 'text-green-600' 
          : value >= 75 
            ? 'text-yellow-600' 
            : 'text-red-600';
            
        return <span className={`font-medium ${colorClass}`}>{value.toFixed(2)}%</span>;
      }
    }
  ];

  // Helper function to calculate attendance percentage
  const calculatePercentage = (data: Record<string, unknown>): number => {
    // Safely get values using type guards and fallbacks
    const present = 
      typeof data.present === 'number' ? data.present : 
      typeof data.presentCount === 'number' ? data.presentCount : 0;
    
    const absent = 
      typeof data.absent === 'number' ? data.absent : 
      typeof data.absentCount === 'number' ? data.absentCount : 0;
    
    const late = typeof data.late === 'number' ? data.late : 0;
    const halfDay = typeof data.halfDay === 'number' ? data.halfDay : 0;
    const excused = typeof data.excused === 'number' ? data.excused : 0;
    
    // Calculate total using all attendance types
    const total = present + absent + late + halfDay + excused;
    
    // Return 0 if there's no attendance data
    if (total === 0) return 0;
    
    // Calculate and return percentage - counting partial attendance
    const effectivePresent = present + (late * 0.75) + (halfDay * 0.5);
    return (effectivePresent / total) * 100;
  };

  // Process monthly attendance data properly for correct display
  const processMonthlyAttendance = (data: Record<string, unknown>) => {
    // Get present and absent days, checking all possible property names
    const present = 
      typeof data.present === 'number' ? data.present : 
      typeof data.presentCount === 'number' ? data.presentCount : 0;
    
    const absent = 
      typeof data.absent === 'number' ? data.absent : 
      typeof data.absentCount === 'number' ? data.absentCount : 0;
    
    // Calculate percentage
    const percentage = typeof data.percentage === 'number' ? 
      data.percentage : calculatePercentage(data);
      
    return {
      presentCount: present,
      absentCount: absent,
      percentage: percentage
    };
  };

  return (
    <div className="w-full p-4 bg-[#EEF5FF]">
      <div className="w-full bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Attendance Record</h2>
            {studentInfo && (
              <p className="text-gray-600">
                {studentInfo.name} - {studentInfo.class} {studentInfo.section}
              </p>
            )}
          </div>
          
          {/* Stats */}
          <div className="flex space-x-4" role="region" aria-label="Attendance Statistics">
            {monthlyAttendance[0] && (
              <>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Present</p>
                  <p className="text-xl font-bold text-green-600">{monthlyAttendance[0].presentCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Absent</p>
                  <p className="text-xl font-bold text-red-600">{monthlyAttendance[0].absentCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Percentage</p>
                  <p className="text-xl font-bold text-blue-600">{monthlyAttendance[0].percentage.toFixed(1)}%</p>
                </div>
              </>
            )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8" aria-live="polite">Loading attendance data...</div>
        ) : error ? (
          <div className="bg-red-100 p-4 rounded-md text-red-800 mb-6" role="alert">{error}</div>
        ) : (
          <>
            {/* Attendance Summary */}
            <div className="w-full mb-8">
              <Table 
                title="Monthly Attendance Summary"
                columns={monthlyColumns}
                data={monthlyAttendance}
              />
            </div>
            
            {/* Calendar View */}
            <div className="mb-8" role="region" aria-label="Attendance Calendar">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium" id="calendar-heading">Attendance Calendar</h3>
                <div className="flex items-center space-x-2" role="group" aria-label="Calendar navigation">
                  <Button 
                    variant="outline"
                    onClick={previousMonth}
                    className="p-2 rounded-md hover:bg-gray-100"
                    ariaLabel="Previous month"
                  >
                    ◀
                  </Button>
                  <span className="text-md font-medium" aria-live="polite">
                    {format(currentMonth, 'MMMM yyyy')}
                  </span>
                  <Button 
                    variant="outline"
                    onClick={nextMonth}
                    className="p-2 rounded-md hover:bg-gray-100"
                    ariaLabel="Next month"
                  >
                    ▶
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1" role="grid" aria-labelledby="calendar-heading">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center p-2 font-medium" role="columnheader">
                    {day}
                  </div>
                ))}
                
                {calendarDays.map((day, index) => (
                  <div 
                    key={index}
                    className={`
                      p-2 rounded-md text-center min-h-[3rem] flex flex-col items-center justify-center
                      ${!day.isCurrentMonth ? 'text-gray-400' : ''}
                      ${day.isWeekend ? 'bg-blue-50' : ''}
                      ${day.isHoliday ? 'bg-red-50' : ''}
                      ${!day.isWeekend && !day.isHoliday && day.status ? getStatusColor(day.status) : ''}
                    `}
                    role="gridcell"
                    aria-label={`${format(day.date, 'EEEE, MMMM d, yyyy')}${day.status ? `, ${day.status}` : ''}${day.isWeekend ? ', Weekend' : ''}${day.isHoliday ? ', Holiday' : ''}`}
                    tabIndex={day.isCurrentMonth ? 0 : -1}
                  >
                    <span className="text-sm">{format(day.date, 'd')}</span>
                    {!day.isWeekend && !day.isHoliday && day.status && (
                      <span className="text-xs mt-1 font-medium">
                        {day.status === 'PRESENT' ? 'P' : 
                          day.status === 'ABSENT' ? 'A' : 
                          day.status === 'LATE' ? 'L' : 
                          day.status === 'HALF_DAY' ? 'H' : 
                          day.status === 'REMAINING' ? 'R' : 'E'}
                      </span>
                    )}
                    {day.isWeekend && (
                      <span className="text-xs mt-1 font-medium text-blue-600">W</span>
                    )}
                    {day.isHoliday && (
                      <span className="text-xs mt-1 font-medium text-red-600">H</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recent Attendance */}
            <div className="w-full">
              <Table 
                title="Recent Attendance"
                columns={recentColumns}
                data={recent15Days}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Attendance; 