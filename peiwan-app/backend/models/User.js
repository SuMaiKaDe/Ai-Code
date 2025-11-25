const { pool } = require('../config/database');

class User {
  // 创建用户
  static async create(userData) {
    const { openid, nickname, avatar, phone = null } = userData;
    const sql = `
      INSERT INTO users (openid, nickname, avatar, phone, level, points, created_at)
      VALUES (?, ?, ?, ?, 1, 0, NOW())
    `;
    try {
      const [result] = await pool.execute(sql, [openid, nickname, avatar, phone]);
      return result.insertId;
    } catch (error) {
      throw new Error('创建用户失败: ' + error.message);
    }
  }

  // 根据openid查找用户
  static async findByOpenid(openid) {
    const sql = 'SELECT * FROM users WHERE openid = ?';
    try {
      const [rows] = await pool.execute(sql, [openid]);
      return rows[0] || null;
    } catch (error) {
      throw new Error('查找用户失败: ' + error.message);
    }
  }

  // 根据ID查找用户
  static async findById(userId) {
    const sql = 'SELECT id, openid, nickname, avatar, phone, level, points, created_at FROM users WHERE id = ?';
    try {
      const [rows] = await pool.execute(sql, [userId]);
      return rows[0] || null;
    } catch (error) {
      throw new Error('查找用户失败: ' + error.message);
    }
  }

  // 更新用户信息
  static async update(userId, userData) {
    const { nickname, avatar, phone } = userData;
    const sql = `
      UPDATE users 
      SET nickname = ?, avatar = ?, phone = ?
      WHERE id = ?
    `;
    try {
      const [result] = await pool.execute(sql, [nickname, avatar, phone, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('更新用户失败: ' + error.message);
    }
  }

  // 更新用户积分
  static async updatePoints(userId, points) {
    const sql = 'UPDATE users SET points = ? WHERE id = ?';
    try {
      const [result] = await pool.execute(sql, [points, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('更新积分失败: ' + error.message);
    }
  }

  // 升级用户等级
  static async upgradeLevel(userId, newLevel) {
    const sql = 'UPDATE users SET level = ? WHERE id = ?';
    try {
      const [result] = await pool.execute(sql, [newLevel, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('升级等级失败: ' + error.message);
    }
  }
}

module.exports = User;