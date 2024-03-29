const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  }
});

const currentUsers = [];

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("sendMsg", (data) => {
    console.log("Received message");
    console.log(data);
    io.to(socket.id).emit("newMessage", data);
    const user = currentUsers.findIndex(user => user.id === socket.id);
    io.to(currentUsers[user].pairing).emit("newMessage", data);
  });

  socket.on("joinedLobby", (data) => {
    console.log(`${socket.id} + ${data}`);
    currentUsers.push({
      id: socket.id,
      username: data,
      available: true,
      pairing: null,
      previous: null
    });

    console.log(currentUsers);

    //check for available chat rooms
    let randos = currentUsers.filter(user => user.id !== socket.id && user.available);

    shuffle(randos);

    if (randos.length > 0) {
      // Connect the stranger
      const stranger = randos[0];
      console.log(`${stranger.id} is now paired with ${socket.id}`);
      socket.emit("gotoChat", stranger.id);
      io.to(stranger.id).emit("gotoChat", socket.id);
      //declare them busy
      const currentUserIndex = currentUsers.findIndex(user => user.id === socket.id);
      if (currentUserIndex !== -1) {
        currentUsers[currentUserIndex].available = false;
        currentUsers[currentUserIndex].pairing = stranger.id;
      }

      const strangerIndex = currentUsers.findIndex(user => user.id === stranger.id);
      if (strangerIndex !== -1) {
        currentUsers[strangerIndex].available = false;
        currentUsers[strangerIndex].pairing = socket.id;
      }

    } else {
      console.log("No users around");
      socket.emit("waitOnChat");
    }

  });


  socket.on('leaveRoom', () => {
    //erase previous pairing on user
    disconnectFromRando(socket)
  })

  socket.on("disconnect", (reason) => {
    //disconnectFromRando(socket)
    console.log(`${socket.id} has disconnected`);
    const index = currentUsers.findIndex(user => user.id === socket.id);
    if (index !== -1) {
      currentUsers.splice(index, 1);
    }
  });
});


function disconnectFromRando(socket) {
  const user = currentUsers.findIndex(user => user.id === socket.id);
  const pair = currentUsers[user].pairing;
  currentUsers[user].pairing = null;
  currentUsers[user].available = true;
  socket.emit('waitOnChat');
  //erase previous pairing on other user
  const pairing = currentUsers.findIndex(user => user.id === pair)
  currentUsers[pairing].pairing = null;
  currentUsers[pairing].available = true;
  io.to(pair).emit('waitOnChat');
}

function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
}

server.listen(3001, () => {
  console.log("Server is now running");
});
