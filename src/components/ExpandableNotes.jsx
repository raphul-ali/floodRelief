import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function ExpandableNotes({
  text,
  maxLength = 85,
  maxLines = 2,
  label = null,
  className = '',
  dark = false,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text || !text.trim()) return null;

  const needsExpand = text.length > maxLength || text.includes('\n');

  return (
    <div
      className={`p-2.5 rounded-xl border text-xs leading-relaxed transition-all ${
        dark
          ? 'bg-slate-900/60 border-slate-700/80 text-slate-300'
          : 'bg-slate-50 border-slate-200 text-slate-700'
      } ${className}`}
    >
      {label && (
        <span className="block font-bold text-[10px] uppercase tracking-wider mb-1 opacity-75 not-italic">
          {label}
        </span>
      )}

      <div
        className={`${
          isExpanded
            ? 'max-h-40 overflow-y-auto pr-1 select-text'
            : 'line-clamp-2 overflow-hidden'
        } italic`}
      >
        "{text}"
      </div>

      {needsExpand && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className={`mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold underline underline-offset-2 cursor-pointer transition-colors ${
            dark
              ? 'text-blue-400 hover:text-blue-300'
              : 'text-blue-600 hover:text-blue-700'
          }`}
        >
          {isExpanded ? (
            <>
              <span>Show less</span>
              <ChevronUp className="w-3.5 h-3.5 shrink-0" />
            </>
          ) : (
            <>
              <span>+ Read more</span>
              <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
