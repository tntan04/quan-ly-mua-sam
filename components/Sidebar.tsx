
import React from 'react';
import { MENU_ITEMS } from '../constants';
import { Role } from '../types';
import { LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: Role;
  onLogout: () => void;
  customLogo?: string | null;
}

export const HospitalLogo = ({ className, src }: { className?: string, src?: string | null }) => {
  if (src) {
    return <img src={src} alt="Logo" className={`${className} object-contain`} />;
  }

  return (
    <svg viewBox="0 0 200 200" className={className}>
      <circle cx="100" cy="100" r="95" fill="none" stroke="#ed3237" strokeWidth="8" />
      <circle cx="100" cy="100" r="80" fill="none" stroke="#ed3237" strokeWidth="1" />
      <defs>
        <path id="topPath" d="M 40,100 A 60,60 0 0,1 160,100" />
        <path id="bottomPath" d="M 40,100 A 60,60 0 0,0 160,100" />
      </defs>
      <text fill="#ed3237" fontSize="13.5" fontWeight="900" letterSpacing="0.5">
        <textPath href="#topPath" startOffset="50%" textAnchor="middle">BỆNH VIỆN TIM MẠCH THÀNH PHỐ CẦN THƠ</textPath>
      </text>
      <text fill="#ed3237" fontSize="11" fontWeight="800" letterSpacing="0.2">
        <textPath href="#bottomPath" startOffset="50%" textAnchor="middle" {...({ side: "right" } as any)} dominantBaseline="hanging">CANTHO CARDIOVASCULAR HOSPITAL</textPath>
      </text>
      <text x="26" y="106" fill="#ed3237" fontSize="18" fontWeight="bold">★</text>
      <text x="162" y="106" fill="#ed3237" fontSize="18" fontWeight="bold">★</text>
      <path d="M100,140 C100,140 145,115 145,85 C145,68 132,58 118,58 C108,58 103,63 100,72 C97,63 92,58 82,58 C68,58 55,68 55,85 C55,115 100,140 100,140 Z" fill="#ed3237" />
      <path d="M142,65 Q115,100 100,142 Q92,110 110,90 Q125,75 138,105" fill="none" stroke="#00a651" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole, onLogout, customLogo }) => {
  return (
    <aside className="hidden md:flex w-64 h-full bg-white/40 backdrop-blur-xl border-r border-white/20 flex-col transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="relative h-14 w-14 flex-shrink-0">
          <div className="absolute inset-0 bg-white rounded-full shadow-md border border-red-50 flex items-center justify-center overflow-hidden">
            <HospitalLogo className="w-[90%] h-[90%]" src={customLogo} />
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-xs font-black bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-800 tracking-tight leading-tight uppercase">
            Phần mềm quản lý<br/>Mua sắm
          </h1>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">BV Tim Mạch Cần Thơ</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {MENU_ITEMS.filter(item => !item.roles || item.roles.includes(userRole)).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-red-600 text-white shadow-lg shadow-red-100'
                : 'text-slate-600 hover:bg-white/60 hover:text-red-600'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto space-y-3">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
        >
          <LogOut size={20} />
          Đăng xuất
        </button>
        
        <div className="bg-white/80 rounded-2xl p-4 border border-red-50 shadow-sm">
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Thông tin</p>
          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
            Phiên bản: 1.0.8 - Mobile Ready
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
