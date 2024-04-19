// Import necessary libraries and modules
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const session = require("express-session");
const PDFDocument = require("pdfkit");
const doc = new PDFDocument();

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
  // Extract the error message from the query parameters
  const errorMessage = req.query.error ? req.query.error : null;
  res.render("login", { errorMessage: errorMessage });
});

// Login authentication route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  // You would replace this with your actual user authentication logic
  if (username === "admin" && password === "password") {
    req.session.user = username;
    res.redirect("/dashboard"); // Redirect to the dashboard after successful login
  } else {
    // If username or password is incorrect, redirect back to the login page with an error message
    res.redirect("/login?error=Invalid username or password");
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

    // Extract the data from the request body
    const { questions } = req.body;

    // Insert each question into the MongoDB collection
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

// Handle DELETE requests to delete a statsheet entry
app.delete("/deleteStatsEntry/:entryId", async (req, res, next) => {
  try {
    // Connect to MongoDB
    const db = await connectToDatabase();

    // Retrieve the entry ID from the request parameters
    const entryId = req.params.entryId;

    // Delete the entry from the "statsheet" collection using the provided entry ID
    const result = await db
      .collection("statsheet")
      .deleteOne({ _id: new ObjectId(entryId) }); // Use ObjectId constructor correctly

    // Check if the entry was successfully deleted
    if (result.deletedCount === 1) {
      res.sendStatus(200); // Send a success response
    } else {
      res.sendStatus(404); // Send a not found response if the entry was not deleted
    }
  } catch (err) {
    // Forward the error to the error handling middleware
    next(err);
  }
});

// Handle DELETE requests to delete a form entry
app.delete("/deleteFormsEntry/:entryId", async (req, res, next) => {
  try {
    // Connect to MongoDB
    const db = await connectToDatabase();

    // Retrieve the entry ID from the request parameters
    const entryId = req.params.entryId;

    // Delete the entry from the "formdata" collection using the provided entry ID
    const result = await db
      .collection("formdatas")
      .deleteOne({ _id: new ObjectId(entryId) });

    // Check if the entry was successfully deleted
    if (result.deletedCount === 1) {
      res.sendStatus(200); // Send a success response
    } else {
      res.sendStatus(404); // Send a not found response if the entry was not deleted
    }
  } catch (err) {
    // Forward the error to the error handling middleware
    next(err);
  }
});

app.get("/download-pdf", async (req, res, next) => {
  if (!req.session.user) {
    res.redirect("/login");
    return;
  }

  try {
    const db = await connectToDatabase();
    const currentIndex = parseInt(req.query.currentIndex) || 0;
    const tab = req.query.tab || "statsheet"; // Defaults to "statsheet" if no tab is specified

    let data = await db
      .collection(tab)
      .find()
      .skip(currentIndex)
      .limit(1)
      .toArray();
    data = data[0]; // Since find().toArray() returns an array

    if (!data) {
      res.status(404).send("No data available for PDF generation.");
      return;
    }

    res.setHeader("Content-Type", "application/pdf");
    const formattedIndex = currentIndex + 1;
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${tab}-data-${formattedIndex}.pdf"`
    );

    const doc = new PDFDocument();
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text(`Data for ${tab.toUpperCase()} - Entry ${formattedIndex}`, {
        underline: true,
      });
    doc.fontSize(14).moveDown(2);

    let startX = 50;
    let startY = doc.y;

    if (tab === "formdatas" && data.questions) {
      // Simple Q&A format for form data
      data.questions.forEach((question) => {
        if (question.id && question.value != null) {
          if (startY > 650) {
            // Check if the current position is near the bottom of the page
            doc.addPage();
            startY = 50; // Reset startY position for the new page
          }
          doc
            .fontSize(12)
            .font("Helvetica-Bold")
            .text(`Question ID: ${question.id}`, { bold: true });
          let answer = Array.isArray(question.value)
            ? question.value.join(", ")
            : question.value.toString();
          doc.font("Helvetica").text(`Answer: ${answer}`, { indent: 20 });
          startY = doc.y + 20; // Update startY after each question-answer pair
        }
      });
    } else if (tab === "statsheet" && data.questions) {
      // Table-like output for statsheet data
      data.questions.forEach((question) => {
        if (
          question.id &&
          question.value &&
          typeof question.value === "object"
        ) {
          if (startY > 650) {
            // Ensure content does not overflow
            doc.addPage();
            startY = 50;
          }
          doc
            .fontSize(12)
            .font("Helvetica-Bold")
            .text(`Question ID: ${question.id}`, startX, startY, {
              underline: false,
            });
          startY += 20;
          if (Array.isArray(question.value)) {
            let answers = question.value.join(", ");
            doc
              .fontSize(10)
              .font("Helvetica")
              .text(`Answers: ${answers}`, startX + 20, startY);
          } else {
            Object.keys(question.value).forEach((key) => {
              doc
                .fontSize(10)
                .font("Helvetica")
                .text(`${key}: ${question.value[key]}`, startX + 20, startY);
              startY += 20;
            });
          }
          startY += 30; // Additional space before next question
        }
      });
    }

    doc.end();
    doc.pipe(res);
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).send("Error generating PDF.");
  }
});

// Start the Express server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
