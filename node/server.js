// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const { ExpressPeerServer } = require('peer');
// const cors = require('cors');
// const fs = require('fs');
// const path = require('path');
// const upload = require('./multer')


// const app = express();

// app.use(cors({
//     origin: '*',
// }))

// const server = http.createServer(app);
// const io = new Server (server , {
//     cors :{
//         origin: '*',
//         methods: ['GET', 'POST']
//     }
// });

// const peerServer = ExpressPeerServer(server, { debug: true , });

// app.use('/peerjs', peerServer);

// app.get('/', (req, res) => {
//     res.status(200).send('Server is Up!');
// });

// app.post('/stream', upload.single('videoChunks'), (req, res) => {    
//     const videoChunk = req.file;

//     if (!videoChunk) {
//         return res.status(400).json({ message: 'No video chunk received' });
//     }

//     const publicPath = path.join(__dirname, 'public', 'videos');
    
//     if (!fs.existsSync(publicPath)) {
//         fs.mkdirSync(publicPath, { recursive: true });
//     }

//     const videoFilePath = path.join(publicPath, 'video_recording.webm');

//     fs.appendFile(videoFilePath, videoChunk.buffer, (err) => {
//         if (err) {
//             return res.status(500).json({ message: 'Error saving video chunk' });
//         }

//         res.json({ message: 'Chunk saved successfully' });
//     });
// });

// io.on('connection', (socket) => {
//     console.log('User connected:', socket.id);
    
//     socket.on('disconnect', () => {
//         console.log('User disconnected:', socket.id);
//     });
// });

// server.listen(3001, () => {
//     console.log('Server is running on http://localhost:3001');
// });

const express = require('express');
const http = require('http');
const cors = require('cors')
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server ,{
    cors: {
      origin : '*',
      credentials: true,
    }
  });

app.use(cors({
    origin : '*',
    credentials : true
}))

let rooms = {}; 

app.use(express.static('public'));

app.get('/create-room', (req, res) => {
  const roomId = uuidv4();
  rooms[roomId] = { users: [] };
  console.log(roomId);
  
  res.status(200).send({ roomId });
});

app.get('/join-room/:roomId', (req, res) => {
  const { roomId } = req.params;
  console.log(roomId);
  
  if (rooms[roomId]) {
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: 'Room not found!' });
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    rooms[roomId].users.push(socket.id);
    console.log(`User ${socket.id} joined room ${roomId}`);
    
    socket.to(roomId).emit('user-connected', socket.id);
    
    socket.on('disconnect', () => {
      const room = rooms[roomId];
      if (room) {
        room.users = room.users.filter(user => user !== socket.id);
        socket.to(roomId).emit('user-disconnected', socket.id);
      }
    });
  });

  socket.on('offer', (offer, roomId) => {
    socket.to(roomId).emit('offer', offer);
  });

  socket.on('answer', (answer, roomId) => {
    socket.to(roomId).emit('answer', answer);
  });

  socket.on('ice-candidate', (candidate, roomId) => {
    socket.to(roomId).emit('ice-candidate', candidate);
  });
});

server.listen(5000, () => {
  console.log('Server is running on port 5000');
});
