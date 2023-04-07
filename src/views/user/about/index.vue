<script lang="ts" setup>
import { useUserStore } from "@/store/modules/user"
import { storeToRefs } from "pinia"
import { reactive, ref } from "vue"
import { ElInput, ElMessage, FormInstance, FormRules } from "element-plus"
import { api } from "@/utils/service"

const showDiaLog = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = reactive({
  oldPwd: "",
  newPwd: "",
  newPwdRepeat: ""
})

const closeDialog = () => {
  ;(formData.oldPwd = ""), (formData.newPwd = ""), (formData.newPwdRepeat = "")
}

const createFormRules: FormRules = reactive({
  oldPwd: [{ required: true, trigger: "blur", message: "旧密码不可为空" }],
  // 新密码最短8位
  newPwd: [
    { required: true, trigger: "blur", message: "新密码不可为空" },
    { min: 8, message: "密码长度不能小于8位", trigger: "blur" }
  ],
  // 重复密码应该和新密码相同
  newPwdRepeat: [
    {
      validator: (rule, value, callback) => {
        if (value !== formData.newPwd) {
          callback(new Error("两次输入密码不一致!"))
        } else {
          callback()
        }
      },
      trigger: "blur"
    }
  ]
})

const handle = () => {
  api.UserAPi.changeUserPwd({
    oldPassword: formData.oldPwd,
    newPassword: formData.newPwd
  }).then(() => {
    ElMessage.success("操作成功, 请重新登录")
    showDiaLog.value = false
    api.UserAPi.logout()
  })
}
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
    <el-button type="primary" @click="showDiaLog = true">修改密码</el-button>
    <el-dialog v-model="showDiaLog" :title="'修改密码'" @close="closeDialog" width="30%">
      <el-form ref="formRef" :model="formData" :rules="createFormRules" label-width="auto">
        <el-form-item prop="oldPwd" label="旧密码">
          <el-input type="password" v-model="formData.oldPwd" />
        </el-form-item>
        <el-form-item prop="newPwd" label="新密码">
          <el-input type="password" v-model="formData.newPwd" />
        </el-form-item>
        <el-form-item prop="newPwd" label="重复新密码">
          <el-input type="password" v-model="formData.newPwdRepeat" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDiaLog = false">取消</el-button>
        <el-button type="primary" @click="handle">确认</el-button>
      </template>
    </el-dialog>
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
