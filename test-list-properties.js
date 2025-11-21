// test-list-properties.js
if (process.env.NODE_ENV !== 'production') {
  const path = require('path');
  require('dotenv').config({
    path: path.join(__dirname, '.env'),
  });
}

const axios = require('axios');

async function main() {
  if (!process.env.HOSPITABLE_API_KEY) {
    console.error('Missing HOSPITABLE_API_KEY');
    process.exit(1);
  }

  try {
    const res = await axios.get('https://public.api.hospitable.com/v2/properties', {
      headers: {
        Authorization: `Bearer ${process.env.HOSPITABLE_API_KEY}`,
        Accept: 'application/json',
      },
    });

    console.log('Raw properties response:');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Error listing properties:', err.response?.status, err.response?.data || err.message);
  }
}

main();