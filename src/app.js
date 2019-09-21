require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const winston = require("winston");
const logger = require("./logger");
const uuid = require("uuid/v4");
const validateBearerToken = require("./validation");
const bookmarksRouter = require("./bookmarks-router");
const errorHandler = require("./error-handler");

const app = express();

app.use(morgan("dev"));

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(cors());
app.use(morgan(morganOption));
app.use(helmet());
app.use(express.json());

app.use(validateBearerToken);

app.get("/", (req, res) => {
  res.send("Hello, boilerplate!");
});

app.use(bookmarksRouter);

app.use(errorHandler);

module.exports = app;
