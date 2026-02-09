
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { AccessToken } = require('livekit-server-sdk');

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/get-token', async (req, res) => {
  const room = req.query.room;
  const user = req.query.user;

  if (!room || !user) {
    return res.status(400).json({ error: 'Missing "room" or "user" query parameter' });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return res.status(500).json({ error: 'Server misconfigured: Missing API keys' });
  }

  try {
    const at = new AccessToken(apiKey, apiSecret, { identity: user });
    at.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true, canPublishData: true });

    const token = await at.toJwt();
    res.json({ token });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

app.listen(port, () => {
  console.log(`Token server listening on port ${port}`);
});
