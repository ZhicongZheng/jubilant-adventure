<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue"
import { RefreshRight, CirclePlus } from "@element-plus/icons-vue"
import { api } from "@/utils/service"
import { ElMessage, ElMessageBox, ElInput, FormRules, FormInstance } from "element-plus"
import { ArticleTagDto } from "@/request/generator"

const loading = ref<boolean>(false)

const tableData = ref<Array<ArticleTagDto>>()
const dialogRef = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = reactive({
  name: ""
})

const createFormRules: FormRules = reactive({
  name: [{ required: true, trigger: "blur", message: "请输入标签名称" }]
})

const fetchTableData = () => {
  loading.value = true
  api.ArticleTagApi.listTags()
    .then((res) => (tableData.value = res.data))
    .catch(() => (tableData.value = new Array<ArticleTagDto>()))
    .finally(() => (loading.value = false))
}

const handleDelete = (tag: ArticleTagDto) => {
  ElMessageBox.confirm(`确定删除标签: ${tag.name}?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    api.ArticleTagApi.deleteTags(tag.id).then(() => {
      ElMessage.success("删除成功")
      fetchTableData()
    })
  })
}

const handleCreate = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      api.ArticleTagApi.addTags({
        name: formData.name
      }).then(() => {
        ElMessage.success("新增成功")
        dialogRef.value = false
        fetchTableData()
      })
    } else {
      return false
    }
  })
}

const resetAddForm = () => {
  formData.name = ""
  fetchTableData()
}

onMounted(() => {
  fetchTableData()
})
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="dialogRef = true">新增标签</el-button>
        </div>
        <div>
          <el-tooltip content="刷新表格">
            <el-button type="primary" :icon="RefreshRight" circle @click="fetchTableData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData" header-cell-class-name="table-header">
          <el-table-column type="selection" width="30" align="center" />
          <el-table-column prop="id" label="id" align="center" />
          <el-table-column prop="name" label="标签名" align="center" />
          <el-table-column prop="createAt" label="创建时间" align="center" />
          <el-table-column prop="articleCount" label="文章数量" align="center" />
          <el-table-column label="操作" width="250" align="center">
            <template #default="scope">
              <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    <!--新增标签-->
    <el-dialog v-model="dialogRef" :title="'新增标签'" @close="resetAddForm" width="30%">
      <el-form ref="formRef" :model="formData" :rules="createFormRules" label-width="auto">
        <el-form-item prop="name" label="标签名称">
          <el-input v-model="formData.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogRef = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.table-wrapper {
  margin-bottom: 20px;
  :deep(.table-header) {
    background-color: var(--el-fill-color-light) !important;
  }
}

.el-tag {
  margin-right: 10px;
  margin-bottom: 20px;
}

.el-select {
  width: 100%;
}
.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
