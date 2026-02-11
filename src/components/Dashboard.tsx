
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { User, Role, ProcurementRequest, InventoryTransaction } from '../types';
import { ShoppingBag, FileCheck, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Package } from 'lucide-react';

interface DashboardProps {
  user: User;
  requests: ProcurementRequest[];
  transactions: InventoryTransaction[];
}

const StatCard = ({ title, value, icon, trend, trendValue, colorClass }: any) => (
  <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 shadow-sm`}>
        {React.cloneElement(icon, { className: colorClass.replace('bg-', 'text-') })}
      </div>
      {trendValue && (
        <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-pink-500'}`}>
          {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {trendValue}
        </div>
      )}
    </div>
    <div className="mt-4">
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ user, requests, transactions }) => {
  const currentYear = new Date().getFullYear();

  // Tính toán số liệu thực tế
  const stats = useMemo(() => {
    const totalSpent = requests
      .filter(r => r.status === 'PURCHASED')
      .reduce((sum, r) => sum + (r.amount || 0), 0);
    
    const pendingCount = requests.filter(r => r.status === 'PENDING').length;
    
    const completedMonth = requests.filter(r => 
      r.status === 'PURCHASED' && 
      new Date(r.date).getMonth() === new Date().getMonth() &&
      new Date(r.date).getFullYear() === currentYear
    ).length;

    const stockItems = transactions.filter(t => t.type === 'IMPORT').reduce((sum, t) => sum + t.quantity, 0);

    return { totalSpent, pendingCount, completedMonth, stockItems };
  }, [requests, transactions, currentYear]);

  // Dữ liệu biểu đồ cột: Số lượng đơn hàng theo tháng
  const monthlyData = useMemo(() => {
    const months = ['Th.1', 'Th.2', 'Th.3', 'Th.4', 'Th.5', 'Th.6', 'Th.7', 'Th.8', 'Th.9', 'Th.10', 'Th.11', 'Th.12'];
    return months.map((name, index) => ({
      name,
      value: requests.filter(r => {
        const d = new Date(r.date);
        return d.getMonth() === index && d.getFullYear() === currentYear;
      }).length
    }));
  }, [requests, currentYear]);

  // Dữ liệu biểu đồ tròn: Phân bổ theo loại (Mua mới vs Sửa chữa)
  const typeDistribution = useMemo(() => {
    const purchase = requests.filter(r => r.type === 'PURCHASE').length;
    const repair = requests.filter(r => r.type === 'REPAIR').length;
    return [
      { name: 'Mua mới', value: purchase, color: '#6366f1' },
      { name: 'Sửa chữa', value: repair, color: '#ec4899' }
    ].filter(i => i.value > 0);
  }, [requests]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Xin chào, {user.name}! 👋</h2>
        <p className="text-slate-500 mt-1">Hệ thống đang hiển thị dữ liệu thực tế năm {currentYear}.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng giá trị đã mua" 
          value={`${(stats.totalSpent / 1000000).toFixed(1)}M đ`} 
          icon={<ShoppingBag size={24} />} 
          colorClass="bg-indigo-600"
        />
        <StatCard 
          title="Yêu cầu chờ duyệt" 
          value={stats.pendingCount} 
          icon={<FileCheck size={24} />} 
          trend={stats.pendingCount > 5 ? 'up' : 'down'}
          colorClass="bg-pink-500"
        />
        <StatCard 
          title="Đơn hoàn tất tháng này" 
          value={stats.completedMonth} 
          icon={<TrendingUp size={24} />} 
          colorClass="bg-emerald-500"
        />
        <StatCard 
          title="Tổng hàng nhập kho" 
          value={stats.stockItems} 
          icon={<Package size={24} />} 
          colorClass="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white shadow-sm h-[450px] flex flex-col">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800">Số lượng đề nghị theo tháng</h3>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Thống kê tất cả các khoa phòng năm {currentYear}</p>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white shadow-sm h-[450px] flex flex-col">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800">Cơ cấu loại đề nghị</h3>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Tỉ lệ giữa mua mới và sửa chữa</p>
          </div>
          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeDistribution} cx="50%" cy="45%" innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="value">
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Legend verticalAlign="bottom" align="center" iconType="circle" formatter={(value) => <span className="text-slate-600 text-sm font-medium">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-3xl font-extrabold text-slate-800">{requests.length}</p>
              <p className="text-xs font-medium text-slate-400 uppercase">Yêu cầu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
