
import React, { useState, useRef } from 'react';
import { User, Role, ProcurementUnit } from '../types';
import { ROLE_LABELS, HOSPITAL_DEPARTMENTS } from '../constants';
import { UserPlus, ShieldCheck, LayoutGrid, Plus, Trash2, Building, RefreshCw, CheckCircle2, HardDrive, Image as ImageIcon, Upload, X, RotateCcw, UserMinus, AlertTriangle, Briefcase, PlusCircle } from 'lucide-react';
import { HospitalLogo } from './Sidebar';
import { driveService } from '../services/driveService';

interface UserManagementProps {
  units: ProcurementUnit[];
  setUnits: React.Dispatch<React.SetStateAction<ProcurementUnit[]>>;
  procurementMethods: string[];
  setProcurementMethods: React.Dispatch<React.SetStateAction<string[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onRegisterUser: (user: User) => void;
  appLogo: string | null;
  onUpdateLogo: (logo: string | null) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ units, setUnits, procurementMethods, setProcurementMethods, users, setUsers, onRegisterUser, appLogo, onUpdateLogo }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [newMethodName, setNewMethodName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<Role>(Role.USAGE);
  const [regDept, setRegDept] = useState(HOSPITAL_DEPARTMENTS[0]);
  const [regUnitId, setRegUnitId] = useState('');

  const handleRegister = async () => {
    if (!regName || !regEmail || !regDept) return;
    setIsSyncing(true);
    const newUser: User = {
      id: Date.now().toString(),
      name: regName,
      email: regEmail,
      role: regRole,
      department: regDept,
      unitId: regRole === Role.PROCUREMENT ? regUnitId : undefined,
      mustChangePassword: true,
      password: '123456'
    };
    await onRegisterUser(newUser);
    setIsSyncing(false);
    setShowAddModal(false);
    setRegName(''); setRegEmail(''); setRegDept(HOSPITAL_DEPARTMENTS[0]); setRegUnitId('');
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn đặt lại mật khẩu của thành viên này về mặc định (123456)?')) return;
    const updatedUsers = users.map(u => u.id === userId ? { ...u, password: '123456', mustChangePassword: true } : u);
    setUsers(updatedUsers);
    await driveService.syncUsersToDrive(updatedUsers);
    alert('Đã reset mật khẩu thành công!');
  };

  const handleDeleteUser = async (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    await driveService.syncUsersToDrive(updatedUsers);
    setDeleteConfirm(null);
  };

  const handleAddUnit = () => {
    if (newUnitName.trim()) {
      setUnits([...units, { id: Date.now().toString(), name: newUnitName.trim() }]);
      setNewUnitName('');
    }
  };

  const handleAddMethod = () => {
    if (newMethodName.trim() && !procurementMethods.includes(newMethodName.trim())) {
      setProcurementMethods([...procurementMethods, newMethodName.trim()]);
      setNewMethodName('');
    }
  };

  const handleRemoveMethod = (method: string) => {
    if (confirm(`Bạn có muốn xóa hình thức "${method}" này không?`)) {
      setProcurementMethods(procurementMethods.filter(m => m !== method));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Quản trị hệ thống</h2>
          <div className="flex items-center gap-2 mt-1">
             <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold border border-emerald-100 uppercase">
                <HardDrive size={12} />
                Hệ thống đồng bộ
             </div>
             <span className="text-slate-400 text-xs">•</span>
             <p className="text-slate-500 text-xs font-medium">Quản lý cấu hình, danh mục và nhân sự.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 tracking-widest"
        >
          <UserPlus size={18} />
          Đăng ký thành viên
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-700 flex items-center gap-2 uppercase text-sm tracking-tight">
                <ShieldCheck size={20} className="text-indigo-500" />
                Danh sách thành viên ({users.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thành viên</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vai trò</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs shadow-inner">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-700">{u.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{u.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="inline-flex px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100">
                          {ROLE_LABELS[u.role]}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleResetPassword(u.id)}
                            className="p-2.5 text-amber-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all border border-transparent hover:border-amber-100"
                            title="Reset mật khẩu"
                          >
                            <RotateCcw size={18} />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm(u.id)}
                            className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                            title="Xóa thành viên"
                          >
                            <UserMinus size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white shadow-sm p-8">
            <h3 className="font-black text-slate-700 flex items-center gap-2 mb-8 uppercase text-sm tracking-tight">
              <Briefcase size={20} className="text-indigo-600" /> Hình thức các gói thầu
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {procurementMethods.map((method, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                  <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight leading-tight flex-1 pr-4">{method}</span>
                  <button onClick={() => handleRemoveMethod(method)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3 bg-slate-100 p-2 rounded-[1.5rem] border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
              <input 
                type="text" 
                value={newMethodName} 
                onChange={(e) => setNewMethodName(e.target.value)} 
                placeholder="Nhập tên hình thức gói thầu mới..." 
                className="flex-1 px-4 py-3 bg-transparent border-0 font-bold text-sm outline-none" 
              />
              <button onClick={handleAddMethod} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">
                <Plus size={16} /> Thêm hình thức
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white shadow-sm p-8">
            <h3 className="font-black text-slate-700 flex items-center gap-2 mb-8 uppercase text-xs tracking-widest">
              <ImageIcon size={20} className="text-red-500" /> Logo Bệnh Viện
            </h3>
            <div className="flex flex-col items-center">
               <div className="w-36 h-36 bg-slate-50 rounded-full border-4 border-white shadow-inner flex items-center justify-center mb-8 relative group overflow-hidden">
                 <HospitalLogo className="w-[85%] h-[85%]" src={appLogo} />
                 {appLogo && (
                   <button onClick={() => onUpdateLogo(null)} className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                     <Trash2 size={24} /> <span className="text-[10px] font-black uppercase">Xóa logo</span>
                   </button>
                 )}
               </div>
               <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
               <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl shadow-red-100 hover:bg-red-700 transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest">
                 <Upload size={18} /> Tải logo công ty
               </button>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white shadow-sm p-8">
            <h3 className="font-black text-slate-700 flex items-center gap-2 mb-8 uppercase text-xs tracking-widest">
              <LayoutGrid size={20} className="text-pink-500" /> Đơn vị mua sắm
            </h3>
            <div className="space-y-2 mb-8 max-h-56 overflow-y-auto pr-1">
              {units.map((unit) => (
                <div key={unit.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{unit.name}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <input type="text" value={newUnitName} onChange={(e) => setNewUnitName(e.target.value)} placeholder="Tên bộ phận..." className="w-full px-5 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-pink-500" />
              <button onClick={handleAddUnit} className="w-full py-3.5 bg-pink-600 text-white rounded-2xl font-black shadow-lg hover:bg-pink-700 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                <PlusCircle size={18} /> Thêm đơn vị
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-sm p-10 shadow-2xl animate-in zoom-in-95 text-center">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                 <AlertTriangle size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Xác nhận xóa?</h3>
              <p className="text-sm text-slate-500 mt-2 mb-8 font-medium leading-relaxed">Hành động này không thể hoàn tác. Mọi dữ liệu liên quan đến thành viên này sẽ không thể đăng nhập được nữa.</p>
              <div className="flex gap-4">
                 <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs">Hủy bỏ</button>
                 <button onClick={() => handleDeleteUser(deleteConfirm)} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-red-100">Xóa vĩnh viễn</button>
              </div>
           </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Đăng ký thành viên</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Hệ thống sẽ đồng bộ lên Cloud sau khi đăng ký.</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600"><UserPlus size={28} /></div>
              </div>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Họ và tên</label>
                    <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="Nguyễn Văn A" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email công tác</label>
                    <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="email@..." />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Khoa / Phòng công tác</label>
                  <select value={regDept} onChange={(e) => setRegDept(e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-sm cursor-pointer shadow-sm">
                    {HOSPITAL_DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vai trò hệ thống</label>
                  <select value={regRole} onChange={(e) => setRegRole(e.target.value as Role)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-sm cursor-pointer shadow-sm">
                    {Object.entries(Role).map(([key, value]) => <option key={value} value={value}>{ROLE_LABELS[value]}</option>)}
                  </select>
                </div>
                {regRole === Role.PROCUREMENT && (
                  <div className="space-y-1.5 p-4 bg-pink-50/30 rounded-2xl border border-pink-100">
                    <label className="text-[10px] font-black text-pink-600 uppercase tracking-widest ml-1">Phòng chức năng mua sắm</label>
                    <select value={regUnitId} onChange={(e) => setRegUnitId(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-pink-100 rounded-2xl focus:ring-2 focus:ring-pink-500 font-bold text-sm cursor-pointer mt-1">
                      <option value="">-- Chọn bộ phận mua sắm --</option>
                      {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="mt-10 flex gap-4">
                <button onClick={() => setShowAddModal(false)} disabled={isSyncing} className="flex-1 px-4 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50">Đóng</button>
                <button onClick={handleRegister} disabled={isSyncing} className="flex-1 px-4 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest disabled:bg-indigo-400">
                  {isSyncing ? <RefreshCw className="animate-spin" size={20} /> : <CheckCircle2 size={20} />} {isSyncing ? 'Đang lưu...' : 'Lưu tài khoản'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
