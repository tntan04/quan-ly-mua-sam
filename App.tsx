
import React, { useState, useEffect } from 'react';
import { Role, User, ProcurementUnit, ProcurementRequest, GoodsItem, InventoryTransaction, ProcurementDossier } from './types';
import Sidebar from './components/sidebar';
import MobileNav from './components/MobileNav';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import RequestList from './components/RequestList';
import Header from './components/Header';
import GuestView from './components/GuestView';
import Login from './components/Login';
import PasswordChange from './components/PasswordChange';
import GoodsManagement from './components/GoodsManagement';
import Reports from './components/Reports';
import Profile from './components/Profile';
import { driveService } from './services/driveService';
import { apiService } from './services/apiService';
import { initializeDB } from './services/dbService';

const INITIAL_USERS: User[] = [
  { 
    id: '1', 
    name: 'Quản trị viên Hệ thống', 
    email: 'tntankg@gmail.com', 
    password: '123456',
    role: Role.ADMIN, 
    department: 'Phòng Công nghệ Thông tin' 
  }
];

const DEFAULT_UNITS: ProcurementUnit[] = [
  { id: '1', name: 'Phòng Hành chính Quản trị' },
  { id: '2', name: 'Phòng Vật tư - Thiết bị Y tế' },
  { id: '3', name: 'Khoa Dược' },
  { id: '4', name: 'Phòng Kế hoạch tổng hợp' }
];

const DEFAULT_METHODS = [
  "Mua sắm gói thầu dưới 10 triệu đồng",
  "Mua sắm gói thầu từ 10 triệu đến dưới 50 triệu đồng",
  "Mua sắm gói thầu trên 50 triệu đồng"
];

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [dossiers, setDossiers] = useState<ProcurementDossier[]>(() => {
    const saved = localStorage.getItem('procurement_dossiers');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [procurementMethods, setProcurementMethods] = useState<string[]>(() => {
    const saved = localStorage.getItem('procurement_methods');
    return saved ? JSON.parse(saved) : DEFAULT_METHODS;
  });

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

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [procurementUnits, setProcurementUnits] = useState<ProcurementUnit[]>(DEFAULT_UNITS);
  const [appLogo, setAppLogo] = useState<string | null>(localStorage.getItem('custom_app_logo'));
  const [serverOnline, setServerOnline] = useState(false);

  useEffect(() => {
    localStorage.setItem('procurement_methods', JSON.stringify(procurementMethods));
  }, [procurementMethods]);

  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('procurement_dossiers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (JSON.stringify(parsed) !== JSON.stringify(dossiers)) {
          setDossiers(parsed);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [dossiers]);

  const syncAllData = async () => {
    const [serverUsers, serverRequests] = await Promise.all([
      apiService.loadUsers(),
      apiService.loadRequests()
    ]);

    if (serverUsers) {
      setUsers(serverUsers);
      setServerOnline(true);
    } else {
      const savedUsers = await driveService.loadUsersFromDrive();
      if (savedUsers) setUsers(savedUsers);
      setServerOnline(false);
    }

    if (serverRequests) {
      setRequests(serverRequests);
    } else {
      const savedRequests = await driveService.loadRequestsFromDrive();
      if (savedRequests) setRequests(savedRequests);
    }
  };

  useEffect(() => {
    initializeDB();
    syncAllData();
    const interval = setInterval(async () => {
      const status = await apiService.checkConnection();
      setServerOnline(status);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (email: string, pass: string) => {
    setLoginError('');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
    } else {
      setLoginError('Email hoặc mật khẩu không chính xác.');
    }
  };

  const handleResetPassword = async (email: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, msg: 'Email không tồn tại trong hệ thống.' };
    }
    const newRandomPass = Math.random().toString(36).slice(-8);
    const updatedUsers = users.map(u => u.id === user.id ? { ...u, password: newRandomPass, mustChangePassword: true } : u);
    setUsers(updatedUsers);
    await Promise.all([
      apiService.saveUsers(updatedUsers),
      driveService.syncUsersToDrive(updatedUsers)
    ]);
    console.log(`[SIMULATED EMAIL] To: ${email} - Nội dung: Mật khẩu mới của bạn là: ${newRandomPass}`);
    return { success: true, msg: `Mật khẩu mới đã được tạo và gửi đến ${email}.` };
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handlePasswordChange = async (newPass: string) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, password: newPass, mustChangePassword: false };
      setCurrentUser(updatedUser);
      const newUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
      setUsers(newUsers);
      await Promise.all([
        apiService.saveUsers(newUsers),
        driveService.syncUsersToDrive(newUsers)
      ]);
    }
  };

  const handleUpdateProfile = async (updatedData: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updatedData };
      setCurrentUser(updatedUser);
      const newUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
      setUsers(newUsers);
      await Promise.all([
        apiService.saveUsers(newUsers),
        driveService.syncUsersToDrive(newUsers)
      ]);
      return true;
    }
    return false;
  };

  const handleRoleChange = (role: Role) => {
    if (currentUser) {
      const updated = { ...currentUser, role };
      setCurrentUser(updated);
      const newUsers = users.map(u => u.id === currentUser.id ? updated : u);
      setUsers(newUsers);
      if (role === Role.GUEST) setActiveTab('dashboard');
    }
  };

  const handleRegisterUser = async (newUser: User) => {
    const newUsers = [...users, newUser];
    setUsers(newUsers);
    await Promise.all([
      apiService.saveUsers(newUsers),
      driveService.syncUsersToDrive(newUsers)
    ]);
  };

  const handleUpdateRequests = async (updatedRequests: ProcurementRequest[]) => {
    setRequests(updatedRequests);
    await Promise.all([
      apiService.saveRequests(updatedRequests),
      driveService.syncRequestsToDrive(updatedRequests)
    ]);
  };

  const handleUpdateLogo = (logoBase64: string | null) => {
    setAppLogo(logoBase64);
    if (logoBase64) {
      localStorage.setItem('custom_app_logo', logoBase64);
    } else {
      localStorage.removeItem('custom_app_logo');
    }
  };

  if (!isLoggedIn) {
    return (
      <Login 
        onLogin={handleLogin} 
        onResetPassword={handleResetPassword} 
        error={loginError} 
        customLogo={appLogo} 
      />
    );
  }

  if (currentUser?.mustChangePassword) {
    return <PasswordChange onPasswordChange={handlePasswordChange} />;
  }

  const renderContent = () => {
    if (!currentUser || currentUser.role === Role.GUEST) {
      return <GuestView />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={currentUser} requests={requests} transactions={transactions} />;
      case 'users':
        return currentUser.role === Role.ADMIN ? 
          <UserManagement 
            units={procurementUnits} 
            setUnits={setProcurementUnits} 
            procurementMethods={procurementMethods}
            setProcurementMethods={setProcurementMethods}
            users={users}
            setUsers={setUsers}
            onRegisterUser={handleRegisterUser}
            appLogo={appLogo}
            onUpdateLogo={handleUpdateLogo}
          /> : 
          <div className="p-10 text-center glass rounded-[3rem]">Bạn không có quyền truy cập.</div>;
      case 'requests':
        return (
          <RequestList 
            user={currentUser} 
            units={procurementUnits} 
            procurementMethods={procurementMethods}
            requests={requests}
            onUpdateRequests={handleUpdateRequests}
            customLogo={appLogo} 
          />
        );
      case 'procurement-dossiers':
        return (
          <RequestList 
            user={currentUser} 
            units={procurementUnits} 
            procurementMethods={procurementMethods}
            requests={requests}
            onUpdateRequests={handleUpdateRequests}
            customLogo={appLogo} 
            initialStatusTab="accepted" 
          />
        );
      case 'goods-management':
        return <GoodsManagement user={currentUser} requests={requests} />;
      case 'reports':
        return <Reports user={currentUser} requests={requests} transactions={transactions} goods={goods} units={procurementUnits} dossiers={dossiers} procurementMethods={procurementMethods} />;
      case 'profile':
        return <Profile user={currentUser} onUpdateProfile={handleUpdateProfile} />;
      default:
        return <Dashboard user={currentUser} requests={requests} transactions={transactions} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-pink-50 overflow-hidden font-['Plus_Jakarta_Sans'] text-slate-700">
      {currentUser?.role !== Role.GUEST && (
        <>
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            userRole={currentUser?.role || Role.GUEST} 
            onLogout={handleLogout}
            customLogo={appLogo}
          />
          <MobileNav 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            userRole={currentUser?.role || Role.GUEST}
          />
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          user={currentUser!} 
          onRoleChange={handleRoleChange}
          onDriveConnected={syncAllData}
          serverOnline={serverOnline}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto pb-24 md:pb-12">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
