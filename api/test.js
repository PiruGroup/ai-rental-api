const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');

// Load env file from parent directory
// Assumes your script is in a subdirectory (e.g., /src) and .env is in the root.
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const rawApiKey = process.env.HOSPITABLE_API_KEY;

// 🛑 STEP 1: Check if the key was loaded at all
if (!rawApiKey) {
    console.error('❌ ERROR: HOSPITABLE_API_KEY is not defined in the environment variables.');
    console.log('Please ensure your .env file is correctly located and the variable is named "HOSPITABLE_API_KEY".');
    process.exit(1); // Exit with an error code
}

// 🔑 STEP 2: Clean and log the key
// The .trim() method removes accidental leading/trailing spaces or invisible characters.
const apiKey = rawApiKey.trim(); 
console.log('🔑 Using API Key (Cleaned Value):', apiKey.substring(0, 4) + '... (Length: ' + apiKey.length + ')'); 

const headers = {
    // 🛡️ STEP 3: Correct Authorization Header construction confirmed
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
};

// 🏠 STEP 4: Make the API request
axios.get('https://api.hospitable.com/v1/properties', { headers })
    .then(response => {
        console.log('✅ SUCCESS! Received a valid response.');
        console.log('---');
        // Log the first few properties or summary data to avoid printing a massive object
        if (response.data.data && response.data.data.length > 0) {
            console.log(`Found ${response.data.data.length} properties.`);
            console.log('First Property Name:', response.data.data[0].name);
        } else {
            console.log('Response data:', response.data);
        }
        console.log('---');
    })
    .catch(error => {
        if (error.response) {
            // The API returned an error (e.g., 401 Unauthorized)
            console.error('❌ API Error Response Received:', error.response.status);
            // This should still be the "Must be logged in" error if the key is wrong
            console.error('Error Details:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received (e.g., connection issue)
            console.error('❌ Request Error: No response received from server.');
            console.error('Error Details:', error.message);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('❌ Code Error during setup:', error.message);
        }
    });