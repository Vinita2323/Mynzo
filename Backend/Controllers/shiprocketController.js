const shiprocketService = require('../Utils/shiprocketService');
const Order = require('../Models/Order');

exports.checkServiceability = async (req, res) => {
    try {
        const { pickupPincode, deliveryPincode, weight, cod } = req.body;
        const data = await shiprocketService.checkServiceability(pickupPincode, deliveryPincode, weight, cod);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.assignAWB = async (req, res) => {
    try {
        const { shipmentId, courierId } = req.body;
        const data = await shiprocketService.assignAWB(shipmentId, courierId);
        
        // Optionally update the DB order with AWB code if not done via webhook
        if (data && data.response && data.response.data && data.response.data.awb_code) {
            await Order.findOneAndUpdate(
                { shipmentId: shipmentId },
                { awbCode: data.response.data.awb_code, courierName: data.response.data.courier_name, shipmentStatus: 'AWB_ASSIGNED' }
            );
        }

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.requestPickup = async (req, res) => {
    try {
        const { shipmentId } = req.body;
        const data = await shiprocketService.requestPickup(shipmentId);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.generateLabel = async (req, res) => {
    try {
        const { shipmentId } = req.body;
        const data = await shiprocketService.generateLabel(shipmentId);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Phase 4: Webhook
exports.webhookReceiver = async (req, res) => {
    try {
        // Shiprocket sends POST request to this endpoint
        const payload = req.body;
        console.log('Shiprocket Webhook received:', payload);

        const { order_id, awb, current_status } = payload;

        if (order_id) {
            // Map Shiprocket status to Mynzo status
            let mappedStatus = 'Processing';
            const srStatus = current_status ? current_status.toUpperCase() : '';
            
            if (['SHIPPED', 'IN TRANSIT', 'OUT FOR DELIVERY'].includes(srStatus)) {
                mappedStatus = 'Shipped';
            } else if (srStatus === 'DELIVERED') {
                mappedStatus = 'Delivered';
            } else if (['CANCELLED', 'RTO INITIATED'].includes(srStatus)) {
                mappedStatus = 'Cancelled';
            }

            const updatedOrder = await Order.findOneAndUpdate(
                { shiprocketOrderId: order_id },
                { 
                    shipmentStatus: current_status,
                    status: mappedStatus,
                    $push: {
                        trackingHistory: {
                            status: current_status,
                            timestamp: new Date(),
                            activity: payload.activity || current_status,
                            location: payload.location || ''
                        }
                    }
                },
                { new: true }
            ).populate('userId');

            // Send SMS via SMS India Hub
            if (updatedOrder && updatedOrder.userId && updatedOrder.userId.phone) {
                try {
                    const axios = require('axios');
                    let phone = updatedOrder.userId.phone.toString().replace(/\D/g, '');
                    if (phone.length === 10) phone = '91' + phone;

                    // Message must match DLT registered template. 
                    // Using generic message based on your prompt, adjust to exact approved text if it fails.
                    const msg = `Dear Customer, your Mynzo order tracking update: Status is now ${current_status}.`;
                    const smsUrl = `https://cloud.smsindiahub.in/vendorsms/pushsms.aspx?APIKey=h2wGn6G24kiBVxGl2P3s3w&msisdn=${phone}&sid=IIDMTB&msg=${encodeURIComponent(msg)}&fl=0&gwid=2`;
                    
                    axios.get(smsUrl).then(response => {
                        console.log('SMS sent for webhook update:', response.data);
                    }).catch(err => {
                        console.error('SMS send failed:', err.message);
                    });
                } catch (smsErr) {
                    console.error('Error preparing SMS:', smsErr.message);
                }
            }
        }

        // Always return 200 OK to Shiprocket, otherwise they retry
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
