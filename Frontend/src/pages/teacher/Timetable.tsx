import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import timetableService, { 
  Subject, 
  Teacher, 
  TimeSlot, 
  Timetable, 
  ClassTeacherAssignment,
  TeacherTimetable as TeacherTimetableType
} from '../../services/timetableService';
import Notification from '../../components/ui/Notification';
import TeacherScheduleView from '../../components/timetable/TeacherScheduleView';
import ClassTeacherManager from '../../components/timetable/ClassTeacherManager';
import PeriodDialog from '../../components/timetable/PeriodDialog';

// Update the User interface to include teacherId
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  teacherId?: string;  // Added optional teacherId property
}

const TeacherTimetable: React.FC = () => {
  const { user } = useAuth() as { user: User | null };
  const [teacherData, setTeacherData] = useState<Teacher | null>(null);
  const [teacherTimetable, setTeacherTimetable] = useState<TeacherTimetableType | null>(null);
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
        
        // Only proceed if user data is loaded
        if (!user) {
          setLoading(false);
          return;
        }
        
        // Check if user has a teacher role - make this case insensitive
        const isTeacherUser = user.role.toUpperCase() === 'TEACHER' || 
                             user.role.toUpperCase().includes('TEACHER');
        
        if (!isTeacherUser) {
          showNotification('Only teachers can access this page', 'error');
          setLoading(false);
          return;
        }
        
        console.log("Teacher user detected:", user);
        
        // Fetch teacher data from the teachers list
        const teachersList = await timetableService.getTeachers();
        console.log("Teachers list:", teachersList);
        
        // Look for a teacher with matching email or ID
        let teacherId: number | null = null;
        let matchedTeacher: Teacher | undefined;
        
        if (user.teacherId) {
          teacherId = parseInt(user.teacherId);
          matchedTeacher = teachersList.find(t => t.id === teacherId);
        }
        
        // If no match by ID, try with email
        if (!matchedTeacher) {
          matchedTeacher = teachersList.find(t => 
            t.email.toLowerCase() === user.email.toLowerCase() ||
            (t.user && t.user.name && t.user.name.toLowerCase() === (user.firstName + ' ' + user.lastName).toLowerCase())
          );
          
          if (matchedTeacher) {
            teacherId = matchedTeacher.id;
          }
        }
        
        // If still no match, just use the first teacher (for testing purposes)
        if (!matchedTeacher && teachersList.length > 0) {
          console.log("No exact teacher match found, using first teacher for testing");
          matchedTeacher = teachersList[0];
          teacherId = matchedTeacher.id;
        }
        
        if (matchedTeacher) {
          setTeacherData(matchedTeacher);
          console.log("Selected teacher:", matchedTeacher);
        } else {
          showNotification('Teacher data not found for this user', 'error');
        }
        
        // Fetch teacher timetable
        try {
          console.log("Fetching teacher timetable...");
          const teacherTimetableData = await timetableService.getTeacherTimetable();
          console.log("Teacher timetable response:", teacherTimetableData);
          
          if (teacherTimetableData) {
            setTeacherTimetable(teacherTimetableData);
          } else {
            console.log("No timetable data returned");
          }
        } catch (timetableError) {
          console.error("Error fetching timetable:", timetableError);
        }
        
        if (teacherId) {
          // Fetch class teacher assignments
          console.log("Fetching class teacher timetable for teacherId:", teacherId);
          const assignments = await timetableService.getClassTeachers();
          console.log("Class teacher assignments:", assignments);
          
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
      setLoading(true);
      const timetableData = await timetableService.getTimetable(
        assignment.classId,
        assignment.sectionId,
        academicYear,
        term
      );
      
      setTimetable(timetableData);
      setLoading(false);
    } catch (error) {
      // Timetable might not exist yet
      setTimetable(null);
      console.error('No timetable found for this class/section:', error);
      setLoading(false);
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
    if (!timetable && !selectedAssignment) {
      showNotification('No timetable or class selected', 'error');
      return;
    }
    
    if (!selectedDay || selectedTimeSlot === '' || selectedSubject === '' || selectedTeacher === '') {
      showNotification('Please fill all required fields', 'error');
      return;
    }

    try {
      setLoading(true);
      
      // Convert selectedDay to dayOfWeek number
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek = daysOfWeek.indexOf(selectedDay);
      
      console.log("Adding period for day:", selectedDay, "day index:", dayOfWeek);
      
      if (dayOfWeek === -1) {
        throw new Error('Invalid day selected');
      }

      // Create timetable if it doesn't exist yet
      let currentTimetable = timetable;
      
      if (!currentTimetable && selectedAssignment) {
        // Get current academic year and term
        const academicYear = "2023-2024"; 
        const term = "First Term";
        
        showNotification('Creating new timetable automatically...', 'success');
        currentTimetable = await timetableService.createTimetable(
          selectedAssignment.classId,
          selectedAssignment.sectionId,
          academicYear,
          term
        );
        
        if (!currentTimetable) {
          throw new Error('Failed to create timetable');
        }
        
        setTimetable(currentTimetable);
      }
      
      if (!currentTimetable) {
        throw new Error('No timetable available');
      }
      
      const success = await timetableService.addPeriod(
        currentTimetable.id,
        dayOfWeek,
        Number(selectedTimeSlot),
        Number(selectedSubject),
        Number(selectedTeacher),
        currentTimetable.classId,
        currentTimetable.sectionId
      );
      
      if (success) {
        // Refresh timetable data
        const updatedTimetable = await timetableService.getTimetableById(currentTimetable.id);
        if (updatedTimetable) {
          setTimetable(updatedTimetable);
        }
        showNotification('Period added successfully', 'success');
        
        // Also refresh teacher's own timetable view
        const teacherTimetableData = await timetableService.getTeacherTimetable();
        if (teacherTimetableData) {
          setTeacherTimetable(teacherTimetableData);
        }
        
        // Reset selected values
        handleClosePeriodDialog();
      }
    } catch (error) {
      const apiError = error as { message?: string };
      console.error('Error adding period:', error);
      
      // Extract error message for user-friendly display
      let errorMessage = 'Error adding period. Please try again.';
      
      if (apiError.message) {
        if (apiError.message.includes('Teacher is already assigned')) {
          errorMessage = 'This teacher is already assigned to another class during this time slot.';
        } else if (apiError.message.includes('Subject is already assigned')) {
          errorMessage = 'This subject is already assigned to another class during this time slot.';
        } else {
          // Use the original error message if available
          errorMessage = apiError.message;
        }
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeletePeriod = async (periodId: number) => {
    if (!window.confirm('Are you sure you want to delete this period? This action cannot be undone.')) {
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
    } catch (error) {
      console.error('Error deleting period:', error);
      showNotification('Error deleting period. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Organize periods by day and time for class teacher view
  const periodGrid = timetableService.organizePeriodsForDisplay(timetable, timeSlots);
  
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
        <TeacherScheduleView teacherTimetable={teacherTimetable} />
      </div>
      
      {/* Class Teacher Timetable Management */}
      <ClassTeacherManager
        isClassTeacher={isClassTeacher}
        classTeacherAssignments={classTeacherAssignments}
        selectedAssignment={selectedAssignment}
        timetable={timetable}
        loading={loading}
        periodGrid={periodGrid}
        onAssignmentChange={handleAssignmentChange}
        onCreateTimetable={createTimetable}
        onOpenPeriodDialog={handleOpenPeriodDialog}
        onDeletePeriod={handleDeletePeriod}
      />
      
      {/* Dialog for adding a period */}
      <PeriodDialog
        open={periodDialogOpen}
        onClose={handleClosePeriodDialog}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        selectedTimeSlot={selectedTimeSlot}
        setSelectedTimeSlot={setSelectedTimeSlot}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        selectedTeacher={selectedTeacher}
        setSelectedTeacher={setSelectedTeacher}
        onAddPeriod={handleAddPeriod}
        loading={loading}
        timeSlots={timeSlots}
        subjects={subjects}
        teachers={teachers}
      />
      
      {/* Alert notification */}
      <Notification
        show={showAlert}
        message={alertMessage}
        type={alertType}
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
};

export default TeacherTimetable; 