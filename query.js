const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI);

const notesSchema = {
  title: String,
  content: String,
};

const Note = mongoose.model("Note", notesSchema);

app.get("/count", async function (req, res) {
  try {
    const count = await Note.countDocuments();
    res.send(`Total documents in "forum_answers" collection: ${count}`);
  } catch (error) {
    console.error("Error counting documents:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Query server online!");
});
