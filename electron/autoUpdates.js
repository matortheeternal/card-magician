import updater from 'electron-updater';

export function checkForUpdates(lifecycle) {
    const { autoUpdater } = updater;
    autoUpdater.disableWebInstaller = true;
    autoUpdater.on('error', error => console.error('Application update failed:', error));
    autoUpdater.once('update-downloaded', () => {
        lifecycle.installUpdateOnQuit = true;
    });
    return autoUpdater.checkForUpdates();
}
