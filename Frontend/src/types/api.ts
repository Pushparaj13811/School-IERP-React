// Define the base response structure
export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

// Classes and Sections
export interface Class {
  id: number;
  name: string;
  sections?: Section[];
}

export interface Section {
  id: number;
  name: string;
  classId: number;
  class?: Class;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
}

export interface Designation {
  id: number;
  name: string;
  description?: string;
}

// User related types
export interface User {
  id: number;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
}

export interface Student {
  id: number;
  name: string;
  email?: string;
  user?: User;
  gender?: string;
  rollNo?: string;
  contactNo?: string;
  class?: Class;
  section?: Section;
  parent?: Parent;
  profilePicture?: string;
  nameAsPerBirth?: string;
  dateOfBirth?: string;
  grade?: string;
  className?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  nationality?: string;
  religion?: string;
  fatherName?: string;
  motherName?: string;
  dobNo?: string;
  classId?: number;
  sectionId?: number;
  parentId?: number;
  address?: {
    addressLine1: string;
    addressLine2?: string;
    street: string;
    city: string;
    ward: string;
    municipality: string;
    district: string;
    province: string;
    country: string;
    postalCode?: string;
  };
  isActive?: boolean;
}

export interface Teacher {
  id: number;
  name: string;
  email?: string;
  user?: User;
  gender?: string;
  contactNo?: string;
  designation?: Designation;
  subjects?: Subject[];
  classes?: { class: Class }[];
  sections?: { section: Section }[];
  profilePicture?: string;
  emergencyContact?: string;
  dateOfBirth?: string;
  joinDate?: string;
  bio?: string;
  address?: {
    addressLine1: string;
    addressLine2?: string;
    street: string;
    city: string;
    ward: string;
    municipality: string;
    district: string;
    province: string;
    country: string;
    postalCode?: string;
  };
  isActive?: boolean;
}

export interface Parent {
  id: number;
  name: string;
  email?: string;
  user?: User;
  gender?: string;
  contactNo?: string;
  children?: Student[];
  profilePicture?: string;
  address?: {
    addressLine1: string;
    addressLine2?: string;
    street: string;
    city: string;
    ward: string;
    municipality: string;
    district: string;
    province: string;
    country: string;
    postalCode?: string;
  };
  isActive?: boolean;
}

// API response types
export interface ClassesResponse {
  classes: Class[];
}

export interface SectionsResponse {
  sections: Section[];
}

export interface SubjectsResponse {
  subjects: Subject[];
}

export interface DesignationsResponse {
  designations: Designation[];
}

export interface StudentsResponse {
  students: Student[];
}

export interface TeachersResponse {
  teachers: Teacher[];
}

export interface ParentsResponse {
  parents: Parent[];
}

export interface UserResponse {
  id: number;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  isActive?: boolean;
  student?: Student;
  teacher?: Teacher;
  parent?: Parent;
  admin?: {
    id: number;
    fullName: string;
    phone?: string;
    dateOfBirth?: string;
    joinDate?: string;
    emergencyContact?: string;
    bio?: string | null;
    profilePicture?: {
      id: number;
      url: string;
    } | null;
    address?: {
      addressLine1: string;
      city: string;
      district: string;
      province: string;
    };
  };
}

// Form data interfaces for creating users
export interface StudentFormData {
  name: string;
  nameAsPerBirth: string;
  email: string;
  gender: string;
  contactNo: string;
  emergencyContact: string;
  dateOfBirth: string;
  dobNo?: string;
  bloodGroup?: string;
  nationality: string;
  religion?: string;
  rollNo: string;
  fatherName: string;
  motherName: string;
  classId: number;
  sectionId: number;
  parentId?: number;
  address: {
    addressLine1: string;
    addressLine2?: string;
    street: string;
    city: string;
    ward: string;
    municipality: string;
    district: string;
    province: string;
    country: string;
    postalCode?: string;
  };
}

export interface ParentFormData {
  name: string;
  email: string;
  gender: string;
  contactNo: string;
  children?: number[];
  address: {
    addressLine1: string;
    addressLine2?: string;
    street: string;
    city: string;
    ward: string;
    municipality: string;
    district: string;
    province: string;
    country: string;
    postalCode?: string;
  };
}

export interface TeacherFormData {
  name: string;
  email: string;
  gender: string;
  contactNo: string;
  emergencyContact: string;
  dateOfBirth: string;
  joinDate: string;
  designationId: number;
  bio?: string;
  subjects?: number[];
  classes?: number[];
  sections?: number[];
  address: {
    addressLine1: string;
    addressLine2?: string;
    street: string;
    city: string;
    ward: string;
    municipality: string;
    district: string;
    province: string;
    country: string;
    postalCode?: string;
  };
} 