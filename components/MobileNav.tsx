
import React from 'react';
import { MENU_ITEMS } from '../constants';
import { Role } from '../types';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: Role;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab, userRole }) => {
  const visibleItems = MENU_ITEMS.filter(item => !item.roles || item.roles.includes(userRole));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-2xl border-t border-white shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1)] px-4 pb-safe">
      <div className="flex justify-around items-center h-20 max-w-lg mx-auto">
        {visibleItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center gap-1 group relative h-full flex-1"
            >
              <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-red-600 text-white shadow-lg shadow-red-100 scale-110 -translate-y-1' : 'text-slate-400'}`}>
                {/* Fix: cast icon to any to allow passing the 'size' prop which may not be defined on a generic ReactElement type */}
                {React.cloneElement(item.icon as any, { size: 22 })}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-tighter transition-colors ${isActive ? 'text-red-600' : 'text-slate-400'}`}>
                {item.label.split(' ')[0]}
              </span>
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
