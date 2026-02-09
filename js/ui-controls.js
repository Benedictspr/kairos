
// --- UI CONTROLS ---

function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    document.getElementById('toastMsg').innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.sidebar-content').forEach(c => {
        c.style.display = 'none';
        c.classList.remove('active');
    });
    event.target.classList.add('active');
    const content = document.getElementById(`tab-${tabName}`);
    if (content) {
        content.style.display = tabName === 'chat' ? 'flex' : 'block';
        setTimeout(() => content.classList.add('active'), 10);
    }
}

// --- AGENDA MANAGEMENT ---
async function toggleCheck(el) {
    const box = el.querySelector('.chk-box');
    const text = el.querySelector('.agenda-text');
    const id = el.dataset.id || text.innerText; // Use ID or text as key

    const isChecked = !box.classList.contains('checked');

    // Optimistic UI Update
    updateAgendaUI(el, isChecked);

    // Broadcast
    if (window.room) {
        const payload = JSON.stringify({ type: 'agenda', id: id, checked: isChecked });
        const encoder = new TextEncoder();
        await window.room.localParticipant.publishData(encoder.encode(payload), { reliable: true });
    }
}

function updateAgendaUI(el, isChecked) {
    const box = el.querySelector('.chk-box');
    const text = el.querySelector('.agenda-text');
    if (isChecked) {
        box.classList.add('checked'); text.classList.add('done');
    } else {
        box.classList.remove('checked'); text.classList.remove('done');
    }
}

window.handleAgendaData = function (data) {
    // Find item by ID or text
    const items = document.querySelectorAll('.agenda-item');
    items.forEach(el => {
        const text = el.querySelector('.agenda-text').innerText;
        if (text === data.id || el.dataset.id === data.id) {
            updateAgendaUI(el, data.checked);
        }
    });
};

function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    if (window.innerWidth <= 768) {
        sb.classList.toggle('mobile-active');
    } else {
        sb.classList.toggle('collapsed');
    }
}

function toggleHand(btn) {
    if (btn) btn.classList.toggle('active');
    const badge = document.getElementById('myHand');
    if (badge.classList.contains('active')) {
        badge.classList.remove('active');
    } else {
        badge.classList.add('active');
        showToast('You raised your hand');
    }
    document.getElementById('moreMenuOverlay').classList.remove('active');
}

function toggleReactionMenu() {
    document.getElementById('moreMenuOverlay').classList.remove('active');
    const overlay = document.getElementById('reactionOverlay');
    overlay.classList.toggle('active');
}

function toggleMoreMenu() {
    document.getElementById('reactionOverlay').classList.remove('active');
    const overlay = document.getElementById('moreMenuOverlay');
    overlay.classList.toggle('active');
}

function openMeetingInfo() {
    document.getElementById('moreMenuOverlay').classList.remove('active');
    const modal = document.getElementById('meetingInfoModal');
    modal.classList.toggle('active');
}

function copyMeetingLink() {
    const text = "https://meet.kairos.ai/town-hall-2026";
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        showToast("Link copied to clipboard");
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        showToast("Failed to copy link");
    }
    document.body.removeChild(textArea);
    openMeetingInfo();
}

function openAiPrivacy() {
    const modal = document.getElementById('aiPrivacyModal');
    modal.classList.add('visible');
    modal.style.display = 'flex';
}

function closeAiPrivacy() {
    const modal = document.getElementById('aiPrivacyModal');
    modal.classList.remove('visible');
    setTimeout(() => modal.style.display = 'none', 300);
}

function toggleAiCompanion(btn) {
    const badge = document.getElementById('smartRecBadge');
    const isActive = btn.classList.contains('active');

    if (!isActive) {
        // Turn ON
        btn.classList.add('active');
        btn.style.backgroundColor = 'var(--accent)';
        btn.style.color = 'black';
        btn.innerHTML = '<i class="ph-bold ph-toggle-left"></i> <span>AI Companion On</span>';

        badge.style.display = 'flex';
        setTimeout(() => badge.classList.add('active'), 10);
        showToast('AI Companion Enabled');
    } else {
        // Turn OFF
        btn.classList.remove('active');
        btn.style.backgroundColor = 'var(--surface-hover)';
        btn.style.color = 'var(--text-secondary)';
        btn.innerHTML = '<i class="ph-bold ph-toggle-right"></i> <span>AI Companion Off</span>';

        badge.classList.remove('active');
        setTimeout(() => badge.style.display = 'none', 300);
        showToast('AI Companion Disabled');
    }
}

// --- REACTIONS ---
async function sendReaction(emoji) {
    showReaction(emoji, true); // Show locally

    if (window.room) {
        const payload = JSON.stringify({ type: 'reaction', emoji: emoji });
        const encoder = new TextEncoder();
        await window.room.localParticipant.publishData(encoder.encode(payload), { reliable: true });
    }

    document.getElementById('reactionOverlay').classList.remove('active');
    showToast(`Reacted with ${emoji}`);
}

window.handleReactionData = function (data) {
    showReaction(data.emoji, false);
};

function showReaction(emoji, isLocal) {
    const layer = document.getElementById('tile-me'); // Default to self for now
    // Ideally find the participant's tile
    const el = document.createElement('div');
    el.className = 'floating-emoji';
    el.innerText = emoji;
    el.style.left = Math.random() * 60 + 20 + '%';
    layer.appendChild(el);
    setTimeout(() => el.remove(), 2000);
}


// --- POLLS ---
async function vote(opt, percent) {
    const parent = opt.parentElement;
    const pollId = parent.dataset.pollId || 'default-poll';
    const optionIdx = Array.from(parent.children).indexOf(opt);

    // Optimistic Update
    updatePollUI(parent, opt, percent);

    if (window.room) {
        const payload = JSON.stringify({ type: 'poll', pollId: pollId, optionIdx: optionIdx, percent: percent });
        const encoder = new TextEncoder();
        await window.room.localParticipant.publishData(encoder.encode(payload), { reliable: true });
    }
}

function updatePollUI(parent, opt, percent) {
    parent.querySelectorAll('.poll-option').forEach(o => o.classList.remove('selected'));
    parent.querySelectorAll('.poll-bar-fill').forEach(b => b.style.width = '0%');

    opt.classList.add('selected');
    // Simulate bar fill for demo (real app would aggregate votes)
    // Here we just show highlighting
    // opt.querySelector('.poll-bar-fill').style.width = percent + '%'; 
}

window.handlePollData = function (data) {
    // Find poll
    // For demo, we just update the first poll found or by ID
    const pollCard = document.querySelector('.poll-card');
    if (pollCard) {
        // Just show a small indicator or log for now as aggregating votes is complex without backend state
        showToast('Someone voted on the poll');
    }
};


function openSettings() {
    toggleMoreMenu();
    const modal = document.getElementById('settingsModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('visible'), 10);
}

function closeSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('visible');
    setTimeout(() => modal.style.display = 'none', 300);
}

/* --- PARTICIPANTS LIST LOGIC --- */
// Now handled dynamically by room-manager.js for counts. 
// List visualization can remain mock or be updated to iterate room.participants
function openParticipantList() {
    const modal = document.getElementById('participantsModal');
    const list = document.getElementById('fullParticipantList');

    // Clear list
    list.innerHTML = '';

    // Add Local
    addParticipantToList('Me (Host)', true);

    // Add Remotes
    if (window.room) {
        window.room.participants.forEach(p => {
            addParticipantToList(p.identity || 'Guest', false);
        });
    }

    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('visible'), 10);
}

function addParticipantToList(name, isLocal) {
    const list = document.getElementById('fullParticipantList');
    const el = document.createElement('div');
    el.className = 'p-item';
    el.innerHTML = `
        <div class="p-info">
            <div class="p-avatar" style="background:#333;">${name.charAt(0)}</div> 
            ${name}
        </div>
        <div class="p-controls">
            <i class="ph-fill ph-microphone"></i> 
            <i class="ph-fill ph-video-camera"></i>
        </div>
    `;
    list.appendChild(el);
}

function closeParticipantList() {
    const modal = document.getElementById('participantsModal');
    modal.classList.remove('visible');
    setTimeout(() => modal.style.display = 'none', 300);
}

function toggleMuteAll() {
    showToast('Mute All requested');
    // Implement via room.participants loop if admin rights exist
}

function toggleMaximize(tile) {
    if (tile.classList.contains('maximized')) {
        tile.classList.remove('maximized');
    } else {
        document.querySelectorAll('.video-tile').forEach(t => t.classList.remove('maximized'));
        tile.classList.add('maximized');
    }
}

function endCall() {
    if (typeof room !== 'undefined' && room) room.disconnect(); // Disconnect LiveKit

    const modal = document.getElementById('endModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('visible'), 10);
    setTimeout(() => {
        document.getElementById('processingState').style.display = 'none';
        document.getElementById('summaryState').style.display = 'block';
    }, 2000);
}

// Additional Helper for Dynamic Tiles
function addUserTile(sid, track, identity) {
    let tile = document.getElementById(`tile-${sid}`);
    if (!tile) {
        const grid = document.getElementById('grid');
        tile = document.createElement('div');
        tile.className = 'video-tile';
        tile.id = `tile-${sid}`;
        tile.innerHTML = `
            <div class="tile-top-overlay">
                <div class="tile-btn" onclick="toggleMaximize(this.parentElement.parentElement)"><i class="ph-bold ph-arrows-out-simple"></i></div>
            </div>
            <div class="video-container" style="width:100%; height:100%;"></div>
            <div class="tile-overlay">
                <div class="user-nametag">${identity || 'Remote Participant'}</div>
            </div>
        `;
        grid.prepend(tile);
    }

    const container = tile.querySelector('.video-container');
    container.innerHTML = ''; // Clear previous
    const element = track.attach();
    element.className = 'live-video';
    container.appendChild(element);
}
