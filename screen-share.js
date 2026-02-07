
// --- SCREEN SHARE ---

async function toggleScreenShare(btn) {
    if (!room || !room.localParticipant) {
        showToast('Room not connected');
        return;
    }

    const isSharing = room.localParticipant.isScreenShareEnabled;
    try {
        await room.localParticipant.setScreenShareEnabled(!isSharing, { audio: true });

        // UI Update handled by state check or track events usually, 
        // but let's force update button state for immediate feedback
        const nowSharing = room.localParticipant.isScreenShareEnabled;
        updateScreenShareBtn(btn, nowSharing);

    } catch (error) {
        console.error('Screen share error:', error);
        showToast('Screen Share Failed');
    }
}

function updateScreenShareBtn(btn, isSharing) {
    if (isSharing) {
        btn.classList.add('active');
        btn.style.color = 'var(--accent)';
        showToast('Screen Share Started');
    } else {
        btn.classList.remove('active');
        btn.style.color = '#fff'; // Reset color
        showToast('Screen Share Stopped');
    }
}

// Listen for browser-native stop (e.g. user clicks "Stop sharing" in chrome floating bar)
// We track this by listening to TrackUnpublished or LocalTrackUnpublished
window.addEventListener('DOMContentLoaded', () => {
    if (room) {
        room.on(RoomEvent.LocalTrackUnpublished, (publication) => {
            if (publication.kind === Track.Kind.Video && publication.source === Track.Source.ScreenShare) {
                // Find the button and reset it
                // We need a specific ID for the share button or pass it. 
                // For now, let's query it by icon or ID if we add one.
                // Assuming we add id="shareBtn" to the HTML
                const btn = document.getElementById('shareBtn');
                if (btn) updateScreenShareBtn(btn, false);
            }
        });
    }
});
