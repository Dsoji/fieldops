"use client";

import { useState, useTransition } from "react";
import { Check, Link2, Presentation, RotateCcw, X } from "lucide-react";
import { applyDemoConfig, resetDemoConfig } from "@/app/actions";
import { shareQuery, type DemoConfig } from "@/lib/demo/config";
import type { IndustryKey } from "@/lib/demo/profile";

interface Props {
  config: DemoConfig;
  industries: { key: IndustryKey; label: string; orgName: string; accent: string }[];
}

const field = "h-9 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none focus:border-text";
const label = "mb-1 block text-[11px] font-medium text-muted";

/**
 * Presenter-only controls: switch the demo between industries and brand it
 * for the prospect in the room. Hidden behind a small button in the corner.
 */
export function PresenterPanel({ config, industries }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const switchIndustry = (key: IndustryKey) => {
    const fd = new FormData();
    fd.set("industry", key);
    // Keep prospect branding when switching industries.
    for (const k of ["client", "manager", "color", "logo"] as const) if (config[k]) fd.set(k, config[k]!);
    startTransition(() => applyDemoConfig(fd));
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/demo?${shareQuery(config)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link", url);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-4 z-50 inline-flex h-10 items-center gap-2 rounded-full bg-text px-4 text-sm font-medium text-white shadow-lg shadow-black/20 hover:bg-text/90"
      >
        <Presentation className="size-4" /> Demo
      </button>
    );
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 w-[min(360px,calc(100vw-2rem))] rounded-xl border border-border bg-surface shadow-2xl shadow-black/15">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Presentation className="size-4" /> Demo controls
          {pending && <span className="text-[11px] font-normal text-muted">Updating…</span>}
        </div>
        <button onClick={() => setOpen(false)} className="text-muted hover:text-text" aria-label="Close">
          <X className="size-4" />
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <span className={label}>Industry</span>
          <div className="grid grid-cols-2 gap-1.5">
            {industries.map((ind) => (
              <button
                key={ind.key}
                onClick={() => switchIndustry(ind.key)}
                disabled={pending}
                className={`flex items-center gap-2 rounded-md border px-2.5 py-2 text-left text-xs font-medium ${
                  config.industry === ind.key ? "border-text bg-surface-2" : "border-border hover:bg-surface-2"
                }`}
              >
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: ind.accent }} />
                {ind.label}
              </button>
            ))}
          </div>
        </div>

        <form
          key={JSON.stringify(config)}
          action={(fd) => startTransition(() => applyDemoConfig(fd))}
          className="space-y-3 border-t border-border pt-4"
        >
          <input type="hidden" name="industry" value={config.industry} />
          <div className="text-[11px] font-semibold tracking-wide text-faint uppercase">Brand for a prospect</div>
          <div>
            <label className={label} htmlFor="p-client">Company name</label>
            <input id="p-client" name="client" defaultValue={config.client} placeholder="e.g. Acme Towers" className={field} />
          </div>
          <div>
            <label className={label} htmlFor="p-manager">Who you&apos;re demoing to</label>
            <input id="p-manager" name="manager" defaultValue={config.manager} placeholder="e.g. Jane Doe" className={field} />
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <div>
              <label className={label} htmlFor="p-logo">Logo URL (https)</label>
              <input id="p-logo" name="logo" defaultValue={config.logo} placeholder="https://…/logo.png" className={field} />
            </div>
            <div>
              <label className={label} htmlFor="p-color">Colour</label>
              <input
                id="p-color"
                name="color"
                type="color"
                defaultValue={config.color ?? industries.find((i) => i.key === config.industry)?.accent}
                className="h-9 w-12 cursor-pointer rounded-md border border-border bg-surface p-1"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={pending} className="h-9 flex-1 rounded-md bg-text text-sm font-medium text-white hover:bg-text/90">
              Apply branding
            </button>
            <button
              type="button"
              onClick={() => startTransition(() => resetDemoConfig())}
              className="grid size-9 place-items-center rounded-md border border-border text-muted hover:text-text"
              aria-label="Reset demo"
              title="Reset to default demo"
            >
              <RotateCcw className="size-4" />
            </button>
          </div>
        </form>

        <button
          onClick={copyLink}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border text-sm font-medium hover:bg-surface-2"
        >
          {copied ? <Check className="size-4 text-ok" /> : <Link2 className="size-4" />}
          {copied ? "Link copied" : "Copy personalised demo link"}
        </button>
      </div>
    </div>
  );
}
