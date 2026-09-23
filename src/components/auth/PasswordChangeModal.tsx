import React, { useState } from 'react';
import { Lock, Check, AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AuthService } from '../../services/authService';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!hasMinLength) {
      setErrorMessage('নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।');
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage('নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।');
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.changePassword(user.id, {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        success('পাসওয়ার্ড পরিবর্তিত হয়েছে', res.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="পাসওয়ার্ড পরিবর্তন করুন"
      subtitle="নিরাপত্তার স্বার্থে নিয়মিত পাসওয়ার্ড পরিবর্তন করুন"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            বর্তমান পাসওয়ার্ড
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="বর্তমান পাসওয়ার্ড লিখুন"
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            নতুন পাসওয়ার্ড
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="কমপক্ষে ৮ অক্ষরের শক্তিশালী পাসওয়ার্ড"
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            নতুন পাসওয়ার্ড নিশ্চিত করুন
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="নতুন পাসওয়ার্ডটি আবার লিখুন"
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Strength checklist */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1.5 text-[11px] border border-slate-200 dark:border-slate-700">
          <p className="font-semibold text-slate-600 dark:text-slate-400">পাসওয়ার্ডের শর্তাবলী:</p>
          <div className="flex items-center gap-1.5">
            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasMinLength ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-600'}`}>
              <Check className="w-2.5 h-2.5" />
            </span>
            <span className={hasMinLength ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-500'}>
              কমপক্ষে ৮ অক্ষর
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasLetter && hasNumber ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-600'}`}>
              <Check className="w-2.5 h-2.5" />
            </span>
            <span className={hasLetter && hasNumber ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-500'}>
              বর্ণ ও সংখ্যার সংমিশ্রণ
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${passwordsMatch ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-600'}`}>
              <Check className="w-2.5 h-2.5" />
            </span>
            <span className={passwordsMatch ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-500'}>
              উভয় পাসওয়ার্ড একই হতে হবে
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            বাতিল
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading || !hasMinLength || !passwordsMatch}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          >
            {loading ? 'আপডেট করা হচ্ছে...' : 'পাসওয়ার্ড সংরক্ষণ করুন'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
