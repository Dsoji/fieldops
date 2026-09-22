import type { IndustryKey, IndustryProfile } from "../profile";
import { facilities } from "./facilities";
import { oilGas } from "./oil-gas";
import { solar } from "./solar";
import { telecom } from "./telecom";

export const profiles: Record<IndustryKey, IndustryProfile> = {
  solar,
  telecom,
  facilities,
  "oil-gas": oilGas,
};

export const profileList = Object.values(profiles).map((p) => ({ key: p.key, label: p.label, orgName: p.orgName, accent: p.accent }));

export const isIndustryKey = (v: unknown): v is IndustryKey => typeof v === "string" && v in profiles;
