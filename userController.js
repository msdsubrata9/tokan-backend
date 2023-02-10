const mysql2 = require("mysql2");
const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");
const { templateSettings } = require("underscore");
const url = "mongodb://127.0.0.1:27017";
const databaseName = "mongo-signup";
const client = new MongoClient(url);

client.connect((err) => {
  if (err) {
    console.log("Error connecting to MongoDB");
  }
  console.log("Connected to MongoDB");
});

const logintype = 0; // 0 for signup, 1 for signin
const lastLoginTime = new Date();

const connection = mysql2.createPool({
  host: "localhost",
  user: "root",
  password: "Subrata@1234",
  database: "nodejs-login",
  connectionLimit: 10,
});

const signupController = async (req, res) => {
  const { fname, femail, fMobileNo, fregister } = req.body;

  // Hash the user's password
  const hashedPassword = await bcrypt.hash(req.body.fpassword, 10);

  const sql = `INSERT INTO users (name, email, password, mobile, register) VALUES (?, ?, ?, ?, ?)`;

  const values = [fname, femail, hashedPassword, fMobileNo, fregister];

  connection.query(sql, values, (error, results) => {
    if (error) {
      res.send({ success: false, message: "Duplicate Email Id" });
    } else {
      // get the next auto-incremented userid value
      client
        .db(databaseName)
        .collection("users")
        .find()
        .sort({ userid: -1 })
        .limit(1)
        .toArray(function (err, res) {
          let userid = 1;
          if (res.length > 0) {
            userid = res[0].userid + 1;
          }

          // insert the signup data into the signup collection
          client
            .db(databaseName)
            .collection("users")
            .insertOne(
              {
                userid: userid,
                timestamp: lastLoginTime,
                email: femail,
                ip: req.ip,
                logintype: logintype,
                lastLoginTime: lastLoginTime,
              },
              function (err, res) {
                if (err) {
                  console.log("Error inserting data into MongoDB");
                }
                console.log("Login data inserted successfully");
              }
            );
        });
      res.send({ success: true, message: "Signup successful." });
    }
  });
};

const loginController = (req, res, next) => {
  // Retrieve the hashed password for the provided email from the database
  const selectQuery = `SELECT password FROM users WHERE email = ?`;
  connection.query(selectQuery, [req.body.femail], async (error, results) => {
    if (error) {
      res.send({ success: false, message: "Invalid email or password" });
    }

    if (results.length === 0) {
      res.send({ message: "Invalid email or password" });
    }

    // Compare the provided plain text password with the hashed password
    const match = await bcrypt.compare(req.body.fpassword, results[0].password);

    if (match) {
      // get the no of times users login

      // insert the signup data into the signup collection
      client
        .db(databaseName)
        .collection("users")
        .insertOne(
          {
            lastLoginTime: new Date(),
            email: req.body.femail,
            logintype: 1,
          },
          function (err, res) {
            if (err) {
              console.log("Error inserting data into MongoDB");
            }
            console.log("Login data inserted successfully");
          }
        );
      next();
      res.send({ message: "Successful login" });
    } else {
      res.json({ message: "Invalid email or password" });
    }
  });
};

module.exports = { signupController, loginController };
