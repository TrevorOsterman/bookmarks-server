require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const winston = require("winston");
const uuid = require("uuid/v4");

const app = express();

app.use(morgan("dev"));

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(cors());
app.use(morgan(morganOption));
app.use(helmet());
app.use(express.json());

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: "info.log" })]
});

if (NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple()
    })
  );
}

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get("Authorization");

  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: "Unauthorized request" });
  }
  // move to the next middleware
  next();
});

app.get("/", (req, res) => {
  res.send("Hello, boilerplate!");
});

const bookmarks = [
  {
    id: 1,
    title: "google",
    url: "www.google.com",
    rating: 4
  },
  {
    id: 2,
    title: "yahoo",
    url: "www.yahoo.com",
    rating: 3
  },
  {
    id: 3,
    title: "npr",
    url: "www.npr.org",
    rating: 5
  }
];

app.get("/bookmarks", (req, res) => {
  res.json(bookmarks);
});

app.get("/bookmarks/:id", (req, res) => {
  const { id } = req.params;
  const bookmark = bookmarks.find(b => b.id == id);

  if (!bookmark) {
    logger.error(`Bookmark with id ${id} not found.`);
    return res.status(404).send("Bookmark Not Found");
  }

  res.json(bookmark);
});

app.post("/bookmarks", (req, res) => {
  const { title, url, rating } = req.body;

  if (!title) {
    logger.error(`Title is required`);
    return res.status(400).send("Invalid data");
  }

  if (!url) {
    logger.error(`URL is required`);
    return res.status(400).send("Invalid data");
  }

  if (!rating) {
    logger.error(`Rating is required`);
    return res.status(400).send("Invalid data");
  }

  const id = uuid();
  bookmark = { id, title, url, rating };
  bookmarks.push(bookmark);

  logger.info(`Bookmark with id ${id} created`);

  res
    .status(201)
    .location(`http://localhost:8000/card/${id}`)
    .json(bookmark);
});

app.delete("./bookmarks/:id", (req, res) => {
  const { id } = req.params;
  const index = bookmarks.findIndex(b => b.id == id);

  if (index === -1) {
    return res.status(404).send("Bookmark not found");
  }

  bookmarks.splice(index, 1);

  logger.info(`Bookmark with id ${id} deleted`);
  res
    .status(204)
    .json(bookmarks)
    .end();
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if ((NODE_ENV === "production") === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
