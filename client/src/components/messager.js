import { SocketContext } from '../socket';
import { useContext, useCallback, useEffect, useState } from 'react';

export default function MessagerComponent({returnToLobby}) {
    const socket = useContext(SocketContext);
    const [messages, setMessages] = useState([{}]);
    const [header, setHeader] = useState("");
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
            setHeader(`Waiting for new player to join`);
            
        return () => {
            socket.off('userHasLeft');
        };
        })
    }, [socket])

    useEffect(() => {socket.on("userJoined", (data) => {
            console.log(data);
            document.getElementById("discon_button").disabled = false;
            setHeader(`Current User: ${data.user} -|- Talking to ${data.guest}`);
        })
    }, [socket])

    useEffect(() => {
        // Update the document title using the browser API
        document.getElementById("currentStatus").innerText = header;
    });

    const onSendMsg = () => {
        const msg = document.getElementById("field").value;
        socket.emit('sendMsg', msg);
        document.getElementById("field").value= '';
    };

    function Disconnect(){
        socket.emit('leaveRoom');
        setMessages(prevMessages => [...prevMessages, {id: '', msg: "Disconnected from room"}]);
        document.getElementById("discon_button").disabled = true;
        setHeader(`Waiting for new player to join`);
    }

    return (
        <div class="container">
            <div class="MainMessager">
                <div id="currentStatus">{header}</div>
                
            </div>
            <div id="feed">
                    {messages.map((msg, index) => (
                        <Message key={index} message={msg} />
                    ))}
            </div>
            <div class='Messager_Bottom'>
                <input type="text" id="field" />
                <button onClick={onSendMsg}>&gt;</button>
                <br />
                <button id="discon_button" onClick={Disconnect}>Disconnect</button>
                <button id="returnToLobby_button" onClick={() => returnToLobby()}>Return To Lobby</button>
            </div>
        </div>


    );
}

function Message({ message }) {
    return (
        <div className='message'>
            <p className='sender'>{message.id}</p>
            <p className='message_text'>{message.msg}</p>
        </div>
    );
}
