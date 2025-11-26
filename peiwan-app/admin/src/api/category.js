import request from '@/utils/request'

// 获取分类列表
export function getCategoryList(params) {
  return request({
    url: '/api/category/admin/list',
    method: 'get',
    params
  })
}

// 获取所有有效分类（供前端展示）
export function getAllCategories() {
  return request({
    url: '/api/category/list',
    method: 'get'
  })
}

// 创建分类
export function createCategory(data) {
  return request({
    url: '/api/category',
    method: 'post',
    data
  })
}

// 更新分类
export function updateCategory(id, data) {
  return request({
    url: `/api/category/${id}`,
    method: 'put',
    data
  })
}

// 删除分类
export function deleteCategoryById(id) {
  return request({
    url: `/api/category/${id}`,
    method: 'delete'
  })
}

// 获取分类详情
export function getCategoryDetail(id) {
  return request({
    url: `/api/category/${id}`,
    method: 'get'
  })
}

// 更新分类状态（实际使用updateCategory函数）