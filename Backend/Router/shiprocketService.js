const axios = require('axios');

const SHIPROCKET_API_BASE = process.env.SHIPROCKET_API_BASE || 'https://apiv2.shiprocket.in';
let shiprocketToken = null;
let tokenExpiry = null;

const getShiprocketToken = async () => {
    try {
        if (shiprocketToken && tokenExpiry && new Date() < tokenExpiry) {
            return shiprocketToken;
        }

        const email = process.env.SHIPROCKET_EMAIL;
        const password = process.env.SHIPROCKET_PASSWORD;

        if (!email || !password) {
            console.error('Shiprocket credentials not found in environment variables.');
            return null;
        }

        const response = await axios.post(`${SHIPROCKET_API_BASE}/v1/external/auth/login`, {
            email,
            password
        });

        if (response.data && response.data.token) {
            shiprocketToken = response.data.token;
            // Token is usually valid for 10 days, setting it to 9 days to be safe
            tokenExpiry = new Date(new Date().getTime() + 9 * 24 * 60 * 60 * 1000);
            return shiprocketToken;
        }
        return null;
    } catch (error) {
        console.error('Error fetching Shiprocket token:', error.response?.data || error.message);
        return null;
    }
};

const createShiprocketOrder = async (orderData) => {
    try {
        const token = await getShiprocketToken();
        if (!token) throw new Error('Shiprocket authentication failed');

        const response = await axios.post(`${SHIPROCKET_API_BASE}/v1/external/orders/create/adhoc`, orderData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating Shiprocket order:', error.response?.data || error.message);
        throw error;
    }
};

const checkServiceability = async (pickupPincode, deliveryPincode, weight, cod = 0) => {
    try {
        const token = await getShiprocketToken();
        if (!token) throw new Error('Shiprocket authentication failed');

        const response = await axios.get(`${SHIPROCKET_API_BASE}/v1/external/courier/serviceability`, {
            params: {
                pickup_postcode: pickupPincode,
                delivery_postcode: deliveryPincode,
                weight: weight,
                cod: cod
            },
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
         console.error('Error checking serviceability:', error.response?.data || error.message);
         throw error;
    }
};

const assignAWB = async (shipmentId, courierId = null) => {
    try {
        const token = await getShiprocketToken();
        if (!token) throw new Error('Shiprocket authentication failed');

        const payload = {
            shipment_id: shipmentId
        };
        
        if (courierId) {
            payload.courier_id = courierId;
        }

        const response = await axios.post(`${SHIPROCKET_API_BASE}/v1/external/courier/assign/awb`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error assigning AWB:', error.response?.data || error.message);
        throw error;
    }
};

const requestPickup = async (shipmentId) => {
    try {
        const token = await getShiprocketToken();
        if (!token) throw new Error('Shiprocket authentication failed');

        const response = await axios.post(`${SHIPROCKET_API_BASE}/v1/external/courier/generate/pickup`, {
            shipment_id: [shipmentId]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error requesting pickup:', error.response?.data || error.message);
        throw error;
    }
};

const generateLabel = async (shipmentId) => {
    try {
        const token = await getShiprocketToken();
        if (!token) throw new Error('Shiprocket authentication failed');

        const response = await axios.post(`${SHIPROCKET_API_BASE}/v1/external/courier/generate/label`, {
            shipment_id: [shipmentId]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error generating label:', error.response?.data || error.message);
        throw error;
    }
};

const trackAWB = async (awbCode) => {
    try {
        const token = await getShiprocketToken();
        if (!token) throw new Error('Shiprocket authentication failed');

        const response = await axios.get(`${SHIPROCKET_API_BASE}/v1/external/courier/track/awb/${awbCode}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error tracking AWB:', error.response?.data || error.message);
        throw error;
    }
};

const parseCityState = (address) => {
    let city = 'City';
    let state = 'State';
    if (address && typeof address === 'string') {
        const cleanAddress = address.replace(/[-\s,]*\d{6}\s*$/, '').trim();
        const parts = cleanAddress.split(',').map(p => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
            state = parts[parts.length - 1];
            city = parts[parts.length - 2];
        } else if (parts.length === 1) {
            city = parts[0];
        }
    }
    return {
        city: city.substring(0, 30) || 'City',
        state: state.substring(0, 30) || 'State'
    };
};

module.exports = {
    getShiprocketToken,
    createShiprocketOrder,
    checkServiceability,
    assignAWB,
    requestPickup,
    generateLabel,
    trackAWB,
    parseCityState
};
