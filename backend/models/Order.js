const mongoose = require("mongoose");

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["Pending", "Shipped", "Delivered", "Cancelled", "Book Added", "Order Updated"],
    required: true,
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  books: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Shipped", "Delivered", "Cancelled", "Book Added","Order Updated"],
    default: "Pending",
  },
  statusHistory: [statusHistorySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdDateTime: {
    type: String,
    default: () => new Date().toLocaleString(),
  },
  amountPaid: {
    type: Number,
    default: 0,
  },

  amountPending: {
    type: Number,
    required: true,
  },
});

orderSchema.pre('save', function (next) {
  this.totalPrice = this.books.reduce((sum, item) => sum + item.price * item.quantity, 0);

  this.amountPending = this.totalPrice - this.amountPaid;

  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
    });
  }

  next();
});


module.exports = mongoose.model("Order", orderSchema);
