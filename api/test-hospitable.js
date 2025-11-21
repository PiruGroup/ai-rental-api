require('dotenv').config();
const axios = require('axios');

const propertyUUIDs = [
  "c1e44fc6-3d51-450c-980e-52a2829b2db1",
  "83797288-2201-4366-b549-063636c46302",
  "028d382c-00be-47ac-9e11-a276dae118bb",
  "cddb7f45-84be-422c-af99-bd9d02486a38",
  "be67281d-697c-4fa4-9816-cb15f886ccc4",
  "92c027fa-5380-4691-a97c-fff4aa496895",
  "9fdc479f-0c58-4b34-8d32-be168c58b565",
  "1eacc9b0-e4f4-42b8-ab79-adcd88dcec4b",
  "5ff0b0ca-08cc-4e47-885e-1e52092a2f1d",
  "caccc2fc-97ec-4e02-9788-348a52768e72",
  "6a9cf7d3-9e37-4700-b69c-3c5ec80f66e6",
  "cb1449cb-e916-443c-9a69-d7d819e64097",
  "79b4d6ae-0b44-40e1-8c02-d033c760aa9f",
  "b07a7bfc-6930-442b-a8ab-2e0aa19909c3",
  "1c0f7ae5-4910-4e92-88e2-dc1625b35427",
  "2f3467fc-088e-4ae9-9755-1b3c405bc88f",
  "7e2739a6-552c-4cb8-931f-7017d1c2f05a",
  "4c77a325-46fa-4fcf-861f-27d8ae5600e0",
  "0d96b47e-e050-46ef-b535-e91a0d2484f2",
  "f88ee724-df96-4a4c-88e1-b3f4f30979ff",
  "59a8c63f-12f3-4421-b2a5-1445b3078991",
  "f4bcb88e-7c19-4c82-a82f-0121a46a1763",
  "7e56aaae-f350-48f4-b78c-3178ee3f3cf4",
  "8a94be5a-7925-451f-89ee-770ca21b4dc5",
  "e107b8ae-2be2-4d14-9d41-bc557ab348b1",
  "abf93a0f-b0b8-43d1-9b91-9243e38b14a8",
  "2a9a82f3-8e6e-4721-bda3-65f1d5368f18",
  "1e56b041-822b-4bc0-a7a7-0b765f0f4981",
  "c8852f18-4e63-4594-9d6b-89853906336a",
  "7735b1f4-4746-4a90-9be6-3b3f03f03834",
  "5439979a-9e4a-4a33-8821-dbb8ae111992",
  "0475d8d3-ed31-4d23-be78-1d62a864a00f",
  "093857a8-97a5-4da7-b550-2d7a4376bd43",
  "17abde18-9492-4b40-8e51-5868240f44c6"
];

const fetchProperty = async (uuid) => {
  const API_URL = `https://public.api.hospitable.com/v2/properties/${uuid}`;
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${process.env.HOSPITABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(`✅ Property ${uuid}:`, response.data);
  } catch (error) {
    console.error(`❌ Error fetching ${uuid}:`, error.response?.data || error.message);
  }
};

(async () => {
  console.log('🔐 Using API Key:', process.env.HOSPITABLE_API_KEY ? '[loaded]' : '[missing]');
  for (const uuid of propertyUUIDs) {
    await fetchProperty(uuid);
  }
})();
