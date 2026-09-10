import { useState } from 'react';
import { loginToERP, getAllowedPriceLists } from '../api/client';
import { Loader2, LogIn, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/big-logo.png';

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [usr, setUsr] = useState('');
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usr || !pwd) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await loginToERP(usr, pwd);

      // Auto-select first price list if none is configured
      try {
        // @ts-ignore
        const currentSettings = await window.api.getSettings();
        if (!currentSettings.priceList) {
          const pl = await getAllowedPriceLists();
          if (pl && pl.message && pl.message.length > 0) {
            currentSettings.priceList = pl.message[0].name;
            // @ts-ignore
            await window.api.saveSettings(currentSettings);
          }
        }
      } catch (err) {
        console.warn("Could not set default price list automatically", err);
      }

      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full items-center justify-center bg-white p-6">
      <div className="w-full max-w-md p-8 bg-white border border-slate-100 shadow-2xl rounded-2xl mt-[-5%]">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Logo" className="h-24 mb-6 object-contain" />
          <h2 className="text-3xl font-bold tracking-tight text-[#014C85]">Welcome Back</h2>
          <p className="text-slate-500 mt-2 text-center">Sign in to your Frappe account to continue.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Username or Email
            </label>
            <input
              type="text"
              value={usr}
              onChange={(e) => setUsr(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#014C85] focus:border-transparent transition-all"
              placeholder="e.g. administrator"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-12 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#014C85] focus:border-transparent transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#014C85] hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:shadow-none mt-4"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
