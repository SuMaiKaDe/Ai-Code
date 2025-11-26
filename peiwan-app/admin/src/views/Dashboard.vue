<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon users">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalUsers }}</div>
              <div class="stat-label">总用户数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon products">
              <el-icon><Goods /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalProducts }}</div>
              <div class="stat-label">商品数量</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon orders">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalOrders }}</div>
              <div class="stat-label">订单总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon revenue">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">¥{{ stats.totalRevenue }}</div>
              <div class="stat-label">总收入</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近订单</span>
            </div>
          </template>
          <el-table :data="recentOrders" style="width: 100%">
            <el-table-column prop="order_no" label="订单号" width="120" />
            <el-table-column prop="user_nickname" label="用户" />
            <el-table-column prop="product_name" label="商品" />
            <el-table-column prop="total_amount" label="金额">
              <template #default="scope">
                ¥{{ scope.row.total_amount }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最新公告</span>
            </div>
          </template>
          <el-table :data="recentAnnouncements" style="width: 100%">
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="type" label="类型" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.type === 'important' ? 'danger' : 'info'">
                  {{ scope.row.type === 'important' ? '重要' : '普通' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.status ? 'success' : 'danger'">
                  {{ scope.row.status ? '显示' : '隐藏' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" width="120">
              <template #default="scope">
                {{ formatDate(scope.row.created_at) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDashboardData } from '@/api/dashboard'
import { User, Goods, Document, Money } from '@element-plus/icons-vue'

const stats = ref({
  totalUsers: 0,
  totalProducts: 0,
  totalOrders: 0,
  totalRevenue: 0
})

const recentOrders = ref([])
const recentAnnouncements = ref([])

const getStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    paid: 'success',
    completed: 'info',
    cancelled: 'danger',
    refunded: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待支付',
    paid: '已支付',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款'
  }
  return statusMap[status] || status
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const loadDashboardData = async () => {
  try {
    const data = await getDashboardData()
    stats.value = data.stats
    recentOrders.value = data.recentOrders
    recentAnnouncements.value = data.recentAnnouncements
  } catch (error) {
    // 如果API接口不存在，使用模拟数据
    stats.value = {
      totalUsers: 1234,
      totalProducts: 45,
      totalOrders: 678,
      totalRevenue: '12,345.67'
    }

    recentOrders.value = [
      {
        order_no: 'PW1234567890',
        user_nickname: '用户A',
        product_name: '王者荣耀陪玩',
        total_amount: 30.00,
        status: 'paid'
      },
      {
        order_no: 'PW1234567891',
        user_nickname: '用户B',
        product_name: '英雄联盟陪玩',
        total_amount: 25.00,
        status: 'completed'
      }
    ]

    recentAnnouncements.value = [
      {
        title: '欢迎使用陪玩小程序',
        type: 'normal',
        status: 1,
        created_at: '2023-01-01'
      },
      {
        title: '价格调整通知',
        type: 'important',
        status: 1,
        created_at: '2023-01-02'
      }
    ]
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.stat-card {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
  font-size: 24px;
}

.stat-icon.users {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.products {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.orders {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>