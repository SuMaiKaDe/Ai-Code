import request from '@/utils/request'

// 获取用户列表
export function getUserList(params) {
  return request({
    url: '/api/users/list',
    method: 'get',
    params
  })
}

// 调整用户积分
export function adjustUserPoints(userId, data) {
  return request({
    url: `/api/users/${userId}/adjust-points`,
    method: 'post',
    data
  })
}

// 调整用户等级
export function updateUserLevel(userId, data) {
  return request({
    url: `/api/users/${userId}/level`,
    method: 'put',
    data
  })
}