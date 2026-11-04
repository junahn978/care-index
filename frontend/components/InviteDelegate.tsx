"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { CircleCheck, Mail, SendHorizontal, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { sendDelegateInvitation } from "@/lib/api/delegations";
import {
  ACCESS_LEVELS,
  INVITATION_VALID_DAYS,
  RELATIONSHIPS,
} from "@/lib/delegation";
import { AccessLevel, PendingInvitation } from "@/lib/types";
import RelationshipSelect from "./RelationshipSelect";

// defining the zod schema for client input validation
const formSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Delegate email address is required")
    .max(254, "Email address cannot be longer than 254 characters")
    .pipe(z.email("Enter a valid email address, e.g. name@example.com")),
  relationship: z.enum(RELATIONSHIPS).nullable(),
  accessLevel: z.enum(["full", "view"]),
});

// the access level options, in the order they're shown
const ACCESS_LEVEL_OPTIONS: AccessLevel[] = ["full", "view"];

// labels and the email input at the page's body size, as in the design. The "!" is needed
// because the shared label and input set text-sm, which wins over any other text size class
const fieldTextClass = "text-fluid-base!";

export default function InviteDelegate({
  setInvitations,
}: {
  setInvitations: Dispatch<SetStateAction<PendingInvitation[]>>;
}) {
  const [isSentDialogOpen, setIsSentDialogOpen] = useState(false);
  // kept for the dialog's text, since the form is cleared once the invitation is sent
  const [sentEmail, setSentEmail] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", relationship: null, accessLevel: "full" },
  });

  // only runs once the input passes the Zod schema. While it runs, formState.isSubmitting is
  // true, which disables Send Delegate Invitation and shows its spinner
  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      const invitation = await sendDelegateInvitation(data);
      // newest first in Pending Invitations
      setInvitations((invitations) => [invitation, ...invitations]);
      setSentEmail(invitation.email);
      setIsSentDialogOpen(true);
      form.reset();
    } catch (error) {
      console.error("Error sending delegate invitation:", error);
      // a root error is cleared automatically on the next submit
      form.setError("root", {
        message: "Invitation could not be sent. Please try again.",
      });
    }
  }

  return (
    <section
      aria-labelledby="invite-delegate-heading"
      className="rounded-2xl border bg-card p-4 shadow-sm tablet:p-6 laptop:p-8"
    >
      <div className="flex items-center gap-3">
        <div
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#EFFFFB]"
        >
          <UserPlus className="size-5 text-[#0F766E]" />
        </div>
        <div>
          <h2 id="invite-delegate-heading" className="text-fluid-lg font-medium">
            Invite New Delegate
          </h2>
          <p className="text-muted-foreground">
            Issue an invitation link with specified permissions
          </p>
        </div>
      </div>

      {/* noValidate: the schema's messages show instead of the browser's own email check */}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="mt-6"
      >
        <FieldGroup className="gap-6">
          {/* side by side from tablet up, stacked on phones */}
          <div className="grid items-start gap-5 tablet:grid-cols-2">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="delegate-email"
                    className={fieldTextClass}
                  >
                    Delegate Email Address{" "}
                    <span className="text-destructive">*</span>
                  </FieldLabel>
                  <InputGroup className="h-11 border-[#C3C9D2] bg-white">
                    <InputGroupInput
                      {...field}
                      id="delegate-email"
                      className={fieldTextClass}
                      type="email"
                      aria-invalid={fieldState.invalid}
                      // read out with the field: the error when there is one, else the hint
                      aria-describedby={
                        fieldState.invalid
                          ? "delegate-email-error"
                          : "delegate-email-description"
                      }
                      placeholder="Enter delegate’s email address"
                      autoComplete="off"
                    />
                    <InputGroupAddon>
                      <Mail />
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid ? (
                    <FieldError
                      id="delegate-email-error"
                      errors={[fieldState.error]}
                    />
                  ) : (
                    <FieldDescription
                      id="delegate-email-description"
                      className="text-[#4F7F79]"
                    >
                      An invitation token valid for {INVITATION_VALID_DAYS}{" "}
                      days will be transmitted.
                    </FieldDescription>
                  )}
                </Field>
              )}
            />
            <Controller
              name="relationship"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel
                    htmlFor="delegate-relationship"
                    className={fieldTextClass}
                  >
                    Relationship
                  </FieldLabel>
                  <RelationshipSelect {...field} id="delegate-relationship" />
                </Field>
              )}
            />
          </div>

          <FieldSet>
            <FieldLegend variant="label" className={fieldTextClass}>
              Select Authorization Scope & Access Level{" "}
              <span className="text-destructive">*</span>
            </FieldLegend>
            {/* side by side from tablet up, stacked on phones */}
            <div className="grid gap-2 tablet:grid-cols-2 tablet:gap-5">
              {ACCESS_LEVEL_OPTIONS.map((level) => (
                <label
                  key={level}
                  className="flex cursor-pointer items-start gap-3 rounded-xl p-3 transition-colors hover:bg-muted/60"
                >
                  <input
                    type="radio"
                    value={level}
                    {...form.register("accessLevel")}
                    className="mt-0.5 size-4.5 shrink-0 cursor-pointer accent-[#008378]"
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium">
                        {ACCESS_LEVELS[level].label}
                      </span>
                      {/* a template string, not cn: cn reads text-fluid-sm as a text color and drops it */}
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-fluid-sm ${ACCESS_LEVELS[level].badgeClass}`}
                      >
                        {ACCESS_LEVELS[level].badge}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      {ACCESS_LEVELS[level].description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </FieldSet>
        </FieldGroup>

        {/* bottom right from tablet up; full width on phones */}
        <div className="mt-6 flex flex-col gap-3 tablet:items-end">
          {form.formState.errors.root && (
            <p role="alert" className="text-fluid-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}
          <Button
            type="submit"
            size="xxl"
            disabled={form.formState.isSubmitting}
            className="gap-2 rounded-full"
          >
            {form.formState.isSubmitting ? (
              <>
                <Spinner /> Sending delegation…
              </>
            ) : (
              <>
                <SendHorizontal /> Send Delegate Invitation
              </>
            )}
          </Button>
        </div>
      </form>

      <Dialog open={isSentDialogOpen} onOpenChange={setIsSentDialogOpen}>
        <DialogContent className="gap-0 p-6 sm:max-w-[28rem]">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#EFFFFB]">
              <CircleCheck className="size-6 text-[#0F766E]" />
            </div>
            <div className="flex flex-col gap-2">
              <DialogTitle className="text-fluid-xl leading-snug font-bold text-balance">
                Invitation has been successfully sent.
              </DialogTitle>
              <DialogDescription className="text-pretty wrap-anywhere">
                {sentEmail} is listed under Pending Invitations until they
                accept. The invitation expires in {INVITATION_VALID_DAYS}{" "}
                days.
              </DialogDescription>
            </div>
            <DialogClose render={<Button size="xl" className="w-full" />}>
              Done
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
