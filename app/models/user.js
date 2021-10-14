// jshint esversion:6
// require node packages
const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const timestamps = {timestamps: { createdAt: "created_at", updatedAt: "updated_at" }};
const Schema = mongoose.Schema;

// Create schemas
const userSchema = new Schema({
  username: {type: String, max: 30, unique: true, sparse: true}, password: {type: String, max: 30} 
}, timestamps);

// schema plugins
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(uniqueValidator);
userSchema.plugin(findOrCreate);

// Create model
const User = new mongoose.model("User", userSchema);

module.exports = User;
