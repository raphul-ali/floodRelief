import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, Key, ShieldCheck, HeartHandshake, Mail, UserCheck, AlertTriangle, ArrowRight, CheckCircle2, Building2, Send, Hash, Phone, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { securityService } from '../services/securityService';
import { storageService, VOLUNTEER_ROLES, NGO_TYPES, ASSAM_DISTRICTS } from '../services/storageService';
import { i18nService } from '../services/i18nService';

export default function LoginModal({ onClose, onLoggedIn, initialMode = 'NGO_LOGIN', initialRegRole = 'NGO' }) {
  const [, setLangState] = useState(i18nService.getLanguage());

  useEffect(() => {
    const handleLangChange = () => setLangState(i18nService.getLanguage());
    window.addEventListener('flood_lang_changed', handleLangChange);
    return () => window.removeEventListener('flood_lang_changed', handleLangChange);
  }, []);
  const [activeMode, setActiveMode] = useState(initialMode); // 'NGO_LOGIN' | 'VOLUNTEER_LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'FORGOT_EMAIL'
  
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Account Recovery State (Forgot Password / Forgot Email)
  const [recAccountRole, setRecAccountRole] = useState('NGO'); // 'NGO' | 'VOLUNTEER'
  const [recName, setRecName] = useState('');
  const [recPhone, setRecPhone] = useState('');
  const [recEmail, setRecEmail] = useState('');
  const [recDetails, setRecDetails] = useState('');
  const [recSuccess, setRecSuccess] = useState(false);
  const [recError, setRecError] = useState('');

  // Registration state
  const [regRole, setRegRole] = useState(initialRegRole); // 'NGO' | 'VOLUNTEER'
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regAddress, setRegAddress] = useState('');
  const [regRoleType, setRegRoleType] = useState('');
  const [regNgoType, setRegNgoType] = useState('');
  const [regLogoUrl, setRegLogoUrl] = useState('');
  const [logoError, setLogoError] = useState('');
  const [regShowPhone, setRegShowPhone] = useState(false);
  const logoFileInputRef = useRef(null);

  const handleClearLogo = () => {
    setRegLogoUrl('');
    setLogoError('');
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = '';
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    setLogoError('');
    if (!file) {
      handleClearLogo();
      return;
    }

    const result = securityService.validateLogoFile(file);
    if (!result.valid) {
      setLogoError(result.error);
      setRegLogoUrl('');
      // Remove invalid image selection from file input
      if (e.target) {
        e.target.value = '';
      }
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = '';
      }
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setRegLogoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // NGO Operating Zones State
  const [regZoneMode, setRegZoneMode] = useState('WHOLE_ASSAM'); // 'WHOLE_ASSAM' | 'CUSTOM_DISTRICTS'
  const [regSelectedDistricts, setRegSelectedDistricts] = useState([]);
  
  useEffect(() => {
    if (activeMode === 'REGISTER') {
      setRegEmail('');
      setRegPassword('');
      setRegName('');
      setRegPhone('');
      setEmailTouched(false);
      setPasswordTouched(false);
      setPhoneTouched(false);
    }
  }, [activeMode]);

  // Live Inline Error States
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const validateRegPhone = (val) => {
    const clean = val.replace(/[^0-9]/g, '');
    if (!clean) {
      setPhoneError('Phone number is required.');
      return false;
    } else if (clean.length !== 10) {
      setPhoneError(`Phone number must be exactly 10 digits (${clean.length}/10).`);
      return false;
    } else if (!/^[6-9]\d{9}$/.test(clean)) {
      setPhoneError('Must be a valid Indian mobile number starting with 6, 7, 8, or 9.');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const validateRegEmail = (val) => {
    const clean = val.trim();
    if (!clean) {
      setEmailError('Email address is required.');
      return false;
    } else if (!securityService.validateEmail(clean)) {
      setEmailError('Please enter a valid email format (e.g. name@domain.com).');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validateRegPassword = (val) => {
    if (!val) {
      setPasswordError('Password is required.');
      return false;
    } else if (!securityService.validatePassword(val)) {
      setPasswordError('Must be min 8 chars with 1 letter, 1 number, & 1 symbol (@#$%).');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Debounced Phone Validation (400ms pause)
  useEffect(() => {
    if (!phoneTouched) return;
    const timer = setTimeout(() => {
      validateRegPhone(regPhone);
    }, 400);
    return () => clearTimeout(timer);
  }, [regPhone, phoneTouched]);

  // Debounced Email Validation (400ms pause)
  useEffect(() => {
    if (!emailTouched) return;
    const timer = setTimeout(() => {
      validateRegEmail(regEmail);
    }, 400);
    return () => clearTimeout(timer);
  }, [regEmail, emailTouched]);

  // Debounced Password Validation (400ms pause)
  useEffect(() => {
    if (!passwordTouched) return;
    const timer = setTimeout(() => {
      validateRegPassword(regPassword);
    }, 400);
    return () => clearTimeout(timer);
  }, [regPassword, passwordTouched]);

  // Submit NGO / Volunteer Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      if (activeMode === 'NGO_LOGIN') {
        await authService.loginNgo(email, password);
      } else {
        await authService.loginVolunteer(email, password);
      }
      if (onLoggedIn) onLoggedIn();
      onClose();
    } catch (err) {
      setLoginError(err.message || 'Login failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Submit Forgot Password Request to Admin
  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    setRecError('');
    setRecSuccess(false);

    if (!recEmail || !recEmail.includes('@')) {
      setRecError('Please enter a valid registered email address.');
      return;
    }
    if (!recPhone || recPhone.length < 10) {
      setRecError('Please enter a valid 10-digit mobile contact phone number.');
      return;
    }

    try {
      storageService.addAccountRecoveryRequest({
        requestType: 'FORGOT_PASSWORD',
        accountRole: recAccountRole,
        name: recName,
        email: recEmail,
        phone: recPhone,
        details: recDetails
      });
      setRecSuccess(true);
    } catch (err) {
      setRecError(err.message || 'Failed to submit recovery request.');
    }
  };

  // Submit Forgot Email Request to Admin
  const handleForgotEmailSubmit = (e) => {
    e.preventDefault();
    setRecError('');
    setRecSuccess(false);

    if (!recName || recName.trim().length < 2) {
      setRecError('Please enter your Organization or Volunteer Name.');
      return;
    }
    if (!recPhone || recPhone.length < 10) {
      setRecError('Please enter your registered contact phone number.');
      return;
    }

    try {
      storageService.addAccountRecoveryRequest({
        requestType: 'FORGOT_EMAIL',
        accountRole: recAccountRole,
        name: recName,
        email: '',
        phone: recPhone,
        details: recDetails
      });
      setRecSuccess(true);
    } catch (err) {
      setRecError(err.message || 'Failed to submit recovery request.');
    }
  };

  // Registration Handler — Direct registration with instant auto-approval & auto-login for NGOs
  const handleDirectRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess(false);

    setPhoneTouched(true);
    setEmailTouched(true);
    setPasswordTouched(true);

    if (!regName || !regPhone || !regEmail || !regPassword) {
      setRegError('Please fill out all required registration fields.');
      return;
    }

    if (!validateRegPhone(regPhone)) {
      setRegError('Invalid Phone Number. Please check the format.');
      return;
    }

    if (!validateRegEmail(regEmail)) {
      setRegError('Invalid Email format. Please enter a valid email address.');
      return;
    }

    if (!validateRegPassword(regPassword)) {
      setRegError('Password too weak! Must be min 8 characters with 1 letter, 1 number, & 1 special symbol.');
      return;
    }

    setIsRegistering(true);
    try {
      const fullPhone = `+91 ${regPhone}`;

      if (regRole === 'NGO') {
        const finalZones = ['Whole Assam (All 35 Districts)'];

        await authService.registerNgo({
          name: regName,
          contactPerson: regName,
          phone: fullPhone,
          email: regEmail,
          logoUrl: regLogoUrl,
          address: regAddress || 'Assam Operational Zone',
          operatingZones: finalZones,
          services: regNgoType,
          showPhone: regShowPhone
        }, regPassword);

        setRegSuccess(true);
      } else {
        authService.registerVolunteer({
          name: regName,
          roleType: regRoleType,
          phone: fullPhone,
          email: regEmail,
          district: 'Jorhat',
          offerings: regAddress || 'Local relief volunteer support',
          showPhone: regShowPhone
        }, regPassword);
        setRegSuccess(true);
      }
    } catch (err) {
      setRegError(err.message || 'Registration failed.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#111827] border border-[#1f2937] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-slide-up">

        {/* ── Modal header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#1f2937] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#3b82f6] rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-black text-white leading-none">
                {activeMode === 'REGISTER' ? 'Create Account' : 'Partner Login'}
              </h2>
              <p className="text-[11px] text-[#6b7280] mt-0.5">
                {activeMode === 'REGISTER'
                  ? 'Join as NGO or Relief Helper'
                  : 'Access the partner portal'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1f2937] hover:bg-[#374151] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Screen toggle — Login / Register ─────────────────────── */}
        <div className="flex gap-0 px-5 pt-4 shrink-0">
          <button
            onClick={() => { setActiveMode('NGO_LOGIN'); setLoginError(''); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-l-xl border transition-all cursor-pointer ${
              activeMode !== 'REGISTER'
                ? 'bg-[#3b82f6] border-[#3b82f6] text-white'
                : 'bg-[#1f2937] border-[#374151] text-[#9ca3af] hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setActiveMode('REGISTER'); setRegError(''); setOtpStep(false); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-r-xl border transition-all cursor-pointer ${
              activeMode === 'REGISTER'
                ? 'bg-[#3b82f6] border-[#3b82f6] text-white'
                : 'bg-[#1f2937] border-[#374151] text-[#9ca3af] hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* ── Scrollable body ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4 space-y-5 min-h-0">

        {/* ══ LOGIN SCREEN ════════════════════════════════════════════ */}
        {(activeMode === 'NGO_LOGIN' || activeMode === 'VOLUNTEER_LOGIN') && (
          <div className="space-y-5">

            {/* Role selector */}
            <div>
              <p className="text-[12px] text-[#9ca3af] font-medium mb-2">Sign in as:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setActiveMode('NGO_LOGIN'); setLoginError(''); }}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                    activeMode === 'NGO_LOGIN'
                      ? 'bg-[#1e3a5f] border-[#3b82f6] text-white'
                      : 'bg-[#1f2937] border-[#374151] text-[#9ca3af] hover:border-[#4b5563]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activeMode === 'NGO_LOGIN' ? 'bg-[#3b82f6]' : 'bg-[#374151]'}`}>
                    <HeartHandshake className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold leading-none">NGO Partner</p>
                    <p className="text-[10px] text-[#9ca3af] mt-0.5">Organization</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveMode('VOLUNTEER_LOGIN'); setLoginError(''); }}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                    activeMode === 'VOLUNTEER_LOGIN'
                      ? 'bg-[#1e3a5f] border-[#3b82f6] text-white'
                      : 'bg-[#1f2937] border-[#374151] text-[#9ca3af] hover:border-[#4b5563]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activeMode === 'VOLUNTEER_LOGIN' ? 'bg-[#3b82f6]' : 'bg-[#374151]'}`}>
                    <UserCheck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold leading-none">Relief Helper</p>
                    <p className="text-[10px] text-[#9ca3af] mt-0.5">Boat, Car, Medical</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Error */}
            {loginError && (
              <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-700/50 rounded-xl text-red-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                {loginError}
              </div>
            )}

            {/* Login form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#d1d5db] mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6b7280] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activeMode === 'NGO_LOGIN' ? 'ngo@organization.org' : 'helper@email.com'}
                    className="w-full bg-[#1f2937] border border-[#374151] rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-[#6b7280] focus:outline-none focus:border-[#3b82f6] transition-colors min-h-[46px]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#d1d5db] mb-1.5">Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#6b7280] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-[#1f2937] border border-[#374151] rounded-xl pl-9 pr-10 py-3 text-sm text-white placeholder-[#6b7280] focus:outline-none focus:border-[#3b82f6] transition-colors min-h-[46px]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-between mt-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setRecAccountRole(activeMode === 'NGO_LOGIN' ? 'NGO' : 'VOLUNTEER');
                      setRecEmail(email || '');
                      setRecError(''); setRecSuccess(false);
                      setActiveMode('FORGOT_PASSWORD');
                    }}
                    className="text-[#3b82f6] hover:text-blue-400 font-medium"
                  >
                    Forgot password?
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRecAccountRole(activeMode === 'NGO_LOGIN' ? 'NGO' : 'VOLUNTEER');
                      setRecError(''); setRecSuccess(false);
                      setActiveMode('FORGOT_EMAIL');
                    }}
                    className="text-[#6b7280] hover:text-[#d1d5db] font-medium"
                  >
                    Forgot email?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 min-h-[48px] mt-2 cursor-pointer"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-[12px] text-[#6b7280]">
              Don't have an account?{' '}
              <button
                onClick={() => { setActiveMode('REGISTER'); setRegError(''); setOtpStep(false); }}
                className="text-[#3b82f6] hover:text-blue-400 font-semibold cursor-pointer"
              >
                Create one
              </button>
            </p>
          </div>
        )}

        {/* ══ REGISTER SCREEN ═════════════════════════════════════════ */}
        {activeMode === 'REGISTER' && (
          <div className="space-y-4">

            {/* Role picker cards */}
            <div>
              <p className="text-[12px] text-[#9ca3af] font-medium mb-2">Register as:</p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => { setRegRole('NGO'); setRegShowPhone(regNgoType.includes('Registered NGO')); }}
                  className={`flex flex-col items-start gap-2 p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                    regRole === 'NGO'
                      ? 'bg-[#1e3a5f] border-[#3b82f6]'
                      : 'bg-[#1f2937] border-[#374151] hover:border-[#4b5563]'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${regRole === 'NGO' ? 'bg-[#3b82f6]' : 'bg-[#374151]'}`}>
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className={`text-[13px] font-bold ${regRole === 'NGO' ? 'text-white' : 'text-[#9ca3af]'}`}>NGO / Org</p>
                    <p className="text-[10px] text-[#6b7280] mt-0.5 leading-snug">Relief organization, food donor, media</p>
                  </div>
                  {regRole === 'NGO' && (
                    <span className="text-[10px] font-bold text-[#3b82f6]">✓ Selected</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setRegRole('VOLUNTEER'); setRegShowPhone(false); }}
                  className={`flex flex-col items-start gap-2 p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                    regRole === 'VOLUNTEER'
                      ? 'bg-[#1e3a5f] border-[#3b82f6]'
                      : 'bg-[#1f2937] border-[#374151] hover:border-[#4b5563]'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${regRole === 'VOLUNTEER' ? 'bg-[#3b82f6]' : 'bg-[#374151]'}`}>
                    <UserCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className={`text-[13px] font-bold ${regRole === 'VOLUNTEER' ? 'text-white' : 'text-[#9ca3af]'}`}>Relief Helper</p>
                    <p className="text-[10px] text-[#6b7280] mt-0.5 leading-snug">Boat owner, 4×4, medical, transport</p>
                  </div>
                  {regRole === 'VOLUNTEER' && (
                    <span className="text-[10px] font-bold text-[#3b82f6]">✓ Selected</span>
                  )}
                </button>
              </div>
            </div>

            {regError && (
              <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-red-200 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {/* SUCCESS STATES */}
            {regSuccess ? (
                <div className="bg-slate-950 border border-amber-500/50 rounded-2xl p-5 space-y-4 text-slate-100 shadow-xl animate-fadeIn">
                  <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider mb-1">
                      Status: Pending Verification
                    </div>
                    <h4 className="text-base font-black text-white leading-tight">
                      Awaiting Admin Approval
                    </h4>
                  </div>
                </div>

                <div className="space-y-3 text-xs leading-relaxed border-t border-b border-slate-800 py-3">
                  <p className="font-semibold text-slate-200">
                    Your <span className="text-blue-400 font-bold">{regRole === 'NGO' ? 'NGO' : 'Relief Helper'}</span> registration for <strong className="text-white">{regName}</strong> has been submitted successfully!
                  </p>
                  
                  <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl space-y-1.5 text-amber-200">
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <ShieldCheck className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                      <span>Approval Pending</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-normal">
                      Your account is sent for approval. Try logging in after sometime.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRegSuccess(false);
                      setActiveMode(regRole === 'NGO' ? 'NGO_LOGIN' : 'VOLUNTEER_LOGIN');
                    }}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Go to Login Screen
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-md"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDirectRegister} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {regRole !== 'NGO' 
                      ? 'Full Name *'
                      : (regNgoType.includes('Individual') || regNgoType.includes('Influencer')) 
                        ? 'Full Name *'
                        : regNgoType.includes('Donor') 
                          ? 'Organization / Full Name *'
                          : 'NGO / Organization Name *'}
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={
                      regRole !== 'NGO'
                        ? 'e.g. Bishal Dutta'
                        : (regNgoType.includes('Individual') || regNgoType.includes('Influencer'))
                          ? 'e.g. Bishal Dutta'
                          : regNgoType.includes('Donor')
                            ? 'e.g. Assam Relief Alliance or Bishal Dutta'
                            : 'e.g. Assam Relief Alliance'
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 min-h-[44px]"
                    required
                  />
                </div>

                {regRole === 'NGO' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Registration Type
                    </label>
                    <select
                      value={regNgoType}
                      onChange={(e) => {
                        const selectedType = e.target.value;
                        setRegNgoType(selectedType);
                        // Only enable showPhone publicly for Registered NGOs; keep OFF for Donors, Influencers, and Individual Helpers
                        if (selectedType.includes('Registered NGO')) {
                          setRegShowPhone(true);
                        } else {
                          setRegShowPhone(false);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-amber-300 focus:outline-none min-h-[44px]"
                      required
                    >
                      <option value="" disabled>-- Select Coordinator / NGO Type * --</option>
                      {NGO_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                )}

                {regRole === 'NGO' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-300 mt-2">
                        Logo Image (Optional)
                      </label>
                      <span className="text-[10px] text-amber-400 font-bold mt-2">
                        JPG/PNG (20 KB - 50 KB)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {regLogoUrl ? (
                        <div className="relative shrink-0 group">
                          <img src={regLogoUrl} alt="Logo preview" className="w-11 h-11 rounded-xl object-cover border-2 border-amber-400" />
                          <button
                            type="button"
                            onClick={handleClearLogo}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95 border border-slate-900"
                            title="Remove selected logo image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-slate-950 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 shrink-0 text-[10px] font-black">
                          LOGO
                        </div>
                      )}

                      <div className="relative flex-1 flex items-center gap-1.5">
                        <input
                          ref={logoFileInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={handleLogoChange}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer min-h-[44px]"
                        />

                        {regLogoUrl && (
                          <button
                            type="button"
                            onClick={handleClearLogo}
                            className="px-2.5 py-2 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shrink-0 transition-colors min-h-[44px]"
                            title="Remove selected image"
                          >
                            <X className="w-4 h-4 text-red-400" />
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {logoError && (
                      <div className="p-2 bg-red-950/40 border border-red-800/60 rounded-xl mt-1.5 flex items-center justify-between gap-2 animate-fadeIn">
                        <p className="text-[11px] font-bold text-red-400 flex items-center gap-1.5">
                          <X className="w-3.5 h-3.5 shrink-0 text-red-400" />
                          <span>{logoError}</span>
                        </p>
                        <button
                          type="button"
                          onClick={() => setLogoError('')}
                          className="text-red-400 hover:text-white p-0.5"
                          title="Dismiss error"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {regRole === 'VOLUNTEER' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Relief Helper Specialty / Role
                    </label>
                    <select
                      value={regRoleType}
                      onChange={(e) => setRegRoleType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-blue-300 focus:outline-none min-h-[44px]"
                      required
                    >
                      <option value="" disabled>-- Select Relief Service Role * --</option>
                      {VOLUNTEER_ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Phone (+91 fixed badge) & Email Input Row */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {regRole === 'NGO' ? 'Official NGO Contact Phone (India +91) *' : 'Mobile Phone (India +91) *'}
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2.5 bg-slate-800 border border-r-0 border-slate-700 rounded-l-xl text-xs font-black text-amber-300 min-h-[44px] flex items-center justify-center shrink-0">
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        value={regPhone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                          setRegPhone(digits);
                          setPhoneTouched(true);
                        }}
                        onBlur={() => setPhoneTouched(true)}
                        placeholder="9864000000 (10 digits)"
                        className={`w-full bg-slate-950 border rounded-r-xl px-3.5 py-2.5 text-xs text-white font-mono tracking-wider focus:outline-none min-h-[44px] ${
                          phoneError ? 'border-red-500 focus:border-red-400' : 'border-slate-700 focus:border-emerald-500'
                        }`}
                        required
                      />
                    </div>
                    {regRole === 'NGO' && (
                      <div className="space-y-1.5 mt-2">
                        <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          <input
                            type="checkbox"
                            checked={regShowPhone}
                            onChange={(e) => setRegShowPhone(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 cursor-pointer"
                            id="regShowPhoneToggle"
                          />
                          <label htmlFor="regShowPhoneToggle" className="text-[11px] font-bold text-slate-200 cursor-pointer">
                            Show phone number publicly in public relief directory
                          </label>
                        </div>
                        <p className="text-[11px] font-semibold leading-normal px-1">
                          {regShowPhone ? (
                            <span className="text-amber-300">Public: Victims & volunteers can view and call your NGO directly.</span>
                          ) : (
                            <span className="text-emerald-300">Protected: Phone number will be hidden from public guests and only visible to verified NGO partners & Control Room.</span>
                          )}
                        </p>
                      </div>
                    )}
                    {/* Live Inline Phone Error */}
                    {phoneError && (
                      <p className="text-[11px] font-bold text-red-400 mt-1 flex items-center gap-1 animate-fadeIn">
                        <span>{phoneError}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      autoComplete="off"
                      name="reg_user_email_address"
                      id="reg_user_email_address"
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        setEmailTouched(true);
                      }}
                      onBlur={() => setEmailTouched(true)}
                      placeholder="email@domain.com"
                      className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none min-h-[44px] ${
                        emailError ? 'border-red-500 focus:border-red-400' : 'border-slate-700 focus:border-emerald-500'
                      }`}
                      required
                    />
                    {/* Live Inline Email Error */}
                    {emailError && (
                      <p className="text-[11px] font-bold text-red-400 mt-1 flex items-center gap-1 animate-fadeIn">
                        <span>{emailError}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-300">
                      Set Account Password *
                    </label>
                    <span className="text-[10px] text-amber-400 font-medium">
                      Min 8 chars (Letter + Number + Symbol @#$)
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      autoComplete="new-password"
                      name="reg_user_password_field"
                      id="reg_user_password_field"
                      value={regPassword}
                      onChange={(e) => {
                        setRegPassword(e.target.value);
                        setPasswordTouched(true);
                      }}
                      onBlur={() => setPasswordTouched(true)}
                      placeholder="e.g. Relief@2026"
                      className={`w-full bg-slate-950 border rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white focus:outline-none min-h-[44px] ${
                        passwordError ? 'border-red-500 focus:border-red-400' : 'border-slate-700 focus:border-emerald-500'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white p-1 rounded-lg focus:outline-none"
                      title={showRegPassword ? "Hide password" : "Show password"}
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Live Inline Password Error */}
                  {passwordError && (
                    <p className="text-[11px] font-bold text-red-400 mt-1 flex items-center gap-1 animate-fadeIn">
                      <span>{passwordError}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full py-3 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[46px]"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>SUBMITTING...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>SUBMIT REGISTRATION FOR APPROVAL</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        )}

        {/* MODE 4: FORGOT PASSWORD REQUEST */}
        {activeMode === 'FORGOT_PASSWORD' && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1 min-h-0 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">Reset Account Password</h3>
                  <p className="text-xs text-slate-400">Send password recovery request to Platform Administrator.</p>
                </div>
              </div>
            </div>

            {recSuccess ? (
              <div className="p-5 bg-slate-900 border border-emerald-500/40 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-black text-white">Request Sent to Admin Desk!</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your password recovery request has been dispatched. Platform Admin will review your details and contact you via Phone/WhatsApp to help recover your login password.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode(recAccountRole === 'NGO' ? 'NGO_LOGIN' : 'VOLUNTEER_LOGIN');
                    setRecSuccess(false);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                {recError && (
                  <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-red-200 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{recError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Account Role *</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setRecAccountRole('NGO')}
                      className={`flex-1 py-2 rounded-lg text-center min-h-[36px] ${recAccountRole === 'NGO' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'}`}
                    >
                      NGO Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecAccountRole('VOLUNTEER')}
                      className={`flex-1 py-2 rounded-lg text-center min-h-[36px] ${recAccountRole === 'VOLUNTEER' ? 'bg-purple-600 text-white font-black' : 'text-slate-400'}`}
                    >
                      Volunteer Account
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Registered Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      value={recEmail}
                      onChange={(e) => setRecEmail(e.target.value)}
                      placeholder="e.g. ngo@organization.org"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[44px]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Contact Phone Number (For Admin to Call/WhatsApp) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      value={recPhone}
                      onChange={(e) => setRecPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500 min-h-[44px]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Organization / Volunteer Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={recName}
                    onChange={(e) => setRecName(e.target.value)}
                    placeholder="e.g. Assam Flood Care Unit"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Additional Details / Verification Note
                  </label>
                  <textarea
                    rows={2}
                    value={recDetails}
                    onChange={(e) => setRecDetails(e.target.value)}
                    placeholder="Any detail to help admin identify your account..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveMode(recAccountRole === 'NGO' ? 'NGO_LOGIN' : 'VOLUNTEER_LOGIN')}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs min-h-[44px]"
                  >
                    Back to Login
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Password Request to Admin</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* MODE 5: FORGOT EMAIL REQUEST */}
        {activeMode === 'FORGOT_EMAIL' && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1 min-h-0 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">Forgot Email Recovery</h3>
                  <p className="text-xs text-slate-400">Request Admin to find and send your registered account email.</p>
                </div>
              </div>
            </div>

            {recSuccess ? (
              <div className="p-5 bg-slate-900 border border-emerald-500/40 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-black text-white">Request Sent to Admin Desk!</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your email recovery request has been sent to Admin. Admin will search records and contact your phone number with your registered email address.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode(recAccountRole === 'NGO' ? 'NGO_LOGIN' : 'VOLUNTEER_LOGIN');
                    setRecSuccess(false);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotEmailSubmit} className="space-y-3">
                {recError && (
                  <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-red-200 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{recError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Account Role *</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setRecAccountRole('NGO')}
                      className={`flex-1 py-2 rounded-lg text-center min-h-[36px] ${recAccountRole === 'NGO' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'}`}
                    >
                      NGO Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecAccountRole('VOLUNTEER')}
                      className={`flex-1 py-2 rounded-lg text-center min-h-[36px] ${recAccountRole === 'VOLUNTEER' ? 'bg-purple-600 text-white font-black' : 'text-slate-400'}`}
                    >
                      Volunteer Account
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Organization / Volunteer Registered Name *
                  </label>
                  <input
                    type="text"
                    value={recName}
                    onChange={(e) => setRecName(e.target.value)}
                    placeholder="e.g. Assam Relief Network / Bishal Dutta"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 min-h-[44px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Registered Mobile Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      value={recPhone}
                      onChange={(e) => setRecPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 min-h-[44px]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    District / Address or Verification Note
                  </label>
                  <textarea
                    rows={2}
                    value={recDetails}
                    onChange={(e) => setRecDetails(e.target.value)}
                    placeholder="e.g. Registered in Jorhat district for boat rescue service..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveMode(recAccountRole === 'NGO' ? 'NGO_LOGIN' : 'VOLUNTEER_LOGIN')}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs min-h-[44px]"
                  >
                    Back to Login
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black rounded-xl text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Email Request to Admin</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
