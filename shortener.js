// Node Modules
const express = require("express");
const http = require("http");
const debug = require("debug");
const logger = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const randstr = require("randomstring");
const config = require("./config.json");
const shortLink = require("./shortLink");

// Express Setup
const log = debug("shortener:server");
const app = express();
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Mongoose Setup
mongoose.connect(
  config.db.url,
  {
    dbName: config.db.name,
    useCreateIndex: true,
    useNewUrlParser: true
  },
  err => {
    if (err) {
      log(err);
    } else {
      log("Connected to MongoDB");
    }
  }
);

// Route Setup
app.post("/shorten", (req, res) => {
  if (req.body.url) {
    const link = req.body.url;
    const shortKey = randstr.generate(config.urlLength);
    shortLink
      .create({
        key: shortKey,
        url: link
      })
      .then(doc => {
        res.send(doc.key);
      })
      .catch(err => res.status(500).json(err));
  } else {
    res.sendStatus(400);
  }
});

app.get("/:shortKey", (req, res) => {
  const shortKey = req.params.shortKey;
  shortLink.findOne(
    {
      key: shortKey
    },
    (err, doc) => {
      if (err) return res.status(500).json(err);
      if (doc) {
        res.redirect(doc.url);
      }
    }
  );
});

// Server Setup
const server = http.createServer(app);
server.listen(8000);
server.on("error", err => log(err));
server.on("listening", () => {
  let addr =
    typeof server.address() === "string"
      ? "pipe " + server.address()
      : "port " + server.address().port;
  log(`Listening on ${addr}`);
});
