
import React, { useState, useMemo } from 'react';
import { User, Role, GoodsItem, InventoryTransaction, ProcurementRequest } from '../types';
import { HOSPITAL_DEPARTMENTS } from '../constants';
import { 
  Package, Plus, Search, ArrowDownLeft, ArrowUpRight, 
  History, BarChart3, Filter, Box, DollarSign, Warehouse,
  Truck, ArrowRightLeft, FilePieChart, X, Save, FileText,
  Briefcase, Hash, Building2, Calculator, ChevronRight,
  ClipboardList, ListChecks, ArrowDownCircle, Info, Trash2,
  PlusCircle, ShoppingCart
} from 'lucide-react';

interface GoodsManagementProps {
  user: User;
  requests?: ProcurementRequest[];
}

interface NewImportItem {
  id: string;
  name: string;
  supplier: string;
  unit: string;
  quantity: number;
  price: number;
}

const GoodsManagement: React.FC<GoodsManagementProps> = ({ user, requests = [] }) => {
  const [goods, setGoods] = useState<GoodsItem[]>([
    { id: 'G001', name: 'Máy in Canon LBP2900', unit: 'Cái', category: 'Thiết bị văn phòng', price: 4500000, supplier: 'Công ty Nam Long' },
    { id: 'G002', name: 'Giấy A4 Double A', unit: 'Ram', category: 'Văn phòng phẩm', price: 65000, supplier: 'Văn phòng phẩm Ánh Dương' }
  ]);

  const [transactions, setTransactions] = useState<InventoryTransaction[]>([
    { id: 'T001', goodsId: 'G001', type: 'IMPORT', status: 'COMPLETED', quantity: 20, fromDept: 'NCC Nam Long', toDept: 'WAREHOUSE', date: '2024-03-20', supplier: 'Công ty Nam Long', price: 4500000 },
    { id: 'T002', goodsId: 'G002', type: 'IMPORT', status: 'COMPLETED', quantity: 200, fromDept: 'NCC Ánh Dương', toDept: 'WAREHOUSE', date: '2024-03-21', supplier: 'Văn phòng phẩm Ánh Dương', price: 65000 },
    { id: 'T003', goodsId: 'G001', type: 'TRANSFER', status: 'COMPLETED', quantity: 5, fromDept: 'WAREHOUSE', toDept: 'Phòng Công nghệ Thông tin', date: '2024-03-22', price: 4500000 },
    { id: 'T004', goodsId: 'G001', type: 'TRANSFER', status: 'PENDING', quantity: 2, fromDept: 'WAREHOUSE', toDept: 'Khoa Nội tim mạch', date: '2024-03-23', price: 4500000 },
  ]);

  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'detail' | 'history'>('summary');
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDistributeModal, setShowDistributeModal] = useState(false);

  const [distGoodsId, setDistGoodsId] = useState('');
  const [distToDept, setDistToDept] = useState(HOSPITAL_DEPARTMENTS[0]);
  const [distQty, setDistQty] = useState(0);

  const [importItems, setImportItems] = useState<NewImportItem[]>([
    { id: Date.now().toString(), name: '', supplier: '', unit: '', quantity: 0, price: 0 }
  ]);

  const isAdminOrProc = user.role === Role.ADMIN || user.role === Role.PROCUREMENT;

  const summaryData = useMemo(() => {
    const data: Record<string, any> = {};
    goods.forEach(g => {
      const openingStock = transactions
        .filter(t => t.goodsId === g.id && t.type === 'IMPORT')
        .reduce((sum, t) => sum + t.quantity, 0);
      const exportedQty = transactions
        .filter(t => t.goodsId === g.id && t.type === 'TRANSFER' && t.status === 'COMPLETED')
        .reduce((sum, t) => sum + t.quantity, 0);
      const pendingQty = transactions
        .filter(t => t.goodsId === g.id && t.type === 'TRANSFER' && t.status === 'PENDING')
        .reduce((sum, t) => sum + t.quantity, 0);
      const closingStock = openingStock - exportedQty - pendingQty;
      data[g.id] = { ...g, openingStock, exportedQty, pendingQty, closingStock };
    });
    return Object.values(data).filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [goods, transactions, searchTerm]);

  const detailedReport = useMemo(() => {
    return transactions
      .filter(t => t.type === 'TRANSFER')
      .map(t => ({
        ...t,
        goodsName: goods.find(g => g.id === t.goodsId)?.name || 'N/A',
        supplier: goods.find(g => g.id === t.goodsId)?.supplier || 'N/A'
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, goods]);

  const handleAddImportRow = () => {
    setImportItems([...importItems, { id: (Date.now() + Math.random()).toString(), name: '', supplier: '', unit: '', quantity: 0, price: 0 }]);
  };

  const handleRemoveImportRow = (id: string) => {
    if (importItems.length > 1) {
      setImportItems(importItems.filter(i => i.id !== id));
    }
  };

  const updateImportItem = (id: string, field: keyof NewImportItem, value: any) => {
    setImportItems(importItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const formatInputPrice = (value: string) => {
    const rawValue = value.replace(/\./g, '');
    if (rawValue === '') return 0;
    const numValue = parseInt(rawValue);
    return isNaN(numValue) ? 0 : numValue;
  };

  const handleSaveImport = () => {
    const validItems = importItems.filter(i => i.name.trim() !== '' && i.quantity > 0);
    if (validItems.length === 0) {
      alert("Vui lòng nhập ít nhất một mặt hàng hợp lệ.");
      return;
    }

    const newTransactions: InventoryTransaction[] = [];
    const newGoodsEntries: GoodsItem[] = [...goods];
    const now = new Date().toISOString().split('T')[0];

    validItems.forEach(item => {
      const goodsId = "G-" + Date.now() + Math.random();
      newGoodsEntries.push({
        id: goodsId,
        name: item.name,
        unit: item.unit,
        category: 'Hàng nhập kho',
        price: item.price,
        supplier: item.supplier
      });
      newTransactions.push({
        id: "TXN-" + Date.now() + Math.random(),
        goodsId,
        type: 'IMPORT',
        status: 'COMPLETED',
        quantity: item.quantity,
        price: item.price,
        supplier: item.supplier,
        fromDept: "NCC " + item.supplier,
        toDept: 'WAREHOUSE',
        date: now
      });
    });

    setGoods(newGoodsEntries);
    setTransactions([...transactions, ...newTransactions]);
    setShowImportModal(false);
    setImportItems([{ id: Date.now().toString(), name: '', supplier: '', unit: '', quantity: 0, price: 0 }]);
    alert("Đã nhập kho thành công " + validItems.length + " mặt hàng.");
  };

  // Lấy tồn kho của mặt hàng đang chọn trong Modal Cấp phát
  const currentSelectedStock = useMemo(() => {
    if (!distGoodsId) return 0;
    return summaryData.find(s => s.id === distGoodsId)?.closingStock || 0;
  }, [distGoodsId, summaryData]);

  const handleDistQtyChange = (val: string) => {
    let num = parseInt(val) || 0;
    if (num < 0) num = 0;
    // Chỉ cho phép nhập tối đa bằng số lượng tồn kho
    if (num > currentSelectedStock) {
      num = currentSelectedStock;
    }
    setDistQty(num);
  };

  const handleDistribute = () => {
    if (!distGoodsId || distQty <= 0) { 
      alert("Vui lòng chọn hàng hóa và nhập số lượng xuất hợp lệ."); 
      return; 
    }
    
    if (distQty > currentSelectedStock) { 
      alert("Vượt quá tồn kho thực tế (" + currentSelectedStock + ")."); 
      return; 
    }

    const newTxn: InventoryTransaction = {
      id: "TXN-" + Date.now(),
      goodsId: distGoodsId,
      type: 'TRANSFER',
      status: 'PENDING',
      quantity: distQty,
      price: goods.find(g => g.id === distGoodsId)?.price || 0,
      fromDept: 'WAREHOUSE',
      toDept: distToDept,
      date: new Date().toISOString().split('T')[0]
    };
    setTransactions([...transactions, newTxn]);
    setShowDistributeModal(false);
    setDistQty(0);
    setDistGoodsId('');
    alert("Đã tạo phiếu cấp phát (Chờ nhận).");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Warehouse className="text-red-600" size={32} />
            Quản lý Xuất - Nhập - Tồn
          </h2>
          <p className="text-slate-500 mt-1 font-medium text-sm italic">
            Theo dõi tồn đầu, số lượng xuất, chờ xuất và tồn cuối thực tế.
          </p>
        </div>
        {isAdminOrProc && (
          <div className="flex gap-3">
            <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:scale-[1.02] transition-all">
              <Plus size={18} /> Nhập kho mới
            </button>
            <button onClick={() => setShowDistributeModal(true)} className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-red-100 hover:scale-[1.02] transition-all">
              <Truck size={18} /> Cấp phát khoa phòng
            </button>
          </div>
        )}
      </div>

      <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-3xl border border-white flex gap-1 shadow-sm w-fit overflow-x-auto scrollbar-hide">
        <button onClick={() => setActiveSubTab('summary')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeSubTab === 'summary' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}>
          <ClipboardList size={16} /> Tồn kho tổng hợp
        </button>
        <button onClick={() => setActiveSubTab('detail')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeSubTab === 'detail' ? 'bg-white text-emerald-600 shadow-md ring-1 ring-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}>
          <ListChecks size={16} /> Báo cáo chi tiết cấp phát
        </button>
        <button onClick={() => setActiveSubTab('history')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeSubTab === 'history' ? 'bg-white text-amber-600 shadow-md ring-1 ring-amber-100' : 'text-slate-400 hover:text-slate-600'}`}>
          <History size={16} /> Nhật ký giao dịch
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Tìm tên hàng hóa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
      </div>

      {activeSubTab === 'summary' && (
        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-sm overflow-hidden overflow-x-auto relative">
          <table className="w-full text-left min-w-[1200px]">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-14">STT</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên hàng hóa</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Công ty cung cấp</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Đơn giá</th>
                <th className="px-6 py-4 text-[10px] font-black text-indigo-500 uppercase tracking-widest text-center bg-indigo-50/30">Tồn đầu</th>
                <th className="px-6 py-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest text-center bg-emerald-50/30">SL Xuất</th>
                <th className="px-6 py-4 text-[10px] font-black text-amber-600 uppercase tracking-widest text-center bg-amber-50/30">SL Chờ</th>
                <th className="px-6 py-4 text-[10px] font-black text-red-600 uppercase tracking-widest text-center bg-red-50/30">Tồn cuối</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tổng tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summaryData.map((item, index) => (
                <tr key={item.id} className="hover:bg-indigo-50/30 transition-all group">
                  <td className="px-6 py-4 text-center font-bold text-slate-300 text-xs">{index + 1}</td>
                  <td className="px-8 py-4">
                    <p className="text-sm font-black text-slate-700">{item.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{item.unit}</p>
                  </td>
                  <td className="px-8 py-4 text-[11px] font-bold text-slate-500">{item.supplier}</td>
                  <td className="px-6 py-4 text-center font-black text-slate-600 text-[10px]">{item.price.toLocaleString('vi-VN')} đ</td>
                  <td className="px-6 py-4 text-center font-black text-indigo-600 bg-indigo-50/10 text-xs">{item.openingStock}</td>
                  <td className="px-6 py-4 text-center font-black text-emerald-600 bg-emerald-50/10 text-xs">{item.exportedQty}</td>
                  <td className="px-6 py-4 text-center font-black text-amber-600 bg-amber-50/10 text-xs">{item.pendingQty}</td>
                  <td className="px-6 py-4 text-center font-black text-red-600 bg-red-50/10 text-xs">{item.closingStock}</td>
                  <td className="px-8 py-4 text-right font-black text-slate-800 text-xs">
                    {(item.closingStock * item.price).toLocaleString('vi-VN')} đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Nhập kho mới */}
      {showImportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white rounded-[3rem] w-full max-w-6xl shadow-2xl overflow-hidden animate-in zoom-in-95 my-8 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <ShoppingCart size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">Nhập kho hàng hóa</h3>
                  <p className="text-[10px] font-bold text-indigo-500 mt-2 uppercase tracking-widest">Quy trình nhập kho tổng</p>
                </div>
              </div>
              <button onClick={() => setShowImportModal(false)} className="p-4 text-slate-300 hover:text-red-600 rounded-full transition-all">
                <X size={32} />
              </button>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
              <div className="mb-6 flex justify-between items-center">
                 <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Danh mục hàng hóa nhập mới</h4>
                 <button onClick={handleAddImportRow} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg">
                    <PlusCircle size={16} /> Thêm dòng mới
                 </button>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase text-center w-12">STT</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Tên hàng hóa</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Công ty cung cấp</th>
                      <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase text-center w-24">ĐVT</th>
                      <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase text-center w-24">Số lượng</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right w-40">Đơn giá (đ)</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right w-40">Thành tiền</th>
                      <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-4 py-4 text-center font-black text-slate-300 text-xs">{idx + 1}</td>
                        <td className="px-6 py-3">
                          <input 
                            type="text" 
                            className="w-full bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                            placeholder="Tên thiết bị..."
                            value={item.name}
                            onChange={(e) => updateImportItem(item.id, 'name', e.target.value)}
                          />
                        </td>
                        <td className="px-6 py-3">
                          <input 
                            type="text" 
                            className="w-full bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                            placeholder="Nhà cung cấp..."
                            value={item.supplier}
                            onChange={(e) => updateImportItem(item.id, 'supplier', e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input 
                            type="text" 
                            className="w-full bg-white px-2 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-indigo-500 text-center outline-none shadow-sm"
                            placeholder="Cái"
                            value={item.unit}
                            onChange={(e) => updateImportItem(item.id, 'unit', e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input 
                            type="number" 
                            className="w-full bg-white px-2 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-indigo-500 text-center outline-none shadow-sm"
                            placeholder="0"
                            value={item.quantity || ''}
                            onChange={(e) => updateImportItem(item.id, 'quantity', Number(e.target.value))}
                          />
                        </td>
                        <td className="px-6 py-3 text-right">
                          <input 
                            type="text" 
                            className="w-full bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-indigo-500 text-right outline-none shadow-sm"
                            placeholder="0"
                            value={item.price === 0 ? '' : item.price.toLocaleString('vi-VN')}
                            onChange={(e) => {
                              const numericValue = formatInputPrice(e.target.value);
                              updateImportItem(item.id, 'price', numericValue);
                            }}
                          />
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span className="text-xs font-black text-slate-700">
                             {(item.quantity * item.price).toLocaleString('vi-VN')} đ
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => handleRemoveImportRow(item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end items-center gap-6 shadow-inner">
               <div className="mr-auto flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-indigo-100 shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng cộng:</span>
                  <span className="text-xl font-black text-indigo-600 tracking-tighter">
                    {importItems.reduce((sum, i) => sum + (i.quantity * i.price), 0).toLocaleString('vi-VN')} đ
                  </span>
               </div>
               <button onClick={() => setShowImportModal(false)} className="px-8 py-3 bg-white text-slate-600 rounded-xl font-black uppercase text-xs border border-slate-200">Hủy</button>
               <button onClick={handleSaveImport} className="px-12 py-3 bg-red-600 text-white rounded-xl font-black shadow-xl text-xs flex items-center gap-3 uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all">
                  <Save size={20} /> Hoàn tất nhập kho
               </button>
            </div>
          </div>
        </div>
      )}

      {showDistributeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-red-50/30">
                <div className="flex items-center gap-5">
                   <div className="h-16 w-16 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                      <Truck size={32} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Cấp phát khoa</h3>
                   </div>
                </div>
                <button onClick={() => setShowDistributeModal(false)} className="p-4 text-slate-300 hover:text-red-600 rounded-full transition-all">
                   <X size={32} />
                </button>
             </div>
             <div className="p-10 space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Chọn hàng hóa</label>
                   <select value={distGoodsId} onChange={(e) => { setDistGoodsId(e.target.value); setDistQty(0); }} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-sm outline-none transition-all focus:ring-2 focus:ring-red-500">
                      <option value="">-- Chọn hàng hóa --</option>
                      {summaryData.filter(s => s.closingStock > 0).map(s => (
                        <option key={s.id} value={s.id}>{s.name} (Tồn: {s.closingStock} {s.unit})</option>
                      ))}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Khoa phòng nhận</label>
                   <select value={distToDept} onChange={(e) => setDistToDept(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-sm outline-none transition-all focus:ring-2 focus:ring-red-500">
                      {HOSPITAL_DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between items-end mb-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Số lượng xuất</label>
                      {distGoodsId && (
                        <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">Tối đa: {currentSelectedStock}</span>
                      )}
                   </div>
                   <input 
                      type="number" 
                      value={distQty || ''} 
                      max={currentSelectedStock}
                      min={0}
                      onChange={(e) => handleDistQtyChange(e.target.value)} 
                      placeholder="0" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg outline-none transition-all focus:ring-2 focus:ring-red-500" 
                    />
                </div>
             </div>
             <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 shadow-inner">
                <button onClick={() => setShowDistributeModal(false)} className="px-8 py-4 bg-white text-slate-600 rounded-2xl font-black uppercase text-xs border border-slate-200">Hủy</button>
                <button onClick={handleDistribute} className="px-12 py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl text-xs uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all">
                   Xác nhận xuất kho
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoodsManagement;
