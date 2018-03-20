// mongoose for mongoDB
const mongoose = require("mongoose");

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

// Using the Schema constructor, create a new CommentSchema object
// This is similar to a Sequelize model
const CommentSchema = new Schema({
  // `title` is of type String - required to prevent spam
  title: {
    type: String,
    required: true
  },
  // `body` is of type String - required to prevent spam
  body: {
    type: String,
    required: true  }
});

// This creates our model from the above schema, using mongoose's model method
const Comment = mongoose.model("Comment", CommentSchema);

// Export the Comment model
module.exports = Comment;
