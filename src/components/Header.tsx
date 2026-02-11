
import React, { useState } from 'react';
import { User, Role } from '../types';
import { ROLE_LABELS } from '../constants';
import { Bell, Search, HardDrive, RefreshCcw, CheckCircle, AlertCircle, X, ExternalLink, ChevronRight, Info, Library, Server } from 'lucide-react';
import { driveService } from '../services/driveService';

interface HeaderProps {
  user: User;
  onRoleChange: (role: Role) => void;
  onDriveConnected?: () => void;
  serverOnline?: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, onRoleChange, onDriveConnected, serverOnline }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(!!localStorage.getItem('drive_token'));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const handleConnectDrive = async () => {
    setIsConnecting(true);
    setErrorMsg(null);
    try {
      await driveService.authenticate();
      setIsConnected(true);
      if (onDriveConnected) onDriveConnected();
    } catch (e: any) {
      console.error('Lỗi kết nối Drive:', e);
      if (e.message === 'CONFIG_MISSING') {
        setErrorMsg('Chưa cấu hình Client ID');
        setShowGuide(true);
      } else {
        setErrorMsg('Lỗi Google Auth (400/403)');
        setShowGuide(true);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <header className="h-16 md:h-20 bg-white/30 backdrop-blur-md border-b border-white/20 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="relative w-64 lg:w-96 max-w-full hidden sm:block">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
          <Search size={18} />
        </span>
        <input 
          className="block w-full pl-10 pr-3 py-2 border-0 bg-white/50 backdrop-blur rounded-xl leading-5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-all shadow-sm"
          placeholder="Tìm kiếm nhanh..."
          type="search"
        />
      </div>

      <div className="flex items-center gap-2 md:gap-4 ml-auto sm:ml-0">
        <div className="flex gap-2">
          {/* Server Status Indicator */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${serverOnline ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
            <Server size={14} className={serverOnline ? 'animate-pulse' : ''} />
            <span className="hidden xs:inline">{serverOnline ? 'Server: Online' : 'Server: 192.168.1.99 Offline'}</span>
          </div>

          <button 
            onClick={handleConnectDrive}
            disabled={isConnecting}
            className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] md:text-xs font-bold transition-all shadow-sm border ${
              isConnected 
                ? 'bg-indigo-50 text-indigo-600 border-indigo-100' 
                : errorMsg 
                  ? 'bg-pink-50 text-pink-600 border-pink-100'
                  : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isConnecting ? (
              <RefreshCcw size={14} className="animate-spin" />
            ) : isConnected ? (
              <CheckCircle size={14} />
            ) : errorMsg ? (
              <AlertCircle size={14} />
            ) : (
              <HardDrive size={14} />
            )}
            <span className="hidden xs:inline">
              {isConnecting ? 'Đang kết nối...' : isConnected ? 'Drive Cloud' : errorMsg || 'Sync Drive'}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-3 ml-1">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-bold text-slate-700 leading-tight">{user.name}</p>
            <p className="text-xs text-indigo-500 font-medium">{ROLE_LABELS[user.role]}</p>
          </div>
          <div className="h-8 md:h-10 w-8 md:w-10 rounded-lg md:rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md text-xs md:text-base">
            {user.name.charAt(0)}
          </div>
        </div>
      </div>

      {showGuide && (
        <div className="fixed inset-0 z-[9999] flex justify-center items-start overflow-y-auto bg-slate-900/80 backdrop-blur-md p-4 sm:p-10">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-300 my-auto">
            <div className="p-8 sm:p-12">
              <div className="flex justify-between items-start mb-8">
                <div className="bg-pink-600 p-4 rounded-2xl text-white shadow-xl shadow-pink-100">
                  <AlertCircle size={32} />
                </div>
                <button 
                  onClick={() => setShowGuide(false)} 
                  className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X size={28} />
                </button>
              </div>
              
              <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Vấn đề kết nối?</h3>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                Ứng dụng hiện đang ưu tiên kết nối tới server nội bộ <b>192.168.1.99</b>. Nếu server này Offline, dữ liệu sẽ được đồng bộ lên Google Drive (nếu đã đăng nhập).
              </p>

              <div className="mt-8 space-y-5">
                <div className="flex gap-5 items-start bg-indigo-50 p-6 rounded-2xl border border-indigo-200 ring-4 ring-indigo-50">
                  <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex-shrink-0 flex items-center justify-center text-sm font-bold shadow-sm">!</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-indigo-800 uppercase tracking-wide">KIỂM TRA IP 192.168.1.99</p>
                    <p className="text-xs text-indigo-600 mt-1">Đảm bảo máy chủ nội bộ đang chạy và bạn cùng lớp mạng Wifi/LAN.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowGuide(false)}
                className="w-full mt-10 py-5 bg-slate-900 text-white rounded-2xl font-bold shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
