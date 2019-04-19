// jshint esversion:6
// require node packages
const mongoose = require("mongoose");

const timestamps = {timestamps: { createdAt: "created_at", updatedAt: "updated_at" }};
const Schema = mongoose.Schema;

// Create schemas
const mileStoneSchema = new Schema({
  creator: { type: Schema.Types.ObjectId, ref: "User"}, description: {type: String, max: 250}, amount: Number, usdValue: Number, status: { type: String, default: "escrowed"}}, timestamps
);

// Create model
const Milestone = new mongoose.model("Milestone", mileStoneSchema);

module.exports = Milestone;
