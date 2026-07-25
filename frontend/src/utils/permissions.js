import { PERMISSIONS } from "./rbac";

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const getCurrentRole = () => {
  return getCurrentUser()?.role;
};

export const hasRole = (...roles) => {
  const role = getCurrentRole();
  return roles.includes(role);
};

export const hasPermission = (permission) => {
  const role = getCurrentRole();
  return permission.includes(role);
};

export const isAdmin = () => hasRole("Admin");
export const isFaculty = () => hasRole("Faculty");
export const isStudent = () => hasRole("Student");
export const isLabStaff = () => hasRole("Lab Staff");