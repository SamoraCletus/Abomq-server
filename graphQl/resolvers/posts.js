const Post = require("../../models/Post");
const User = require("../../models/User");
const Auth = require("../../utilities/Auth");
const { AuthenticationError, UserInputError } = require("apollo-server");
const cloudinary = require("cloudinary");
const { CLOUD_NAME, API_KEY, API_SECRET } = require("../../config");
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

module.exports = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getUserPosts(_, { username }) {
      const user = await User.findOne({ username });
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        if (posts) {
          post = posts.filter((post) => post.username === user.username);
        }
        return post;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);
        if (post) {
          return post;
        } else {
          throw new Error("Post not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async createPost(_, { body, image }, context) {
      const { id } = Auth(context);
      const { _id, displayName, username, profilePic, verified } =
        await User.findById(id);
      if (body.trim() === "") {
        throw new Error("Post must not be Empty");
      }
      if (image) {
        const file = await uploadFile(image);
        // cloudinary image upload logic

        async function uploadFile(file) {
          // The Upload scalar return a a promise
          const { createReadStream } = await file;
          const fileStream = createReadStream();
          return new Promise((resolve, _) => {
            const cloudStream = cloudinary.v2.uploader.upload_stream(function (
              err,
              result
            ) {
              // if all goes well
              if (!err || result !== undefined) {
                resolve(result);
                return (image = result.url);
              } else {
                // In case something goes south
                try {
                  resolve(result);
                } catch (err) {
                  throw new Error("Cannot submit post");
                }
              }
            });

            fileStream.pipe(cloudStream);
          });
        }
      }

      const newPost = new Post({
        author: _id,
        username,
        verified,
        displayName,
        profilePic,
        body,
        image,
        createdAt: new Date().toISOString(),
      });
      const post = await newPost.save();
      context.pubsub.publish("NEW_POST", {
        newPost: post,
      });

      return post;
    },
    async deletePost(_, { postId }, context) {
      const { username } = Auth(context);
      try {
        const post = await Post.findById(postId);
        const { image } = post;
        if (username === post.username) {
          await post.delete();
          if (image) {
            let deletedImage = image.slice(59, 79);
            await cloudinary.uploader.destroy(deletedImage, function (err) {
              // In case things goes south
              if (err) {
                return err;
              }
            });
          }
          return "Post deleted Sucessfully";
        } else {
          throw new AuthenticationError("Cannot delete Post");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async likePost(_, { postId, author }, context) {
      const { id } = Auth(context);
      const { profilePic, displayName, username, verified } =
        await User.findById(id);
      const post = await Post.findById(postId);
      const user = await User.findById(author);
      if (post) {
        if (post.likes.find((like) => like.username === username)) {
          // post already liked
          post.likes = post.likes.filter((like) => like.username !== username);
        } else {
          // not liked
          post.likes.push({
            username,
            displayName,
            verified,
            profilePic,
            createdAt: new Date().toISOString(),
          });
          if (author !== id) {
            user.notifications.push({
              profilePic,
              action: `${displayName} liked your post "${post.body}"`,
              createdAt: new Date().toISOString(),
            });
          }
        }
        await post.save();
        await user.save();
        return post;
      } else throw new UserInputError("Post not found");
    },
  },
  Subscription: {
    newPost: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("NEW_POST"),
    },
  },
};
