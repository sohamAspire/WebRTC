/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import io from 'socket.io-client';

const VideoChat = () => {
    const [myPeerId, setMyPeerId] = useState('');
    const [callId, setCallId] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const myVideoRef = useRef();
    const userVideoRef = useRef();
    const socketRef = useRef();
    const peerRef = useRef();
    const mediaRecorderRef = useRef(null);

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
                console.log(userStream);
                userVideoRef.current.srcObject = userStream;
            });
        }).catch(err => console.log(err));
    }

      // Start Recording
      const startRecording = () => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            myVideoRef.current.srcObject = stream;

            mediaRecorderRef.current = new MediaRecorder(stream);
            
            const chunkAccumulator = [];  // Array to hold chunks temporarily
    
            mediaRecorderRef.current.ondataavailable = (event) => {
                chunkAccumulator.push(event.data);
            };
    
            mediaRecorderRef.current.onstop = () => {
                setIsRecording(false);
                console.log('Recording stopped');
            };
    
            mediaRecorderRef.current.start(1000); // Start recording in chunks of 1 second
    
            setIsRecording(true);
    
            const sendChunksPeriodically = () => {
                if (chunkAccumulator.length > 0) {
                    const formData = new FormData();
                    formData.append('videoChunks', new Blob(chunkAccumulator, { type: 'video/webm' }), 'video_chunk.webm');
    
                    fetch('http://localhost:3001/stream', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Chunks sent to server:', data);
                    })
                    .catch(err => {
                        console.error('Error sending chunks:', err);
                    });
    
                    chunkAccumulator.length = 0; 
                }
    
                setTimeout(sendChunksPeriodically, 3000);
            };
    
            sendChunksPeriodically();
    
        }).catch(err => console.log(err));
    };

    // Stop Recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const stopCamera = () => {
        const stream = myVideoRef.current.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
            });
            myVideoRef.current.srcObject = null;
        }
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
            <span className='block py-4 text-red-600'>Peer ID - {myPeerId}</span>
            <div className='border border-gray-500/50 sm:w-full md:w-[600px] rounded-lg overflow-hidden flex justify-between'>
                <input type="text" value={callId} onChange={(e) => setCallId(e.target.value)} placeholder="Enter ID to call" className='w-full ml-2 focus:outline-none' />
                <button className='bg-gray-500 text-white hover:opacity-60 transition-none duration-300 px-10 py-2 rounded-lg' onClick={() => callUser(callId)}>Call</button>
            </div>
            <div className='py-4 flex gap-2'>
                <button
                    className={`bg-gray-600 text-white hover:opacity-60 transition-none duration-300 px-10 py-2 rounded-lg`}
                    onClick={isRecording ? stopRecording : startRecording}
                >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
                <button className={`bg-gray-600 text-white hover:opacity-60 transition-none duration-300 px-10 py-2 rounded-lg`} onClick={() => stopCamera()}>
                    Close Camera
                </button>
            </div>
        </div>
    );
};

export default VideoChat;