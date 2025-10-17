import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Settings, ChevronDown, } from "lucide-react";
import { AuthService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { ChangePasswordModal } from "@/components/change-password/change-password-modal";
import toast from "react-hot-toast";

export default function Header() {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAuthenticated = AuthService.isAuthenticated();
  const user = AuthService.getUser();

  // Fermer le menu au clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    AuthService.logout();
    toast.success("Déconnexion réussie");
    navigate("/", { replace: true });
  };

  // const handleOpenChangePassword = () => {
  //   setShowUserMenu(false);
  //   setShowChangePasswordModal(true);
  // };

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
                Ecole Nationale d'Informatique
              </h1>
              <p className="text-sm text-gray-600">Fianarantsoa, Madagascar</p>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user && (
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

                {/* User Menu */}
                <div className="relative" ref={menuRef}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-1"
                  >
                    <Settings className="h-4 w-4" />
                    <ChevronDown className="h-4 w-4" />
                  </Button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                      <div className="py-1">
                        {/* <button
                          onClick={handleOpenChangePassword}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Lock className="mr-2 h-4 w-4" />
                          Mot de passe
                        </button> */}
                        <div className="border-t border-gray-100" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={showChangePasswordModal}
        onOpenChange={setShowChangePasswordModal}
      />
    </header>
  );
}
