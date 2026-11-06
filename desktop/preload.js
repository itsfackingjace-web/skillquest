// What the game page can ask the Windows app for: just the browser sign-in.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('sqDesktop', { platform: 'win', version: '1.0.1', signIn: () => ipcRenderer.invoke('sq-signin') });
