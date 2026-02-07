
// --- AUDIO / VIDEO CONTROLS ---

async function toggleState(btn, type) {
    if (!room || !room.localParticipant) {
        showToast('Room not connected');
        return;
    }

    if (type === 'mute') {
        const isMuted = room.localParticipant.isMicrophoneEnabled;
        // Toggle
        await room.localParticipant.setMicrophoneEnabled(!isMuted);

        // Check new state
        const nowMuted = !room.localParticipant.isMicrophoneEnabled;

        if (!nowMuted) { // Enabled
            btn.classList.remove('danger');
            btn.classList.add('active');
            btn.querySelector('i').className = 'ph-fill ph-microphone';
            showToast('Microphone Active');
        } else { // Disabled
            btn.classList.add('danger');
            btn.classList.remove('active');
            btn.querySelector('i').className = 'ph-fill ph-microphone-slash';
            showToast('Microphone Muted');
        }
    }

    if (type === 'video') {
        const isVideoEnabled = room.localParticipant.isCameraEnabled;
        await room.localParticipant.setCameraEnabled(!isVideoEnabled);

        const tileMe = document.getElementById('tile-me');
        const avatar = tileMe.querySelector('.tile-avatar');

        if (!isVideoEnabled) { // Turning ON
            // Get track
            const track = room.localParticipant.getTrack(Track.Source.Camera);
            if (track && track.videoTrack) {
                const params = tileMe.querySelector('.live-video');
                if (params) params.remove();

                const element = track.videoTrack.attach();
                element.className = 'live-video';
                tileMe.insertBefore(element, tileMe.firstChild);
            }

            avatar.style.display = 'none';
            btn.classList.add('active');
            btn.querySelector('i').className = 'ph-fill ph-video-camera';
            showToast('Camera Active');
        } else { // Turning OFF
            const vid = tileMe.querySelector('video');
            if (vid) vid.remove();
            avatar.style.display = 'flex';
            btn.classList.remove('active');
            btn.querySelector('i').className = 'ph-fill ph-video-camera-slash';
            showToast('Camera Off');
        }
    }
}
