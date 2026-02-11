
export enum Role {
  ADMIN = 'ADMIN',
  PROCUREMENT = 'PROCUREMENT',
  USAGE = 'USAGE',
  ACCOUNTING = 'ACCOUNTING',
  COUNCIL = 'COUNCIL',
  GUEST = 'GUEST'
}

export type RequestType = 'PURCHASE' | 'REPAIR';

export interface DossierItem {
  id: string;
  content: string;
  fileName: string;
  fileBase64?: string;
}

export interface RequestItem {
  id: string;
  name: string;
  quantityUnit: string;
  purposeOrDamage: string;
  note: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  department: string;
  unitId?: string;
  mustChangePassword?: boolean;
}

export interface ProcurementRequest {
  id: string;
  type: RequestType;
  title: string;
  requesterId: string;
  requesterName: string;
  department: string;
  targetUnitId: string;
  status: 'PENDING' | 'RECEIVED' | 'APPROVED_COUNCIL' | 'APPROVED_FINANCE' | 'PURCHASED' | 'REJECTED' | 'USER_ACCEPTED' | 'USER_REJECTED';
  date: string;
  items: RequestItem[];
  dossiers?: DossierItem[];
  permittedDepartments?: string[];
  amount?: number;
  procurementNote?: string;
  userFeedback?: string;
  dossierId?: string; // Liên kết với ProcurementDossier
}

export interface ProcurementDossier {
  id: string;
  name: string;
  procurementMethod?: string;
  requestIds: string[];
  status: 'PROCESSING' | 'COMPLETED';
  date: string;
  completionDate?: string; // Ngày hoàn tất hồ sơ
  targetUnitId: string;
  files: DossierItem[];
  permittedDepartments: string[];
}

export interface ProcurementUnit {
  id: string;
  name: string;
}

export interface GoodsItem {
  id: string;
  name: string;
  unit: string;
  category: string;
  price: number;
  supplier: string;
  description?: string;
}

export interface InventoryTransaction {
  id: string;
  goodsId: string;
  type: 'IMPORT' | 'EXPORT' | 'TRANSFER';
  status: 'PENDING' | 'COMPLETED';
  quantity: number;
  price?: number;
  supplier?: string;
  dossierId?: string;
  fromDept: string;
  toDept: string;
  date: string;
  note?: string;
}
