const { model, Schema } = require("mongoose");
const postSchema = new Schema({
  author: String,
  username: String,
  displayName: String,
  verified: Boolean,
  profilePic: String,
  body: String,
  image: String,
  createdAt: String,
  comments: [
    {
      author: String,
      username: String,
      displayName: String,
      verified: Boolean,
      profilePic: String,
      body: String,
      createdAt: String,
      commentLikes: [
        { username: String, displayName: String, verified: Boolean },
      ],
      replies: [
        {
          author: String,
          username: String,
          displayName: String,
          verified: Boolean,
          profilePic: String,
          body: String,
          createdAt: String,
          replyLikes: [
            { username: String, displayName: String, verified: Boolean },
          ],
        },
      ],
    },
  ],
  likes: [
    {
      username: String,
      displayName: String,
      verified: Boolean,
      profilePic: String,
      createdAt: String,
    },
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
});
module.exports = model("Post", postSchema);
