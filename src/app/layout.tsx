import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { getIssues, isOpenIssue } from "@/lib/data";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "FieldOps", template: "%s · FieldOps" },
  description: "Field teams, assets, inspections and maintenance in one platform.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const criticalCount = getIssues().filter((i) => isOpenIssue(i) && i.severity === "critical").length;
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <div className="flex min-h-screen">
          <Sidebar criticalCount={criticalCount} />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
