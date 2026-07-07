import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, ArrowLeft } from 'lucide-react'
import { Settings } from './components/Settings'
import { Search } from './components/Search'
import { PrintCard } from './components/PrintCard'
import { configureClient, getAppSettings, SearchItem } from './api/client'
import logo from './assets/centrric logo.png'

function App() {
  const [showSettings, setShowSettings] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [companyName, setCompanyName] = useState('Cen Print')
  const [defaultTemplate, setDefaultTemplate] = useState('')
  const [selectedItem, setSelectedItem] = useState<SearchItem | null>(null)

  const checkConfiguration = async () => {
    try {
      // @ts-ignore
      const settings = await window.api.getSettings()
      if (settings.erpBaseUrl && settings.printerName) {
        configureClient(settings.erpBaseUrl)
        setIsConfigured(true)
      } else {
        setIsConfigured(false)
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
    if (isConfigured) {
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
  }, [isConfigured])

  const handleSettingsClose = () => {
    setShowSettings(false)
    checkConfiguration()
  }

  if (loading) {
    return <div className="flex h-screen bg-gray-900" />
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-900 text-white relative">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Centrric Logo" className="h-8 w-auto object-contain" />
          <h1 className="text-xl font-semibold tracking-tight text-gray-100">
            Cen Barcode Printer
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {companyName && companyName !== 'Cen Print' && (
            <div className="text-sm font-medium text-gray-400 hidden sm:block">
              {companyName}
            </div>
          )}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
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
            <h2 className="text-2xl font-bold text-gray-200">App Not Configured</h2>
            <p className="text-gray-400">Please click the settings icon or wait for the configuration screen to set up your ERPNext connection and Printer.</p>
            <button
              onClick={() => setShowSettings(true)}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
            >
              Configure Now
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4 w-full flex flex-col items-center">

            {selectedItem ? (
              <div className="w-full max-w-2xl text-left">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={20} /> Back to Search
                </button>
                <PrintCard item={selectedItem} templateName={defaultTemplate} />
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  Ready to Print
                </h2>
                <p className="text-gray-400">Search for the items to print.</p>
                <Search onSelect={setSelectedItem} />
              </>
            )}

          </div>
        )}
      </main>

      {showSettings && <Settings onClose={handleSettingsClose} />}
    </div>
  )
}

export default App
