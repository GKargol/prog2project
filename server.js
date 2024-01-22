const express = require("express");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = 3000;

app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true })); // Parse form data

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/submit", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("test").collection("notes");

    // Access data from the request body using destructuring
    const { question1, question2, question3 } = req.body;

    const dataToInsert = {
      question1,
      question2,
      question3,
    };

    const result = await collection.insertOne(dataToInsert);

    res.json({ message: "Data submitted to MongoDB successfully", result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  } finally {
    client.close();
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
