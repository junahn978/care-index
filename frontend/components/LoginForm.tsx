"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import * as z from "zod";
import { cn } from "cn";
import createClient from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
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
  FieldSeparator,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { KeyRound, Mail } from "lucide-react";
import { SignupForm } from "./SignUpForm";

// defining the zod schema for client input validation
const formSchema = z.object({
  email: z
    .email("Please enter a valid email address")
    .min(1, "Email should be at least 1 character long")
    .max(255, "Email cannot be longer than 255 characters"),
  password: z
    .string()
    .min(1, "Password should be at least 1 character long")
    .max(255, "Password cannot be longer than 255 characters"),
});

const handleSignIn = async (email: string, password: string) => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // React Hook Form automatically handling on-submit form event. only triggered if all client input passes the Zod Schema
  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      await handleSignIn(data.email, data.password);
      // only reached if handleSignIn didn't throw, i.e. sign-in succeeded
      // cacheComponents keeps /login alive in the background (React Activity),
      // so clear the inputs or they reappear after sign-out
      form.reset();
      router.replace("/");
    } catch (error) {
      form.setError("root", {
        message: error instanceof Error ? error.message : "Sign in failed",
      });
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="login-email">Email</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <Mail className="opacity-70" />
                      </InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        id="login-email"
                        type="email"
                        aria-invalid={fieldState.invalid}
                        placeholder=""
                        autoComplete="email"
                      />
                    </InputGroup>
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
                    <div className="flex items-center">
                      <FieldLabel htmlFor="login-password">Password</FieldLabel>
                      <a
                        href="#"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <InputGroup>
                      <InputGroupAddon>
                        <KeyRound className="opacity-70" />
                      </InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        id="login-password"
                        type="password"
                        aria-invalid={fieldState.invalid}
                        autoComplete="current-password"
                      />
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Field>
                {form.formState.errors.root && (
                  <FieldError errors={[form.formState.errors.root]} />
                )}
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  Login
                </Button>
              </Field>
              {/* bg-card so the "or" label hides the line behind it on the card background */}
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                or
              </FieldSeparator>
              <Field>
                <Button variant="outline" type="button" className="gap-2.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </Button>
                <Button variant="outline" type="button" className="gap-2.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  Continue with Apple
                </Button>
                <Button variant="outline" type="button" className="gap-2.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      fill="#1877F2"
                    />
                  </svg>
                  Continue with Facebook
                </Button>
                <FieldDescription className="text-center [&>a:hover]:text-foreground/80">
                  Don&apos;t have an account?{" "}
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger render={<a href="#">Sign up</a>} />
                    <DialogContent
                      showCloseButton={false}
                      className="p-0 sm:max-w-[672px] max-h-[825px] overflow-y-auto"
                    >
                      <SignupForm setIsDialogOpen={setIsDialogOpen} />
                    </DialogContent>
                  </Dialog>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
