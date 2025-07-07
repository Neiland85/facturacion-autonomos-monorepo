/**
 * Formats a number as a currency string.
 * @param amount The number to format.
 * @param currency The currency code (e.g., 'EUR', 'USD'). Defaults to 'EUR'.
 * @param locale The locale to use for formatting (e.g., 'es-ES', 'en-US'). Defaults to 'es-ES'.
 * @returns A string representing the formatted currency.
 */
export function formatCurrency(amount: number, currency = "EUR", locale = "es-ES"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount)
}
