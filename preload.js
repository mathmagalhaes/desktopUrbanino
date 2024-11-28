const { contextBridge, ipcRenderer } = require('electron');

// Expondo a API para o contexto da página
contextBridge.exposeInMainWorld('electron', {
    navigate: (page) => ipcRenderer.send('navigate', page)
});