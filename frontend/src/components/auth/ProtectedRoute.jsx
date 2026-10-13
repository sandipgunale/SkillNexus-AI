import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "../../app/providers/AuthProvider";

import {
  isLogoutInProgress,
} from "../../services/api/apiClient";

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  /*
   * Intentional logout:
   *
   * The user explicitly clicked Logout and confirmed it.
   * In this case, unauthenticated state should take the
   * user to the public landing page instead of /login.
   */
  if (!isAuthenticated) {
    if (isLogoutInProgress()) {
      return (
        <Navigate
          to="/"
          replace
        />
      );
    }

    /*
     * Normal unauthenticated access / expired session:
     * redirect to login.
     */
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;