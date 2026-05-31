const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('licenseAdmin', {
  generate: (input) => ipcRenderer.invoke('admin:generate', input),
  copy: (value) => ipcRenderer.invoke('admin:copy', value)
});
