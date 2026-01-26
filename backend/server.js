const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// --- KEEP-ALIVE / HEALTH CHECK ROUTE ---
// This prevents Render from marking the service as timed out
app.get('/', (req, res) => {
    res.status(200).send('KAIROS Signaling Server is live and healthy.');
});

// Enable CORS so your frontend can connect
const io = new Server(server, {
    cors: {
        origin: "*", // In production, replace with your frontend URL
        methods: ["GET", "POST"]
    }
});

const rooms = {}; 

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // --- ROOM LOGIC ---
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        
        if (!rooms[roomId]) rooms[roomId] = [];
        rooms[roomId].push(socket.id);

        socket.to(roomId).emit('user-joined', socket.id);
        
        const otherUsers = rooms[roomId].filter(id => id !== socket.id);
        socket.emit('all-users', otherUsers);
        
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // --- WEBRTC SIGNALING ---
    socket.on('offer', (data) => {
        io.to(data.to).emit('offer', {
            from: socket.id,
            offer: data.offer
        });
    });

    socket.on('answer', (data) => {
        io.to(data.to).emit('answer', {
            from: socket.id,
            answer: data.answer
        });
    });

    socket.on('ice-candidate', (data) => {
        io.to(data.to).emit('ice-candidate', {
            from: socket.id,
            candidate: data.candidate
        });
    });

    // --- CHAT LOGIC ---
    socket.on('send-chat', (data) => {
        io.to(data.roomId).emit('receive-chat', {
            text: data.text,
            sender: data.sender,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    });

    // --- DISCONNECT ---
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        for (const roomId in rooms) {
            rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
            socket.to(roomId).emit('user-left', socket.id);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`KAIROS Signaling Server running on port ${PORT}`);
});
