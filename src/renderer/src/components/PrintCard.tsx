import { useState, useEffect } from 'react';
import { getPrintPayload, SearchItem } from '../api/client';
import { Loader2, Printer, Tag, Package, CheckCircle2, AlertCircle } from 'lucide-react';

interface PrintCardProps {
  item: SearchItem;
  templateName: string;
}

export function PrintCard({ item, templateName }: PrintCardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [templateString, setTemplateString] = useState('');
  const [rate, setRate] = useState<number | null>(null);
  const [copies, setCopies] = useState<number>(1);
  const [printStatus, setPrintStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const showStatus = (type: 'success' | 'error', message: string) => {
    setPrintStatus({ type, message });
    setTimeout(() => setPrintStatus(null), 5000);
  };

  useEffect(() => {
    async function fetchPayload() {
      setLoading(true);
      setError('');
      try {
        const data = await getPrintPayload(item.item_code, templateName);
        if (data && data.message) {
          setTemplateString(data.message.template);
          setRate(data.message.standard_selling_rate);
        } else {
          setError('Invalid response from server.');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch print blueprint.');
      } finally {
        setLoading(false);
      }
    }

    if (item.item_code) {
      fetchPayload();
    }
  }, [item.item_code, templateName]);

  const handlePrint = async () => {
    if (!templateString) return;

    // String Replacement Magic for Sprint 4 preparation
    const finalPrintString = templateString.replace('{{ copies }}', copies.toString());

    console.log("=== FINAL TSPL STRING ===");
    console.log(finalPrintString);
    console.log("=========================");

    try {
      // @ts-ignore
      const settings = await window.api.getSettings();
      if (!settings.printerName) {
        showStatus('error', 'No printer configured. Please select a printer in Settings.');
        return;
      }

      // @ts-ignore
      const result = await window.api.printRaw(finalPrintString, settings.printerName);
      if (result.success) {
        showStatus('success', `Successfully sent ${copies} copies to ${settings.printerName}!`);
      } else {
        showStatus('error', `Failed to print: ${result.error}`);
      }
    } catch (e: any) {
      showStatus('error', `Print error: ${e.message}`);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 shadow-xl">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <p className="text-gray-400">Compiling TSPL blueprint...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-red-950/30 border border-red-900 rounded-2xl p-8 text-center space-y-2 shadow-xl">
        <p className="text-red-400 font-medium">Error</p>
        <p className="text-gray-300 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-xl relative">
      
      {/* Toast Notification */}
      {printStatus && (
        <div className={`absolute -top-16 left-0 right-0 mx-auto max-w-sm w-full p-4 rounded-xl shadow-2xl flex items-start gap-3 border backdrop-blur-md animate-in fade-in slide-in-from-top-4 z-50 ${
          printStatus.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-900 text-emerald-300' 
            : 'bg-red-950/90 border-red-900 text-red-300'
        }`}>
          {printStatus.type === 'success' ? <CheckCircle2 className="shrink-0 mt-0.5" size={20} /> : <AlertCircle className="shrink-0 mt-0.5" size={20} />}
          <p className="text-sm font-medium">{printStatus.message}</p>
        </div>
      )}
      {/* Item Details Header */}
      <div className="flex items-start justify-between border-b border-gray-700 pb-6 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold uppercase tracking-wider">
            <Tag size={16} />
            {item.item_code}
          </div>
          <h2 className="text-2xl font-bold text-white">{item.item_name}</h2>
          <div className="flex items-center gap-2 text-gray-400">
            <Package size={16} />
            <span>{item.item_group}</span>
          </div>
        </div>

        {rate !== null && (
          <div className="text-right">
            <div className="text-sm text-gray-500 uppercase tracking-wider">₹ Price</div>
            <div className="text-2xl font-bold text-white flex items-center justify-end">
              {rate.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {/* Print Controls */}
      <div className="flex items-end gap-6">
        <div className="space-y-2 flex-1">
          <label className="block text-sm font-medium text-gray-300">
            Number of Copies
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-blue-500 transition-colors"
            value={copies}
            onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
          />
        </div>

        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
        >
          <Printer size={20} />
          PRINT NOW
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-900 rounded-lg text-xs text-gray-500 font-mono break-all line-clamp-3 relative group">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 pointer-events-none" />
        {templateString}
      </div>
    </div>
  );
}
