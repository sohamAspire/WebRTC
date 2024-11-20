const express = require('express');
const { ExpressPeerServer } = require('peer');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); // Import UUID

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins (or restrict it to specific ones if needed)
  methods: ['GET', 'POST'],
}));

// Route to generate a new room ID
app.get('/generate-room', (req, res) => {
  const roomId = uuidv4(); // Generate a unique room ID
  res.json({ roomId });
});

// Serve static files if needed (optional)
app.get('/', (req, res) => {
  res.send('Welcome to the Interview App Backend');
});

// Start Express server
const PORT = 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Integrate ExpressPeerServer
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/peerjs', // Customize path if needed
});

// Attach the PeerJS server to your main Express app
app.use('/peerjs', peerServer);

// Socket.IO
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-room', (roomId, userId) => {
    console.log(`User ${userId} joined room ${roomId}`);
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
      socket.to(roomId).emit('user-disconnected', userId);
    });
  });
});
