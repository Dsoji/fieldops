"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, ClipboardList, LayoutDashboard, MapPin, Settings, TriangleAlert, Users } from "lucide-react";
import type { Terms } from "@/lib/demo/profile";
import { BrandMark } from "./brand-mark";

interface Props {
  criticalCount: number;
  brand: { orgName: string; logo?: string };
  terms: Terms;
}

export function Sidebar({ criticalCount, brand, terms }: Props) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const nav = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/issues", label: "Issues", icon: TriangleAlert, badge: criticalCount },
    { href: "/work-orders", label: "Work orders", icon: ClipboardList },
    { href: "/sites", label: terms.sites, icon: MapPin },
    { href: "/assets", label: "Assets", icon: Boxes },
    { href: "/workers", label: "Field team", icon: Users },
    { href: "/reports", label: "Reports", icon: BarChart3 },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-sidebar text-sidebar-text md:flex">
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-6">
        <BrandMark name={brand.orgName} logo={brand.logo} />
        <div className="min-w-0 leading-tight">
          <div className="truncate text-sm font-semibold tracking-tight text-white">{brand.orgName}</div>
          <div className="text-[11px] text-sidebar-text/70">Field Operations</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {nav.map(({ href, label, icon: Icon, badge }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors ${
                active ? "bg-white/10 text-white" : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className={`size-4 ${active ? "text-accent" : "text-sidebar-text/70 group-hover:text-white"}`} />
              <span className="flex-1">{label}</span>
              {badge ? (
                <span className="pulse-critical grid h-5 min-w-5 place-items-center rounded-full bg-critical px-1.5 text-[10px] font-semibold text-white">
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-3">
        <span className="flex items-center gap-3 rounded-md px-3 py-2 text-[13px] text-sidebar-text/60">
          <Settings className="size-4" />
          Settings
        </span>
        <div className="px-3 pt-2 text-[10px] tracking-wide text-sidebar-text/40 uppercase">Powered by FieldOps</div>
      </div>
    </aside>
  );
}
