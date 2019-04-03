// jshint esversion:6
module.exports = {
  weekday: function() {
    const today = new Date();
    const options = {weekday: "long"};
    return today.toLocaleDateString("en-US", options);
  },
  longDate: function() {
    const today = new Date();
    const options = {weekday: "long", month: "long",   year: "numeric", day: "numeric"};
    return today.toLocaleDateString("en-US", options);
  },
  logDate: function() {
    const today = new Date();
    const options = {day: "numeric", month: "short",   year: "numeric"};
    return today.toLocaleDateString("en-US", options);
  },
  shortDate: function() {
    const today = new Date();
    const options = {month: "short", year: "numeric", day: "numeric" };
    return today.toLocaleDateString("en-US", options);
  }
};
