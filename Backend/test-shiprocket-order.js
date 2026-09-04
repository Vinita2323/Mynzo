const axios = require('axios');
const SHIPROCKET_API_BASE = 'https://apiv2.shiprocket.in';

async function testOrder() {
    try {
        const authResponse = await axios.post(`${SHIPROCKET_API_BASE}/v1/external/auth/login`, {
            email: 'linkage056@gmail.com',
            password: '3K^fz6yrZO4i#0DUF%Y1q^*qjnrML8UJ'
        });
        const token = authResponse.data.token;
        console.log("Token received.");

        const shiprocketOrderData = {
            order_id: `ORD_TEST_${Date.now()}`,
            order_date: new Date().toISOString().slice(0, 16).replace('T', ' '),
            pickup_location: 'Home', // Must be configured in Shiprocket dashboard
            billing_customer_name: 'Chirag Jeevanani',
            billing_last_name: '',
            billing_address: 'Corporate house, South Tukoganj, Jhabua Tower, Indore',
            billing_city: 'City', 
            billing_pincode: '452001',
            billing_state: 'State',
            billing_country: 'India',
            billing_email: 'customer@mynzo.com',
            billing_phone: '9876543210',
            shipping_is_billing: true,
            order_items: [{
                name: 'Test Item',
                sku: 'test-sku-1',
                units: 1,
                selling_price: 1360,
                discount: 0,
                tax: 0,
                hsn: 441122
            }],
            payment_method: 'COD',
            sub_total: 1360,
            length: 10,
            breadth: 10,
            height: 10,
            weight: 0.5
        };

        const response = await axios.post(`${SHIPROCKET_API_BASE}/v1/external/orders/create/adhoc`, shiprocketOrderData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("ORDER CREATED/RESPONSE:");
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error("ORDER CREATION FAILED:");
        if (error.response) {
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

testOrder();
