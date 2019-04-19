// jshint esversion:6
// require node packages
const mongoose = require("mongoose");

const timestamps = {timestamps: { createdAt: "created_at", updatedAt: "updated_at" }};
const Schema = mongoose.Schema;

// Create schemas
const bidSchema = new Schema({
  description: {type: String, max: 250}, amount: Number, status: {type: String, default: "awaiting award"}, job: { type: Schema.Types.ObjectId, ref: "Job" }, creator: { type: Schema.Types.ObjectId, ref: "User" } }, timestamps
);

// Create model
const Bid = new mongoose.model("Bid", bidSchema);

module.exports = Bid;
