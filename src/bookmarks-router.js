const express = require("express");
const uuid = require("uuid/v4");
const logger = require("./logger");
const store = require("./store");

const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter
  .route("/bookmarks")
  .get((req, res) => {
    res.json(store.bookmarks);
  })
  .post(bodyParser, (req, res) => {
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
    store.bookmarks.push(bookmark);

    logger.info(`Bookmark with id ${id} created`);

    res
      .status(201)
      .location(`http://localhost:8000/card/${id}`)
      .json(bookmark);
  });

bookmarksRouter
  .route("/bookmarks/:id")
  .get((req, res) => {
    const { id } = req.params;
    const bookmark = store.bookmarks.find(b => b.id == id);

    if (!bookmark) {
      logger.error(`Bookmark with id ${id} not found.`);
      return res.status(404).send("Bookmark Not Found");
    }

    res.json(bookmark);
  })
  .delete((req, res) => {
    const { id } = req.params;
    const index = store.bookmarks.findIndex(b => b.id == id);

    if (index === -1) {
      return res.status(404).send("Bookmark not found");
    }

    store.bookmarks.splice(index, 1);

    logger.info(`Bookmark with id ${id} deleted`);
    res
      .status(204)
      .json(store.bookmarks)
      .end();
  });

module.exports = bookmarksRouter;
