
import React, { useState, useMemo, useEffect } from 'react';
import { User, ProcurementRequest, ProcurementUnit, Role, DossierItem, ProcurementDossier } from '../types';
import { STATUS_COLORS, HOSPITAL_DEPARTMENTS } from '../constants';
import { 
  Package, Clock, Plus, Calendar, FileText, Wrench, MessageSquare, 
  Printer, CheckCircle, Search, Inbox, Layers, CheckSquare, 
  FileUp, FilePlus, X, Trash2, FileCheck, Send, ShieldCheck, 
  ThumbsUp, ThumbsDown, Ban, ChevronRight, ListOrdered, Lock, Eye,
  Combine, Download, Loader2, FileType, CheckCircle2, FolderPlus, FolderCheck, Save,
  ChevronDown, ClipboardList, AlertTriangle
} from 'lucide-react';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import ProcurementForm from './ProcurementForm';
import PrintTemplate from './PrintTemplate';

type StatusTab = 'pending' | 'accepted' | 'completed';

interface RequestListProps {
  user: User;
  units: ProcurementUnit[];
  procurementMethods: string[];
  requests: ProcurementRequest[];
  onUpdateRequests: (updated: ProcurementRequest[]) => void;
  customLogo?: string | null;
  initialStatusTab?: StatusTab;
}

const base64ToUint8Array = (base64Str: string) => {
  try {
    const base64 = base64Str.includes(',') ? base64Str.split(',')[1] : base64Str;
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.error("Lỗi giải mã base64:", e);
    return null;
  }
};

const RequestList: React.FC<RequestListProps> = ({ user, units, procurementMethods, requests, onUpdateRequests, customLogo, initialStatusTab = 'pending' }) => {
  const isDossierTab = initialStatusTab === 'accepted';
  const [showForm, setShowForm] = useState(false);
  const [activeRequest, setActiveRequest] = useState<{ req: ProcurementRequest, action: 'accept' | 'reject' } | null>(null);
  const [deleteRequestConfirm, setDeleteRequestConfirm] = useState<ProcurementRequest | null>(null);
  const [feedback, setFeedback] = useState('');
  const [printRequest, setPrintRequest] = useState<ProcurementRequest | null>(null);
  const [currentTab, setCurrentTab] = useState<StatusTab>(initialStatusTab);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Quản lý Dossier tập trung
  const [dossiers, setDossiers] = useState<ProcurementDossier[]>(() => {
    const saved = localStorage.getItem('procurement_dossiers');
    return saved ? JSON.parse(saved) : [];
  });

  const [showCreateDossierModal, setShowCreateDossierModal] = useState(false);
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  const [newDossierName, setNewDossierName] = useState('');
  const [newDossierMethod, setNewDossierMethod] = useState(procurementMethods[0] || '');
  const [activeDossierModal, setActiveDossierModal] = useState<ProcurementDossier | null>(null);

  useEffect(() => {
    localStorage.setItem('procurement_dossiers', JSON.stringify(dossiers));
  }, [dossiers]);

  useEffect(() => {
    if (procurementMethods.length > 0 && !newDossierMethod) {
      setNewDossierMethod(procurementMethods[0]);
    }
  }, [procurementMethods]);

  const isProcurement = user.role === Role.PROCUREMENT;

  // Lấy danh sách thô đã lọc theo quyền truy cập (Dùng để tính counts)
  const accessibleRequests = useMemo(() => {
    return requests.filter(req => {
      if (user.role === Role.ADMIN) return true;
      if (user.role === Role.USAGE) return req.department === user.department;
      if (user.role === Role.PROCUREMENT) return (req.targetUnitId === user.unitId) || (req.department === user.department);
      return false;
    });
  }, [requests, user]);

  const accessibleDossiers = useMemo(() => {
    return dossiers.filter(d => {
      if (user.role === Role.ADMIN) return true;
      if (isProcurement) return d.targetUnitId === user.unitId;
      return d.permittedDepartments.includes(user.department);
    });
  }, [dossiers, user, isProcurement]);

  // Tính toán số lượng cho các tab
  const counts = useMemo(() => {
    return {
      pending: accessibleRequests.filter(r => r.status === 'PENDING').length,
      processingReq: accessibleRequests.filter(r => ['RECEIVED', 'APPROVED_COUNCIL', 'APPROVED_FINANCE'].includes(r.status)).length,
      completedReq: accessibleRequests.filter(r => ['PURCHASED', 'REJECTED'].includes(r.status)).length,
      processingDos: accessibleDossiers.filter(d => d.status === 'PROCESSING').length,
      completedDos: accessibleDossiers.filter(d => d.status === 'COMPLETED').length
    };
  }, [accessibleRequests, accessibleDossiers]);

  const requestListFiltered = useMemo(() => {
    return accessibleRequests.filter(req => {
      if (currentTab === 'pending') return req.status === 'PENDING';
      if (currentTab === 'accepted') return ['RECEIVED', 'APPROVED_COUNCIL', 'APPROVED_FINANCE'].includes(req.status);
      if (currentTab === 'completed') return ['PURCHASED', 'REJECTED'].includes(req.status);
      return false;
    }).filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [accessibleRequests, currentTab, searchTerm]);

  const dossierListFiltered = useMemo(() => {
    return accessibleDossiers.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (currentTab === 'accepted') return d.status === 'PROCESSING' && matchesSearch;
      if (currentTab === 'completed') return d.status === 'COMPLETED' && matchesSearch;
      return false;
    });
  }, [accessibleDossiers, currentTab, searchTerm]);

  const handleCreateDossier = () => {
    if (selectedRequestIds.length === 0 || !newDossierName.trim()) {
      alert("Vui lòng chọn đề nghị và nhập tên hồ sơ.");
      return;
    }
    const newDossier: ProcurementDossier = {
      id: "DOS-" + Date.now(),
      name: newDossierName.trim(),
      procurementMethod: newDossierMethod,
      requestIds: [...selectedRequestIds],
      status: 'PROCESSING',
      date: new Date().toISOString().split('T')[0],
      targetUnitId: user.unitId || '',
      files: [],
      permittedDepartments: Array.from(new Set(requests.filter(r => selectedRequestIds.includes(r.id)).map(r => r.department)))
    };
    
    // Cập nhật trạng thái requests
    const updatedRequests = requests.map(r => 
      selectedRequestIds.includes(r.id) ? { ...r, status: 'RECEIVED' as const, dossierId: newDossier.id } : r
    );
    onUpdateRequests(updatedRequests);
    
    setDossiers([...dossiers, newDossier]);
    setShowCreateDossierModal(false);
    setSelectedRequestIds([]);
    setNewDossierName('');
    setNewDossierMethod(procurementMethods[0] || '');
  };

  const handleCompleteDossier = (dossierId: string) => {
    if (!confirm("Bạn có chắc chắn muốn hoàn tất hồ sơ này?")) return;
    const dossier = dossiers.find(d => d.id === dossierId);
    if (!dossier) return;

    const now = new Date().toISOString().split('T')[0];
    setDossiers(dossiers.map(d => d.id === dossierId ? { ...d, status: 'COMPLETED', completionDate: now } : d));
    
    // Cập nhật tất cả requests trong hồ sơ thành PURCHASED
    const updatedRequests = requests.map(r => 
      dossier.requestIds.includes(r.id) ? { ...r, status: 'PURCHASED' as const } : r
    );
    onUpdateRequests(updatedRequests);
  };

  const handleSaveDossierFiles = (dossierId: string, files: DossierItem[], permitted: string[]) => {
    setDossiers(dossiers.map(d => d.id === dossierId ? { ...d, files, permittedDepartments: permitted } : d));
    setActiveDossierModal(null);
  };

  const handleDeleteRequest = () => {
    if (!deleteRequestConfirm) return;
    const updatedRequests = requests.filter(r => r.id !== deleteRequestConfirm.id);
    onUpdateRequests(updatedRequests);
    setDeleteRequestConfirm(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            {isDossierTab ? 'Hồ sơ mua sắm' : 'Yêu cầu mua sắm'}
          </h2>
          <p className="text-slate-500 mt-1 font-medium text-sm">
            {isDossierTab ? 'Quản lý các bộ hồ sơ tổng hợp và tài liệu PDF.' : 'Theo dõi tiến độ đề nghị từ các khoa phòng.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
             <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-red-500 outline-none transition-all" />
          </div>
          {isDossierTab ? (
            isProcurement && (
              <button onClick={() => setShowCreateDossierModal(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:scale-[1.02] transition-all whitespace-nowrap">
                <FolderPlus size={20} /> Tạo hồ sơ mới
              </button>
            )
          ) : (
            !isProcurement && (
              <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-red-100 hover:scale-[1.02] transition-all whitespace-nowrap">
                <Plus size={20} /> Tạo yêu cầu
              </button>
            )
          )}
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-3xl border border-white flex gap-1 shadow-sm overflow-x-auto scrollbar-hide">
        {!isDossierTab && (
          <button onClick={() => setCurrentTab('pending')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black transition-all whitespace-nowrap uppercase tracking-widest ${currentTab === 'pending' ? 'bg-white text-yellow-600 shadow-md ring-1 ring-yellow-100' : 'text-slate-400 hover:text-slate-600'}`}>
            <Inbox size={16} /> Chờ duyệt
            <span className={`ml-2 px-2 py-0.5 rounded-lg text-[10px] ${currentTab === 'pending' ? 'bg-yellow-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {counts.pending}
            </span>
          </button>
        )}
        
        <button onClick={() => setCurrentTab('accepted')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black transition-all whitespace-nowrap uppercase tracking-widest ${currentTab === 'accepted' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}>
          <Layers size={16} /> {isDossierTab ? 'Hồ sơ đang xử lý' : 'Đang xử lý'}
          <span className={`ml-2 px-2 py-0.5 rounded-lg text-[10px] ${currentTab === 'accepted' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
            {isDossierTab ? counts.processingDos : counts.processingReq}
          </span>
        </button>

        <button onClick={() => setCurrentTab('completed')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black transition-all whitespace-nowrap uppercase tracking-widest ${currentTab === 'completed' ? 'bg-white text-emerald-600 shadow-md ring-1 ring-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}>
          <CheckSquare size={16} /> {isDossierTab ? 'Hồ sơ đã hoàn tất' : 'Đã hoàn tất'}
          <span className={`ml-2 px-2 py-0.5 rounded-lg text-[10px] ${currentTab === 'completed' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
            {isDossierTab ? counts.completedDos : counts.completedReq}
          </span>
        </button>
      </div>

      {isDossierTab ? (
        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-sm overflow-hidden overflow-x-auto relative">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-16">STT</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên hồ sơ mua sắm</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hình thức</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày lập</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Đề nghị</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tài liệu</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dossierListFiltered.length > 0 ? dossierListFiltered.map((d, index) => (
                <tr key={d.id} className="hover:bg-indigo-50/50 transition-all group">
                  <td className="px-6 py-5 text-center font-bold text-slate-300">{index + 1}</td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-slate-700">{d.name}</p>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">{d.id}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-bold text-slate-500 italic block leading-tight max-w-[180px]">
                      {d.procurementMethod || 'Chưa xác định'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-500">{d.date}</td>
                  <td className="px-8 py-5 text-center">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg border border-slate-200 uppercase tracking-tighter flex items-center gap-1.5 w-fit mx-auto">
                      <ListOrdered size={12} /> {d.requestIds.length}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button onClick={() => setActiveDossierModal(d)} className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full text-[10px] font-black text-indigo-600 border border-indigo-100 shadow-sm hover:scale-105 transition-transform">
                      <FileType size={14} /> {d.files.length}
                    </button>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                       {currentTab === 'accepted' && isProcurement && (
                         <button onClick={() => handleCompleteDossier(d.id)} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
                           <FolderCheck size={14} /> Hoàn tất
                         </button>
                       )}
                       <button onClick={() => setActiveDossierModal(d)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-slate-100 shadow-sm" title="Xem chi tiết">
                         <Eye size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="py-20 text-center text-slate-400 italic text-sm">Chưa có hồ sơ mua sắm nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requestListFiltered.map((req) => (
            <div key={req.id} className="bg-white/90 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white shadow-sm hover:shadow-xl transition-all group overflow-hidden border-t-4 border-t-slate-100 hover:border-t-red-500">
               <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{req.id}</span>
                <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[req.status] || 'bg-slate-100'}`}>
                   {req.status.replace('_', ' ')}
                </span>
              </div>
              <h4 className="font-black text-slate-800 text-lg line-clamp-2 h-14 leading-tight">{req.title}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-wider">{req.department}</p>
              
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black shadow-sm">{req.requesterName.charAt(0)}</div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{req.requesterName}</p>
                </div>
                <div className="flex gap-2">
                  {isProcurement && req.status === 'PENDING' && req.targetUnitId === user.unitId ? (
                    <div className="flex gap-2">
                       <button onClick={() => setActiveRequest({ req, action: 'accept' })} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-emerald-100 active:scale-95 flex items-center gap-1.5"><CheckCircle size={14} /> Tiếp nhận</button>
                       <button onClick={() => setActiveRequest({ req, action: 'reject' })} className="bg-white text-red-600 border border-red-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-50 active:scale-95 flex items-center gap-1.5"><Ban size={14} /> Từ chối</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                       {req.status === 'PENDING' && (user.role === Role.ADMIN || req.requesterId === user.id) && (
                         <button 
                           onClick={() => setDeleteRequestConfirm(req)} 
                           className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-slate-100 hover:border-red-100 shadow-sm"
                           title="Xóa đề nghị"
                         >
                           <Trash2 size={18} />
                         </button>
                       )}
                       <button onClick={() => setPrintRequest(req)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-slate-100 hover:border-red-100 shadow-sm" title="In phiếu">
                         <Printer size={18} />
                       </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {requestListFiltered.length === 0 && (
             <div className="col-span-full py-20 text-center text-slate-400 italic text-sm">Không có yêu cầu nào trong mục này.</div>
          )}
        </div>
      )}

      {/* Modal xác nhận xóa đề nghị */}
      {deleteRequestConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
           <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 text-center">
              <div className="h-20 w-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Xác nhận xóa đề nghị?</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                Hành động này sẽ xóa vĩnh viễn đề nghị <span className="font-bold text-slate-700">"{deleteRequestConfirm.title}"</span>. Bạn không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                 <button onClick={() => setDeleteRequestConfirm(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs">Hủy bỏ</button>
                 <button onClick={handleDeleteRequest} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-red-100">Xác nhận xóa</button>
              </div>
           </div>
        </div>
      )}

      {/* Modal tạo hồ sơ (Dossier) mới */}
      {showCreateDossierModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <FolderPlus size={28} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Tạo hồ sơ mua sắm mới</h3>
                </div>
                <button onClick={() => setShowCreateDossierModal(false)} className="p-3 text-slate-300 hover:text-indigo-600 rounded-full transition-all">
                  <X size={28} />
                </button>
             </div>
             
             <div className="p-8 space-y-6 overflow-y-auto flex-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên bộ hồ sơ</label>
                  <input type="text" value={newDossierName} onChange={(e) => setNewDossierName(e.target.value)} placeholder="Nhập tên hồ sơ mua sắm..." className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hình thức mua sắm</label>
                  <div className="relative">
                    <select 
                      value={newDossierMethod} 
                      onChange={(e) => setNewDossierMethod(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm appearance-none cursor-pointer"
                    >
                      {procurementMethods.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                    <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                     <ClipboardList size={14} /> Chọn các đề nghị đính kèm
                   </label>
                   <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                     {requests.filter(r => r.status === 'RECEIVED' && !r.dossierId && r.targetUnitId === user.unitId).length > 0 ? (
                       requests.filter(r => r.status === 'RECEIVED' && !r.dossierId && r.targetUnitId === user.unitId).map(req => {
                         const isSelected = selectedRequestIds.includes(req.id);
                         return (
                           <div key={req.id} onClick={() => setSelectedRequestIds(prev => isSelected ? prev.filter(id => id !== req.id) : [...prev, req.id])} className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${isSelected ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                             <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200'}`}>
                               {isSelected && <CheckCircle2 size={14} />}
                             </div>
                             <div>
                               <p className="text-sm font-black text-slate-700">{req.title}</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase">{req.id} • {req.department}</p>
                             </div>
                           </div>
                         );
                       })
                     ) : (
                       <p className="text-sm text-slate-400 italic py-4 text-center">Không có đề nghị nào chưa lập hồ sơ.</p>
                     )}
                   </div>
                </div>
             </div>

             <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shadow-inner">
                <button onClick={() => setShowCreateDossierModal(false)} className="px-8 py-3 bg-white text-slate-600 rounded-xl font-black uppercase text-xs">Hủy</button>
                <button onClick={handleCreateDossier} className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-black shadow-lg text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700">
                   <Save size={18} /> Lưu bộ hồ sơ
                </button>
             </div>
          </div>
        </div>
      )}

      {activeDossierModal && (
        <DossierModal 
          dossier={activeDossierModal} 
          user={user}
          requests={requests}
          onClose={() => setActiveDossierModal(null)} 
          onSave={handleSaveDossierFiles} 
        />
      )}
      
      {activeRequest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 animate-in zoom-in-95">
            <h3 className={`text-2xl font-black uppercase tracking-tight mb-2 ${activeRequest.action === 'accept' ? 'text-emerald-600' : 'text-red-600'}`}>
               {activeRequest.action === 'accept' ? 'Tiếp nhận đề nghị' : 'Từ chối đề nghị'}
            </h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
               {activeRequest.action === 'accept' ? 'Đề nghị này sẽ được đưa vào danh sách chờ lập hồ sơ mua sắm.' : 'Vui lòng cung cấp lý do từ chối.'}
            </p>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] font-bold text-sm h-40 resize-none shadow-inner focus:ring-2 focus:ring-red-500 outline-none mb-2" placeholder="Ghi chú phản hồi..."/>
            <div className="mt-8 flex gap-4">
              <button onClick={() => setActiveRequest(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs">Hủy</button>
              <button onClick={() => {
                const updated = requests.map(r => r.id === activeRequest.req.id ? { ...r, status: activeRequest.action === 'accept' ? 'RECEIVED' : 'REJECTED', procurementNote: feedback } as ProcurementRequest : r);
                onUpdateRequests(updated);
                setActiveRequest(null);
                setFeedback('');
              }} className={`flex-1 py-4 text-white rounded-2xl font-black shadow-xl text-xs flex items-center justify-center gap-2 uppercase tracking-widest ${activeRequest.action === 'accept' ? 'bg-emerald-600 shadow-emerald-100' : 'bg-red-600 shadow-red-100'}`}>
                 {activeRequest.action === 'accept' ? <CheckCircle size={18} /> : <Ban size={18} />} Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && <ProcurementForm user={user} units={units} onClose={() => setShowForm(false)} onSubmit={(newReq) => onUpdateRequests([newReq, ...requests])} customLogo={customLogo} />}
      {printRequest && <PrintTemplate request={printRequest} onClose={() => setPrintRequest(null)} />}
    </div>
  );
};

const DossierModal = ({ dossier, user, requests, onClose, onSave }: { dossier: ProcurementDossier, user: User, requests: ProcurementRequest[], onClose: () => void, onSave: (id: string, items: DossierItem[], permitted: string[]) => void }) => {
  const [items, setItems] = useState<DossierItem[]>(dossier.files || []);
  const [permittedDepts, setPermittedDepts] = useState<string[]>(dossier.permittedDepartments || []);
  const [isMerging, setIsMerging] = useState(false);

  const canEdit = user.role === Role.ADMIN || (user.role === Role.PROCUREMENT && dossier.targetUnitId === user.unitId);

  const handleMergePDFs = async () => {
    const filesToMerge = items.filter(i => i.fileBase64);
    if (filesToMerge.length === 0) {
      alert("Hồ sơ này hiện chưa có file PDF nào.");
      return;
    }

    setIsMerging(true);
    try {
      const mergedPdf = await PDFDocument.create();
      mergedPdf.registerFontkit((fontkit as any).default || fontkit);
      
      const fontBold = await mergedPdf.embedFont(await fetch('https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/roboto/Roboto-Bold.ttf').then(res => res.arrayBuffer()));
      const fontRegular = await mergedPdf.embedFont(await fetch('https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/roboto/Roboto-Regular.ttf').then(res => res.arrayBuffer()));
      
      const page = mergedPdf.addPage([600, 800]);
      page.drawText('HỒ SƠ MUA SẮM TỔNG HỢP', { x: 50, y: 750, size: 22, font: fontBold, color: rgb(0.8, 0, 0) });
      page.drawText(`Mã hồ sơ: ${dossier.id}`, { x: 50, y: 710, size: 11, font: fontRegular });
      page.drawText(`Tên hồ sơ: ${dossier.name}`, { x: 50, y: 690, size: 11, font: fontRegular });
      page.drawText(`Hình thức: ${dossier.procurementMethod || 'N/A'}`, { x: 50, y: 670, size: 10, font: fontRegular });
      
      items.forEach((item, idx) => {
        page.drawText(`${idx + 1}. ${item.content || 'Tài liệu'} (${item.fileName})`, { x: 60, y: 640 - (idx * 20), size: 10, font: fontRegular });
      });

      for (const item of filesToMerge) {
        if (item.fileBase64) {
          const bytes = base64ToUint8Array(item.fileBase64);
          if (bytes) {
            const donorPdf = await PDFDocument.load(bytes);
            const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
            copiedPages.forEach(p => mergedPdf.addPage(p));
          }
        }
      }

      const mergedPdfBytes = await mergedPdf.save();
      const url = URL.createObjectURL(new Blob([mergedPdfBytes], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (error) {
      alert('Lỗi in hồ sơ. Vui lòng kiểm tra định dạng file đính kèm.');
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white rounded-[3rem] w-full max-w-6xl shadow-2xl overflow-hidden animate-in zoom-in-95 my-8 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-5">
             <div className="h-16 w-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
               {canEdit ? <FilePlus size={32} /> : <FileText size={32} />}
             </div>
             <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase leading-none">{dossier.name}</h3>
                <p className="text-[11px] font-bold text-indigo-500 mt-2 uppercase tracking-widest">{dossier.id} • {dossier.procurementMethod || 'N/A'}</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleMergePDFs} disabled={isMerging || items.length === 0} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 disabled:opacity-50">
              {isMerging ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
              {isMerging ? 'Đang chuẩn bị...' : 'In hồ sơ tổng hợp'}
            </button>
            <button onClick={onClose} className="p-4 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"><X size={32} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          <div className="w-full lg:w-72 bg-indigo-50/30 border-r border-indigo-50 p-6 overflow-y-auto">
            <h4 className="text-[12px] font-black text-indigo-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck size={18} /> Khoa được xem hồ sơ
            </h4>
            <div className="space-y-1.5">
              {HOSPITAL_DEPARTMENTS.map(dept => {
                const isSelected = permittedDepts.includes(dept);
                return (
                  <label key={dept} className={`flex items-center gap-3 p-3 rounded-2xl transition-all border ${isSelected ? 'bg-white border-indigo-200 shadow-sm' : 'bg-transparent border-transparent'} ${canEdit ? 'cursor-pointer' : 'opacity-70 pointer-events-none'}`}>
                    <input type="checkbox" checked={isSelected} disabled={!canEdit} onChange={() => {
                       setPermittedDepts(prev => prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]);
                    }} className="w-4 h-4 rounded-md text-indigo-600 border-indigo-200" />
                    <span className={`text-[10px] font-black uppercase tracking-tight ${isSelected ? 'text-indigo-700' : 'text-slate-400'}`}>{dept}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex-1 p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-100">
               <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Tài liệu PDF ({items.length})</h4>
               {canEdit && (
                 <button onClick={() => setItems([...items, { id: Date.now().toString(), content: '', fileName: '' }])} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg">
                    <Plus size={16} /> Thêm văn bản
                 </button>
               )}
            </div>

            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-200 group relative">
                  <div className="col-span-12 md:col-span-6">
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5">Tên tài liệu</label>
                    <input className="w-full bg-white px-5 py-3 rounded-2xl border border-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" value={item.content} readOnly={!canEdit} onChange={(e) => setItems(items.map(it => it.id === item.id ? { ...it, content: e.target.value } : it))} />
                  </div>
                  <div className="col-span-12 md:col-span-5">
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5">File PDF</label>
                    <div className="flex gap-2">
                       <label className={`flex items-center gap-3 w-full px-5 py-3 rounded-2xl border-2 border-dashed text-[11px] font-black ${canEdit ? 'cursor-pointer hover:border-indigo-300' : ''} ${item.fileName ? 'text-emerald-600 border-emerald-200' : 'text-slate-400 border-slate-200'}`}>
                          <FileUp size={18} /> <span className="truncate flex-1">{item.fileName || 'Chọn file...'}</span>
                          {canEdit && <input type="file" accept=".pdf" className="hidden" onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              const r = new FileReader();
                              r.onload = () => setItems(items.map(it => it.id === item.id ? { ...it, fileName: f.name, fileBase64: r.result as string } : it));
                              r.readAsDataURL(f);
                            }
                          }} />}
                       </label>
                       {item.fileBase64 && (
                         <button onClick={() => {const l=document.createElement('a');l.href=item.fileBase64!;l.download=item.fileName;l.click();}} className="p-3 bg-white text-indigo-600 border border-indigo-100 rounded-2xl"><Download size={18} /></button>
                       )}
                    </div>
                  </div>
                  {canEdit && (
                    <button onClick={() => setItems(items.filter(it => it.id !== item.id))} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><X size={20} /></button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shadow-inner">
           <button onClick={onClose} className="px-8 py-3 bg-white text-slate-600 rounded-xl font-black uppercase text-xs">Đóng</button>
           {canEdit && (
             <button onClick={() => onSave(dossier.id, items, permittedDepts)} className="px-12 py-3 bg-red-600 text-white rounded-xl font-black shadow-xl text-xs flex items-center gap-3 uppercase tracking-widest">
                <Send size={20} /> Lưu hồ sơ
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default RequestList;
