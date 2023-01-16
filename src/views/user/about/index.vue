<script lang="ts" setup>
import { useUserStore } from "@/store/modules/user"
import { storeToRefs } from "pinia"

const userStore = useUserStore()
const { currentUser } = storeToRefs(userStore)
</script>
<template>
  <div class="app-container">
    <el-form label-width="auto" label-position="top">
      <el-form-item prop="avatar" label="头像" label-width="auto">
        <el-avatar :src="currentUser.avatar" />
      </el-form-item>
      <el-form-item prop="email" label="邮箱" label-width="50%">
        <el-input v-model="currentUser.email" disabled />
      </el-form-item>
      <el-form-item prop="phone" label="手机号" label-width="50%">
        <el-input v-model="currentUser.phone" disabled />
      </el-form-item>
      <el-form-item prop="nickName" label="昵称" label-width="50%">
        <el-input v-model="currentUser.nickName" disabled />
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.table-wrapper {
  margin-bottom: 20px;
  :deep(.table-header) {
    background-color: var(--el-fill-color-light) !important;
  }
}
</style>
