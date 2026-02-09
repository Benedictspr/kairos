// --- CORE DATA (Matching Index.html) ---
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

// --- DATA & VAULT LOGIC ---
const staticDatabase = {
    "Design Team": [
        {
            id: 201, title: "Q1 Design Review", date: "Jan 07", duration: "45 min", type: "Video",
            decisions: 2, conflict: false,
            summary: "The team agreed to migrate the frontend to Next.js 14 to leverage server actions. Budget approval for the Sparky Solutions contract was deferred pending a revised quote.",
            attendees: [
                { name: "Benedict", role: "Lead", join: "09:00", leave: "09:45", attention: 95 },
                { name: "Alice", role: "Designer", join: "09:02", leave: "09:45", attention: 88 },
                { name: "John", role: "Dev", join: "09:05", leave: "09:45", attention: 75 }
            ],
            artifacts: {
                decisions: [
                    { title: "Tech Stack Upgrade", desc: "Adopt Next.js 14 for all new modules.", status: "ratified" },
                    { title: "Budget Increase", desc: "Proposal to increase AWS budget by 20% rejected.", status: "rejected" }
                ],
                actions: [
                    { owner: "Alice", task: "Finalize mobile breakpoints", due: "Jan 10" },
                    { owner: "Ben", task: "Email Sparky Solutions", due: "Jan 08", status: "ai_drafted" }
                ],
                transcript: [
                    { speaker: "Alice", text: "We really need to settle on the framework today." },
                    { speaker: "Ben", text: "I agree. <span class='highlight-text'>Let's go with Next.js 14</span>. It solves our server state issues." },
                    { speaker: "John", text: "Are you sure? Vue might be faster to ship." },
                    { speaker: "Ben", text: "No, the ecosystem support dictates React right now. Decision made." }
                ]
            }
        },
        {
            id: 202, title: "Client Sync: Apex", date: "Jan 06", duration: "12 min", type: "Audio",
            decisions: 0, conflict: true,
            summary: "Short sync regarding timeline. Client expressed frustration over delay. No formal decisions made, but tension detected regarding deadline adherence.",
            attendees: [
                { name: "Benedict", role: "Lead", join: "14:00", leave: "14:12", attention: 100 },
                { name: "Apex Client", role: "External", join: "14:01", leave: "14:12", attention: 90 }
            ],
            artifacts: {
                decisions: [],
                actions: [{ owner: "Ben", task: "Send updated Gantt chart", due: "Jan 06" }],
                transcript: [
                    { speaker: "Client", text: "I thought we agreed on Friday?" },
                    { speaker: "Ben", text: "We did, but the scope changed." },
                    { speaker: "Client", text: "<span class='highlight-text'>This is unacceptable</span> based on our contract." }
                ]
            }
        },
        {
            id: 203, title: "Marketing Weekly", date: "Jan 05", duration: "30 min", type: "Video",
            decisions: 1, conflict: false,
            summary: "Routine sync. Campaign scheduled for Feb 1st launch.",
            attendees: [
                { name: "Benedict", role: "Lead", join: "10:00", leave: "10:30", attention: 80 },
                { name: "Sarah", role: "Marketing", join: "10:00", leave: "10:30", attention: 95 }
            ],
            artifacts: {
                decisions: [{ title: "Launch Date", desc: "Feb 1st confirmed for global launch.", status: "ratified" }],
                actions: [],
                transcript: []
            }
        }
    ],
    "Personal Workspace": [
        {
            id: 101, title: "Career Mentor Chat", date: "Jan 10", duration: "45 min", type: "Audio",
            decisions: 0, conflict: false,
            summary: "Discussed Q1 goals. Focus on leadership skills.",
            attendees: [{ name: "Benedict", role: "Me", join: "18:00", leave: "18:45", attention: 100 }],
            artifacts: { decisions: [], actions: [{ owner: "Me", task: "Read 'Radical Candor'", due: "Feb 1" }], transcript: [{ speaker: "Mentor", text: "Focus on delegation." }] }
        }
    ],
    "Engineering": [
        {
            id: 301, title: "API Architecture", date: "Jan 05", duration: "60 min", type: "Video",
            decisions: 2, conflict: false,
            summary: "REST vs GraphQL debate settled.",
            attendees: [{ name: "Dev Team", role: "All", join: "11:00", leave: "12:00", attention: 85 }],
            artifacts: { decisions: [{ title: "Protocol", desc: "Stick to REST for v2", status: "ratified" }], actions: [], transcript: [] }
        }
    ]
};

// Initialize Database with LocalStorage merging
let database = { ...staticDatabase };

function loadDatabase() {
    const stored = localStorage.getItem('kairos_meetings');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            // Merge logic: append new meetings to correct context
            Object.keys(parsed).forEach(ctx => {
                if (!database[ctx]) database[ctx] = [];
                // Avoid duplicates by ID
                parsed[ctx].forEach(m => {
                    if (!database[ctx].find(ex => ex.id === m.id)) {
                        database[ctx].unshift(m);
                    }
                });
            });
        } catch (e) {
            console.error("Failed to load meetings", e);
        }
    }
}

let activeMeetingId = null;

// --- VIEW SWITCHER ---
function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    const target = document.getElementById('view-' + viewName);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const navBtn = document.getElementById('nav-' + viewName);
    if (navBtn) navBtn.classList.add('active');

    if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('active');
}

// --- CHAT LOGIC ---
function renderChatList() {
    const list = document.getElementById('chatListContainer');
    if (!list) return;
    list.innerHTML = '';
    CHATS.forEach(chat => {
        const initial = chat.name.charAt(0);
        const el = document.createElement('div');
        el.className = 'chat-item';
        el.onclick = function () { openChatDetail(chat.id); };
        el.innerHTML = `
        <div class="chat-avatar">${initial}</div>
        <div style="flex:1">
            <div style="font-size:14px; font-weight:600; display:flex; justify-content:space-between;">
                ${chat.name} <span style="font-size:11px; font-weight:400; color:var(--text-secondary);">${chat.time}</span>
            </div>
            <div style="font-size:12px; color:var(--text-secondary);">${chat.msg}</div>
        </div>
        <a href="#" class="vault-link-btn" title="Open Memory Vault" onclick="event.stopPropagation(); switchView('vault');">
            <i class="ph-bold ph-brain"></i>
        </a>
    `;
        list.appendChild(el);
    });
}

function openChatDetail(chatId) {
    const chat = CHATS.find(c => c.id == chatId);
    if (!chat) return;
    document.getElementById('chatDetailTitle').innerText = chat.name;
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
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById('view-chat-detail').classList.add('active');
}

function closeChatDetail() {
    switchView('teamchat');
}

// --- DOCS LOGIC ---
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

function createNewDoc() {
    document.getElementById('newDocInput').value = '';
    closeModals();
    setTimeout(() => document.getElementById('newDocModal').classList.add('active'), 100);
}

function saveNewDoc() {
    const name = document.getElementById('newDocInput').value;
    if (name) {
        DOCS.unshift({ name: name + (name.includes('.') ? '' : '.txt'), type: "text", date: "Just now", tag: "recent" });
        renderDocs('recent');
        document.querySelectorAll('#view-docs .pill-nav').forEach(p => p.classList.remove('active', 'accent-pill'));
        const recBtn = document.querySelectorAll('#view-docs .pill-nav')[1];
        if (recBtn) recBtn.classList.add('active', 'accent-pill');
        showToast('Document Created');
        closeModals();
    }
}

// --- UTILS & CORE ---
function showToast(msg) {
    const t = document.getElementById('toast');
    document.getElementById('toastMsg').innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('kairosTheme', newTheme);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = newTheme === 'dark' ? 'ph-bold ph-moon' : 'ph-bold ph-sun';
}

// --- CONTEXT SWITCHER ---
function toggleContextDropdown() {
    const dd = document.getElementById('contextDropdown');
    dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
}

document.addEventListener('click', function (event) {
    if (!event.target.closest('.brand')) {
        const dd = document.getElementById('contextDropdown');
        if (dd) dd.style.display = 'none';
    }
});

let currentCtx = "Design Team";
function setContext(ctx) {
    currentCtx = ctx;
    document.getElementById('currentContext').innerText = ctx;
    const mbBtn = document.getElementById('mobileCtxBtn');
    if (mbBtn) mbBtn.innerText = ctx.split(' ')[0];
    document.getElementById('contextDropdown').style.display = 'none';

    // Populate if not exists
    if (!database[ctx]) {
        database[ctx] = [];
    }

    renderList();
    showToast(`Joined ${ctx} Space`);

    // Reset View
    document.getElementById('vaultDetailContainer').innerHTML = `
    <div style="height:60vh; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--text-secondary); opacity:0.5;">
        <i class="ph-duotone ph-brain" style="font-size:48px; margin-bottom:16px;"></i>
        <p>Select a meeting to view artifacts</p>
    </div>`;

    if (database[ctx].length > 0) {
        loadMeeting(database[ctx][0].id);
    }
}

// --- MODAL CONTROLLERS ---
function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    setTimeout(() => {
        const scContent = document.getElementById('startCallContent');
        const preLoader = document.getElementById('preCallLoader');
        if (scContent) scContent.style.display = 'block';
        if (preLoader) preLoader.style.display = 'none';
    }, 500);
}
function openMeetingHub() { document.getElementById('meetingHub').classList.add('active'); }
function openStartCallModal() { closeModals(); setTimeout(() => document.getElementById('startCallModal').classList.add('active'), 100); }
function openScheduleModal() { closeModals(); setTimeout(() => document.getElementById('scheduleModal').classList.add('active'), 100); }
function openDialPad() { closeModals(); setTimeout(() => document.getElementById('dialPadModal').classList.add('active'), 100); }
function openProfileModal() { closeModals(); setTimeout(() => document.getElementById('profileModal').classList.add('active'), 100); }
function openLinkModal() { closeModals(); setTimeout(() => document.getElementById('linkModal').classList.add('active'), 100); }

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

// --- NEW TEAM WIZARD LOGIC ---
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

    // 1. Add to Sidebar Dropdown
    const dropdown = document.getElementById('contextDropdown');
    const divider = document.getElementById('teamDivider');
    const newBtn = document.createElement('div');
    newBtn.className = 'nav-btn';
    newBtn.innerText = teamName;
    newBtn.onclick = function () { setContext(teamName); };
    dropdown.insertBefore(newBtn, divider);

    // 2. Add to Database
    const kDate = document.getElementById('wizDate').value || "Today";
    database[teamName] = [
        {
            id: Date.now(),
            title: teamName + " Kickoff",
            date: kDate,
            duration: "00 min",
            type: "Video",
            decisions: 0,
            conflict: false,
            summary: `Initial kickoff meeting for ${teamName}. Goals and members established.`,
            attendees: [
                { name: "Benedict", role: "Lead", join: "09:00", leave: "09:00", attention: 100 }
            ],
            artifacts: { decisions: [], actions: [], transcript: [] }
        }
    ];

    // 3. Switch & Close
    setContext(teamName);
    closeModals();
}

// --- CALL REDIRECTION LOGIC ---
function initiateCall(type) {
    document.getElementById('startCallContent').style.display = 'none';
    document.getElementById('preCallLoader').style.display = 'block';

    // User Identity Logic
    const user = localStorage.getItem('kairos_user') || 'Benedict';
    document.getElementById('connText').innerText = `Securing ${type} channel for ${user}...`;

    setTimeout(() => {
        // Redirect to new meeting room logic
        // We use a query param to pass the room and user
        const roomName = "Quick Meeting";
        window.location.href = `gemini-meeting-room.html?room=${encodeURIComponent(roomName)}&user=${encodeURIComponent(user)}`;
        closeModals();
    }, 2000);
}

function renderList(filterTerm = "") {
    const list = document.getElementById('meetingList');
    if (!list) return;
    list.innerHTML = '';
    const data = database[currentCtx] || [];
    const filtered = data.filter(m => JSON.stringify(m).toLowerCase().includes(filterTerm.toLowerCase()));

    if (filtered.length === 0) {
        list.innerHTML = `<div style="padding:20px; text-align:center; font-size:12px; color:var(--text-secondary);">No records found in this vault.</div>`;
        return;
    }

    filtered.forEach(m => {
        const el = document.createElement('div');
        el.className = `meeting-item ${m.id === activeMeetingId ? 'active' : ''}`;
        el.onclick = () => loadMeeting(m.id);
        let tags = `<span class="tag tag-decision">${m.artifacts.decisions.length} Decisions</span>`;
        if (m.conflict) tags += `<span class="tag tag-conflict">Conflict</span>`;
        if (m.artifacts.transcript && m.artifacts.transcript.length > 0) tags += `<span class="tag tag-decision" style="color:var(--accent)">Transcribed</span>`;

        el.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="font-size:12px; font-weight:600; color:${m.id === activeMeetingId ? 'var(--text-primary)' : 'var(--text-secondary)'};">${m.title}</span>
            <span style="font-size:10px; color:${m.conflict ? 'var(--danger)' : 'var(--accent)'};">${m.type}</span>
        </div>
        <div style="font-size:10px; color:var(--text-secondary); margin-bottom:6px;">${m.date} • ${m.duration}</div>
        <div class="tag-row">${tags}</div>`;
        list.appendChild(el);
    });
}

function loadMeeting(id) {
    activeMeetingId = id;
    renderList(); // re-render to highlight active

    // Mobile Handling
    if (window.innerWidth <= 768 && id) {
        document.getElementById('vaultContentPanel').classList.add('active');
        document.getElementById('sidebar').classList.remove('active');
    }

    const m = database[currentCtx].find(x => x.id === id);
    if (!m) return;

    const container = document.getElementById('vaultDetailContainer');

    const mediaHTML = m.type === "Video"
        ? `<video controls src="${m.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'}" poster="https://via.placeholder.com/640x360/111/555?text=Meeting+Recording"></video>`
        : `<div class="audio-wrapper"><audio controls src="${m.audioUrl || 'https://www.w3schools.com/html/horse.mp3'}"></audio></div>`;

    const attendeesHTML = m.attendees ? m.attendees.map(a => {
        const color = a.attention > 80 ? 'var(--accent)' : (a.attention > 50 ? '#fbbf24' : 'var(--danger)');
        return `
    <div class="attendee-card">
        <div class="attendee-header">
            <div class="att-avatar">${a.name.charAt(0)}</div>
            <div class="att-info">
                <h4>${a.name}</h4>
                <p>${a.role}</p>
            </div>
        </div>
        <div class="att-time">
            <span>In: ${a.join}</span>
            <span>Out: ${a.leave}</span>
        </div>
        <div>
            <div style="font-size:9px; color:var(--text-secondary); display:flex; justify-content:space-between;">
                <span>Attention Span</span>
                <span style="color:${color}">${a.attention}%</span>
            </div>
            <div class="attention-bar"><div class="attention-fill" style="width:${a.attention}%; background:${color}"></div></div>
        </div>
    </div>`;
    }).join('') : '<div style="font-size:11px; color:#666;">No attendee data.</div>';

    container.innerHTML = `
    <div class="content-header">
        <div>
            <h2 class="meeting-title">${m.title}</h2>
            <div class="meeting-meta">
                <span class="ai-badge"><i class="ph-bold ph-brain"></i> Processed</span>
                <span>${m.date}</span> • <span>${m.duration}</span>
            </div>
        </div>
        <button onclick="showToast('Exporting PDF...')" style="font-size:12px; background:var(--bg-panel); color:var(--text-primary); border:1px solid var(--border); padding:8px 16px; border-radius:8px; cursor:pointer;">Export</button>
    </div>
    
    <div class="media-player-box">
        ${mediaHTML}
    </div>

    <div class="summary-card">
        <div class="section-label"><i class="ph-fill ph-sparkle"></i> Executive Summary</div>
        <p style="font-size:13px; line-height:1.6; color:var(--text-secondary);">${m.summary}</p>
    </div>

    <div style="margin-bottom:24px;">
        <div class="section-label"><i class="ph-bold ph-users"></i> Attendees & Engagement</div>
        <div class="attendee-grid">${attendeesHTML}</div>
    </div>

    <div class="artifacts-grid">
        <div>
            <div class="section-label">Ratified Decisions</div>
            ${m.artifacts.decisions.map(d => `
                <div class="decision-card ${d.status === 'rejected' ? 'decision-rejected' : ''}">
                    <div style="font-size:12px; font-weight:700; margin-bottom:4px; color:var(--text-primary);"><i class="ph-fill ${d.status === 'rejected' ? 'ph-x-circle' : 'ph-gavel'}" style="color:${d.status === 'rejected' ? 'var(--danger)' : 'var(--accent)'}"></i> ${d.title}</div>
                    <p style="font-size:11px; color:var(--text-secondary);">${d.desc}</p>
                </div>
            `).join('') || '<div style="font-size:11px; color:var(--text-secondary);">No formal decisions.</div>'}
        </div>
        <div>
            <div class="section-label">Action Items</div>
            ${m.artifacts.actions.map(a => `
                <div class="action-row">
                    <div class="user-avatar" style="width:24px; height:24px; font-size:10px;">${a.owner.charAt(0)}</div>
                    <div style="flex:1;">
                        <div style="font-size:12px; font-weight:500;">${a.task}</div>
                        <div style="font-size:10px; color:${a.status === 'ai_drafted' ? 'var(--accent)' : '#888'}">${a.status === 'ai_drafted' ? 'AI Drafted' : 'Due ' + a.due}</div>
                    </div>
                </div>
            `).join('') || '<div style="font-size:11px; color:var(--text-secondary);">No action items.</div>'}
        </div>
    </div>
    <div class="transcript-box">
        <div class="section-label">Relevant Transcript Segments</div>
        ${m.artifacts.transcript.map(t => `
            <div class="transcript-line">
                <div class="speaker-label">${t.speaker}</div>
                <div style="color:var(--text-primary); flex:1;">${t.text}</div>
            </div>
        `).join('') || '<div style="font-size:11px; color:var(--text-secondary);">Transcript not available...</div>'}
    </div>
`;
}

function closeDetailView() {
    document.getElementById('vaultContentPanel').classList.remove('active');
    activeMeetingId = null;
    renderList();
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

function pressKey(key) {
    const display = document.getElementById('dialDisplay');
    if (key === 'del') display.innerText = display.innerText.slice(0, -1);
    else if (display.innerText.length < 12) display.innerText += key;
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

function initCalendarAuth() {
    const btn = event.currentTarget;
    if (!localStorage.getItem('googleConnected')) {
        btn.innerHTML = `<i class="ph-bold ph-spinner ph-spin"></i> Connecting...`;
        setTimeout(() => {
            localStorage.setItem('googleConnected', 'true');
            btn.innerHTML = `<i class="ph-bold ph-check-circle" style="color:#10b981"></i> Connected`;
            showToast('Google Account Linked');
        }, 1500);
    } else {
        showToast('Account already synced');
    }
}

function filterMeetings(term) {
    renderList(term);
}

// Init
window.addEventListener('DOMContentLoaded', () => {
    loadDatabase();

    // Auth Check
    const user = localStorage.getItem('kairos_user');
    if (user) {
        document.getElementById('dockName').innerText = user;
        document.getElementById('dockAvatar').innerHTML = `<span>${user.charAt(0)}</span>`;
    }

    const savedTheme = localStorage.getItem('kairosTheme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) themeIcon.className = savedTheme === 'dark' ? 'ph-bold ph-moon' : 'ph-bold ph-sun';

    // Set today for date inputs
    const todayStr = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => input.value = todayStr);

    if (window.innerWidth <= 768) {
        document.getElementById('mobileCtxBtn').style.display = 'block';
    }
    renderList();
    renderChatList();
    renderDocs();
    if (window.innerWidth > 768) loadMeeting(201);
});
