// jshint esversion:6
// require node packages
const mongoose = require("mongoose");

const timestamps = {timestamps: { createdAt: "created_at", updatedAt: "updated_at" }};
const Schema = mongoose.Schema;

// Create schemas
const jobSchema = new Schema({
  workType: String, title: {type: String, max: 30}, description: {type: String, max: 1500}, budget: {type: String}, skills: [], availability: String, status: {type: String, default: "awaiting bids"}, bids: [{ type: Schema.Types.ObjectId, ref: "Bid" }], milestones: [{ type: Schema.Types.ObjectId, ref: "Milestone" }], end: { type: Date, default: Date.now }, awardee: { type: Schema.Types.ObjectId, ref: "User"}, creator: { type: Schema.Types.ObjectId, ref: "User"} }, timestamps
);

// Create  model
const Job = new mongoose.model("Job", jobSchema);

module.exports = Job;
