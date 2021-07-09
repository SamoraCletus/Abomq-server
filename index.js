const { ApolloServer, PubSub } = require("apollo-server-express");
const mongoose = require("mongoose");
const typeDefs = require("./graphQl/typeDefs");
const cors = require("cors");
const { MONGODB } = require("./config");
const express = require("express");

const pubsub = new PubSub();
const PORT = process.env.port || 5000;
const resolvers = require("./graphQl/resolvers");
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubsub }),
});
const app = express();
server.applyMiddleware({ app });
app.use(express.static("./uploads"));
app.use(cors());
let database = mongoose.connect(MONGODB, { useNewUrlParser: true }).then(() => {
  console.log("DataBase Connected");
  return app.listen({ port: PORT }, () => {
    console.log(`Server Running at port http://localhost:5000`);
  });
});
database.catch(function (err) {
  console.log("Cannot Connect to Database");
  console.log(err);
});
