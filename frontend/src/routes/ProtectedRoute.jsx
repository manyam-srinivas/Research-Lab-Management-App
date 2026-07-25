import { Navigate } from "react-router-dom";
import { getCurrentUser, hasRole } from "../utils/permissions";

function ProtectedRoute({ children, roles }) {
  const user = getCurrentUser();

  // User is not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // User is logged in but doesn't have the required role
  if (roles && !hasRole(...roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;