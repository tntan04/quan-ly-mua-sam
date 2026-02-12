import React, { useState, useEffect, useMemo } from "react";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  createdAt?: string;
}

const GoodsManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // LOAD PRODUCTS
  // =========================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.error("Load products error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================
  // ADD PRODUCT
  // =========================
  const handleAddProduct = async () => {
    if (!name.trim()) {
      alert("Vui lòng nhập tên sản phẩm");
      return;
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          price,
          stock
        })
      });

      const result = await res.json();

      if (result.success) {
        alert("Thêm sản phẩm thành công!");
        setName("");
        setPrice(0);
        setStock(0);
        fetchProducts();
      } else {
        alert("Lỗi thêm sản phẩm!");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối server!");
    }
  };

  // =========================
  // DELETE PRODUCT
  // =========================
  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá?")) return;

    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: "DELETE"
      });

      const result = await res.json();

      if (result.success) {
        fetchProducts();
      } else {
        alert("Xoá thất bại!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // SEARCH FILTER
  // =========================
  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý sản phẩm</h2>

      {/* FORM ADD */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Tên sản phẩm"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Giá"
          value={price}
          onChange={e => setPrice(Number(e.target.value))}
        />
        <input
          type="number"
          placeholder="Số lượng"
          value={stock}
          onChange={e => setStock(Number(e.target.value))}
        />
        <button onClick={handleAddProduct}>Thêm</button>
      </div>

      {/* SEARCH */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Tìm kiếm..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table border={1} cellPadding={8} width="100%">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} align="center">
                  Không có sản phẩm
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.price?.toLocaleString()} đ</td>
                  <td>{product.stock}</td>
                  <td>
                    {product.createdAt
                      ? new Date(product.createdAt).toLocaleString()
                      : "-"}
                  </td>
                  <td>
                    <button
                      style={{ background: "red", color: "white" }}
                      onClick={() => handleDelete(product._id)}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GoodsManagement;
