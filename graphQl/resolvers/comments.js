const { UserInputError, AuthenticationError } = require("apollo-server");
const Post = require("../../models/Post");
const User = require("../../models/User");
const Auth = require("../../utilities/Auth");

module.exports = {
  Mutation: {
    createComment: async (_, { postId, body, author }, context) => {
      const { id } = Auth(context);
      const {
        _id,
        displayName,
        username,
        profilePic,
        verified,
      } = await User.findById(id);
      const user = await User.findById(author);

      if (body.trim() === "") {
        throw new UserInputError("Empty Comment", {
          errors: {
            body: "Empty comments",
          },
        });
      }
      const post = await Post.findById(postId);
      if (post) {
        post.comments.unshift({
          author: _id,
          username,
          displayName,
          verified,
          profilePic,
          body,
          createdAt: new Date().toISOString(),
        });
        if (author !== id) {
          user.notifications.push({
            action: `${displayName} commented on your post "${post.body}"`,
            profilePic,
            createdAt: new Date().toISOString(),
          });
        }
        await post.save();
        await user.save();
        return post;
      } else throw new UserInputError("Post not Found");
    },
    async likeComment(_, { postId, commentId, author }, context) {
      const { id } = Auth(context);
      const {
        username,
        displayName,
        profilePic,
        verified,
      } = await User.findById(id);
      const post = await Post.findById(postId);
      const user = await User.findById(author);

      if (post) {
        const { comments } = post;
        if (comments) {
          const likedComment = comments.findIndex((c) => c.id === commentId);
          if (
            comments[likedComment].commentLikes.find(
              (commentLike) => commentLike.username === username
            )
          ) {
            // comment already liked
            comments[likedComment].commentLikes = comments[
              likedComment
            ].commentLikes.filter(
              (commentLike) => commentLike.username !== username
            );
          } else {
            //comment not liked
            comments[likedComment].commentLikes.push({
              username,
              displayName,
              verified,
            });
            if (author !== id) {
              user.notifications.push({
                action: `${displayName} liked your comment "${comments[likedComment].body}"`,
                profilePic,
                createdAt: new Date().toISOString(),
              });
            }
          }
          await post.save();
          await user.save();
          return post;
        }
        await post.save();
        return post;
      } else throw new UserInputError("Post not Found");
    },
    replyComment: async (_, { postId, commentId, body, author }, context) => {
      const { id } = Auth(context);
      const {
        _id,
        username,
        profilePic,
        verified,
        displayName,
      } = await User.findById(id);
      const user = await User.findById(author);

      if (body.trim() === "") {
        throw new UserInputError("Empty Reply", {
          errors: {
            body: "Empty Reply",
          },
        });
      }
      const post = await Post.findById(postId);
      if (post) {
        const { comments } = post;
        if (comments) {
          const repliedComment = comments.findIndex((c) => c.id === commentId);
          comments[repliedComment].replies.unshift({
            author: _id,
            body,
            username,
            displayName,
            verified,
            profilePic,
            createdAt: new Date().toISOString(),
          });
          if (author !== id) {
            user.notifications.push({
              action: `${displayName} replied your comment "${comments[repliedComment].body}"`,
              profilePic,
              createdAt: new Date().toISOString(),
            });
          }
        }
        await post.save();
        await user.save();
        return post;
      } else throw new UserInputError("Post not Found");
    },

    async deleteComment(_, { postId, commentId }, context) {
      const { username } = Auth(context);
      const post = await Post.findById(postId);
      if (post) {
        const commentIndex = post.comments.findIndex((c) => c.id === commentId);
        if (post.comments[commentIndex].username === username) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        } else {
          throw new AuthenticationError("Action not Allowed");
        }
      } else {
        throw new UserInputError("Post not found");
      }
    },
    async deleteReply(_, { postId, commentId, replyId }, context) {
      const { username } = Auth(context);
      const post = await Post.findById(postId);
      if (post) {
        const { comments } = post;
        const repliedComment = comments.findIndex((c) => c.id === commentId);
        const replyIndex = comments[repliedComment].replies.findIndex(
          (c) => c.id === replyId
        );
        if (
          comments[repliedComment].replies[replyIndex].username === username
        ) {
          comments[repliedComment].replies.splice(replyIndex, 1);
          await post.save();
          return post;
        } else {
          throw new AuthenticationError("Action not Allowed");
        }
      } else {
        throw new UserInputError("Post not found");
      }
    },
    async likeReply(_, { postId, commentId, replyId, author }, context) {
      const { id } = Auth(context);
      const {
        displayName,
        username,
        profilePic,
        verified,
      } = await User.findById(id);
      const post = await Post.findById(postId);
      const user = await User.findById(author);
      if (post) {
        const { comments } = post;
        if (comments) {
          const likedComment = comments.findIndex((c) => c.id === commentId);
          const replyIndex = comments[likedComment].replies.findIndex(
            (c) => c.id === replyId
          );
          if (
            comments[likedComment].replies[replyIndex].replyLikes.find(
              (replyLike) => replyLike.username === username
            )
          ) {
            // comment already liked
            comments[likedComment].replies[replyIndex].replyLikes = comments[
              likedComment
            ].replies[replyIndex].replyLikes.filter(
              (replyLike) => replyLike.username !== username
            );
          } else {
            //comment not liked
            comments[likedComment].replies[replyIndex].replyLikes.push({
              username,
              displayName,
              verified,
            });
            if (author !== id) {
              user.notifications.push({
                action: `${displayName} liked your reply "${comments[likedComment].body}"`,
                profilePic,
                createdAt: new Date().toISOString(),
              });
            }
          }
          await post.save();
          await user.save();
          return post;
        }
        await post.save();
        return post;
      } else throw new UserInputError("Post not Found");
    },
  },
};
