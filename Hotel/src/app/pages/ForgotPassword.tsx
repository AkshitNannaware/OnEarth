import React, { useState } from 'react';
import { Mail, ArrowLeft, Lock, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { score, label: 'Weak', color: '#ef4444' };
  if (score <= 3) return { score, label: 'Medium', color: '#f59e0b' };
  return { score, label: 'Strong', color: '#22c55e' };
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:5000';

  const requestOtp = async () => {
    if (!identifier.trim()) {
      toast.error('Please enter your email or phone number.');
      return;
    }
    setIsSending(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || `Request failed (${response.status})`);
      }
      toast.success('OTP sent. Please check your email or phone.');
      setStep('verify');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to send OTP.');
    } finally {
      setIsSending(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) {
      toast.error('Please enter the OTP.');
      return;
    }
    setIsSending(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || `Request failed (${response.status})`);
      }
      const data = await response.json();
      setResetToken(data.resetToken);
      toast.success('OTP verified. Please set your new password.');
      setStep('reset');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to verify OTP.');
    } finally {
      setIsSending(false);
    }
  };

  const resetPassword = async () => {
    // Validate new password
    if (!newPassword) {
      setPasswordError('Please enter a new password.');
      return;
    }
    if (!PASSWORD_PATTERN.test(newPassword)) {
      setPasswordError('Min 8 chars with at least one uppercase, lowercase & number.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      return;
    }
    setPasswordError('');
    setConfirmError('');
    setIsSending(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, resetToken, newPassword }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || `Request failed (${response.status})`);
      }
      toast.success('Password updated successfully. You can log in now.');
      setIdentifier('');
      setOtp('');
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
      setStep('request');
      navigate('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to reset password.');
    } finally {
      setIsSending(false);
    }
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#3f4a40] text-[#efece6] px-4">
      <div className="w-full max-w-md bg-[#232b23]/95 rounded-3xl shadow-2xl p-10 border border-[#5b6659]">
        <Button variant="ghost" className="mb-6 text-[#efece6] hover:bg-[#2e362e]" onClick={() => navigate('/login')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Button>

        <h1 className="text-3xl mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Forgot Password</h1>
        <p className="text-[#cfc9bb] mb-6">
          Enter your email or phone number. We will send an OTP to verify your identity.
        </p>

        <div className="space-y-5">
          {/* Email / Phone */}
          <div>
            <Label htmlFor="identifier" className="text-[#efece6]">Email or Phone</Label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b6b6b6]" />
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. user@example.com or 9876543210"
                className="pl-10 h-12 rounded-xl border-2 border-[#3a463a] bg-[#2e362e] text-[#efece6] placeholder:text-[#b6b6b6] focus:ring-amber-400"
                disabled={step !== 'request'}
                required
              />
            </div>
          </div>

          {/* OTP */}
          {step === 'verify' && (
            <div>
              <Label htmlFor="otp" className="text-[#efece6]">OTP</Label>
              <div className="relative mt-2">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b6b6b6]" />
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter the OTP sent to you"
                  className="pl-10 h-12 rounded-xl border-2 border-[#3a463a] bg-[#2e362e] text-[#efece6] placeholder:text-[#b6b6b6] focus:ring-amber-400"
                  required
                />
              </div>
            </div>
          )}

          {/* Reset Password */}
          {step === 'reset' && (
            <>
              {/* New Password */}
              <div>
                <Label htmlFor="new-password" className="text-[#efece6]">New Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b6b6b6]" />
                  <Input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
                    onBlur={() => {
                      if (newPassword && !PASSWORD_PATTERN.test(newPassword))
                        setPasswordError('Min 8 chars with at least one uppercase, lowercase & number.');
                    }}
                    placeholder="Min 8 chars, uppercase, lowercase & number"
                    className={`pl-10 pr-12 h-12 rounded-xl border-2 bg-[#2e362e] text-[#efece6] placeholder:text-[#b6b6b6] focus:ring-amber-400 ${passwordError ? 'border-red-500' : 'border-[#3a463a]'}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b6b6b6] hover:text-[#efece6]"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-sm text-red-400 mt-1">{passwordError}</p>
                )}
                {/* Strength meter */}
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                          style={{ backgroundColor: i <= strength.score ? strength.color : '#3a463a' }} />
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: strength.color }}>
                      Password strength: <span className="font-semibold">{strength.label}</span>
                      {strength.label !== 'Strong' && (
                        <span className="text-[#8a9e87]"> — add uppercase, numbers & special chars</span>
                      )}
                    </p>
                  </div>
                )}
                {!newPassword && (
                  <p className="text-xs text-[#8a9e87] mt-1">Min 8 chars with uppercase, lowercase & number</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirm-password" className="text-[#efece6]">Confirm Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b6b6b6]" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setConfirmError(''); }}
                    onBlur={() => {
                      if (confirmPassword && confirmPassword !== newPassword)
                        setConfirmError('Passwords do not match.');
                    }}
                    placeholder="Re-enter your new password"
                    className={`pl-10 pr-12 h-12 rounded-xl border-2 bg-[#2e362e] text-[#efece6] placeholder:text-[#b6b6b6] focus:ring-amber-400 ${confirmError ? 'border-red-500' : 'border-[#3a463a]'}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b6b6b6] hover:text-[#efece6]"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmError && (
                  <p className="text-sm text-red-400 mt-1">{confirmError}</p>
                )}
                {confirmPassword && !confirmError && confirmPassword === newPassword && (
                  <p className="text-xs text-green-400 mt-1">✓ Passwords match</p>
                )}
              </div>
            </>
          )}

          {step === 'request' && (
            <Button type="button" className="w-full h-12 rounded-xl bg-[#243026] border border-[#5b6659] text-[#efece6] hover:bg-white/10" disabled={isSending} onClick={requestOtp}>
              {isSending ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          )}

          {step === 'verify' && (
            <div className="space-y-3">
              <Button type="button" className="w-full h-12 rounded-xl bg-[#243026] border border-[#5b6659] text-[#efece6] hover:bg-white/10" disabled={isSending} onClick={verifyOtp}>
                {isSending ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 rounded-xl bg-[#2e362e] border border-[#3a463a] text-[#efece6] hover:bg-white/10"
                disabled={isSending}
                onClick={requestOtp}
              >
                Resend OTP
              </Button>
            </div>
          )}

          {step === 'reset' && (
            <Button type="button" className="w-full h-12 rounded-xl bg-[#243026] border border-[#5b6659] text-[#efece6] hover:bg-white/10" disabled={isSending} onClick={resetPassword}>
              {isSending ? 'Updating...' : 'Update Password'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
