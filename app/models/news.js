// jshint esversion:6
// require node packages
const mongoose = require("mongoose");

const timestamps = {timestamps: { createdAt: "created_at", updatedAt: "updated_at" }};
const Schema = mongoose.Schema;

const articleSchema = new Schema({
  title: {type: String, max: 30, unique: true, sparse: true}, description: String, author: { type: Schema.Types.ObjectId, ref: "Job" } }, timestamps
);

// Create model
const Article = new mongoose.model("Article", articleSchema);

module.exports = Article;
