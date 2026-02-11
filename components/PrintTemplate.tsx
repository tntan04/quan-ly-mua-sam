
import React from 'react';
import { ProcurementRequest, RequestItem } from '../types';
import { X, Printer } from 'lucide-react';

interface PrintTemplateProps {
  request: ProcurementRequest;
  onClose: () => void;
}

const PrintTemplate: React.FC<PrintTemplateProps> = ({ request, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const isPurchase = request.type === 'PURCHASE';
  const today = new Date(request.date);

  const RequestContent = ({ lien, label }: { lien: number, label: string }) => (
    <div className="relative flex-1 p-[10mm] print:p-0 flex flex-col border-r border-dashed border-slate-300 last:border-r-0 print:border-slate-400">
      {/* Label indicator for the copy */}
      <div className="absolute top-2 right-6 text-[9px] font-bold text-slate-400 print:text-black uppercase">
        Liên {lien}: {label}
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="text-center w-5/12">
          <p className="font-bold text-[10px] uppercase leading-tight">BV TIM MẠCH TP. CẦN THƠ</p>
          <p className="text-[9px] italic underline mt-1">Khoa/Phòng: {request.department}</p>
        </div>
        <div className="text-center w-7/12">
          <p className="font-bold text-[10px] uppercase leading-tight">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
          <p className="font-bold text-[9px]">Độc lập - Tự do - Hạnh phúc</p>
          <div className="h-[0.5px] w-20 bg-black mx-auto mt-1"></div>
        </div>
      </div>

      <div className="text-right mb-2">
         <p className="text-[9px] italic">Cần Thơ, ngày {today.getDate()} tháng {today.getMonth() + 1} năm {today.getFullYear()}</p>
         <p className="text-[9px] font-bold">Số: {request.id.split('-')[1] || '.......'}</p>
      </div>

      <div className="text-center mb-5">
        <h1 className="text-[13px] font-bold uppercase leading-tight">
          {isPurchase ? 'GIẤY ĐỀ NGHỊ CẤP ĐỒ DÙNG, DỤNG CỤ,' : 'GIẤY BÁO HƯ HỎNG (MẤT) CÔNG CỤ'}
        </h1>
        <h1 className="text-[13px] font-bold uppercase leading-tight">
          {isPurchase ? 'THIẾT BỊ, VẬT TƯ' : '- DỤNG CỤ - THIẾT BỊ & ĐỀ NGHỊ SỬA CHỮA'}
        </h1>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-black text-[9px] mb-4">
        <thead>
          <tr className="bg-slate-50 print:bg-transparent">
            <th className="border border-black p-1.5 w-6">TT</th>
            <th className="border border-black p-1.5">Tên loại, quy cách</th>
            <th className="border border-black p-1.5 w-16">SL/ĐVT</th>
            <th className="border border-black p-1.5">
              {isPurchase ? 'Lý do/Mục đích' : 'Tình trạng hư hỏng'}
            </th>
            <th className="border border-black p-1.5 w-16">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {request.items.map((item, idx) => (
            <tr key={item.id}>
              <td className="border border-black p-1.5 text-center">{idx + 1}</td>
              <td className="border border-black p-1.5">{item.name}</td>
              <td className="border border-black p-1.5 text-center">{item.quantityUnit}</td>
              <td className="border border-black p-1.5">{item.purposeOrDamage}</td>
              <td className="border border-black p-1.5 text-center">{item.note}</td>
            </tr>
          ))}
          {[...Array(Math.max(0, 5 - request.items.length))].map((_, i) => (
            <tr key={`empty-${i}`} className="h-7">
              <td className="border border-black p-1.5"></td>
              <td className="border border-black p-1.5"></td>
              <td className="border border-black p-1.5"></td>
              <td className="border border-black p-1.5"></td>
              <td className="border border-black p-1.5"></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Feedback from Procurement */}
      <div className="mb-6 p-2.5 border border-dashed border-black rounded bg-slate-50 print:bg-transparent">
         <p className="text-[9px] font-bold underline italic mb-1">Ý kiến/Ghi chú của Bộ phận mua sắm tiếp nhận:</p>
         <p className="text-[9px] leading-relaxed min-h-[30px]">
            {request.procurementNote ? request.procurementNote : '................................................................................................................................................................................................................'}
         </p>
      </div>

      {/* Signature Block */}
      <div className="grid grid-cols-4 gap-2 text-center text-[8px] font-bold uppercase">
        <div className="flex flex-col">
          <p>Lãnh đạo</p>
          <div className="h-14"></div>
        </div>
        <div className="flex flex-col">
          <p>BP. Mua sắm</p>
          <div className="h-14"></div>
        </div>
        <div className="flex flex-col">
          <p>Trưởng khoa/phòng</p>
          <div className="h-14"></div>
        </div>
        <div className="flex flex-col">
          <p>Người đề nghị</p>
          <div className="h-14"></div>
          <p className="capitalize font-normal italic mt-auto">{request.requesterName}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-[7px] text-slate-400 print:text-black flex justify-between pt-1 border-t border-slate-100 print:border-black">
        <p>Phần mềm quản lý mua sắm - Mã tra cứu: {request.id}</p>
        <p>In lúc: {new Date().toLocaleString('vi-VN')}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm overflow-y-auto p-4">
      <div className="relative w-full max-w-[297mm] bg-white shadow-2xl my-8 print:my-0 print:shadow-none animate-in zoom-in-95 overflow-hidden rounded-xl print:rounded-none">
        
        {/* Toolbar */}
        <div className="sticky top-0 z-10 p-4 bg-slate-100 border-b flex justify-between items-center print:hidden">
          <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
            <Printer size={18} /> Xem trước bản in 2 liên (A4 Ngang)
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-white text-slate-600 border rounded-xl font-bold hover:bg-slate-50 transition-all">Đóng</button>
            <button onClick={handlePrint} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 active:scale-95 transition-all">In Phiếu</button>
          </div>
        </div>

        <div className="flex w-full min-h-[210mm] print:h-screen font-serif text-black overflow-hidden bg-white">
          <RequestContent lien={1} label="Bộ phận mua sắm lưu" />
          <RequestContent lien={2} label="Bộ phận sử dụng lưu" />
        </div>

        <style>{`
          @page { size: landscape; margin: 0; }
          @media print {
            body * { visibility: hidden; }
            .fixed.inset-0, .fixed.inset-0 * { visibility: visible; }
            .fixed.inset-0 { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: white !important; padding: 0 !important; margin: 0 !important; }
            .print\\:hidden { display: none !important; }
            .print\\:shadow-none { box-shadow: none !important; }
            .print\\:p-0 { padding: 0 !important; }
            .flex.w-full { height: 210mm; width: 297mm; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PrintTemplate;
