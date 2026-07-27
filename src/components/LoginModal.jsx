import React, { useState, useEffect } from 'react';
import { X, Lock, Key, ShieldCheck, HeartHandshake, Mail, UserCheck, AlertTriangle, ArrowRight, CheckCircle2, Building2, Send, Hash, Phone } from 'lucide-react';
import { authService } from '../services/authService';
import { securityService } from '../services/securityService';

export default function LoginModal({ onClose, onLoggedIn }) {
  const [activeMode, setActiveMode] = useState('NGO_LOGIN'); // 'NGO_LOGIN' | 'VOLUNTEER_LOGIN' | 'REGISTER'
  
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
  const [regRoleType, setRegRoleType] = useState('🚤 Free Motorboat / Rescue Boat Service');
  const [regLogoUrl, setRegLogoUrl] = useState('');
  const [logoError, setLogoError] = useState('');
  
  // Live Inline Error States
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // OTP Verification state
  const [otpStep, setOtpStep] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  
  const [regSuccess, setRegSuccess] = useState('');
  const [regError, setRegError] = useState('');

  // Debounced Phone Validation (400ms pause)
  useEffect(() => {
    if (!phoneTouched) return;
    const timer = setTimeout(() => {
      if (!regPhone) {
        setPhoneError('⚠️ Phone number is required.');
      } else if (regPhone.length !== 10) {
        setPhoneError(`⚠️ Phone number must be exactly 10 digits (${regPhone.length}/10).`);
      } else if (!/^[6-9]\d{9}$/.test(regPhone)) {
        setPhoneError('⚠️ Must be a valid Indian mobile number starting with 6, 7, 8, or 9.');
      } else {
        setPhoneError('');
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [regPhone, phoneTouched]);

  // Debounced Email Validation (400ms pause)
  useEffect(() => {
    if (!emailTouched) return;
    const timer = setTimeout(() => {
      if (!regEmail) {
        setEmailError('⚠️ Email address is required.');
      } else if (!securityService.validateEmail(regEmail)) {
        setEmailError('⚠️ Please enter a valid email format (e.g. name@domain.com).');
      } else {
        setEmailError('');
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [regEmail, emailTouched]);

  // Debounced Password Validation (400ms pause)
  useEffect(() => {
    if (!passwordTouched) return;
    const timer = setTimeout(() => {
      if (!regPassword) {
        setPasswordError('⚠️ Password is required.');
      } else if (!securityService.validatePassword(regPassword)) {
        setPasswordError('⚠️ Must be min 8 chars with 1 letter, 1 number, & 1 symbol (@#$%).');
      } else {
        setPasswordError('');
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [regPassword, passwordTouched]);

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

  // Step 1 of Registration: Validate fields & Send 6-Digit Email OTP
  const handleRequestOtp = (e) => {
    e.preventDefault();
    setRegError('');

    setPhoneTouched(true);
    setEmailTouched(true);
    setPasswordTouched(true);

    if (!regName || !regPhone || !regEmail || !regPassword) {
      setRegError('Please fill out all required registration fields.');
      return;
    }

    if (regPhone.length !== 10 || !/^[6-9]\d{9}$/.test(regPhone)) {
      setPhoneError('⚠️ Must be a valid 10-digit Indian mobile number starting with 6-9.');
      setRegError('Invalid Phone Number. Must be exactly 10 digits (+91).');
      return;
    }

    if (!securityService.validateEmail(regEmail)) {
      setEmailError('⚠️ Please enter a valid email address (e.g. name@domain.com).');
      setRegError('Invalid Email format. Please enter a valid email address.');
      return;
    }

    if (!securityService.validatePassword(regPassword)) {
      setPasswordError('⚠️ Must be min 8 chars with 1 letter, 1 number, & 1 symbol (@#$%).');
      setRegError('Password too weak! Must be min 8 characters with 1 letter, 1 number, & 1 special symbol.');
      return;
    }

    try {
      const fullPhone = `+91 ${regPhone}`;
      const res = authService.generateEmailOtp(regEmail);
      setGeneratedOtp(res.code);
      setOtpStep(true);
    } catch (err) {
      setRegError(err.message || 'Failed to generate OTP.');
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    setLogoError('');
    if (!file) return;

    const result = securityService.validateLogoFile(file);
    if (!result.valid) {
      setLogoError(result.error);
      setRegLogoUrl('');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setRegLogoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Step 2 of Registration: Verify OTP and Register Account
  const handleVerifyOtpAndRegister = (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    try {
      // Verify OTP code
      authService.verifyEmailOtp(regEmail, otpInput);

      const fullPhone = `+91 ${regPhone}`;

      // Register based on role
      if (regRole === 'NGO') {
        authService.registerNgo({
          name: regName,
          contactPerson: regName,
          phone: fullPhone,
          email: regEmail,
          logoUrl: regLogoUrl,
          address: regAddress || 'Assam Operational Zone',
          operatingZones: ['Jorhat', 'Sivasagar', 'Lakhimpur']
        }, regPassword);
      } else {
        authService.registerVolunteer({
          name: regName,
          roleType: regRoleType,
          phone: fullPhone,
          email: regEmail,
          district: 'Jorhat',
          offerings: regAddress || 'Local relief volunteer support'
        }, regPassword);
      }

      setRegSuccess(`✅ Email Verified! Account registered successfully. You can now log in.`);
      setTimeout(() => {
        setActiveMode(regRole === 'NGO' ? 'NGO_LOGIN' : 'VOLUNTEER_LOGIN');
        setRegSuccess('');
        setOtpStep(false);
      }, 3000);

    } catch (err) {
      setRegError(err.message || 'OTP Verification failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4 text-slate-100 relative max-h-[92vh] flex flex-col justify-between my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-black shrink-0">
          <button
            type="button"
            onClick={() => { setActiveMode('NGO_LOGIN'); setLoginError(''); }}
            className={`flex-1 py-2.5 px-2 rounded-xl min-h-[40px] transition-all flex items-center justify-center gap-1 text-[11px] sm:text-xs truncate ${
              activeMode === 'NGO_LOGIN'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">NGO Login</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveMode('VOLUNTEER_LOGIN'); setLoginError(''); }}
            className={`flex-1 py-2.5 px-2 rounded-xl min-h-[40px] transition-all flex items-center justify-center gap-1 text-[11px] sm:text-xs truncate ${
              activeMode === 'VOLUNTEER_LOGIN'
                ? 'bg-purple-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Volunteer</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveMode('REGISTER'); setRegError(''); setOtpStep(false); }}
            className={`flex-1 py-2.5 px-2 rounded-xl min-h-[40px] transition-all flex items-center justify-center gap-1 text-[11px] sm:text-xs truncate ${
              activeMode === 'REGISTER'
                ? 'bg-emerald-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Register</span>
          </button>
        </div>

        {/* MODE 1: NGO LOGIN */}
        {activeMode === 'NGO_LOGIN' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Verified NGO Portal Login</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Log in to post verified relief dispatches directly to the live request timeline.
              </p>
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
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ngo@organization.org"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-3 text-sm text-white focus:outline-none focus:border-amber-500 min-h-[44px]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-3 text-sm text-white focus:outline-none focus:border-amber-500 min-h-[44px]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[46px]"
              >
                <Lock className="w-4 h-4" />
                <span>LOG IN TO NGO PORTAL</span>
              </button>
            </form>
          </div>
        )}

        {/* MODE 2: VOLUNTEER LOGIN */}
        {activeMode === 'VOLUNTEER_LOGIN' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-400" />
                <span>Volunteer Account Login</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Log in to manage free boat rescue dispatches, transport, or medical kits.
              </p>
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
                  Volunteer Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="volunteer@email.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-3 text-sm text-white focus:outline-none focus:border-purple-500 min-h-[44px]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-3 text-sm text-white focus:outline-none focus:border-purple-500 min-h-[44px]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[46px]"
              >
                <Lock className="w-4 h-4" />
                <span>LOG IN AS VOLUNTEER</span>
              </button>
            </form>
          </div>
        )}

        {/* MODE 3: REGISTER + LIVE INLINE VALIDATION & AUTOMATIC +91 PREFIX */}
        {activeMode === 'REGISTER' && (
          <div className="space-y-3 overflow-y-auto pr-1">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">Register NGO or Volunteer Profile</h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Register your account so citizens, flood victims, and rescue teams can contact you directly via Call & WhatsApp.
              </p>
            </div>

            {/* Account Type Selector */}
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setRegRole('NGO')}
                className={`flex-1 py-2 rounded-lg text-center min-h-[36px] ${regRole === 'NGO' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'}`}
              >
                NGO Account
              </button>
              <button
                type="button"
                onClick={() => setRegRole('VOLUNTEER')}
                className={`flex-1 py-2 rounded-lg text-center min-h-[36px] ${regRole === 'VOLUNTEER' ? 'bg-purple-600 text-white font-black' : 'text-slate-400'}`}
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
              <form onSubmit={handleRequestOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {regRole === 'NGO' ? 'NGO / Organization Name *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={regRole === 'NGO' ? 'e.g. Assam Relief Alliance' : 'e.g. Bishal Dutta'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 min-h-[44px]"
                    required
                  />
                </div>

                {regRole === 'NGO' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-300">
                        NGO Logo Image (Optional)
                      </label>
                      <span className="text-[10px] text-amber-400 font-bold">
                        JPG/PNG (20 KB - 50 KB)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {regLogoUrl ? (
                        <img src={regLogoUrl} alt="Logo preview" className="w-11 h-11 rounded-xl object-cover border border-amber-400 shrink-0" />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-slate-950 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 shrink-0 text-[10px] font-black">
                          LOGO
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleLogoChange}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer min-h-[44px]"
                      />
                    </div>

                    {logoError && (
                      <p className="text-[11px] font-bold text-red-400 mt-1 flex items-center gap-1 animate-fadeIn">
                        <span>{logoError}</span>
                      </p>
                    )}
                  </div>
                )}

                {regRole === 'VOLUNTEER' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Volunteer Role Type
                    </label>
                    <select
                      value={regRoleType}
                      onChange={(e) => setRegRoleType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-amber-300 focus:outline-none min-h-[44px]"
                    >
                      <option value="🚤 Free Motorboat / Rescue Boat Service">🚤 Free Motorboat / Rescue Boat Service</option>
                      <option value="🚗 Free Car / SUV / 4x4 Transport Service">🚗 Free Car / SUV / 4x4 Transport Service</option>
                      <option value="🚚 Free Goods Truck / Pickup Van">🚚 Free Goods Truck / Pickup Van</option>
                      <option value="🩺 Free Medical Doctor / Paramedic">🩺 Free Medical Doctor / Paramedic</option>
                      <option value="📦 Free Food & Water Supply Donor">📦 Free Food & Water Supply Donor</option>
                      <option value="📢 Social Media Influencer / Fundraiser">📢 Social Media Influencer / Fundraiser</option>
                    </select>
                  </div>
                )}

                {/* Phone (+91 fixed badge) & Email Input Row */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Mobile Phone (India +91) *
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
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      setPasswordTouched(true);
                    }}
                    onBlur={() => setPasswordTouched(true)}
                    placeholder="e.g. Relief@2026"
                    className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none min-h-[44px] ${
                      passwordError ? 'border-red-500 focus:border-red-400' : 'border-slate-700 focus:border-emerald-500'
                    }`}
                    required
                  />
                  {/* Live Inline Password Error */}
                  {passwordError && (
                    <p className="text-[11px] font-bold text-red-400 mt-1 flex items-center gap-1 animate-fadeIn">
                      <span>{passwordError}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs sm:text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[46px]"
                >
                  <Send className="w-4 h-4" />
                  <span>GENERATE & SEND 6-DIGIT EMAIL OTP</span>
                </button>
              </form>
            )}

            {/* STEP 2: ENTER 6-DIGIT EMAIL OTP CODE */}
            {otpStep && !regSuccess && (
              <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4 pt-1">
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl space-y-1 text-xs text-emerald-200">
                  <div className="flex items-center gap-2 font-bold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>6-Digit Email OTP Dispatched!</span>
                  </div>
                  <p className="text-slate-300">
                    Enter the 6-digit verification code sent to <strong className="text-white">{regEmail}</strong>:
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Enter 6-Digit Verification OTP Code *
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="e.g. 582910"
                      className="w-full bg-slate-950 border-2 border-emerald-500/60 rounded-xl pl-9 pr-3.5 py-3 text-base font-mono font-black text-white tracking-widest text-center focus:outline-none focus:border-emerald-400 min-h-[44px]"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOtpStep(false)}
                    className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs min-h-[44px]"
                  >
                    Edit Info
                  </button>

                  <button
                    type="submit"
                    className="flex-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl text-xs shadow-lg flex items-center justify-center gap-1.5 min-h-[44px]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>VERIFY & CREATE ACCOUNT</span>
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
