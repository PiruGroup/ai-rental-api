// api/getAvailableProperties.js

require('dotenv').config({ path: '../.env' });
const axios = require('axios');

// 🏠 Your list of property UUIDs (and names if known)
const properties = [
  { uuid: 'c1e44fc6-3d51-450c-980e-52a2829b2db1', name: 'Property 1' },
  { uuid: '83797288-2201-4366-b549-063636c46302', name: 'Property 2' },
  { uuid: '028d382c-00be-47ac-9e11-a276dae118bb', name: 'Property 3' },
  { uuid: 'cddb7f45-84be-422c-af99-bd9d02486a38', name: 'Property 4' },
  { uuid: 'be67281d-697c-4fa4-9816-cb15f886ccc4', name: 'Property 5' },
  { uuid: '92c027fa-5380-4691-a97c-fff4aa496895', name: 'Property 6' },
  { uuid: '9fdc479f-0c58-4b34-8d32-be168c58b565', name: 'Property 7' },
  { uuid: '1eacc9b0-e4f4-42b8-ab79-adcd88dcec4b', name: 'Property 8' },
  { uuid: '5ff0b0ca-08cc-4e47-885e-1e52092a2f1d', name: 'Property 9' },
  { uuid: 'caccc2fc-97ec-4e02-9788-348a52768e72', name: 'Property 10' },
  // ✅ Add the rest similarly...
];

// 🚀 API Handler for Vercel
module.exports = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Missing startDate or endDate in query params.' });
  }

  try {
    const results = [];

    for (const prop of properties) {
      const calendarUrl = `https://public.api.hospitable.com/v2/properties/${prop.uuid}/calendar?start_date=${startDate}&end_date=${endDate}`;

      const response = await axios.get(calendarUrl, {
        headers: {
          Authorization: `Bearer ${process.env.HOSPITABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const calendar = response.data;

      const allDaysAvailable = calendar.every(day => day.available === true);

      if (allDaysAvailable) {
        results.push({
          name: prop.name,
          url: `https://your-booking-site.com/properties/${prop.uuid}` // ✅ Replace with your actual booking link pattern
        });
      }
    }

    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching property data:', error.response?.data || error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
