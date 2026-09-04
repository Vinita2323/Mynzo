const axios = require('axios');

async function testEndpoint() {
    try {
        const res = await axios.post('http://localhost:5000/api/shiprocket/estimate', {
            deliveryPincode: "450116",
            weight: 0.5,
            cod: 0
        });
        console.log("Success:", JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
    }
}

testEndpoint();
