<template>
  <div class="users">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="昵称">
            <el-input v-model="searchForm.nickname" placeholder="请输入用户昵称" />
          </el-form-item>
          <el-form-item label="等级">
            <el-select v-model="searchForm.level" placeholder="请选择等级">
              <el-option label="全部等级" value="" />
              <el-option label="LV1" :value="1" />
              <el-option label="LV2" :value="2" />
              <el-option label="LV3" :value="3" />
              <el-option label="LV4" :value="4" />
              <el-option label="LV5" :value="5" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadUsers">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 用户列表 -->
      <el-table :data="users" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="nickname" label="昵称" width="120">
          <template #default="scope">
            <div style="display: flex; align-items: center;">
              <el-avatar :size="30" :src="scope.row.avatar" style="margin-right: 10px;">
                <el-icon><User /></el-icon>
              </el-avatar>
              {{ scope.row.nickname }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="level" label="等级" width="100">
          <template #default="scope">
            <el-tag type="success">LV{{ scope.row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="积分" width="100">
          <template #default="scope">
            <el-tag type="warning">{{ scope.row.points }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="order_count" label="订单数" width="100" />
        <el-table-column prop="total_amount" label="消费金额" width="120">
          <template #default="scope">
            ¥{{ scope.row.total_amount }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewUser(scope.row)">
              查看
            </el-button>
            <el-dropdown @command="(command) => handleCommand(command, scope.row)">
              <el-button type="primary" size="small">
                操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="points">调整积分</el-dropdown-item>
                  <el-dropdown-item command="level">调整等级</el-dropdown-item>
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
          @size-change="loadUsers"
          @current-change="loadUsers"
        />
      </div>
    </el-card>

    <!-- 用户详情对话框 -->
    <el-dialog title="用户详情" v-model="detailVisible" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户ID">
          {{ currentUser.id }}
        </el-descriptions-item>
        <el-descriptions-item label="昵称">
          <div style="display: flex; align-items: center;">
            <el-avatar :size="30" :src="currentUser.avatar" style="margin-right: 10px;">
              <el-icon><User /></el-icon>
            </el-avatar>
            {{ currentUser.nickname }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
          {{ currentUser.phone || '未绑定' }}
        </el-descriptions-item>
        <el-descriptions-item label="等级">
          <el-tag type="success">LV{{ currentUser.level }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="积分">
          <el-tag type="warning">{{ currentUser.points }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="订单数">
          {{ currentUser.order_count }}
        </el-descriptions-item>
        <el-descriptions-item label="消费金额">
          ¥{{ currentUser.total_amount }}
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">
          {{ formatDateTime(currentUser.created_at) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 调整积分对话框 -->
    <el-dialog title="调整积分" v-model="pointsVisible" width="400px">
      <el-form :model="pointsForm" label-width="100px">
        <el-form-item label="当前积分">
          <el-tag type="warning">{{ currentUser.points }}</el-tag>
        </el-form-item>
        <el-form-item label="调整类型">
          <el-radio-group v-model="pointsForm.type">
            <el-radio label="add">增加</el-radio>
            <el-radio label="subtract">减少</el-radio>
            <el-radio label="set">设置</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="积分数值">
          <el-input-number 
            v-model="pointsForm.value" 
            :min="0" 
            placeholder="请输入积分数值"
          />
        </el-form-item>
        <el-form-item label="调整原因">
          <el-input 
            v-model="pointsForm.reason" 
            type="textarea" 
            :rows="3"
            placeholder="请输入调整原因"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="pointsVisible = false">取消</el-button>
        <el-button type="primary" @click="savePoints" :loading="saving">确定</el-button>
      </template>
    </el-dialog>

    <!-- 调整等级对话框 -->
    <el-dialog title="调整等级" v-model="levelVisible" width="400px">
      <el-form :model="levelForm" label-width="100px">
        <el-form-item label="当前等级">
          <el-tag type="success">LV{{ currentUser.level }}</el-tag>
        </el-form-item>
        <el-form-item label="新等级">
          <el-select v-model="levelForm.level" placeholder="请选择等级">
            <el-option label="LV1" :value="1" />
            <el-option label="LV2" :value="2" />
            <el-option label="LV3" :value="3" />
            <el-option label="LV4" :value="4" />
            <el-option label="LV5" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="调整原因">
          <el-input 
            v-model="levelForm.reason" 
            type="textarea" 
            :rows="3"
            placeholder="请输入调整原因"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="levelVisible = false">取消</el-button>
        <el-button type="primary" @click="saveLevel" :loading="saving">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const saving = ref(false)
const detailVisible = ref(false)
const pointsVisible = ref(false)
const levelVisible = ref(false)
const currentUser = ref({})

const users = ref([])
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

const searchForm = reactive({
  nickname: '',
  level: ''
})

const pointsForm = reactive({
  type: 'add',
  value: 0,
  reason: ''
})

const levelForm = reactive({
  level: 1,
  reason: ''
})

const formatDateTime = (date) => {
  return new Date(date).toLocaleString()
}

const loadUsers = async () => {
  loading.value = true
  try {
    // TODO: 调用API获取用户列表
    // 这里使用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    users.value = [
      {
        id: 1,
        nickname: '玩家一号',
        avatar: 'https://example.com/avatar1.jpg',
        phone: '13800138000',
        level: 3,
        points: 1500,
        order_count: 25,
        total_amount: 750.00,
        created_at: '2023-01-01T10:00:00Z'
      },
      {
        id: 2,
        nickname: '游戏达人',
        avatar: 'https://example.com/avatar2.jpg',
        phone: '13900139000',
        level: 5,
        points: 3000,
        order_count: 50,
        total_amount: 1500.00,
        created_at: '2023-01-02T10:00:00Z'
      }
    ]
    
    pagination.total = 1234
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  Object.assign(searchForm, {
    nickname: '',
    level: ''
  })
  loadUsers()
}

const viewUser = (user) => {
  currentUser.value = user
  detailVisible.value = true
}

const handleCommand = async (command, user) => {
  currentUser.value = user
  
  switch (command) {
    case 'points':
      pointsForm.type = 'add'
      pointsForm.value = 0
      pointsForm.reason = ''
      pointsVisible.value = true
      break
    case 'level':
      levelForm.level = user.level
      levelForm.reason = ''
      levelVisible.value = true
      break
  }
}

const savePoints = async () => {
  if (!pointsForm.value) {
    ElMessage.warning('请输入积分数值')
    return
  }

  saving.value = true
  try {
    // TODO: 调用API调整用户积分
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('积分调整成功')
    pointsVisible.value = false
    loadUsers()
  } catch (error) {
    ElMessage.error('积分调整失败')
  } finally {
    saving.value = false
  }
}

const saveLevel = async () => {
  if (!levelForm.level) {
    ElMessage.warning('请选择等级')
    return
  }

  saving.value = true
  try {
    // TODO: 调用API调整用户等级
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('等级调整成功')
    levelVisible.value = false
    loadUsers()
  } catch (error) {
    ElMessage.error('等级调整失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadUsers()
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