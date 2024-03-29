const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const http = require("http");
const server = require("./services/apolloserver");

const PORT = process.env.PORT || 4000;

const app = express();

if (process.env.NODE_ENV !== "development") {
  app.use(express.static("./../client/build"));
  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "./../client/build/index.html"));
  });
}

server.applyMiddleware({ app });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

mongoose.set("useFindAndModify", false);

// Use local or cloud DB.
const MONGODB_URI = `mongodb+srv://fs:fs@cluster0-tjvic.mongodb.net/AppMashup?retryWrites=true`;

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => console.log("connected to MongoDB"))
  .catch(error => console.log(error.message));

/*server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server running at ${url}`);
  console.log(`Subscriptions active at ${subscriptionsUrl}`);
});*/

httpServer.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  console.log(
    `Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`
  );
});
