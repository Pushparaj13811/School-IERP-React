import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import timetableService, { 
  Subject, 
  Teacher, 
  TimeSlot, 
  Period, 
  Timetable, 
  ClassTeacherAssignment
} from '../../services/timetableService';

interface TeacherTimetable {
  teacher: {
    id: number;
    name: string;
  };
  schedule: {
    [key: string]: {
      periodId: number;
      timeSlot: TimeSlot;
      subject: Subject;
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
}

// Update the User interface to include teacherId
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  teacherId?: string;  // Added optional teacherId property
}

const TeacherTimetable: React.FC = () => {
  const { user } = useAuth() as { user: User | null };
  const [teacherData, setTeacherData] = useState<Teacher | null>(null);
  const [teacherTimetable, setTeacherTimetable] = useState<TeacherTimetable | null>(null);
  const [classTeacherAssignments, setClassTeacherAssignments] = useState<ClassTeacherAssignment[]>([]);
  
  // States for class teacher functionality
  const [isClassTeacher, setIsClassTeacher] = useState<boolean>(false);
  const [selectedAssignment, setSelectedAssignment] = useState<ClassTeacherAssignment | null>(null);
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  // Period form states
  const [periodDialogOpen, setPeriodDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | ''>('');
  const [selectedSubject, setSelectedSubject] = useState<number | ''>('');
  const [selectedTeacher, setSelectedTeacher] = useState<number | ''>('');
  
  // Alert states
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  
  // Loading states
  const [loading, setLoading] = useState<boolean>(true);
  
  // Helper function to show alerts
  const showNotification = (message: string, type: 'success' | 'error') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };
  
  // Fetch teacher data and timetable
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!user || !user.teacherId) {
          showNotification('No teacher data found for this user', 'error');
          setLoading(false);
          return;
        }
        
        // Get teacher data
        const teacherId = parseInt(user.teacherId);
        
        // Fetch teacher data (assuming the teacher is in the teachers list)
        const teachersList = await timetableService.getTeachers();
        const teacher = teachersList.find(t => t.id === teacherId);
        if (teacher) {
          setTeacherData(teacher);
        }
        
        // Fetch teacher timetable using the service
        const teacherTimetableData = await timetableService.getTeacherTimetable();
        if (teacherTimetableData) {
          setTeacherTimetable(teacherTimetableData);
        }
        
        // Fetch class teacher assignments
        const assignments = await timetableService.getClassTeachers();
        const teacherAssignments = assignments.filter(a => a.teacherId === teacherId);
        setClassTeacherAssignments(teacherAssignments);
        setIsClassTeacher(teacherAssignments.length > 0);
        
        if (teacherAssignments.length > 0) {
          setSelectedAssignment(teacherAssignments[0]);
          
          // Fetch additional data for class teacher
          const [subjectsList, teachersList, timeSlotsList] = await Promise.all([
            timetableService.getSubjects(),
            timetableService.getTeachers(),
            timetableService.getTimeSlots()
          ]);
          
          setSubjects(subjectsList);
          setTeachers(teachersList);
          setTimeSlots(timeSlotsList);
          
          // Get current academic year and term (could be from a settings API)
          const academicYear = "2023-2024";
          const term = "First Term";
          
          // Try to fetch timetable for the assigned class/section
          try {
            const timetableData = await timetableService.getTimetable(
              teacherAssignments[0].classId,
              teacherAssignments[0].sectionId,
              academicYear,
              term
            );
            
            if (timetableData) {
              setTimetable(timetableData);
            }
          } catch (error) {
            // Timetable might not exist yet, which is fine
            console.error('No timetable found for this class/section:', error);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching teacher data:', error);
        showNotification('Error fetching data. Please try again.', 'error');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  const handleAssignmentChange = async (assignmentId: number) => {
    const assignment = classTeacherAssignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    
    setSelectedAssignment(assignment);
    
    // Get current academic year and term (could be from a settings API)
    const academicYear = "2023-2024";
    const term = "First Term";
    
    // Try to fetch timetable for the selected class/section
    try {
      const timetableData = await timetableService.getTimetable(
        assignment.classId,
        assignment.sectionId,
        academicYear,
        term
      );
      
      if (timetableData) {
        setTimetable(timetableData);
      } else {
        setTimetable(null);
      }
    } catch (error) {
      // Timetable might not exist yet
      setTimetable(null);
      console.error('No timetable found for this class/section:', error);
    }
  };
  
  const createTimetable = async () => {
    if (!selectedAssignment) return;
    
    try {
      setLoading(true);
      
      // Get current academic year and term (could be from a settings API)
      const academicYear = "2023-2024";
      const term = "First Term";
      
      const timetableData = await timetableService.createTimetable(
        selectedAssignment.classId,
        selectedAssignment.sectionId,
        academicYear,
        term
      );
      
      if (timetableData) {
        setTimetable(timetableData);
        showNotification('Timetable created successfully', 'success');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error creating timetable:', error);
      showNotification('Error creating timetable. Please try again.', 'error');
      setLoading(false);
    }
  };
  
  const handleOpenPeriodDialog = () => {
    setPeriodDialogOpen(true);
  };
  
  const handleClosePeriodDialog = () => {
    setPeriodDialogOpen(false);
    setSelectedDay('Monday');
    setSelectedTimeSlot('');
    setSelectedSubject('');
    setSelectedTeacher('');
  };
  
  const handleAddPeriod = async () => {
    if (!timetable || !selectedDay || selectedTimeSlot === '' || selectedSubject === '' || selectedTeacher === '') {
      showNotification('Please fill all required fields', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      // Convert selectedDay to dayOfWeek number
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek = daysOfWeek.indexOf(selectedDay);
      
      if (dayOfWeek === -1) {
        throw new Error('Invalid day selected');
      }
      
      const success = await timetableService.addPeriod(
        timetable.id,
        dayOfWeek,
        Number(selectedTimeSlot),
        Number(selectedSubject),
        Number(selectedTeacher),
        timetable.classId,
        timetable.sectionId
      );
      
      if (success) {
        // Refresh timetable data
        const updatedTimetable = await timetableService.getTimetableById(timetable.id);
        if (updatedTimetable) {
          setTimetable(updatedTimetable);
        }
        showNotification('Period added successfully', 'success');
        
        // Also refresh teacher's own timetable view
        const teacherTimetableData = await timetableService.getTeacherTimetable();
        if (teacherTimetableData) {
          setTeacherTimetable(teacherTimetableData);
        }
      }
      
      handleClosePeriodDialog();
      setLoading(false);
    } catch (error) {
      console.error('Error adding period:', error);
      showNotification('Error adding period. Please try again.', 'error');
      setLoading(false);
    }
  };
  
  const handleDeletePeriod = async (periodId: number) => {
    if (!window.confirm('Are you sure you want to delete this period?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const success = await timetableService.deletePeriod(periodId);
      
      if (success) {
        // Refresh timetable data
        if (timetable) {
          const updatedTimetable = await timetableService.getTimetableById(timetable.id);
          if (updatedTimetable) {
            setTimetable(updatedTimetable);
          }
        }
        
        // Also refresh teacher's own timetable view
        const teacherTimetableData = await timetableService.getTeacherTimetable();
        if (teacherTimetableData) {
          setTeacherTimetable(teacherTimetableData);
        }
        
        showNotification('Period deleted successfully', 'success');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error deleting period:', error);
      showNotification('Error deleting period. Please try again.', 'error');
      setLoading(false);
    }
  };
  
  // Organize periods by day and time for class teacher view
  const organizePeriodsForDisplay = () => {
    if (!timetable || !timetable.periods || timeSlots.length === 0) {
      return null;
    }
    
    return timetableService.organizePeriodsForDisplay(timetable, timeSlots);
  };
  
  const periodGrid = organizePeriodsForDisplay();
  
  // For teacher's personal timetable
  const renderTeacherSchedule = () => {
    if (!teacherTimetable) return null;
    
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
  
  if (loading && !teacherData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-[#EEF5FF]">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Timetable</h1>
      
      {/* Teacher's personal timetable */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">My Schedule</h2>
        
        {teacherTimetable ? (
          renderTeacherSchedule()
        ) : (
          <div className="p-4 bg-blue-50 text-blue-800 rounded-md">
            No schedule found. Please contact the administrator.
          </div>
        )}
      </div>
      
      {/* Class Teacher Timetable Management (only shown for class teachers) */}
      {isClassTeacher && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Class Teacher - Timetable Management</h2>
          
          {classTeacherAssignments.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
              <select
                value={selectedAssignment?.id || ''}
                onChange={(e) => handleAssignmentChange(Number(e.target.value))}
                className="w-full md:w-64 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {classTeacherAssignments.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.class.name} - {assignment.section.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {selectedAssignment && (
            <>
              {!timetable ? (
                <div className="mb-4">
                  <div className="p-4 mb-4 bg-blue-50 text-blue-800 rounded-md">
                    No timetable exists for {selectedAssignment.class.name} - {selectedAssignment.section.name} yet.
                  </div>
                  <button 
                    onClick={createTimetable}
                    disabled={loading}
                    className={`px-4 py-2 rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#292648] hover:bg-[#3b3664]'}`}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                        Creating...
                      </span>
                    ) : (
                      'Create Timetable'
                    )}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col md:flex-row justify-between mb-4">
                    <h3 className="text-lg font-medium mb-2 md:mb-0">
                      Timetable for {timetable.class?.name} - {timetable.section?.name}
                    </h3>
                    <button
                      onClick={handleOpenPeriodDialog}
                      className="px-4 py-2 bg-[#292648] text-white rounded-md hover:bg-[#3b3664] flex items-center"
                    >
                      <span className="mr-1">+</span> Add Period
                    </button>
                  </div>
                  
                  {periodGrid && periodGrid.length > 0 ? (
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
                                        onClick={() => handleDeletePeriod((row[day] as Period).id)}
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
                  ) : (
                    <div className="p-4 bg-blue-50 text-blue-800 rounded-md">
                      No periods added yet. Click 'Add Period' to add periods to the timetable.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {/* Dialog for adding a period */}
      {periodDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add Period</h3>
              <button onClick={handleClosePeriodDialog} className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                <select
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Time Slot</option>
                  {timeSlots
                    .filter((slot) => !slot.isBreak)
                    .map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.startTime} - {slot.endTime}
                      </option>
                    ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-2">
              <button 
                onClick={handleClosePeriodDialog}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddPeriod}
                disabled={loading}
                className={`px-4 py-2 rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#292648] hover:bg-[#3b3664]'}`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                    Adding...
                  </span>
                ) : (
                  'Add Period'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Alert notification */}
      {showAlert && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
          alertType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className="flex justify-between items-center">
            <span>{alertMessage}</span>
            <button 
              onClick={() => setShowAlert(false)}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherTimetable; 