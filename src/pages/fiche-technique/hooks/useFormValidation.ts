import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { globalSchema } from "@/schema/fiche-technique.schema";
import { getFormDefaultValues } from "../utils/formUtils";
import type { FormData } from "../types/form.types";

export const useFormValidation = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(globalSchema),
    mode: "all",
    defaultValues: getFormDefaultValues(),
  });

  return form;
};
