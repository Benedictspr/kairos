
// --- LIVEKIT CONFIG & CONSTANTS ---
const { Room, RoomEvent, VideoPreserveAspect, Track, DataPacket_Kind } = LiveKitClient;

// Replace these with your backend-generated values
const LIVEKIT_URL = 'wss://kairos-ovqab9eg.livekit.cloud';
let LIVEKIT_TOKEN = ''; // Will be fetched

// Global Room Object
window.room = new Room({
    adaptiveStream: true, // Optimized for grid performance
    dynacast: true,       // Saves bandwidth
    videoCaptureDefaults: {
        resolution: { width: 1280, height: 720 },
    },
    publishDefaults: {
        simulcast: true,
    }
});

// --- INITIALIZATION ---
async function initLiveKit() {
    try {
        // 1. Fetch Token
        const backendUrl = 'https://kairos-backend-u493.onrender.com/getToken';
        const identity = 'Benedict_User'; // Randomize or set from UI in real app

        try {
            const response = await fetch(`${backendUrl}?room=main-room&identity=${identity}`);
            if (response.ok) {
                const data = await response.json();
                LIVEKIT_TOKEN = data.token;
            } else {
                console.warn('Backend fetch failed');
            }
        } catch (e) {
            console.warn('Backend fetch error', e);
        }

        if (!LIVEKIT_TOKEN) {
            showToast('Token Missing - Check Backend');
            // return; // Continue for UI demo
        }

        if (LIVEKIT_TOKEN) {
            // 2. Connect to the room
            await room.connect(LIVEKIT_URL, LIVEKIT_TOKEN);
            showToast('Connected to KAIROS Network');

            // 3. Publish local tracks
            await room.localParticipant.setMicrophoneEnabled(true);
            await room.localParticipant.setCameraEnabled(true);
        } else {
            showToast('Demo Mode (No Server)');
        }

        // 4. Handle Events
        room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
        room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
        room.on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakers);
        room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
        room.on(RoomEvent.DataReceived, (payload, participant) => {
            // Dispatch to other modules
            if (window.handleChatData) window.handleChatData(payload, participant);
        });

        // 5. Pre-load existing participants
        room.participants.forEach(participant => {
            participant.tracks.forEach(publication => {
                if (publication.isSubscribed) {
                    handleTrackSubscribed(publication.track, publication, participant);
                }
            });
        });

    } catch (error) {
        console.error('LiveKit connection error:', error);
        showToast('Connection Failed');
    }
}

// --- TRACK HANDLING ---
function handleTrackSubscribed(track, publication, participant) {
    if (track.kind === Track.Kind.Video) {
        addUserTile(participant.sid, track, participant.identity);
    } else if (track.kind === Track.Kind.Audio) {
        const element = track.attach();
        document.body.appendChild(element);
    }
}

function handleTrackUnsubscribed(track, publication, participant) {
    track.detach().forEach((element) => element.remove());
    if (track.kind === Track.Kind.Video) {
        // Only remove tile if no video track remains (simplified: remove tile)
        // In real app, might want to keep tile for audio-only
        const tile = document.getElementById(`tile-${participant.sid}`);
        // logic to check if we should keep it? For now, we keep tile until participant leaves
    }
}

function handleParticipantDisconnected(participant) {
    const tile = document.getElementById(`tile-${participant.sid}`);
    if (tile) tile.remove();
    showToast(`${participant.identity} left`);
}

// --- SPEAKER HIGHLIGHTING ---
function handleActiveSpeakers(speakers) {
    document.querySelectorAll('.video-tile').forEach(t => t.classList.remove('speaking'));
    speakers.forEach(speaker => {
        const tile = document.getElementById(speaker.isLocal ? 'tile-me' : `tile-${speaker.sid}`);
        if (tile) tile.classList.add('speaking');
    });
}
