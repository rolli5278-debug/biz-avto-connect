import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loading, userId } = useAuth();
  if (loading) return null;
  if (!userId) return <Navigate to="/" replace />;
  return <>{children}</>;
}
