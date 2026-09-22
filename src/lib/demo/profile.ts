// An industry profile "skins" the shared demo storyline (skeleton.ts) with one
// industry's vocabulary, sites, equipment and incidents. The storyline itself
// (who reported what, which work orders are overdue, timings) stays the same,
// so every profile tells the same 5-minute demo story.
//
// To personalise for a prospect: copy the closest profile, rename things to
// match their operation, and register it in ./profiles/index.ts.

export type IndustryKey = "solar" | "telecom" | "facilities" | "oil-gas";

export interface Terms {
  site: string;        // "Site", "Tower site", "Building", "Facility"
  sites: string;
  technician: string;  // "Technician", "Engineer"
  technicians: string;
}

export interface SiteSkin {
  code: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  size?: number;
}

export interface AssetSkin {
  tag: string;
  name: string;
  type: 0 | 1 | 2 | 3 | 4;   // index into assetTypes
  manufacturer: string;
  model: string;
}

export interface Person {
  fullName: string;
  phone: string;
}

export interface IndustryProfile {
  key: IndustryKey;
  label: string;                 // shown in the demo switcher
  orgName: string;
  accent: string;                // brand colour (hex)
  managerTitle: string;
  timezone: string;              // IANA zone for displayed times
  terms: Terms;
  /** Optional per-site size, e.g. { unit: "kW", label: "installed" }. */
  siteSize?: { unit: string; label: string };
  /** 8 people. [0] is the manager presenting the demo, [7] is the admin. */
  people: [Person, Person, Person, Person, Person, Person, Person, Person];
  /** 6 sites. Index 3 is where the critical incident happens. */
  sites: [SiteSkin, SiteSkin, SiteSkin, SiteSkin, SiteSkin, SiteSkin];
  assetTypes: [
    { name: string; interval: number },
    { name: string; interval: number },
    { name: string; interval: number },
    { name: string; interval: number },
    { name: string; interval: number },
  ];
  /**
   * 14 assets, in storyline order:
   *  0–2 at site 3 (0 = the asset that fails critically, 2 = needs attention),
   *  3–4 at site 0, 5–6 at site 1 (5 = needs attention), 7–8 at site 2,
   *  9–10 at site 4 (9 = needs attention), 11–12 at site 5, 13 at site 4.
   */
  assets: AssetSkin[];
  /**
   * 5 issues: 0 critical on asset 0, 1 high on asset 5, 2 medium on asset 2,
   * 3 high on asset 9, 4 low (resolved) on asset 7.
   */
  issues: { title: string; description: string }[];
  /**
   * 9 work order titles:
   *  0 routine inspection of asset 0 (completed today)   1 repair for issue 1 on asset 5
   *  2 maintenance on asset 3 (in progress)                3 inspection of asset 2 (for issue 2)
   *  4 repair for issue 3 on asset 9 (unassigned)          5 routine inspection of site 5
   *  6 maintenance that resolved issue 4 on asset 7        7 overdue scheduled service of asset 5
   *  8 inspection of asset 10
   */
  workOrders: string[];
  /**
   * 8 maintenance history lines:
   *  0–3 for asset 0 (0 = today's inspection, 1 = maintenance ~1 month ago,
   *  2 = inspection ~3 months ago, 3 = installation ~13 months ago),
   *  4–5 for asset 5 (inspection yesterday, service ~7 weeks ago),
   *  6 for asset 7 (maintenance 3 days ago), 7 for asset 2 (inspection 2 days ago).
   */
  maintenance: string[];
}
