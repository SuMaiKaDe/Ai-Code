<template>
  <div class="announcements">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>公告管理</span>
          <el-button type="primary" @click="showAddDialog">添加公告</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="标题">
            <el-input v-model="searchForm.title" placeholder="请输入标题" />
          </el-form-item>
          <el-form-item label="类型">
            <el-select v-model="searchForm.type" placeholder="请选择类型">
              <el-option label="全部类型" value="" />
              <el-option label="普通" value="normal" />
              <el-option label="重要" value="important" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态">
              <el-option label="全部状态" value="" />
              <el-option label="显示" :value="1" />
              <el-option label="隐藏" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadAnnouncements">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 公告列表 -->
      <el-table :data="announcements" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'important' ? 'danger' : 'info'">
              {{ scope.row.type === 'important' ? '重要' : '普通' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status ? 'success' : 'danger'">
              {{ scope.row.status ? '显示' : '隐藏' }}
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
            <el-button type="primary" size="small" @click="editAnnouncement(scope.row)">
              编辑
            </el-button>
            <el-button 
              :type="scope.row.status ? 'warning' : 'success'" 
              size="small" 
              @click="toggleStatus(scope.row)"
            >
              {{ scope.row.status ? '隐藏' : '显示' }}
            </el-button>
            <el-button type="danger" size="small" @click="deleteAnnouncement(scope.row)">
              删除
            </el-button>
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
          @size-change="loadAnnouncements"
          @current-change="loadAnnouncements"
        />
      </div>
    </el-card>

    <!-- 添加/编辑公告对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      v-model="dialogVisible" 
      width="600px"
    >
      <el-form :model="announcementForm" :rules="rules" ref="announcementFormRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="announcementForm.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input 
            v-model="announcementForm.content" 
            type="textarea" 
            :rows="6"
            placeholder="请输入公告内容"
          />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="announcementForm.type">
            <el-radio label="normal">普通</el-radio>
            <el-radio label="important">重要</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="announcementForm.status">
            <el-radio :label="1">显示</el-radio>
            <el-radio :label="0">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAnnouncement" :loading="saving">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加公告')
const announcementFormRef = ref()

const announcements = ref([])
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

const searchForm = reactive({
  title: '',
  type: '',
  status: ''
})

const announcementForm = reactive({
  id: null,
  title: '',
  content: '',
  type: 'normal',
  status: 1
})

const rules = {
  title: [
    { required: true, message: '请输入公告标题', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入公告内容', trigger: 'blur' }
  ]
}

const loadAnnouncements = async () => {
  loading.value = true
  try {
    // TODO: 调用API获取公告列表
    // 这里使用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    announcements.value = [
      {
        id: 1,
        title: '欢迎使用陪玩小程序',
        content: '感谢您使用我们的陪玩服务，如有问题请联系客服',
        type: 'normal',
        status: 1,
        created_at: '2023-01-01T10:00:00Z'
      },
      {
        id: 2,
        title: '价格调整通知',
        content: '由于市场变化，部分陪玩服务价格有所调整',
        type: 'important',
        status: 1,
        created_at: '2023-01-02T10:00:00Z'
      }
    ]
    
    pagination.total = 12
  } catch (error) {
    ElMessage.error('获取公告列表失败')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  Object.assign(searchForm, {
    title: '',
    type: '',
    status: ''
  })
  loadAnnouncements()
}

const showAddDialog = () => {
  dialogTitle.value = '添加公告'
  resetForm()
  dialogVisible.value = true
}

const editAnnouncement = (announcement) => {
  dialogTitle.value = '编辑公告'
  Object.assign(announcementForm, announcement)
  dialogVisible.value = true
}

const resetForm = () => {
  Object.assign(announcementForm, {
    id: null,
    title: '',
    content: '',
    type: 'normal',
    status: 1
  })
}

const saveAnnouncement = async () => {
  const valid = await announcementFormRef.value.validate()
  if (!valid) return

  saving.value = true
  try {
    // TODO: 调用API保存公告
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success(announcementForm.id ? '公告更新成功' : '公告添加成功')
    dialogVisible.value = false
    loadAnnouncements()
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (announcement) => {
  try {
    // TODO: 调用API更新公告状态
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success(`公告已${announcement.status ? '隐藏' : '显示'}`)
    loadAnnouncements()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const deleteAnnouncement = async (announcement) => {
  try {
    await ElMessageBox.confirm('确定要删除这个公告吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // TODO: 调用API删除公告
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('公告删除成功')
    loadAnnouncements()
  } catch {
    // 用户取消
  }
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString()
}

onMounted(() => {
  loadAnnouncements()
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