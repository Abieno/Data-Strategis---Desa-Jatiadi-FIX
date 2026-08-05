export const nf = new Intl.NumberFormat("id-ID");

export function formatNumber(value: number | null | undefined, fallback = "-") {
  if (value == null || Number.isNaN(value)) return fallback;
  return nf.format(value);
}

export function formatPercent(value: number | null | undefined, digits = 1) {
  if (value == null || Number.isNaN(value)) return "-";
  return `${value.toFixed(digits).replace(".", ",")}%`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function titleCase(value: string) {
  return value
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
