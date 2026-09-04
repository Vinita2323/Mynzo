const axios = require('axios');
const SHIPROCKET_API_BASE = 'https://apiv2.shiprocket.in';

async function testAuth() {
    try {
        const response = await axios.post(`${SHIPROCKET_API_BASE}/v1/external/auth/login`, {
            email: 'linkage056@gmail.com',
            password: '3K^fz6yrZO4i#0DUF%Y1q^*qjnrML8UJ'
        });
        console.log("SUCCESS! Token received.");
    } catch (error) {
        console.error("AUTH FAILED:");
        if (error.response) {
            console.error(error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testAuth();
