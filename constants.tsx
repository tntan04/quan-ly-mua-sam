
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  FileText, 
  Settings,
  LogOut,
  PlusCircle,
  TrendingUp,
  Package,
  ShieldCheck,
  Library,
  Briefcase,
  Boxes,
  UserCircle,
  ShieldAlert
} from 'lucide-react';
import { Role } from './types';

export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'requests', label: 'Yêu cầu mua sắm', icon: <ShoppingCart size={20} /> },
  { id: 'procurement-dossiers', label: 'Hồ sơ mua sắm', icon: <Briefcase size={20} /> },
  { id: 'goods-management', label: 'Quản lý hàng hóa', icon: <Boxes size={20} /> },
  { id: 'users', label: 'Quản trị hệ thống', icon: <ShieldAlert size={20} />, roles: [Role.ADMIN] },
  { id: 'reports', label: 'Báo cáo', icon: <FileText size={20} /> },
  { id: 'profile', label: 'Cá nhân', icon: <UserCircle size={20} /> },
];

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Quản trị viên',
  PROCUREMENT: 'Bộ phận Mua sắm',
  USAGE: 'Bộ phận Sử dụng',
  ACCOUNTING: 'Kế toán',
  COUNCIL: 'Hội đồng KHCN',
  GUEST: 'Khách lạ'
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  RECEIVED: 'bg-blue-100 text-blue-700',
  APPROVED_COUNCIL: 'bg-indigo-100 text-indigo-700',
  APPROVED_FINANCE: 'bg-purple-100 text-purple-700',
  PURCHASED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export const HOSPITAL_DEPARTMENTS = [
  'Ban Giám đốc',
  'Phòng Công nghệ Thông tin',
  'Phòng kế hoạch tổng hợp',
  'Phòng hành chánh quản trị',
  'Phòng chi đạo tuyến',
  'Phòng điều dưỡng',
  'Phòng kế toán',
  'Phòng Vật tư - Thiết bị Y tế',
  'Khoa Dược',
  'Khoa Nội tim mạch',
  'Khoa Hồi sức tích cực',
  'Khoa hồi sức cấp cứu',
  'Khoa Nội tiết lão học',
  'Khoa Chẩn đoán hình ảnh',
  'Khoa xét nghiệm',
  'Khoa thăm dò chức năng',
  'Khoa khám',
  'Khoa kiểm soát nhiễm khuẩn'
];
