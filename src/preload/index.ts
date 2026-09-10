import { contextBridge } from 'electron'

import { ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printRaw: (data: string, printerName: string) => ipcRenderer.invoke('print-raw', data, printerName),
  
  // Auth & Proxy APIs
  loginRequest: (credentials: any) => ipcRenderer.invoke('login-request', credentials),
  checkAuth: () => ipcRenderer.invoke('check-auth'),
  logoutRequest: () => ipcRenderer.invoke('logout-request'),
  proxyRequest: (config: any) => ipcRenderer.invoke('proxy-request', config)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error (define in dts)
  window.api = api
}
