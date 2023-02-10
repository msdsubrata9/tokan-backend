const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mysql2 = require("mysql2");
const { MongoClient } = require("mongodb");
const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);
const bcrypt = require("bcrypt");
const { signupValidator, loginValidator } = require("./userValidator");
const { signupController, loginController } = require("./userController");
const cors = require("cors");
const databaseName = "mongo-signup";

client.connect((err) => {
  if (err) {
    console.log("Error connecting to MongoDB");
  }
  console.log("Connected to MongoDB");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const corsOpts = {
  origin: "*",

  methods: ["GET", "POST"],

  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOpts));

app.post("/Signup", signupValidator, signupController);

app.post("/logincount", async (req, res) => {
  let femail = await req.body.femail;
  client
    .db(databaseName)
    .collection("users")
    .countDocuments({ email: femail, logintype: 1 }, function (err, count) {
      res.json({ message: `Login count of "${femail} is: "`, count: count });
    });
});

app.post("/login", loginValidator, loginController);

app.listen(8000, () => {
  console.log("Server started on port 8000");
});
