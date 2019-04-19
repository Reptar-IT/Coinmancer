// jshint esversion:6
// require node packages
const mongoose = require("mongoose");

const timestamps = {timestamps: { createdAt: "created_at", updatedAt: "updated_at" }};
const Schema = mongoose.Schema;

// Create schemas
const reviewSchema = new Schema({
  creator: { type: Schema.Types.ObjectId, ref: "User"}, description: {type: String, max: 255}, quality_clarity: {type: Number, min: 1, max: 5}, communication: {type: Number, min: 1, max: 5}, expertise_payment: {type: Number, min: 1, max: 5}, proffesionalism: {type: Number,min: 1, max: 5}, future_work: {type: Number, min: 1, max: 5}, job: {type: Schema.Types.ObjectId, ref: "Job"}, jobTitle: String }, timestamps
);

// Create model
const Review = new mongoose.model("Review", reviewSchema);

module.exports = Review;
