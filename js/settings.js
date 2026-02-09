function initSettings() {
    const user = localStorage.getItem('kairos_user') || 'User';
    const nameEl = document.getElementById('settingUserName'); // Section title
    // if (nameEl) nameEl.innerText = user; // Keep "User" as section title as per image, use name in Profile view

    updateThemeChecks();
    populateProfile();
}

function populateProfile() {
    const user = localStorage.getItem('kairos_user') || 'Benedict Adurosakin';
    const email = (user.toLowerCase().replace(' ', '.') || 'benedict') + '@kairos.ai';

    // Avatar
    const avatarEl = document.getElementById('settProfAvatar');
    if (avatarEl) {
        const initials = user.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        avatarEl.innerText = initials;
    }

    // Name & Email
    const nameEl = document.getElementById('settProfName');
    if (nameEl) nameEl.innerText = user;

    const emailEl = document.getElementById('settProfEmail');
    if (emailEl) emailEl.innerText = email;

    // We could add more details if we stored them (role, location etc)
}

function showSettingsView(viewId) {
    document.querySelectorAll('.settings-view').forEach(el => el.classList.remove('active'));

    const targetId = viewId === 'home' ? 'settings-home' : `settings-${viewId}`;
    const target = document.getElementById(targetId);
    if (target) {
        target.classList.add('active');
        window.scrollTo(0, 0);
    }
}

function setAppTheme(theme) {
    const root = document.documentElement;
    if (theme === 'system') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    root.setAttribute('data-theme', theme);
    localStorage.setItem('kairosTheme', theme);
    updateLogoTheme();
    updateThemeChecks();
}

function updateThemeChecks() {
    const current = localStorage.getItem('kairosTheme') || 'dark';

    document.querySelectorAll('.setting-option').forEach(el => {
        el.classList.remove('selected');
        const span = el.querySelector('span');
        // Simple check based on text content 'Light', 'Dark', 'System'
        if (span) {
            const txt = span.innerText.toLowerCase();
            if (txt.includes(current) || (current === 'system' && txt.includes('system'))) {
                // el.classList.add('selected'); // Logic below
            }
        }
    });

    // Precise selection
    if (current === 'light') document.getElementById('check-light').parentElement.classList.add('selected');
    else if (current === 'dark') document.getElementById('check-dark').parentElement.classList.add('selected');
    else document.getElementById('check-system').parentElement.classList.add('selected');
}
