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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
                    <Input
                      {...field}
                      id="login-email"
                      type="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="m@example.com"
                      autoComplete="email"
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
                    <div className="flex items-center">
                      <FieldLabel htmlFor="login-password">Password</FieldLabel>
                      <a
                        href="#"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <Input
                      {...field}
                      id="login-password"
                      type="password"
                      aria-invalid={fieldState.invalid}
                      autoComplete="current-password"
                    />
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
                <Button variant="outline" type="button">
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <form>
                      <DialogTrigger render={<a href="#">Sign up</a>} />
                      <DialogContent
                        showCloseButton={false}
                        className="p-0 sm:max-w-[672px] max-h-[825px] overflow-y-auto"
                      >
                        <SignupForm setIsDialogOpen={setIsDialogOpen} />
                      </DialogContent>
                    </form>
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
