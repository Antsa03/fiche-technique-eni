import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormFieldProps } from "../../types/form.types";

export const FormField = ({
  name,
  label,
  placeholder,
  type = "text",
  required = true,
  as: Component = Input,
  control,
  ...props
}: FormFieldProps & { control: any }) => (
  <div className="space-y-2">
    <Label
      htmlFor={name}
      className="text-sm font-semibold text-gray-700 flex items-center gap-1"
    >
      {label}
      {required && <span className="text-red-500">*</span>}
    </Label>
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="relative">
          <Component
            {...field}
            {...props}
            id={name}
            placeholder={placeholder}
            type={type}
            className={`
              w-full px-4 py-3 text-sm border-2 rounded-lg transition-all duration-200
              bg-white hover:bg-gray-50 focus:bg-white
              placeholder:text-gray-400 placeholder:font-normal
              focus:outline-none focus:ring-0
              ${
                fieldState.error
                  ? "border-red-300 focus:border-red-500 shadow-red-100 focus:shadow-red-200"
                  : "border-gray-200 focus:border-blue-500 hover:border-gray-300 focus:shadow-blue-100"
              }
              ${fieldState.error ? "focus:shadow-lg" : "focus:shadow-md"}
            `}
          />
          {/* Indicateur de focus */}
          <div
            className={`
              absolute inset-0 rounded-lg pointer-events-none transition-all duration-200
              ${
                fieldState.error
                  ? "shadow-red-100"
                  : "shadow-transparent hover:shadow-sm focus-within:shadow-blue-100"
              }
            `}
          />
          {fieldState.error && (
            <div className="flex items-center gap-1 mt-2">
              <div className="w-1 h-1 bg-red-500 rounded-full" />
              <p className="text-xs text-red-600 font-medium">
                {fieldState.error.message}
              </p>
            </div>
          )}
        </div>
      )}
    />
  </div>
);
