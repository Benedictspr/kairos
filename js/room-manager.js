// room-manager.js - Manages Meeting Logic, Media, and Transcription

// --- STATE ---
let localStream = null;
let recognition = null;
let isTranscribing = false;
let transcript = [];
let meetingStartTime = Date.now();
const meetingId = Date.now(); // Unique ID for this session

// --- CONFIG ---
const SPEECH_LANG = 'en-US';

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const roomName = params.get('room') || 'Instant Meeting';
    const userName = params.get('user') || 'Guest';

    // UI Updates
    document.getElementById('connStatus').innerText = `Joining "${roomName}" as ${userName}...`;

    // 1. Get Local Media (Camera/Mic)
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const videoEl = document.getElementById('video-local');
        if (videoEl) {
            videoEl.srcObject = localStream;
            videoEl.muted = true; // Mute local playback to avoid feedback
        }
    } catch (err) {
        console.error("Media Access Denied", err);
        document.getElementById('connStatus').innerText = "Camera/Mic Access Denied. Joining in Listener Mode.";
    }

    // 2. Simulate Connection Delay
    setTimeout(() => {
        document.getElementById('connOverlay').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('connOverlay').style.display = 'none';
            document.getElementById('meetingContainer').style.opacity = '1';
            startTranscription(); // ID 17: Start Live CC
        }, 500);
    }, 2000);

    // 3. Update Nametag
    document.getElementById('myNameTag').innerText = userName + " (You)";
});

// --- MEDIA CONTROLS ---
function toggleMic() {
    const btn = document.getElementById('btnMic');
    const tracks = localStream.getAudioTracks();
    if (tracks.length > 0) {
        const enabled = !tracks[0].enabled;
        tracks[0].enabled = enabled;
        btn.innerHTML = enabled ? '<i class="ph-fill ph-microphone"></i>' : '<i class="ph-fill ph-microphone-slash"></i>';
        btn.classList.toggle('danger', !enabled);

        // Pause/Resume recognition based on mic
        if (enabled && !isTranscribing) startTranscription();
        if (!enabled && isTranscribing) stopTranscription();
    }
}

function toggleCam() {
    const btn = document.getElementById('btnCam');
    const tracks = localStream.getVideoTracks();
    if (tracks.length > 0) {
        const enabled = !tracks[0].enabled;
        tracks[0].enabled = enabled;
        btn.innerHTML = enabled ? '<i class="ph-fill ph-video-camera"></i>' : '<i class="ph-fill ph-video-camera-slash"></i>';
        btn.classList.toggle('danger', !enabled);
    }
}

// --- WEB SPEECH API (CC) ---
function startTranscription() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.warn("Web Speech API not supported");
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = SPEECH_LANG;

    recognition.onstart = () => {
        isTranscribing = true;
        console.log("Transcription Started");
    };

    recognition.onerror = (event) => {
        console.error("Speech Error", event.error);
    };

    recognition.onend = () => {
        if (isTranscribing) recognition.start(); // Auto-restart
    };

    recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
                // Add to persistent transcript
                const speaker = "Me"; // In a real app, we'd identify speakers
                transcript.push({
                    speaker: speaker,
                    text: event.results[i][0].transcript,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        // Update UI Overlay
        const overlay = document.getElementById('captionsOverlay');
        const textToShow = finalTranscript || interimTranscript;

        if (textToShow.trim().length > 0) {
            // Keep only last few lines
            overlay.innerHTML = `<div class="caption-bubble">${textToShow}</div>`;

            // Clear after silence
            clearTimeout(window.captionTimeout);
            window.captionTimeout = setTimeout(() => {
                overlay.innerHTML = '';
            }, 5000);
        }
    };

    recognition.start();
}

function stopTranscription() {
    isTranscribing = false;
    if (recognition) recognition.stop();
}

function toggleCaptions() {
    const btn = document.getElementById('btnCC');
    const overlay = document.getElementById('captionsOverlay');
    if (overlay.style.display === 'none') {
        overlay.style.display = 'flex';
        btn.classList.add('active');
    } else {
        overlay.style.display = 'none';
        btn.classList.remove('active');
    }
}

// --- MEETING END & SAVING ---
function endMeeting() {
    stopTranscription();
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }

    // 1. Generate Summary Data
    const params = new URLSearchParams(window.location.search);
    const roomName = params.get('room') || 'Instant Meeting';
    const durationMs = Date.now() - meetingStartTime;
    const minutes = Math.floor(durationMs / 60000);
    const durationStr = minutes < 1 ? "Just now" : `${minutes} min`;

    // Heuristic Summary Generation (Processing transcript)
    let summaryText = "No discussion recorded.";
    let decisions = [];

    if (transcript.length > 0) {
        // Simple keyword extraction for "summary"
        const fullText = transcript.map(t => t.text).join(' ');
        if (fullText.length > 50) {
            summaryText = `Meeting discussed: ${fullText.substring(0, 100)}...`;
        } else {
            summaryText = fullText;
        }

        // Simple decision detector (keyword "agree", "decided")
        if (fullText.toLowerCase().includes("agree")) {
            decisions.push({ title: "Points Agreed", desc: "Team reached consensus on key topics.", status: "ratified" });
        }
    }

    const meetingData = {
        id: meetingId,
        title: roomName,
        date: "Today",
        duration: durationStr,
        type: "Video",
        decisions: decisions.length,
        conflict: false,
        summary: summaryText,
        attendees: [
            { name: "Me", role: "Host", join: "00:00", leave: durationStr, attention: 100 }
        ],
        artifacts: {
            decisions: decisions,
            actions: [],
            transcript: transcript
        }
    };

    // 2. Save to LocalStorage
    const context = "Personal Workspace"; // Default for instant meetings
    let storedData = JSON.parse(localStorage.getItem('kairos_meetings') || '{}');
    if (!storedData[context]) storedData[context] = [];

    // Add to top
    storedData[context].unshift(meetingData);
    localStorage.setItem('kairos_meetings', JSON.stringify(storedData));

    // 3. Redirect back to Vault
    window.location.href = 'memory_vault.html';
}

function toggleScreen() {
    alert("Screen sharing simulation: Active");
}
