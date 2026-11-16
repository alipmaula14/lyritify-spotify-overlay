import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import Store from 'electron-store'

const store = new Store()

const defaultSettings = {
  windowWidth: 396,
  windowHeight: 516,
  fontSize: 13,
  activeFontSize: 20,
  fontFamily: 'Inter',
  activeColor: '#ffffff',
  inactiveColor: 'rgba(255,255,255,0.4)',
  bgColor: '#0c0c12',
  bgOpacity: 0.28,
  lyricsPanelColor: '#0c0c12',
  lyricsPanelOpacity: 0.28,
  lyricsCenterColor: '#1a1a2e',
  lyricsCenterGradient: 0.4,
  lyricsPanelRadius: 16,
  titleColor: '#ffffff',
  titleSize: 14,
  artistColor: '#999999',
  artistSize: 12,
  buttonColor: '#cccccc',
  buttonBgColor: '#ffffff',
  buttonSize: 40
}

function getSettings(): typeof defaultSettings {
  return { ...defaultSettings, ...(store.get('settings', {}) as object) }
}

let mainWindow: BrowserWindow | null = null
let authWindow: BrowserWindow | null = null
let settingsWindow: BrowserWindow | null = null
let dragInterval: ReturnType<typeof setInterval> | null = null

function createMainWindow(): void {
  const settings = getSettings()

  mainWindow = new BrowserWindow({
    width: settings.windowWidth,
    height: settings.windowHeight,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    hasShadow: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('closed', () => {
  mainWindow = null
  app.quit()
  })
    
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function createAuthWindow(authUrl: string): void {
  authWindow = new BrowserWindow({
    width: 500,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  authWindow.loadURL(authUrl)

  authWindow.webContents.on('will-redirect', (_event, url) => {
    handleCallback(url)
  })

  authWindow.webContents.on('did-navigate', (_event, url) => {
    handleCallback(url)
  })

  authWindow.webContents.on('will-navigate', (_event, url) => {
    handleCallback(url)
  })

  authWindow.on('closed', () => { authWindow = null })
}

function createSettingsWindow(): void {
  if (settingsWindow) {
    settingsWindow.focus()
    return
  }

  settingsWindow = new BrowserWindow({
    width: 420,
    height: 720,
    resizable: true,
    alwaysOnTop: true,
    title: 'Lyritify Settings',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env.NODE_ENV === 'development') {
    settingsWindow.loadURL('http://localhost:5173/setting.html').catch(() => {
      settingsWindow?.loadURL('http://localhost:5173')
    })
  } else {
    settingsWindow.loadFile(join(__dirname, '../renderer/setting.html'))
  }

  settingsWindow.on('closed', () => { settingsWindow = null })
}

function handleCallback(url: string): void {
  if (url.startsWith('http://127.0.0.1:8888/callback')) {
    const code = new URL(url).searchParams.get('code')
    if (code && mainWindow) {
      mainWindow.webContents.send('spotify-auth-code', code)
      authWindow?.close()
      authWindow = null
    }
  }
}

// IPC handlers
ipcMain.on('open-auth-window', (_event, authUrl: string) => createAuthWindow(authUrl))
ipcMain.on('open-external', (_event, url: string) => shell.openExternal(url))
ipcMain.on('set-ignore-mouse', (_event, ignore: boolean) => {
  mainWindow?.setIgnoreMouseEvents(ignore, { forward: true })
})
ipcMain.on('close-app', () => {
  if (mainWindow) {
    mainWindow.destroy()
  }
  app.quit()
})
ipcMain.on('minimize-app', () => mainWindow?.minimize())

ipcMain.on('open-settings', () => createSettingsWindow())
ipcMain.on('close-settings', () => {
  settingsWindow?.close()
  settingsWindow = null
})

ipcMain.handle('get-settings', () => {
  return getSettings()
})

ipcMain.on('save-settings', (_event, settings: any) => {
  store.set('settings', settings)
  if (mainWindow) {
    mainWindow.setSize(settings.windowWidth, settings.windowHeight)
  }
  mainWindow?.webContents.send('settings-updated', settings)
})

ipcMain.on('drag-window', () => {
  if (!mainWindow) return

  if (dragInterval) {
    clearInterval(dragInterval)
    dragInterval = null
  }

  mainWindow.setIgnoreMouseEvents(false)

  const { screen } = require('electron')
  const display = screen.getPrimaryDisplay()
  const { width: screenW, height: screenH } = display.bounds
  const cursor = screen.getCursorScreenPoint()
  const bounds = mainWindow.getBounds()
  const winW = bounds.width
  const winH = bounds.height
  const offsetX = cursor.x - bounds.x
  const offsetY = cursor.y - bounds.y
  let lastX = cursor.x
  let lastY = cursor.y

  dragInterval = setInterval(() => {
    if (!mainWindow) {
      clearInterval(dragInterval!)
      dragInterval = null
      return
    }
    const pos = screen.getCursorScreenPoint()
    if (pos.x === lastX && pos.y === lastY) return
    lastX = pos.x
    lastY = pos.y

    const newX = Math.max(-winW + 50, Math.min(pos.x - offsetX, screenW - 50))
    const newY = Math.max(0, Math.min(pos.y - offsetY, screenH - 50))
    const current = mainWindow.getPosition()
    if (Math.abs(current[0] - newX) > 1 || Math.abs(current[1] - newY) > 1) {
      mainWindow.setBounds({ x: newX, y: newY, width: winW, height: winH })
    }
  }, 8)
})

ipcMain.on('drag-end', () => {
  if (dragInterval) {
    clearInterval(dragInterval)
    dragInterval = null
  }
})

app.whenReady().then(() => {
  createMainWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

