const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Enable CORS so your frontend can connect
const io = new Server(server, {
    cors: {
        origin: "*", // In production, replace with your frontend URL
        methods: ["GET", "POST"]
    }
});

const rooms = {}; // Structure: { roomId: [socketId1, socketId2] }

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // --- ROOM LOGIC ---
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        
        if (!rooms[roomId]) rooms[roomId] = [];
        rooms[roomId].push(socket.id);

        // Tell everyone else in the room a new user joined
        socket.to(roomId).emit('user-joined', socket.id);
        
        // Send the list of existing users to the newcomer
        const otherUsers = rooms[roomId].filter(id => id !== socket.id);
        socket.emit('all-users', otherUsers);
        
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // --- WEBRTC SIGNALING ---
    // Relay Offer from Caller to Receiver
    socket.on('offer', (data) => {
        io.to(data.to).emit('offer', {
            from: socket.id,
            offer: data.offer
        });
    });

    // Relay Answer from Receiver to Caller
    socket.on('answer', (data) => {
        io.to(data.to).emit('answer', {
            from: socket.id,
            answer: data.answer
        });
    });

    // Relay ICE Candidates (Network info)
    socket.on('ice-candidate', (data) => {
        io.to(data.to).emit('ice-candidate', {
            from: socket.id,
            candidate: data.candidate
        });
    });

    // --- CHAT LOGIC ---
    socket.on('send-chat', (data) => {
        // Broadcast message to everyone in the room (including sender)
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
