const { model, Schema } = require("mongoose");
const newsSchema = new Schema({
  title: String,
  preview: String,
  image: String,
  link: String,
  createdAt: String,
});
module.exports = model("News", newsSchema);
