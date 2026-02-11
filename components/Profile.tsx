
import React, { useState } from 'react';
import { User, Role } from '../types';
import { ROLE_LABELS } from '../constants';
import { UserCircle, Mail, ShieldCheck, Lock, Save, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdateProfile: (updatedData: Partial<User>) => Promise<boolean>;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateProfile }) => {
  const [name, setName] = useState(user.name);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus(null);

    const success = await onUpdateProfile({ name });
    if (success) {
      setStatus({ type: 'success', msg: 'Cập nhật thông tin thành công!' });
    } else {
      setStatus({ type: 'error', msg: 'Có lỗi xảy ra khi lưu thông tin.' });
    }
    setIsSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (currentPass !== user.password) {
      setStatus({ type: 'error', msg: 'Mật khẩu hiện tại không chính xác.' });
      return;
    }

    if (newPass.length < 6) {
      setStatus({ type: 'error', msg: 'Mật khẩu mới phải từ 6 ký tự trở lên.' });
      return;
    }

    if (newPass !== confirmPass) {
      setStatus({ type: 'error', msg: 'Mật khẩu xác nhận không khớp.' });
      return;
    }

    setIsSaving(true);
    const success = await onUpdateProfile({ password: newPass });
    if (success) {
      setStatus({ type: 'success', msg: 'Đổi mật khẩu thành công!' });
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      setStatus({ type: 'error', msg: 'Có lỗi xảy ra.' });
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-6">
        <div className="h-24 w-24 bg-gradient-to-br from-red-600 to-red-800 rounded-[2rem] flex items-center justify-center text-white shadow-2xl">
          <UserCircle size={48} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Hồ sơ cá nhân</h2>
          <p className="text-slate-500 font-medium">Quản lý thông tin tài khoản và bảo mật của bạn.</p>
        </div>
      </div>

      {status && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
          {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-bold uppercase tracking-tight">{status.msg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Thông tin cơ bản */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck size={20} className="text-red-600" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Thông tin cơ bản</h3>
          </div>
          
          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email (Không thể đổi)</label>
              <div className="relative opacity-60">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="email" value={user.email} disabled className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border-0 rounded-2xl font-bold text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vai trò & Bộ phận</label>
              <div className="flex gap-2">
                 <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-tight border border-red-100">{ROLE_LABELS[user.role]}</span>
                 <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-tight border border-slate-200">{user.department}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Họ và tên</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 font-bold text-sm outline-none transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={isSaving || name === user.name}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              <Save size={18} /> {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>
        </div>

        {/* Đổi mật khẩu */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <KeyRound size={20} className="text-indigo-600" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Bảo mật tài khoản</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu hiện tại</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-sm outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu mới</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-sm outline-none transition-all"
                  placeholder="Ít nhất 6 ký tự"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-sm outline-none transition-all"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSaving || !newPass}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
            >
              <KeyRound size={18} /> {isSaving ? 'Đang thực hiện...' : 'Cập nhật mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
