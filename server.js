// Import necessary libraries and modules
const express = require("express");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

// Load environment variables from a .env file
dotenv.config();

// Create an Express application
const app = express();
const port = process.env.PORT || 3000; // Use the port specified in the environment variable or default to 3000

// Configure middleware for handling requests and responses
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs"); // Set EJS as the view engine
app.set("views", __dirname); // Set the views directory to the current directory

// Error handling middleware for handling database errors
const handleDatabaseError = (err, req, res, next) => {
  console.error("Database Error:", err);
  res.status(500).json({ error: "Database error" });
};

// Error handling middleware for handling server errors
const handleServerError = (err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: "Server error" });
};

// MongoDB URI
const uri = process.env.MONGODB_URI;

// Function to connect to MongoDB
const connectToDatabase = async () => {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    return client.db(); // Return the client's database reference
  } catch (err) {
    throw new Error("Failed to connect to MongoDB");
  }
};

// Handle POST requests to the "/submit" route
app.post("/submit", async (req, res, next) => {
  try {
    // Connect to MongoDB
    const db = await connectToDatabase();

    // Get the submitted questions as an array
    const questions = req.body.questions;

    // Insert the questions array into the MongoDB collection
    const result = await db.collection("formdatas").insertOne({ questions });

    // Respond with a JSON success message and the MongoDB result
    res.json({ message: "Data submitted to MongoDB successfully", result });
  } catch (err) {
    // Forward the error to the error handling middleware
    next(err);
  }
});

// Define route to render your dashboard template
app.get('/dashboard', async (req, res, next) => {
  try {
    // Connect to MongoDB
    const db = await connectToDatabase();

    // Fetch total number of forms in the "formdatas" collection
    const totalFormsCount = await db.collection('formdatas').countDocuments();

    // Fetch total number of documents in the "statsheet" collection
    const totalStatsCount = await db.collection('statsheet').countDocuments();

    // Get the current index from the query parameters
    const currentIndex = parseInt(req.query.currentIndex) || 0;

    // Fetch data for the form at the specified index from "formdatas" collection
    const formData = await db.collection('formdatas').findOne({}, { skip: currentIndex });

    // Fetch data for the document at the specified index from "statsheet" collection
    const statsData = await db.collection('statsheet').findOne({}, { skip: currentIndex });

    // Determine the active tab based on the query parameter
    const tab = req.query.tab || 'formdatas';

    // Render your HTML template with the fetched data, total counts, current index, and tab information
    res.render('dashboard', { formData: formData ? [formData] : [], statsData: statsData ? [statsData] : [], totalFormsCount, totalStatsCount, currentIndex, tab });
  } catch (err) {
    // Forward the error to the error handling middleware
    next(err);
  }
});




// Error handling middleware for handling database errors
app.use(handleDatabaseError);

// Error handling middleware for handling server errors
app.use(handleServerError);

// Start the Express server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
