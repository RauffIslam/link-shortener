const { Schema, model } = require("mongoose");

const shortLinkModel = new Schema({
  key: {
    type: String,
    index: true
  },
  url: {
    type: String
  }
});

const shortLink = model("links", shortLinkModel);
module.exports = shortLink;
