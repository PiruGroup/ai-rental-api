// api/parse_availability_query.js

// No .env needed here now; purely local parsing
const chrono = require('chrono-node');

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { query } = req.body || {};

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "query" in request body.' });
    }

    console.log('Parsing query:', query);

    // Use chrono to parse all dates mentioned in the text
    const results = chrono.parse(query, new Date(), {
      forwardDate: true, // interpret ambiguous dates as future
    });

    if (!results || results.length === 0) {
      return res.status(200).json({ error: 'Could not parse dates' });
    }

    // Simple strategy:
    // - If there's an explicit range ("from X to Y"), chrono often gives one result with start/end.
    // - Otherwise, take the earliest and latest dates found as the range.
    let startDate, endDate;

    // Look for a result that has both start and end (an explicit range)
    const rangeResult = results.find(r => r.start && r.end);

    if (rangeResult) {
      startDate = rangeResult.start.date();
      endDate = rangeResult.end.date();
    } else {
      // Fallback: use first and last parsed dates
      const dates = results
        .map(r => r.start && r.start.date())
        .filter(Boolean)
        .sort((a, b) => a - b);

      if (dates.length === 0) {
        return res.status(200).json({ error: 'Could not parse dates' });
      }

      if (dates.length === 1) {
        // Single date: use same date for start and end
        startDate = dates[0];
        endDate = dates[0];
      } else {
        startDate = dates[0];
        endDate = dates[dates.length - 1];
      }
    }

    // Convert to YYYY-MM-DD
    const toIsoDate = (d) =>
      d.toISOString().slice(0, 10); // 2025-11-01

    const startIso = toIsoDate(startDate);
    const endIso = toIsoDate(endDate);

    console.log('Parsed dates:', { startDate: startIso, endDate: endIso });

    return res.status(200).json({
      startDate: startIso,
      endDate: endIso,
    });
  } catch (err) {
    console.error('Date parsing error:', err);
    return res.status(500).json({
      error: 'Failed to parse dates.',
      details: err.message || String(err),
    });
  }
};