import React from 'react';
import { X, MapPin, Github, Instagram, Code } from 'lucide-react';

export default function DeveloperModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 max-sm:pb-24 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl space-y-4 text-center relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Developer Avatar */}
        <div className="relative inline-block mx-auto pt-2">
          <img 
            src="/developer.png" 
            alt="Raphul Ali" 
            className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 shadow-xl mx-auto" 
          />
          <span className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full border-2 border-slate-900">
            <Code className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Developer Info */}
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Raphul Ali</h2>
          <p className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Tinsukia, Assam</span>
          </p>
        </div>

        {/* Social Links */}
        <div className="pt-2 flex flex-col gap-2">
          <a
            href="https://github.com/raphul-ali"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-95 min-h-[42px]"
          >
            <Github className="w-4 h-4 text-cyan-400" />
            <span>GitHub Profile</span>
          </a>

          <a
            href="https://www.instagram.com/r_aphul/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 min-h-[42px]"
          >
            <Instagram className="w-4 h-4" />
            <span>Instagram Profile</span>
          </a>
        </div>

      </div>
    </div>
  );
}
