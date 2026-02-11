
import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Info, ShieldCheck, X, Send, CheckCircle2 } from 'lucide-react';
import { HospitalLogo } from './Sidebar';

interface LoginProps {
  onLogin: (email: string, pass: string) => void;
  onResetPassword: (email: string) => Promise<{ success: boolean, msg: string }>;
  error?: string;
  customLogo?: string | null;
}

const Login: React.FC<LoginProps> = ({ onLogin, onResetPassword, error, customLogo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setResetStatus(null);
    
    const result = await onResetPassword(forgotEmail);
    setResetStatus({ type: result.success ? 'success' : 'error', msg: result.msg });
    setIsResetting(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-red-600 via-red-500 to-red-800 p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 items-center animate-in fade-in zoom-in duration-500">
        
        {/* Left Side: Login Form */}
        <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl p-10 rounded-[3rem] shadow-2xl border border-white/20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-2xl shadow-red-200 mb-6 p-0.5 border border-red-50 overflow-hidden">
              <HospitalLogo className="w-full h-full" src={customLogo} />
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Phần mềm quản lý mua sắm</h1>
            <p className="text-red-600 mt-1 text-xs font-bold uppercase tracking-widest">BV Tim Mạch TP. Cần Thơ</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email công vụ</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-100/50 border-0 rounded-2xl focus:ring-2 focus:ring-red-500 font-medium transition-all shadow-inner"
                  placeholder="name@bvtimmachct.vn"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mật khẩu</label>
                <button 
                  type="button" 
                  onClick={() => setShowForgotModal(true)}
                  className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-100/50 border-0 rounded-2xl focus:ring-2 focus:ring-red-500 font-medium transition-all shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-[11px] font-bold rounded-xl border border-red-100 flex items-center gap-2 animate-pulse">
                <Info size={14} />
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-bold shadow-xl shadow-red-100 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group uppercase tracking-widest"
            >
              Đăng nhập hệ thống
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-10 text-center border-t border-slate-100 pt-6">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Bản quyền © 2025<br/>Phòng Công nghệ thông tin - BV Tim Mạch
            </p>
          </div>
        </div>

        {/* Right Side: Info Panel */}
        <div className="hidden lg:block w-80 space-y-4">
           <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 text-white shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                 <ShieldCheck className="text-white" size={28} />
                 <h3 className="font-black text-lg tracking-tight leading-tight uppercase">Hệ thống<br/>Nghiệp vụ Y tế</h3>
              </div>
              
              <div className="space-y-4">
                 <div className="p-5 bg-black/10 rounded-2xl border border-white/5">
                    <p className="text-xs font-medium leading-relaxed opacity-90">
                      Chào mừng cán bộ nhân viên Bệnh viện Tim mạch TP. Cần Thơ. Vui lòng đăng nhập để thực hiện quy trình mua sắm.
                    </p>
                 </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center opacity-60">
                 <p className="text-[9px] font-bold uppercase tracking-wider">Hỗ trợ CNTT</p>
                 <p className="text-[9px] font-bold tracking-wider">0931.058.071</p>
              </div>
           </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Khôi phục mật khẩu</h3>
                <button onClick={() => { setShowForgotModal(false); setResetStatus(null); }} className="p-2 text-slate-300 hover:text-red-600 rounded-full transition-all">
                  <X size={24} />
                </button>
             </div>
             
             <div className="p-8 space-y-6">
                {!resetStatus ? (
                  <>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      Vui lòng nhập email công vụ của bạn. Hệ thống sẽ gửi một mật khẩu ngẫu nhiên mới qua hòm thư điện tử.
                    </p>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email của bạn</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="email" 
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-100/50 border-0 rounded-2xl focus:ring-2 focus:ring-red-500 font-medium transition-all shadow-inner"
                          placeholder="name@bvtimmachct.vn"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className={`p-6 rounded-[2rem] text-center space-y-3 ${resetStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {resetStatus.type === 'success' ? <CheckCircle2 size={48} className="mx-auto" /> : <Info size={48} className="mx-auto" />}
                    <p className="font-bold text-sm uppercase tracking-tight">{resetStatus.msg}</p>
                    {resetStatus.type === 'success' && (
                      <p className="text-[11px] opacity-80 italic">Kiểm tra hộp thư đến (Inbox) hoặc Thư rác (Spam).</p>
                    )}
                  </div>
                )}
             </div>

             {!resetStatus ? (
               <div className="p-8 pt-0">
                  <button 
                    onClick={handleResetRequest}
                    disabled={isResetting || !forgotEmail}
                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl shadow-red-100 hover:bg-red-700 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50"
                  >
                    {isResetting ? 'Đang gửi yêu cầu...' : <>Gửi mật khẩu mới <Send size={18} /></>}
                  </button>
               </div>
             ) : (
               <div className="p-8 pt-0">
                 <button 
                    onClick={() => { setShowForgotModal(false); setResetStatus(null); }}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs"
                  >
                    Quay lại đăng nhập
                  </button>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
