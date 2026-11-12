require("dotenv").config();

const connectDB = require("../config/db");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL || "admin@doctortracker.com";
    const password = process.env.ADMIN_PASSWORD || "admin123";
    const name = process.env.ADMIN_NAME || "Admin";

    const existing = await User.findOne({ email });

    if (existing) {
      console.log("Admin already exists:", email);
      process.exit(0);
    }

    const user = await User.create({ name, email, password });
    console.log("Admin created:", user.email);
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

createAdmin();
