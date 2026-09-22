import type { IndustryKey } from "./profile";
import { isIndustryKey } from "./profiles";

export const DEMO_COOKIE = "fieldops_demo";

/** Presenter settings: which industry to show and how to brand it for a prospect. */
export interface DemoConfig {
  industry: IndustryKey;
  client?: string;   // prospect's company name
  color?: string;    // prospect's brand colour, #rrggbb
  logo?: string;     // https URL to the prospect's logo
  manager?: string;  // name of the person being demoed to
}

export const DEFAULT_CONFIG: DemoConfig = { industry: "solar" };

const clean = (v: unknown, max = 60) => {
  if (typeof v !== "string") return undefined;
  const s = v.trim().slice(0, max);
  return s || undefined;
};

/** Validates untrusted input (cookie, query string, form) into a safe config. */
export function sanitizeConfig(input: Record<string, unknown>): DemoConfig {
  const color = clean(input.color, 7);
  const logo = clean(input.logo, 500);
  return {
    industry: isIndustryKey(input.industry) ? input.industry : DEFAULT_CONFIG.industry,
    client: clean(input.client),
    manager: clean(input.manager),
    color: color && /^#[0-9a-f]{6}$/i.test(color) ? color : undefined,
    logo: logo && /^https:\/\/[^\s"'<>]+$/i.test(logo) ? logo : undefined,
  };
}

export function parseConfigCookie(raw: string | undefined): DemoConfig {
  if (!raw) return DEFAULT_CONFIG;
  try {
    return sanitizeConfig(JSON.parse(raw));
  } catch {
    return DEFAULT_CONFIG;
  }
}

/** Builds a shareable link that opens the demo pre-branded for a prospect. */
export function shareQuery(cfg: DemoConfig) {
  const q = new URLSearchParams();
  q.set("industry", cfg.industry);
  if (cfg.client) q.set("client", cfg.client);
  if (cfg.manager) q.set("manager", cfg.manager);
  if (cfg.color) q.set("color", cfg.color);
  if (cfg.logo) q.set("logo", cfg.logo);
  return q.toString();
}
