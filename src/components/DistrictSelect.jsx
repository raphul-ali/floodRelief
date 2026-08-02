import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Check, Search } from 'lucide-react';
import { ASSAM_DISTRICTS } from '../services/storageService';

export default function DistrictSelect({ value, onChange, placeholder = "Select or search district..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Standard alphabetical district list
  const districtList = [...ASSAM_DISTRICTS];

  // Filter districts based on user keyboard input
  const filtered = districtList.filter(dist =>
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
        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 font-bold text-sm flex items-center justify-between cursor-pointer hover:border-blue-400 transition-colors shadow-sm"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="truncate">
            {value || placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Keyboard-Suggest Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden p-2 space-y-2 max-h-64 flex flex-col">
          
          {/* Search Input Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type district name (e.g. Guwahati, Kamrup...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 font-semibold shadow-inner"
            />
          </div>

          {/* Options List */}
          <div className="flex-1 overflow-y-auto space-y-0.5 custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="p-3 text-center text-xs text-gray-500">
                No matching district found.
              </div>
            ) : (
              filtered.map((dist, idx) => {
                const isSelected = value === dist;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={dist}
                    onClick={() => handleSelect(dist)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                      isHighlighted || isSelected
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{dist}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
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
