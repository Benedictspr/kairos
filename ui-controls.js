
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

function toggleCheck(el) {
    const box = el.querySelector('.chk-box');
    const text = el.querySelector('.agenda-text');
    if (box.classList.contains('checked')) {
        box.classList.remove('checked'); text.classList.remove('done');
    } else {
        box.classList.add('checked'); text.classList.add('done');
    }
}

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

function sendReaction(emoji) {
    const layer = document.getElementById('tile-me');
    const el = document.createElement('div');
    el.className = 'floating-emoji';
    el.innerText = emoji;
    el.style.left = Math.random() * 60 + 20 + '%';

    layer.appendChild(el);

    setTimeout(() => el.remove(), 2000);
    document.getElementById('reactionOverlay').classList.remove('active');
    showToast(`Reacted with ${emoji}`);
}

function vote(opt, percent) {
    const parent = opt.parentElement;
    parent.querySelectorAll('.poll-option').forEach(o => o.classList.remove('selected'));
    parent.querySelectorAll('.poll-bar-fill').forEach(b => b.style.width = '0%');
    opt.classList.add('selected');
    const bar = opt.nextElementSibling.querySelector('.poll-bar-fill');
    bar.style.width = percent + '%';
    opt.querySelector('span:last-child').innerText = '1 vote';
}

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
const allParticipants = [
    { name: "Benedict (Host)", role: "Host", avatar: "Me" },
    { name: "Alice Design", role: "Guest", avatar: "A" },
    { name: "John Dev", role: "Member", avatar: "J" },
    // Add more mock data if needed
];

let allMuted = false;

function openParticipantList() {
    const modal = document.getElementById('participantsModal');
    const list = document.getElementById('fullParticipantList');
    document.getElementById('pCount').innerText = allParticipants.length;

    list.innerHTML = ''; // clear

    allParticipants.forEach(p => {
        const el = document.createElement('div');
        el.className = 'p-item';
        const isMuted = allMuted || Math.random() > 0.7;
        const micIcon = isMuted ? 'ph-microphone-slash' : 'ph-microphone';

        el.innerHTML = `
            <div class="p-info">
                <div class="p-avatar" style="background:#333;">${p.avatar}</div> 
                ${p.name}
            </div>
            <div class="p-controls">
                <i class="ph-fill ${micIcon}"></i> 
                <i class="ph-fill ph-video-camera${Math.random() > 0.5 ? '-slash' : ''}"></i>
            </div>
        `;
        list.appendChild(el);
    });

    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('visible'), 10);
}

function closeParticipantList() {
    const modal = document.getElementById('participantsModal');
    modal.classList.remove('visible');
    setTimeout(() => modal.style.display = 'none', 300);
}

function toggleMuteAll() {
    const btn = document.getElementById('muteAllBtn');
    const list = document.getElementById('fullParticipantList');

    allMuted = !allMuted;

    if (allMuted) {
        btn.innerHTML = '<i class="ph-bold ph-microphone"></i> Unmute All';
        btn.style.color = 'var(--accent)';
        btn.style.background = 'rgba(16,185,129,0.1)';
        btn.style.borderColor = 'var(--accent)';
        showToast('All participants muted');
    } else {
        btn.innerHTML = '<i class="ph-bold ph-microphone-slash"></i> Mute All';
        btn.style.color = 'var(--danger)';
        btn.style.background = 'rgba(239,68,68,0.1)';
        btn.style.borderColor = 'var(--danger)';
        showToast('All participants unmuted');
    }

    const icons = list.querySelectorAll('.ph-microphone, .ph-microphone-slash');
    icons.forEach(i => {
        i.className = allMuted ? 'ph-fill ph-microphone-slash' : 'ph-fill ph-microphone';
    });
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
