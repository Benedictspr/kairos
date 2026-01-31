const express = require("express");
const cors = require("cors");
const { AccessToken } = require("livekit-server-sdk");

// Only load dotenv locally
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors());
app.use(express.json());

/* ---------------- HEALTH CHECK ---------------- */
app.get("/", (req, res) => {
  res.status(200).send("KAIROS Token Server is live and healthy.");
});

/* ---------------- TOKEN ENDPOINT ---------------- */
app.get("/get-token", async (req, res) => {
  const { room, user } = req.query;

  if (!room || !user) {
    return res.status(400).json({
      error: "room and user parameters are required",
    });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return res.status(500).json({
      error: "LiveKit credentials not configured on server",
    });
  }

  try {
    const at = new AccessToken(apiKey, apiSecret, {
      identity: user,
    });

    at.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();
    res.json({ token });
  } catch (err) {
    console.error("Token Generation Error:", err);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 KAIROS Token Server running on port ${PORT}`);
});
