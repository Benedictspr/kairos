(function () {
    const isAuth = localStorage.getItem('kairos_auth');
    const isLoginPage = window.location.pathname.includes('login.html');

    if (!isAuth && !isLoginPage) {
        // Build absolute path to login.html based on current location
        // This handles cases where we might be in a subdir (though current structure is flat)
        const path = window.location.pathname;
        const page = path.split("/").pop();
        const loginPath = path.replace(page, 'login.html');

        console.warn("Unauthorized access. Redirecting to login.");
        window.location.href = 'login.html';
    }
})();

function signOut() {
    localStorage.removeItem('kairos_auth');
    localStorage.removeItem('kairos_user');
    window.location.href = 'login.html';
}
