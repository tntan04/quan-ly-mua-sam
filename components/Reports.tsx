
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { User, Role, ProcurementRequest, InventoryTransaction, GoodsItem, ProcurementUnit, ProcurementDossier } from '../types';
import { HOSPITAL_DEPARTMENTS, STATUS_COLORS } from '../constants';
// Added missing icon imports from lucide-react to fix compilation errors.
import { 
  BarChart3, FileText, ClipboardList, 
  Search, Filter, Calendar, DollarSign, Package, TrendingUp,
  ChevronRight, Building2, LayoutDashboard, Download, Printer,
  ChevronDown, Lock, Briefcase, Boxes, FolderCheck,
  FilePieChart, CheckCircle2, Clock
} from 'lucide-react';

interface ReportsProps {
  user: User;
  requests: ProcurementRequest[];
  transactions: InventoryTransaction[];
  goods: GoodsItem[];
  units: ProcurementUnit[];
  dossiers?: ProcurementDossier[];
  procurementMethods: string[];
}

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

const Reports: React.FC<ReportsProps> = ({ user, requests, transactions, goods, units, dossiers = [], procurementMethods }) => {
  // Xác định người dùng cấp cao (Admin hoặc thuộc Ban Giám đốc)
  const isHighLevel = user.role === Role.ADMIN || user.department === 'Ban Giám đốc';
  
  const [activeTab, setActiveTab] = useState<'charts' | 'dossiers' | 'usage' | 'requests'>(isHighLevel ? 'charts' : 'usage');
  const [selectedDept, setSelectedDept] = useState(isHighLevel ? HOSPITAL_DEPARTMENTS[0] : user.department);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMethod, setSelectedMethod] = useState("Tất cả hình thức");

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearList = [];
    for (let y = currentYear; y >= 2000; y--) {
      yearList.push(y);
    }
    return yearList;
  }, []);

  const methodsForFilter = useMemo(() => {
    return ["Tất cả hình thức", ...procurementMethods];
  }, [procurementMethods]);

  // --- 1. DỮ LIỆU BIỂU ĐỒ TỔNG THỂ ---
  const chartData = useMemo(() => {
    if (!isHighLevel) return null;

    const monthlySpending = Array.from({ length: 12 }, (_, i) => ({
      name: `Th.${i + 1}`,
      amount: requests
        .filter(r => {
          const d = new Date(r.date);
          return r.status === 'PURCHASED' && d.getFullYear() === selectedYear && d.getMonth() === i;
        })
        .reduce((sum, r) => sum + (r.amount || 0), 0)
    }));

    const unitDistribution = units.map(unit => ({
      name: unit.name,
      value: requests.filter(r => r.targetUnitId === unit.id && new Date(r.date).getFullYear() === selectedYear).length
    })).filter(u => u.value > 0);

    return { monthlySpending, unitDistribution };
  }, [requests, selectedYear, units, isHighLevel]);

  // --- 2. BÁO CÁO GÓI THẦU (Dossiers) ---
  const dossierReport = useMemo(() => {
    return dossiers.filter(d => {
      const yearMatch = new Date(d.date).getFullYear() === selectedYear;
      const methodMatch = selectedMethod === "Tất cả hình thức" || d.procurementMethod === selectedMethod;
      
      // Admin/BGĐ xem hết, khoa phòng xem cái nào được phân quyền (permittedDepartments)
      const accessMatch = isHighLevel || d.permittedDepartments.includes(user.department);
      
      return yearMatch && methodMatch && accessMatch;
    }).map(d => {
      const relatedRequests = requests.filter(r => d.requestIds.includes(r.id));
      const totalValue = relatedRequests.reduce((sum, r) => sum + (r.amount || 0), 0);
      const unitName = units.find(u => u.id === d.targetUnitId)?.name || 'N/A';
      return { ...d, totalValue, unitName };
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [dossiers, selectedYear, selectedMethod, requests, units, isHighLevel, user]);

  // --- 3. BÁO CÁO SỬ DỤNG CHI TIẾT ---
  const usageReport = useMemo(() => {
    const deptTxns = transactions.filter(t => t.toDept === selectedDept && t.type === 'TRANSFER' && t.status === 'COMPLETED');
    const aggregated: Record<string, any> = {};
    deptTxns.forEach(t => {
      if (!aggregated[t.goodsId]) {
        const item = goods.find(g => g.id === t.goodsId);
        aggregated[t.goodsId] = {
          name: item?.name || 'N/A',
          unit: item?.unit || 'N/A',
          quantity: 0,
          price: t.price || item?.price || 0,
          total: 0
        };
      }
      aggregated[t.goodsId].quantity += t.quantity;
      aggregated[t.goodsId].total += t.quantity * (t.price || aggregated[t.goodsId].price);
    });
    return Object.values(aggregated);
  }, [transactions, selectedDept, goods]);

  const deptRequests = useMemo(() => {
    return requests.filter(r => r.department === selectedDept).sort((a, b) => b.date.localeCompare(a.date));
  }, [requests, selectedDept]);

  const totalUsageValue = usageReport.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3 uppercase">
            <BarChart3 className="text-red-600" size={32} />
            Hệ thống Báo cáo
          </h2>
          <p className="text-slate-500 mt-1 font-medium text-sm italic">
            Dữ liệu thống kê quy trình mua sắm tập trung - BV Tim Mạch.
          </p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-100 hover:scale-105 transition-all">
          <Printer size={16} /> Xuất PDF/In báo cáo
        </button>
      </div>

      <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-3xl border border-white flex gap-1 shadow-sm w-fit overflow-x-auto scrollbar-hide">
        {isHighLevel && (
          <button onClick={() => setActiveTab('charts')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeTab === 'charts' ? 'bg-white text-red-600 shadow-md ring-1 ring-red-100' : 'text-slate-400 hover:text-slate-600'}`}>
            <LayoutDashboard size={16} /> Phân tích Tổng quát
          </button>
        )}
        <button onClick={() => setActiveTab('dossiers')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeTab === 'dossiers' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}>
          <Briefcase size={16} /> Báo cáo Gói thầu
        </button>
        <button onClick={() => setActiveTab('usage')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeTab === 'usage' ? 'bg-white text-emerald-600 shadow-md ring-1 ring-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}>
          <Boxes size={16} /> Tài sản Đơn vị
        </button>
        <button onClick={() => setActiveTab('requests')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeTab === 'requests' ? 'bg-white text-amber-600 shadow-md ring-1 ring-amber-100' : 'text-slate-400 hover:text-slate-600'}`}>
          <ClipboardList size={16} /> Nhật ký đề nghị
        </button>
      </div>

      {/* --- PHẦN BỘ LỌC CHUNG CHO TAB --- */}
      {(activeTab === 'charts' || activeTab === 'dossiers') && (
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-sm flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian thống kê</p>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent font-black text-lg text-slate-800 outline-none cursor-pointer"
              >
                {years.map(y => <option key={y} value={y}>Năm {y}</option>)}
              </select>
            </div>
          </div>

          {activeTab === 'dossiers' && (
            <div className="h-10 w-[1px] bg-slate-100 hidden md:block mx-4"></div>
          )}

          {activeTab === 'dossiers' && (
            <div className="flex-1 w-full">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Hình thức mua sắm</p>
              <div className="relative">
                <select 
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-full pl-6 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm text-slate-700 focus:ring-2 focus:ring-red-500 appearance-none cursor-pointer shadow-inner transition-all"
                >
                  {methodsForFilter.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 1: BIỂU ĐỒ TỔNG --- */}
      {activeTab === 'charts' && isHighLevel && chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-500">
           <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] border border-white shadow-sm h-[500px] flex flex-col">
              <div className="mb-10 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Chi tiêu hàng tháng</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Năm {selectedYear} • Đã hoàn tất</p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><TrendingUp size={20} /></div>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.monthlySpending}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={26} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] border border-white shadow-sm h-[500px] flex flex-col">
              <div className="mb-10 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Đơn vị xử lý</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Cơ cấu hồ sơ</p>
                </div>
                <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl"><FilePieChart size={20} /></div>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData.unitDistribution} cx="50%" cy="45%" innerRadius={100} outerRadius={150} paddingAngle={8} dataKey="value">
                      {chartData.unitDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Legend verticalAlign="bottom" align="center" iconType="circle" formatter={(value) => <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>
      )}

      {/* --- TAB 2: BÁO CÁO GÓI THẦU --- */}
      {activeTab === 'dossiers' && (
        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-sm overflow-hidden overflow-x-auto animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="p-8 border-b border-slate-100 bg-indigo-50/20 flex justify-between items-center">
             <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
               <Briefcase size={18} className="text-indigo-600" /> Báo cáo gói thầu mua sắm năm {selectedYear}
             </h4>
             <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase">Giá trị năm:</span>
                <span className="text-2xl font-black text-indigo-600">{dossierReport.reduce((sum, d) => sum + d.totalValue, 0).toLocaleString('vi-VN')} đ</span>
             </div>
          </div>
          <table className="w-full text-left min-w-[1200px]">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-16">STT</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gói thầu / Hồ sơ</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hình thức</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Giá gói thầu</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Bắt đầu</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Hoàn tất</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dossierReport.length > 0 ? dossierReport.map((d, idx) => (
                <tr key={d.id} className="hover:bg-indigo-50/50 transition-all group">
                  <td className="px-6 py-6 text-center font-bold text-slate-300">{idx + 1}</td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-700 leading-tight">{d.name}</p>
                    <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-1 italic">{d.unitName}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-tighter shadow-sm">{d.procurementMethod}</span>
                  </td>
                  <td className="px-8 py-6 text-right font-black text-indigo-600 text-sm">
                    {d.totalValue.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-8 py-6 text-center text-[10px] font-bold text-slate-500">{d.date}</td>
                  <td className="px-8 py-6 text-center text-[10px] font-bold text-emerald-600">{d.completionDate || '---'}</td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="py-24 text-center text-slate-400 italic text-sm font-medium">Không tìm thấy dữ liệu gói thầu phù hợp với bộ lọc.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- CÁC TAB KHÁC GIỮ NGUYÊN --- */}
      {(activeTab === 'usage' || activeTab === 'requests') && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-5">
                <div className="h-16 w-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-inner">
                   <Building2 size={32} />
                </div>
                <div>
                   <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Dữ liệu Khoa / Phòng</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     {isHighLevel ? 'Lọc chi tiết từng đơn vị' : 'Dữ liệu cá nhân'}
                   </p>
                </div>
             </div>
             
             {isHighLevel ? (
               <select 
                 value={selectedDept} 
                 onChange={(e) => setSelectedDept(e.target.value)}
                 className="w-full md:w-96 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all shadow-inner uppercase"
               >
                 {HOSPITAL_DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
               </select>
             ) : (
               <div className="w-full md:w-96 px-6 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-black text-sm text-slate-500 flex items-center justify-between uppercase">
                  {selectedDept}
                  <Lock size={16} className="opacity-40" />
               </div>
             )}
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-sm overflow-hidden overflow-x-auto relative">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  {activeTab === 'usage' ? <Boxes size={18} className="text-emerald-500" /> : <ClipboardList size={18} className="text-amber-500" />}
                  {activeTab === 'usage' ? 'Tài sản đơn vị nắm giữ' : 'Nhật ký đề nghị'}
                </h4>
                {activeTab === 'usage' && (
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-black text-slate-400 uppercase">Ước tính giá trị:</span>
                     <span className="text-xl font-black text-emerald-600">{totalUsageValue.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
             </div>

             {activeTab === 'usage' ? (
                <table className="w-full text-left min-w-[1000px]">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-16">STT</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên hàng hóa/Thiết bị</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ĐVT</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Số lượng</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Đơn giá</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usageReport.length > 0 ? usageReport.map((item, idx) => (
                      <tr key={idx} className="hover:bg-emerald-50/30 transition-all group">
                        <td className="px-6 py-6 text-center font-bold text-slate-300">{idx + 1}</td>
                        <td className="px-8 py-6 font-black text-slate-700 uppercase text-xs">{item.name}</td>
                        <td className="px-8 py-6 text-center font-bold text-slate-400 text-[10px] uppercase">{item.unit}</td>
                        <td className="px-8 py-6 text-center font-black text-indigo-600">{item.quantity}</td>
                        <td className="px-8 py-6 text-right font-bold text-slate-500 text-[11px]">{item.price.toLocaleString('vi-VN')} đ</td>
                        <td className="px-8 py-6 text-right font-black text-slate-800 text-sm">{item.total.toLocaleString('vi-VN')} đ</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={6} className="py-24 text-center text-slate-400 italic text-sm font-medium">Đơn vị chưa ghi nhận tài sản trong kho sử dụng.</td></tr>
                    )}
                  </tbody>
                </table>
             ) : (
                <table className="w-full text-left min-w-[1000px]">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-16">STT</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã phiếu</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiêu đề đề nghị</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ngày lập</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Giá trị đề nghị</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {deptRequests.length > 0 ? deptRequests.map((req, idx) => (
                      <tr key={req.id} className="hover:bg-amber-50/30 transition-all group">
                        <td className="px-6 py-6 text-center font-bold text-slate-300">{idx + 1}</td>
                        <td className="px-8 py-6 text-[10px] font-black text-indigo-500 uppercase tracking-tighter">{req.id}</td>
                        <td className="px-8 py-6 font-black text-slate-700 text-xs uppercase">{req.title}</td>
                        <td className="px-8 py-6 text-center text-xs font-bold text-slate-500">{req.date}</td>
                        <td className="px-8 py-6 text-center">
                           <span className={`px-4 py-1.5 rounded-2xl text-[8px] font-black uppercase tracking-widest shadow-sm ${STATUS_COLORS[req.status]}`}>
                              {req.status.replace('_', ' ')}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right font-black text-slate-800">
                          {(req.amount || 0).toLocaleString('vi-VN')} đ
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={6} className="py-24 text-center text-slate-400 italic text-sm font-medium">Khoa phòng chưa gửi bất kỳ đề nghị nào.</td></tr>
                    )}
                  </tbody>
                </table>
             )}
          </div>
        </div>
      )}

      {/* Footer Báo cáo */}
      <div className="text-center pt-8 border-t border-slate-100 opacity-30">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
          Hệ thống quản lý mua sắm tập trung<br/>Bệnh viện Tim Mạch TP. Cần Thơ
        </p>
      </div>
    </div>
  );
};

export default Reports;
