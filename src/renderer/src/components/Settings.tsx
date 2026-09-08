import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, ArrowLeft, Printer } from 'lucide-react';

interface AppSettings {
  erpBaseUrl: string;
  printerName: string;
}

interface PrinterInfo {
  name: string;
  displayName: string;
  description: string;
  status: number;
  isDefault: boolean;
}

export function Settings({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<AppSettings>({
    erpBaseUrl: '',
    printerName: ''
  });
  const [printers, setPrinters] = useState<PrinterInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        // @ts-ignore
        const savedSettings = await window.api.getSettings();
        // @ts-ignore
        const availablePrinters = await window.api.getPrinters();
        
        setSettings(savedSettings);
        setPrinters(availablePrinters);
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      // @ts-ignore
      const success = await window.api.saveSettings(settings);
      if (success) {
        setMessage('Settings saved securely!');
        setTimeout(() => onClose(), 1500);
      } else {
        setMessage('Failed to save settings.');
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-lg bg-white border border-slate-100 rounded-2xl p-8 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 text-slate-400 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="flex items-center justify-center gap-3 mb-8">
          <SettingsIcon className="text-blue-600" size={32} />
          <h2 className="text-3xl font-bold text-slate-900">App Configuration</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              ERPNext Base URL
            </label>
            <input 
              type="url"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              placeholder="https://erp.yourcompany.com"
              value={settings.erpBaseUrl}
              onChange={(e) => setSettings({...settings, erpBaseUrl: e.target.value})}
            />
          </div>



          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
              <Printer size={16} /> Target Printer
            </label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all appearance-none"
              value={settings.printerName}
              onChange={(e) => setSettings({...settings, printerName: e.target.value})}
            >
              <option value="">-- Select EasyPOS Printer --</option>
              {printers.map((printer, idx) => (
                <option key={idx} value={printer.name}>
                  {printer.name} {printer.isDefault ? '(Default)' : ''}
                </option>
              ))}
            </select>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm text-center ${message.includes('saved') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message}
            </div>
          )}

          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <Save size={20} />
                Save Configuration
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
