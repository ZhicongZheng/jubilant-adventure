<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { CirclePlus, RefreshRight } from "@element-plus/icons-vue"
import { PermissionDto, RoleDto, UpdateRoleCommand } from "@/request/generator"
import { api } from "@/utils/service"
import { usePagination } from "@/hooks/usePagination"
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus"

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const permissions = ref<Array<PermissionDto>>()

const fetchPermissions = () => {
  api.RoleApi.listPermission()
    .then((res) => (permissions.value = res.data))
    .catch(() => (permissions.value = new Array<PermissionDto>()))
}

const tableData = ref<Array<RoleDto>>()

const fetchTableData = () => {
  loading.value = true
  api.RoleApi.listRoleByPage(paginationData.page, paginationData.size)
    .then((res) => {
      tableData.value = res.data.data
      paginationData.totalCount = res.data.totalCount
    })
    .catch(() => (tableData.value = new Array<RoleDto>()))
    .finally(() => (loading.value = false))
}

const handleRefresh = () => {
  fetchTableData()
}

// create
const createDialog = ref<boolean>(false)
const createFormRef = ref<FormInstance | null>(null)
const createForm = reactive({
  name: "",
  code: ""
})
const createFormRules: FormRules = reactive({
  name: [{ required: true, trigger: "blur", message: "请输入角色名称" }],
  code: [{ required: true, trigger: "blur", message: "请输入角色码" }]
})
const resetCreateForm = () => {
  createForm.code = ""
  createForm.name = ""
  selectedPermissions.value = new Array<number>()
  fetchTableData()
}
const handleCreate = () => {
  createFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      api.RoleApi.createRole({
        name: createForm.name,
        code: createForm.code,
        permission: selectedPermissions.value
      }).then(() => {
        ElMessage.success("新增成功")
        createDialog.value = false
        fetchTableData()
      })
    } else {
      return false
    }
  })
}

//delete
const handleDelete = (role: RoleDto) => {
  ElMessageBox.confirm(`确定删除角色：${role.name}? `, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    api.RoleApi.deleteRole(role.id).then(() => {
      ElMessage.success("删除成功")
      fetchTableData()
    })
  })
}

//update
const updateDialog = ref(false)
const updateRoleCommandRef = ref<UpdateRoleCommand>()
const selectedPermissions = ref<Array<number>>()

const openUpdateDialog = (role: RoleDto) => {
  updateRoleCommandRef.value = {
    id: role.id,
    name: role.name,
    permissions: role.permissions?.map((p) => p.id)
  }
  selectedPermissions.value = role.permissions?.map((p) => p.id)
  updateDialog.value = true
}

const closeUpdateDialog = () => {
  updateRoleCommandRef.value = undefined
  selectedPermissions.value = new Array<number>()
  updateDialog.value = false
  fetchTableData()
}
const handleUpdate = () => {
  api.RoleApi.updateRole({
    id: updateRoleCommandRef.value!.id,
    name: updateRoleCommandRef.value!.name,
    permissions: selectedPermissions.value
  }).then(() => {
    ElMessage.success("修改成功")
    closeUpdateDialog()
  })
}

/** 监听分页参数变化*/
watch([() => paginationData.page, () => paginationData.size], fetchTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="createDialog = true">新增角色</el-button>
        </div>
        <div>
          <el-tooltip content="刷新表格">
            <el-button type="primary" :icon="RefreshRight" circle @click="handleRefresh" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData" header-cell-class-name="table-header">
          <el-table-column type="selection" width="30" align="center" />
          <el-table-column prop="id" label="id" align="center" />
          <el-table-column prop="name" label="角色名" align="center" />
          <el-table-column prop="code" label="角色码" align="center" />
          <el-table-column prop="createAt" label="创建时间" align="center" />
          <el-table-column label="操作" width="250" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="openUpdateDialog(scope.row)">分配权限</el-button>
              <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.totalCount"
          :page-size="paginationData.size"
          :currentPage="paginationData.page"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!--新增角色-->
    <el-dialog v-model="createDialog" :title="'新增角色'" @open="fetchPermissions" @close="resetCreateForm" width="30%">
      <el-form ref="createFormRef" :model="createForm" :rules="createFormRules" label-width="auto">
        <el-form-item prop="name" label="角色名">
          <el-input v-model="createForm.name" />
        </el-form-item>
        <el-form-item prop="code" label="角色码">
          <el-input v-model="createForm.code" />
        </el-form-item>
        <el-form-item prop="permissions" label="权限">
          <el-checkbox-group v-model="selectedPermissions">
            <el-checkbox v-for="p in permissions" :key="p.id" :label="p.id">{{ p.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确认</el-button>
      </template>
    </el-dialog>
    <!--分配权限-->
    <el-dialog
      v-model="updateDialog"
      :title="'分配权限'"
      @open="fetchPermissions"
      @close="closeUpdateDialog"
      width="30%"
    >
      <el-checkbox-group v-model="selectedPermissions">
        <el-checkbox v-for="p in permissions" :key="p.id" :label="p.id">{{ p.name }}</el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="updateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdate">确认</el-button>
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
.el-select {
  width: 100%;
}
.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
