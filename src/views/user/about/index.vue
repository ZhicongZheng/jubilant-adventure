<script lang="ts" setup>
import { useUserStore } from "@/store/modules/user"
import { ref } from "vue"
import { storeToRefs } from "pinia"

const userStore = useUserStore()
const { currentUser } = storeToRefs(userStore)
const userModel = ref()
</script>
<template>
  <div class="body--wrapper">
    <div class="user-info-container">
      <el-form :model="userModel">
        <el-form-item prop="email" label="邮箱" label-width="50%">
          <el-input v-model="currentUser.email" />
        </el-form-item>
        <el-form-item prop="phone" label="手机号" label-width="50%">
          <el-input v-model="currentUser.phone" />
        </el-form-item>
        <el-form-item prop="nickName" label="昵称" label-width="50%">
          <el-input v-model="currentUser.nickName" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.table-wrapper {
  margin-bottom: 20px;
  :deep(.table-header) {
    background-color: var(--el-fill-color-light) !important;
  }
}
.user-info-container {
  align-content: center;
  width: 50%;
  margin-top: 20%;
}
</style>
