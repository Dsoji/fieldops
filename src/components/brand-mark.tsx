/* eslint-disable @next/next/no-img-element -- prospect logos come from arbitrary hosts */
export function BrandMark({ name, logo, size = "md" }: { name: string; logo?: string; size?: "sm" | "md" }) {
  const box = size === "sm" ? "size-7 text-xs" : "size-8 text-sm";
  if (logo) {
    return (
      <span className={`grid shrink-0 place-items-center overflow-hidden rounded-md bg-white ${box}`}>
        <img src={logo} alt={`${name} logo`} className="size-full object-contain p-0.5" />
      </span>
    );
  }
  return (
    <span className={`grid shrink-0 place-items-center rounded-md bg-accent font-mono font-bold text-accent-fg ${box}`}>
      {name.trim()[0]?.toUpperCase() ?? "F"}
    </span>
  );
}
