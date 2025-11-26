const { pool } = require('../config/database');

class Category {
  // 创建分类
  static async create(categoryData) {
    const { name, description, icon, sort_order = 0 } = categoryData;
    const sql = `
      INSERT INTO categories (name, description, icon, sort_order, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    try {
      const [result] = await pool.execute(sql, [name, description, icon, sort_order]);
      return result.insertId;
    } catch (error) {
      throw new Error('创建分类失败: ' + error.message);
    }
  }

  // 获取分类列表
  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const sql = 'SELECT * FROM categories ORDER BY sort_order ASC, created_at DESC LIMIT ? OFFSET ?';
    try {
      const [rows] = await pool.execute(sql, [limit, offset]);
      return rows;
    } catch (error) {
      throw new Error('获取分类列表失败: ' + error.message);
    }
  }

  // 获取分类总数
  static async count() {
    const sql = 'SELECT COUNT(*) as total FROM categories';
    try {
      const [rows] = await pool.execute(sql);
      return rows[0].total;
    } catch (error) {
      throw new Error('获取分类总数失败: ' + error.message);
    }
  }

  // 根据ID查找分类
  static async findById(categoryId) {
    const sql = 'SELECT * FROM categories WHERE id = ?';
    try {
      const [rows] = await pool.execute(sql, [categoryId]);
      return rows[0] || null;
    } catch (error) {
      throw new Error('查找分类失败: ' + error.message);
    }
  }

  // 更新分类
  static async update(categoryId, categoryData) {
    const { name, description, icon, sort_order, status } = categoryData;
    const sql = `
      UPDATE categories 
      SET name = ?, description = ?, icon = ?, sort_order = ?, status = ?
      WHERE id = ?
    `;
    try {
      const [result] = await pool.execute(sql, [name, description, icon, sort_order, status, categoryId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('更新分类失败: ' + error.message);
    }
  }

  // 删除分类
  static async delete(categoryId) {
    const sql = 'DELETE FROM categories WHERE id = ?';
    try {
      const [result] = await pool.execute(sql, [categoryId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('删除分类失败: ' + error.message);
    }
  }

  // 获取所有有效分类（用于前端显示）
  static async getAllActive() {
    const sql = 'SELECT id, name, description, icon FROM categories WHERE status = 1 ORDER BY sort_order ASC';
    try {
      const [rows] = await pool.execute(sql);
      return rows;
    } catch (error) {
      throw new Error('获取分类列表失败: ' + error.message);
    }
  }
}

module.exports = Category;