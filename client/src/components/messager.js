import { SocketContext } from '../socket';
import { useContext, useCallback, useEffect, useState } from 'react';

export default function MessagerComponent({returnToLobby}) {
    const socket = useContext(SocketContext);
    const [messages, setMessages] = useState([{}]);
    const [user, setUser] = useState("");
    const [guest, setGuest] = useState("");
    var InRoom = false;
    console.log("Return to lobby function:", returnToLobby);

    useEffect(() => {socket.on("newMessage", (data) => {
            console.log(data);
            setMessages(prevMessages => [...prevMessages, data]);
        });

        // Clean up function
        return () => {
            socket.off("newMessage");
        };

    }, [socket]);

    useEffect(() => {socket.on('userHasLeft', () => {
            setMessages(prevMessages => [...prevMessages, {id: '', msg: "User has fled"}]);
            document.getElementById("discon_button").disabled = true;
            console.log("The other user has disconnected");
            
        return () => {
            socket.off('userHasLeft');
        };
        })
    }, [socket])

    useEffect(() => {socket.on("userJoined", (data) => {
            console.log(data);
            setUser(data.user);
            setGuest(data.guest)
            document.getElementById("discon_button").disabled = false;
        })
    }, [socket])

    const onSendMsg = () => {
        const msg = document.getElementById("field").value;
        socket.emit('sendMsg', msg);
        document.getElementById("field").value= '';
    };

    function Disconnect(){
        socket.emit('leaveRoom');
        setMessages(prevMessages => [...prevMessages, {id: '', msg: "Disconnected from room"}]);
        document.getElementById("discon_button").disabled = true;
    }

    return (
        <>
        <h1 id = "currentStatus">Current User: {user} -|- Talking to {guest}</h1>
            <div id="feed">
                {messages.map((msg, index) => (
                    <Message key={index} message={msg} />
                ))}
            </div>
            <div>
                <input type="text" id="field" />
                <button onClick={onSendMsg}>&gt;</button>
                <br/>
                <button id = "discon_button"onClick={Disconnect}>Disconnect</button>
                <button id = "returnToLobby_button"onClick={() => returnToLobby()}>Return To Lobby</button>
            </div>
        </>
    );
}

function Message({ message }) {
    return (
        <div>
            <p>{message.id}</p>
            <p>{message.msg}</p>
        </div>
    );
}
