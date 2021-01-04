const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  MONGODB_CONNECTION_STRING:
    "mongodb+srv://admin2:Rooney007@maincluster.dpdlr.mongodb.net/merng",
  SECRET_KEY: "some very secret key",
  TRAKT_CLIENT_ID: process.env.TRAKT_CLIENT_ID,
  TRAKT_CLIENT_SECRET: process.env.TRAKT_CLIENT_SECRET,
  TRAKT_REDIRECT_URL: process.env.TRAKT_REDIRECT_URL,
  TRAKT_API_URL: process.env.TRAKT_API_URL,
  TRAKT_USERAGENT: process.env.TRAKT_USERAGENT,
  TRAKT_PAGINATION: process.env.TRAKT_PAGINATION,
  PORT: process.env.PORT
};
