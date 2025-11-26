const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { verifyToken } = require('./auth');

// 获取分类列表（管理员接口）
router.get('/admin/list', verifyToken, async (req, res) => {
  try {
    // 检查用户是否为管理员
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可查看分类列表'
      });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const categories = await Category.findAll(page, limit);
    const total = await Category.count();

    res.json({
      success: true,
      data: {
        categories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取分类列表失败',
      error: error.message
    });
  }
});

// 获取所有有效分类（公开接口）
router.get('/list', async (req, res) => {
  try {
    const categories = await Category.getAllActive();
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取分类列表失败',
      error: error.message
    });
  }
});

// 创建分类（管理员接口）
router.post('/', verifyToken, async (req, res) => {
  try {
    // 检查用户是否为管理员
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可创建分类'
      });
    }
    
    const categoryData = req.body;
    const categoryId = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      message: '分类创建成功',
      data: { id: categoryId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建分类失败',
      error: error.message
    });
  }
});

// 更新分类（管理员接口）
router.put('/:id', verifyToken, async (req, res) => {
  try {
    // 检查用户是否为管理员
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可更新分类'
      });
    }
    
    const categoryId = req.params.id;
    const categoryData = req.body;

    const updated = await Category.update(categoryId, categoryData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    res.json({
      success: true,
      message: '分类更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新分类失败',
      error: error.message
    });
  }
});

// 删除分类（管理员接口）
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // 检查用户是否为管理员
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可删除分类'
      });
    }
    
    const categoryId = req.params.id;

    const deleted = await Category.delete(categoryId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    res.json({
      success: true,
      message: '分类删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除分类失败',
      error: error.message
    });
  }
});

// 获取分类详情（公开接口）
router.get('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取分类详情失败',
      error: error.message
    });
  }
});

module.exports = router;