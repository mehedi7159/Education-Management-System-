import React, { useState } from 'react';
import { Mail, Phone, KeyRound, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AuthService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: () => void;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
}) => {
  const { resolveUserByIdentifier } = useAuth();
  const { success, error: toastError } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState('admin_dhaka');
  const [method, setMethod] = useState<'EMAIL' | 'SMS'>('EMAIL');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await AuthService.requestPasswordReset(
        { identifier, method },
        resolveUserByIdentifier
      );

      if (res.success) {
        setPreviewOtp(res.previewToken || null);
        if (res.previewToken) {
          setResetToken(res.previewToken);
        }
        success('কোড পাঠানো হয়েছে', res.message);
        setStep(2);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'কোড পাঠাতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 8) {
      setErrorMessage('নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।');
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.submitPasswordReset(
        {
          identifier,
          resetToken,
          newPassword,
        },
        resolveUserByIdentifier
      );

      if (res.success) {
        success('পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে', res.message);
        setStep(3);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleResetComplete = () => {
    onClose();
    if (onSuccessLogin) {
      onSuccessLogin();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="পাসওয়ার্ড রিসেট আর্কিটেকচার"
      subtitle="ওটিপি (OTP) ও টোকেন ভিত্তিক সুরক্ষিত পাসওয়ার্ড পুনরুদ্ধার"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 text-xs">
          <span className={`font-semibold ${step >= 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
            ১. রিকোয়েস্ট কোড
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className={`font-semibold ${step >= 2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
            ২. ওটিপি ও নতুন পাসওয়ার্ড
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className={`font-semibold ${step === 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
            ৩. সম্পন্ন
          </span>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Request OTP */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                ব্যবহারকারীর ইউজারনেম / ইমেইল / মোবাইল
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="যেমন: admin_dhaka"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                ভেরিফিকেশন মেথড
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('EMAIL')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                    method === 'EMAIL'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  ইমেইলে ওটিপি
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('SMS')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                    method === 'SMS'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  এসএমএস ওটিপি
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="md" onClick={onClose}>
                বাতিল
              </Button>
              <Button type="submit" variant="primary" size="md" disabled={loading}>
                {loading ? 'পাঠানো হচ্ছে...' : 'ওটিপি কোড পাঠান'}
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: Enter OTP & Set New Password */}
        {step === 2 && (
          <form onSubmit={handleVerifyAndReset} className="space-y-4">
            {previewOtp && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <span>ডেভেলপমেন্ট টেস্ট ওটিপি কোড:</span>
                <span className="font-mono font-bold text-sm bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
                  {previewOtp}
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                ৬-সংখ্যার ভেরিফিকেশন ওটিপি (OTP Code)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="যেমন: 849201"
                className="w-full px-3 py-2 text-sm font-mono tracking-widest text-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                নতুন পাসওয়ার্ড
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="কমপক্ষে ৮ অক্ষরের নতুন পাসওয়ার্ড"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                নতুন পাসওয়ার্ড নিশ্চিত করুন
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="নতুন পাসওয়ার্ডটি পুনরায় লিখুন"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                পূর্বের ধাপে
              </button>

              <div className="flex gap-2">
                <Button type="button" variant="outline" size="md" onClick={onClose}>
                  বাতিল
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={loading}>
                  {loading ? 'যাচাই হচ্ছে...' : 'পাসওয়ার্ড নিশ্চিত করুন'}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                পাসওয়ার্ড সফলভাবে রিসেট সম্পন্ন হয়েছে
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                এখন আপনি নতুন পাসওয়ার্ড ব্যবহার করে আপনার অ্যাকাউন্টে লগইন করতে পারবেন।
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleResetComplete}
            >
              এখনই লগইন করুন
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
