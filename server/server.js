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

  socket.on("sendMsg", (msg) => {
    console.log("Received message");
    console.log(msg);
    const userIndex = currentUsers.findIndex(user => user.id === socket.id);
    if (userIndex !== -1 && currentUsers[userIndex].currentRoom) {
      io.in(currentUsers[userIndex].currentRoom).emit("newMessage", { id: currentUsers[userIndex].username, msg: msg });
    } else {
      console.log("User not found or not in a room");
    }
  });


  socket.on("joinedLobby", (data) => {
    console.log(`${socket.id} + ${data}`);
    currentUsers.push({
      id: socket.id,
      username: data,
      available: true,
      currentRoom: null,
      previous: []
    });

    // Check for available chat rooms
    let randos = currentUsers.filter(user => user.id !== socket.id && user.available && !user.previous.includes(socket.id));

    shuffle(randos);

    if (randos.length > 0) {
      // Connect the stranger
      const stranger = randos[0];
      console.log(`${stranger.id} is now paired with ${socket.id}`);

      // Create room
      const roomID = socket.id + '_' + Math.floor(Math.random() * 100000000);
      socket.join(roomID);
      // make stranger join room
      
      // Find the stranger's socket based on the ID
      const strangerSocket = io.sockets.sockets.get(stranger.id);

      // Check if the stranger's socket exists and then make it join the room
      if (strangerSocket) {
        strangerSocket.join(roomID);
      } else {
        console.log('Stranger socket not found');
      }
      //CODE NEEDS TO GO HERE CHATGPT

      io.in(roomID).emit("gotoChat");
    




      // Set current room for both users
      const currentUser = currentUsers.find(user => user.id === socket.id);
      const strangerUser = currentUsers.find(user => user.id === stranger.id);

      currentUser.currentRoom = roomID;
      strangerUser.currentRoom = roomID;

      // Emit events

      // Mark users as busy
      currentUser.available = false;
      strangerUser.available = false;

      currentUser.previous.push(stranger.id);
      strangerUser.previous.push(socket.id);
    } else {
      console.log("No users around");
      socket.emit("waitOnChat");
    }

    console.log(currentUsers);
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
  socket.emit('chatend');
  //erase previous pairing on other user
  const pairing = currentUsers.findIndex(user => user.id === pair)
  currentUsers[pairing].pairing = null;
  currentUsers[pairing].available = true;
  io.to(pair).emit('chatend');
}

function reconnect() {
  let randos = currentUsers.filter(user => user.id !== socket.id && user.available && !user.previous.includes(socket.id));

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
      currentUsers[currentUserIndex].previous.push(stranger.id);
    }

    const strangerIndex = currentUsers.findIndex(user => user.id === stranger.id);
    if (strangerIndex !== -1) {
      currentUsers[strangerIndex].available = false;
      currentUsers[strangerIndex].pairing = socket.id;
      currentUsers[strangerIndex].previous.push(socket.id);
    }

  } else {
    console.log("No users around");
    socket.emit("waitOnChat");
  }

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
