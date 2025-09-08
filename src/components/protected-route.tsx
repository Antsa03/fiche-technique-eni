import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/services/auth.service";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  if (!AuthService.isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
}
