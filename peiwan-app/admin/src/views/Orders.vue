<template>
  <div class="orders">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="订单号">
            <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" />
          </el-form-item>
          <el-form-item label="用户">
            <el-input v-model="searchForm.user" placeholder="请输入用户昵称" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态">
              <el-option label="全部状态" value="" />
              <el-option label="待支付" value="pending" />
              <el-option label="已支付" value="paid" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
              <el-option label="已退款" value="refunded" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadOrders">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 订单列表 -->
      <el-table :data="orders" v-loading="loading" style="width: 100%">
        <el-table-column prop="order_no" label="订单号" width="150" />
        <el-table-column prop="user_nickname" label="用户" width="120" />
        <el-table-column prop="product_name" label="商品" />
        <el-table-column prop="total_amount" label="金额" width="100">
          <template #default="scope">
            ¥{{ scope.row.total_amount }}
          </template>
        </el-table-column>
        <el-table-column prop="contact_info" label="联系方式" width="120" />
        <el-table-column prop="game_account" label="游戏账号" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewOrder(scope.row)">
              查看
            </el-button>
            <el-dropdown @command="(command) => handleCommand(command, scope.row)">
              <el-button type="primary" size="small">
                操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item 
                    command="confirm" 
                    v-if="scope.row.status === 'paid'"
                  >
                    确认完成
                  </el-dropdown-item>
                  <el-dropdown-item 
                    command="cancel" 
                    v-if="scope.row.status === 'pending'"
                  >
                    取消订单
                  </el-dropdown-item>
                  <el-dropdown-item 
                    command="refund" 
                    v-if="scope.row.status === 'paid'"
                  >
                    退款
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadOrders"
          @current-change="loadOrders"
        />
      </div>
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog title="订单详情" v-model="detailVisible" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">
          {{ currentOrder.order_no }}
        </el-descriptions-item>
        <el-descriptions-item label="用户">
          {{ currentOrder.user_nickname }}
        </el-descriptions-item>
        <el-descriptions-item label="商品">
          {{ currentOrder.product_name }}
        </el-descriptions-item>
        <el-descriptions-item label="金额">
          ¥{{ currentOrder.total_amount }}
        </el-descriptions-item>
        <el-descriptions-item label="联系方式">
          {{ currentOrder.contact_info }}
        </el-descriptions-item>
        <el-descriptions-item label="游戏账号">
          {{ currentOrder.game_account }}
        </el-descriptions-item>
        <el-descriptions-item label="支付方式">
          {{ currentOrder.payment_method || '未支付' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentOrder.status)">
            {{ getStatusText(currentOrder.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDateTime(currentOrder.created_at) }}
        </el-descriptions-item>
        <el-descriptions-item label="支付时间">
          {{ currentOrder.paid_at ? formatDateTime(currentOrder.paid_at) : '未支付' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const detailVisible = ref(false)
const currentOrder = ref({})

const orders = ref([])
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

const searchForm = reactive({
  orderNo: '',
  user: '',
  status: ''
})

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

const formatDateTime = (date) => {
  return new Date(date).toLocaleString()
}

const loadOrders = async () => {
  loading.value = true
  try {
    // TODO: 调用API获取订单列表
    // 这里使用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    orders.value = [
      {
        id: 1,
        order_no: 'PW1234567890',
        user_nickname: '用户A',
        product_name: '王者荣耀陪玩',
        total_amount: 30.00,
        contact_info: '13800138000',
        game_account: '玩家123',
        payment_method: 'wxpay',
        transaction_id: 'wx1234567890',
        status: 'paid',
        paid_at: '2023-01-01T10:30:00Z',
        created_at: '2023-01-01T10:00:00Z'
      },
      {
        id: 2,
        order_no: 'PW1234567891',
        user_nickname: '用户B',
        product_name: '英雄联盟陪玩',
        total_amount: 25.00,
        contact_info: '13900139000',
        game_account: '玩家456',
        payment_method: null,
        transaction_id: null,
        status: 'pending',
        paid_at: null,
        created_at: '2023-01-02T10:00:00Z'
      }
    ]
    
    pagination.total = 678
  } catch (error) {
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  Object.assign(searchForm, {
    orderNo: '',
    user: '',
    status: ''
  })
  loadOrders()
}

const viewOrder = (order) => {
  currentOrder.value = order
  detailVisible.value = true
}

const handleCommand = async (command, order) => {
  switch (command) {
    case 'confirm':
      await confirmOrder(order)
      break
    case 'cancel':
      await cancelOrder(order)
      break
    case 'refund':
      await refundOrder(order)
      break
  }
}

const confirmOrder = async (order) => {
  try {
    await ElMessageBox.confirm('确定要确认完成这个订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // TODO: 调用API确认订单完成
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('订单已完成')
    loadOrders()
  } catch {
    // 用户取消
  }
}

const cancelOrder = async (order) => {
  try {
    await ElMessageBox.confirm('确定要取消这个订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // TODO: 调用API取消订单
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('订单已取消')
    loadOrders()
  } catch {
    // 用户取消
  }
}

const refundOrder = async (order) => {
  try {
    await ElMessageBox.confirm('确定要退款这个订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // TODO: 调用API退款订单
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('退款已处理')
    loadOrders()
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>