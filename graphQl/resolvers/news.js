const News = require("../../models/News");
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
    async getNews() {
      try {
        const news = await News.find().sort({ createdAt: -1 });
        return news;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
