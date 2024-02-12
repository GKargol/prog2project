// Import necessary libraries and modules
const express = require("express");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

// Load environment variables from a .env file
dotenv.config();

// Create an Express application
const app = express();
const port = 3000;

// Configure middleware for handling requests and responses
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs"); // Set EJS as the view engine
app.set("views", __dirname); // Set the views directory to the current directory

// MongoDB URI
const uri = process.env.MONGODB_URI;

// Function to connect to MongoDB
async function connectToDatabase() {
  const client = new MongoClient(uri);
  await client.connect();
  return client.db("test").collection("formdatas");
}

// Handle GET requests to the root ("/") route
app.get("/", (req, res) => {
  // Serve the index.html file as the main page
  res.sendFile(__dirname + "/index.html");
});

// Handle POST requests to the "/submit" route
app.post("/submit", async (req, res) => {
  try {
    // Connect to MongoDB
    const collection = await connectToDatabase();

    // Get the submitted questions as an array
    const questions = req.body.questions;

    // Insert the questions array into the MongoDB collection
    const result = await collection.insertOne({ questions });

    // Respond with a JSON success message and the MongoDB result
    res.json({ message: "Data submitted to MongoDB successfully", result });
  } catch (err) {
    // Handle any errors that occur during database operations
    console.error(err);
    // Respond with a JSON error message for database errors
    res.status(500).json({ error: "Database error" });
  }
});

// Handle GET requests to the "/dashboard" route
app.get("/dashboard", async (req, res) => {
  try {
    // Connect to MongoDB
    const collection = await connectToDatabase();

    // Fetch all documents from the collection
    const formResponses = await collection.find({}).toArray();

    // Get the currentIndex from the query string, default to 0 if not provided
    const currentIndex = req.query.currentIndex
      ? parseInt(req.query.currentIndex)
      : 0;

    // Render the dashboard page with the fetched data and currentIndex
    res.render("dashboard.ejs", {
      formResponses: formResponses,
      currentIndex: currentIndex,
    });
  } catch (err) {
    // Handle any errors that occur during database operations
    console.error(err);
    // Respond with a JSON error message for database errors
    res.status(500).json({ error: "Database error" });
  }
});

// Error handling middleware for handling server errors
app.use((err, req, res, next) => {
  console.error(err);
  // Respond with a JSON error message for server errors
  res.status(500).json({ error: "Server error" });
});

// Start the Express server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
