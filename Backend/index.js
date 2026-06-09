const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./Config/db');
const Admin = require('./Models/Admin');

const PORT = process.env.PORT || 5000;

// Auto-create admin if not exists (har baar server start hone par check)
const ensureAdmin = async () => {
  const email = process.env.ADMIN_EMAIL || 'admin@gmail.com';
  const password = process.env.ADMIN_PASSWORD || '123';

  const existing = await Admin.findOne({ email });
  if (!existing) {
    await Admin.create({ name: 'Super Admin', email, password, role: 'super_admin' });
    console.log(`✅ Admin auto-created: ${email}`);
  } else {
    console.log(`👤 Admin already exists: ${email}`);
  }
};

// Connect to MongoDB then start server
connectDB().then(async () => {
  await ensureAdmin();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
