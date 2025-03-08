"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import confetti from "canvas-confetti";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const validateCorporationNumber = async (value: string) => {
  try {
    if (value.length !== 9) {
      return "Please enter a 9 digit number";
    }
    if (isNaN(Number(value))) {
      return "Please enter a valid number";
    }
    const response = await fetch(
      `https://fe-hometask-api.dev.vault.tryvault.com/corporation-number/${value}`
    );
    const data = await response.json();
    return data.valid || data.message;
  } catch (error) {
    return "Failed to validate corporation number: " + error;
  }
};

const formSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(55, "Name cannot exceed 50 characters")
    .refine((value) => {
      console.log("value", value);
      return value.length <= 50;
    }, "Name cannot exceed 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Name cannot exceed 50 characters")
    .refine(
      (value) => value.length <= 50,
      "Last name cannot exceed 50 characters"
    ),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .refine((value) => {
      return value.startsWith("+1") && value.length === 12;
    }, "Please enter a valid Canadian phone number"),
  corporationNumber: z
    .string()
    .min(1, "Corporation number is required")
    .refine(
      (value) => /^\d{9,}$/.test(value),
      "Corporation number must be 9 digits"
    )
    .refine(async (value) => {
      const result = await validateCorporationNumber(value);
      return result === true;
    }, "Invalid corporation number"),
});

export default function OnboardingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "+1",
      corporationNumber: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(
        "https://fe-hometask-api.dev.vault.tryvault.com/profile-details",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: values.firstName,
            lastName: values.lastName,
            corporationNumber: values.corporationNumber,
            phone: values.phoneNumber,
          }),
        }
      );

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Form submitted successfully!",
        });
        form.reset();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        const data = await response.json();
        setSubmitStatus({
          type: "error",
          message: data.message || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Failed to submit form. Please try again. " + error,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-xl shadow-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-normal">Onboarding Form</CardTitle>
      </CardHeader>
      <CardContent>
        {submitStatus && (
          <div
            id="form-alert"
            className={`mb-6 p-4 rounded-md ${
              submitStatus.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {submitStatus.message}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        id="firstName"
                        data-testid="first-name-input"
                        placeholder=""
                        className="mb-auto"
                        maxLength={75}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        id="lastName"
                        data-testid="last-name-input"
                        placeholder=""
                        maxLength={75}
                        {...field}
                        onChange={(e) => {
                          if (e.target.value.length <= 50) {
                            field.onChange(e);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <PhoneInput
                      id="phone-input"
                      data-testid="phone-input"
                      international
                      defaultCountry="CA"
                      value={field.value}
                      onChange={(value) => field.onChange(value || "")}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="corporationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Corporation Number</FormLabel>
                  <FormControl>
                    <Input
                      id="corporation-number-input"
                      data-testid="corporation-number-input"
                      placeholder=""
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <Button
              id="submit-button"
              data-testid="submit-button"
              type="submit"
              className="w-full bg-black text-white hover:bg-black/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  Submit <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
