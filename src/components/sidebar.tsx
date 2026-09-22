"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  MapPin,
  Settings,
  TriangleAlert,
  Users,
} from "lucide-react";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/issues", label: "Issues", icon: TriangleAlert, badgeKey: "issues" },
  { href: "/work-orders", label: "Work orders", icon: ClipboardList },
  { href: "/sites", label: "Sites", icon: MapPin },
  { href: "/assets", label: "Assets", icon: Boxes },
  { href: "/workers", label: "Field team", icon: Users },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export function Sidebar({ criticalCount }: { criticalCount: number }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-sidebar text-sidebar-text md:flex">
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-6">
        <div className="grid size-8 place-items-center rounded-md bg-accent font-mono text-sm font-bold text-sidebar">
          F
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight text-white">FieldOps</div>
          <div className="text-[11px] text-sidebar-text/70">SunGrid Energy</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {nav.map(({ href, label, icon: Icon, badgeKey }) => {
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
              {badgeKey === "issues" && criticalCount > 0 && (
                <span className="pulse-critical grid h-5 min-w-5 place-items-center rounded-full bg-critical px-1.5 text-[10px] font-semibold text-white">
                  {criticalCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-3">
        <Link href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-[13px] hover:bg-white/5 hover:text-white">
          <Settings className="size-4 text-sidebar-text/70" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
