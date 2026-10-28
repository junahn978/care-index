"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
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
import createClient from "@/lib/supabase";

// defining the zod schema for client input validation
const formSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name should be at least 1 character long")
      .max(255, "Full name cannot be longer than 255 characters"),
    email: z
      .email("Please enter a valid email address")
      .min(1, "Email should be at least 1 character long")
      .max(255, "Email cannot be longer than 255 characters"),
    password: z
      .string()
      .min(12, "Password should be at least 12 characters long")
      .max(255, "Password cannot be longer than 255 characters")
      .regex(
        /[^A-Za-z0-9\s]/,
        "Password should include at least one special symbol",
      ),
    confirmPassword: z
      .string()
      .min(1, "Confirm password should be at least 1 character long")
      .max(255, "Confirm password cannot be longer than 255 characters"),
  })
  // cross-field check: show the error under the Confirm Password field
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const handleSignUp = async (
  email: string,
  password: string,
  fullName: string,
) => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
};

export function SignupForm({
  setIsDialogOpen,
  ...props
}: {
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
} & React.ComponentProps<typeof Card>) {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // re-renders as the user types, so the submit button can be disabled while the passwords differ
  const [password, confirmPassword] = useWatch({
    control: form.control,
    name: ["password", "confirmPassword"],
  });
  const passwordsMatch = password === confirmPassword;

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  // React Hook Form automatically handling on-submit form event. only triggered if all client input passes the Zod Schema
  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      const res = await handleSignUp(data.email, data.password, data.fullName);
      // only reached if handleSignUp didn't throw, i.e. the account was created
      // cacheComponents keeps /login alive in the background (React Activity),
      // so clear the inputs and close the dialog or they reappear after sign-out
      form.reset();
      closeDialog();
      router.replace("/");
    } catch (error) {
      console.log(`sign up failed:${error}`);
    }
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="icon-sm"
            type="button"
            onClick={closeDialog}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="fullName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="signup-name">Full Name</FieldLabel>
                  <Input
                    {...field}
                    id="signup-name"
                    type="text"
                    aria-invalid={fieldState.invalid}
                    placeholder=""
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="signup-email"
                    type="email"
                    aria-invalid={fieldState.invalid}
                    placeholder=""
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                  <Input
                    {...field}
                    id="signup-password"
                    type="password"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    Must be at least 12 characters long and include a special
                    symbol.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || !passwordsMatch}>
                  <FieldLabel htmlFor="signup-confirm-password">
                    Confirm Password
                  </FieldLabel>
                  <Input
                    {...field}
                    id="signup-confirm-password"
                    type="password"
                    aria-invalid={fieldState.invalid || !passwordsMatch}
                  />

                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    !passwordsMatch && (
                      <FieldError
                        errors={[{ message: "Passwords do not match" }]}
                      />
                    )
                  )}
                </Field>
              )}
            />
            <FieldGroup>
              <Field>
                <Button
                  type="submit"
                  disabled={!passwordsMatch || form.formState.isSubmitting}
                >
                  Create Account
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account?{" "}
                  <a href="#" onClick={closeDialog}>
                    Sign in
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
