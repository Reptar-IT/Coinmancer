// jshint esversion:6
// require node packages
const mongoose = require("mongoose");

const timestamps = {timestamps: { createdAt: "created_at", updatedAt: "updated_at" }};
const Schema = mongoose.Schema;

// Create schemas
const mileStoneSchema = new Schema({
  description: {type: String, max: 250}, amount: Number, usdValue: Number, status: { type: String, default: "escrowed"}, job: { type: Schema.Types.ObjectId, ref: "Job" }, creator: { type: Schema.Types.ObjectId, ref: "User"}, recipient: { type: Schema.Types.ObjectId, ref: "User"}}, timestamps
);

// Create model
const Milestone = new mongoose.model("Milestone", mileStoneSchema);

module.exports = Milestone;
