import React, { useState } from "react";

const GoodsManagement = () => {
  const [goods, setGoods] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: ""
  });
  const [editingIndex, setEditingIndex] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    if (!form.name || !form.price || !form.stock) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (editingIndex !== null) {
      const updated = [...goods];
      updated[editingIndex] = {
        ...form,
        createdAt: goods[editingIndex].createdAt
      };
      setGoods(updated);
      setEditingIndex(null);
    } else {
      setGoods([
        ...goods,
        {
          ...form,
          createdAt: new Date().toLocaleString()
        }
      ]);
    }

    setForm({ name: "", price: "", stock: "" });
  };

  const handleEdit = (index) => {
    setForm(goods[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      const updated = goods.filter((_, i) => i !== index);
      setGoods(updated);
    }
  };

  const filteredGoods = goods.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Quản lý sản phẩm</h2>

      {/* Form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-4 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Tên sản phẩm"
            className="border p-2 rounded"
            value={form.name}
            onChange={handleChange}
          />
          <input
            type="number"
            name="price"
            placeholder="Giá"
            className="border p-2 rounded"
            value={form.price}
            onChange={handleChange}
          />
          <input
            type="number"
            name="stock"
            placeholder="Tồn kho"
            className="border p-2 rounded"
            value={form.stock}
            onChange={handleChange}
          />
          <button
            onClick={handleSubmit}
            className={`${
              editingIndex !== null ? "bg-yellow-500" : "bg-red-500"
            } text-white rounded p-2`}
          >
            {editingIndex !== null ? "Cập nhật" : "Thêm"}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          className="border p-2 rounded w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Tên</th>
              <th className="p-3 text-left">Giá</th>
              <th className="p-3 text-left">Tồn kho</th>
              <th className="p-3 text-left">Ngày tạo</th>
              <th className="p-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredGoods.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-500">
                  Không có sản phẩm
                </td>
              </tr>
            ) : (
              filteredGoods.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">
                    {Number(item.price).toLocaleString()} đ
                  </td>
                  <td className="p-3">{item.stock}</td>
                  <td className="p-3">{item.createdAt}</td>
                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="bg-gray-700 text-white px-3 py-1 rounded"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GoodsManagement;
