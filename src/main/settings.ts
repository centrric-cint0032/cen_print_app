import { app, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import os from 'os';

export interface AppSettings {
  erpBaseUrl: string;
  printerName: string;
  priceList: string;
}

const SETTINGS_FILE = path.join(app.getPath('userData'), 'cen_print_settings.json');

export async function getSettings(): Promise<AppSettings> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(data);

    return {
      erpBaseUrl: parsed.erpBaseUrl || '',
      printerName: parsed.printerName || '',
      priceList: parsed.priceList || '',
    };
  } catch (error) {
    // If file doesn't exist or can't be read, return default empty settings
    return {
      erpBaseUrl: '',
      printerName: '',
      priceList: '',
    };
  }
}

export async function saveSettings(settings: AppSettings): Promise<boolean> {
  try {
    const dataToSave = {
      erpBaseUrl: settings.erpBaseUrl,
      printerName: settings.printerName,
      priceList: settings.priceList,
    };

    await fs.writeFile(SETTINGS_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
}

export async function printRawTSPL(tspl: string, printerName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const tempFile = path.join(os.tmpdir(), `cen_print_${Date.now()}.txt`);
    await fs.writeFile(tempFile, tspl, 'utf-8');

    return new Promise((resolve) => {
      let cmd = '';
      if (process.platform === 'win32') {
        cmd = `powershell.exe -Command "Get-Content '${tempFile}' | Out-Printer -Name '${printerName}'"`;
      } else {
        cmd = `lpr -P "${printerName}" -l "${tempFile}"`;
      }

      exec(cmd, (error) => {
        // We can safely delete the temp file asynchronously after firing print job
        fs.unlink(tempFile).catch(() => {});
        
        if (error) {
          console.error('Print execution error:', error);
          resolve({ success: false, error: error.message });
        } else {
          resolve({ success: true });
        }
      });
    });
  } catch (error: any) {
    console.error('Failed to prepare print job:', error);
    return { success: false, error: error.message };
  }
}

export function registerSettingsHandlers() {
  ipcMain.handle('get-settings', async () => {
    return await getSettings();
  });

  ipcMain.handle('save-settings', async (_, settings: AppSettings) => {
    return await saveSettings(settings);
  });

  ipcMain.handle('get-printers', async (event) => {
    const contents = event.sender;
    return await contents.getPrintersAsync();
  });

  ipcMain.handle('print-raw', async (_, data: string, printerName: string) => {
    return await printRawTSPL(data, printerName);
  });
}
