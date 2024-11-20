const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: '*',
}))

const server = http.createServer(app);
const io = new Server (server , {
    cors :{
        origin: '*',
        methods: ['GET', 'POST']
    }
});
const peerServer = ExpressPeerServer(server, { debug: true });

app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
    // res.redirect('http://localhost:5173');
    res.status(200).send('Hi Chodu!');
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});