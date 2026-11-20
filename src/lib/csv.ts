// CSV backup of movements. Uses ";" and decimal comma so it opens right in
// Excel configured in Spanish (Argentina); Google Sheets reads it too.

export const CSV_HEADERS = ["Fecha", "Tipo", "Monto", "Moneda", "Cuenta", "Categoría", "Descripción"] as const;

export interface CsvMovement {
  occurred_at: string; // YYYY-MM-DD
  type: "income" | "expense";
  amount: number;
  currency: string;
  account: string;
  category: string;
  description: string;
}

function escapeCell(value: string) {
  return /[";\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function formatAmount(n: number) {
  return String(Math.round(n * 100) / 100).replace(".", ",");
}

export function movementsToCsv(rows: CsvMovement[]) {
  const lines = [CSV_HEADERS.join(";")];
  for (const r of rows) {
    lines.push(
      [
        r.occurred_at,
        r.type === "income" ? "Ingreso" : "Gasto",
        formatAmount(r.amount),
        r.currency,
        r.account,
        r.category,
        r.description,
      ]
        .map(escapeCell)
        .join(";")
    );
  }
  // BOM so Excel detects UTF-8 (accents).
  return "﻿" + lines.join("\r\n") + "\r\n";
}

/** Splits CSV text into rows of cells, honoring quotes. Detects ";" or "," as separator. */
export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^﻿/, "");
  const firstLine = clean.split(/\r?\n/, 1)[0] ?? "";
  const sep = (firstLine.match(/;/g)?.length ?? 0) >= (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (quoted) {
      if (ch === '"' && clean[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === sep) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && clean[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

function normalize(s: string) {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** "1.234,56", "1234.56", "$ -1.500" → number. */
function parseAmount(raw: string) {
  let s = raw.replace(/[^\d,.-]/g, "");
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma > lastDot) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma && lastComma >= 0) {
    s = s.replace(/,/g, "");
  } else if (lastComma < 0 && /^-?\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, ""); // "15.000" = fifteen thousand
  }
  return Number(s);
}

/** YYYY-MM-DD, DD/MM/YYYY or DD-MM-YYYY → YYYY-MM-DD, or null. */
function parseDate(raw: string) {
  const s = raw.trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (m) {
    const year = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${year}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  return null;
}

/**
 * Reads movements from a CSV made by this app (or a similar one with
 * columns Fecha, Tipo, Monto, Cuenta, Categoría, Descripción). Returns the
 * valid ones and how many lines were skipped.
 */
export function csvToMovements(text: string): { movements: CsvMovement[]; skipped: number; error?: string } {
  const rows = parseCsv(text);
  if (rows.length < 2) return { movements: [], skipped: 0, error: "El archivo está vacío" };

  const header = rows[0].map(normalize);
  const col = (...names: string[]) => header.findIndex((h) => names.includes(h));
  const iDate = col("fecha", "date");
  const iType = col("tipo", "type");
  const iAmount = col("monto", "importe", "amount");
  const iCurrency = col("moneda", "currency");
  const iAccount = col("cuenta", "account");
  const iCategory = col("categoria", "category");
  const iDescription = col("descripcion", "detalle", "concepto", "description");

  if (iDate < 0 || iAmount < 0) {
    return { movements: [], skipped: 0, error: "No encontramos las columnas Fecha y Monto" };
  }

  const movements: CsvMovement[] = [];
  let skipped = 0;
  for (const row of rows.slice(1)) {
    const date = parseDate(row[iDate] ?? "");
    const rawAmount = parseAmount(row[iAmount] ?? "");
    if (!date || !Number.isFinite(rawAmount) || rawAmount === 0) {
      skipped++;
      continue;
    }
    const typeCell = iType >= 0 ? normalize(row[iType] ?? "") : "";
    // Without a "Tipo" column, negative amounts are expenses and positive ones income.
    const type: CsvMovement["type"] =
      typeCell.startsWith("ingreso") || typeCell === "income" || (iType < 0 && rawAmount > 0)
        ? "income"
        : "expense";
    movements.push({
      occurred_at: date,
      type,
      amount: Math.abs(rawAmount),
      currency: (iCurrency >= 0 ? row[iCurrency]?.trim().toUpperCase() : "") || "ARS",
      account: (iAccount >= 0 ? row[iAccount]?.trim() : "") || "Efectivo",
      category: iCategory >= 0 ? (row[iCategory]?.trim() ?? "") : "",
      description: iDescription >= 0 ? (row[iDescription]?.trim() ?? "") : "",
    });
  }
  return { movements, skipped };
}
