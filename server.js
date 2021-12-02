const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const PORT = process.env.PORT || 8000;
const { ExpressPeerServer } = require("peer");

http.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

const peerServer = ExpressPeerServer(http, {
  proxied: true,
  debug: true,
  path: "/myapp",
  ssl: {},
});

app.use(peerServer);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.use(express.static("public"));

io.on("connection", function (socket) {
  console.log("client is connected " + socket.id);

  socket.on("userMessage", (data) => {
    io.sockets.emit("userMessage", data);
  });
  socket.on("userTyping", (data) => {
    socket.broadcast.emit("userTyping", data);
  });
});
