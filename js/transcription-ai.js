
// --- TRANSCRIPTION & AI (Client-Side Demo) ---

let recognition;
let isTranscribing = false;

function toggleCaptions() {
    const cap = document.getElementById('captionsOverlay');
    cap.classList.toggle('active');
    const isActive = cap.classList.contains('active');

    if (isActive) {
        startTranscription();
        showToast('Captions Enabled (Translating)');
    } else {
        stopTranscription();
        showToast('Captions Disabled');
    }

    document.getElementById('settingsModal').classList.remove('visible');
    document.getElementById('moreMenuOverlay').classList.remove('active');
    setTimeout(() => document.getElementById('settingsModal').style.display = 'none', 300);
}

function startTranscription() {
    if (!('webkitSpeechRecognition' in window)) {
        alert('Web Speech API not supported in this browser. Try Chrome/Edge.');
        return;
    }

    if (isTranscribing) return;

    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Default

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
                addToTranscriptFeed('Me', finalTranscript);
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        // Update Overlay
        const capText = document.getElementById('captionText');
        if (capText) {
            capText.innerText = finalTranscript || interimTranscript || '...';
            document.getElementById('captionSpeaker').innerText = 'Me (Listening...)';
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
    };

    recognition.start();
    isTranscribing = true;
}

function stopTranscription() {
    if (recognition) {
        recognition.stop();
        isTranscribing = false;
    }
}

function addToTranscriptFeed(speaker, text) {
    const feed = document.getElementById('transcript-feed');
    if (!feed) return;

    const div = document.createElement('div');
    div.className = 'transcript-entry';
    div.innerHTML = `
        <div class="ts-meta"><span>${speaker}</span> <span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
        <div class="ts-text">${text}</div>
    `;
    feed.appendChild(div);
    feed.scrollTop = feed.scrollHeight;

    // Simulate AI Insight
    if (Math.random() > 0.8) {
        setTimeout(() => {
            const aiDiv = document.createElement('div');
            aiDiv.className = 'ai-note';
            aiDiv.innerText = "AI INSIGHT: Action item detected regarding project timeline.";
            feed.appendChild(aiDiv);
            feed.scrollTop = feed.scrollHeight;
        }, 1000);
    }
}

// Generate Summary for End Call
/* 
    In a real app, this would send the transcript to an LLM.
    Here we simulate it based on keywords or random predefined points.
*/
function generateSimulatedSummary() {
    const points = [
        "Team agreed on Q3 roadmap targets.",
        "Budget approval is pending for next week.",
        "Mobile responsive design needs a follow-up review.",
        "AI integration features were demonstrated successfully."
    ];

    // Randomly pick 2-3
    const summary = points.sort(() => .5 - Math.random()).slice(0, 3);

    const container = document.querySelector('.summary-preview');
    if (container) {
        container.style.display = 'block';
        let html = `<div style="font-weight:700; margin-bottom:6px; color:var(--text-primary);">AI Summary:</div>`;
        summary.forEach(p => html += `• ${p}<br>`);
        container.innerHTML = html;
    }
}

// Hook into endCall to generate summary
const originalEndCallRef = window.endCall;
window.endCall = function () {
    // Call original disconnect
    if (typeof originalEndCallRef === 'function') originalEndCallRef();
    else {
        // Fallback if original not exposed yet, just do UI
        if (typeof room !== 'undefined' && room) room.disconnect();
        const modal = document.getElementById('endModal');
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('visible'), 10);
        setTimeout(() => {
            document.getElementById('processingState').style.display = 'none';
            generateSimulatedSummary();
            document.getElementById('summaryState').style.display = 'block';
        }, 2000);
    }
}
