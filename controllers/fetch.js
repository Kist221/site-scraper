// Require dependencies
var express = require("express");
var router = express.Router();
// Requiring our models
var db = require("../models");

// Create all our routes and set up logic within those routes where required.

// Home page / Landing Page
router.get("/", function(req, res) {
  res.render("home");
});

// Dashboard Page
router.get("/saved", function(req, res) {
  res.render("saved");
});

// Export routes for server.js to use.
module.exports = router;