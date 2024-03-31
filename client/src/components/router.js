import io from 'socket.io-client';
import {SocketContext} from '../socket';
import { useContext, useCallback, useEffect } from 'react';
import Login from './login';
import MessagerComponent from './messager';
import Idle from './idle';

export default function Router({currentSetting, declareUsername, returnToLobby}){
    const socket = useContext(SocketContext);
    console.log("Return to lobby function:", returnToLobby);

    useEffect(() => {
    })

    switch(currentSetting) {
        case 'login':
            return <Login sendUsername = {declareUsername} />
        case 'chat':
            return <MessagerComponent returnToLobby={() => returnToLobby()}/>
        case 'idle':
            return <Idle/>
    }
}