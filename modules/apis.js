// jshint esversion:6

// API Providers
let btcUsd = fetchJSON("https://apiv2.bitcoinaverage.com/indices/global/ticker/BTCUSD");
let trxBtc = fetchJSON("https://apiv2.bitcoinaverage.com/indices/tokens/ticker/TRXBTC");

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

module.exports =  function (){
    // use promise values
    Promise.all([btcUsd, trxBtc]).then(function(data){
      // assign each json output to variable
      let data0 = data[0], data1 = data[1];
      // assign json object last to variable
      btc = ((data0.last).toFixed(4));
      trx = (((data0.last)*(data1.last)).toFixed(4));
      // catch errors if any
    }).catch(error => console.error('There was a problem', error));
  };
