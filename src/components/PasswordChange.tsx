
import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

interface PasswordChangeProps {
  onPasswordChange: (newPass: string) => void;
}

const PasswordChange: React.FC<PasswordChangeProps> = ({ onPasswordChange }) => {
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPass !== confirmPass) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    onPasswordChange(newPass);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 animate-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">Đổi mật khẩu mới</h2>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            Vì lý do bảo mật, bạn cần đổi mật khẩu mặc định <span className="font-bold text-slate-700">123456</span> trong lần đăng nhập đầu tiên.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mật khẩu mới</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="password"
                required
                value={newPass}
                onChange={(e) => {setNewPass(e.target.value); setError('');}}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium"
                placeholder="Nhập mật khẩu mới..."
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Xác nhận mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="password"
                required
                value={confirmPass}
                onChange={(e) => {setConfirmPass(e.target.value); setError('');}}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium"
                placeholder="Nhập lại mật khẩu mới..."
              />
            </div>
          </div>

          {error && <p className="text-[11px] font-bold text-pink-500 ml-1">{error}</p>}

          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mt-4"
          >
            Xác nhận thay đổi
            <CheckCircle2 size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordChange;
