const { gql } = require("apollo-server");

module.exports = gql`
  type Post {
    id: ID!
    author: ID
    body: String!
    image: String
    createdAt: String!
    username: String!
    verified: Boolean!
    displayName: String!
    profilePic: String
    comments: [Comment]!
    likes: [Like]!
    likeCount: Int!
    commentCount: Int!
  }
  type Comment {
    id: ID!
    author: ID
    createdAt: String!
    profilePic: String!
    username: String!
    verified: Boolean!
    displayName: String!
    body: String!
    commentLikes: [Like]!
    commentLikeCount: Int!
    replies: [Reply]
    replyCount: Int!
  }
  type Like {
    id: ID!
    username: String!
    displayName: String
    verified: Boolean
    profilePic: String!
    createdAt: String!
  }
  type Reply {
    id: ID!
    author: ID
    profilePic: String!
    username: String!
    displayName: String!
    verified: Boolean
    body: String!
    createdAt: String!
    replyLikes: [Like]!
    replyLikeCount: Int!
  }
  input RegisterInput {
    username: String!
    email: String!
    password: String!
    confirmPassword: String!
    age: String!
  }
  type User {
    id: ID!
    username: String!
    displayName: String!
    email: String!
    coverPhoto: String!
    profilePic: String!
    age: String!
    createdAt: String!
    location: String!
    bios: String!
    verified: Boolean!
    token: String!
    followers: [Follower]!
    followings: [Following]!
    followersCount: Int!
    followingCount: Int!
    notifications: [Notification]!
  }
  type Notification {
    profilePic: String!
    action: String!
    createdAt: String!
  }
  type Follower {
    id: ID!
    username: String!
    displayName: String
    verified: Boolean!
    profilePic: String!
    bios: String!
  }
  type Following {
    id: ID!
    username: String!
    displayName: String
    verified: Boolean!
    profilePic: String!
    bios: String!
  }
  type Sport {
    id: ID!
    name: String!
    picture: String
    posts: [Post]!
  }
  type Community {
    id: ID!
    name: String!
    picture: String
    posts: [Post]
    members: [User]
  }
  type News {
    id: ID!
    title: String!
    link: String!
    image: String
    preview: String!
    createdAt: String!
  }

  type Query {
    getPosts: [Post]!
    getNews: [News]!
    getUserPosts(username: String!): [Post]!
    getPost(postId: ID!): Post!
    getSports(name: String!): Sport!
    getSportPost(name: String!, postId: ID!): Post!
    getNotifications(userId: ID!): User!
    getUser(username: String!): User!
    getUsers: [User]!
  }
  type Mutation {
    # user mutations
    register(registerInput: RegisterInput): User!
    login(username: String!, password: String!): User!
    uploadPhoto(image: Upload!): User!
    editProfile(bios: String, displayName: String, location: String): User!
    uploadCoverPhoto(image: Upload!): User!
    followUser(userId: ID!): User!
    # end of user mutations
    # posting Mutations
    createPost(body: String!, image: Upload): Post!
    deletePost(postId: ID!): String!
    likePost(postId: ID!, author: ID!): Post!
    createComment(postId: ID!, body: String!, author: ID!): Post!
    likeComment(postId: ID!, commentId: ID!, author: ID!): Post!
    replyComment(postId: ID!, commentId: ID!, body: String!, author: ID!): Post!
    likeReply(postId: ID!, commentId: ID!, replyId: ID!, author: ID!): Post!
    deleteComment(postId: ID!, commentId: ID!): Post!
    deleteReply(postId: ID!, commentId: ID!, replyId: ID!): Post!
    # end of posting mutations
    # Sports Mutations
    createSportPost(name: String!, body: String!, image: Upload): Sport!
    deleteSportPost(name: String!, postId: ID!): String!
    likeSportPost(name: String!, postId: ID!): Sport!
    createSportComment(name: String!, postId: ID!, body: String!): Sport!
  }
  type Subscription {
    newPost: Post!
    newUser: User!
    newNotification: Notification!
  }
`;
