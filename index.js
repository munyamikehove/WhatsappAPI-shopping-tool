const express = require("express");
const bodyParser = require("body-parser");
const functions = require("firebase-functions");
// const jwt = require("jsonwebtoken");
// const admin = require("firebase-admin");


// const serviceAccount = require("./serviceAccountKey.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://tapfuma-12ab6-default-rtdb.firebaseio.com",
// });

// Telegram Setup
// const TOKEN = process.env;
// const SERVER_URL = "https://us-central1-tapfuma-12ab6.cloudfunctions.net/tapfumaBot";
// const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`
// const URI = `/webhook/${TOKEN}`;
// const WEBHOOK_URL = SERVER_URL + URI;


const app = express();

// Enable JSON Parser
app.use(bodyParser.json());

// Automatically allow cross-origin requests
// app.use(cors({ origin: true }));

// Add middleware to authenticate requests
// app.use(myMiddleware);

// initialize routes
app.use("/api", require("./api"));

// function authenticateToken(req, res, next) {
//   // const authHeader = req.headers["authorization"];
//   // const token = authHeader && authHeader.split(" ")[1];
//   const token = req.body
//   if (token == null) {
//     return res.status(401).send({
//       "Error": "Unauthorized Access",
//     });
//   }

//   jwt.verify(token, process.env.WABA_TOKEN_SECRET, (err, user) => {
//     if (err) {
//       return res.status(403).send({
//         "Error": "Unauthorized Access",
//       });
//     }

//     next();
//   });
// }

// Expose Express API as a single Cloud Function:
exports.tapfuma_api = functions.https.onRequest(app);

