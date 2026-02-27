type CsvValue = string | number | boolean | null | undefined | Date;

function toStr(v: CsvValue) {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

function escapeCsv(value: string, delimiter: "," | ";" = ",") {
  const mustWrap = value.includes(delimiter) || value.includes("\n") || value.includes("\r") || value.includes('"');
  let out = value.replace(/"/g, '""');
  if (mustWrap) out = `"${out}"`;
  return out;
}

export function buildCsv(
  headers: string[],
  rows: Array<Array<CsvValue>>,
  opts?: { delimiter?: "," | ";"; withBom?: boolean },
) {
  const delimiter = opts?.delimiter ?? ",";
  const withBom = opts?.withBom ?? true;

  const lines: string[] = [];
  lines.push(headers.map((h) => escapeCsv(h, delimiter)).join(delimiter));

  for (const r of rows) {
    lines.push(r.map((v) => escapeCsv(toStr(v), delimiter)).join(delimiter));
  }

  const csv = lines.join("\r\n");
  return withBom ? "\uFEFF" + csv : csv;
}

export function downloadCsv(filename: string, csvText: string) {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}
