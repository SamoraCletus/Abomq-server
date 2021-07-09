const { model, Schema } = require("mongoose");
const sportSchema = new Schema({
  name: String,
  picture: String,
  posts: [
    {
      author: String,
      username: String,
      displayName: String,
      verified: String,
      profilePic: String,
      body: String,
      image: String,
      createdAt: String,
      comments: [
        {
          author: String,
          username: String,
          displayName: String,
          verified: String,
          profilePic: String,
          body: String,
          createdAt: String,
          commentLikes: [
            { username: String, displayName: String, verified: String },
          ],
          replies: [
            {
              author: String,
              username: String,
              displayName: String,
              profilePic: String,
              verified: String,
              body: String,
              createdAt: String,
              replyLikes: [
                { username: String, displayName: String, verified: String },
              ],
            },
          ],
        },
      ],
      likes: [
        {
          username: String,
          displayName: String,
          verified: String,
          profilePic: String,
          createdAt: String,
        },
      ],
    },
  ],

  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
});
module.exports = model("Sport", sportSchema);
