import { useEffect, useState } from "react";

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: ""
  });

  const [editingId, setEditingId] = useState(null);

  // Load danh sách
  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Thêm hoặc cập nhật
  const handleSubmit = async () => {
    if (editingId) {
      await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...form }),
      });
    } else {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setForm({ name: "", price: "", stock: "" });
    setEditingId(null);
    fetchProducts();
  };

  // Xoá
  const handleDelete = async (id) => {
    await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    fetchProducts();
  };

  // Sửa
  const handleEdit = (product) => {
    setForm({
      name: product.name,
      price: product.price,
      stock: product.stock
    });
    setEditingId(product._id);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý sản phẩm</h2>

      <input
        placeholder="Tên sản phẩm"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        placeholder="Giá"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
      />
      <input
        placeholder="Tồn kho"
        value={form.stock}
        onChange={(e) => setForm({ ...form, stock: e.target.value })}
      />

      <button onClick={handleSubmit}>
        {editingId ? "Cập nhật" : "Thêm"}
      </button>

      <hr />

      {products.map((p) => (
        <div key={p._id} style={{ marginBottom: 10 }}>
          <b>{p.name}</b> - {p.price} VND - Tồn: {p.stock}
          <button onClick={() => handleEdit(p)}>Sửa</button>
          <button onClick={() => handleDelete(p._id)}>Xoá</button>
        </div>
      ))}
    </div>
  );
}
