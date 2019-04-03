// jshint esversion:6
// require node packages
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const encrypt = require('mongoose-encryption');
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const timestamps = {timestamps: { createdAt: "created_at", updatedAt: "updated_at" }};

// Create schemas
const userNotifications = mongoose.Schema({ news: String, jobActivity: String, chat: String }, timestamps);

const educationSchema = mongoose.Schema({ degree: String, school: String, city: String, country: String, start: Date, end: Date, description: String, url: String }, timestamps);

const certificationSchema = mongoose.Schema({ name: String, year: Date, organization: String, description: String, image: String, url: String }, timestamps);

const portfolioSchema = mongoose.Schema({ projectTitle: String, description: String, tech: [], image: String, url: String}, timestamps);

const publicationSchema = mongoose.Schema({ title: String, description: String, image: String, url: String}, timestamps);

const profileSchema = mongoose.Schema({
  userImg: String, jobTitle: {type: String, max: 60}, summary: String, city: String, country: String, timezone: String, hourlyRate: Number, languages: [], presence: String, alerts: userNotifications, skills: [], education: [educationSchema], portfolioProjects: [portfolioSchema], publications: [publicationSchema], certifications: [certificationSchema] }, timestamps
);

const reviewSchema = new mongoose.Schema({
  description: {type: String, max: 255}, quality_clarity: {type: Number, min: 1, max: 5}, communication: {type: Number, min: 1, max: 5}, expertise_payment: {type: Number, min: 1, max: 5}, proffesionalism: {type: Number,min: 1, max: 5}, future_work: {type: Number, min: 1, max: 5}, author: String, jobId: String, jobTitle: String }, timestamps
);

const mileStoneSchema = new mongoose.Schema({
  description: {type: String, max: 250}, amount: Number, status: { type: String, default: "not released"}, bidder: String }, timestamps
);

const bidSchema = new mongoose.Schema({
  body: {type: String, max: 250}, amount: Number, award_status: String, bidder: String }, timestamps
);

const jobSchema = new mongoose.Schema({
  workType: String, title: {type: String, max: 30}, description: {type: String, max: 1500}, budget: {type: String}, skills: [], availability: String, status: String, award_status: String, bids: [bidSchema], reviews: [reviewSchema], end: { type: Date, default: Date.now } }, timestamps
);// remove award_status field set status to awarded or completed

const tokenSchema = new mongoose.Schema({
  token: { type: String, required: true }, createdAt: { type: Date, required: true, default: Date.now, expires: 43200 }
});

const userSchema = new mongoose.Schema({
  username: {type: String, max: 30, default: ""}, password: {type: String, max: 90}, facebookId: String, linkedInId: String, googleId: String, githubId: String, redditId: String, twitterId: String, fName: {type: String, max: 60}, lName: {type: String, max: 60}, alias: {type: String, max: 60, default: ""}, role: {type: String, default: "user"}, title: {type: String, max: 60, default: ""}, profile: profileSchema, jobs: [jobSchema], milestones: [mileStoneSchema], emailVerified: { type: Boolean, default: false }, idVerified: { type: Boolean, default: false }, emailToken: tokenSchema }, timestamps
);

// encrypt schema
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(uniqueValidator);
userSchema.plugin(findOrCreate);

// Create a user model
const UserModel = new mongoose.model("User", userSchema);

module.exports = UserModel;
