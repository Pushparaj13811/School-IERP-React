import { toast } from 'react-toastify';
import { academicAPI, timetableAPI, teacherAPI } from './api';

// Export types from the service
export interface Class {
  id: number;
  name: string;
}

export interface Section {
  id: number;
  name: string;
  classId: number;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
}

export interface Teacher {
  id: number;
  name: string;
  email: string;
  user?: {
    name: string;
  };
}

export interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  breakType: string | null;
}

export interface Period {
  id: number;
  dayOfWeek: number;
  timeSlotId: number;
  subjectId: number;
  teacherId: number;
  classId: number;
  sectionId: number;
  timetableId: number;
  timeSlot: TimeSlot;
  subject: Subject;
  teacher: {
    id: number;
    name: string;
    user?: {
      name: string;
    };
  };
}

export interface Timetable {
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
  periods?: Period[];
}

export interface ClassTeacherAssignment {
  id: number;
  teacherId: number;
  classId: number;
  sectionId: number;
  teacher: {
    id: number;
    name: string;
    email: string;
  };
  class: {
    id: number;
    name: string;
  };
  section: {
    id: number;
    name: string;
  };
}

// API response type - kept for type compatibility
export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

// Custom type for grid row
export interface TimetableRow {
  timeSlot: TimeSlot;
  [key: string]: Period | TimeSlot | null;
}

// Define teacher's timetable interface
export interface TeacherTimetable {
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

// Define API data types for conversion
interface ApiTimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  breakType: string | null;
}

// Interface for user data from API
interface UserLike {
  name?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string | { url: string };
  [key: string]: unknown;
}

interface ApiPeriod {
  id: number;
  dayOfWeek: number;
  timeSlotId: number;
  subjectId: number;
  teacherId: number;
  classId: number;
  sectionId: number;
  timetableId: number;
  timeSlot?: ApiTimeSlot;
  subject?: { id: number; name: string; code: string };
  teacher?: { 
    id: number; 
    name: string;
    user?: UserLike;
  };
}

interface ApiTimetable {
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
  periods?: ApiPeriod[];
}

// Helper function to convert API types to service types
function convertApiTimeSlot(apiTimeSlot: ApiTimeSlot): TimeSlot {
  return {
    id: apiTimeSlot.id,
    startTime: apiTimeSlot.startTime,
    endTime: apiTimeSlot.endTime,
    isBreak: apiTimeSlot.isBreak,
    breakType: apiTimeSlot.breakType
  };
}

function convertApiPeriod(apiPeriod: ApiPeriod): Period {
  return {
    id: apiPeriod.id,
    dayOfWeek: apiPeriod.dayOfWeek,
    timeSlotId: apiPeriod.timeSlotId,
    subjectId: apiPeriod.subjectId,
    teacherId: apiPeriod.teacherId,
    classId: apiPeriod.classId,
    sectionId: apiPeriod.sectionId,
    timetableId: apiPeriod.timetableId,
    timeSlot: apiPeriod.timeSlot ? convertApiTimeSlot(apiPeriod.timeSlot) : {
      id: 0,
      startTime: '',
      endTime: '',
      isBreak: false,
      breakType: null
    },
    subject: apiPeriod.subject || { id: 0, name: '', code: '' },
    teacher: {
      id: apiPeriod.teacher?.id || 0,
      name: apiPeriod.teacher?.name || '',
      // Check if user exists and has a name property
      user: apiPeriod.teacher?.user && typeof apiPeriod.teacher.user === 'object' && 'name' in apiPeriod.teacher.user 
        ? { name: String(apiPeriod.teacher.user.name) } 
        : undefined
    }
  };
}

function convertApiTimetable(apiTimetable: ApiTimetable): Timetable {
  return {
    id: apiTimetable.id,
    classId: apiTimetable.classId,
    sectionId: apiTimetable.sectionId,
    academicYear: apiTimetable.academicYear,
    term: apiTimetable.term,
    class: apiTimetable.class,
    section: apiTimetable.section,
    periods: apiTimetable.periods ? apiTimetable.periods.map(convertApiPeriod) : undefined
  };
}

class TimetableService {
  // Get all classes
  async getClasses(): Promise<Class[]> {
    try {
      const response = await academicAPI.getClasses();
      return response.data?.data?.classes || [];
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
      return [];
    }
  }

  // Get sections for a class
  async getSections(classId: number): Promise<Section[]> {
    try {
      const response = await academicAPI.getSections(classId);
      return response.data?.data?.sections || [];
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast.error('Failed to load sections');
      return [];
    }
  }

  // Get all subjects
  async getSubjects(): Promise<Subject[]> {
    try {
      const response = await academicAPI.getSubjects();
      return response.data?.data?.subjects || [];
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
      return [];
    }
  }

  // Get all teachers
  async getTeachers(): Promise<Teacher[]> {
    try {
      const response = await teacherAPI.getAll();
      const apiTeachers = response.data?.data?.teachers || [];
      
      // Convert the API teachers to our Teacher format
      return apiTeachers.map(teacher => ({
        id: teacher.id,
        name: teacher.name || '',
        email: teacher.email || '',
        // Safe access to user properties
        user: teacher.user && typeof teacher.user === 'object' && 'name' in teacher.user 
          ? { name: String(teacher.user.name) } 
          : undefined
      }));
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load teachers');
      return [];
    }
  }

  // Get all time slots
  async getTimeSlots(): Promise<TimeSlot[]> {
    try {
      const response = await timetableAPI.getTimeSlots();
      const apiTimeSlots = response.data?.data || [];
      return apiTimeSlots.map(slot => convertApiTimeSlot(slot as ApiTimeSlot));
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast.error('Failed to load time slots');
      return [];
    }
  }

  // Get class teacher assignments
  async getClassTeachers(): Promise<ClassTeacherAssignment[]> {
    try {
      const response = await teacherAPI.getClassTeacherAssignments();
      return response.data?.data?.assignments || [];
    } catch (error) {
      console.error('Error fetching class teachers:', error);
      toast.error('Failed to load class teacher assignments');
      return [];
    }
  }

  // Get timetable by query
  async getTimetable(classId: number, sectionId: number, academicYear: string, term: string): Promise<Timetable | null> {
    try {
      const response = await timetableAPI.getTimetable({
        classId,
        sectionId,
        academicYear,
        term
      });
      const apiTimetable = response.data?.data;
      if (!apiTimetable) return null;
      
      return convertApiTimetable(apiTimetable as ApiTimetable);
    } catch (error) {
      const apiError = error as {response?: {status: number}};
      if (apiError.response && apiError.response.status === 404) {
        // Timetable doesn't exist yet - this is okay
        return null;
      }
      console.error('Error fetching timetable:', error);
      toast.error('Failed to load timetable');
      return null;
    }
  }

  // Get timetable by ID
  async getTimetableById(id: number): Promise<Timetable | null> {
    try {
      const response = await timetableAPI.getTimetableById(id);
      const apiTimetable = response.data?.data;
      if (!apiTimetable) return null;
      
      return convertApiTimetable(apiTimetable as ApiTimetable);
    } catch (error) {
      console.error('Error fetching timetable by ID:', error);
      toast.error('Failed to load timetable');
      return null;
    }
  }

  // Create a new timetable
  async createTimetable(classId: number, sectionId: number, academicYear: string, term: string): Promise<Timetable | null> {
    try {
      const response = await timetableAPI.createTimetable({
        classId,
        sectionId,
        academicYear,
        term
      });
      
      const apiTimetable = response.data?.data;
      if (!apiTimetable) return null;
      
      toast.success('Timetable created successfully');
      return convertApiTimetable(apiTimetable as ApiTimetable);
    } catch (error) {
      console.error('Error creating timetable:', error);
      toast.error('Failed to create timetable');
      return null;
    }
  }

  // Add a period to a timetable
  async addPeriod(
    timetableId: number,
    dayOfWeek: number,
    timeSlotId: number,
    subjectId: number,
    teacherId: number,
    classId: number,
    sectionId: number
  ): Promise<boolean> {
    try {
      await timetableAPI.addPeriod({
        timetableId,
        dayOfWeek,
        timeSlotId,
        subjectId,
        teacherId,
        classId,
        sectionId
      });
      toast.success('Period added successfully');
      return true;
    } catch (error) {
      console.error('Error adding period:', error);
      toast.error('Failed to add period');
      return false;
    }
  }

  // Delete a period
  async deletePeriod(periodId: number): Promise<boolean> {
    try {
      await timetableAPI.deletePeriod(periodId);
      toast.success('Period deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting period:', error);
      toast.error('Failed to delete period');
      return false;
    }
  }

  // Add a time slot
  async addTimeSlot(
    startTime: string,
    endTime: string,
    isBreak: boolean,
    breakType: string | null
  ): Promise<boolean> {
    try {
      await timetableAPI.addTimeSlot({
        startTime,
        endTime,
        isBreak,
        breakType: isBreak ? breakType : null
      });
      toast.success('Time slot added successfully');
      return true;
    } catch (error) {
      console.error('Error adding time slot:', error);
      toast.error('Failed to add time slot');
      return false;
    }
  }

  // Organize periods by day and time for display
  organizePeriodsForDisplay(timetable: Timetable | null, timeSlots: TimeSlot[]): TimetableRow[] | null {
    if (!timetable || !timetable.periods || !timeSlots.length) {
      return null;
    }

    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    // Create a grid with time slots as rows and days as columns
    const grid = timeSlots.map((timeSlot) => {
      const row: TimetableRow = {
        timeSlot,
      };

      // Initialize each day with null
      daysOfWeek.forEach((day) => {
        row[day] = null;
      });

      // Fill in periods where they exist
      if (timetable.periods) {
        timetable.periods.forEach((period) => {
          if (period.timeSlotId === timeSlot.id) {
            const day = daysOfWeek[period.dayOfWeek];
            row[day] = period;
          }
        });
      }

      return row;
    });

    return grid;
  }

  // Get day name from index
  getDayName(dayIndex: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  }

  // Get teacher's timetable
  async getTeacherTimetable(): Promise<TeacherTimetable | null> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/v1/timetables/teacher`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch teacher timetable: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.status === 'success') {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching teacher timetable:', error);
      toast.error('Failed to load teacher timetable');
      return null;
    }
  }
}

export const timetableService = new TimetableService();
export default timetableService; 