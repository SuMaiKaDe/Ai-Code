<template>
  <div class="categories">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <el-button type="primary" @click="showAddDialog">添加分类</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="分类名称">
            <el-input v-model="searchForm.name" placeholder="请输入分类名称" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态">
              <el-option label="全部状态" value="" />
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadCategories">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 分类列表 -->
      <el-table :data="categories" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="icon" label="图标" width="100">
          <template #default="scope">
            <el-icon v-if="scope.row.icon" :size="24">
              <component :is="scope.row.icon" />
            </el-icon>
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status ? 'success' : 'danger'">
              {{ scope.row.status ? '启用' : '禁用' }}
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
            <el-button type="primary" size="small" @click="editCategory(scope.row)">
              编辑
            </el-button>
            <el-button 
              :type="scope.row.status ? 'warning' : 'success'" 
              size="small" 
              @click="toggleStatus(scope.row)"
            >
              {{ scope.row.status ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" size="small" @click="deleteCategory(scope.row)">
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
          @size-change="loadCategories"
          @current-change="loadCategories"
        />
      </div>
    </el-card>

    <!-- 添加/编辑分类对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      v-model="dialogVisible" 
      width="600px"
    >
      <el-form :model="categoryForm" :rules="rules" ref="categoryFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input 
            v-model="categoryForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="categoryForm.icon" placeholder="请输入图标名称（如：User, Goods等）" />
        </el-form-item>
        <el-form-item label="排序" prop="sort_order">
          <el-input-number 
            v-model="categoryForm.sort_order" 
            :min="0" 
            :max="999"
            placeholder="排序值，越小越靠前"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="categoryForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory" :loading="saving">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategoryList, createCategory, updateCategory, deleteCategoryById } from '@/api/category'
import { User, Goods, Document, Money } from '@element-plus/icons-vue'

const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加分类')
const categoryFormRef = ref()

const categories = ref([])
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

const searchForm = reactive({
  name: '',
  status: ''
})

const categoryForm = reactive({
  id: null,
  name: '',
  description: '',
  icon: '',
  sort_order: 0,
  status: 1
})

const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' }
  ],
  sort_order: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ]
}

const loadCategories = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      name: searchForm.name,
      status: searchForm.status
    }
    const response = await getCategoryList(params)
    categories.value = response.categories
    pagination.total = response.pagination.total
  } catch (error) {
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  Object.assign(searchForm, {
    name: '',
    status: ''
  })
  loadCategories()
}

const showAddDialog = () => {
  dialogTitle.value = '添加分类'
  resetForm()
  dialogVisible.value = true
}

const editCategory = (category) => {
  dialogTitle.value = '编辑分类'
  Object.assign(categoryForm, category)
  dialogVisible.value = true
}

const resetForm = () => {
  Object.assign(categoryForm, {
    id: null,
    name: '',
    description: '',
    icon: '',
    sort_order: 0,
    status: 1
  })
}

const saveCategory = async () => {
  const valid = await categoryFormRef.value.validate()
  if (!valid) return

  saving.value = true
  try {
    if (categoryForm.id) {
      await updateCategory(categoryForm.id, categoryForm)
      ElMessage.success('分类更新成功')
    } else {
      await createCategory(categoryForm)
      ElMessage.success('分类添加成功')
    }
    dialogVisible.value = false
    loadCategories()
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (category) => {
  try {
    const newStatus = category.status ? 0 : 1;
    const data = { ...category, status: newStatus };
    await updateCategory(category.id, data);
    ElMessage.success(`分类已${category.status ? '禁用' : '启用'}`);
    loadCategories();
  } catch (error) {
    ElMessage.error('操作失败');
  }
}

const deleteCategory = async (category) => {
  try {
    await ElMessageBox.confirm('确定要删除这个分类吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteCategoryById(category.id)
    ElMessage.success('分类删除成功')
    loadCategories()
  } catch {
    // 用户取消
  }
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString()
}

onMounted(() => {
  loadCategories()
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