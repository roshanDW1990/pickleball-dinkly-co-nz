import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface NZLocation {
  id: number;
  name: string;
  region: string;
  type: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  id?: string;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  required,
  id = 'location',
}) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<NZLocation[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('nz_locations')
      .select('id, name, region, type')
      .ilike('name', `${term}%`)
      .order('type', { ascending: true }) // cities first (alphabetically c < s < t)
      .order('name', { ascending: true })
      .limit(10);

    setResults(data ?? []);
    setOpen(true);
    setLoading(false);
    setHighlighted(-1);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (loc: NZLocation) => {
    const label = `${loc.name}, ${loc.region}`;
    setQuery(label);
    onChange(label);
    setOpen(false);
    setResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      select(results[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
  };

  const typeBadgeColor = (type: string) => {
    if (type === 'city') return 'bg-blue-100 text-blue-700';
    if (type === 'suburb') return 'bg-slate-100 text-slate-600';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="relative" ref={containerRef}>
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 z-10 pointer-events-none" />
      <input
        ref={inputRef}
        id={id}
        name="location"
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => query.length >= 2 && results.length > 0 && setOpen(true)}
        autoComplete="off"
        className="w-full pl-10 pr-9 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
        placeholder="Start typing a city or town…"
        required={required}
      />
      {loading ? (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          <svg className="animate-spin h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
          </svg>
        </span>
      ) : (
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
      )}

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {results.map((loc, i) => (
            <li
              key={loc.id}
              onMouseDown={() => select(loc)}
              onMouseEnter={() => setHighlighted(i)}
              className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                i === highlighted ? 'bg-green-50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                <span className="font-medium text-slate-800 truncate">{loc.name}</span>
                <span className="text-slate-500 truncate hidden sm:inline">{loc.region}</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ml-2 ${typeBadgeColor(loc.type)}`}>
                {loc.type}
              </span>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && results.length === 0 && query.length >= 2 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg px-4 py-3 text-sm text-slate-500">
          No locations found for "{query}"
        </div>
      )}
    </div>
  );
};
