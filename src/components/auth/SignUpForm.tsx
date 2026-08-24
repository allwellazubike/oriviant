import React, { useState, useMemo } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useLocalization } from '../../contexts/LocalizationContext';

interface CountryCode {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭' },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷' },
];

// Cleared simulated existing emails and phones so real users can register
const REGISTERED_EMAILS: string[] = [];
const REGISTERED_PHONES: string[] = [];

interface SignUpFormProps {
  onSwitchToLogin: () => void;
  onSuccessLogin: (email: string) => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSwitchToLogin, onSuccessLogin }) => {
  const { registerAccount } = useUser();
  const { t } = useLocalization();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Referral
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  // Terms & Updates Checkboxes
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [receiveUpdates, setReceiveUpdates] = useState(true);

  // CAPTCHA Simulation
  const [isHumanVerified, setIsHumanVerified] = useState(false);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [apiError, setApiError] = useState('');

  // Touched field trackers
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const markTouched = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Live Password Validation Requirements
  const passwordRequirements = useMemo(() => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
  }, [password]);

  // Password Strength Score (0 to 4)
  const passwordStrengthScore = useMemo(() => {
    let score = 0;
    if (passwordRequirements.length) score++;
    if (passwordRequirements.uppercase && passwordRequirements.lowercase) score++;
    if (passwordRequirements.number) score++;
    if (passwordRequirements.special) score++;
    return score;
  }, [passwordRequirements]);

  const passwordStrengthLabel = useMemo(() => {
    if (!password) return { text: '', color: 'bg-app-sec', textColor: 'text-app-sec' };
    if (passwordStrengthScore <= 1) return { text: t('signup.strengthWeak'), color: 'bg-red-500', textColor: 'text-red-500' };
    if (passwordStrengthScore === 2) return { text: t('signup.strengthFair'), color: 'bg-amber-500', textColor: 'text-amber-500' };
    if (passwordStrengthScore === 3) return { text: t('signup.strengthGood'), color: 'bg-yellow-500', textColor: 'text-yellow-500' };
    return { text: t('signup.strengthStrong'), color: 'bg-emerald-500', textColor: 'text-emerald-500' };
  }, [password, passwordStrengthScore, t]);

  // Passwords match check
  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return false;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  // Real-time error checks
  const fullNameError = useMemo(() => {
    if (!touched.fullName) return '';
    if (!fullName.trim()) return t('signup.fullNameRequired');
    if (fullName.trim().length < 2) return t('signup.fullNameMin');
    return '';
  }, [fullName, touched.fullName, t]);

  const emailError = useMemo(() => {
    if (!touched.email) return '';
    if (!email.trim()) return t('signup.emailRequired');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return t('signup.emailInvalid');
    if (REGISTERED_EMAILS.includes(email.toLowerCase())) {
      return t('signup.emailTaken');
    }
    return '';
  }, [email, touched.email, t]);

  const phoneError = useMemo(() => {
    if (!touched.phone) return '';
    if (!phoneNumber.trim()) return t('signup.phoneRequired');
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length < 7) return t('signup.phoneInvalid');
    const fullPhone = `${selectedCountry.dialCode}${digitsOnly}`;
    if (REGISTERED_PHONES.includes(fullPhone)) {
      return t('signup.phoneTaken');
    }
    return '';
  }, [phoneNumber, selectedCountry, touched.phone, t]);

  const isPasswordValid = useMemo(() => {
    return (
      passwordRequirements.length &&
      passwordRequirements.uppercase &&
      passwordRequirements.lowercase &&
      passwordRequirements.number &&
      passwordRequirements.special
    );
  }, [passwordRequirements]);

  // Overall Form Validation
  const isFormValid = useMemo(() => {
    return (
      fullName.trim().length >= 2 &&
      !fullNameError &&
      email.trim() &&
      !emailError &&
      phoneNumber.trim() &&
      !phoneError &&
      isPasswordValid &&
      passwordsMatch &&
      agreedTerms &&
      isHumanVerified
    );
  }, [fullName, fullNameError, email, emailError, phoneNumber, phoneError, isPasswordValid, passwordsMatch, agreedTerms, isHumanVerified]);

  // Country Search Filter
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRY_CODES;
    const query = countrySearch.toLowerCase();
    return COUNTRY_CODES.filter(
      c => c.name.toLowerCase().includes(query) || c.dialCode.includes(query) || c.code.toLowerCase().includes(query)
    );
  }, [countrySearch]);

  // Resend Countdown Effect
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isResendDisabled && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    } else if (resendCountdown === 0) {
      setIsResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [isResendDisabled, resendCountdown]);

  const handleResendEmail = () => {
    setIsResendDisabled(true);
    setResendCountdown(60);
    setResendMessage(t('signup.resendDispatched'));
    setTimeout(() => setResendMessage(''), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true
    });

    if (!isFormValid) return;

    setIsSubmitting(true);
    
    // Connect to the real backend API via UserContext
    const success = await registerAccount({
      email,
      password,
      nickname: fullName
    });

    setIsSubmitting(false);
    
    if (success) {
      setIsVerificationStep(true);
    } else {
      setApiError(t('signup.registrationFailed'));
    }
  };

  // If in Email Verification Step
  if (isVerificationStep) {
    return (
      <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-bounce">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        {/* Title */}
        <div>
          <h3 className="text-xl font-black text-app">
            {t('signup.accountCreated')}
          </h3>
          <p className="text-xs text-app-sec mt-1.5 leading-relaxed max-w-sm mx-auto">
            {t('signup.verificationSentPrefix')}{' '}
            <span className="font-bold text-accent">{email}</span>.
            {' '}{t('signup.verificationSentSuffix')}
          </p>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-2xl bg-app-sec/60 border border-app text-left space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-app">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{t('signup.verificationInstructions')}</span>
          </div>
          <p className="text-app-sec text-[11px] leading-relaxed">
            {t('signup.instructionsLine1')}<br />
            {t('signup.instructionsLine2')}<br />
            {t('signup.instructionsLine3')}
          </p>
        </div>

        {resendMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold animate-in fade-in">
            {resendMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={() => {
              window.open(`mailto:${email}`, '_blank');
            }}
            className="w-full py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>{t('signup.openEmailApp')}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isResendDisabled}
              onClick={handleResendEmail}
              className="w-full py-2.5 rounded-xl bg-app-sec hover:bg-app-sec/80 text-app font-semibold text-xs border border-app transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResendDisabled ? 'animate-spin' : ''}`} />
              <span>
                {isResendDisabled ? `${t('signup.resendCountdown')} (${resendCountdown}s)` : t('signup.resendEmail')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsVerificationStep(false)}
              className="w-full py-2.5 rounded-xl bg-app-sec hover:bg-app-sec/80 text-app-sec hover:text-app font-semibold text-xs border border-app transition-all cursor-pointer"
            >
              {t('signup.changeEmail')}
            </button>
          </div>

          <button
            type="button"
            onClick={() => onSuccessLogin(email)}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <span>{t('signup.proceedToLogin')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header Info */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-xs font-bold text-accent tracking-widest uppercase">
            {t('signup.exchange')}
          </span>
        </div>
        <h2 className="text-2xl font-black text-app tracking-tight">
          {t('signup.createAccount')}
        </h2>
        <p className="text-xs font-semibold text-accent">
          {t('signup.tagline')}
        </p>
        <p className="text-xs text-app-sec max-w-sm mx-auto pt-1">
          {t('signup.joinDesc')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-app-sec mb-1">
            {t('signup.fullName')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-app-sec absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => markTouched('fullName')}
              placeholder="e.g. Alex Vance"
              className={`w-full bg-app-sec border ${
                fullNameError ? 'border-red-500' : 'border-app'
              } rounded-xl pl-10 pr-4 py-2.5 text-xs text-app focus:outline-none focus:border-accent transition-colors`}
            />
          </div>
          {fullNameError && (
            <p className="text-[10px] text-red-500 font-medium mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{fullNameError}</span>
            </p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold text-app-sec mb-1">
            {t('auth.emailAddress')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-app-sec absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => markTouched('email')}
              placeholder="Enter your email"
              className={`w-full bg-app-sec border ${
                emailError ? 'border-red-500' : 'border-app'
              } rounded-xl pl-10 pr-4 py-2.5 text-xs text-app focus:outline-none focus:border-accent transition-colors`}
            />
          </div>
          {emailError && (
            <p className="text-[10px] text-red-500 font-medium mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{emailError}</span>
            </p>
          )}
        </div>

        {/* Phone Number with Country Code Selector */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-app-sec">
              {t('signup.phoneNumber')} <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-app-sec">{t('signup.autoDetected')} {selectedCountry.name}</span>
          </div>

          <div className="flex gap-2 relative">
            
            {/* Country Selector Dropdown Trigger */}
            <button
              type="button"
              onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-app-sec border border-app rounded-xl text-xs text-app font-semibold hover:border-accent transition-colors shrink-0"
            >
              <span>{selectedCountry.flag}</span>
              <span>{selectedCountry.dialCode}</span>
              <ChevronDown className="w-3.5 h-3.5 text-app-sec" />
            </button>

            {/* Phone Number Input */}
            <div className="relative flex-1">
              <Phone className="w-4 h-4 text-app-sec absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onBlur={() => markTouched('phone')}
                placeholder="Enter your phone number"
                className={`w-full bg-app-sec border ${
                  phoneError ? 'border-red-500' : 'border-app'
                } rounded-xl pl-10 pr-4 py-2.5 text-xs text-app focus:outline-none focus:border-accent transition-colors`}
              />
            </div>

            {/* Country Selector Popover */}
            {isCountryDropdownOpen && (
              <div className="absolute top-12 left-0 z-30 w-72 bg-app-card border border-app rounded-2xl shadow-2xl p-2 animate-in fade-in duration-150">
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder={t('signup.searchCountry')}
                  className="w-full bg-app-sec border border-app rounded-xl px-3 py-1.5 text-xs text-app mb-2 focus:outline-none focus:border-accent"
                />
                <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(country);
                        setIsCountryDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-app-sec transition-colors text-left ${
                        selectedCountry.code === country.code ? 'bg-accent/10 font-bold text-accent' : 'text-app'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </div>
                      <span className="text-app-sec font-mono">{country.dialCode}</span>
                    </button>
                  ))}
                  {filteredCountries.length === 0 && (
                    <p className="text-xs text-app-sec text-center py-3">{t('signup.noMatchingCountry')}</p>
                  )}
                </div>
              </div>
            )}

          </div>
          {phoneError && (
            <p className="text-[10px] text-red-500 font-medium mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{phoneError}</span>
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-app-sec">
              {t('signup.password')} <span className="text-red-500">*</span>
            </label>
            {password && (
              <span className={`text-[10px] font-extrabold ${passwordStrengthLabel.textColor}`}>
                {t('signup.strength')}: {passwordStrengthLabel.text}
              </span>
            )}
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 text-app-sec absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => markTouched('password')}
              placeholder="••••••••••••"
              className="w-full bg-app-sec border border-app rounded-xl pl-10 pr-10 py-2.5 text-xs text-app focus:outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-app-sec hover:text-app"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Meter Bar */}
          {password && (
            <div className="mt-2 space-y-1.5">
              <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                <div className={`h-full rounded-full transition-colors ${passwordStrengthScore >= 1 ? passwordStrengthLabel.color : 'bg-app-sec'}`} />
                <div className={`h-full rounded-full transition-colors ${passwordStrengthScore >= 2 ? passwordStrengthLabel.color : 'bg-app-sec'}`} />
                <div className={`h-full rounded-full transition-colors ${passwordStrengthScore >= 3 ? passwordStrengthLabel.color : 'bg-app-sec'}`} />
                <div className={`h-full rounded-full transition-colors ${passwordStrengthScore >= 4 ? passwordStrengthLabel.color : 'bg-app-sec'}`} />
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-2.5 rounded-xl bg-app-sec/50 border border-app/60 grid grid-cols-2 gap-1.5 text-[10px]">
                <div className={`flex items-center gap-1.5 ${passwordRequirements.length ? 'text-emerald-500 font-semibold' : 'text-app-sec'}`}>
                  {passwordRequirements.length ? <Check className="w-3 h-3 shrink-0" /> : <X className="w-3 h-3 shrink-0 opacity-40" />}
                  <span>{t('signup.min8Chars')}</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordRequirements.uppercase ? 'text-emerald-500 font-semibold' : 'text-app-sec'}`}>
                  {passwordRequirements.uppercase ? <Check className="w-3 h-3 shrink-0" /> : <X className="w-3 h-3 shrink-0 opacity-40" />}
                  <span>{t('signup.uppercaseLetter')}</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordRequirements.lowercase ? 'text-emerald-500 font-semibold' : 'text-app-sec'}`}>
                  {passwordRequirements.lowercase ? <Check className="w-3 h-3 shrink-0" /> : <X className="w-3 h-3 shrink-0 opacity-40" />}
                  <span>{t('signup.lowercaseLetter')}</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordRequirements.number ? 'text-emerald-500 font-semibold' : 'text-app-sec'}`}>
                  {passwordRequirements.number ? <Check className="w-3 h-3 shrink-0" /> : <X className="w-3 h-3 shrink-0 opacity-40" />}
                  <span>{t('signup.oneNumber')}</span>
                </div>
                <div className={`flex items-center gap-1.5 col-span-2 ${passwordRequirements.special ? 'text-emerald-500 font-semibold' : 'text-app-sec'}`}>
                  {passwordRequirements.special ? <Check className="w-3 h-3 shrink-0" /> : <X className="w-3 h-3 shrink-0 opacity-40" />}
                  <span>{t('signup.oneSpecialChar')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-app-sec">
              {t('signup.confirmPassword')} <span className="text-red-500">*</span>
            </label>
            {confirmPassword && (
              <span className={`text-[10px] font-bold flex items-center gap-1 ${passwordsMatch ? 'text-emerald-500' : 'text-red-500'}`}>
                {passwordsMatch ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>{t('signup.passwordsMatch')}</span>
                  </>
                ) : (
                  <>
                    <X className="w-3 h-3" />
                    <span>{t('signup.passwordsNoMatch')}</span>
                  </>
                )}
              </span>
            )}
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 text-app-sec absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => markTouched('confirmPassword')}
              placeholder={t('signup.reenterPassword')}
              className={`w-full bg-app-sec border ${
                confirmPassword && !passwordsMatch ? 'border-red-500' : 'border-app'
              } rounded-xl pl-10 pr-10 py-2.5 text-xs text-app focus:outline-none focus:border-accent`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-app-sec hover:text-app"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Referral Code Section */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsReferralOpen(!isReferralOpen)}
            className="flex items-center justify-between w-full text-xs font-semibold text-accent hover:underline py-1"
          >
            <span>{t('signup.haveReferralCode')}</span>
            {isReferralOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isReferralOpen && (
            <div className="mt-2 animate-in fade-in duration-150">
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder={t('signup.enterCode')}
                className="w-full bg-app-sec border border-app rounded-xl px-3 py-2 text-xs text-app font-mono focus:outline-none focus:border-accent"
              />
              <p className="text-[10px] text-app-sec mt-1">
                {t('signup.referralBonus')}
              </p>
            </div>
          )}
        </div>

        {/* CAPTCHA / Anti-Bot Security Checkbox */}
        <div className="p-3 rounded-2xl bg-app-sec/60 border border-app flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isHumanVerified}
              onChange={(e) => setIsHumanVerified(e.target.checked)}
              className="w-4 h-4 rounded text-accent focus:ring-accent cursor-pointer"
            />
            <span className="text-xs font-semibold text-app">{t('signup.imHuman')}</span>
          </label>
          <div className="flex items-center gap-1 text-[10px] text-app-sec font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Turnstile</span>
          </div>
        </div>

        {/* Terms & Conditions Checkboxes */}
        <div className="space-y-2 pt-1 text-[11px] text-app-sec">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 rounded text-accent focus:ring-accent shrink-0"
            />
            <span>
              {t('signup.agreeTermsPrefix')}{' '}
              <a href="#terms" onClick={(e) => e.preventDefault()} className="text-accent underline font-semibold">
                {t('signup.termsOfService')}
              </a>{' '}
              {t('signup.and')}{' '}
              <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-accent underline font-semibold">
                {t('signup.privacyPolicy')}
              </a>
              . <span className="text-red-500">*</span>
            </span>
          </label>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={receiveUpdates}
              onChange={(e) => setReceiveUpdates(e.target.checked)}
              className="mt-0.5 rounded text-accent focus:ring-accent shrink-0"
            />
            <span>{t('signup.receiveUpdates')}</span>
          </label>
        </div>

        {/* API Error Display */}
        {apiError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold animate-in fade-in">
            {apiError}
          </div>
        )}

        {/* Create Account Button */}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-extrabold text-xs shadow-lg shadow-accent/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-3"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>{t('signup.creatingAccount')}</span>
            </>
          ) : (
            <>
              <span>{t('welcome.createAccount')}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </form>

      {/* Social Login Divider & Button */}
      <div className="space-y-3 pt-1">
        <div className="relative flex items-center justify-center">
          <div className="border-t border-app w-full" />
          <span className="bg-app-card px-3 text-[10px] font-bold text-app-sec tracking-widest uppercase absolute">
            {t('auth.or')}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onSuccessLogin('google.user@oriviant.io')}
          className="w-full py-2.5 px-4 rounded-xl bg-app-sec hover:bg-app-sec/80 text-app font-bold text-xs border border-app shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer"
        >
          {/* Google Logo SVG */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{t('auth.continueWithGoogle')}</span>
        </button>
      </div>

      {/* Footer Switch to Login */}
      <div className="pt-2 border-t border-app text-center">
        <p className="text-xs text-app-sec">
          {t('signup.alreadyHaveAccount')}{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-extrabold text-accent hover:underline cursor-pointer"
          >
            {t('welcome.logIn')}
          </button>
        </p>
      </div>

    </div>
  );
};