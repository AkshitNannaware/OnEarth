import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

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

const API_BASE = (import.meta.env?.VITE_API_URL as string | undefined) || 'http://localhost:5000';

const AdminSignup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    secret: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const validationPatterns = {
    name: /^[a-zA-Z\s]{2,50}$/,
    email: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
    phone: /^\+?[0-9]{10,15}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (!validationPatterns.name.test(value))
          return 'Name must be 2–50 characters, letters and spaces only';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!validationPatterns.email.test(value))
          return 'Enter a valid email (e.g. admin@example.com)';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!validationPatterns.phone.test(value))
          return 'Enter a valid phone number (10–15 digits, optional + prefix)';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (!validationPatterns.password.test(value))
          return 'Min 8 chars with at least one uppercase, lowercase & number';
        return '';
      case 'secret':
        if (!value.trim()) return 'Admin secret/invite code is required';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'confirmPassword') return;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: '' }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow digits and leading +
    let value = e.target.value.replace(/[^\d+]/g, '');
    // Only allow + at the start
    if (value.indexOf('+') > 0) value = value.replace(/\+/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    setFormData(prev => ({ ...prev, phone: value }));
    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const error = validateField(id, value);
    if (error) setErrors(prev => ({ ...prev, [id]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/admin-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
          secret: formData.secret.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || 'Failed to sign up.');
        setIsLoading(false);
        return;
      }
      if (data.token) {
        localStorage.setItem('auth', JSON.stringify({ token: data.token, user: data.user }));
        toast.success('Admin account created!');
        navigate('/login');
      } else {
        toast.error('No token received.');
      }
    } catch (err) {
      toast.error('Failed to sign up.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#3f4a40] text-[#efece6] px-4">
      <div className="w-full max-w-lg bg-[#232b23]/95 rounded-3xl shadow-2xl p-12 border border-[#5b6659]">
        <h1 className="text-3xl font-bold text-center mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Admin Signup</h1>
        <p className="text-center text-[#cfc9bb] mb-8 text-lg">
          Create an admin account with your invite code
        </p>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-[#efece6]">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`mt-2 h-14 rounded-xl border-2 border-[#3a463a] bg-[#2e362e] text-[#efece6] placeholder:text-[#b6b6b6] text-lg px-5 focus:ring-2 focus:ring-amber-400 ${errors.name ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-[#efece6]">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. admin@example.com"
              className={`mt-2 h-14 rounded-xl border-2 bg-[#2e362e] text-[#efece6] placeholder:text-[#b6b6b6] text-lg px-5 focus:ring-2 focus:ring-amber-400 ${errors.email ? 'border-red-500' : 'border-[#3a463a]'}`}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-400 mt-1">{errors.email}</p>
            )}
          </div>
          {/* Phone */}
          <div>
            <Label htmlFor="phone" className="text-[#efece6]">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              onBlur={handleBlur}
              placeholder="e.g. +911234567890 or 9876543210"
              className={`mt-2 h-14 rounded-xl border-2 bg-[#2e362e] text-[#efece6] placeholder:text-[#b6b6b6] text-lg px-5 focus:ring-2 focus:ring-amber-400 ${errors.phone ? 'border-red-500' : 'border-[#3a463a]'}`}
              disabled={isLoading}
              maxLength={16}
            />
            {errors.phone
              ? <p className="text-sm text-red-400 mt-1">{errors.phone}</p>
              : <p className="text-xs text-[#8a9e87] mt-1">10–15 digits, optional + country code (e.g. +91)</p>
            }
          </div>
          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-[#efece6]">Password *</Label>
            <div className="relative mt-2">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Min 8 chars, uppercase, lowercase & number"
                className={`h-14 pr-12 rounded-xl border-2 bg-[#2e362e] text-[#efece6] placeholder:text-[#b6b6b6] text-lg px-5 focus:ring-2 focus:ring-amber-400 ${errors.password ? 'border-red-500' : 'border-[#3a463a]'}`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b6b6b6] hover:text-[#efece6]"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-400 mt-1">{errors.password}</p>
            )}
            {formData.password && (() => {
              const strength = getPasswordStrength(formData.password);
              return (
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
                      <span className="text-[#8a9e87]"> — add uppercase, numbers & special chars to strengthen</span>
                    )}
                  </p>
                </div>
              );
            })()}
            {!formData.password && (
              <p className="text-xs text-[#8a9e87] mt-1">Min 8 chars with uppercase, lowercase & number</p>
            )}
          </div>
          {/* Admin Secret/Invite Code */}
          <div>
            <Label htmlFor="secret" className="text-[#efece6]">Admin Secret/Invite Code *</Label>
            <Input
              id="secret"
              value={formData.secret}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`mt-2 h-14 rounded-xl border-2 border-[#3a463a] bg-[#2e362e] text-[#efece6] placeholder:text-[#b6b6b6] text-lg px-5 focus:ring-2 focus:ring-amber-400 ${errors.secret ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {errors.secret && (
              <p className="text-sm text-red-500">{errors.secret}</p>
            )}
          </div>
          <Button type="submit" className="w-full h-12 bg-[#243026] border border-[#5b6659] text-[#efece6] hover:bg-white/10" disabled={isLoading}>
            {isLoading ? 'Creating Admin Account...' : 'Create Admin Account'}
          </Button>
        </form>
        <p className="text-center text-sm text-[#cfc9bb] mt-6">
          Already have an admin account?{' '}
          <Link to="/admin" className="font-medium text-[#efece6] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminSignup;
