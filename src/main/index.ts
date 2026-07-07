import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { registerSettingsHandlers } from './settings'

// Disable hardware acceleration for better stability on some systems, if needed.
// app.disableHardwareAcceleration()

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false, // Sandbox might be needed depending on your use case, set to false if preload needs node modules
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false, // Disable CORS checks since this is a desktop app hitting an external API
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    // Basic security to open all target=_blank links in the user's default browser
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load the remote URL for development or the local html file for production.
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../../dist/index.html'))
  }
}

app.whenReady().then(() => {
  registerSettingsHandlers()
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
