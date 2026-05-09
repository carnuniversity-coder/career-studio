export const FALLBACK_RATES = {
  USD: 1,
  LKR: 305,
  EUR: 0.92,
  GBP: 0.79,
  INR: 84,
} as const;

export type SupportedCurrency = keyof typeof FALLBACK_RATES;

export const DEFAULT_CURRENCY: SupportedCurrency = "LKR";

const SYMBOLS: Record<SupportedCurrency, string> = {
  USD: "$",
  LKR: "Rs.",
  EUR: "€",
  GBP: "£",
  INR: "₹",
};

export function getCurrencySymbol(currency: SupportedCurrency = DEFAULT_CURRENCY) {
  return SYMBOLS[currency];
}

export function convertCurrency(
  amount: number,
  from: SupportedCurrency,
  to: SupportedCurrency,
) {
  const usdAmount = amount / FALLBACK_RATES[from];
  return usdAmount * FALLBACK_RATES[to];
}

export function formatCurrency(amount: number, currency: SupportedCurrency = DEFAULT_CURRENCY) {
  return `${getCurrencySymbol(currency)} ${new Intl.NumberFormat("en-LK", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}
