const express = require("express");
const bodyParser = require("body-parser");
const functions = require("firebase-functions");
const api = require("./api");

const app = express();

// Enable JSON Parser
app.use(bodyParser.json());


// initialize routes
app.use("/api", api);


// Expose Express API as a single Cloud Function:
exports.tapfuma_api = functions.https.onRequest(app);


