const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true},
  phone: {type: Number,unique: true, required: true},
  password: { type: String, required: true },
  address: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  cart: [
    {
      bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
