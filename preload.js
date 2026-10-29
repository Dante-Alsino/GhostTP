const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('teleprompterAPI', {
  // Escuta comandos de rolagem e atalhos globais vindos do Main Process
  onCommand: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('tp:command', listener);
    return () => ipcRenderer.removeListener('tp:command', listener);
  },

  // Escuta mudanças de estado da janela (Modo Foco-Seguro vs Modo Edição, proteção de captura, etc.)
  onStateChange: (callback) => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on('tp:state-change', listener);
    return () => ipcRenderer.removeListener('tp:state-change', listener);
  },

  // Escuta carregamento de arquivo de roteiro (.txt / .md)
  onFileLoaded: (callback) => {
    const listener = (_event, fileData) => callback(fileData);
    ipcRenderer.on('tp:file-loaded', listener);
    return () => ipcRenderer.removeListener('tp:file-loaded', listener);
  },

  // Ações solicitadas pelo Front-end ao Main Process
  getState: () => ipcRenderer.invoke('tp:get-state'),
  setLocked: (locked) => ipcRenderer.invoke('tp:set-locked', locked),
  toggleLock: () => ipcRenderer.invoke('tp:toggle-lock'),
  setContentProtection: (enabled) => ipcRenderer.invoke('tp:set-content-protection', enabled),
  openFileDialog: () => ipcRenderer.invoke('tp:open-file-dialog'),
  resetPosition: () => ipcRenderer.invoke('tp:reset-position'),
  quitApp: () => ipcRenderer.send('tp:quit')
});
