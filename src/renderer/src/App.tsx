import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, ArrowLeft, LogOut } from 'lucide-react'
import { Settings } from './components/Settings'
import { Search } from './components/Search'
import { PrintCard } from './components/PrintCard'
import { configureClient, getAppSettings, SearchItem, checkAuthStatus, logoutFromERP } from './api/client'
import { Login } from './components/Login'
import logo from './assets/cen print.png'
import bigLogo from './assets/big-logo.png'

function App() {
  const [showSettings, setShowSettings] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [companyName, setCompanyName] = useState('Cen Print')
  const [defaultTemplate, setDefaultTemplate] = useState('')
  const [selectedItem, setSelectedItem] = useState<SearchItem | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const checkConfiguration = async () => {
    try {
      // @ts-ignore
      const settings = await window.api.getSettings()
      if (settings.erpBaseUrl && settings.printerName) {
        configureClient(settings.erpBaseUrl)
        setIsConfigured(true)
        
        const authStatus = await checkAuthStatus()
        setIsAuthenticated(authStatus)
      } else {
        setIsConfigured(false)
        setIsAuthenticated(false)
        setShowSettings(true) // Force settings if not configured
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkConfiguration()
  }, [])

  useEffect(() => {
    if (isConfigured && isAuthenticated) {
      // Fetch Cold Start data
      getAppSettings()
        .then(data => {
          if (data && data.message) {
            if (data.message.company_name) setCompanyName(data.message.company_name);
            if (data.message.default_template) setDefaultTemplate(data.message.default_template);
          }
        })
        .catch(err => console.error("Failed to fetch app settings from ERPNext", err));
    }
  }, [isConfigured, isAuthenticated])

  const handleSettingsClose = () => {
    setShowSettings(false)
    checkConfiguration()
  }

  if (loading) {
    return <div className="flex h-screen bg-white" />
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-white text-slate-900 relative">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          {/* <img src={logo} alt="Centrric Logo" className="h-8 w-auto object-contain" /> */}
          <h1 className="text-xl font-semibold tracking-tight text-[#014C85]">
            Cen Barcode Printer
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {companyName && companyName !== 'Cen Print' && (
            <div className="text-sm font-medium text-slate-500 hidden sm:block">
              {companyName}
            </div>
          )}
          {isAuthenticated && (
            <button
              onClick={async () => {
                await logoutFromERP();
                setIsAuthenticated(false);
              }}
              className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          )}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Settings"
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        {!isConfigured ? (
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-2xl font-bold text-slate-900">App Not Configured</h2>
            <p className="text-slate-600">Please click the settings icon or wait for the configuration screen to set up your ERPNext connection and Printer.</p>
            <button
              onClick={() => setShowSettings(true)}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
            >
              Configure Now
            </button>
          </div>
        ) : !isAuthenticated ? (
          <Login onLoginSuccess={() => setIsAuthenticated(true)} />
        ) : (
          <div className="text-center space-y-4 w-full flex flex-col items-center">

            {selectedItem ? (
              <div className="w-full max-w-2xl text-left">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="mb-4 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft size={20} /> Back to Search
                </button>
                <PrintCard item={selectedItem} templateName={defaultTemplate} />
              </div>
            ) : (
              <div className="flex flex-col items-center -mt-16 w-full">
                <img src={bigLogo} alt="Main Logo" className="h-48 mb-4 object-contain" />
                <h2 className="text-3xl font-bold tracking-tight text-[#014C85]">
                  Ready to Print?
                </h2>
                <p className="text-slate-500">Search for the items to print.</p>
                <Search onSelect={setSelectedItem} />
              </div>
            )}

          </div>
        )}
      </main>

      {showSettings && <Settings onClose={handleSettingsClose} />}
    </div>
  )
}

export default App
