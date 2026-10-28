"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema } from "@/modules/settings/schema";
import { clientApi } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { toast } from "sonner";
export function ContactForm() {
  const form = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { subject: "", message: "" },
  });
  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        try {
          await clientApi("/api/contact", {
            method: "POST",
            body: JSON.stringify(values),
          });
          toast.success("Message sent");
          form.reset();
        } catch (e) {
          form.setError("root", { message: (e as Error).message });
        }
      })}
    >
      <Field>
        <FieldLabel htmlFor="contact-subject">Subject</FieldLabel>
        <Input id="contact-subject" {...form.register("subject")} />
        <FieldError>{form.formState.errors.subject?.message}</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="contact-message">Message</FieldLabel>
        <Textarea id="contact-message" {...form.register("message")} />
        <FieldError>{form.formState.errors.message?.message}</FieldError>
      </Field>
      <FieldError>{form.formState.errors.root?.message}</FieldError>
      <Button disabled={form.formState.isSubmitting}>Send message</Button>
    </form>
  );
}
