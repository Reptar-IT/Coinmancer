// jshint esversion:6
// require node packages
const mongoose = require("mongoose");

const timestamps = {timestamps: { createdAt: "created_at", updatedAt: "updated_at" }};
const Schema = mongoose.Schema;

// Create schemas
const transactionSchema = new Schema({
  creator: { type: Schema.Types.ObjectId, ref: "User"}, transactionHash: String, amount: Number, toAddress: String, fromAddress: String, transactionType: {type: String, default: "deposit"}}, timestamps
);

// Create model
const Transaction = new mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
