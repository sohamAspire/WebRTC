const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const upload = require('./multer')


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

const peerServer = ExpressPeerServer(server, { debug: true , });

app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
    res.status(200).send('Server is Up!');
});

app.post('/stream', upload.single('videoChunks'), (req, res) => {    
    const videoChunk = req.file;

    if (!videoChunk) {
        return res.status(400).json({ message: 'No video chunk received' });
    }

    const publicPath = path.join(__dirname, 'public', 'videos');
    
    if (!fs.existsSync(publicPath)) {
        fs.mkdirSync(publicPath, { recursive: true });
    }

    const videoFilePath = path.join(publicPath, 'video_recording.webm');

    fs.appendFile(videoFilePath, videoChunk.buffer, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error saving video chunk' });
        }

        res.json({ message: 'Chunk saved successfully' });
    });
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