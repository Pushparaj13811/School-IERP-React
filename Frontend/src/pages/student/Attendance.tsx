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

interface MonthlyAttendanceResponse {
  attendance: {
    month: string;
    year: number;
    presentCount: number;
    absentCount: number;
    percentage: number;
  }
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
        const monthlyResponse = await attendanceAPI.getMonthlyAttendance({
          month: today.getMonth() + 1,
          year: currentYear,
          studentId: targetStudentId
        });
        
        if (monthlyResponse.data?.status === 'success') {
          // Type assertion to tell TypeScript about the correct structure
          const responseData = monthlyResponse.data.data as unknown as MonthlyAttendanceResponse;
          if (responseData.attendance) {
            // Format monthly data
            const data = responseData.attendance;
            setMonthlyAttendance([
              {
                month: format(new Date(data.month), 'MMMM yyyy'),
                year: data.year,
                presentCount: data.presentCount || 0,
                absentCount: data.absentCount || 0,
                percentage: data.percentage || 0
              }
            ]);
          } else {  
            // Set default values if no data
            setMonthlyAttendance([
              {
                month: format(today, 'MMMM yyyy'),
                year: currentYear,
                presentCount: 0,
                absentCount: 0,
                percentage: 0
              }
            ]);
          }
        } else {
          // Continue with daily attendance even if monthly fails
          setMonthlyAttendance([
            {
              month: format(today, 'MMMM yyyy'),
              year: currentYear,
              presentCount: 0,
              absentCount: 0,
              percentage: 0
            }
          ]);
        }
      } catch (monthlyErr) {
        console.error('Error fetching monthly attendance:', monthlyErr);
        // Continue with daily attendance even if monthly fails
        setMonthlyAttendance([
          {
            month: format(today, 'MMMM yyyy'),
            year: currentYear,
            presentCount: 0,
            absentCount: 0,
            percentage: 0
          }
        ]);
      }
      
      // Fetch last 30 days of attendance
      try {
        // Calculate a date 30 days ago, ensuring we don't use future years
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setFullYear(currentYear);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Log the date range we're using for debugging
        console.log(`Fetching attendance for studentId ${targetStudentId} from ${format(thirtyDaysAgo, 'yyyy-MM-dd')} to ${format(today, 'yyyy-MM-dd')}`);
        
        // First, attempt to get student class and section since backend requires them
        const student = await userAPI.getStudentById(targetStudentId);
        if (student?.data?.status === 'success' && student?.data?.data?.student) {
          const studentData = student.data.data.student;
          const classId = studentData.classId || studentData.class?.id;
          const sectionId = studentData.sectionId || studentData.section?.id;
          
          // Check if we have the required class and section IDs
          if (classId && sectionId) {
            // Use the class/section approach since student-specific endpoint needs these
            const dailyResponse = await attendanceAPI.getDailyAttendance({
              date: format(today, 'yyyy-MM-dd'), // Use current date
              classId,
              sectionId,
              studentId: targetStudentId // Include studentId for filtering
            });
            
            if (dailyResponse.data?.status === 'success' && Array.isArray(dailyResponse.data?.data?.attendance)) {
              // Filter attendance for this specific student if needed
              const studentAttendance = dailyResponse.data.data.attendance.filter(
                record => record.studentId === targetStudentId || record.student?.id === targetStudentId
              ).map(record => {
                // If no status is recorded, mark as REMAINING
                if (!record.status) {
                  return { ...record, status: 'REMAINING' as const };
                }
                return record;
              });
              setRecentAttendance(studentAttendance as DailyAttendance[]);
            } else {
              setRecentAttendance([]);
            }
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
    
    // Add days from previous month
    for (let i = 0; i < daysFromPrevMonth; i++) {
      const date = new Date(calendarStart);
      date.setDate(date.getDate() + i);
      
      days.push({
        date,
        isCurrentMonth: false,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isHoliday: false // Would need to check against holiday API
      });
    }
    
    // Add days from current month
    for (let i = 0; i < totalDaysInCurrentMonth; i++) {
      const date = new Date(year, monthIndex, i + 1);
      
      // Check if attendance exists for this day
      const attendance = recentAttendance.find(a => {
        const attendanceDate = new Date(a.date);
        return (
          attendanceDate.getDate() === date.getDate() &&
          attendanceDate.getMonth() === date.getMonth() &&
          attendanceDate.getFullYear() === date.getFullYear()
        );
      });
      
      days.push({
        date,
        status: attendance?.status,
        isCurrentMonth: true,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isHoliday: false // Would need to check against holiday API
      });
    }
    
    // Add days from next month
    const nextMonthStart = new Date(year, monthIndex + 1, 1);
    for (let i = 0; i < daysFromNextMonth; i++) {
      const date = new Date(nextMonthStart);
      date.setDate(date.getDate() + i);
      
      days.push({
        date,
        isCurrentMonth: false,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
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
                      ${day.status ? getStatusColor(day.status) : ''}
                    `}
                    role="gridcell"
                    aria-label={`${format(day.date, 'EEEE, MMMM d, yyyy')}${day.status ? `, ${day.status}` : ''}`}
                    tabIndex={day.isCurrentMonth ? 0 : -1}
                  >
                    <span className="text-sm">{format(day.date, 'd')}</span>
                    {day.status && (
                      <span className="text-xs mt-1 font-medium">
                        {day.status === 'PRESENT' ? 'P' : 
                          day.status === 'ABSENT' ? 'A' : 
                          day.status === 'LATE' ? 'L' : 
                          day.status === 'HALF_DAY' ? 'H' : 
                          day.status === 'REMAINING' ? 'R' : 'E'}
                      </span>
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