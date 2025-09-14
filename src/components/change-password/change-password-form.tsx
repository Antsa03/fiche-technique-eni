import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "@/schema/password.schema";
import { changePassword } from "@/services/api";

interface ChangePasswordFormProps {
  className?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ChangePasswordForm({
  className,
  onSuccess,
  onCancel,
}: ChangePasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);

    try {
      await changePassword(data);
      setIsSuccess(true);
      toast.success("Mot de passe modifié avec succès !");
      reset();

      // Appeler onSuccess après un délai pour laisser voir le message de succès
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors du changement de mot de passe"
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
            <h3 className="text-lg font-semibold">Mot de passe modifié !</h3>
            <p className="text-sm text-muted-foreground">
              Votre mot de passe a été mis à jour avec succès.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      className={cn("w-full space-y-6", className)}
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Changer le mot de passe</h3>
        <p className="text-sm text-muted-foreground">
          Entrez votre mot de passe actuel et choisissez-en un nouveau
        </p>
      </div>

      <div className="space-y-4">
        {/* Current Password Field */}
        <div className="space-y-2">
          <label htmlFor="currentPassword" className="text-sm font-medium">
            Mot de passe actuel
          </label>
          <div className="relative">
            <Input
              {...register("currentPassword")}
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Votre mot de passe actuel"
              className={cn(
                "h-11 border-0 bg-muted/50 pr-10 placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/30",
                errors.currentPassword &&
                  "ring-2 ring-red-500/20 border-red-500/30"
              )}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground transition-colors"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              disabled={isLoading}
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-xs text-red-500 mt-1">
              {errors.currentPassword.message}
            </p>
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

        {/* Confirm New Password Field */}
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

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-primary hover:bg-primary/90 transition-all duration-200 font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Modification...
              </>
            ) : (
              "Modifier le mot de passe"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
