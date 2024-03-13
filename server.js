// Import necessary libraries and modules
const express = require("express");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const session = require("express-session");

// Load environment variables from a .env file
dotenv.config();

// Create an Express application
const app = express();
const port = process.env.PORT || 3000; // Use the port specified in the environment variable or default to 3000

// Configure middleware for handling requests and responses
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.set("views", __dirname);
app.set("view engine", "ejs"); // Set EJS as the view engine

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

// Login page
app.get("/login", (req, res) => {
  res.render("login"); // Render the login page using EJS
});

// Login authentication route
app.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  // You would replace this with your actual user authentication logic
  if (username === "admin" && password === "password") {
    req.session.user = username;
    res.redirect("/dashboard"); // Redirect to the dashboard after successful login
  } else {
    res.render("login", { error: "Invalid username or password" });
  }
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.redirect("/login"); // Redirect to the login page after logout
  });
});

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

// Handle POST requests to the "/submit2" route
app.post("/submit2", async (req, res, next) => {
  try {
    // Connect to MongoDB
    const db = await connectToDatabase();

    // Get the submitted questions as an array
    const questions = req.body.questions;

    // Insert the questions array into the MongoDB collection
    const result = await db.collection("statsheet").insertOne({ questions });

    // Respond with a JSON success message and the MongoDB result
    res.json({ message: "Data submitted to MongoDB successfully", result });
  } catch (err) {
    // Forward the error to the error handling middleware
    next(err);
  }
});

// Dashboard page logic!
app.get("/dashboard", async (req, res, next) => {
  // Check if user is logged in
  if (!req.session.user) {
    // If not logged in, redirect to login page
    res.redirect("/login");
    return;
  }
  try {
    // Connect to MongoDB
    const db = await connectToDatabase();

    // Fetch total number of forms in the "formdatas" collection
    const totalFormsCount = await db.collection("formdatas").countDocuments();

    // Fetch total number of documents in the "statsheet" collection
    const totalStatsCount = await db.collection("statsheet").countDocuments();

    // Get the current index from the query parameters
    const currentIndex = parseInt(req.query.currentIndex) || 0;

    // Fetch data for the form at the specified index from "formdatas" collection
    const formData = await db
      .collection("formdatas")
      .findOne({}, { skip: currentIndex });

    // Fetch data for the document at the specified index from "statsheet" collection
    const statsData = await db
      .collection("statsheet")
      .findOne({}, { skip: currentIndex });

    // Determine the active tab based on the query parameter
    const tab = req.query.tab || "formdatas";

    // Render your HTML template with the fetched data, total counts, current index, and tab information
    res.render("dashboard", {
      formData: formData ? [formData] : [],
      statsData: statsData ? [statsData] : [],
      totalFormsCount,
      totalStatsCount,
      currentIndex,
      tab,
    });
  } catch (err) {
    // Forward the error to the error handling middleware
    next(err);
  }
});

// Start the Express server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
