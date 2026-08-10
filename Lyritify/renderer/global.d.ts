export {}

declare global {
  interface Window {
    electronAPI: {
      openAuthWindow: (url: string) => void
      onAuthCode: (callback: (code: string) => void) => void
      closeApp: () => void
      minimizeApp: () => void
      setIgnoreMouse: (ignore: boolean) => void
      dragWindow: () => void
      dragEnd: () => void
      openSettings: () => void
      closeSettings: () => void
      getSettings: () => Promise<any>
      saveSettings: (settings: any) => void
      onSettingsUpdated: (callback: (settings: any) => void) => (() =>void)
    }
  }
}