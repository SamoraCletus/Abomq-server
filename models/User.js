const { model, Schema } = require("mongoose");

const userSchema = new Schema({
  username: String,
  displayName: String,
  password: String,
  email: String,
  location: String,
  bios: {
    type: String,
    default: "Hey there I am a Sports Fan",
  },
  verified: {
    type: Boolean,
    default: false,
  },

  createdAt: String,
  age: String,

  profilePic: {
    type: String,
    default:
      "https://res.cloudinary.com/samoraa/image/upload/v1607165617/Profile%20Picture/no_picture_kzeucn.png",
  },
  coverPhoto: {
    type: String,
    default:
      "https://res.cloudinary.com/samoraa/image/upload/v1607165617/Profile%20Picture/no_picture_kzeucn.png",
  },
  followers: [
    {
      username: String,
      displayName: String,
      verified: Boolean,
      profilePic: String,
      bios: String,
    },
  ],
  followings: [
    {
      username: String,
      displayName: String,
      verified: Boolean,
      profilePic: String,
      bios: String,
    },
  ],
  notifications: [
    {
      profilePic: String,
      action: String,
      createdAt: String,
    },
  ],
});

module.exports = model("User", userSchema);
