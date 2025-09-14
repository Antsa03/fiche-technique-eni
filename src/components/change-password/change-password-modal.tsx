import { X } from "lucide-react";
import { ChangePasswordForm } from "./change-password-form";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordModal({
  open,
  onOpenChange,
}: ChangePasswordModalProps) {
  const handleSuccess = () => {
    setTimeout(() => {
      onOpenChange(false);
    }, 1500);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/80 animate-in fade-in-0"
        onClick={handleCancel}
      />

      {/* Modal Content */}
      <div className="relative z-50 w-full max-w-md bg-white rounded-lg shadow-lg animate-in zoom-in-95 slide-in-from-top-2">
        {/* Close Button */}
        <button
          onClick={handleCancel}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fermer</span>
        </button>

        {/* Form Content */}
        <div className="p-6">
          <ChangePasswordForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
