import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, Loader2, Package } from 'lucide-react';
import { searchItems, SearchItem } from '../api/client';

export function Search({ onSelect }: { onSelect?: (item: SearchItem) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Ref for debouncing timeout
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If search term is empty, clear results and hide dropdown
    if (searchTerm.trim() === '') {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    // Debouncing logic: wait for 300ms of no typing before hitting the API
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await searchItems(searchTerm);
        if (data.message && data.message.length > 0) {
          setResults(data.message);
          setShowDropdown(true);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm]);

  const handleSelectItem = (item: SearchItem) => {
    if (onSelect) onSelect(item);
    setSearchTerm(''); // Clear input after selection
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto mt-8">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isSearching ? (
            <Loader2 className="animate-spin text-blue-600" size={24} />
          ) : (
            <SearchIcon className="text-slate-400" size={24} />
          )}
        </div>
        <input
          type="text"
          className="w-full bg-white border-2 border-slate-200 focus:border-blue-600 rounded-xl py-4 pl-12 pr-4 text-slate-900 text-lg placeholder-slate-400 outline-none transition-colors shadow-md"
          placeholder="Search items by code or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
        />
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
          {results.map((item) => (
            <div
              key={item.item_code}
              onClick={() => handleSelectItem(item)}
              className="flex items-center gap-4 p-4 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Package className="text-blue-600" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-slate-900 font-medium truncate">{item.item_name}</h4>
                <p className="text-slate-500 text-sm truncate">{item.item_code}</p>
              </div>
              <div className="text-xs text-slate-500 px-2 py-1 bg-slate-100 rounded uppercase">
                {item.item_group}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
