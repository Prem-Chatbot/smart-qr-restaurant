import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, ArrowRight, Sparkles, AlertCircle, ChefHat } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, quickDemoLogin, error, clearError } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      onSuccess();
    } catch {
      // Error handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    try {
      setLoading(true);
      await quickDemoLogin();
      onSuccess();
    } catch {
      // Error handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      onSuccess();
    } catch {
      // Error handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            เข้าสู่ระบบผู้ดูแลร้านอาหาร
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            เข้าถึงระบบ KDS ห้องครัว, จัดการเมนู และรายงานยอดขาย
          </p>
        </div>

        {/* 1-Click Demo Login Banner (Essential for immediate testing) */}
        <div className="mb-6 p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>ทดสอบระบบรวดเร็ว (1-Click Demo Login)</span>
          </div>
          <p className="text-[11px] text-amber-800">
            เข้าสู่ระบบด้วยบัญชีพนักงานเดโมอัตโนมัติ โดยไม่ต้องพิมพ์ข้อมูล
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={handleQuickDemo}
            className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-600/20 transition active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าใช้งานในฐานะผู้จัดการร้านเดโม'}
          </button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-stone-400">หรือใช้อีเมลและรหัสผ่าน</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              อีเมลพนักงาน / ผู้จัดการ
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                }}
                placeholder="staff@restaurant.com"
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              รหัสผ่าน
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError();
                }}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-md transition active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>กำลังดำเนินการ...</span>
            ) : mode === 'signin' ? (
              <>
                <span>เข้าสู่ระบบ</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <span>ลงทะเบียนผู้ดูแลระบบ</span>
            )}
          </button>
        </form>

        {/* Google Sign In option */}
        <div className="mt-4">
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-semibold rounded-xl shadow-2xs transition flex items-center justify-center gap-2"
          >
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
            <span>เข้าสู่ระบบด้วย Google</span>
          </button>
        </div>

        {/* Toggle mode & Cancel */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              clearError();
            }}
            className="text-amber-700 font-semibold hover:underline"
          >
            {mode === 'signin' ? 'ยังไม่มีบัญชี? ลงทะเบียนเจ้าหน้าที่' : 'มีบัญชีแล้ว? เข้าสู่ระบบ'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="text-stone-400 hover:text-stone-600"
          >
            กลับสู่หน้าร้าน
          </button>
        </div>

      </div>
    </div>
  );
};
