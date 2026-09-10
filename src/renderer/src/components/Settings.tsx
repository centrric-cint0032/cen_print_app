import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, ArrowLeft, Printer, CheckCircle2 } from 'lucide-react';
import { getAllowedPriceLists } from '../api/client';

interface AppSettings {
  erpBaseUrl: string;
  printerName: string;
  priceList?: string;
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
    printerName: '',
    priceList: ''
  });
  const [printers, setPrinters] = useState<PrinterInfo[]>([]);
  const [priceLists, setPriceLists] = useState<{name: string}[]>([]);
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
        
        setSettings({
          erpBaseUrl: savedSettings.erpBaseUrl || '',
          printerName: savedSettings.printerName || '',
          priceList: savedSettings.priceList || ''
        });
        setPrinters(availablePrinters);

        try {
          const pl = await getAllowedPriceLists();
          if (pl && pl.message) setPriceLists(pl.message);
        } catch (e) {
          console.warn("Could not load price lists (might not be logged in)");
        }
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

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Selling Price List
            </label>
            {priceLists.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {priceLists.map((pl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSettings({...settings, priceList: pl.name})}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                      settings.priceList === pl.name 
                        ? 'border-[#014C85] bg-blue-50/50 shadow-sm' 
                        : 'border-slate-100 hover:border-blue-200 bg-white'
                    }`}
                  >
                    {settings.priceList === pl.name && (
                      <CheckCircle2 className="absolute top-3 right-3 text-[#014C85]" size={18} />
                    )}
                    <span className={`block font-medium text-sm ${settings.priceList === pl.name ? 'text-[#014C85]' : 'text-slate-700'}`}>
                      {pl.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-500 text-center">
                Log in first to load price lists.
              </div>
            )}
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
