<script lang="ts" setup>
import { useUserStore } from "@/store/modules/user"
import { storeToRefs } from "pinia"
import { ref } from "vue"

const userStore = useUserStore()
const { currentUser } = storeToRefs(userStore)
const emailRef = ref(currentUser.value?.email)
const phoneRef = ref(currentUser.value?.phone)
const nickNameRef = ref(currentUser.value?.nickName)
</script>
<template>
  <div class="app-container">
    <el-form label-width="auto" label-position="top">
      <el-form-item prop="avatar" label="头像" label-width="auto">
        <el-avatar :src="currentUser?.avatar" />
      </el-form-item>
      <el-form-item prop="email" label="邮箱" label-width="50%">
        <el-input v-model="emailRef" disabled />
      </el-form-item>
      <el-form-item prop="phone" label="手机号" label-width="50%">
        <el-input v-model="phoneRef" disabled />
      </el-form-item>
      <el-form-item prop="nickName" label="昵称" label-width="50%">
        <el-input v-model="nickNameRef" disabled />
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
