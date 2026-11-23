import { Screenshot } from "@/components/screenshot";
import type { Locale } from "@/lib/i18n";
import type { FeatureGroup } from "./groups";

const HALF = "(min-width: 1152px) 540px, 100vw";

/** The screenshots of a group, in the arrangement its pictures need: one, two one over the other, or a wide one and a phone. */
export function GroupMedia({ group, locale }: { group: FeatureGroup; locale: Locale }) {
  const shot = (id: FeatureGroup["shots"][number], sizes: string) => <Screenshot key={id} id={id} locale={locale} sizes={sizes} />;
  if (group.layout === "pair") {
    return <div className="flex flex-col divide-y divide-border">{group.shots.map((id) => shot(id, HALF))}</div>;
  }
  if (group.layout === "phone") {
    const [desktop, phone] = group.shots;
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,7rem)] gap-px bg-border sm:grid-cols-[minmax(0,1fr)_minmax(0,10rem)]">
        <div className="flex items-center bg-panel">{shot(desktop, "(min-width: 1152px) 370px, 70vw")}</div>
        <div className="bg-panel">{shot(phone, "160px")}</div>
      </div>
    );
  }
  return <>{group.shots.map((id) => shot(id, HALF))}</>;
}
