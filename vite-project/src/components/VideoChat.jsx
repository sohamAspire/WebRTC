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


    // To Call Video
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
        <div className='py-2'>
            <div className='flex flex-row gap-10'>
                <div>
                    Local
                    <video ref={myVideoRef} autoPlay muted />
                </div>
                <div>
                    Remote  
                    <video ref={userVideoRef} autoPlay />
                </div>
            </div>
            <span>Peer ID - {myPeerId}</span>
            <div className='border border-gray-500/50 sm:w-full md:w-[600px] rounded-md overflow-hidden flex justify-between'>
                <input type="text" value={callId} onChange={(e) => setCallId(e.target.value)} placeholder="Enter ID to call" className='w-full ml-2' />
                <button className='bg-gray-500 text-white hover:opacity-60 transition-none duration-300 px-10 py-2 rounded-lg' onClick={() => callUser(callId)}>Call</button>
            </div>
        </div>
    );
};

export default VideoChat;