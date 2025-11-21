// api/get_available_properties.js

// Load root .env when running locally. On Vercel, env vars are injected.
if (process.env.NODE_ENV !== 'production') {
  const path = require('path');
  require('dotenv').config({
    path: path.join(__dirname, '..', '.env'),
  });
}

const axios = require('axios');

// 🏠 Your list of property UUIDs + names
const properties = [
  { uuid: 'c1e44fc6-3d51-450c-980e-52a2829b2db1', name: '02 - H2 - 12612 Piru Manors' },
  { uuid: '83797288-2201-4366-b549-063636c46302', name: '01 -H1 - 12804 Piru Manors' },
  { uuid: '028d382c-00be-47ac-9e11-a276dae118bb', name: 'Property 3' },
  { uuid: 'cddb7f45-84be-422c-af99-bd9d02486a38', name: 'Property 4' },
  { uuid: 'be67281d-697c-4fa4-9816-cb15f886ccc4', name: 'Property 5' },
  { uuid: '92c027fa-5380-4691-a97c-fff4aa496895', name: 'Property 6' },
  { uuid: '9fdc479f-0c58-4b34-8d32-be168c58b565', name: 'Property 7' },
  { uuid: '1eacc9b0-e4f4-42b8-ab79-adcd88dcec4b', name: 'Property 8' },
  { uuid: '5ff0b0ca-08cc-4e47-885e-1e52092a2f1d', name: 'Property 9' },
  { uuid: 'caccc2fc-97ec-4e02-9788-348a52768e72', name: 'Property 10' },
  // ...add the rest of your 34 UUIDs with their names
];

// helper: does this property have N consecutive available days?
function hasStreakOfN(days, n) {
  let streak = 0;
  for (const d of days) {
    if (d?.status?.available === true) {
      streak++;
      if (streak >= n) return true;
    } else {
      streak = 0;
    }
  }
  return false;
}

module.exports = async (req, res) => {
  // GET-only
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ error: 'Method not allowed. Use GET for get_available_properties.' });
  }

  const {
    startDate,
    endDate,
    mode = 'full-stay',   // 'full-stay' | 'any-night' | 'streak'
    minNights = 7,        // only used for mode=streak
  } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: 'Missing startDate or endDate in query params.' });
  }

  if (!process.env.HOSPITABLE_API_KEY) {
    console.error('Missing HOSPITABLE_API_KEY env var');
    return res
      .status(500)
      .json({ error: 'Server configuration error: missing Hospitable API key.' });
  }

  const minNightsInt = Number(minNights) || 7;

  console.log('get_available_properties called via', req.method);
  console.log(
    `Mode: ${mode}, startDate: ${startDate}, endDate: ${endDate}, minNights: ${minNightsInt}`
  );

  try {
    const results = [];

    for (const prop of properties) {
      const calendarUrl = `https://public.api.hospitable.com/v2/properties/${prop.uuid}/calendar`;

      console.log('Requesting calendar for property:', prop.uuid);

      const response = await axios.get(calendarUrl, {
        headers: {
          Authorization: `Bearer ${process.env.HOSPITABLE_API_KEY}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });

      const calendar = response.data;

      // { data: { listing_id, provider, start_date, end_date, days: [ ... ] } }
      const calData = calendar?.data || {};
      const days = Array.isArray(calData.days) ? calData.days : [];

      console.log(`Property ${prop.uuid} returned ${days.length} days`);

      if (days.length === 0) continue;

      const allDaysAvailable = days.every(
        (d) => d?.status?.available === true
      );
      const hasAnyAvailable = days.some(
        (d) => d?.status?.available === true
      );
      const hasStreak = hasStreakOfN(days, minNightsInt);

      let include = false;
      if (mode === 'any-night') include = hasAnyAvailable;
      else if (mode === 'streak') include = hasStreak;
      else include = allDaysAvailable; // default: full-stay

      console.log(
        `Property ${prop.uuid} -> allDaysAvailable=${allDaysAvailable}, hasAnyAvailable=${hasAnyAvailable}, hasStreak(${minNightsInt})=${hasStreak}, include=${include}`
      );

      if (!include) continue;

      // Build booking URL automatically from listing_id + provider
      let bookingUrl = '';

      const listingId = calData.listing_id;
      const provider = calData.provider;

      if (listingId && provider === 'airbnb-official') {
        bookingUrl = `https://www.airbnb.com/rooms/${listingId}`;
      }

      // TODO: if you later use other providers, add patterns here:
      // else if (listingId && provider === 'vrbo') { bookingUrl = `https://www.vrbo.com/${listingId}`; }

      results.push({
        name: prop.name,
        uuid: prop.uuid,
        url: bookingUrl, // may be empty if no pattern (for now Airbnb-only)
      });
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error(
      'Error fetching property data:',
      error.response?.status,
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json({
      error: 'Failed to fetch property data from Hospitable.',
      details: error.response?.data || error.message,
    });
  }
};