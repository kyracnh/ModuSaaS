"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient } from "@/modules/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
const schema = z.object({
  name: z.string().optional(),
  email: z.email(),
  password: z.string().min(12, "Use at least 12 characters").max(128),
});
export function AuthForm({ register = false }: { register?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });
  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit(async (v) => {
        setError("");
        setNotice("");
        const result = register
          ? await authClient.signUp.email({
              ...v,
              name: v.name || v.email.split("@")[0],
            })
          : await authClient.signIn.email({
              email: v.email,
              password: v.password,
            });
        if (result.error) {
          setError(result.error.message ?? "Authentication failed");
          return;
        }
        if (register && !result.data?.token) {
          setNotice("Check your email to verify your account, then sign in.");
          return;
        }
        router.push("/dashboard");
        router.refresh();
      })}
    >
      {register && (
        <Field>
          <FieldLabel htmlFor="name">Your name</FieldLabel>
          <Input id="name" autoComplete="name" {...form.register("name")} />
        </Field>
      )}
      <Field data-invalid={!!form.formState.errors.email}>
        <FieldLabel htmlFor="email">Email address</FieldLabel>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...form.register("email")}
        />
        <FieldError>{form.formState.errors.email?.message}</FieldError>
      </Field>
      <Field data-invalid={!!form.formState.errors.password}>
        <div className="flex justify-between">
          <FieldLabel htmlFor="password">Password</FieldLabel>
          {!register && (
            <Link
              className="text-xs text-muted-foreground"
              href="/forgot-password"
            >
              Forgot password?
            </Link>
          )}
        </div>
        <Input
          id="password"
          type="password"
          autoComplete={register ? "new-password" : "current-password"}
          {...form.register("password")}
        />
        <FieldError>{form.formState.errors.password?.message}</FieldError>
      </Field>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-sm">
          {notice}
        </p>
      )}
      <Button className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting
          ? "Please wait…"
          : register
            ? "Create account"
            : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {register ? "Already have an account?" : "New here?"}{" "}
        <Link
          className="font-medium text-foreground underline"
          href={register ? "/login" : "/register"}
        >
          {register ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
