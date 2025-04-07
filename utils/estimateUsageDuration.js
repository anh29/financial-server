const { CATEGORY_DEFAULT_DURATION } = require("./constants");

/**
 * Estimate the usage duration of a transaction based on past transactions and category defaults.
 *
 * @param {Transaction} current
 * @param {Transaction[]} pastTransactions
 * @param {CategoryDefault[]} categoryDefaults
 * @returns {number} Estimated duration in days
 */
function estimateUsageDuration(current, pastTransactions) {
  const categoryDefaults = CATEGORY_DEFAULT_DURATION
  // Step 1: Filter relevant past transactions
  const relevantPast = pastTransactions
    .filter(t =>
      t.category === current.category &&
      t.name.toLowerCase().includes(current.name.toLowerCase()) &&
      new Date(t.date) < new Date(current.date)
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Step 2: Calculate average interval if at least 2 transactions exist
  if (relevantPast.length >= 2) {
    const intervals = [];
    for (let i = 1; i < relevantPast.length; i++) {
      const d1 = new Date(relevantPast[i - 1].date);
      const d2 = new Date(relevantPast[i].date);
      const diff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24); // days
      intervals.push(diff);
    }
    const avgDays = intervals.reduce((sum, d) => sum + d, 0) / intervals.length;

    // Step 3: Adjust by volume if applicable
    const lastVolume = relevantPast[relevantPast.length - 1].volume;
    if (lastVolume && current.volume) {
      const ratio = current.volume / lastVolume;
      return Math.round(avgDays * ratio);
    }

    return Math.round(avgDays);
  }

  // Step 4: Use category default if no sufficient history
  const defaultEntry = categoryDefaults.find(cd => cd.category === current.category);
  if (defaultEntry) {
    return defaultEntry.defaultDurationDays;
  }

  return 30; // 1 month
}

module.exports = { estimateUsageDuration };
