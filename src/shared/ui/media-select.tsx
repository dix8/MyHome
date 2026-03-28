"use client";

import { FormSelect, type FormSelectOption } from "@/shared/ui/form-select";

export interface MediaSelectOption extends FormSelectOption {
  imageUrl?: string;
}

export function MediaSelect({
  defaultValue,
  name,
  onValueChange,
  options,
  placeholder = "未选择",
}: {
  defaultValue: string;
  name: string;
  onValueChange?: (value: string) => void;
  options: MediaSelectOption[];
  placeholder?: string;
}) {
  return (
    <FormSelect
      defaultValue={defaultValue}
      key={`${name}:${defaultValue}`}
      name={name}
      onValueChange={onValueChange}
      options={options}
      placeholder={placeholder}
    />
  );
}
