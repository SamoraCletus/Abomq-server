const { AuthenticationError, UserInputError } = require("apollo-server");
const Sport = require("../../models/Sport");
const User = require("../../models/User");
const Auth = require("../../utilities/Auth");

module.exports = {
  Query: {
    async getSports(_, { name }) {
      const sport = await Sport.findOne({ name });
      try {
        if (sport) {
          return sport;
        } else {
          throw new Error(err, "no post to display");
        }
      } catch (err) {
        throw new Error(err, "no post to display");
      }
    },
    async getSportPost(_, { name, postId }) {
      const sport = await Sport.findOne({ name });
      try {
        if (sport) {
          const { posts } = sport;
          const post = await posts.find((p) => p.id === postId);
          return post;
        } else {
          throw new Error(err, "no post to display");
        }
      } catch (err) {
        throw new Error(err, "no post to display");
      }
    },
  },
  Mutation: {
    async createSportPost(_, { name, body, image }, context) {
      const { id } = Auth(context);
      const {
        _id,
        displayName,
        username,
        profilePic,
        verified,
      } = await User.findById(id);
      const sport = await Sport.findOne({ name });

      if (body.trim() === "") {
        throw new Error("Post must not be Empty");
      }
      if (image) {
        const file = await uploadFile(image);
        // cloudinary image upload logic

        async function uploadFile(file) {
          console.log(file);
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

      if (sport) {
        sport.posts.unshift({
          author: _id,
          username,
          displayName,
          verified,
          profilePic,
          body,
          image,
          createdAt: new Date().toISOString(),
        });
      }
      await sport.save();
      return sport;
    },
    async deleteSportPost(_, { name, postId }, context) {
      const { username } = Auth(context);
      try {
        const sport = await Sport.findOne({ name });
        if (sport) {
          const { posts } = sport;
          const { image } = posts;
          const deletePost = await posts.find((p) => p.id === postId);
          if (deletePost.username === username) {
            posts.remove(deletePost);
            if (image) {
              let deletedImage = image.slice(59, 79);
              await cloudinary.uploader.destroy(deletedImage, function (err) {
                // In case things goes south
                if (err) {
                  return err;
                }
              });
            }
            await sport.save();
            return "Post deleted Sucessfully";
          } else {
            throw new AuthenticationError("Action not Allowed");
          }
        } else {
          throw new UserInputError("Post not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async likeSportPost(_, { name, postId }, context) {
      const { id } = Auth(context);
      const {
        username,
        profilePic,
        displayName,
        verified,
      } = await User.findById(id);
      const sport = await Sport.findOne({ name });
      const { posts } = sport;
      const post = await posts.find((p) => p.id === postId);
      if (sport) {
        if (post.likes.find((like) => like.username === username)) {
          // post already liked
          post.likes = post.likes.filter((like) => like.username !== username);
        } else {
          // not liked
          post.likes.push({
            username,
            profilePic,
            displayName,
            verified,
            createdAt: new Date().toISOString(),
          });
        }
        await sport.save();
        return sport;
      } else throw new UserInputError("Post not found");
    },
    async createSportComment(_, { name, postId, body }, context) {
      const { id } = Auth(context);
      const {
        _id,
        username,
        profilePic,
        displayName,
        verified,
      } = await User.findById(id);
      const sport = await Sport.findOne({ name });
      const { posts } = sport;
      const post = await posts.find((p) => p.id === postId);
      if (body.trim() === "") {
        throw new UserInputError("Empty Comment", {
          errors: {
            body: "Empty comments",
          },
        });
      }
      if (post) {
        post.comments.unshift({
          author: _id,
          username,
          profilePic,
          displayName,
          verified,
          body,
          createdAt: new Date().toISOString(),
        });
        await sport.save();
        return sport;
      }
    },
  },
};
