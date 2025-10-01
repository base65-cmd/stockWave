import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import LoadingSpinner from "./LoadingSpinner2";

const RequireAuth = ({ children }) => {
  const user_id = useAuthStore((state) => state.user_id);
  const authLoading = useAuthStore((state) => state.authLoading);

  if (authLoading) {
    return <LoadingSpinner />; // Optional loader
  }

  if (!user_id) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RequireAuth;
