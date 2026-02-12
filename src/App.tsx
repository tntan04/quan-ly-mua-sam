import React, { useState, useEffect } from 'react';
import {
  Role,
  User,
  ProcurementUnit,
  ProcurementRequest,
  GoodsItem,
  InventoryTransaction,
  ProcurementDossier
} from './types';

import Sidebar from './components/Sidebar';
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

/* ====================== DATA MẪU ====================== */

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
  "Mua sắm dưới 10 triệu",
  "Mua sắm 10 - 50 triệu",
  "Mua sắm trên 50 triệu"
];

/* ====================== APP ====================== */

const App: React.FC = () => {

  /* ====== STATE ====== */

  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [dossiers, setDossiers] = useState<ProcurementDossier[]>([]);
  const [procurementUnits, setProcurementUnits] = useState(DEFAULT_UNITS);
  const [procurementMethods, setProcurementMethods] = useState(DEFAULT_METHODS);

  const [goods] = useState<GoodsItem[]>([]);
  const [transactions] = useState<InventoryTransaction[]>([]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [serverOnline, setServerOnline] = useState(false);
  const [appLogo, setAppLogo] = useState<string | null>(null);

  /* ====== LOGIN ====== */

  const handleLogin = (email: string, pass: string) => {
    setLoginError('');
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass
    );

    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
    } else {
      setLoginError('Email hoặc mật khẩu không chính xác.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  /* ====== RENDER CHƯA LOGIN ====== */

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={handleLogin}
        error={loginError}
        customLogo={appLogo}
      />
    );
  }

  /* ====== RENDER NỘI DUNG ====== */

  const renderContent = () => {
    if (!currentUser || currentUser.role === Role.GUEST) {
      return <GuestView />;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            user={currentUser}
            requests={requests}
            transactions={transactions}
          />
        );

      case 'users':
        return currentUser.role === Role.ADMIN ? (
          <UserManagement
            units={procurementUnits}
            setUnits={setProcurementUnits}
            procurementMethods={procurementMethods}
            setProcurementMethods={setProcurementMethods}
            users={users}
            setUsers={setUsers}
            appLogo={appLogo}
          />
        ) : (
          <div className="p-10 text-center">
            Bạn không có quyền truy cập.
          </div>
        );

      case 'requests':
        return (
          <RequestList
            user={currentUser}
            units={procurementUnits}
            procurementMethods={procurementMethods}
            requests={requests}
            onUpdateRequests={setRequests}
            customLogo={appLogo}
          />
        );

      case 'goods-management':
        return (
          <GoodsManagement
            user={currentUser}
            requests={requests}
          />
        );

      case 'reports':
        return (
          <Reports
            user={currentUser}
            requests={requests}
            transactions={transactions}
            goods={goods}
            units={procurementUnits}
            dossiers={dossiers}
            procurementMethods={procurementMethods}
          />
        );

      case 'profile':
        return <Profile user={currentUser} />;

      default:
        return <Dashboard user={currentUser} requests={requests} transactions={transactions} />;
    }
  };

  /* ====== MAIN LAYOUT ====== */

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-pink-50 overflow-hidden">
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
          serverOnline={serverOnline}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
