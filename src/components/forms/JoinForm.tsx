"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { applicationSchema, type ApplicationInput } from "@/lib/validation";

export function JoinForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { name: "", class: "", contact: "", message: "" },
  });

  async function onSubmit(values: ApplicationInput) {
    setStatus("idle");
    setErrorMessage("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data?.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
      setErrorMessage("Could not reach the server. Please check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="card-surface flex flex-col items-start gap-3 border-teal/30 bg-teal/[0.06] p-6 sm:p-8"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal/15 text-teal">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="font-display text-xl">Application received</h2>
        <p className="text-pretty leading-relaxed text-muted">
          Thanks for applying to KSC. We&apos;ll review your application and contact you after
          review — usually within a week, using the phone number or email you gave us.
        </p>
        <button type="button" className="btn-ghost mt-2" onClick={() => setStatus("idle")}>
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card-surface p-6 sm:p-8">
      <h2 className="font-display text-xl">Apply to join KSC</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Open to every student at Kanti Secondary School. Fields marked required must be filled in.
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="name" className="label">
            Full name <span className="text-danger">*</span>
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className="field"
            placeholder="e.g. Nischal Karki"
            {...register("name")}
          />
          {errors.name && (
            <p id="name-error" className="mt-1.5 flex items-center gap-1.5 text-sm text-danger">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="class" className="label">
            Class / Grade <span className="text-danger">*</span>
          </label>
          <input
            id="class"
            type="text"
            aria-invalid={Boolean(errors.class)}
            aria-describedby={errors.class ? "class-error" : undefined}
            className="field"
            placeholder="e.g. Grade 10"
            {...register("class")}
          />
          {errors.class && (
            <p id="class-error" className="mt-1.5 flex items-center gap-1.5 text-sm text-danger">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {errors.class.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact" className="label">
            Contact — phone or email <span className="text-danger">*</span>
          </label>
          <input
            id="contact"
            type="text"
            aria-invalid={Boolean(errors.contact)}
            aria-describedby={errors.contact ? "contact-error" : "contact-hint"}
            className="field"
            placeholder="98XXXXXXXX or you@example.com"
            {...register("contact")}
          />
          {errors.contact ? (
            <p id="contact-error" className="mt-1.5 flex items-center gap-1.5 text-sm text-danger">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {errors.contact.message}
            </p>
          ) : (
            <p id="contact-hint" className="mt-1.5 text-xs text-faint">
              We only use this to contact you about your application.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="message" className="label">
            Why do you want to join? <span className="text-danger">*</span>
          </label>
          <textarea
            id="message"
            rows={5}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "message-error" : undefined}
            className="field resize-y"
            placeholder="Tell us what you'd like to explore, build or learn with the club."
            {...register("message")}
          />
          {errors.message && (
            <p id="message-error" className="mt-1.5 flex items-center gap-1.5 text-sm text-danger">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {errors.message.message}
            </p>
          )}
        </div>
      </div>

      {status === "error" && (
        <p role="alert" className="mt-6 flex items-start gap-2 rounded-soft bg-danger/10 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {errorMessage}
        </p>
      )}

      <button type="submit" className="btn-primary mt-7 w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" aria-hidden="true" />
            Submit application
          </>
        )}
      </button>
    </form>
  );
}
