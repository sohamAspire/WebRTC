import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const VideoConferenceApp = () => {
  const [roomId, setRoomId] = useState('');
  const [roomCreated, setRoomCreated] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [peerConnection, setPeerConnection] = useState(null);

  const createRoom = async () => {
    const response = await fetch('http://localhost:5000/create-room');
    const data = await response.json();
    setRoomId(data.roomId);
    setRoomCreated(true);
    joinRoom(data.roomId); 
  };

  const joinRoom = async (roomIdToJoin) => {
    const roomToJoin = typeof roomIdToJoin === 'string' ? roomIdToJoin : roomId;
    const response = await fetch(`http://localhost:5000/join-room/${roomToJoin}`);
    const data = await response.json();
    if (data.success) {
      setIsJoined(true);
      setRoomId(roomToJoin);
      socket.emit('join-room', roomToJoin);
      startWebRTC();
    } else {
      alert('Room not found!');
    }
  };

  const startWebRTC = async () => {
    const peer = new RTCPeerConnection();
    setPeerConnection(peer);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    
    document.getElementById('localVideo').srcObject = stream;

    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', event.candidate, roomId);
      }
    };

    peer.ontrack = (event) => {
      document.getElementById('remoteVideo').srcObject = event.streams[0];
    };
  };

  useEffect(() => {
    socket.on('user-connected', (userId) => {
      console.log('User connected:', userId);
      createOffer();
    });

    socket.on('offer', async (offer) => {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      createAnswer();
    });

    socket.on('answer', async (answer) => {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('ice-candidate', async (candidate) => {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => {
      socket.off('user-connected');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
    };
  }, [peerConnection]);

  const createOffer = async () => {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer', offer, roomId);
  };

  const createAnswer = async () => {
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', answer, roomId);
  };

  return (
    <div className='container px-10 py-10'>
      {!roomCreated && !isJoined && (
        <div className='flex flex-col gap-4'>
          <button onClick={createRoom} className='text-start'>Create Room</button>
          <div>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter Room ID"
            />
            <button onClick={joinRoom}>Join Room</button>
          </div>
        </div>
      )}

      {isJoined && (
        <div>
          <video id="localVideo" autoPlay muted></video>
          <video id="remoteVideo" autoPlay></video>
        </div>
      )}
    </div>
  );
};

export default VideoConferenceApp;
