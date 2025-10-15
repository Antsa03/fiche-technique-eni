import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/schema/password.schema";
import { sendPasswordResetCode } from "@/services/api";

interface ForgotPasswordFormProps {
  className?: string;
  onCodeSent: (email: string) => void;
}

export function ForgotPasswordForm({
  className,
  onCodeSent,
  ...props
}: ForgotPasswordFormProps & React.ComponentProps<"form">) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      await sendPasswordResetCode();
      setIsSuccess(true);
      toast.success("Code secret envoyé par email !");

      // Passer à l'étape suivante après un délai pour voir le message
      setTimeout(() => {
        onCodeSent(data.email);
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi du code secret"
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
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Code envoyé !
            </h1>
            <p className="text-sm text-muted-foreground">
              Un code secret a été envoyé à <br />
              <span className="font-medium">{getValues("email")}</span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-center text-muted-foreground">
            Vérifiez votre boîte de réception. Vous allez être redirigé vers le
            formulaire de réinitialisation.
          </p>

          <Button
            type="button"
            onClick={() => setIsSuccess(false)}
            variant="outline"
            className="w-full"
          >
            Renvoyer le code
          </Button>

          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la connexion
            </Link>
          </div>
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
        <h1 className="text-2xl font-semibold tracking-tight">
          Mot de passe oublié
        </h1>
        <p className="text-sm text-muted-foreground">
          Entrez votre adresse email pour recevoir un code secret
        </p>
      </div>

      <div className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Input
            {...register("email")}
            id="email"
            type="email"
            placeholder="Votre adresse email"
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

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 bg-primary hover:bg-primary/90 transition-all duration-200 font-medium shadow-lg shadow-primary/20"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Envoyer le code secret
            </>
          )}
        </Button>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </form>
  );
}
