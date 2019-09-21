const { NODE_ENV } = require("./config");
const express = require("express");
const app = express();
app.use(express.json());

function errorHandler(error, req, res, next) {
  let response;
  if ((NODE_ENV === "production") === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
}

module.exports = errorHandler;
