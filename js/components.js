
/**
 * Renders the shared sidebar into the #sidebar-container
 * @param {string} activePage - The ID of the active page (e.g., 'dashboard', 'teamchat', 'docs', 'vault', 'calendar', 'teamsync')
 */
function renderSidebar(activePage) {
    const sidebarHTML = `
    <nav id="sidebar" class="active"> <!-- Always active layout for MPA -->
        <!-- X Button REMOVED -->
        
        <div class="brand-row" style="display:flex; justify-content:space-between; align-items:center; position:relative;">
            <div class="brand" style="cursor: default;">
                <!-- IMG LOGO -->
                <div class="brand-icon" style="background:transparent; width:32px; height:32px; display:block;">
                    <img src="icons/new-Kairos-Logo-white.png" id="dashLogo"
                        style="width:100%; height:100%; object-fit:contain;">
                </div>
                <div>
                    <div style="font-size:18px; line-height:1; font-weight:700;">KAIROS</div>
                </div>
            </div>
        </div>

        <div class="nav-btn ${activePage === 'dashboard' ? 'active' : ''}" onclick="window.location.href='index.html'">
            <i class="ph-duotone ph-squares-four"></i> Dashboard
        </div>
        <div class="nav-btn ${activePage === 'teamchat' ? 'active' : ''}" onclick="window.location.href='team_chat.html'">
            <i class="ph-duotone ph-chat-circle-dots"></i> Team Chat
        </div>
        <div class="nav-btn ${activePage === 'docs' ? 'active' : ''}" onclick="window.location.href='docs.html'">
            <i class="ph-duotone ph-file-text"></i> Docs
        </div>
        <div class="nav-btn ${activePage === 'teamsync' ? 'active' : ''}" onclick="window.location.href='team_sync.html'">
            <i class="ph-duotone ph-users"></i> Team Sync
        </div>

        <div class="nav-divider"></div>
        <div class="nav-label">External</div>

        <div class="nav-btn ${activePage === 'calendar' ? 'active' : ''}" onclick="window.location.href='calendar.html'">
            <i class="ph-bold ph-calendar-blank"></i> Calendar
        </div>
        <div class="nav-btn ${activePage === 'vault' ? 'active' : ''}" onclick="window.location.href='memory_vault.html'">
            <i class="ph-bold ph-brain"></i> Memory Vault
        </div>
        <div class="nav-btn ${activePage === 'meeting' ? 'active' : ''}" onclick="window.location.href='gemini-meeting-room.html'">
            <i class="ph-bold ph-video-camera"></i> Meetings
        </div>

        <div style="margin-top: auto;"></div>

        <div class="nav-btn ${activePage === 'settings' ? 'active' : ''}" onclick="window.location.href='settings.html'">
            <i class="ph-bold ph-gear"></i> Settings
        </div>

        <div class="bottom-dock" onclick="window.location.href='profile.html'" style="margin-top: 10px;">
            <div class="user-avatar" id="dockAvatar">
                <span>BA</span>
            </div>
            <div>
                <div style="font-size:12px; font-weight:600; color:var(--text-primary)" id="dockName">Benedict</div>
                <div style="font-size:10px; color:var(--text-secondary)">Profile</div>
            </div>
        </div>
    </nav>
    <div id="sidebar-overlay" onclick="toggleSidebar()"></div> 
    `;

    document.getElementById('sidebar-container').innerHTML = sidebarHTML;

    // Check for menu button and attach toggle logic if it exists
    // (This ensures pages that have a .menu-btn work with this new global logic)
    const menuBtn = document.querySelector('.menu-btn');
    if (menuBtn) {
        menuBtn.onclick = toggleSidebar;
    }

    // Init standard component logic
    updateLogoTheme();
    initDockUser();
}

function updateLogoTheme() {
    const theme = document.documentElement.getAttribute('data-theme');
    const logo = document.getElementById('dashLogo');
    if (logo) {
        logo.src = theme === 'dark' ? 'icons/new-Kairos-Logo-white.png' : 'icons/new-Kairos-Logo-black.png';
    }
}

function initDockUser() {
    const user = localStorage.getItem('kairos_user') || 'User';
    const dockName = document.getElementById('dockName');
    if (dockName) dockName.innerText = user;

    const dockAvatar = document.getElementById('dockAvatar');
    const savedAvatar = localStorage.getItem('kairos_avatar');
    if (dockAvatar) {
        if (savedAvatar) {
            dockAvatar.innerHTML = `<img src="${savedAvatar}" style="width:100%; height:100%; object-fit:cover;">`;
        } else {
            const initials = user.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            dockAvatar.innerHTML = `<span>${initials}</span>`;
        }
    }
}

// Global Help Functions
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebar) {
        sidebar.classList.toggle('active');
        if (overlay) {
            overlay.classList.toggle('show');
        }
    }
}
function toggleContextDropdown() {
    const d = document.getElementById('contextDropdown');
    if (d) d.style.display = d.style.display === 'block' ? 'none' : 'block';
}

function setContext(ctx) {
    const c = document.getElementById('currentContext');
    if (c) c.innerText = ctx;
    toggleContextDropdown();
}

function openMeetingHubGlobal() {
    // If we are on index.html, open modal.
    if (document.getElementById('meetingHub')) {
        document.getElementById('meetingHub').classList.add('active');
    } else {
        // Redirect to dashboard with hash to open?
        window.location.href = 'index.html#meetingHub';
    }
}
