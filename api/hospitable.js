// api/hospitable.js

const axios = require('axios');

module.exports = async function handler(req, res) {
  try {
    const response = await axios.get('https://api.hospitable.com/v1/properties', {
      headers: {
        Authorization: `Bearer ${process.env.HOSPITABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Hospitable API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch data from Hospitable' });
  }
};
