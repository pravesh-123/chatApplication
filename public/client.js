const socket = io();

const message = document.getElementById("message"),
  handle = document.getElementById("handle"),
  output = document.getElementById("output"),
  typing = document.getElementById("typing"),
  button = document.getElementById("button");

// send typing message
message.addEventListener("keypress", (e) => {
  socket.emit("userTyping", handle.value);
});

// send messages to clients
button.addEventListener("click", (e) => {
  e.preventDefault();
  socket.emit("userMessage", {
    handle: handle.value,
    message: message.value,
  });
  document.getElementById("message").value = "";
});

// listen for events from server
socket.on("userMessage", (data) => {
  typing.innerHTML = "";
  output.innerHTML +=
    "<p> <strong>" + data.handle + ": </strong>" + data.message + "</p>";
});

socket.on("userTyping", (data) => {
  typing.innerHTML = "<p><em>" + data + " is typing... </em></p>";
});

// video chat

function getLVideo(callbacks) {
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;
  var constraints = {
    audio: true,
    video: true,
  };
  navigator.getUserMedia(constraints, callbacks.success, callbacks.error);
}

function recStream(stream, elemid) {
  var video = document.getElementById(elemid);
  video.srcObject = stream;

  window.peer_stream = stream;
}

getLVideo({
  success: function (stream) {
    window.localstream = stream;
    recStream(stream, "lVideo");
  },
  error: function (err) {
    alert("Cannot access your camera");
    console.log(err);
  },
});

var conn;
var peer_id;

var peer = new Peer();

peer.on("open", function () {
  document.getElementById("displayId").innerHTML = peer.id;
});

peer.on("connection", function (connection) {
  conn = connection;
  peer_id = connection.peer;

  document.getElementById("connId").value = peer_id;
});

peer.on("error", function (err) {
  alert("an error has happened:" + err);
  console.log(err);
});

document.getElementById("conn_button").addEventListener("click", function () {
  peer_id = document.getElementById("connId").value;

  if (peer_id) {
    conn = peer.connect(peer_id);
  } else {
    alert("enter an id");
    return false;
  }
});

peer.on("call", function (call) {
  var acceptCall = confirm("do you want to answer thhis call?");

  if (acceptCall) {
    call.answer(window.localstream);
    call.on("stream", function (stream) {
      window.peer_stream = stream;
      recStream(stream, "rVideo");
    });
    call.on("close", function () {
      alert("The call has ended");
    });
  } else {
    console.log("call denied");
  }
});

document.getElementById("call_button").addEventListener("click", function () {
  console.log("calling a peer:" + peer_id);
  console.log(peer);

  var call = peer.call(peer_id, window.localstream);
  call.on("stream", function (stream) {
    window.peer_stream = stream;
    recStream(stream, "rVideo");
  });
});
