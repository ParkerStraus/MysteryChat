import React, { useState, useEffect } from "react";
import "./App.css";
import Router from "./components/router";
import { SocketContext, socket } from './socket';
import MessagerComponent from './components/messager';
import Login from "./components/login";

function App() {
  const userID = Math.round(Math.random() * 9999999);
  const [username, setUsername] = useState('');
  const [currentPairing, setCurrentPairing] = useState('');

  
  const [currentSetting, setCurrentSetting] = useState('login');

  const declareName = function (user) {
    console.log(`Sent username: ${user}`);
    if (user) {
      setUsername(user); // Use user directly here
      console.log(`Now declared username as ${user}`); // Changed username to user
      // Connect to server
      socket.emit("joinedLobby", user); // Use user directly here
    } else {
      console.log(`No username`);
    }
  };

  socket.on("waitOnChat", () => {
    console.log("Please wait partner");
    setCurrentSetting('idle');
  })
  
  socket.on("gotoChat", (pairing) => {
    console.log("Hiya partner");
    setCurrentSetting('chat');
  })

  function returnToLobby(){
    socket.emit('leavelobby');
    setCurrentSetting('login');

  }


  return (
    <SocketContext.Provider value={socket}>
      <Router currentSetting = {currentSetting} declareUsername={declareName} returnToLobby = {returnToLobby}/>
    </SocketContext.Provider>
  );
}
export default App;

//<MessagerContainer id = {userID}></MessagerContainer>
