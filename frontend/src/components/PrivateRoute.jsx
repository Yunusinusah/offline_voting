import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, getUser } from "../utils/auth";

export default function PrivateRoute({ allowedRoles }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  const user = getUser();
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to dashboard or unauthorized page
    return (
      <Navigate
        to={
          user.role === "admin"
            ? "/admin"
            : user.role === "superadmin"
              ? "/super-admin"
              : user.role === "agent"
                ? "/polling-agent"
                : user.role === "voter"
                  ? "/vote"
                  : "/nodashboard"
        }
        replace
      />
    );
  }
  return <Outlet />;
}
