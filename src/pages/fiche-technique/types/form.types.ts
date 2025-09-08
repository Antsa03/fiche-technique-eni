import * as z from "zod";
import { globalSchema } from "@/schema/fiche-technique.schema";

export type FormData = z.infer<typeof globalSchema>;

export interface FormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  as?: React.ComponentType<any>;
  rows?: number;
  [key: string]: any;
}

export interface StepperProps {
  currentStep: number;
  completedSteps: Set<number>;
  onStepChange: (step: number) => Promise<void> | void;
}

export interface StepContentProps {
  control: any;
  watch: any;
  setValue: any;
  trigger: any;
  getValues: any;
}

export interface FormActionsProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}
