const { pool } = require('../config/database');

class Product {
  // 创建商品
  static async create(productData) {
    const { name, description, price, category, image, status = 1 } = productData;
    const sql = `
      INSERT INTO products (name, description, price, category, image, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    try {
      const [result] = await pool.execute(sql, [name, description, price, category, image, status]);
      return result.insertId;
    } catch (error) {
      throw new Error('创建商品失败: ' + error.message);
    }
  }

  // 获取商品列表
  static async findAll(page = 1, limit = 10, category = null) {
    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM products WHERE 1=1';
    let params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      throw new Error('获取商品列表失败: ' + error.message);
    }
  }

  // 获取商品总数
  static async count(category = null) {
    let sql = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
    let params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    try {
      const [rows] = await pool.execute(sql, params);
      return rows[0].total;
    } catch (error) {
      throw new Error('获取商品总数失败: ' + error.message);
    }
  }

  // 根据ID查找商品
  static async findById(productId) {
    const sql = 'SELECT * FROM products WHERE id = ?';
    try {
      const [rows] = await pool.execute(sql, [productId]);
      return rows[0] || null;
    } catch (error) {
      throw new Error('查找商品失败: ' + error.message);
    }
  }

  // 更新商品
  static async update(productId, productData) {
    const { name, description, price, category, image, status } = productData;
    const sql = `
      UPDATE products 
      SET name = ?, description = ?, price = ?, category = ?, image = ?, status = ?
      WHERE id = ?
    `;
    try {
      const [result] = await pool.execute(sql, [name, description, price, category, image, status, productId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('更新商品失败: ' + error.message);
    }
  }

  // 删除商品
  static async delete(productId) {
    const sql = 'DELETE FROM products WHERE id = ?';
    try {
      const [result] = await pool.execute(sql, [productId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('删除商品失败: ' + error.message);
    }
  }

  // 获取商品分类
  static async getCategories() {
    const sql = 'SELECT id, name as category FROM categories WHERE status = 1 ORDER BY sort_order ASC';
    try {
      const [rows] = await pool.execute(sql);
      return rows.map(row => row.category);
    } catch (error) {
      throw new Error('获取分类失败: ' + error.message);
    }
  }
  
  // 根据分类ID获取分类名称
  static async getCategoryNameById(categoryId) {
    const sql = 'SELECT name FROM categories WHERE id = ? AND status = 1';
    try {
      const [rows] = await pool.execute(sql, [categoryId]);
      return rows.length > 0 ? rows[0].name : null;
    } catch (error) {
      throw new Error('获取分类名称失败: ' + error.message);
    }
  }
}

module.exports = Product;