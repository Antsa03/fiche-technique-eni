import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/schema/password.schema";
import { resetPassword } from "@/services/api";

interface ResetPasswordFormProps {
  email: string;
  onBack: () => void;
  className?: string;
}

export function ResetPasswordForm({
  email,
  onBack,
  className,
  ...props
}: ResetPasswordFormProps & React.ComponentProps<"form">) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email,
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      await resetPassword(data);
      setIsSuccess(true);
      toast.success("Mot de passe réinitialisé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la réinitialisation du mot de passe"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={cn("w-full space-y-6", className)}>
        {/* Success State */}
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Mot de passe réinitialisé !
            </h1>
            <p className="text-sm text-muted-foreground">
              Votre mot de passe a été mis à jour avec succès.
              <br />
              Vous pouvez maintenant vous connecter.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      className={cn("w-full space-y-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Nouveau mot de passe
        </h1>
        <p className="text-sm text-muted-foreground">
          Entrez le code reçu par email et votre nouveau mot de passe
        </p>
      </div>

      <div className="space-y-4">
        {/* Email Display */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Email : <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        {/* Code Field */}
        <div className="space-y-2">
          <label htmlFor="code" className="text-sm font-medium">
            Code secret (6 caractères)
          </label>
          <Input
            {...register("code")}
            id="code"
            type="text"
            placeholder="Entrez le code reçu par email"
            maxLength={6}
            className={cn(
              "h-11 border-0 bg-muted/50 placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/30 text-center text-lg tracking-[0.2em]",
              errors.code && "ring-2 ring-red-500/20 border-red-500/30"
            )}
            disabled={isLoading}
          />
          {errors.code && (
            <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>
          )}
        </div>

        {/* New Password Field */}
        <div className="space-y-2">
          <label htmlFor="newPassword" className="text-sm font-medium">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <Input
              {...register("newPassword")}
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder="Votre nouveau mot de passe"
              className={cn(
                "h-11 border-0 bg-muted/50 pr-10 placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/30",
                errors.newPassword && "ring-2 ring-red-500/20 border-red-500/30"
              )}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground transition-colors"
              onClick={() => setShowNewPassword(!showNewPassword)}
              disabled={isLoading}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-xs text-red-500 mt-1">
              {errors.newPassword.message}
            </p>
          )}
          {/* Password Requirements */}
          {newPassword && (
            <div className="text-xs space-y-1">
              <p className="text-muted-foreground">
                Le mot de passe doit contenir :
              </p>
              <ul className="space-y-1 text-muted-foreground">
                <li className={newPassword.length >= 8 ? "text-green-600" : ""}>
                  • Au moins 8 caractères
                </li>
                <li
                  className={/[a-z]/.test(newPassword) ? "text-green-600" : ""}
                >
                  • Au moins une minuscule
                </li>
                <li
                  className={/[A-Z]/.test(newPassword) ? "text-green-600" : ""}
                >
                  • Au moins une majuscule
                </li>
                <li className={/\d/.test(newPassword) ? "text-green-600" : ""}>
                  • Au moins un chiffre
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirmer le nouveau mot de passe
          </label>
          <div className="relative">
            <Input
              {...register("confirmPassword")}
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmez votre nouveau mot de passe"
              className={cn(
                "h-11 border-0 bg-muted/50 pr-10 placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/30",
                errors.confirmPassword &&
                  "ring-2 ring-red-500/20 border-red-500/30"
              )}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">
              {errors.confirmPassword.message}
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
              Réinitialisation...
            </>
          ) : (
            "Réinitialiser le mot de passe"
          )}
        </Button>

        {/* Back Button */}
        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </button>
        </div>
      </div>
    </form>
  );
}
