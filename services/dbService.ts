
/**
 * LƯU Ý KỸ THUẬT:
 * Mongoose là thư viện ODM dành cho Node.js (Server-side). 
 * Trong môi trường trình duyệt (Browser), chúng ta không kết nối trực tiếp đến MongoDB qua Mongoose 
 * vì lý do bảo mật (lộ chuỗi kết nối) và giới hạn kỹ thuật của trình duyệt.
 * 
 * Tệp này đóng vai trò là "Blueprint" (Bản thiết kế) để bạn triển khai trên Backend (Node.js API).
 * Hiện tại, Frontend sẽ tiếp tục giao tiếp qua apiService.ts để gửi dữ liệu tới Server.
 */

export const dbConfig = {
  // Chuỗi kết nối mẫu (Chỉ dùng trên Server)
  uri: "mongodb://192.168.1.99:27017/smartprocure_db",
  
  options: {
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4 // Use IPv4, skip trying IPv6
  }
};

// Định nghĩa cấu trúc Schema để đồng bộ giữa Frontend và Backend
export const MongooseSchemas = {
  User: {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'PROCUREMENT', 'USAGE', 'ACCOUNTING', 'COUNCIL', 'GUEST'] },
    department: String,
    unitId: String
  },
  
  Request: {
    id: { type: String, required: true, unique: true },
    type: { type: String, enum: ['PURCHASE', 'REPAIR'] },
    title: { type: String, required: true },
    status: { type: String, default: 'PENDING' },
    date: { type: Date, default: Date.now },
    items: [{
      name: String,
      quantityUnit: String,
      purposeOrDamage: String,
      note: String
    }]
  }
};

export const initializeDB = async () => {
  console.log("DB Service: Cấu trúc Mongoose đã sẵn sàng để tích hợp với API Server tại 192.168.1.99.");
  // Khi bạn triển khai Backend, đoạn code này sẽ được thay thế bằng mongoose.connect()
};
