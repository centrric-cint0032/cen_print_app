import { ipcMain, session } from 'electron';
import axios from 'axios';
import { getSettings } from './settings';

export function registerAuthHandlers() {
  ipcMain.handle('login-request', async (_, { usr, pwd }) => {
    const settings = await getSettings();
    if (!settings.erpBaseUrl) {
      return { success: false, error: "ERP URL not configured" };
    }

    try {
      const baseUrl = settings.erpBaseUrl.endsWith('/') ? settings.erpBaseUrl.slice(0, -1) : settings.erpBaseUrl;
      const response = await axios.post(`${baseUrl}/api/method/login`, { usr, pwd });
      
      const setCookieHeaders = response.headers['set-cookie'];
      if (setCookieHeaders) {
        for (const cookieStr of setCookieHeaders) {
          const parts = cookieStr.split(';')[0].split('=');
          const name = parts[0];
          const value = parts.slice(1).join('=');
          
          await session.defaultSession.cookies.set({
            url: baseUrl,
            name,
            value
          });
        }
      }
      return { success: true, data: response.data };
    } catch (e: any) {
      return { success: false, error: e.response?.data?.message || e.message || "Failed to login" };
    }
  });

  ipcMain.handle('check-auth', async () => {
    const settings = await getSettings();
    if (!settings.erpBaseUrl) return false;
    
    const baseUrl = settings.erpBaseUrl.endsWith('/') ? settings.erpBaseUrl.slice(0, -1) : settings.erpBaseUrl;
    const cookies = await session.defaultSession.cookies.get({ url: baseUrl, name: 'sid' });
    
    return cookies.length > 0;
  });

  ipcMain.handle('logout-request', async () => {
    const settings = await getSettings();
    if (!settings.erpBaseUrl) return true;
    
    const baseUrl = settings.erpBaseUrl.endsWith('/') ? settings.erpBaseUrl.slice(0, -1) : settings.erpBaseUrl;
    const cookies = await session.defaultSession.cookies.get({ url: baseUrl });
    
    for (const cookie of cookies) {
      await session.defaultSession.cookies.remove(baseUrl, cookie.name);
    }
    return true;
  });

  ipcMain.handle('proxy-request', async (_, config) => {
    const settings = await getSettings();
    if (!settings.erpBaseUrl) {
       return { success: false, error: "ERP URL not configured" };
    }
    
    const baseUrl = settings.erpBaseUrl.endsWith('/') ? settings.erpBaseUrl.slice(0, -1) : settings.erpBaseUrl;
    const cookies = await session.defaultSession.cookies.get({ url: baseUrl });
    const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    const axiosConfig = {
      ...config,
      url: `${baseUrl}${config.url}`, 
      headers: {
        ...config.headers,
        'Cookie': cookieString,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    try {
      const response = await axios(axiosConfig);
      return { success: true, data: response.data };
    } catch (e: any) {
      console.error("Proxy error:", e.response?.data || e.message);
      return { success: false, error: e.response?.data?.message || e.message || "API request failed" };
    }
  });
}
