import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openAuthWindow: (url: string) =>
    ipcRenderer.send('open-auth-window', url),

  onAuthCode: (callback: (code: string) => void) =>
    ipcRenderer.on('spotify-auth-code', (_event, code) => callback(code)),

  closeApp: () => ipcRenderer.send('close-app'),
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  setIgnoreMouse: (ignore: boolean) =>
    ipcRenderer.send('set-ignore-mouse', ignore),

  dragWindow: () => ipcRenderer.send('drag-window'),
  dragEnd: () => ipcRenderer.send('drag-end'),

  openSettings: () => ipcRenderer.send('open-settings'),
  closeSettings: () => ipcRenderer.send('close-settings'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.send('save-settings', settings),
  onSettingsUpdated: (callback: (settings: any) => void) => {
  ipcRenderer.removeAllListeners('settings-updated')
  const handler = (_event: any, settings: any) => callback(settings)
  ipcRenderer.on('settings-updated', handler)
  return () => ipcRenderer.removeAllListeners('settings-updated')
}
})