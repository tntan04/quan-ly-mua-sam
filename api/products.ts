import { ObjectId } from "mongodb"
import clientPromise from "./mongo"

export default async function handler(req: any, res: any) {
  try {
    const client = await clientPromise
    const db = client.db() // dùng database trong URI
    const collection = db.collection("products")

    // GET
    if (req.method === "GET") {
      const products = await collection.find().toArray()
      return res.status(200).json(products)
    }

    // POST
    if (req.method === "POST") {
      const { name, price, stock } = req.body

      const result = await collection.insertOne({
        name,
        price: Number(price),
        stock: Number(stock),
        createdAt: new Date(),
      })

      return res.status(200).json({
        success: true,
        insertedId: result.insertedId,
      })
    }

    // PUT
    if (req.method === "PUT") {
      const { id, name, price, stock } = req.body

      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { name, price: Number(price), stock: Number(stock) } }
      )

      return res.status(200).json({ success: true })
    }

    // DELETE
    if (req.method === "DELETE") {
      const { id } = req.body

      await collection.deleteOne({
        _id: new ObjectId(id),
      })

      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ message: "Method not allowed" })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}
