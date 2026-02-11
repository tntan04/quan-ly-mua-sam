import { ObjectId } from "mongodb";
import { getDB } from "../mongo";

export default async function handler(req: any, res: any) {
  try {
    const db = await getDB();
    const collection = db.collection("products");

    // GET - Lấy danh sách
    if (req.method === "GET") {
      const products = await collection.find().toArray();
      return res.status(200).json(products);
    }

    // POST - Thêm sản phẩm
    if (req.method === "POST") {
      const { name, price, stock } = req.body;

      const result = await collection.insertOne({
        name,
        price: Number(price),
        stock: Number(stock),
        createdAt: new Date(),
      });

      return res.status(200).json({
        success: true,
        insertedId: result.insertedId,
      });
    }

    // PUT - Cập nhật
    if (req.method === "PUT") {
      const { id, name, price, stock } = req.body;

      await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            name,
            price: Number(price),
            stock: Number(stock),
          },
        }
      );

      return res.status(200).json({ success: true });
    }

    // DELETE - Xoá
    if (req.method === "DELETE") {
      const { id } = req.body;

      await collection.deleteOne({
        _id: new ObjectId(id),
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error: any) {
    console.error("API ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
