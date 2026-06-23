const axios = require('axios');

async function test() {
    try {
        const res = await axios.post('http://localhost:5000/api/shiprocket/check', {
            pickupPincode: '201301',
            deliveryPincode: '451551',
            weight: 0.5,
            cod: 1
        });
        const couriers = res.data.data.data.available_courier_companies;
        const bestCourier = couriers[0];
        console.log(bestCourier.freight_charge, bestCourier.cod_charges);
    } catch (e) {
        console.error(e.message);
    }
}
test();
