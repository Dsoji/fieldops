"use server";

import { cookies } from "next/headers";
import { DEMO_COOKIE, sanitizeConfig } from "@/lib/demo/config";

const YEAR = 60 * 60 * 24 * 365;

/** Presenter panel: switch industry and apply prospect branding. */
export async function applyDemoConfig(formData: FormData) {
  const cfg = sanitizeConfig(Object.fromEntries(formData));
  (await cookies()).set(DEMO_COOKIE, JSON.stringify(cfg), { path: "/", maxAge: YEAR, sameSite: "lax" });
}

export async function resetDemoConfig() {
  (await cookies()).delete(DEMO_COOKIE);
}
