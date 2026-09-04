const { checkServiceability } = require('./Router/shiprocketService');

async function testServiceability() {
    try {
        require('dotenv').config(); // Load .env
        const response = await checkServiceability('201301', '450116', 0.5, 0);
        console.log(JSON.stringify(response, null, 2));
    } catch (err) {
        console.error(err);
    }
}
testServiceability();
