// jshint esversion:6
// require node packages
const NewslettersController = require('express').Router();
const UserModel = require('../models/user');
const _ = require("lodash");

// set views path to constant
const view = "../app/views/";

function subscribe() {
  let fName = req.body.fName;
  let lName = req.body.lName;
  let email = req.body.email;
  let title = req.body.profession;
  let mailChimpApiKey = "559af90b4b4973eb8a490aa59bdef696-us20";

  let data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: fName,
          LNAME: lName,
        }
      }
    ],
  };

  let jsonData = JSON.stringify(data);

  let options = {
    url: "https://us20.api.mailchimp.com/3.0/lists/135e554035",
    method: "POST",
    headers: {
      "Authorization": "coinmancer " + mailChimpApiKey
    },
    body: jsonData,
  };
  request(options, function(error, response, body){
    if(error){
      console.log(error);
    } else {
      console.log(response.statusCode);
    }
  });
}

module.exports = NewslettersController;
