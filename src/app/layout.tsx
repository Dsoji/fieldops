import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { PresenterPanel } from "@/components/presenter-panel";
import { getStore, isOpenIssue } from "@/lib/data";
import { profileList } from "@/lib/demo/profiles";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await getStore();
  return {
    title: { default: `FieldOps · ${brand.orgName}`, template: `%s · ${brand.orgName}` },
    description: "Field teams, assets, inspections and maintenance in one platform.",
  };
}

/** Dark or light text on the brand colour, whichever reads better. */
function textOn(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.55 ? "#14130f" : "#ffffff";
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { brand, terms, currentUser, config, getIssues } = await getStore();
  const criticalCount = getIssues().filter((i) => isOpenIssue(i) && i.severity === "critical").length;
  const style = { "--accent": brand.accent, "--accent-fg": textOn(brand.accent) } as CSSProperties;

  return (
    <html lang="en" style={style} className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <div className="flex min-h-screen">
          <Sidebar criticalCount={criticalCount} brand={brand} terms={terms} />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar brand={brand} user={currentUser} />
            <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-8">{children}</main>
          </div>
        </div>
        <PresenterPanel config={config} industries={profileList} />
      </body>
    </html>
  );
}
