"use client";

import { ChangeEvent, ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { formatPhoneInput } from "@/lib/phone";

// an Input for phone numbers that adds the parentheses, space and dash itself as the digits are
// typed, so "2125550100" shows as "(212) 555-0100". Used in a Controller like Input: {...field}
export default function PhoneInput({
  onChange,
  ...props
}: ComponentProps<typeof Input>) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const { value, caret } = formatPhoneInput({
      previous: String(props.value ?? ""),
      value: input.value,
      caret: input.selectionStart ?? input.value.length,
      inputType: (event.nativeEvent as InputEvent).inputType,
    });
    // written to the input before onChange, so when React re-renders with this value it finds
    // it already there and leaves the caret where it was put
    input.value = value;
    input.setSelectionRange(caret, caret);
    onChange?.(event);
  }

  return <Input {...props} type="tel" onChange={handleChange} />;
}
