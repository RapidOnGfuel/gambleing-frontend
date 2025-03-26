document.addEventListener('DOMContentLoaded', () => {
    // Handle changelog popup close
    const changelogPopup = document.getElementById('changelog-popup');
    const closeChangelog = document.getElementById('close-changelog');

    if (changelogPopup && closeChangelog) {
        closeChangelog.addEventListener('click', () => {
            try {
                changelogPopup.style.transition = 'transform 0.3s, opacity 0.3s';
                changelogPopup.style.transform = 'scale(0.01)';
                changelogPopup.style.opacity = '0';
                setTimeout(() => {
                    changelogPopup.style.visibility = 'hidden';
                }, 300);
            } catch (error) {
                alert('Error closing changelog popup: ' + error.message);
            }
        });
    } else {
        alert('Changelog elements not found.');
    }
});