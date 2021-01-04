const { ApolloServer, PubSub } = require("apollo-server");
const gql = require("graphql-tag");
const mongoose = require("mongoose");

const { MONGODB_CONNECTION_STRING } = require("./config");
const resolvers = require("./graphql/resolvers");
const typeDefs = require("./graphql/typeDefs");

const pubsub = new PubSub();

const PORT = process.env.PORT || 5000;

const server = new ApolloServer({
  cors: {
    credentials: true,
    origin: (origin, callback) => {
      const whitelist = [
        "https://merng-social-networking.netlify.app/",
        "http://dev.mylocalsite.com:3000/",
      ];

      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  },
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubsub }),
});

mongoose.set("useUnifiedTopology", true);
mongoose
  .connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true })
  .then(() => {
    console.log("MongoDB Connected");
    return server.listen({ port: PORT });
  })
  .then((res) => {
    console.log(`Server running at ${res.url}`);
  })
  .catch((err) => {
    console.error(err);
  });
