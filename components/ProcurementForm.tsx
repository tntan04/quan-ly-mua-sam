
import React, { useState } from 'react';
import { User, RequestType, RequestItem, ProcurementUnit, ProcurementRequest } from '../types';
import { X, Plus, Trash2, Calendar, Save, FileText, Wrench, AlertCircle } from 'lucide-react';
import { HospitalLogo } from './Sidebar';

interface ProcurementFormProps {
  user: User;
  units: ProcurementUnit[];
  onClose: () => void;
  onSubmit: (request: ProcurementRequest) => void;
  customLogo?: string | null;
}

const ProcurementForm: React.FC<ProcurementFormProps> = ({ user, units, onClose, onSubmit, customLogo }) => {
  const [type, setType] = useState<RequestType>('PURCHASE');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetUnit, setTargetUnit] = useState(units[0]?.id || '');
  const [items, setItems] = useState<RequestItem[]>([
    { id: '1', name: '', quantityUnit: '', purposeOrDamage: '', note: '' }
  ]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: '', quantityUnit: '', purposeOrDamage: '', note: '' }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof RequestItem, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = () => {
    setError('');
    
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề đề nghị.');
      return;
    }

    const hasValidItem = items.some(item => item.name.trim() !== '' && item.quantityUnit.trim() !== '');
    if (!hasValidItem) {
      setError('Vui lòng nhập ít nhất một thiết bị/vật tư đầy đủ thông tin.');
      return;
    }

    setIsSubmitting(true);

    // Giả lập độ trễ gửi dữ liệu
    setTimeout(() => {
      const newRequest: ProcurementRequest = {
        id: `REQ-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        type,
        title: title.trim(),
        requesterId: user.id,
        requesterName: user.name,
        department: user.department,
        targetUnitId: targetUnit,
        status: 'PENDING',
        date,
        items: items.filter(item => item.name.trim() !== ''),
      };

      onSubmit(newRequest);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-8">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-red-50/20">
            <div className="flex gap-5">
              <div className="bg-white p-0.5 rounded-full shadow-xl border border-red-100 w-20 h-20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <HospitalLogo className="w-[90%] h-[90%]" src={customLogo} />
              </div>
              <div className="pt-1">
                <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase leading-none">BỆNH VIỆN TIM MẠCH</h3>
                <h3 className="text-lg font-black text-red-600 tracking-tight uppercase mt-1">THÀNH PHỐ CẦN THƠ</h3>
                <div className="flex items-center gap-2 mt-2">
                   <div className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold uppercase tracking-widest">KHOA/PHÒNG</div>
                   <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">{user.department}</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-red-50 hover:text-red-600 rounded-full transition-all text-slate-300">
              <X size={28} />
            </button>
          </div>

          <div className="p-8 overflow-y-auto max-h-[60vh]">
            {/* Form Info Section */}
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Tiêu đề đề nghị</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Vd: Đề nghị mua sắm máy in cho khoa..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 font-bold text-lg shadow-sm"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Loại đề nghị</label>
                  <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
                    <button 
                      onClick={() => setType('PURCHASE')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${type === 'PURCHASE' ? 'bg-white text-red-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <FileText size={16} /> Mua mới
                    </button>
                    <button 
                      onClick={() => setType('REPAIR')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${type === 'REPAIR' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Wrench size={16} /> Sửa chữa
                    </button>
                  </div>
                </div>

                <div className="w-full md:w-48">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Ngày lập phiếu</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 font-bold text-sm shadow-sm" 
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Đơn vị giải quyết</label>
                  <select 
                    value={targetUnit}
                    onChange={(e) => setTargetUnit(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 font-bold text-sm shadow-sm cursor-pointer"
                  >
                    {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-6 flex justify-between items-end border-b border-red-100 pb-2">
              <h4 className="font-black text-slate-700 flex items-center gap-2 uppercase text-xs tracking-[0.2em]">
                {type === 'PURCHASE' ? 'DANH MỤC CẤP MỚI' : 'DANH MỤC HƯ HỎNG'}
              </h4>
              <button 
                onClick={addItem}
                className="text-[10px] font-black text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors uppercase tracking-widest"
              >
                <Plus size={16} /> Thêm dòng
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 p-5 bg-slate-50 rounded-3xl border border-slate-100 relative group transition-all hover:bg-white hover:shadow-xl hover:border-red-100">
                  <div className="col-span-12 md:col-span-4">
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Tên thiết bị/Vật tư</label>
                    <input 
                      className="w-full bg-transparent border-0 border-b-2 border-slate-200 focus:border-red-500 focus:ring-0 text-sm font-bold p-1 px-0"
                      placeholder="Nhập tên..."
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Số lượng/ĐVT</label>
                    <input 
                      className="w-full bg-transparent border-0 border-b-2 border-slate-200 focus:border-red-500 focus:ring-0 text-sm font-bold p-1 px-0"
                      placeholder="vd: 01 Cái"
                      value={item.quantityUnit}
                      onChange={(e) => updateItem(item.id, 'quantityUnit', e.target.value)}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">
                      {type === 'PURCHASE' ? 'Mục đích sử dụng' : 'Tình trạng'}
                    </label>
                    <input 
                      className="w-full bg-transparent border-0 border-b-2 border-slate-200 focus:border-red-500 focus:ring-0 text-sm font-bold p-1 px-0"
                      placeholder="..."
                      value={item.purposeOrDamage}
                      onChange={(e) => updateItem(item.id, 'purposeOrDamage', e.target.value)}
                    />
                  </div>
                  <div className="col-span-10 md:col-span-2">
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Ghi chú</label>
                    <input 
                      className="w-full bg-transparent border-0 border-b-2 border-slate-200 focus:border-red-500 focus:ring-0 text-sm font-bold p-1 px-0"
                      placeholder="..."
                      value={item.note}
                      onChange={(e) => updateItem(item.id, 'note', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-end justify-center">
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-bounce">
                <AlertCircle size={20} />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}
          </div>

          <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 shadow-inner">
            <button 
              onClick={onClose}
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-white text-slate-600 rounded-2xl font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all text-xs disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-10 py-3.5 bg-red-600 text-white rounded-2xl font-black shadow-xl shadow-red-100 hover:bg-red-700 transition-all active:scale-95 uppercase tracking-widest text-xs disabled:bg-slate-400 disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang gửi...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Gửi yêu cầu
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcurementForm;
