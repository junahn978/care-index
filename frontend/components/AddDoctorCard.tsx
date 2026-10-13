"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

// zod schema for client input validation
const formSchema = z.object({
  doctorName: z
    .string()
    .min(1, "Doctor name should be at least 1 character long")
    .max(100, "Doctor name cannot be longer than 100 characters"),
  specialty: z
    .string()
    .min(1, "Specialty should be at least 1 character long")
    .max(100, "Specialty cannot be longer than 100 characters"),
  clinicName: z
    .string()
    .trim()
    .max(255, "Clinic name cannot be longer than 255 characters"),
  phone: z
    .string()
    .trim()
    .max(32, "Phone number cannot be longer than 32 characters"),
  website: z
    .string()
    .trim()
    .max(255, "Website cannot be longer than 255 characters"),
  streetAddress1: z
    .string()
    .min(1, "Street address 1 should be at least 1 character long")
    .max(150, "Street address 1 cannot be longer than 150 characters"),
  streetAddress2: z
    .string()
    .trim()
    .max(150, "Street address 2 cannot be longer than 150 characters"),
  city: z
    .string()
    .min(1, "City should be at least 1 character long")
    .max(100, "City cannot be longer than 100 characters"),
  stateProvince: z
    .string()
    .min(1, "State/Province should be at least 1 character long")
    .max(50, "State/Province cannot be longer than 50 characters"),
  zipCode: z
    .string()
    .trim()
    .max(20, "Zip code cannot be longer than 20 characters"),
  country: z
    .string()
    .min(1, "Country should be at least 1 character long")
    .max(50, "Country cannot be longer than 50 characters"),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes cannot be longer than 1000 characters"),
});

export default function AddDoctorCard() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    toast("You submitted the following values:", {
      description: (
        <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius)  + 4px)",
      } as React.CSSProperties,
    });
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Bug Report</CardTitle>
        <CardDescription>
          Help us improve by reporting bugs you encounter.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-title">
                    Bug Title
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="Login button not working on mobile"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-description">
                    Description
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="form-rhf-demo-description"
                      placeholder="I'm having an issue with the login button on mobile."
                      rows={6}
                      className="min-h-24 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {field.value.length}/100 characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>
                    Include steps to reproduce, expected behavior, and what
                    actually happened.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form="form-rhf-demo">
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
