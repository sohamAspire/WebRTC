/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { io } from 'socket.io-client';

const VideoCall = () => {
    const [roomId, setRoomId] = useState('');
    const [peerId, setPeerId] = useState('');
    const [otherPeerId, setOtherPeerId] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerInstance = useRef(null);

    useEffect(() => {
        const socket = io('ws://localhost:3000');
        const peer = new Peer(undefined, {
            host: 'localhost',
            port: 3000,
            path: '/peerjs',
            secure : false,
            debug : 3
        });

        peerInstance.current = peer;

        console.log(peer);

        peer.on('open', (id) => {
            setPeerId(id);
            console.log('My peer ID is:', id);
        });

        peer.on('error', (err) => {
          console.log('PeerJS Error:', err);
        });

        peer.on('call', (call) => {
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    call.answer(stream);
                    call.on('stream', (remoteStream) => {
                        remoteVideoRef.current.srcObject = remoteStream;
                    });
                });
        });

        socket.on('user-connected', (id) => {
            console.log('User connected:', id);
            setOtherPeerId(id);
        });

        socket.on('user-disconnected', (id) => {
            console.log('User disconnected:', id);
            setOtherPeerId('');
            setIsConnected(false);
        });
    }, []);

    const handleStartCamera = () => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                localVideoRef.current.srcObject = stream;
            });
    };

    const handleStopCamera = () => {
        const stream = localVideoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
        localVideoRef.current.srcObject = null;
    };

    const handleConnect = () => {
        const socket = io('ws://localhost:5000');
        console.log(otherPeerId);
        
        socket.emit('join-room', roomId, '6f179c16-c012-446b-8d6f-af27cb81218b');

        console.log(peerInstance.current.call(otherPeerId, localVideoRef.current.srcObject));
        
        const call = peerInstance.current.call(otherPeerId, localVideoRef.current.srcObject);
        call.on('stream', (remoteStream) => {
            remoteVideoRef.current.srcObject = remoteStream;
            setIsConnected(true);
        });
    };

    const handleCreateRoom = async () => {
        try {
            const response = await fetch('http://localhost:5000/generate-room');
            const data = await response.json();
            setRoomId(data.roomId);
            console.log('Room created:', data.roomId);
        } catch (error) {
            console.error('Error creating room:', error);
        }
    };

    return (
        <div className='py-10'>
            <h1>Interview App</h1>
            <div className='flex flex-row pb-4'>
                <video ref={localVideoRef} autoPlay muted style={{ width: '300px' }} />
                <video ref={remoteVideoRef} autoPlay style={{ width: '300px' }} />
            </div>
            <div className='flex gap-2 flex-col lg:w-[30%]'>
                <div className='border border-black flex justify-between rounded-lg overflow-hidden'>
                    <input
                        type="text"
                        placeholder="Room ID"
                        value={roomId}
                        className='pl-4'
                        onChange={(e) => setRoomId(e.target.value)}
                    />
                    <button
                        className='border p-2 rounded-lg hover:cursor-pointer bg-gray-500 text-[14px] text-white'
                        onClick={handleConnect}
                        // disabled={!roomId || !peerId}
                    >
                        Connect
                    </button>
                </div>

                <div className='flex gap-4'>
                    <button
                        className='border p-2 rounded-lg border-green-500 bg-green-500 text-[14px]'
                        onClick={handleCreateRoom}
                    >
                        Create Room
                    </button>
                    <button
                        className='border p-2 rounded-lg border-green-500 bg-green-500 text-[14px]'
                        onClick={handleStartCamera}
                    >
                        Start Camera
                    </button>
                    <button
                        className='border p-2 rounded-lg border-red-500 bg-red-500 text-[14px]'
                        onClick={handleStopCamera}
                    >
                        Stop Camera
                    </button>
                </div>
            </div>
            <p className='pt-4'>
                {isConnected
                    ? 'Connected to Room'
                    : `Not Connected${roomId ? ` to Room ${roomId}` : ''}`}
            </p>
        </div>
    );
};

export default VideoCall;
