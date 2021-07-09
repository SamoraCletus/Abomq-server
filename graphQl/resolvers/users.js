const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");
const Auth = require("../../utilities/Auth");
const cloudinary = require("cloudinary");
const { CLOUD_NAME, API_KEY, API_SECRET } = require("../../config");
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    SECRET_KEY,
    { expiresIn: "5d" }
  );
}

const {
  validatesRegisterInput,
  validateLoginInput,
} = require("../../utilities/validitors");
const { SECRET_KEY } = require("../../config");
const User = require("../../models/User");

module.exports = {
  Mutation: {
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const user = await User.findOne({ username });
      if (!user) {
        errors.general = "Invalid Username or Password";
        throw new UserInputError("Invalid Username or Password", { errors });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = "Invalid Username or Password";
        throw new UserInputError("Invalid Username or Password", { errors });
      }
      const token = generateToken(user);
      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
    async register(
      _,
      { registerInput: { username, email, password, confirmPassword, age } }
    ) {
      // validate user data
      const { valid, errors } = validatesRegisterInput(
        username,
        email,
        password,
        confirmPassword,
        age
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      // ensure username is unique
      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError("Username already exist", {
          errors: {
            username: "UserName already taken",
          },
        });
      }
      //ensure email is unique
      const userEmail = await User.findOne({ email });
      if (userEmail) {
        throw new UserInputError("Email already exist", {
          errors: {
            email: "Email already exist",
          },
        });
      }
      // ensure user is 13 years or older
      if (!age) {
        throw new UserInputError("You must provide an age to signup", {
          errors: {
            age: "age must not be empty, please provide your age",
          },
        });
      } else if (new Date().getFullYear() - age < 13) {
        throw new UserInputError("Cannot complete operation", {
          errors: {
            age: "Cannot complete operation",
          },
        });
      }

      //hash password and create an auth token
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        username,
        email,
        displayName: username,
        password,
        verified: false,
        age,
        createdAt: new Date().toISOString(),
      });
      const res = await newUser.save();

      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
    async uploadPhoto(_, { image }, context) {
      const { id } = Auth(context);
      const user = await User.findById(id);
      const file = await uploadFile(image);

      if (!user) {
        throw new UserInputError("You must be logged in");
      }
      // A simple function to upload to Cloudinary
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
              return (user.profilePic = result.url);
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
      await user.save();
      return user;
    },
    async editProfile(_, { bios, displayName, location }, context) {
      const { id } = Auth(context);
      const user = await User.findById(id);

      if (!user) {
        throw new UserInputError("You must be logged in");
      }
      if (bios) {
        user.bios = bios;
      }
      if (displayName.trim() === "") {
        throw new Error("Name must not be Empty");
      } else {
        user.displayName = displayName;
      }
      if (location) {
        user.location = location;
      }

      await user.save();
      return user;
    },

    async followUser(_, { userId }, context) {
      const { username, id } = Auth(context);
      const user = await User.findById(userId);
      const me = await User.findById(id);
      if (user && user.username !== username) {
        if (
          user.followers.find((follower) => follower.username === username) &&
          me.followings.find(
            (following) => following.username === user.username
          )
        ) {
          // user already followed
          user.followers = user.followers.filter(
            (follower) => follower.username !== username
          );
          me.followings = me.followings.filter(
            (following) => following.username !== user.username
          );
        } else {
          // not followed
          user.followers.push({
            username: me.username,
            displayName: me.displayName,
            verified: me.verified,
            profilePic: me.profilePic,
            bios: me.bios,
          });
          me.followings.push({
            username: user.username,
            displayName: user.displayName,
            verified: user.verified,
            profilePic: user.profilePic,
            bios: user.bios,
          });
          user.notifications.push({
            profilePic: me.profilePic,
            action: `${me.displayName} followed you`,
            createdAt: new Date().toISOString(),
          });
        }

        await me.save();

        await user.save();
        return user;
      } else throw new UserInputError("User not found");
    },
  },

  Query: {
    async getUsers() {
      try {
        const users = await User.find();
        return users;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getUser(_, { username }) {
      try {
        const user = await User.findOne({ username });
        if (user) {
          return user;
        } else {
          throw new Error("User not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getNotifications(_, { userId }, context) {
      const { id } = Auth(context);
      if (id === userId) {
        const user = await User.findById(id);
        if (user) {
          return user;
        }
      } else {
        throw new UserInputError("You must be logged in");
      }

      await user.save();
      return user;
    },
  },
};
