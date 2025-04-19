import React, { useEffect, useState } from 'react';
import { format, isAfter, parseISO } from 'date-fns';
import { attendanceAPI, userAPI, teacherAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Student as ApiStudent } from '../../types/api';
import Button from '../../components/ui/Button';

interface Student {
  id: number;
  name: string;
  rollNo: string;
  classId: number;
  sectionId: number;
  className: string;
  sectionName: string;
  profileImage?: string;
}

interface ClassTeacherAssignment {
  id: number;
  classId: number;
  sectionId: number;
  class: {
    id: number;
    name: string;
  };
  section: {
    id: number;
    name: string;
  };
}

interface AttendanceRecord {
  studentId: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'EXCUSED';
  remarks?: string;
  classId: number;
  sectionId: number;
}

interface AttendanceForm {
  date: string;
  records: AttendanceRecord[];
}

// Group students by class and section
interface GroupedStudents {
  [key: string]: {
    classId: number;
    sectionId: number;
    className: string;
    sectionName: string;
    students: Student[];
  }
}

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const [assignedClasses, setAssignedClasses] = useState<ClassTeacherAssignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [groupedStudents, setGroupedStudents] = useState<GroupedStudents>({});
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [attendanceForm, setAttendanceForm] = useState<AttendanceForm>({
    date: format(new Date(), 'yyyy-MM-dd'),
    records: []
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [remarkText, setRemarkText] = useState<string>('');
  const [holidays, setHolidays] = useState<{date: string, name: string}[]>([]);
  const [isHoliday, setIsHoliday] = useState<boolean>(false);
  const [holidayName, setHolidayName] = useState<string>('');

  // Fetch classes assigned to the teacher as class teacher and their students
  useEffect(() => {
    const fetchClassTeacherData = async () => {
      try {
        setLoading(true);
        setError(null);

        // We need the teacher ID from the user object
        if (!user?.teacher?.id) {
          setError('Teacher information not available');
          return;
        }

        // Fetch the class teacher assignments for this teacher
        const assignmentsRes = await teacherAPI.getClassTeacherAssignments();

        if (assignmentsRes.data?.status !== 'success' || !assignmentsRes.data?.data?.assignments?.length) {
          setError('You are not assigned as class teacher to any class');
          setLoading(false);
          return;
        }

        const assignments = assignmentsRes.data.data.assignments;
        setAssignedClasses(assignments);
        
        // Fetch all students for all assigned classes and sections
        const allStudents: Student[] = [];
        const newGroupedStudents: GroupedStudents = {};
        
        // Fetch students for each class/section assignment
        const studentPromises = assignments.map(async (assignment) => {
          try {
            const studentsRes = await userAPI.getStudents({
              classId: assignment.classId,
              sectionId: assignment.sectionId
            });
            
            if (studentsRes.data?.status === 'success' && studentsRes.data.data.students?.length > 0) {
              const classStudents = studentsRes.data.data.students.map((student: ApiStudent) => ({
                id: student.id,
                name: student.name,
                rollNo: student.rollNo || '',
                classId: assignment.classId,
                sectionId: assignment.sectionId,
                className: assignment.class.name,
                sectionName: assignment.section.name,
                profileImage: undefined
              }));
              
              // Add to all students array
              allStudents.push(...classStudents);
              
              // Group by class and section
              const groupKey = `${assignment.classId}-${assignment.sectionId}`;
              newGroupedStudents[groupKey] = {
                classId: assignment.classId,
                sectionId: assignment.sectionId,
                className: assignment.class.name,
                sectionName: assignment.section.name,
                students: classStudents
              };
            }
          } catch (err) {
            console.error(`Error fetching students for class ${assignment.classId}, section ${assignment.sectionId}:`, err);
          }
        });
        
        // Wait for all student fetch operations to complete
        await Promise.all(studentPromises);
        
        setStudents(allStudents);
        setGroupedStudents(newGroupedStudents);
        
        // Fetch attendance data for all students on the selected date
        fetchAttendanceData(allStudents, assignments);
        
        // Mock holidays until API endpoint is available
        // This would be replaced with the actual API call when implemented
        const mockHolidays = [
          { date: '2025-04-14', name: 'New Year Holiday' },
          { date: '2025-04-25', name: 'School Foundation Day' },
          { date: '2025-04-30', name: 'Labor Day' }
        ];
        setHolidays(mockHolidays);
        
      } catch (err) {
        console.error('Error fetching class teacher data:', err);
        setError('Failed to load assigned classes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchClassTeacherData();
  }, [user]);

  // Check if selected date is a holiday or in future when date changes
  useEffect(() => {
    // Check if selected date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateObj = parseISO(selectedDate);
    
    if (isAfter(selectedDateObj, today)) {
      setError('Cannot mark attendance for future dates');
      return;
    }

    // Check if selected date is a holiday
    const holiday = holidays.find(h => h.date === selectedDate);
    if (holiday) {
      setIsHoliday(true);
      setHolidayName(holiday.name);
      setError(`Cannot mark attendance on ${holiday.name} (Holiday)`);
    } else {
      setIsHoliday(false);
      setHolidayName('');
      setError(null);
    }

    // Fetch attendance data if date is valid
    if (!isAfter(selectedDateObj, today) && !holiday) {
      if (students.length > 0 && assignedClasses.length > 0) {
        fetchAttendanceData(students, assignedClasses);
      }
    }
  }, [selectedDate, holidays, students, assignedClasses]);

  const fetchAttendanceData = async (studentsList: Student[], assignments: ClassTeacherAssignment[]) => {
    try {
      setLoading(true);
      
      // Initialize records with default PRESENT status
      let initialRecords: AttendanceRecord[] = studentsList.map(student => ({
        studentId: student.id,
        status: 'PRESENT' as const,
        remarks: '',
        classId: student.classId,
        sectionId: student.sectionId
      }));
      
      // Fetch attendance for each class/section
      const attendancePromises = assignments.map(async (assignment) => {
        try {
          const attendanceRes = await attendanceAPI.getDailyAttendance({
            date: selectedDate,
            classId: assignment.classId,
            sectionId: assignment.sectionId
          });
          
          if (attendanceRes.data?.status === 'success' && 
              attendanceRes.data.data.attendance && 
              attendanceRes.data.data.attendance.length > 0) {
            
            // Get student IDs for this class/section
            const classStudentsIds = studentsList
              .filter(s => s.classId === assignment.classId && s.sectionId === assignment.sectionId)
              .map(s => s.id);
            
            // Update records for students in this class/section
            attendanceRes.data.data.attendance.forEach((record: {
              studentId: number;
              status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'EXCUSED';
              remarks?: string;
            }) => {
              if (classStudentsIds.includes(record.studentId)) {
                // Update the record in our initial records array
                initialRecords = initialRecords.map(r => 
                  r.studentId === record.studentId 
                    ? { 
                        ...r, 
                        status: record.status, 
                        remarks: record.remarks || '' 
                      } 
                    : r
                );
              }
            });
          }
        } catch (err) {
          console.error(`Error fetching attendance for class ${assignment.classId}, section ${assignment.sectionId}:`, err);
        }
      });
      
      await Promise.all(attendancePromises);
      
      setAttendanceForm({
        date: selectedDate,
        records: initialRecords
      });
      
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setError('Failed to load attendance data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    
    // Validate date is not in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateObj = parseISO(newDate);
    
    if (isAfter(selectedDateObj, today)) {
      setError('Cannot mark attendance for future dates');
    } else {
      setError(null);
    }
    
    setSelectedDate(newDate);
  };

  const handleStatusChange = (studentId: number, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'EXCUSED') => {
    setAttendanceForm(prev => ({
      ...prev,
      records: prev.records.map(record => 
        record.studentId === studentId 
          ? { ...record, status } 
          : record
      )
    }));
  };

  const openRemarkDialog = (studentId: number) => {
    const record = attendanceForm.records.find(r => r.studentId === studentId);
    setSelectedStudent(studentId);
    setRemarkText(record?.remarks || '');
    setDialogOpen(true);
  };

  const saveRemark = () => {
    if (selectedStudent) {
      setAttendanceForm(prev => ({
        ...prev,
        records: prev.records.map(record => 
          record.studentId === selectedStudent 
            ? { ...record, remarks: remarkText } 
            : record
        )
      }));
    }
    setDialogOpen(false);
  };

  const saveAttendance = async () => {
    try {
      // Validate date is not in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateObj = parseISO(selectedDate);
      
      if (isAfter(selectedDateObj, today)) {
        setError('Cannot mark attendance for future dates');
        return;
      }

      // Check if selected date is a holiday
      if (isHoliday) {
        setError(`Cannot mark attendance on ${holidayName} (Holiday)`);
        return;
      }

      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Group records by class and section
      const recordsByClass: { [key: string]: AttendanceRecord[] } = {};
      
      attendanceForm.records.forEach(record => {
        const key = `${record.classId}-${record.sectionId}`;
        if (!recordsByClass[key]) {
          recordsByClass[key] = [];
        }
        recordsByClass[key].push(record);
      });
      
      // Save attendance for each class/section group
      const savePromises = Object.entries(recordsByClass).map(async ([key, records]) => {
        const [classId, sectionId] = key.split('-').map(Number);
        
        // Log the data being sent to help debug
        console.log(`Saving attendance for class ${classId}, section ${sectionId}:`, {
          date: selectedDate,
          classId,
          sectionId,
          attendanceData: records.map(({ studentId, status, remarks }) => ({
            studentId,
            status,
            remarks
          }))
        });
        
        await attendanceAPI.markDailyAttendance({
          date: selectedDate,
          classId,
          sectionId,
          attendanceData: records.map(({ studentId, status, remarks }) => ({
            studentId,
            status,
            remarks
          }))
        });
      });
      
      await Promise.all(savePromises);
      
      setSuccess('Attendance saved successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving attendance:', error);
      setError('Failed to save attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800 border-green-400';
      case 'ABSENT':
        return 'bg-red-100 text-red-800 border-red-400';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-400';
      case 'HALF_DAY':
        return 'bg-orange-100 text-orange-800 border-orange-400';
      case 'EXCUSED':
        return 'bg-blue-100 text-blue-800 border-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-400';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Attendance Management</h1>
      
      {/* Filters - Only date selection remains */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-xs">
            <label htmlFor="date-select" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              id="date-select"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full p-2 border rounded-md"
              max={format(new Date(), 'yyyy-MM-dd')} // Prevent selecting future dates
            />
            {isHoliday && (
              <p className="mt-1 text-sm text-red-500">
                Holiday: {holidayName}
              </p>
            )}
          </div>
          
          <div>
            <Button
              variant="primary"
              onClick={saveAttendance}
              disabled={saving || students.length === 0 || isHoliday || isAfter(parseISO(selectedDate), new Date())}
              className={`px-4 py-2 rounded-md text-white flex items-center gap-2 ${
                saving || students.length === 0 || isHoliday || isAfter(parseISO(selectedDate), new Date())
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#292648] hover:bg-[#3b3664]'
              }`}   
            >
              {saving ? 'Saving...' : 'Save All Attendance'}
            </Button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : Object.keys(groupedStudents).length > 0 ? (
        <div className="space-y-8">
          {Object.values(groupedStudents).map(group => (
            <div key={`${group.classId}-${group.sectionId}`} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-50 p-4 border-b">
                <h2 className="text-lg font-semibold">
                  {group.className} - {group.sectionName}
                </h2>
              </div>
              
              {group.students.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Roll No.
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {group.students.map((student) => {
                        const record = attendanceForm.records.find(r => r.studentId === student.id);
                        
                        return (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.rollNo}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-2">
                                {['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'EXCUSED'].map((status) => (
                                  <Button
                                    key={status}
                                    variant="primary"
                                    onClick={() => handleStatusChange(student.id, status as 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'EXCUSED')}
                                    className={`px-3 py-1 text-xs rounded-full border ${
                                      record?.status === status
                                        ? getStatusColor(status)
                                        : 'border-gray-300 hover:bg-gray-100 text-blue-50'
                                    }`}
                                  >
                                    {status}
                                  </Button>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Button 
                                variant="primary"
                                onClick={() => openRemarkDialog(student.id)}
                              >
                                {record?.remarks ? 'Edit Remark' : 'Add Remark'}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No students found in this class/section.
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-blue-100 text-blue-700 rounded-md">
          You are not assigned as class teacher to any class, or no students were found in your assigned classes.
        </div>
      )}
      
      {/* Remarks Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">Add Remark</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add a remark for student's attendance:
            </p>
            <textarea
              rows={3}
              value={remarkText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRemarkText(e.target.value)}
              className="w-full p-2 border rounded-md mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="danger"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="primary"
                onClick={saveRemark}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;