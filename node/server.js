require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const http = require('http');
// const { Server } = require('socket.io');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');
// const upload = require('./multer')
// const AWS = require('aws-sdk');
// const mergeChunks = require('./mergeChunks');

const app = express();

app.use(cors({
    origin: 'https://frontend-phi-nine-80.vercel.app',
    credentials: true
}))

// Middleware for parsing cookies
app.use(cookieParser());

// Session management
app.use(
    session({
        secret: 'secret', // Replace with a strong secret
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: true, // Ensure HTTPS in production
            sameSite: 'none', // Cross-site cookies
        },
    })
);

const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: '*',
//         methods: ['GET', 'POST'],
//         credentials: true
//     }
// });

const peerServer = ExpressPeerServer(server, { debug: true, });

app.use('/peerjs', peerServer);

// AWS.config.update({
//     region: process.env.AWS_REGION,
//     accessKeyId: process.env.AWS_ACCESS_ID,
//     secretAccessKey: process.env.AWS_ACCESS_SECRET
// });

// const s3 = new AWS.S3();
// const BUCKET_NAME = 'rock-bucket';


app.get('/', (req, res) => {
    res.status(200).send('Server is Up!');
});

app.get('/cookies', (req, res) => {
    res.cookie('accessToken', 'true', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        domain : '.vercel.app'
    })
    res.redirect('https://frontend-phi-nine-80.vercel.app')
})

app.post('/set-cookies', (req, res) => {
    return res.cookie('accessToken', 'true', {
        httpOnly: true,
        sameSite: 'none',
        secure: true
    }).json({ message: "Success" })
})

app.post('/remove-cookies', (req, res) => {
    return res.clearCookie("accessToken", {
        httpOnly: true,
        sameSite: 'none',
        secure: true
    }).json({ message: "Success" })
})

// app.post('/stream', upload.single('videoChunks'), async (req, res) => {
//     const videoChunk = req.file;

//     if (!videoChunk) {
//         return res.status(400).json({ message: 'No video chunk received' });
//     }

//     const { chunkIndex, totalChunks, fileId } = req.body;

//     if (!chunkIndex || !totalChunks || !fileId) {
//         return res.status(400).json({ message: 'Missing required metadata' });
//     }

//     const params = {
//         Bucket: BUCKET_NAME,
//         Key: `videos/${fileId}_${chunkIndex}.webm`,
//         Body: videoChunk.buffer,
//         ContentType: videoChunk.mimetype,
//     };

//     if (chunkIndex <= 10) {
//         try {
//             await s3.upload(params).promise();

//             if (parseInt(chunkIndex, 10) === parseInt(totalChunks, 10) - 1) {
//                 await mergeChunks(fileId, totalChunks);
//                 return res.json({ message: 'All chunks uploaded and merged successfully' });
//             }

//             res.json({ message: `Chunk ${chunkIndex} uploaded successfully` });
//         } catch (err) {
//             console.error('Error uploading chunk:', err);
//             res.status(500).json({ message: 'Error uploading chunk', error: err.message });
//         }
//     }
// });

// io.on('connection', (socket) => {
//     console.log('User connected:', socket.id);

//     socket.on('disconnect', () => {
//         console.log('User disconnected:', socket.id);
//     });
// });

server.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});