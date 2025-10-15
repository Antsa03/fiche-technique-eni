import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/services/auth.service";
import { LoginForm } from "./_components/login-form";

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      navigate("/formulaire", { replace: true });
    }
  }, [navigate]);
  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-200 rounded-l-lg">
          <div className="w-full max-w-sm space-y-8">
            {/* Login Form */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-8 shadow-xl shadow-slate-950/[0.04]">
              <LoginForm />
            </div>
          </div>
        </div>

        {/* Right Side - Branding */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary/85 via-primary/75 to-primary/65 relative overflow-hidden rounded-r-lg">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-secondary/8" />
          <div className="absolute inset-0 opacity-35">
            <div className="absolute inset-0 bg-white/8 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0)] bg-[length:24px_24px]" />
          </div>

          {/* Content */}
          <div className="relative flex flex-col justify-center items-center text-center p-12 text-white">
            <div className="space-y-6 max-w-md">
              <div className=" backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto">
                <div className="rounded-lg flex items-center justify-center">
                  <img src="eni-logo.png" alt="Logo" className="h-24 w-24" />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold">
                  École Nationale
                  <br />
                  d'Informatique
                </h2>
                <p className="text-white/90 text-lg leading-relaxed">
                  Plateforme d'envoie des fiches techniques
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
