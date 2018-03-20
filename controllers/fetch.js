// Require dependencies
const express = require("express");
const request = require("request");
const cheerio = require("cheerio");
const router = express.Router();
// Requiring our models
const db = require("../models");

// Create all our routes and set up logic within those routes where required.

// home route
router.get("/", function(req, res) {
	db.Headline.find({})
		.then(function(headlines) {
			console.log(headlines);
			res.render("home", {headline: headlines});
		});
});

// comment route
router.get("/article/:id", function(req, res) {
  db.Headline.findOne({ _id: req.params.id })
    .populate("comment")
    .then(function(headline) {
      console.log(headline);
      res.render("comment", {headline: headline});
    });
});


// API ROUTES
// ==================================================
// route for scraping
router.get("/api/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("https://www.csdesignstudios.com/studio-news", function(err, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    const $ = cheerio.load(html);

    // Now, we grab every element, and do the following:
    $(".CS-ArticleContent").each(function(i, element) {
      // Save an empty result object
      const result = {};
      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("h3")
        .text();
      result.summary = $(this)
      	.children("p")
      	.text();
      result.link = "https://www.csdesignstudios.com/" + $(this)
        .children("a")
        .attr("href");
      result.image = "https://www.csdesignstudios.com/" + $(this)
        .children("img")
        .attr("src");
      // Create a new Headline using the `result` object built from scraping
      db.Headline.create(result)
        .then(function(dbHeadline) {
          // View the added result in the console
          res.json(dbHeadline);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });
    // If we were able to successfully scrape and save an Headline, send a message to the client
    console.log("Scrape Complete");
    res.json("Scrape Complete");
    res.end();
  });
});

// Route for getting all Headlines from the db
router.get("/api/articles", function(req, res) {
	// Grab every document in the Headlines collection
	db.Headline.find({})
    .populate("comment")
		.then(function(dbHeadline) {
			// If we were able to successfully find Headlines, send them back to the client
			res.json(dbHeadline);
		})
		.catch(function(err) {
			// If an error occurred, send it to the client
			res.json(err);
		});
});

// Route for saving/updating an Headline's associated Comment
router.post("/api/articles/:id", function(req, res) {
  // Create a new comment and pass the req.body to the entry
  db.Comment.create(req.body)
    .then(function(dbComment) {
      // If a Comment was created successfully, find one Headline with an `_id` equal to `req.params.id`. Update the Headline to be associated with the new Comment
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Headline.findOneAndUpdate({ _id: req.params.id }, { $push:  { comment: dbComment._id }}, { new: true });
    })
    .then(function(dbHeadline) {
      res.json(dbHeadline);
    })
    .catch(function(err) {
      res.json(err);
    });
});


// ============================================
// cleanup
router.get("/api/cleanup", function(req, res) {
	// clear db
	db.Headline.remove({})
		.then(function(data) {
			res.json(data);
		})
		.catch(function(err) {
			res.json(err);
		})
});

// Export routes for server.js to use.
module.exports = router;

