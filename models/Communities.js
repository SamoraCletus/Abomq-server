const { model, Schema } = require("mongoose");
const communitySchema = new Schema({
  name: String,
  picture: String,
  description: String,

  post: {
    type: Schema.Types.ObjectId,
    ref: "posts",
  },
  members: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
});
module.exports = model("Community", communitySchema);
