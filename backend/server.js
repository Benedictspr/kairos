const express = require('express');
const cors = require('cors');
const { AccessToken } = require('livekit-server-sdk');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(cors()); // Critical for frontend connection
app.use(express.json());

// --- HEALTH CHECK ---
app.get('/', (req, res) => {
    res.status(200).send('KAIROS Token Server is live and healthy.');
});

/**
 * Endpoint to generate a KAIROS session token
 * Expects query params: ?room=RoomName&user=UserName
 */
app.get('/get-token', async (req, res) => {
    const roomName = req.query.room;
    const participantName = req.query.user;

    if (!roomName || !participantName) {
        return res.status(400).json({ error: 'room and user parameters are required' });
    }

    // These values are pulled from your .env file
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    try {
        const at = new AccessToken(apiKey, apiSecret, {
            identity: participantName,
        });

        // Grant permissions for the user
        at.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,      // Allow camera/mic
            canSubscribe: true,    // Allow seeing others
            canPublishData: true   // Critical for the Chat feature
        });

        const token = await at.toJwt();
        res.json({ token });
    } catch (error) {
        console.error('Token Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate token' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    🚀 KAIROS Token Server Running
    ------------------------------
    Port: ${PORT}
    Endpoint: http://localhost:${PORT}/get-token
    `);
});
