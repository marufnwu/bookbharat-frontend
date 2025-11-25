'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Phone, MessageSquare, ArrowLeft, Check } from 'lucide-react';
import axios from 'axios';

type Channel = 'sms' | 'whatsapp';

interface OTPLoginProps {
  onSuccess: (token: string, user: any) => void;
  onBack?: () => void;
  title?: string;
  description?: string;
}

export function OTPLogin({ onSuccess, onBack, title = 'Login with OTP', description }: OTPLoginProps) {
  const [step, setStep] = useState<'phone' | 'channel' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [channel, setChannel] = useState<Channel>('sms');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Validate phone number
  const isValidPhone = (phone: string) => {
    const cleanPhone = phone.replace(/\s/g, '');
    return /^\+?[0-9]{10,15}$/.test(cleanPhone);
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    if (!isValidPhone(phoneNumber)) {
      setError('Please enter a valid phone number (10-15 digits)');
      return;
    }

    // Move to channel selection
    setStep('channel');
  };

  const handleSendOTP = async (selectedChannel: Channel) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_BASE}/auth/otp/send`, {
        identifier: phoneNumber,
        channel: selectedChannel
      });

      if (response.data.success) {
        setChannel(selectedChannel);
        setOtpSent(true);
        setStep('otp');
        setSuccess(`OTP sent to your ${selectedChannel === 'sms' ? 'phone' : 'WhatsApp'}!`);
        setCountdown(60); // 60 seconds cooldown

        // Focus first OTP input
        setTimeout(() => otpInputs.current[0]?.focus(), 100);
      } else {
        setError(response.data.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only numbers

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (index === 5 && value) {
      const fullOtp = [...newOtp.slice(0, 5), value].join('');
      if (fullOtp.length === 6) {
        handleVerifyOTP(fullOtp);
      }
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      handleVerifyOTP(pastedData);
    }
  };

  const handleVerifyOTP = async (otpCode?: string) => {
    const code = otpCode || otp.join('');

    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE}/auth/otp/verify`, {
        identifier: phoneNumber,
        otp_code: code
      });

      if (response.data.success) {
        setSuccess('Login successful! Redirecting...');
        // Keep loading state active during redirect
        // Don't set loading to false here - parent will handle redirect
        onSuccess(response.data.token, response.data.user);
      } else {
        setError(response.data.message || 'Invalid OTP');
        setOtp(['', '', '', '', '', '']);
        otpInputs.current[0]?.focus();
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpInputs.current[0]?.focus();
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOtp(['', '', '', '', '', '']);
    handleSendOTP(channel);
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('channel');
      setOtp(['', '', '', '', '', '']);
    } else if (step === 'channel') {
      setStep('phone');
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {step === 'phone' && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {description || 'Enter your phone number to receive an OTP'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <Input
                  type="tel"
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  error={error}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Include country code (e.g., +91 for India)
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                Continue
              </Button>

              {onBack && (
                <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to login options
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {step === 'channel' && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Choose delivery method</CardTitle>
            <CardDescription>
              How would you like to receive your OTP?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex items-center justify-start gap-3"
              onClick={() => handleSendOTP('sms')}
              disabled={loading}
            >
              <Phone className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-medium">SMS</div>
                <div className="text-xs text-muted-foreground">{phoneNumber}</div>
              </div>
              {loading && <Loader2 className="h-4 w-4 ml-auto animate-spin" />}
            </Button>

            <Button
              variant="outline"
              className="w-full h-auto py-4 flex items-center justify-start gap-3"
              onClick={() => handleSendOTP('whatsapp')}
              disabled={loading}
            >
              <MessageSquare className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-medium">WhatsApp</div>
                <div className="text-xs text-muted-foreground">{phoneNumber}</div>
              </div>
              {loading && <Loader2 className="h-4 w-4 ml-auto animate-spin" />}
            </Button>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button type="button" variant="ghost" className="w-full" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'otp' && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Enter OTP</CardTitle>
            <CardDescription>
              We've sent a 6-digit code to your {channel === 'sms' ? 'phone' : 'WhatsApp'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {success && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg flex items-center gap-2">
                <Check className="h-4 w-4" />
                {success}
              </div>
            )}

            <div className="flex justify-center gap-2" onPaste={handleOTPPaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-border rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={loading}
                />
              ))}
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <Button
              type="button"
              className="w-full"
              onClick={() => handleVerifyOTP()}
              disabled={loading || otp.join('').length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </Button>

            <div className="text-center space-y-2">
              {countdown > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Resend OTP in {countdown}s
                </p>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOTP}
                  disabled={loading}
                >
                  Resend OTP
                </Button>
              )}

              <Button type="button" variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Change delivery method
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
