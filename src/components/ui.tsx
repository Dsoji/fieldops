import Link from "next/link";
import type { ReactNode } from "react";
import type { AssetStatus, IssueStatus, Priority, WorkOrderStatus } from "@/lib/types";
import { initials, titleCase } from "@/lib/format";

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <div className="mb-1 text-xs text-muted">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  action,
  children,
  className = "",
  padded = true,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={`rounded-lg border border-border bg-surface ${className}`}>
      {title && (
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-[13px] font-semibold">{title}</h2>
          {action}
        </header>
      )}
      <div className={padded ? "p-4" : ""}>{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "critical" | "ok";
}) {
  const valueColor = tone === "critical" ? "text-critical" : tone === "ok" ? "text-ok" : "text-text";
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-1.5 text-[28px] leading-none font-semibold tracking-tight ${valueColor}`}>{value}</div>
      {hint && <div className="mt-2 text-xs text-muted">{hint}</div>}
    </div>
  );
}

const toneClass = {
  critical: "bg-critical-bg text-critical",
  high: "bg-high-bg text-high",
  medium: "bg-medium-bg text-medium",
  low: "bg-neutral-bg text-muted",
  ok: "bg-ok-bg text-ok",
  info: "bg-info-bg text-info",
  neutral: "bg-neutral-bg text-muted",
} as const;

export function Badge({ tone, children, dot }: { tone: keyof typeof toneClass; children: ReactNode; dot?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap ${toneClass[tone]}`}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export const PriorityBadge = ({ value }: { value: Priority }) => (
  <Badge tone={value} dot>
    {titleCase(value)}
  </Badge>
);

const woTone: Record<WorkOrderStatus, keyof typeof toneClass> = {
  open: "neutral",
  assigned: "info",
  in_progress: "medium",
  completed: "ok",
  cancelled: "neutral",
};
export const WorkOrderStatusBadge = ({ value }: { value: WorkOrderStatus }) => (
  <Badge tone={woTone[value]}>{titleCase(value)}</Badge>
);

const issueTone: Record<IssueStatus, keyof typeof toneClass> = {
  open: "critical",
  acknowledged: "high",
  in_progress: "medium",
  resolved: "ok",
};
export const IssueStatusBadge = ({ value }: { value: IssueStatus }) => (
  <Badge tone={issueTone[value]}>{titleCase(value)}</Badge>
);

const assetTone: Record<AssetStatus, keyof typeof toneClass> = {
  operational: "ok",
  needs_attention: "high",
  down: "critical",
  retired: "neutral",
};
export const AssetStatusBadge = ({ value }: { value: AssetStatus }) => (
  <Badge tone={assetTone[value]} dot>
    {titleCase(value)}
  </Badge>
);

export function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const cls = size === "md" ? "size-9 text-xs" : "size-6 text-[10px]";
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-neutral-bg font-semibold text-muted ${cls}`}>
      {initials(name)}
    </span>
  );
}

export function Meter({ value, tone = "default" }: { value: number; tone?: "default" | "ok" | "critical" }) {
  const bar = tone === "ok" ? "bg-ok" : tone === "critical" ? "bg-critical" : "bg-text";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-bg">
      <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} />
    </div>
  );
}

export function Table({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-border text-[11px] tracking-wide text-faint uppercase">
            {head.map((h, i) => (
              <th key={i} className="px-4 py-2.5 font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-medium hover:underline">
      {children}
    </Link>
  );
}

export function Button({
  children,
  variant = "secondary",
  href,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  href?: string;
}) {
  const cls = {
    primary: "bg-text text-white hover:bg-text/90",
    secondary: "border border-border bg-surface hover:bg-surface-2",
    danger: "bg-critical text-white hover:bg-critical/90",
  }[variant];
  const base = `inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium ${cls}`;
  return href ? (
    <Link href={href} className={base}>
      {children}
    </Link>
  ) : (
    <button className={base}>{children}</button>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="px-4 py-10 text-center text-sm text-muted">{children}</div>;
}
