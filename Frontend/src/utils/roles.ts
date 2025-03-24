export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
  PARENT = 'parent'
}

export interface RoutePermission {
  roles: UserRole[];
  path: string;
  exact?: boolean;
}

export const checkPermission = (userRole: UserRole, allowedRoles: UserRole[]): boolean => {
  return allowedRoles.includes(userRole);
}; 