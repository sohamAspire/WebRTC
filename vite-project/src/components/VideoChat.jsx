import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid'; // For generating unique file IDs

const VideoChat = () => {
    const [myPeerId, setMyPeerId] = useState('');
    const [callId, setCallId] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [fileId, setFileId] = useState(''); // Unique file ID for the recording
    const [uploadStatus, setUploadStatus] = useState(''); // Status message for uploads

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
            port: '3001',
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

    // Call User
    const callUser = (id) => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            myVideoRef.current.srcObject = stream;
            const call = peerRef.current.call(id, stream);
            call.on('stream', userStream => {
                userVideoRef.current.srcObject = userStream;
            });
        }).catch(err => console.log(err));
    };

    // Start Recording
    const startRecording = () => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            myVideoRef.current.srcObject = stream;

            const newFileId = uuidv4(); // Generate unique file ID
            setFileId(newFileId);

            const totalChunks = []; // Hold all chunks locally
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (event) => {
                totalChunks.push(event.data);

                // Send chunk to server
                const formData = new FormData();
                formData.append('videoChunks', event.data, `chunk_${Date.now()}.webm`);
                formData.append('chunkIndex', totalChunks.length - 1); // Current chunk index
                formData.append('totalChunks', 10); // Placeholder; will update on stop
                formData.append('fileId', newFileId);

                fetch('http://localhost:3001/stream', {
                    method: 'POST',
                    body: formData,
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Chunk uploaded:', data);
                        setUploadStatus('Uploading...');
                    })
                    .catch(err => console.error('Error uploading chunk:', err));
            };

            mediaRecorderRef.current.onstop = () => {
                // Update totalChunks in the last request
                setIsRecording(false);
                const finalFormData = new FormData();
                finalFormData.append('chunkIndex', totalChunks.length - 1);
                finalFormData.append('totalChunks', totalChunks.length); // Final total chunks
                finalFormData.append('fileId', newFileId);

                fetch('http://localhost:3001/stream', {
                    method: 'POST',
                    body: finalFormData,
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Final chunk uploaded:', data);
                        setUploadStatus('Upload complete!');
                    })
                    .catch(err => console.error('Error completing upload:', err));
            };

            mediaRecorderRef.current.start(1000); // Record in 1-second chunks
            setIsRecording(true);
        }).catch(err => console.log(err));
    };

    // Stop Recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    const stopCamera = () => {
        const stream = myVideoRef.current.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
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
                <input
                    type="text"
                    value={callId}
                    onChange={(e) => setCallId(e.target.value)}
                    placeholder="Enter ID to call"
                    className='w-full ml-2 focus:outline-none'
                />
                <button
                    className='bg-gray-500 text-white hover:opacity-60 transition-none duration-300 px-10 py-2 rounded-lg'
                    onClick={() => callUser(callId)}
                >
                    Call
                </button>
            </div>
            <div className='py-4 flex gap-2'>
                <button
                    className={`bg-gray-600 text-white hover:opacity-60 transition-none duration-300 px-10 py-2 rounded-lg`}
                    onClick={isRecording ? stopRecording : startRecording}
                >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
                <button
                    className={`bg-gray-600 text-white hover:opacity-60 transition-none duration-300 px-10 py-2 rounded-lg`}
                    onClick={() => stopCamera()}
                >
                    Close Camera
                </button>
            </div>
            {uploadStatus && <p className="text-green-600">{uploadStatus}</p>}
        </div>
    );
};

export default VideoChat;
