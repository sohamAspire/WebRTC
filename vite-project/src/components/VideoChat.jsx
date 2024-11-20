/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import io from 'socket.io-client';

const VideoChat = () => {
    const [myPeerId, setMyPeerId] = useState('');
    const [callId, setCallId] = useState('');
    const myVideoRef = useRef();
    const userVideoRef = useRef();
    const socketRef = useRef();
    const peerRef = useRef();

    useEffect(() => {
        socketRef.current = io.connect('http://localhost:3001');
        peerRef.current = new Peer(undefined, {
            path: '/peerjs',
            host: 'localhost',
            port: '3001'
        });

        peerRef.current.on('open', id => {
            setMyPeerId(id);
        });

        peerRef.current.on('call', call => {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
                call.answer(stream);
                call.on('stream', userStream => {
                    userVideoRef.current.srcObject = userStream;
                });
            });
        });
    }, []);

    const callUser = (id) => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            myVideoRef.current.srcObject = stream;
            const call = peerRef.current.call(id, stream);
            call.on('stream', userStream => {
                userVideoRef.current.srcObject = userStream;
            });
        });
    };

    return (
        <div>
            <video ref={myVideoRef} autoPlay muted />
            <video ref={userVideoRef} autoPlay />
            <input type="text" value={callId} onChange={(e) => setCallId(e.target.value)} placeholder="Enter ID to call" />
            <button onClick={() => callUser(callId)}>Call</button>
        </div>
    );
};

export default VideoChat;