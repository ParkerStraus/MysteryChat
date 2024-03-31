import { SocketContext } from '../socket';
import { useContext, useCallback, useEffect, useState } from 'react';

export default function Login({ sendUsername }) {
    const socket = useContext(SocketContext);
    
    function declareName(){
        const username = document.getElementById("field").value;
        console.log(username);
        sendUsername(username);
        return;
    }

    return (
        <>
            <h1>What's your name?</h1>
            <input type='text' id='field'></input>
            <br/>
            <button onClick={declareName}>Login</button>
        </>
    );
}