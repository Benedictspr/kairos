
// --- CHAT LOGIC ---

function handleChat(e) { if (e.key === 'Enter') sendChat(); }

async function sendChat() {
    const input = document.getElementById('chatInput');
    const text = input.value;
    if (!text) return;

    const msgObj = { type: 'chat', text: text, sender: 'Me', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const strData = JSON.stringify(msgObj);
    const encoder = new TextEncoder();
    const data = encoder.encode(strData);

    try {
        if (room && room.state === 'connected') {
            await room.localParticipant.publishData(data, { reliable: true });
        }
        // Add to my own UI
        addChatMessage('Me', text, true, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        input.value = '';
    } catch (e) {
        console.error('Failed to send chat', e);
        // Fallback: just show locally if offline or error
        addChatMessage('Me', text, true, 'Now');
        input.value = '';
    }
}

// Global handler called from room-manager.js or directly as event listener
window.handleChatData = function (payload, participant) {
    const decoder = new TextDecoder();
    const strData = decoder.decode(payload);
    try {
        const data = JSON.parse(strData);
        if (data.type === 'chat') {
            const isMe = participant === room.localParticipant;
            addChatMessage(participant.identity || 'Guest', data.text, isMe, data.time);
        }
    } catch (e) {
        console.warn('Received unknown data format');
    }
};

function addChatMessage(sender, text, isMe, time) {
    const feed = document.getElementById('chat-feed');
    const el = document.createElement('div');
    el.className = 'chat-msg';

    // Check if it looks like a system message or user message
    // For now simple chat bubble
    el.innerHTML = `
        <div class="chat-header"><span class="chat-name">${sender}</span> <span class="chat-time">${time}</span></div>
        <div class="chat-bubble" style="background:${isMe ? 'var(--accent)' : 'var(--surface-hover)'}; color:${isMe ? '#000' : 'inherit'};">${text}</div>
    `;
    feed.appendChild(el);
    feed.scrollTop = feed.scrollHeight;
}
