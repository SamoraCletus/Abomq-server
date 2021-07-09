const postResolvers = require("./posts");
const sportResolvers = require("./sports");
const userResolvers = require("./users");
const commentsResolvers = require("./comments");

module.exports = {
  Post: {
    likeCount: (parent) => parent.likes.length,
    commentCount: (parent) => parent.comments.length,
  },
  Comment: {
    commentLikeCount: (parent) => parent.commentLikes.length,
    replyCount: (parent) => parent.replies.length,
  },
  Reply: {
    replyLikeCount: (parent) => parent.replyLikes.length,
  },
  User: {
    followersCount: (parent) => parent.followers.length,

    followingCount: (parent) => parent.followings.length,
  },
  Query: {
    ...postResolvers.Query,
    ...userResolvers.Query,
    ...sportResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...commentsResolvers.Mutation,
    ...sportResolvers.Mutation,
  },
  Subscription: {
    ...postResolvers.Subscription,
    ...userResolvers.Subscription,
  },
};
