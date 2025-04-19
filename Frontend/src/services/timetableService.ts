import { toast } from 'react-toastify';
import { academicAPI, timetableAPI, userAPI, teacherAPI } from './api';

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
      const classes = response.data?.data?.classes || [];
      
      return classes;
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
      const response = await userAPI.getTeachers();
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
      console.log('Starting getTimeSlots fetch...');
      const response = await timetableAPI.getTimeSlots();
      console.log('Raw response from getTimeSlots:', response);
      
      if (!response.data) {
        console.error('No data in response from getTimeSlots');
        return [];
      }
      
      const apiTimeSlots = response.data?.data || [];
      console.log('Time slots data from API:', apiTimeSlots);
      
      if (!Array.isArray(apiTimeSlots)) {
        console.error('API returned non-array data for time slots:', apiTimeSlots);
        return [];
      }
      
      const convertedSlots = apiTimeSlots.map(slot => {
        try {
          return convertApiTimeSlot(slot as ApiTimeSlot);
        } catch (conversionError) {
          console.error('Error converting time slot:', slot, conversionError);
          return null;
        }
      }).filter(slot => slot !== null) as TimeSlot[];
      
      console.log('Converted time slots:', convertedSlots);
      return convertedSlots;
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast.error('Failed to load time slots');
      return [];
    }
  }

  // Get class-teacher assignments
  async getClassTeachers(): Promise<ClassTeacherAssignment[]> {
    try {
      const response = await teacherAPI.getClassTeacherAssignments();
      return response.data?.data?.assignments || [];
    } catch (error) {
      console.error('Error fetching class teachers:', error);
      toast.error('Failed to load class teachers');
      return [];
    }
  }

  // Get timetable by query
  async getTimetable(classId: number, sectionId: number, academicYear: string, term: string): Promise<Timetable | null> {
    try {
      console.log(`Fetching timetable for class=${classId}, section=${sectionId}, year=${academicYear}, term=${term}`);
      
      const response = await timetableAPI.getTimetable({
        classId,
        sectionId,
        academicYear,
        term
      });
      
      console.log('Timetable response:', response);
      const apiTimetable = response.data?.data;
      if (!apiTimetable) return null;
      
      return convertApiTimetable(apiTimetable as ApiTimetable);
    } catch (error) {
      const apiError = error as {response?: {status: number, data?: {message?: string}}};
      
      if (apiError.response) {
        if (apiError.response.status === 404) {
          // Timetable doesn't exist yet - this is okay
          console.log('Timetable not found (404), returning null');
          return null;
        }
        
        if (apiError.response.status === 500) {
          // Handle server error
          console.error('Server error when fetching timetable:', apiError.response.data?.message || 'Unknown server error');
          toast.error('Server error when loading timetable. Please try again later.');
          return null;
        }
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
      
      const response = await timetableAPI.addPeriod({
        timetableId,
        dayOfWeek,
        timeSlotId,
        subjectId,
        teacherId,
        classId,
        sectionId
      });
      
      console.log('Period added successfully:', response);
      toast.success('Period added successfully');
      return true;
    } catch (error) {
      console.error('Error adding period:', error);
      
      // Extract error information
      const apiError = error as {
        response?: {
          status: number,
          data?: {
            message?: string,
            error?: string
          }
        },
        message?: string
      };
      
      let errorMessage = 'Failed to add period';
      
      if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message;
        
        // Handle specific error cases
        if (errorMessage.includes('Teacher is already assigned')) {
          toast.error('Teacher scheduling conflict: ' + errorMessage);
        } else if (errorMessage.includes('Subject is already assigned')) {
          toast.error('Subject scheduling conflict: ' + errorMessage);
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error(errorMessage);
      }
      
      // Propagate the error for the component to handle
      throw new Error(errorMessage);
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
      // Type validation
      if (typeof startTime !== 'string' || startTime.trim() === '') {
        console.error('Invalid startTime:', startTime);
        toast.error('Start time must be a valid time string');
        return false;
      }
      
      if (typeof endTime !== 'string' || endTime.trim() === '') {
        console.error('Invalid endTime:', endTime);
        toast.error('End time must be a valid time string');
        return false;
      }
      
      if (typeof isBreak !== 'boolean') {
        console.error('Invalid isBreak (not a boolean):', isBreak);
        toast.error('Invalid break status');
        return false;
      }

      // Break type validation
      if (isBreak && (!breakType || typeof breakType !== 'string' || breakType.trim() === '')) {
        console.error('Invalid breakType for a break period:', breakType);
        toast.error('Break type is required for break periods');
        return false;
      }
      
      // Prepare API payload - explicitly handle the breakType
      // - For class periods: breakType should be null
      // - For break periods: breakType should be the provided string
      const payload = {
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        isBreak,
        breakType: isBreak ? (breakType ? breakType.trim() : null) : null
      };
      
      console.log('addTimeSlot payload:', JSON.stringify(payload, null, 2));
      
      // Validate time format
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(payload.startTime) || !timeRegex.test(payload.endTime)) {
        console.error('Invalid time format in payload:', payload);
        toast.error('Times must be in 24-hour format (HH:MM)');
        return false;
      }
      
      // Validate start time is before end time
      if (payload.startTime >= payload.endTime) {
        console.error('Start time is not before end time:', payload);
        toast.error('Start time must be earlier than end time');
        return false;
      }
      
      const response = await timetableAPI.addTimeSlot(payload);
      
      console.log('Time slot creation response:', response);
      toast.success('Time slot added successfully');
      return true;
    } catch (error) {
      console.error('Error adding time slot:', error);
      
      // Extract more detailed error information if available
      const apiError = error as {
        response?: {
          status: number, 
          data?: {
            message?: string, 
            error?: string,
            stack?: string
          }
        },
        message?: string
      };
      
      console.error('API Error object:', JSON.stringify(apiError, null, 2));
      
      let errorMessage = 'Failed to add time slot';
      
      if (apiError.response) {
        console.error('API Error details:', apiError.response);
        if (apiError.response.data?.message) {
          errorMessage += `: ${apiError.response.data.message}`;
        } else if (apiError.response.status === 400) {
          errorMessage += ': Invalid time slot data';
        } else if (apiError.response.status === 500) {
          errorMessage += ': Server error, please try again later';
        }
      } else if (apiError.message) {
        errorMessage += `: ${apiError.message}`;
      }
      
      toast.error(errorMessage);
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

  // Delete a time slot
  async deleteTimeSlot(timeSlotId: number): Promise<boolean> {
    try {
      console.log(`Deleting time slot with ID: ${timeSlotId}`);
      
      await timetableAPI.deleteTimeSlot(timeSlotId);
      
      toast.success('Time slot deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting time slot:', error);
      
      // Extract more detailed error information if available
      const apiError = error as {
        response?: {
          status: number, 
          data?: {
            message?: string, 
            error?: string
          }
        },
        message?: string
      };
      
      let errorMessage = 'Failed to delete time slot';
      
      if (apiError.response) {
        if (apiError.response.data?.message) {
          errorMessage += `: ${apiError.response.data.message}`;
        } else if (apiError.response.status === 400) {
          errorMessage += ': Cannot delete time slot as it is being used in timetable periods';
        } else if (apiError.response.status === 404) {
          errorMessage += ': Time slot not found';
        } else if (apiError.response.status === 500) {
          errorMessage += ': Server error, please try again later';
        }
      } else if (apiError.message) {
        errorMessage += `: ${apiError.message}`;
      }
      
      toast.error(errorMessage);
      return false;
    }
  }
}

export const timetableService = new TimetableService();
export default timetableService; 