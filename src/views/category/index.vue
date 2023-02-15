<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from "vue"
import { api } from "@/utils/service"
import { CirclePlus, Minus, Plus, RefreshRight } from "@element-plus/icons-vue"
import type Node from "element-plus/es/components/tree/src/model/node"
import { ArticleCategoryDto } from "@/request/generator"
import { ElMessage, ElMessageBox, ElTree, FormInstance, FormRules } from "element-plus"

const loading = ref<boolean>(false)
const treeData = ref<Array<ArticleCategoryDto>>()
const dialogRef = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const treeRef = ref<InstanceType<typeof ElTree>>()
const formData = reactive({
  name: "",
  parent: -1
})

const filterText = ref("")

const createFormRules: FormRules = reactive({
  name: [{ required: true, trigger: "blur", message: "请输入分类名称" }]
})

const fetchTreeData = () => {
  loading.value = true
  api.ArticleCategoryApi.listCategories()
    .then((res) => {
      const categoryDtos = res.data
      categoryDtos.map((dto) => {
        dto.children = categoryDtos.filter((c) => c.parent == dto.id)
      })
      treeData.value = categoryDtos.filter((dto) => dto.parent == -1)
    })
    .catch(() => (treeData.value = new Array<ArticleCategoryDto>()))
    .finally(() => (loading.value = false))
}

const filterNode = (value: string, data: ArticleCategoryDto) => {
  if (!value) return true
  return data.name.includes(value)
}

const append = (data: ArticleCategoryDto) => {
  formData.parent = data.id
  dialogRef.value = true
}

const handleCreate = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      api.ArticleCategoryApi.addCategory({
        name: formData.name,
        parent: formData.parent
      }).then(() => {
        ElMessage.success("新增成功")
        dialogRef.value = false
        resetAddForm()
      })
    } else {
      return false
    }
  })
}

const remove = (node: Node, data: ArticleCategoryDto) => {
  ElMessageBox.confirm(`确定删除分类：${data.name}?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    api.ArticleCategoryApi.deleteCategory(data.id)
      .then(() => ElMessage.success("删除成功"))
      .finally(() => fetchTreeData())
  })
}

const resetAddForm = () => {
  formData.name = ""
  formData.parent = -1
  fetchTreeData()
}

watch(filterText, (val) => {
  treeRef.value!.filter(val)
})

onMounted(() => fetchTreeData())
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
            <el-button type="primary" :icon="RefreshRight" circle @click="fetchTreeData" />
          </el-tooltip>
        </div>
      </div>
      <div class="custom-tree-container">
        <el-input style="margin-bottom: 20px" v-model="filterText" placeholder="Filter keyword" />
        <el-tree
          ref="treeRef"
          :data="treeData"
          :props="{ label: 'name' }"
          node-key="id"
          draggable
          accordion
          default-expand-all
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <span style="margin-left: auto">{{ node.label }}</span>
              <span>
                <el-icon style="margin-left: 10px" color="#409EFF" @click="append(data)"><Plus /></el-icon>
                <el-icon style="margin-left: 10px" color="#F56C6C" @click="remove(node, data)"><Minus /></el-icon>
              </span>
            </span>
          </template>
        </el-tree>
      </div>
    </el-card>
    <!--新增分类-->
    <el-dialog v-model="dialogRef" :title="'新增分类'" @close="resetAddForm" width="30%">
      <el-form ref="formRef" :model="formData" :rules="createFormRules" label-width="auto">
        <el-form-item prop="name" label="标签分类">
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
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 10px;
  padding-left: 10px;
}
.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.custom-tree-container {
  margin-top: 20px;
}
</style>
