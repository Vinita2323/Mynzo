const axios = require('axios');

async function test() {
    try {
        const res1 = await axios.post('http://localhost:5000/api/shiprocket/estimate', {
            deliveryPincode: '451551',
            weight: 0.5,
            cod: 1
        });
        console.log("COD 0.5kg:", res1.data);
    } catch (e) {
        console.error(e.message);
    }
}
test();
