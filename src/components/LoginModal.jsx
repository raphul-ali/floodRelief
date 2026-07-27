import React, { useState } from 'react';
import { X, Lock, Key, ShieldCheck, HeartHandshake, Mail, UserCheck, AlertTriangle, ArrowRight, CheckCircle2, Sparkles, Building2 } from 'lucide-react';
import { authService } from '../services/authService';

export default function LoginModal({ onClose, onLoggedIn }) {
  const [activeMode, setActiveMode] = useState('NGO_LOGIN'); // 'NGO_LOGIN' | 'NGO_REGISTER' | 'ADMIN_LOGIN'
  
  // NGO Login state
  const [ngoEmail, setNgoEmail] = useState('');
  const [ngoPassword, setNgoPassword] = useState('');
  const [ngoError, setNgoError] = useState('');

  // NGO Registration state
  const [regName, setRegName] = useState('');
  const [regContactPerson, setRegContactPerson] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regError, setRegError] = useState('');

  // Admin Login state
  const [adminPin, setAdminPin] = useState('');
  const [adminError, setAdminError] = useState('');

  // Quick Demo Account Click Handler
  const handleQuickNgoLogin = (email, pass) => {
    try {
      authService.loginNgo(email, pass);
      if (onLoggedIn) onLoggedIn();
      onClose();
    } catch (err) {
      setNgoError(err.message);
    }
  };

  const handleNgoLoginSubmit = (e) => {
    e.preventDefault();
    setNgoError('');
    try {
      authService.loginNgo(ngoEmail, ngoPassword);
      if (onLoggedIn) onLoggedIn();
      onClose();
    } catch (err) {
      setNgoError(err.message || 'Login failed.');
    }
  };

  const handleNgoRegisterSubmit = (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName || !regPhone || !regEmail || !regPassword) {
      setRegError('Please fill out all required fields.');
      return;
    }

    try {
      authService.registerNgo({
        name: regName,
        contactPerson: regContactPerson || regName,
        phone: regPhone,
        email: regEmail,
        address: regAddress || 'Assam Flood Operational Zone',
        operatingZones: ['Jorhat', 'Sivasagar', 'Lakhimpur']
      }, regPassword);

      setRegSuccess('✅ NGO Registration Submitted! Your account is in the Admin Verification Queue. Our control room will verify your organization and activate your account.');
      setTimeout(() => {
        setActiveMode('NGO_LOGIN');
        setRegSuccess('');
      }, 4000);
    } catch (err) {
      setRegError(err.message || 'Registration failed.');
    }
  };

  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    setAdminError('');
    try {
      authService.loginAdmin(adminPin);
      if (onLoggedIn) onLoggedIn();
      onClose();
    } catch (err) {
      setAdminError(err.message || 'Invalid PIN');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-slate-100 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveMode('NGO_LOGIN')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'NGO_LOGIN'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>NGO Login</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('NGO_REGISTER')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'NGO_REGISTER'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Register NGO</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('ADMIN_LOGIN')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'ADMIN_LOGIN'
                ? 'bg-red-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin</span>
          </button>
        </div>

        {/* MODE 1: NGO LOGIN */}
        {activeMode === 'NGO_LOGIN' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>Verified NGO Portal Login</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Log in to post verified relief dispatches directly to the live timeline without manual approval delay.
              </p>
            </div>

            {/* Quick Demo Accounts Selector Box */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-amber-500/30 space-y-2">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> One-Tap Demo NGO Logins:
              </span>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickNgoLogin('assamredcross@gmail.com', 'redcross123')}
                  className="w-full text-left p-2 rounded-xl bg-slate-900 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/50 text-xs font-semibold text-slate-200 transition-all flex items-center justify-between group"
                >
                  <div>
                    <p className="font-bold text-amber-300">Indian Red Cross Society (Assam)</p>
                    <p className="text-[10px] text-slate-400">assamredcross@gmail.com</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickNgoLogin('controlroom@asdma.gov.in', 'sdrf123')}
                  className="w-full text-left p-2 rounded-xl bg-slate-900 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/50 text-xs font-semibold text-slate-200 transition-all flex items-center justify-between group"
                >
                  <div>
                    <p className="font-bold text-red-300">Assam SDRF & NDRF Rescue Cell</p>
                    <p className="text-[10px] text-slate-400">controlroom@asdma.gov.in</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickNgoLogin('relief@brahmaputra-alliance.org', 'relief123')}
                  className="w-full text-left p-2 rounded-xl bg-slate-900 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/50 text-xs font-semibold text-slate-200 transition-all flex items-center justify-between group"
                >
                  <div>
                    <p className="font-bold text-emerald-300">Brahmaputra Valley Community Alliance</p>
                    <p className="text-[10px] text-slate-400">relief@brahmaputra-alliance.org</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {ngoError && (
              <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-red-200 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{ngoError}</span>
              </div>
            )}

            <form onSubmit={handleNgoLoginSubmit} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  NGO Registered Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={ngoEmail}
                    onChange={(e) => setNgoEmail(e.target.value)}
                    placeholder="ngo@organization.org"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={ngoPassword}
                    onChange={(e) => setNgoPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>LOG IN TO NGO PORTAL</span>
              </button>
            </form>
          </div>
        )}

        {/* MODE 2: REGISTER NGO */}
        {activeMode === 'NGO_REGISTER' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-white">Register Relief Organization</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                New NGO accounts are reviewed once by Admin Control Room before activation.
              </p>
            </div>

            {regError && (
              <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-red-200 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-4 bg-emerald-950/90 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2 animate-pulse">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            {!regSuccess && (
              <form onSubmit={handleNgoRegisterSubmit} className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Assam Community Relief Foundation"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={regContactPerson}
                      onChange={(e) => setRegContactPerson(e.target.value)}
                      placeholder="Name"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98640 00000"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="contact@ngo.org"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Account Password *
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Set password"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Office / Relief Base Address
                  </label>
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="City / District location"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-sm shadow-lg active:scale-95 transition-all mt-2"
                >
                  SUBMIT FOR ADMIN VERIFICATION
                </button>
              </form>
            )}
          </div>
        )}

        {/* MODE 3: ADMIN LOGIN */}
        {activeMode === 'ADMIN_LOGIN' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-500" />
                <span>Admin Control Room Login</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Restricted access for State Disaster Officers to verify citizen SOS requests & NGO registrations.
              </p>
            </div>

            {adminError && (
              <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-red-200 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{adminError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Enter Admin Passcode / PIN
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="Enter PIN (Default: 1070)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-xl text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>UNLOCK ADMIN CONTROL ROOM</span>
              </button>
            </form>

            <div className="pt-2 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => {
                  setAdminPin('1070');
                  authService.loginAdmin('1070');
                  if (onLoggedIn) onLoggedIn();
                  onClose();
                }}
                className="text-xs text-amber-400 hover:underline font-bold"
              >
                ⚡ 1-Tap Demo Admin Access (PIN: 1070)
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
