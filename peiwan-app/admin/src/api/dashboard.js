import request from '@/utils/request'

// 获取仪表盘数据
export function getDashboardData() {
  return request({
    url: '/api/dashboard',
    method: 'get'
  })
}