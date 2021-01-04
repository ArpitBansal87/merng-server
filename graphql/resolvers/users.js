const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Trakt = require("trakt.tv");
const { UserInputError } = require("apollo-server");

const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../utils/validations");
const { SECRET_KEY } = require("../../config");
const User = require("../../models/User");

let options = {
  client_id: process.env.TRAKT_CLIENT_ID,
  client_secret: process.env.TRAKT_CLIENT_SECRET,
  redirect_uri: process.env.TRAKT_REDIRECT_URL,
  api_url: process.env.TRAKT_API_URL,
  useragent: process.env.TRAKT_USERAGENT,
  pagination: process.env.TRAKT_PAGINATION,
};

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
}

module.exports = {
  Query: {
    async traktLogin() {
      const trakt = new Trakt(options);

      const traktAuthUrl = trakt.get_url();

      return {
        url: traktAuthUrl,
      };
    },
  },
  Mutation: {
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const user = await User.findOne({ username });

      if (!user) {
        errors.general = "User Not found";
        throw new UserInputError("User not found", { errors });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = "Wrong Credetnials";
        throw new UserInputError("Wrong Credetnials", { errors });
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
    async register(
      parent,
      { registerInput: { username, email, password, confirmPassword } },
      context,
      info
    ) {
      // Validate user data
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      // TODO: Make sure user doenst already exist
      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError("User name is taken", {
          errors: {
            username: "This user name is taken",
          },
        });
      }

      // hash password and create an auth token
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        username,
        password,
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
  },
};
