import { SocketContext } from '../socket';
import { useContext, useCallback, useEffect, useState } from 'react';

export default function MessagerComponent({pairingSocket }) {
    const socket = useContext(SocketContext);
    const [messages, setMessages] = useState([{}]);
    const [user, setUser] = useState("");
    const [guest, setGuest] = useState("");
    var InRoom = false;

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
        if(InRoom = false){
            console.log(data);
            setUser(data.user);
            setGuest(data.guest)
            document.getElementById("discon_button").disabled = false;
            InRoom = true;
        }
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
                <button onClick={onSendMsg}>Press to send</button>
                <br/>
                <button id = "discon_button"onClick={Disconnect}>Disconnect</button>
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
