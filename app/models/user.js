// jshint esversion:6
// require node packages
const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const timestamps = {timestamps: { createdAt: "created_at", updatedAt: "updated_at" }};
const Schema = mongoose.Schema;

// Create schemas

const tokenSchema = new Schema({
  token: { type: String, required: true }, createdAt: { type: Date, required: true, default: Date.now, expires: 43200 }
});

const educationSchema = new Schema({ degree: String, school: String, city: String, country: String, start: Date, end: Date, description: String, url: String }, timestamps);

const certificationSchema = new Schema({ name: String, year: Date, organization: String, description: String, image: String, url: String }, timestamps);

const portfolioSchema = new Schema({ projectTitle: String, description: String, tech: [], image: String, url: String}, timestamps);

const publicationSchema = new Schema({ title: String, description: String, image: String, url: String}, timestamps);

const profileSchema = new Schema({
  userImg: String, jobTitle: {type: String, max: 60}, summary: String, city: String, country: String, timezone: String, hourlyRate: Number, languages: [], presence: String, skills: [], education: [educationSchema], portfolioProjects: [portfolioSchema], publications: [publicationSchema], certifications: [certificationSchema] }, timestamps
);

const userSchema = new Schema({
  username: {type: String, max: 30, unique: true, sparse: true}, password: {type: String, max: 90}, facebookId: String, linkedInId: String, googleId: String, githubId: String, redditId: String, twitterId: String, fName: {type: String, max: 60}, lName: {type: String, max: 60}, alias: {type: String, max: 60, unique: true, sparse: true}, role: {type: String, default: "user"}, title: {type: String, max: 60}, balance: Number, wallet: {type: String, unique: true, sparse: true}, profile: profileSchema, jobs: [{ type: Schema.Types.ObjectId, ref: "Job" }], reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }], transactions: [{ type: Schema.Types.ObjectId, ref: "Transaction" }], emailVerified: { type: Boolean, default: false }, idVerified: { type: Boolean, default: false }, emailToken: tokenSchema }, timestamps
);

// schema plugins
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(uniqueValidator);
userSchema.plugin(findOrCreate);

// Create model
const User = new mongoose.model("User", userSchema);

module.exports = User;
