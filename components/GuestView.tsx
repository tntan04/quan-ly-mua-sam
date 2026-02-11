
import React from 'react';
import { ShieldAlert, ExternalLink, MessageCircle } from 'lucide-react';

const GuestView: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
      <div className="bg-white/60 backdrop-blur-2xl p-12 rounded-[3rem] border border-white shadow-2xl shadow-indigo-100 text-center max-w-2xl">
        <div className="bg-gradient-to-tr from-indigo-500 to-pink-500 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-200 rotate-6">
          <ShieldAlert className="text-white" size={48} />
        </div>
        
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-4">
          Truy cập bị hạn chế
        </h1>
        
        <p className="text-lg text-slate-500 leading-relaxed mb-8">
          Chào mừng bạn đến với hệ thống quản lý mua sắm tập trung <br/>
          <span className="font-bold text-indigo-600">Bệnh viện Tim mạch TP Cần Thơ</span>.
        </p>

        <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 mb-10">
          <p className="text-indigo-900 font-semibold flex items-center justify-center gap-2">
            <MessageCircle size={20} />
            Liên hệ admin: <span className="text-pink-600">Trần Ngọc Tân</span>
          </p>
          <p className="text-sm text-indigo-400 mt-1">Để được cấp quyền sử dụng ứng dụng và quy trình nghiệp vụ.</p>
        </div>

        <button className="flex items-center gap-2 mx-auto text-slate-400 hover:text-indigo-600 transition-colors font-medium">
          Xem hướng dẫn sử dụng <ExternalLink size={16} />
        </button>
      </div>
    </div>
  );
};

export default GuestView;
