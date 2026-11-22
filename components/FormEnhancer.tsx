"use client";

/**
 * Makes the contact form send without leaving the page (when JavaScript works).
 * Without JavaScript the form still posts normally. This only adds comfort.
 */
import { useEffect, useState } from "react";
import { track } from "@/lib/track";

type Messages = { sending: string; success: string; error: string; tooMany: string; fixErrors: string };

export function FormEnhancer({ formId, messages }: { formId: string; messages: Messages }) {
  const [status, setStatus] = useState<{ kind: "idle" | "sending" | "ok" | "error"; text: string }>({
    kind: "idle",
    text: "",
  });

  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;

    const onSubmit = async (e: SubmitEvent) => {
      e.preventDefault();
      form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
      setStatus({ kind: "sending", text: messages.sending });
      const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (button) button.disabled = true;
      try {
        const res = await fetch(form.action, {
          method: "POST",
          headers: { "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
        });
        const body = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus({ kind: "ok", text: messages.success });
          track("form-submit", { need: String(new FormData(form).get("need") ?? "") });
          form.reset();
        } else if (res.status === 400 && body.errors) {
          for (const name of Object.keys(body.errors)) {
            form.querySelector(`[name="${name}"]`)?.setAttribute("aria-invalid", "true");
          }
          const first = Object.values(body.errors)[0] as string;
          setStatus({ kind: "error", text: `${messages.fixErrors} ${first}` });
          form.querySelector<HTMLElement>("[aria-invalid]")?.focus();
        } else if (res.status === 429) {
          setStatus({ kind: "error", text: messages.tooMany });
        } else {
          setStatus({ kind: "error", text: messages.error });
        }
      } catch {
        setStatus({ kind: "error", text: messages.error });
      } finally {
        if (button) button.disabled = false;
      }
    };

    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [formId, messages]);

  return (
    <p
      role="status"
      aria-live="polite"
      className={
        status.kind === "ok"
          ? "rounded-xl bg-wa/15 p-3 font-bold text-wa"
          : status.kind === "error"
            ? "rounded-xl bg-danger/15 p-3 font-bold text-danger"
            : status.kind === "sending"
              ? "text-muted"
              : "sr-only"
      }
    >
      {status.text}
    </p>
  );
}
