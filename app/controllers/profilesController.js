// jshint esversion:6
// require node packages
const ProfilesController = require('express').Router();
const UserModel = require('../models/user');
const _ = require("lodash");

// set views path to constant
const view = "../app/views/";
// require and assign api module to constant
const api = require("../../modules/apis.js");
// call tickers function from api module key
api();

// show user logged in
ProfilesController.get("/myprofile", function(req, res) {
  const timeZoneList = require("../../modules/timezones.js");
  const countriesList = require("../../modules/countries.js");
  if(req.isAuthenticated()){
    UserModel.find({_id: req.user.id}, function(err, user) {
      if(err){
        res.send(err);
      } else {
        res.render(view + "profiles/profile", {
          btcTicker: btc,
          trxTicker: trx,
          profile: user,
          userLoggedIn: req.user,
          timeZones: timeZoneList,
          countries: countriesList
        });
      }
    });
  } else {
    res.redirect("/login");
  }
});

// show specific user
ProfilesController.get("/user/", function(req, res) {
  res.render(view + "profiles/show", {
    btcTicker: btc,
    trxTicker: trx,
    userLoggedIn: req.user
  });
});

// show freelancers
ProfilesController.get("/freelancers", function(req, res) {
  UserModel.find({}, function(err, user) {
    if(err){
      res.send(err);
    } else {
      res.render(view + "profiles/freelancers", {
        btcTicker: btc,
        trxTicker: trx,
        profile: user,
        userLoggedIn: req.user
      });
    }
  });
});

ProfilesController.post("/myprofile/personal-information", function(req, res) {
  let alias = req.body.alias, username = req.body.username;
  if (alias == null){ alias = req.user.alias;}
  if (username == null){ username = req.user.username;}
  UserModel.findOneAndUpdate({_id: req.user.id}, {
    // use $push to add new items to array mongoose syntax "faster"
    $set: {
      "profile.userImg": req.body.userImg,
      "title": req.body.title,
      "username": _.capitalize(username),
      "alias": _.capitalize(alias),
      "profile.jobTitle": req.body.jobTitle,
      "profile.summary": _.capitalize(req.body.summary),
      "profile.city": req.body.city,
      "profile.country": req.body.country,
      "profile.presence": req.body.presence,
      "profile.timezone": req.body.timezone,
      "profile.hourlyRate": req.body.rate,
      "profile.languages": req.body.languages
    }
  }, function(err){
    if(err){
      res.send(err);
    } else {
      res.redirect("/myprofile");
    }
  });
});

ProfilesController.post("/myprofile/email-notifications", function(req, res) {
  UserModel.findOneAndUpdate({_id: req.user.id}, {
    // use $push to add new items to array mongoose syntax "faster"
    $set: {
      "profile.notifications": req.body.notifications
    }
  }, function(err){
    if(err){
      res.send(err);
    } else {
      res.redirect("/myprofile");
    }
  });
});

ProfilesController.post("/myprofile/skills", function(req, res) {
  UserModel.findOneAndUpdate({_id: req.user.id}, {
    // use $push to add new items to array mongoose syntax "faster"
    $set: {
      "profile.skills": req.body.skills
    }
  }, function(err){
    if(err){
      res.send(err);
    } else {
      res.redirect("/myprofile");
    }
  });
});

ProfilesController.post("/myprofile/education", function(req, res) {
  let city = req.body.city, country = req.body.country;
  if (city == null){ city = "online";}
  if (country == null){ country = "online";}
  UserModel.findOneAndUpdate({_id: req.user.id}, {
    // use $push to add new items to array mongoose syntax "faster"
    $push: {
      "profile.$.education": {
        degree: req.body.degree,
        school: req.body.school,
        city: city,
        country: country,
        start: req.body.start,
        end: req.body.end,
        description: req.body.description,
        url: req.body.url
      }
    }
  },{ new: true }, function(err){
    if(err){
      res.send(err);
    } else {
      res.redirect("/myprofile");
    }
  });
});

ProfilesController.post("/myprofile/portfolio", function(req, res) {
  UserModel.findOneAndUpdate({_id: req.user.id}, {
    // use $push to add new items to array mongoose syntax "faster"
    $push: {
      "profile.$.portfolio": {
        projectTitle: req.body.projectTitle,
        image: req.body.image,
        description: req.body.description,
        url: req.body.url
      }
    }
  },{ new: true }, function(err){
    if(err){
      res.send(err);
    } else {
      res.redirect("/myprofile");
    }
  });
});

ProfilesController.post("/myprofile/certifications", function(req, res) {
  UserModel.findOneAndUpdate({_id: req.user.id}, {
    // use $push to add new items to array mongoose syntax "faster"
    $push: {
      "profile.$.certifications": {
        name: req.body.name,
        year: req.body.year,
        organization: req.body.organization,
        description: req.body.description,
        image: req.body.image,
        url: req.body.url
      }
    }
  },{ new: true }, function(err){
    if(err){
      res.send(err);
    } else {
      res.redirect("/myprofile");
    }
  });
});

ProfilesController.post("/myprofile/publications", function(req, res) {
  UserModel.findOneAndUpdate({_id: req.user.id}, {
    // use $push to add new items to array mongoose syntax "faster"
    $push: {
      "profile.$.publications": {
        title: req.body.title,
        image: req.body.image,
        description: req.body.description,
        url: req.body.url
      }
    }
  },{ new: true }, function(err){
    if(err){
      res.send(err);
    } else {
      res.redirect("/myprofile");
    }
  });
});

module.exports = ProfilesController;
