const { pool } = require('../config/database');

class Announcement {
  // 创建公告
  static async create(announcementData) {
    const { title, content, type = 'normal', status = 1 } = announcementData;
    const sql = `
      INSERT INTO announcements (title, content, type, status, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    try {
      const [result] = await pool.execute(sql, [title, content, type, status]);
      return result.insertId;
    } catch (error) {
      throw new Error('创建公告失败: ' + error.message);
    }
  }

  // 获取公告列表
  static async findAll(page = 1, limit = 10, status = null) {
    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM announcements WHERE 1=1';
    let params = [];

    if (status !== null) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      throw new Error('获取公告列表失败: ' + error.message);
    }
  }

  // 获取公告总数
  static async count(status = null) {
    let sql = 'SELECT COUNT(*) as total FROM announcements WHERE 1=1';
    let params = [];

    if (status !== null) {
      sql += ' AND status = ?';
      params.push(status);
    }

    try {
      const [rows] = await pool.execute(sql, params);
      return rows[0].total;
    } catch (error) {
      throw new Error('获取公告总数失败: ' + error.message);
    }
  }

  // 根据ID查找公告
  static async findById(announcementId) {
    const sql = 'SELECT * FROM announcements WHERE id = ?';
    try {
      const [rows] = await pool.execute(sql, [announcementId]);
      return rows[0] || null;
    } catch (error) {
      throw new Error('查找公告失败: ' + error.message);
    }
  }

  // 更新公告
  static async update(announcementId, announcementData) {
    const { title, content, type, status } = announcementData;
    const sql = `
      UPDATE announcements 
      SET title = ?, content = ?, type = ?, status = ?
      WHERE id = ?
    `;
    try {
      const [result] = await pool.execute(sql, [title, content, type, status, announcementId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('更新公告失败: ' + error.message);
    }
  }

  // 删除公告
  static async delete(announcementId) {
    const sql = 'DELETE FROM announcements WHERE id = ?';
    try {
      const [result] = await pool.execute(sql, [announcementId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('删除公告失败: ' + error.message);
    }
  }

  // 获取最新公告（小程序端使用）
  static async getLatest(limit = 5) {
    const sql = `
      SELECT id, title, content, created_at
      FROM announcements 
      WHERE status = 1 
      ORDER BY created_at DESC 
      LIMIT ?
    `;
    try {
      const [rows] = await pool.execute(sql, [limit]);
      return rows;
    } catch (error) {
      throw new Error('获取最新公告失败: ' + error.message);
    }
  }
}

module.exports = Announcement;