import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Check, Search } from 'lucide-react';
import { ASSAM_DISTRICTS } from '../services/storageService';

export default function DistrictSelect({ value, onChange, placeholder = "Select or search district..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Re-order districts so Jorhat & Sivasagar are at the top as priority
  const prioritizedDistricts = Array.from(new Set(["Jorhat", "Sivasagar", ...ASSAM_DISTRICTS]));

  // Filter districts based on user keyboard input
  const filtered = prioritizedDistricts.filter(dist =>
    dist.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setHighlightedIndex(0);
  }, [search]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (dist) => {
    onChange(dist);
    setIsOpen(false);
    setSearch('');
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlightedIndex]) {
        handleSelect(filtered[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Input Button */}
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-amber-300 font-extrabold text-sm flex items-center justify-between cursor-pointer hover:border-amber-400/60 transition-colors shadow-sm"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <MapPin className="w-4 h-4 text-red-400 shrink-0" />
          <span className="truncate">
            {value || placeholder}
          </span>
          {(value === 'Jorhat' || value === 'Sivasagar') && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-black border border-amber-500/30">
              PRIORITY
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Keyboard-Suggest Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-2 max-h-64 flex flex-col">
          
          {/* Search Input Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type district name (e.g. Jorhat, Sivasagar...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
            />
          </div>

          {/* Options List */}
          <div className="flex-1 overflow-y-auto space-y-0.5 custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">
                No matching district found.
              </div>
            ) : (
              filtered.map((dist, idx) => {
                const isPriority = dist === 'Jorhat' || dist === 'Sivasagar';
                const isSelected = value === dist;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={dist}
                    onClick={() => handleSelect(dist)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center justify-between cursor-pointer transition-colors ${
                      isHighlighted || isSelected
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{dist}</span>
                      {isPriority && (
                        <span className="text-[10px] bg-amber-500/30 text-amber-200 px-1.5 py-0.2 rounded font-black border border-amber-400/40">
                          ⭐ TOP
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}
    </div>
  );
}
