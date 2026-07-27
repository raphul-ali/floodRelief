import React, { useState } from 'react';
import { X, Lock, Key, ShieldCheck, HeartHandshake, Mail, UserCheck, AlertTriangle, ArrowRight, CheckCircle2, Sparkles, Building2, Send, Hash, RefreshCw } from 'lucide-react';
import { authService } from '../services/authService';

export default function LoginModal({ onClose, onLoggedIn }) {
  const [activeMode, setActiveMode] = useState('NGO_LOGIN'); // 'NGO_LOGIN' | 'VOLUNTEER_LOGIN' | 'REGISTER' | 'ADMIN_LOGIN'
  
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Registration state
  const [regRole, setRegRole] = useState('NGO'); // 'NGO' | 'VOLUNTEER'
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regRoleType, setRegRoleType] = useState('Local Boat / Transport Owner');
  
  // OTP Verification state
  const [otpStep, setOtpStep] = useState(false); // false = fill form, true = enter OTP
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  
  const [regSuccess, setRegSuccess] = useState('');
  const [regError, setRegError] = useState('');

  // Admin Login state
  const [adminPin, setAdminPin] = useState('');
  const [adminError, setAdminError] = useState('');

  // Quick Demo Account Login Handlers
  const handleQuickNgoLogin = (demoEmail, demoPass) => {
    try {
      authService.loginNgo(demoEmail, demoPass);
      if (onLoggedIn) onLoggedIn();
      onClose();
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleQuickVolLogin = (demoEmail, demoPass) => {
    try {
      authService.loginVolunteer(demoEmail, demoPass);
      if (onLoggedIn) onLoggedIn();
      onClose();
    } catch (err) {
      setLoginError(err.message);
    }
  };

  // Submit NGO / Volunteer Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      if (activeMode === 'NGO_LOGIN') {
        authService.loginNgo(email, password);
      } else {
        authService.loginVolunteer(email, password);
      }
      if (onLoggedIn) onLoggedIn();
      onClose();
    } catch (err) {
      setLoginError(err.message || 'Login failed.');
    }
  };

  // Step 1 of Registration: Generate & Send Email OTP
  const handleRequestOtp = (e) => {
    e.preventDefault();
    setRegError('');
    setOtpMessage('');

    if (!regName || !regPhone || !regEmail || !regPassword) {
      setRegError('Please fill out all required registration fields.');
      return;
    }

    try {
      const res = authService.generateEmailOtp(regEmail);
      setGeneratedOtp(res.code);
      setOtpStep(true);
      setOtpMessage(`📧 6-Digit Email OTP dispatched to ${regEmail}.`);
    } catch (err) {
      setRegError(err.message || 'Failed to generate OTP.');
    }
  };

  // Step 2 of Registration: Verify OTP and Register Account
  const handleVerifyOtpAndRegister = (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    try {
      // Verify OTP code
      authService.verifyEmailOtp(regEmail, otpInput);

      // Register based on role
      if (regRole === 'NGO') {
        authService.registerNgo({
          name: regName,
          contactPerson: regName,
          phone: regPhone,
          email: regEmail,
          address: regAddress || 'Assam Operational Zone',
          operatingZones: ['Jorhat', 'Sivasagar', 'Lakhimpur']
        }, regPassword);
      } else {
        authService.registerVolunteer({
          name: regName,
          roleType: regRoleType,
          phone: regPhone,
          email: regEmail,
          district: 'Jorhat',
          offerings: regAddress || 'Local relief volunteer support'
        }, regPassword);
      }

      setRegSuccess(`✅ Email Verified (${regEmail})! Account submitted to Admin Verification Queue for final activation.`);
      setTimeout(() => {
        setActiveMode(regRole === 'NGO' ? 'NGO_LOGIN' : 'VOLUNTEER_LOGIN');
        setRegSuccess('');
        setOtpStep(false);
      }, 3500);

    } catch (err) {
      setRegError(err.message || 'OTP Verification failed.');
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
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setActiveMode('NGO_LOGIN'); setLoginError(''); }}
            className={`flex-1 py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeMode === 'NGO_LOGIN'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>NGO Login</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveMode('VOLUNTEER_LOGIN'); setLoginError(''); }}
            className={`flex-1 py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeMode === 'VOLUNTEER_LOGIN'
                ? 'bg-purple-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Volunteer Login</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveMode('REGISTER'); setRegError(''); setOtpStep(false); }}
            className={`flex-1 py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeMode === 'REGISTER'
                ? 'bg-emerald-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Register Account</span>
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
                Log in to post verified relief dispatches directly to the live request timeline without approval delay.
              </p>
            </div>

            {/* Quick Demo Accounts */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-amber-500/30 space-y-1.5">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> One-Tap Demo NGO Logins:
              </span>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleQuickNgoLogin('assamredcross@gmail.com', 'redcross123')}
                  className="w-full text-left p-2 rounded-xl bg-slate-900 hover:bg-amber-500/20 border border-slate-800 text-xs font-semibold text-slate-200 transition-all flex items-center justify-between group"
                >
                  <div>
                    <p className="font-bold text-amber-300">Indian Red Cross Society (Assam)</p>
                    <p className="text-[10px] text-slate-400">assamredcross@gmail.com</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickNgoLogin('controlroom@asdma.gov.in', 'sdrf123')}
                  className="w-full text-left p-2 rounded-xl bg-slate-900 hover:bg-amber-500/20 border border-slate-800 text-xs font-semibold text-slate-200 transition-all flex items-center justify-between group"
                >
                  <div>
                    <p className="font-bold text-red-300">Assam SDRF & NDRF Rescue Cell</p>
                    <p className="text-[10px] text-slate-400">controlroom@asdma.gov.in</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-red-200 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

        {/* MODE 2: VOLUNTEER LOGIN */}
        {activeMode === 'VOLUNTEER_LOGIN' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-400" />
                <span>Volunteer Account Login</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Log in to update local boat operations, transport dispatches, or medical kits.
              </p>
            </div>

            {/* Quick Demo Volunteer Login */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-purple-500/30 space-y-1.5">
              <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> One-Tap Demo Volunteer Login:
              </span>
              <button
                type="button"
                onClick={() => handleQuickVolLogin('vol1@assam.org', 'vol123')}
                className="w-full text-left p-2 rounded-xl bg-slate-900 hover:bg-purple-500/20 border border-slate-800 text-xs font-semibold text-slate-200 transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="font-bold text-purple-300">Pranjal Saikia (Local Boat Owner)</p>
                  <p className="text-[10px] text-slate-400">Majuli Island Motorboat Rescue</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
              </button>
            </div>

            {loginError && (
              <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-red-200 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Volunteer Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="volunteer@email.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>LOG IN AS VOLUNTEER</span>
              </button>
            </form>
          </div>
        )}

        {/* MODE 3: REGISTER + FREE EMAIL OTP VERIFICATION */}
        {activeMode === 'REGISTER' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-white">Create Account & Verify Email OTP</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Register as NGO or Volunteer with free 6-digit Email OTP verification.
              </p>
            </div>

            {/* Account Type Selector */}
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setRegRole('NGO')}
                className={`flex-1 py-1.5 rounded-lg text-center ${regRole === 'NGO' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'}`}
              >
                NGO Account
              </button>
              <button
                type="button"
                onClick={() => setRegRole('VOLUNTEER')}
                className={`flex-1 py-1.5 rounded-lg text-center ${regRole === 'VOLUNTEER' ? 'bg-purple-600 text-white font-black' : 'text-slate-400'}`}
              >
                Individual Volunteer
              </button>
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

            {!regSuccess && !otpStep && (
              <form onSubmit={handleRequestOtp} className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {regRole === 'NGO' ? 'NGO / Organization Name *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={regRole === 'NGO' ? 'e.g. Assam Relief Alliance' : 'e.g. Bishal Dutta'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                {regRole === 'VOLUNTEER' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Volunteer Role Type
                    </label>
                    <select
                      value={regRoleType}
                      onChange={(e) => setRegRoleType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                    >
                      <option value="Local Boat / Transport Owner">🚤 Local Boat / Transport Owner</option>
                      <option value="Medical Doctor / Paramedic">🩺 Medical Doctor / Paramedic</option>
                      <option value="Social Media Influencer / Fundraiser">📢 Social Media Influencer / Fundraiser</option>
                      <option value="Food & Water Supply Donor">📦 Food & Water Supply Donor</option>
                      <option value="Individual Volunteer Helper">🤝 Individual Volunteer Helper</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98640 00000"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="email@domain.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Set Account Password *
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 4 characters"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>GENERATE & SEND 6-DIGIT EMAIL OTP</span>
                </button>
              </form>
            )}

            {/* STEP 2: ENTER 6-DIGIT EMAIL OTP CODE */}
            {otpStep && !regSuccess && (
              <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4 pt-1">
                <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl space-y-1.5 text-xs text-emerald-200">
                  <div className="flex items-center gap-2 font-bold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Free 6-Digit Email OTP Generated!</span>
                  </div>
                  <p className="text-slate-300">
                    Enter the 6-digit OTP code sent to <strong className="text-white">{regEmail}</strong>:
                  </p>
                  <div className="bg-slate-950 p-2 rounded-xl border border-emerald-500/40 text-center font-mono text-base font-black text-amber-300 tracking-widest">
                    DEMO OTP: {generatedOtp}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Enter 6-Digit Verification OTP Code *
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="e.g. 582910"
                      className="w-full bg-slate-950 border-2 border-emerald-500/60 rounded-xl pl-9 pr-3.5 py-2.5 text-base font-mono font-black text-white tracking-widest text-center focus:outline-none focus:border-emerald-400"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOtpStep(false)}
                    className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                  >
                    Edit Info
                  </button>

                  <button
                    type="submit"
                    className="flex-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl text-xs shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>VERIFY OTP & CREATE ACCOUNT</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
