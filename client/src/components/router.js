import io from 'socket.io-client';
import {SocketContext} from '../socket';
import { useContext, useCallback, useEffect } from 'react';
import Login from './login';
import MessagerComponent from './messager';
import Idle from './idle';

export default function Router({currentSetting, declareName}){
    const socket = useContext(SocketContext);

    useEffect(() => {
    })

    switch(currentSetting) {
        case 'login':
            return <Login sendUsername={declareName}/>
        case 'chat':
            return <MessagerComponent/>
        case 'idle':
            return <Idle/>
    }
}