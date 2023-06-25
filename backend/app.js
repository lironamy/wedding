const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
app.use(cors());
const Attendee = require("./attendee");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://wedding-hostinger:Ladygaga2@cluster0.sn5e7l9.mongodb.net/wedding?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

// On Connection
mongoose.connection.on("connected", () => {
  console.log("Connected to database");
});

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/data", async (req, res) => {
  try {
    const data = await Attendee.find();
    res.status(200).json(data);
  } catch (error) {
    console.error("Failed to fetch data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { firstName, phoneNumber, lastName, arriving, guestsAmount, notes } =
      req.body;
    console.log("Received registration request:", req.body);
    const attendee = new Attendee({
      firstName,
      phoneNumber,
      lastName,
      arriving,
      guestsAmount,
      notes,
    });
    console.log("Saving to database:", attendee);
    await attendee.save();
    console.log("Registration successful");
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Failed to register:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`listening at http://localhost:${port}`);
});
