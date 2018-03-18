// mongoose for mongoDB
const mongoose = require("mongoose");

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
const HeadlineSchema = new Schema({
  // `title` is required and of type String
  title: {
    type: String,
    required: true, 
    unique: true
  },
  // summary is string and not required
  summary: {
    type: String
  },
  // `link` is required and of type String
  link: {
    type: String,
    required: true
  },
  // `comment` is an object that stores a Comment id
  // The ref property links the ObjectId to the Comment model
  // This allows us to populate the Headline with an associated Comment
  comment: [{
    type: Schema.Types.ObjectId,
    ref: "Comment"
  }]
});

// This creates our model from the above schema, using mongoose's model method
const Headline = mongoose.model("Headline", HeadlineSchema);

// Export the Headline model
module.exports = Headline;