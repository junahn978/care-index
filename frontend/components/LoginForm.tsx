"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "cn";
import createClient from "@/lib/supabase";
import { Button } from "@/components/ui/button";
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
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, ArrowRight, Clock, Mail, MailCheck } from "lucide-react";

// defining the zod schema for client input validation
const formSchema = z.object({
  email: z
    .email("Please enter a valid email address")
    .min(1, "Email should be at least 1 character long")
    .max(255, "Email cannot be longer than 255 characters"),
});

const supabase = createClient();

const sendMagicLink = async (email: string) => {
  // Supabase emails a one-time link (and signs the user up on first use);
  // clicking it lands on /auth/callback with a ?code= to exchange for a session
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
};

const signInWithGoogle = async () => {
  // sends the browser to Google; after consent, Google -> Supabase -> our /auth/callback route with a ?code=
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // set once the magic link is sent; swaps the form for the "check your email" view
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  // React Hook Form automatically handling on-submit form event. only triggered if all client input passes the Zod Schema
  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      await sendMagicLink(data.email);
      // only reached if sendMagicLink didn't throw, i.e. the email is on its way
      setSentTo(data.email);
    } catch (error) {
      form.setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "Could not send the sign-in link",
      });
    }
  }

  async function onGoogleSignIn() {
    try {
      await signInWithGoogle();
    } catch (error) {
      form.setError("root", {
        message:
          error instanceof Error ? error.message : "Google sign in failed",
      });
    }
  }

  if (sentTo) {
    return (
      <div className={cn("flex flex-col gap-8", className)} {...props}>
        <div className="flex flex-col gap-4">
          <div className="w-fit rounded-lg border border-[#C6FFF3] bg-[#EFFFFB] p-2">
            <MailCheck color="#0F766E" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Check your email
          </h1>
          <p className="text-muted-foreground">
            We sent a sign-in link to{" "}
            <span className="font-medium text-foreground">{sentTo}</span>. Open
            it in this browser to finish signing in.
          </p>
        </div>
        {/* the email stays in the form state, so going back keeps it for editing */}
        <Button
          variant="outline"
          type="button"
          size="xl"
          className="h-11 bg-card"
          onClick={() => setSentTo(null)}
        >
          <ArrowLeft />
          Use a different email
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {/* nowrap: never break the name at its hyphen */}
          Welcome to <span className="whitespace-nowrap">Care-Index</span>
        </h1>
        <p className="text-muted-foreground">
          Log in to access your doctor directory
        </p>
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            type="button"
            size="xl"
            className="h-11 gap-2.5 bg-card shadow-xs"
            onClick={onGoogleSignIn}
          >
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
          <Button
            variant="outline"
            type="button"
            size="xl"
            className="h-11 gap-2.5 bg-card shadow-xs"
          >
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
          <Button
            variant="outline"
            type="button"
            size="xl"
            className="h-11 gap-2.5 bg-card shadow-xs"
          >
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
        </div>
        <FieldSeparator className="text-xs tracking-wider uppercase *:data-[slot=field-separator-content]:px-3">
          Or sign in with email
        </FieldSeparator>
        {/* noValidate: let the zod errors below show instead of the browser's own email popup */}
        <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="login-email"
                    className="text-xs font-semibold tracking-wider uppercase"
                  >
                    Email address
                  </FieldLabel>
                  <InputGroup className="h-11 bg-card">
                    <InputGroupAddon className="pl-3">
                      <Mail className="opacity-70" />
                    </InputGroupAddon>
                    <InputGroupInput
                      {...field}
                      id="login-email"
                      type="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="name@example.com"
                      autoComplete="email"
                    />
                  </InputGroup>
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription className="flex items-start gap-1.5 text-xs">
                      <Clock className="mt-px size-3.5 shrink-0 text-[#008378]" />
                      We&apos;ll send a passwordless magic sign-in link
                      directly to your inbox.
                    </FieldDescription>
                  )}
                </Field>
              )}
            />
            <Field>
              {form.formState.errors.root && (
                <FieldError errors={[form.formState.errors.root]} />
              )}
              <Button
                type="submit"
                size="xxl"
                className="gap-2 font-semibold shadow-md shadow-[#008378]/25"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Spinner />
                    Sending link…
                  </>
                ) : (
                  <>
                    Continue to Care-Index
                    <ArrowRight />
                  </>
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
