const { contextBridge, ipcRenderer } = require('electron');

const metadata = ipcRenderer.sendSync('card-magician:metadata');
contextBridge.exposeInMainWorld('appEnvironment', metadata);

contextBridge.exposeInMainWorld('cardMagicianNative', {
    call: (operation, args) => {
        return ipcRenderer.invoke('card-magician:native', operation, args);
    },
    onFileChange: callback => {
        const listener = (_event, data) => callback(data);
        ipcRenderer.on('card-magician:file-watch', listener);
        return () => ipcRenderer.removeListener('card-magician:file-watch', listener);
    },
    onClose: callback => {
        ipcRenderer.removeAllListeners('card-magician:close');
        ipcRenderer.on('card-magician:close', () => callback());
    },
    onOpenFile: callback => {
        ipcRenderer.on('open-file', (e, filePath) => callback(filePath));
    },
    ready: () => ipcRenderer.send('renderer-ready')
});
