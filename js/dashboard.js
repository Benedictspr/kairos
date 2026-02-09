
// --- CORE DATA ---
const TEAMS = ['Personal Workspace', 'Design Team', 'Engineering'];
const CHATS = [
    { id: 1, name: 'Personal Workspace', type: 'Self', msg: 'Draft: Project Alpha', time: '10:02' },
    { id: 2, name: 'Design Team', type: 'Team', msg: 'Alice: New mockups ready?', time: '09:45' },
    { id: 3, name: 'Engineering', type: 'Team', msg: 'System update scheduled.', time: 'Yesterday' }
];
let DOCS = [
    { name: "Project Proposal.docx", type: "word", date: "Today", tag: "recent" },
    { name: "Q1 Budget.xlsx", type: "excel", date: "Yesterday", tag: "starred" },
    { name: "Meeting Notes.txt", type: "text", date: "2 days ago", tag: "shared" }
];

// MOCK DATA FOR CHAT DETAIL
const MOCK_MESSAGES = {
    1: [
        { id: 101, text: "Remember to review the Project Alpha draft by noon.", sender: "me", time: "09:30" },
        { id: 102, text: "Draft: Project Alpha attached.", sender: "me", time: "10:02" }
    ],
    2: [
        { id: 201, text: "Hey team, how's the new UI coming along?", sender: "me", time: "09:00" },
        { id: 202, text: "New mockups ready? We need them for the client call.", sender: "Alice Design", time: "09:45" }
    ],
    3: [
        { id: 301, text: "Server maintenance at midnight.", sender: "DevOps", time: "Yesterday" },
        { id: 302, text: "System update scheduled. No downtime expected.", sender: "Engineering", time: "Yesterday" }
    ]
};

const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

let events = JSON.parse(localStorage.getItem('kairosEvents')) || [
    { id: 1, title: "Design Review", start: getTodayString(), startTime: "09:00", end: getTodayString(), endTime: "10:00", type: "Zoom", color: "#3b82f6" },
    { id: 2, title: "Client Sync", start: getTodayString(), startTime: "13:30", end: getTodayString(), endTime: "14:30", type: "Google Meet", color: "#8b5cf6" }
];
let editingEventId = null;

const savedThemeVal = localStorage.getItem('kairosTheme') || 'dark';
const tIcon = document.getElementById('themeIcon');
if (tIcon) tIcon.className = savedThemeVal === 'dark' ? 'ph-bold ph-moon' : 'ph-bold ph-sun';

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('kairosTheme', newTheme);

    // Update Sidebar Icon
    const sidebarIcon = document.getElementById('themeIcon');
    if (sidebarIcon) sidebarIcon.className = newTheme === 'dark' ? 'ph-bold ph-moon' : 'ph-bold ph-sun';

    // Update Calendar Card Icon
    const calIcon = document.getElementById('calThemeIcon');
    if (calIcon) calIcon.className = newTheme === 'dark' ? 'ph-bold ph-moon' : 'ph-bold ph-sun';

    if (typeof updateLogoTheme === 'function') updateLogoTheme();
}

function showToast(msg) {
    const t = document.getElementById('toast');
    document.getElementById('toastMsg').innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    const target = document.getElementById('view-' + viewName);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const navBtn = document.getElementById('nav-' + viewName);
    if (navBtn) navBtn.classList.add('active');
    if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('active');
}

function toggleContextDropdown() {
    const dd = document.getElementById('contextDropdown');
    dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
}

function setContext(name) {
    const ctxEl = document.getElementById('currentContext');
    if (ctxEl) ctxEl.innerText = name;

    const dd = document.getElementById('contextDropdown');
    if (dd) dd.style.display = 'none';

    const toastMsg = name === 'Personal Workspace' ? 'Switched to Personal' : `Joined ${name} Space`;
    showToast(toastMsg);
    const actionIcon = document.querySelector('.card-title .ph-lightning');
    if (actionIcon) {
        actionIcon.style.color = name !== 'Personal Workspace' ? '#10b981' : 'inherit';
    }
}

document.addEventListener('click', function (event) {
    if (!event.target.closest('.brand')) {
        const dd = document.getElementById('contextDropdown');
        if (dd) dd.style.display = 'none';
    }
});

function openMeetingHub() { document.getElementById('meetingHub').classList.add('active'); }
function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    editingEventId = null;
    setTimeout(() => {
        const scContent = document.getElementById('startCallContent');
        const preLoader = document.getElementById('preCallLoader');
        if (scContent) scContent.style.display = 'block';
        if (preLoader) preLoader.style.display = 'none';
    }, 500);
}

function openLinkModal() { closeModals(); setTimeout(() => document.getElementById('linkModal').classList.add('active'), 100); }
function openDialPad() { closeModals(); setTimeout(() => document.getElementById('dialPadModal').classList.add('active'), 100); }
function openProfileModal() { closeModals(); setTimeout(() => document.getElementById('profileModal').classList.add('active'), 100); }
function openStartCallModal() { closeModals(); setTimeout(() => document.getElementById('startCallModal').classList.add('active'), 100); }

function openTeamModal() {
    closeModals();
    const sel = document.getElementById('teamSelector');
    sel.innerHTML = '<option value="" disabled selected>Select Team...</option>';
    TEAMS.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t; opt.innerText = t;
        sel.appendChild(opt);
    });
    setTimeout(() => document.getElementById('teamModal').classList.add('active'), 100);
}

function openNewTeamWizard() {
    document.querySelectorAll('.wizard-step').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.step-dot').forEach(el => el.classList.remove('active'));
    document.getElementById('wizStep1').classList.add('active');
    document.getElementById('dot1').classList.add('active');
    document.getElementById('wizMemberList').innerHTML = '';
    document.getElementById('wizMemberInput').value = '';
    document.getElementById('wizTeamName').value = '';
    document.getElementById('wizTeamDesc').value = '';
    document.getElementById('contextDropdown').style.display = 'none';
    closeModals();
    setTimeout(() => document.getElementById('newTeamWizard').classList.add('active'), 100);
}

function wizAddMember() {
    const input = document.getElementById('wizMemberInput');
    const val = input.value;
    if (val) {
        const list = document.getElementById('wizMemberList');
        const item = document.createElement('div');
        item.style.padding = '8px';
        item.style.border = '1px solid var(--border)';
        item.style.borderRadius = '8px';
        item.style.marginBottom = '4px';
        item.style.fontSize = '12px';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.innerHTML = `<span>${val}</span> <i class="ph-bold ph-check" style="color:#10b981"></i>`;
        list.appendChild(item);
        input.value = '';
    }
}

function nextWizardStep(step) {
    document.querySelectorAll('.wizard-step').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.step-dot').forEach(el => el.classList.remove('active'));
    document.getElementById(`wizStep${step}`).classList.add('active');
    document.getElementById(`dot${step}`).classList.add('active');
}

function finishWizard() {
    const teamName = document.getElementById('wizTeamName').value || "New Team";
    TEAMS.push(teamName);
    CHATS.push({ id: Date.now(), name: teamName, type: 'Team', msg: 'Team created', time: 'Just now' });
    const dropdown = document.getElementById('contextDropdown');
    const divider = document.getElementById('teamDivider');
    const newBtn = document.createElement('div');
    newBtn.className = 'nav-btn';
    newBtn.innerText = teamName;
    newBtn.onclick = function () { setContext(teamName); };
    dropdown.insertBefore(newBtn, divider);
    setContext(teamName);
    renderChatList();
    closeModals();
    showToast(`Team "${teamName}" Created`);
    const kDate = document.getElementById('wizDate').value || getTodayString();
    const kTime = document.getElementById('wizTime').value || "09:00";
    events.push({
        id: Date.now(),
        title: `${teamName} Kickoff`,
        start: kDate, startTime: kTime, end: kDate, endTime: "10:00",
        type: "Team Launch", color: "#10b981"
    });
    localStorage.setItem('kairosEvents', JSON.stringify(events));
    renderAgenda();
    renderCal();
}

// --- CHAT FUNCTIONS ---

function renderChatList() {
    const list = document.getElementById('chatListContainer');
    if (!list) return;
    list.innerHTML = '';
    CHATS.forEach(chat => {
        const initial = chat.name.charAt(0);
        const el = document.createElement('div');
        el.className = 'chat-item';
        // Added onclick to open detail view
        el.onclick = function () { openChatDetail(chat.id); };
        el.innerHTML = `
            <div class="chat-avatar">${initial}</div>
            <div style="flex:1">
                <div style="font-size:14px; font-weight:600; display:flex; justify-content:space-between;">
                    ${chat.name} <span style="font-size:11px; font-weight:400; color:var(--text-secondary);">${chat.time}</span>
                </div>
                <div style="font-size:12px; color:var(--text-secondary);">${chat.msg}</div>
            </div>
            <a href="memory_vault.html" class="vault-link-btn" title="Open Memory Vault" onclick="event.stopPropagation()">
                <i class="ph-bold ph-brain"></i>
            </a>
        `;
        list.appendChild(el);
    });
}

function openChatDetail(chatId) {
    // Find chat info
    const chat = CHATS.find(c => c.id == chatId);
    if (!chat) return;

    // Set Title
    document.getElementById('chatDetailTitle').innerText = chat.name;

    // Populate Messages
    const msgList = document.getElementById('chatDetailMessages');
    msgList.innerHTML = '';

    const msgs = MOCK_MESSAGES[chatId] || [];

    if (msgs.length === 0) {
        msgList.innerHTML = `<div style="text-align:center; color:var(--text-secondary); font-size:12px; margin-top:20px;">No messages yet</div>`;
    } else {
        msgs.forEach(m => {
            const isMe = m.sender === 'me';
            const row = document.createElement('div');
            row.className = `chat-bubble-row ${isMe ? 'me' : ''}`;
            row.innerHTML = `
                <div class="chat-bubble ${isMe ? 'me' : 'them'}">
                    ${!isMe ? `<div style="font-size:10px; opacity:0.7; margin-bottom:2px;">${m.sender}</div>` : ''}
                    <div>${m.text}</div>
                    <div class="msg-meta">${m.time}</div>
                </div>
            `;
            msgList.appendChild(row);
        });
    }

    // Switch View
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById('view-chat-detail').classList.add('active');
}

function closeChatDetail() {
    switchView('teamchat');
}

// --- DOCS FUNCTIONS ---

function renderDocs(filterTag = 'all') {
    const list = document.getElementById('docsList');
    if (!list) return;
    list.innerHTML = '';
    const filtered = filterTag === 'all' ? DOCS : DOCS.filter(d => d.tag === filterTag);
    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="docs-empty">
                <div style="width:60px; height:80px; border:2px dashed var(--text-secondary); border-radius:8px; display:flex; align-items:center; justify-content:center;">
                    <i class="ph-duotone ph-file-text docs-icon" style="font-size:32px; opacity:0.5; background:transparent;"></i>
                </div>
                <div>
                    <div style="font-weight:600; margin-bottom:4px;">No files found</div>
                    <div style="font-size:12px;">Create a new document to get started</div>
                </div>
            </div>`;
        return;
    }
    filtered.forEach(doc => {
        const el = document.createElement('div');
        el.className = 'doc-item';
        el.innerHTML = `
            <div class="doc-info">
                <div class="doc-icon"><i class="ph-bold ph-file-text"></i></div>
                <div>
                    <div style="font-size:13px; font-weight:600;">${doc.name}</div>
                    <div style="font-size:11px; color:var(--text-secondary);">${doc.date}</div>
                </div>
            </div>
            <i class="ph-bold ph-dots-three-vertical" style="color:var(--text-secondary)"></i>
        `;
        list.appendChild(el);
    });
}

function filterDocs(tag, btn) {
    document.querySelectorAll('#view-docs .pill-nav').forEach(p => p.classList.remove('active', 'accent-pill'));
    btn.classList.add('active', 'accent-pill');
    renderDocs(tag);
}

// NEW FUNCTION: Open the Custom Modal instead of Prompt
function createNewDoc() {
    document.getElementById('newDocInput').value = '';
    closeModals();
    setTimeout(() => document.getElementById('newDocModal').classList.add('active'), 100);
}

// NEW FUNCTION: Logic to Save
function saveNewDoc() {
    const name = document.getElementById('newDocInput').value;
    if (name) {
        DOCS.unshift({ name: name + (name.includes('.') ? '' : '.txt'), type: "text", date: "Just now", tag: "recent" });
        renderDocs('recent');
        document.querySelectorAll('#view-docs .pill-nav').forEach(p => p.classList.remove('active', 'accent-pill'));
        document.querySelectorAll('#view-docs .pill-nav')[1].classList.add('active', 'accent-pill');
        showToast('Document Created');
        closeModals();
    }
}


function initiateCall(type) {
    // Check for room name from the input field
    const nameInput = document.getElementById('dashboardMeetingName');
    let roomName = nameInput ? nameInput.value.trim() : "General";
    if (!roomName) roomName = "General";

    document.getElementById('startCallContent').style.display = 'none';
    document.getElementById('preCallLoader').style.display = 'block';
    document.getElementById('connText').innerText = `Securing ${type} channel...`;

    // User name - In production, this should come from the authenticated user profile
    const userNameElement = document.getElementById('dockName');
    const userName = userNameElement ? userNameElement.innerText : "Guest";

    setTimeout(() => {
        // Redirect with params
        const target = `gemini-meeting-room.html?room=${encodeURIComponent(roomName)}&user=${encodeURIComponent(userName)}`;
        window.location.href = target;
        closeModals();
        showToast('Redirecting to call...');
    }, 1500);
}


function openScheduleModal(evtId = null) {
    closeModals();
    setTimeout(() => {
        const modal = document.getElementById('scheduleModal');
        const title = document.getElementById('schedModalTitle');
        const btn = document.getElementById('schedBtnText');
        const now = getTodayString();
        document.getElementById('schedStartDate').value = now;
        document.getElementById('schedEndDate').value = now;
        document.getElementById('schedStartTime').value = "10:00";
        document.getElementById('schedEndTime').value = "11:00";
        if (evtId) {
            editingEventId = evtId;
            const ev = events.find(e => e.id === evtId);
            if (ev) {
                title.innerText = "Edit Event";
                btn.innerText = "Update";
                document.getElementById('schedName').value = ev.title;
                document.getElementById('schedStartDate').value = ev.start;
                document.getElementById('schedStartTime').value = ev.startTime;
                document.getElementById('schedEndDate').value = ev.end || ev.start;
                document.getElementById('schedEndTime').value = ev.endTime || "11:00";
            }
        } else {
            editingEventId = null;
            title.innerText = "Schedule meeting";
            btn.innerText = "Schedule";
            document.getElementById('schedName').value = "";
        }
        modal.classList.add('active');
    }, 100);
}

function saveEvent() {
    const name = document.getElementById('schedName').value || "New Meeting";
    const startD = document.getElementById('schedStartDate').value;
    const startT = document.getElementById('schedStartTime').value;
    const endD = document.getElementById('schedEndDate').value;
    const endT = document.getElementById('schedEndTime').value;
    if (editingEventId) {
        const index = events.findIndex(e => e.id === editingEventId);
        if (index !== -1) {
            events[index] = { ...events[index], title: name, start: startD, startTime: startT, end: endD, endTime: endT };
            showToast('Event Updated');
        }
    } else {
        events.push({
            id: Date.now(),
            title: name,
            start: startD, startTime: startT, end: endD, endTime: endT,
            type: "Kairos Video", color: "#10b981"
        });
        showToast('Event Scheduled');
    }
    localStorage.setItem('kairosEvents', JSON.stringify(events));
    closeModals();
    renderAgenda();
    renderCal();
}

function addMember() {
    const val = document.getElementById('newMemberInput').value;
    const team = document.getElementById('teamSelector').value;
    if (!val) { showToast('Please enter details'); return; }
    if (!team) { showToast('Please select a team'); return; }
    const list = document.getElementById('teamList');
    const el = document.createElement('div');
    el.className = 'team-member';
    el.innerHTML = `<div class="member-info"><div class="member-avatar">${val.charAt(0).toUpperCase()}</div><div><span style="font-size:13px; font-weight:600; display:block;">${val}</span><span style="font-size:10px; color:var(--text-secondary);">${team}</span></div></div><div style="font-size:10px; color:#10b981;">Invited</div>`;
    list.appendChild(el);
    document.getElementById('newMemberInput').value = "";
    document.getElementById('teamSelector').selectedIndex = 0;
    showToast(`Invited to ${team}`);
}

function pressKey(key) {
    const display = document.getElementById('dialDisplay');
    if (key === 'del') display.innerText = display.innerText.slice(0, -1);
    else if (display.innerText.length < 12) display.innerText += key;
}

let linkType = 'video';
function toggleLinkType(type) {
    linkType = type;
    document.getElementById('btnVideo').className = `av-btn ${type === 'video' ? 'active' : ''}`;
    document.getElementById('btnAudio').className = `av-btn ${type === 'audio' ? 'active' : ''}`;
    document.getElementById('callLink').innerText = `https://call.kairos.ai/${type}/bSecFu${Math.floor(Math.random() * 1000)}`;
}

function copyLink() {
    navigator.clipboard.writeText(document.getElementById('callLink').innerText);
    showToast('Link copied to clipboard');
}

function sendToWhatsapp() {
    const link = document.getElementById('callLink').innerText;
    const msg = `Join my KAIROS ${linkType} meeting: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}

function renderAgenda() {
    const list = document.getElementById('agendaList');
    if (!list) return;
    list.innerHTML = '';
    const today = getTodayString();
    const todaysEvents = events.filter(e => e.start === today).sort((a, b) => a.startTime.localeCompare(b.startTime));
    if (todaysEvents.length === 0) {
        list.innerHTML = `<div style="text-align:center; color:var(--text-secondary); margin-top:20px; font-size:12px;">No events today</div>`;
        return;
    }
    todaysEvents.forEach(ev => {
        const el = document.createElement('div');
        el.className = 'agenda-item';
        el.onclick = () => openScheduleModal(ev.id);
        el.innerHTML = `<div class="agenda-time">${ev.startTime}</div><div class="agenda-details"><h4>${ev.title}</h4><p>${ev.type} • Edit</p></div>`;
        list.appendChild(el);
    });
}

let currentMonth = new Date().getMonth();
function renderCal() {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monEl = document.getElementById('calMonth');
    if (monEl) monEl.innerText = monthNames[currentMonth];
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(d => {
        const el = document.createElement('div'); el.className = 'day-name'; el.innerText = d; grid.appendChild(el);
    });
    const currentYear = new Date().getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startDay = new Date(currentYear, currentMonth, 1).getDay();
    for (let i = 0; i < startDay; i++) { const el = document.createElement('div'); el.className = 'day-cell faded'; grid.appendChild(el); }
    for (let i = 1; i <= daysInMonth; i++) {
        const el = document.createElement('div');
        const isToday = (i === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear());
        el.className = `day-cell ${isToday ? 'today' : ''}`;
        el.innerHTML = `<div>${i}</div>`;
        const dayString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        events.filter(e => e.start === dayString).forEach(ev => {
            const chip = document.createElement('div');
            chip.className = 'event-chip';
            chip.style.backgroundColor = ev.color + '33'; chip.style.color = ev.color;
            chip.innerText = ev.title; el.appendChild(chip);
        });
        grid.appendChild(el);
    }
}
function changeMonth(d) { currentMonth += d; if (currentMonth > 11) currentMonth = 0; if (currentMonth < 0) currentMonth = 11; renderCal(); }

function updateTime() {
    const now = new Date();
    const clock = document.getElementById('clock');
    if (clock) {
        clock.innerText = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('date').innerText = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
        const format = (tz) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(now);
        document.getElementById('time-lagos').innerText = format('Africa/Lagos');
        document.getElementById('time-ldn').innerText = format('Europe/London');
    }
}


// --- CALENDAR & SYNC ---

function initCalendarAuth() {
    const btn = event.currentTarget || document.querySelector('.nav-btn i.ph-google-logo').parentNode;

    // Simulate Auth
    showToast('Connecting to Device Calendar...');

    setTimeout(() => {
        // Mocking a pull from "Device"
        const newEvent = {
            id: Date.now(),
            title: "Synced: Team Lunch",
            start: getTodayString(),
            startTime: "12:00",
            end: getTodayString(),
            endTime: "13:00",
            type: "Personal",
            color: "#f59e0b"
        };

        // Prevent duplicate sync for demo
        if (!events.some(e => e.title === "Synced: Team Lunch")) {
            events.push(newEvent);
            localStorage.setItem('kairosEvents', JSON.stringify(events));
            renderCal();
            renderAgenda();
            showToast('Synced 1 new event from Device');
        } else {
            showToast('Calendar is up to date');
        }

    }, 1500);
}

function exportCalendarToICS() {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Kairos App//EN\n";

    events.forEach(ev => {
        // Simple ICS format
        // Date format needs to be YYYYMMDDTHHMMSS
        const formatICSDate = (dateStr, timeStr) => {
            return dateStr.replace(/-/g, '') + 'T' + timeStr.replace(/:/g, '') + '00';
        };

        icsContent += "BEGIN:VEVENT\n";
        icsContent += `SUMMARY:${ev.title}\n`;
        icsContent += `DTSTART:${formatICSDate(ev.start, ev.startTime)}\n`;
        icsContent += `DTEND:${formatICSDate(ev.end || ev.start, ev.endTime || '1200')}\n`;
        icsContent += "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'kairos_calendar.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Calendar Exported to Device');
}

// Auto-run Sync on load if previously connected (simulation)
if (localStorage.getItem('googleConnected')) {
    // initCalendarAuth(); // Maybe too intrusive to run on every load for a demo, let's leave it manual
}

// Init
setInterval(updateTime, 1000);
// Ensure DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        updateTime();
        renderCal();
        renderAgenda();
        renderChatList();
        renderDocs();
    });
} else {
    updateTime();
    renderCal();
    renderAgenda();
    renderChatList();
    renderDocs();
}

