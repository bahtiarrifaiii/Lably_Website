/**
 * Computes rental duration in days (minimum 1 day).
 */
function computeDays(borrowDate, returnDate) {
  if (!borrowDate || !returnDate) return 1;

  const startStr = String(borrowDate).slice(0, 10);
  const endStr = String(returnDate).slice(0, 10);

  const start = new Date(`${startStr}T00:00:00`);
  const end = new Date(`${endStr}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 1;
  }

  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return diff > 0 ? Math.ceil(diff) : 1;
}

/**
 * Parses formatted currency strings like "Rp1.234.000" or raw numeric strings.
 */
function parseCurrency(value, rawFallback = null) {
  if (value == null) return null;
  if (typeof value === "number") return value;
  if (rawFallback && !Number.isNaN(Number(rawFallback))) {
    return Number(rawFallback);
  }
  const cleaned = String(value).replace(/[^\d]/g, "");
  return cleaned === "" ? null : Number(cleaned);
}

module.exports = { computeDays, parseCurrency };
