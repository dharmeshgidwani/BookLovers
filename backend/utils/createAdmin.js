const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();

const createAdmin = async () => {
  const MONGO_URL = process.env.MONGO_URL || `mongodb+srv://booklovers4u:admin123@bookstorecluster.joqj7iq.mongodb.net/?retryWrites=true&w=majority&appName=BookStoreCluster`;

  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");

    const adminExists = await User.findOne({ email: "admin@bookstore.com" });
    if (adminExists) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const adminUser = new User({
      name: "Admin",
      email: "admin@booklovers.in",
      phone: "123456789",
      password: hashedPassword,
      address: "Admin Street",
      role: "admin",
    });

    await adminUser.save();
    console.log("Admin user created successfully!");

    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err.message);
    process.exit(1);
  }
};

createAdmin();
