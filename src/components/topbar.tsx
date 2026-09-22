import { Bell, Plus, Search } from "lucide-react";
import Link from "next/link";
import { initials } from "@/lib/format";
import { BrandMark } from "./brand-mark";

interface Props {
  brand: { orgName: string; logo?: string };
  user: { fullName: string; title: string };
}

export function Topbar({ brand, user }: Props) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-bg/85 px-4 backdrop-blur md:px-8">
      <div className="flex min-w-0 items-center gap-2 md:hidden">
        <BrandMark name={brand.orgName} logo={brand.logo} size="sm" />
        <span className="truncate text-sm font-semibold">{brand.orgName}</span>
      </div>

      <label className="hidden h-9 max-w-sm flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm text-faint md:flex">
        <Search className="size-4" />
        <input placeholder="Search assets, sites, work orders…" className="w-full bg-transparent text-text outline-none placeholder:text-faint" />
        <kbd className="rounded border border-border px-1.5 font-mono text-[10px]">⌘K</kbd>
      </label>

      <div className="ml-auto flex items-center gap-2">
        <Link href="/work-orders/new" className="inline-flex h-9 items-center gap-1.5 rounded-md bg-text px-3 text-sm font-medium text-white hover:bg-text/90">
          <Plus className="size-4" />
          <span className="hidden sm:inline">New work order</span>
        </Link>
        <button className="relative grid size-9 place-items-center rounded-md border border-border bg-surface text-muted hover:text-text" aria-label="Notifications">
          <Bell className="size-4" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-critical" />
        </button>
        <div className="ml-1 flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent-ink">{initials(user.fullName)}</div>
          <div className="hidden leading-tight lg:block">
            <div className="text-[13px] font-medium">{user.fullName}</div>
            <div className="text-[11px] text-muted">{user.title}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
