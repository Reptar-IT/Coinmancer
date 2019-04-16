// jshint esversion:6
// require node packages
const ProfilesController = require('express').Router();
const UserModel = require('../models/user');
const _ = require("lodash");

// set views path to constant
const view = "../app/views/";

// API Providers
let btcUsd = fetchJSON("https://apiv2.bitcoinaverage.com/indices/global/ticker/BTCUSD");
let trxBtc = fetchJSON("https://apiv2.bitcoinaverage.com/indices/tokens/ticker/TRXBTC");

// call tickers function from api module key
function fetchJSON(url) {
  return new Promise(function(resolve, reject) {
    const request = require("request");
    // request url
    request(url, function(error, response, body) {
      // handle errors if any
      if (error) {
        reject(error);
      } else if (response.statusCode !== 200) {
        reject(new Error('Failed with status code ' + response.statusCode));
      } else {
        // parse url to json
        resolve(JSON.parse(body));
      }
    });
  });
}

// render views

// show user logged in
ProfilesController.get("/myprofile", function(req, res) {
  const timeZoneList = require("../../modules/timezones.js");
  const countriesList = require("../../modules/countries.js");
  if(req.isAuthenticated()){
    UserModel.find({_id: req.user.id}, function(err, user) {
      if(err){
        res.send(err);
      } else {
        // use promise values
        Promise.all([btcUsd, trxBtc]).then(function(data){
          res.render(view + "profiles/profile", {
            btcTicker: data[0].last.toFixed(4),
            trxTicker: ((data[0].last)*(data[1].last)).toFixed(4),
            profile: user,
            userLoggedIn: req.user,
            timeZones: timeZoneList,
            countries: countriesList
          });
          // catch errors if any
        }).catch(error => console.error('There was a problem', error));
      }
    });
  } else {
    res.redirect("/login");
  }
});

// show specific user
ProfilesController.get("/user/", function(req, res) {
  // use promise values
  Promise.all([btcUsd, trxBtc]).then(function(data){
    res.render(view + "profiles/show", {
      btcTicker: data[0].last.toFixed(4),
      trxTicker: ((data[0].last)*(data[1].last)).toFixed(4),
      userLoggedIn: req.user
    });
  // catch errors if any
  }).catch(error => console.error('There was a problem', error));
});

// show freelancers
ProfilesController.get("/freelancers", function(req, res) {
  UserModel.find({}, function(err, user) {
    if(err){
      res.send(err);
    } else {
      // use promise values
      Promise.all([btcUsd, trxBtc]).then(function(data){
        res.render(view + "profiles/freelancers", {
          btcTicker: data[0].last.toFixed(4),
          trxTicker: ((data[0].last)*(data[1].last)).toFixed(4),
          profile: user,
          userLoggedIn: req.user
        });
      // catch errors if any
      }).catch(error => console.error('There was a problem', error));
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
