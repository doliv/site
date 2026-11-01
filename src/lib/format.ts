const tz = "Europe/Paris";
export const dateFr = (d: Date) => new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: tz }).format(d);
export const dateTimeFr = (d: Date) =>
  new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short", timeZone: tz }).format(d);

/** Interprets a "YYYY-MM-DDTHH:mm" value from <input type="datetime-local"> as Paris time. */
export function parisToDate(v: string) {
  const d = new Date(v + ":00Z");
  const paris = new Date(d.toLocaleString("en-US", { timeZone: tz }));
  const utc = new Date(d.toLocaleString("en-US", { timeZone: "UTC" }));
  return new Date(d.getTime() - (paris.getTime() - utc.getTime()));
}
export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "article";
