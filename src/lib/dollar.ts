import { cookies } from "next/headers";

export type DollarKind = "blue" | "oficial";

export interface DollarQuote {
  kind: DollarKind;
  name: string;
  /** What you get for one dollar when you sell it. Used to value USD balances. */
  buy: number;
  /** What one dollar costs. */
  sell: number;
  updatedAt: string;
}

export interface DollarRates {
  blue: DollarQuote;
  oficial: DollarQuote;
  /** The quote the user picked to convert USD accounts to pesos. */
  selected: DollarQuote;
}

export const DOLLAR_COOKIE = "pb_usd";

interface DolarApiItem {
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

/**
 * Today's blue and official dollar from dolarapi.com, cached for 15 minutes.
 * Returns null if the service is down, so the app keeps working without it.
 */
export async function getDollarRates(): Promise<DollarRates | null> {
  let items: DolarApiItem[];
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares", {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    items = await res.json();
  } catch {
    return null;
  }

  const pick = (kind: DollarKind): DollarQuote | null => {
    const item = items.find((i) => i.casa === kind);
    if (!item || !item.compra || !item.venta) return null;
    return {
      kind,
      name: item.nombre,
      buy: Number(item.compra),
      sell: Number(item.venta),
      updatedAt: item.fechaActualizacion,
    };
  };

  const blue = pick("blue");
  const oficial = pick("oficial");
  if (!blue || !oficial) return null;

  const store = await cookies();
  const selected = store.get(DOLLAR_COOKIE)?.value === "oficial" ? oficial : blue;
  return { blue, oficial, selected };
}

/** Converts an amount in the account's currency to pesos. Unknown currencies are left as-is. */
export function toPesos(amount: number, currency: string, rates: DollarRates | null) {
  if (currency === "USD" && rates) return amount * rates.selected.buy;
  return amount;
}
