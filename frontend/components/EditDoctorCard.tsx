"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, UserPen, Check, X } from "lucide-react";
import { DialogClose } from "@/components/ui/dialog";
import * as z from "zod";
import { editDoctorCard } from "@/lib/api/doctor-cards";
import { DoctorCardData } from "@/lib/types";
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
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";

// defining the zod schema for client input validation
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

export default function EditDoctorCard({
  setDoctorCards,
  setShowSpinner,
  setIsDialogOpen,
  showSpinner,
  ...card
}: DoctorCardData & {
  setDoctorCards: Dispatch<SetStateAction<DoctorCardData[]>>;
  setShowSpinner: Dispatch<SetStateAction<boolean>>;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  showSpinner: boolean;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctorName: card.doctorName,
      specialty: card.specialty,
      clinicName: card.clinicName ?? "",
      phone: card.phone ?? "",
      website: card.website ?? "",
      streetAddress1: card.streetAddress1,
      streetAddress2: card.streetAddress2 ?? "",
      city: card.city,
      stateProvince: card.stateProvince,
      zipCode: card.zipCode ?? "",
      country: card.country,
      notes: card.notes ?? "",
    },
  });

  // React Hook Form automatically handling on-submit form event. only triggered if all client input passes the Zod Schema
  async function onSubmit(data: z.infer<typeof formSchema>) {
    setShowSpinner(true);
    const editedCard: DoctorCardData = await editDoctorCard(card.cardId, data);
    setDoctorCards((cards) =>
      cards.map((card) =>
        card.cardId === editedCard.cardId ? editedCard : card,
      ),
    );
    setShowSpinner(false);
    setIsDialogOpen(false);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-[#C6FFF3] bg-[#EFFFFB] p-2">
              <UserPen color="#0F766E" />
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle>Edit Doctor Card</CardTitle>
              <CardDescription>
                Edit healthcare provider details to update the information in
                your directory.
              </CardDescription>
            </div>
          </div>
          <DialogClose render={<Button variant="ghost" size="icon-sm" />}>
            <X />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>
      </CardHeader>
      <FieldSeparator />
      <CardContent>
        <form
          id="form-rhf-demo"
          onSubmit={form.handleSubmit(onSubmit, (errors) =>
            console.log(errors),
          )}
        >
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="doctorName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-title">
                      Doctor Name <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-title"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. Dr. Marcus Smith, MD"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="specialty"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-title">
                      Specialty <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-title"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. Cardiology"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="clinicName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-title">
                      Clinic/Hospital Name
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-title"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-title">
                      Phone Number
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-title"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="website"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="col-span-full"
                  >
                    <FieldLabel htmlFor="form-rhf-demo-title">
                      Website URL
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-title"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. https://northwestcardio.org"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            <FieldSeparator />
            <h3 className="text-s font-semibold tracking-wide text-muted-foreground">
              OFFICE LOCATION
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <Controller
                name="streetAddress1"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="col-span-full"
                  >
                    <FieldLabel htmlFor="form-rhf-demo-title">
                      Street Address 1{" "}
                      <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-title"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. 742 Evergreen Terrace"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="streetAddress2"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="col-span-full"
                  >
                    <FieldLabel htmlFor="form-rhf-demo-title">
                      Street Address 2
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-title"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. Suite 400, Building B"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="city"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-title">
                      City <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-title"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="stateProvince"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-title">
                      State/Province <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-title"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="zipCode"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-title">
                      Zip/Postal Code
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-title"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="country"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-title">
                      Country <span className="text-destructive">*</span>
                    </FieldLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="outline"
                            className="flex justify-between"
                          >
                            {field.value || "Select a country"} <ChevronDown />
                          </Button>
                        }
                      />
                      <DropdownMenuContent className="w-40" align="start">
                        <DropdownMenuItem
                          onClick={() => field.onChange("United States")}
                        >
                          United States
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => field.onChange("Canada")}
                        >
                          Canada
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="notes"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="col-span-full"
                  >
                    <FieldLabel htmlFor="form-rhf-demo-description">
                      Notes
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id="form-rhf-demo-description"
                        placeholder="Special referral requirements, direct nurse triage line, or portal login notes..."
                        rows={6}
                        className="min-h-24 resize-none"
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {field.value.length}/1000 characters
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal" className="justify-end">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form="form-rhf-demo">
            <Check color="#FFFFFF" /> Save Changes
          </Button>
          {showSpinner && <Spinner />}
        </Field>
      </CardFooter>
    </Card>
  );
}
