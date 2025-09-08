import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { AuthService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function Header() {
  const navigate = useNavigate();
  const isAuthenticated = AuthService.isAuthenticated();
  const user = AuthService.getUser();

  const handleLogout = () => {
    AuthService.logout();
    toast.success("Déconnexion réussie");
    navigate("/", { replace: true });
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200">
              {/* Placeholder pour le logo ENI */}
              <img src="eni-logo.png" alt="ENI Logo" className="w-16 h-16" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                École Nationale d'Informatique
              </h1>
              <p className="text-sm text-gray-600">
                Système de Fiche Technique
              </p>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>
                    {user.nom} {user.prenoms}
                  </span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {user.role.name}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </Button>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Fianarantsoa, Madagascar
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
