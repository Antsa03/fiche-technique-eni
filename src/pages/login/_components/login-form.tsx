import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { loginSchema, type LoginFormData } from "@/schema/login.schema";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock authentication logic
      if (data.email === "admin@eni.fr" && data.password === "password123") {
        toast.success("Connexion réussie ! Redirection en cours...");

        // Store user data if remember me is checked
        if (data.rememberMe) {
          localStorage.setItem("rememberUser", "true");
          localStorage.setItem("userEmail", data.email);
        }

        // Redirect to fiche technique page
        setTimeout(() => {
          navigate("/fiche-technique");
        }, 1000);
      } else {
        toast.error("Email ou mot de passe incorrect");
      }
    } catch (error) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className={cn("w-full space-y-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>
        <p className="text-sm text-muted-foreground">
          Entrez vos identifiants pour continuer
        </p>
      </div>

      <div className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Input
            {...register("email")}
            id="email"
            type="email"
            placeholder="Email"
            className={cn(
              "h-11 border-0 bg-muted/50 placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/30",
              errors.email && "ring-2 ring-red-500/20 border-red-500/30"
            )}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="relative">
            <Input
              {...register("password")}
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              className={cn(
                "h-11 border-0 bg-muted/50 pr-10 placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/30",
                errors.password && "ring-2 ring-red-500/20 border-red-500/30"
              )}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 bg-primary hover:bg-primary/90 transition-all duration-200 font-medium shadow-lg shadow-primary/20"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connexion...
            </>
          ) : (
            "Se connecter"
          )}
        </Button>
      </div>

      {/* Support */}
      <div className="text-center">
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
          onClick={() =>
            toast("Support IT : support@eni.fr", {
              icon: "📧",
              duration: 3000,
            })
          }
        >
          Besoin d'aide ? Contactez le support
        </button>
      </div>
    </form>
  );
}
